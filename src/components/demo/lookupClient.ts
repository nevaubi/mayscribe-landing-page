// Shared NLM Clinical Tables client. Used by QuickLookup UI and by
// verify.ts async dose-range checks. Single in-memory + sessionStorage cache
// per session, with in-flight promise dedupe.

const RXTERMS_URL = "https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search";
const CONDITIONS_URL =
  "https://clinicaltables.nlm.nih.gov/api/conditions/v3/search";

export interface RxTermsMed {
  name: string;
  strengths: string[];
}
export interface RxTermsCondition {
  name: string;
}
export interface Strength {
  value: number;
  unit: string;
  raw: string;
}

// ─── caches ──────────────────────────────────────────────────────────
const memMeds = new Map<string, RxTermsMed[]>();
const memConds = new Map<string, RxTermsCondition[]>();
const memStrengths = new Map<string, Strength[]>();

const inflightMeds = new Map<string, Promise<RxTermsMed[]>>();
const inflightConds = new Map<string, Promise<RxTermsCondition[]>>();
const inflightStrengths = new Map<string, Promise<Strength[]>>();

const SS_PREFIX = "mayscribe.lookup.v1.";

function ssGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SS_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function ssSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SS_PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full — ignore, memory cache still works
  }
}

// ─── public helpers ─────────────────────────────────────────────────

export async function searchRxTerms(
  query: string,
  signal?: AbortSignal,
): Promise<RxTermsMed[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const cached = memMeds.get(q) ?? ssGet<RxTermsMed[]>("m:" + q);
  if (cached) {
    memMeds.set(q, cached);
    return cached;
  }
  const existing = inflightMeds.get(q);
  if (existing) return existing;
  const p = (async () => {
    const url = `${RXTERMS_URL}?terms=${encodeURIComponent(q)}&ef=STRENGTHS_AND_FORMS&maxList=5`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as [
      number,
      string[],
      { STRENGTHS_AND_FORMS?: string[] } | null,
      string[][],
    ];
    const display = data[3] ?? [];
    const strengthsArr = data[2]?.STRENGTHS_AND_FORMS ?? [];
    const meds = display.slice(0, 5).map((row, i) => {
      const name = Array.isArray(row) ? row[0] : String(row);
      const raw = strengthsArr[i] ?? "";
      const strengths = raw
        .split(/[|;]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8);
      return { name, strengths };
    });
    memMeds.set(q, meds);
    ssSet("m:" + q, meds);
    return meds;
  })().finally(() => {
    inflightMeds.delete(q);
  });
  inflightMeds.set(q, p);
  return p;
}

export async function searchConditions(
  query: string,
  signal?: AbortSignal,
): Promise<RxTermsCondition[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const cached = memConds.get(q) ?? ssGet<RxTermsCondition[]>("c:" + q);
  if (cached) {
    memConds.set(q, cached);
    return cached;
  }
  const existing = inflightConds.get(q);
  if (existing) return existing;
  const p = (async () => {
    const url = `${CONDITIONS_URL}?terms=${encodeURIComponent(q)}&maxList=5`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as [number, string[], unknown, string[][]];
    const display = data[3] ?? [];
    const conds = display.slice(0, 5).map((row) => ({
      name: Array.isArray(row) ? row[0] : String(row),
    }));
    memConds.set(q, conds);
    ssSet("c:" + q, conds);
    return conds;
  })().finally(() => {
    inflightConds.delete(q);
  });
  inflightConds.set(q, p);
  return p;
}

const STRENGTH_RE = /(\d+(?:\.\d+)?)\s*(mg\/mL|mg\/kg|mcg\/mL|mcg|mg|g|mL|units?|IU|mEq|mmol|%)/i;

function parseStrength(raw: string): Strength | null {
  const m = STRENGTH_RE.exec(raw);
  if (!m) return null;
  const value = parseFloat(m[1]);
  if (!isFinite(value)) return null;
  return { value, unit: m[2].toLowerCase(), raw };
}

/**
 * Fetch available strengths for a medication name via RxTerms. Returns parsed
 * numeric (value, unit) pairs. Uses same cache as searchRxTerms and dedupes
 * concurrent requests. Falls back to empty array on any error.
 */
export async function getStrengthsAndForms(
  medName: string,
  signal?: AbortSignal,
): Promise<Strength[]> {
  const q = medName.trim().toLowerCase();
  if (!q) return [];
  const cached = memStrengths.get(q) ?? ssGet<Strength[]>("s:" + q);
  if (cached) {
    memStrengths.set(q, cached);
    return cached;
  }
  const existing = inflightStrengths.get(q);
  if (existing) return existing;
  const p = (async () => {
    const meds = await searchRxTerms(q, signal);
    // Pick the first result whose name starts with the query (case-insensitive)
    // or the first result overall.
    const pick =
      meds.find((m) => m.name.toLowerCase().startsWith(q)) ?? meds[0];
    const strengths: Strength[] = [];
    if (pick) {
      for (const raw of pick.strengths) {
        const s = parseStrength(raw);
        if (s) strengths.push(s);
      }
    }
    memStrengths.set(q, strengths);
    ssSet("s:" + q, strengths);
    return strengths;
  })().finally(() => {
    inflightStrengths.delete(q);
  });
  inflightStrengths.set(q, p);
  return p;
}

/**
 * Determine whether a dictated dose is compatible with any available strength.
 * Passes if dose == strength or dose == k*strength for integer k in [1..4] on
 * any listed strength with matching unit. Returns { ok, nearest } — nearest is
 * the two closest real strengths (by absolute value distance, same unit) for
 * use as candidates when ok is false.
 */
export function checkDoseAgainstStrengths(
  dose: number,
  unit: string,
  strengths: Strength[],
): { ok: boolean; nearest: Strength[] } {
  const u = unit.toLowerCase();
  const sameUnit = strengths.filter((s) => s.unit === u);
  if (!sameUnit.length) return { ok: true, nearest: [] };
  for (const s of sameUnit) {
    if (Math.abs(dose - s.value) < 1e-3) return { ok: true, nearest: [] };
    for (let k = 2; k <= 4; k++) {
      if (Math.abs(dose - k * s.value) < 1e-3) return { ok: true, nearest: [] };
    }
  }
  const sorted = sameUnit
    .slice()
    .sort((a, b) => Math.abs(a.value - dose) - Math.abs(b.value - dose))
    .slice(0, 2);
  return { ok: false, nearest: sorted };
}
