// Evidence-scored medication matcher. Replaces boolean fuzzy matching from
// lexicon.findMed. Requires phonetic similarity + edit-distance + clinical
// context evidence before flagging low-confidence tokens as medications.

import { MEDS, type MedEntry } from "./lexicon";
import { COMMON_WORDS } from "./commonWords";
import { metaphonePrimary } from "./metaphone";
import {
  CONDITIONS,
  ABBREVIATIONS,
  ROUTES,
  FREQUENCIES,
  UNITS_EXTRA,
} from "./clinical-knowledge";

export type MedMatchType = "exact" | "fuzzy" | "rxterms";

export interface MedMatch {
  med: MedEntry;
  matchType: MedMatchType;
  score: number; // higher is better; Infinity for exact
  contextScore: number;
  editDistance: number; // 0 for exact
}

// ─── Precomputed indexes ────────────────────────────────────────────

interface Candidate {
  token: string; // lowercase surface form (name or alias)
  metaPrimary: string;
  entry: MedEntry;
}

const CANDIDATES: Candidate[] = [];
const EXACT_MAP = new Map<string, MedEntry>();

for (const m of MEDS) {
  const forms = [m.name, ...m.aliases];
  for (const f of forms) {
    const lower = f.toLowerCase();
    EXACT_MAP.set(lower, m);
    CANDIDATES.push({
      token: lower,
      metaPrimary: metaphonePrimary(lower),
      entry: m,
    });
  }
}

// Non-med clinical vocab that must NOT be treated as fuzzy med candidates.
const CLINICAL_VOCAB = new Set<string>();
for (const c of CONDITIONS) {
  CLINICAL_VOCAB.add(c.name.toLowerCase());
  for (const a of c.aliases ?? []) CLINICAL_VOCAB.add(a.toLowerCase());
}
for (const k of Object.keys(ABBREVIATIONS)) CLINICAL_VOCAB.add(k.toLowerCase());
for (const r of ROUTES) CLINICAL_VOCAB.add(r.toLowerCase());
for (const f of FREQUENCIES) CLINICAL_VOCAB.add(f.toLowerCase());
for (const u of UNITS_EXTRA) CLINICAL_VOCAB.add(u.toLowerCase());
// Base units
for (const u of ["mg", "mcg", "g", "ml", "unit", "units"])
  CLINICAL_VOCAB.add(u);

// ─── Levenshtein (capped) ───────────────────────────────────────────

function levenshtein(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const dp: number[] = Array(b.length + 1)
    .fill(0)
    .map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    let minRow = dp[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
      if (dp[j] < minRow) minRow = dp[j];
    }
    if (minRow > cap) return cap + 1;
  }
  return dp[b.length];
}

// ─── Context scoring ────────────────────────────────────────────────

const DOSE_UNIT_RE =
  /\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?|iu|meq|mmol|%)\b/i;

const PRESCRIBING_VERBS = new Set([
  "start", "started", "starting", "initiate", "initiated",
  "increase", "increased", "increasing",
  "decrease", "decreased", "decreasing",
  "continue", "continued", "continuing",
  "hold", "held", "holding",
  "discontinue", "discontinued", "dc",
  "switch", "switched", "switching",
  "titrate", "titrated", "titrating",
  "taper", "tapered", "tapering",
  "resume", "resumed", "resuming",
  "stop", "stopped", "stopping",
  "adjust", "adjusted", "adjusting",
  "prescribe", "prescribed", "prescribing",
  "administer", "administered",
]);

const ROUTE_TOKENS = new Set(ROUTES.map((r) => r.toLowerCase()));
const FREQ_TOKENS = new Set(FREQUENCIES.map((f) => f.toLowerCase()));

/**
 * Compute clinical-context evidence score for a 40-char window.
 * +3 dose+unit, +2 prescribing verb, +1 route, +1 frequency.
 */
export function contextScoreFor(window: string): number {
  const w = window.toLowerCase();
  let score = 0;
  if (DOSE_UNIT_RE.test(w)) score += 3;

  const wordRe = /[a-z]+/gi;
  let hitVerb = false;
  let hitRoute = false;
  let hitFreq = false;
  for (let m: RegExpExecArray | null; (m = wordRe.exec(w)); ) {
    const tok = m[0];
    if (!hitVerb && PRESCRIBING_VERBS.has(tok)) {
      score += 2;
      hitVerb = true;
    }
    if (!hitRoute && ROUTE_TOKENS.has(tok)) {
      score += 1;
      hitRoute = true;
    }
    if (!hitFreq && FREQ_TOKENS.has(tok)) {
      score += 1;
      hitFreq = true;
    }
  }
  return score;
}

// ─── Public matcher ────────────────────────────────────────────────

/**
 * Match a single token against the medication lexicon using layered evidence.
 * Returns null if the token is not a medication.
 */
export function matchMedication(
  token: string,
  contextWindow: string,
  wordConfidence: number,
): MedMatch | null {
  const raw = token.trim();
  if (!raw) return null;
  const tok = raw.toLowerCase();

  // 1. Exact
  const exact = EXACT_MAP.get(tok);
  if (exact) {
    return {
      med: exact,
      matchType: "exact",
      score: Infinity,
      contextScore: contextScoreFor(contextWindow),
      editDistance: 0,
    };
  }

  // 2. Fuzzy gates
  if (wordConfidence >= 0.9) return null;
  if (COMMON_WORDS.has(tok)) return null;
  if (CLINICAL_VOCAB.has(tok)) return null;
  if (tok.length < 5) return null;

  // 3. Candidate filter
  const tokMeta = metaphonePrimary(tok);
  const firstCh = tok[0];
  const maxEdits = tok.length >= 8 ? 2 : 1; // 5..7 → 1, ≥8 → 2

  let best: {
    cand: Candidate;
    edit: number;
  } | null = null;

  for (const cand of CANDIDATES) {
    if (cand.token[0] !== firstCh) continue;
    if (Math.abs(cand.token.length - tok.length) > 2) continue;
    if (cand.metaPrimary !== tokMeta) continue;
    const edit = levenshtein(tok, cand.token, maxEdits);
    if (edit > maxEdits) continue;
    if (!best || edit < best.edit) {
      best = { cand, edit };
    }
  }

  if (!best) return null;

  // 4. Context evidence
  const ctx = contextScoreFor(contextWindow);
  if (ctx < 3) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[medMatcher] rejected fuzzy candidate", {
        token: tok,
        candidate: best.cand.token,
        editDistance: best.edit,
        contextScore: ctx,
        reason: "contextScore<3",
      });
    }
    return null;
  }

  return {
    med: best.cand.entry,
    matchType: "fuzzy",
    score: 10 - best.edit + ctx / 10,
    contextScore: ctx,
    editDistance: best.edit,
  };
}

// ─── Dev-only self-tests ────────────────────────────────────────────

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__medMatcherSelfTestRan) {
    g.__medMatcherSelfTestRan = true;
    const cases: Array<{
      token: string;
      ctx: string;
      conf: number;
      expect: string | null;
      note: string;
    }> = [
      { token: "coring", ctx: "coring the sample", conf: 0.95, expect: null, note: "coring/Coreg" },
      { token: "asa", ctx: "as a precaution", conf: 0.95, expect: null, note: "asa short token" },
      { token: "coreg", ctx: "start coreg 12.5 mg BID", conf: 0.98, expect: "Carvedilol", note: "exact alias" },
      { token: "korvedilol", ctx: "start korvedilol twelve point five milligrams", conf: 0.55, expect: "Carvedilol", note: "fuzzy carvedilol" },
      { token: "cozy", ctx: "the patient is cozy", conf: 0.9, expect: null, note: "cozy/Cozaar" },
      { token: "lisinopril", ctx: "she takes lisinopril daily", conf: 0.99, expect: "Lisinopril", note: "exact name" },
      { token: "metfromin", ctx: "continue metfromin 500 mg BID", conf: 0.6, expect: "Metformin", note: "fuzzy metformin" },
      { token: "start", ctx: "start lisinopril", conf: 0.99, expect: null, note: "common word" },
      { token: "morning", ctx: "in the morning", conf: 0.9, expect: null, note: "common word" },
      { token: "atorvastatin", ctx: "she takes atorvastatin nightly", conf: 0.4, expect: "Atorvastatin", note: "exact ignores conf" },
    ];
    const results = cases.map((c) => {
      const r = matchMedication(c.token, c.ctx, c.conf);
      const got = r?.med.name ?? null;
      const ok = got === c.expect;
      return { ...c, got, ok };
    });
    const failed = results.filter((r) => !r.ok);
    if (failed.length) {
      // eslint-disable-next-line no-console
      console.warn("[medMatcher] self-test failures", failed);
    } else {
      // eslint-disable-next-line no-console
      console.debug("[medMatcher] all 10 self-tests passed");
    }
  }
}
