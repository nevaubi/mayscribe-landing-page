// Protected-token integrity check for LLM formatting output.
// Extracts multisets of: numbers+units, bare numbers, medication names,
// negation terms, and laterality terms. If input/output multisets differ
// in any way, the LLM output is discarded.

import { MEDS } from "./lexicon";

const NEGATIONS = new Set([
  "no", "not", "without", "denies", "denied", "negative", "absent", "none",
  "never", "nor", "cannot", "can't", "won't", "shouldn't", "wouldn't",
]);

const LATERALITY = new Set([
  "left", "right", "bilateral", "bilaterally", "unilateral", "midline",
  "l", "r", "lt", "rt",
]);

const UNIT_RE =
  /\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|kg|ml|l|units?|%|mmhg|bpm|meq|mmol|iu|cm|mm|hours?|hrs?|minutes?|mins?|days?|weeks?|wks?|months?|mos?|years?|yrs?|y\/o|yo)\b/gi;

const BARE_NUM_RE = /\b\d+(?:\.\d+)?\b/g;

// Build a lowercase set of all medication names + aliases for exact lookup.
const MED_NAMES = new Set<string>();
for (const m of MEDS) {
  MED_NAMES.add(m.name.toLowerCase());
  for (const a of m.aliases) MED_NAMES.add(a.toLowerCase());
}

function tokenizeWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z'\-]*/g) ?? []);
}

export interface ProtectedTokens {
  unitPairs: string[];   // "10 mg", "50 mcg"
  numbers: string[];     // all bare numbers as strings
  meds: string[];        // lowercase med names/aliases
  negations: string[];
  laterality: string[];
}

function normalizeUnit(u: string): string {
  const s = u.toLowerCase().replace(/\./g, "");
  // Collapse plural units (units -> unit, hrs -> hr) to base form.
  const map: Record<string, string> = {
    ml: "ml", milliliter: "ml", milliliters: "ml",
    l: "l",
    mg: "mg", milligram: "mg", milligrams: "mg",
    mcg: "mcg", microgram: "mcg", micrograms: "mcg",
    g: "g", gram: "g", grams: "g",
    kg: "kg",
    units: "unit", unit: "unit",
    hours: "hr", hour: "hr", hrs: "hr", hr: "hr",
    minutes: "min", minute: "min", mins: "min", min: "min",
    days: "day", day: "day",
    weeks: "wk", week: "wk", wks: "wk", wk: "wk",
    months: "mo", month: "mo", mos: "mo", mo: "mo",
    years: "yr", year: "yr", yrs: "yr", yr: "yr",
  };
  return map[s] ?? s;
}

export function extractProtectedTokens(text: string): ProtectedTokens {
  const unitPairs: string[] = [];
  const numbers: string[] = [];
  const meds: string[] = [];
  const negations: string[] = [];
  const laterality: string[] = [];

  const seenSpans: [number, number][] = [];
  let m: RegExpExecArray | null;

  UNIT_RE.lastIndex = 0;
  while ((m = UNIT_RE.exec(text)) !== null) {
    // Normalize: collapse whitespace and unify unit form so "5mg" == "5 mg".
    unitPairs.push(`${m[1]} ${normalizeUnit(m[2]!)}`);
    seenSpans.push([m.index, m.index + m[0].length]);
  }

  BARE_NUM_RE.lastIndex = 0;
  while ((m = BARE_NUM_RE.exec(text)) !== null) {
    const s = m.index;
    const e = s + m[0].length;
    const inside = seenSpans.some(([a, b]) => s >= a && e <= b);
    if (!inside) numbers.push(m[0]);
  }

  for (const w of tokenizeWords(text)) {
    if (MED_NAMES.has(w)) meds.push(w);
    if (NEGATIONS.has(w)) negations.push(w);
    if (LATERALITY.has(w)) laterality.push(w);
  }

  return { unitPairs, numbers, meds, negations, laterality };
}

function eqMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = [...a].sort();
  const t = [...b].sort();
  for (let i = 0; i < s.length; i++) if (s[i] !== t[i]) return false;
  return true;
}

export function verifyIntegrity(input: string, output: string): boolean {
  // Strip **bold** markers from output before comparison; they are preview-only.
  const stripped = output.replace(/\*\*(.+?)\*\*/g, "$1");
  const a = extractProtectedTokens(input);
  const b = extractProtectedTokens(stripped);
  return (
    eqMultiset(a.unitPairs, b.unitPairs) &&
    eqMultiset(a.numbers, b.numbers) &&
    eqMultiset(a.meds, b.meds) &&
    eqMultiset(a.negations, b.negations) &&
    eqMultiset(a.laterality, b.laterality)
  );
}
