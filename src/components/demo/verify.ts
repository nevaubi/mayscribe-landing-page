import type { DGWord } from "./useDictation";
import { detectAll, findLASA, MEDS, type MedEntry } from "./lexicon";
import { matchMedication, contextScoreFor } from "./medMatcher";
import { COMMON_WORDS } from "./commonWords";

export type SpanStatus = "commit" | "hold";
export type SpanType =
  | "med"
  | "dose"
  | "lasa"
  | "laterality"
  | "negation"
  | "low_confidence"
  | "unit";

export interface Span {
  id: string;
  text: string;
  start: number; // offset into formattedText
  end: number;
  type: SpanType;
  status: SpanStatus;
  candidates: string[];
  reason?: string;
  minConfidence: number;
}

export interface PendingRangeCheck {
  spanId: string;
  medName: string;
  dose: number;
  unit: string;
  doseStart: number;
  doseEnd: number;
  doseText: string;
}

/**
 * Token that had strong prescribing context (score>=5) but did not match the
 * lexicon exactly or fuzzily. Caller resolves via RxTerms; if RxTerms returns
 * a close match, upgrade to a medication with matchType "rxterms" and run the
 * strengths check. If RxTerms returns nothing, this token is NOT a medication
 * and must not hold.
 */
export interface PendingRxTermsMedCheck {
  token: string;
  start: number;
  end: number;
  contextScore: number;
  nearestDose?: { value: number; unit: string; start: number; end: number; text: string };
}

export interface VerifyResult {
  spans: Span[];
  committedText: string; // string with underscore placeholders for holds
  pendingRangeChecks: PendingRangeCheck[];
  pendingRxTermsMedChecks: PendingRxTermsMedCheck[];
}

const HOLD_CONF_THRESHOLD = 0.86;

function minConfidenceIn(words: DGWord[], spanText: string): number {
  if (!words.length) return 1;
  const tokens = spanText.toLowerCase().split(/\s+/).filter(Boolean);
  let min = 1;
  for (const tok of tokens) {
    const stripped = tok.replace(/[^a-z0-9.]/gi, "");
    if (!stripped) continue;
    const w = words.find(
      (x) =>
        (x.punctuated_word || x.word || "")
          .toLowerCase()
          .replace(/[^a-z0-9.]/gi, "") === stripped,
    );
    if (w && typeof w.confidence === "number") {
      if (w.confidence < min) min = w.confidence;
    }
  }
  return min;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `s${Date.now().toString(36)}${idCounter}`;
}

interface MedHit {
  entry: MedEntry;
  matchType: "exact" | "fuzzy";
  start: number;
  end: number;
  text: string;
  contextScore: number;
  editDistance: number;
  minConf: number;
}

const WORD_RE = /[A-Za-z][A-Za-z-]{1,}/g;

function windowAround(text: string, start: number, end: number, radius = 20): string {
  return text.slice(Math.max(0, start - radius), Math.min(text.length, end + radius));
}

export function verify(formattedText: string, words: DGWord[]): VerifyResult {
  const detected = detectAll(formattedText);
  const spans: Span[] = [];
  const pendingRangeChecks: PendingRangeCheck[] = [];
  const pendingRxTermsMedChecks: PendingRxTermsMedCheck[] = [];

  // ─── Med detection via evidence-scored matcher ────────────────────
  const medHits: MedHit[] = [];
  const claimed: Array<[number, number]> = [];
  const overlaps = (s: number, e: number) =>
    claimed.some(([cs, ce]) => s < ce && e > cs);

  for (let m: RegExpExecArray | null; (m = WORD_RE.exec(formattedText)); ) {
    const tok = m[0];
    const start = m.index;
    const end = start + tok.length;
    if (overlaps(start, end)) continue;
    const conf = minConfidenceIn(words, tok);
    const ctx = windowAround(formattedText, start, end);
    const match = matchMedication(tok, ctx, conf);
    if (match) {
      medHits.push({
        entry: match.med,
        matchType: match.matchType === "rxterms" ? "fuzzy" : match.matchType,
        start,
        end,
        text: tok,
        contextScore: match.contextScore,
        editDistance: match.editDistance,
        minConf: conf,
      });
      claimed.push([start, end]);
      continue;
    }
    // No lexicon match — check RxTerms fallback candidacy.
    if (conf >= 0.9) continue; // high-confidence non-med, skip
    if (tok.length < 5) continue;
    const lower = tok.toLowerCase();
    if (COMMON_WORDS.has(lower)) continue;
    const ctxScore = contextScoreFor(ctx);
    if (ctxScore < 5) continue;
    pendingRxTermsMedChecks.push({
      token: tok,
      start,
      end,
      contextScore: ctxScore,
    });
  }

  // ─── Med + dose hold logic ────────────────────────────────────────
  for (const hit of medHits) {
    const medEntry = hit.entry;
    // LASA check (exact + fuzzy only, per hold policy)
    const lasa = findLASA(hit.text);

    // nearest dose within 40 chars after
    let nearestDose: (typeof detected)[number] | undefined;
    for (const d of detected) {
      if (d.type !== "dose") continue;
      if (d.start < hit.end) continue;
      if (d.start - hit.end > 40) break;
      nearestDose = d;
      break;
    }

    let status: SpanStatus = "commit";
    let reason: string | undefined;
    let type: SpanType = "med";
    let candidates: string[] = [];

    if (lasa) {
      status = "hold";
      type = "lasa";
      reason = "Sound-alike pair";
      candidates = lasa.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
    } else if (nearestDose) {
      const val = nearestDose.meta?.value as number;
      const unit = nearestDose.meta?.unit as string;
      const range = medEntry.typicalDoseRange;
      if (range) {
        if (
          unit &&
          unit.toLowerCase() === range.unit.toLowerCase() &&
          (val < range.min || val > range.max)
        ) {
          status = "hold";
          type = "dose";
          const relation = val > range.max ? "above" : "below";
          reason = `Dose ${relation} typical range for ${medEntry.name}`;
          candidates = [
            `${range.min} ${range.unit}`,
            `${Math.round(((range.min + range.max) / 2) * 100) / 100} ${range.unit}`,
            `${range.max} ${range.unit}`,
          ];
        }
      } else if (typeof val === "number" && unit) {
        pendingRangeChecks.push({
          spanId: "",
          medName: medEntry.name,
          dose: val,
          unit,
          doseStart: nearestDose.start,
          doseEnd: nearestDose.end,
          doseText: nearestDose.text,
        });
      }
    }

    if (status === "commit" && hit.minConf < HOLD_CONF_THRESHOLD) {
      status = "hold";
      type = "low_confidence";
      reason = "Low confidence";
      candidates = [hit.text, "(dismiss)"];
    }

    const span: Span = {
      id: nextId(),
      text: hit.text,
      start: hit.start,
      end: hit.end,
      type,
      status,
      candidates,
      reason,
      minConfidence: hit.minConf,
    };
    spans.push(span);
    if (
      pendingRangeChecks.length &&
      pendingRangeChecks[pendingRangeChecks.length - 1].spanId === "" &&
      pendingRangeChecks[pendingRangeChecks.length - 1].medName === medEntry.name
    ) {
      pendingRangeChecks[pendingRangeChecks.length - 1].spanId = span.id;
    }
  }

  // ─── Low-confidence orphan dose spans ─────────────────────────────
  for (const d of detected) {
    if (d.type !== "dose") continue;
    const already = spans.some((s) => s.start <= d.start && s.end >= d.end);
    if (already) continue;
    const conf = minConfidenceIn(words, d.text);
    if (conf < HOLD_CONF_THRESHOLD) {
      spans.push({
        id: nextId(),
        text: d.text,
        start: d.start,
        end: d.end,
        type: "low_confidence",
        status: "hold",
        candidates: [d.text, "(dismiss)"],
        reason: "Low confidence",
        minConfidence: conf,
      });
    }
  }

  spans.sort((a, b) => a.start - b.start);

  // Build committedText with placeholders for holds
  let out = "";
  let cursor = 0;
  for (const s of spans) {
    if (s.status !== "hold") continue;
    out += formattedText.slice(cursor, s.start);
    out += "_".repeat(Math.max(1, s.end - s.start));
    cursor = s.end;
  }
  out += formattedText.slice(cursor);

  return { spans, committedText: out, pendingRangeChecks, pendingRxTermsMedChecks };
}

export const DEMO_ACTIVE_MEDS = MEDS.filter((m) =>
  [
    "Furosemide",
    "Carvedilol",
    "Lisinopril",
    "Spironolactone",
    "Metformin",
    "Atorvastatin",
    "Aspirin",
    "Insulin glargine",
  ].includes(m.name),
).map((m) => m.name);
