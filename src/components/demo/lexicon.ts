// Static clinical lexicon for the demo dictation verifier.
// No network. Everything here is deterministic.

export interface MedEntry {
  name: string;
  aliases: string[];
  typicalDoseRange: { min: number; max: number; unit: string };
  routes: string[];
  freqs: string[];
}

export const MEDS: MedEntry[] = [
  // demo patient's list (must be accurate)
  { name: "Furosemide", aliases: ["lasix"], typicalDoseRange: { min: 20, max: 160, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily", "BID"] },
  { name: "Carvedilol", aliases: ["coreg"], typicalDoseRange: { min: 3.125, max: 50, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Lisinopril", aliases: ["prinivil", "zestril"], typicalDoseRange: { min: 2.5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Spironolactone", aliases: ["aldactone"], typicalDoseRange: { min: 12.5, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Metformin", aliases: ["glucophage"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["PO"], freqs: ["daily", "BID"] },
  { name: "Atorvastatin", aliases: ["lipitor"], typicalDoseRange: { min: 10, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["QHS", "daily"] },
  { name: "Aspirin", aliases: ["asa", "ecotrin"], typicalDoseRange: { min: 81, max: 325, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Insulin glargine", aliases: ["lantus", "basaglar", "toujeo"], typicalDoseRange: { min: 10, max: 100, unit: "units" }, routes: ["SQ"], freqs: ["QHS", "daily"] },

  // common others
  { name: "Metoprolol", aliases: ["lopressor", "toprol"], typicalDoseRange: { min: 12.5, max: 200, unit: "mg" }, routes: ["PO"], freqs: ["BID", "daily"] },
  { name: "Amlodipine", aliases: ["norvasc"], typicalDoseRange: { min: 2.5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Losartan", aliases: ["cozaar"], typicalDoseRange: { min: 25, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Hydrochlorothiazide", aliases: ["hctz"], typicalDoseRange: { min: 12.5, max: 50, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Warfarin", aliases: ["coumadin"], typicalDoseRange: { min: 1, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Clopidogrel", aliases: ["plavix"], typicalDoseRange: { min: 75, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Apixaban", aliases: ["eliquis"], typicalDoseRange: { min: 2.5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Rivaroxaban", aliases: ["xarelto"], typicalDoseRange: { min: 10, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Digoxin", aliases: ["lanoxin"], typicalDoseRange: { min: 0.125, max: 0.25, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily"] },
  { name: "Amiodarone", aliases: ["cordarone"], typicalDoseRange: { min: 100, max: 400, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily"] },
  { name: "Simvastatin", aliases: ["zocor"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Rosuvastatin", aliases: ["crestor"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Pravastatin", aliases: ["pravachol"], typicalDoseRange: { min: 10, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Omeprazole", aliases: ["prilosec"], typicalDoseRange: { min: 10, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Pantoprazole", aliases: ["protonix"], typicalDoseRange: { min: 20, max: 80, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily", "BID"] },
  { name: "Ranitidine", aliases: ["zantac"], typicalDoseRange: { min: 75, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Famotidine", aliases: ["pepcid"], typicalDoseRange: { min: 10, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Levothyroxine", aliases: ["synthroid"], typicalDoseRange: { min: 25, max: 200, unit: "mcg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Prednisone", aliases: [], typicalDoseRange: { min: 5, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Prednisolone", aliases: [], typicalDoseRange: { min: 5, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Methylprednisolone", aliases: ["solu-medrol", "medrol"], typicalDoseRange: { min: 4, max: 500, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily"] },
  { name: "Hydrocortisone", aliases: [], typicalDoseRange: { min: 5, max: 100, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily", "BID"] },
  { name: "Albuterol", aliases: ["proventil", "ventolin"], typicalDoseRange: { min: 90, max: 180, unit: "mcg" }, routes: ["inhalation"], freqs: ["PRN", "QID"] },
  { name: "Ipratropium", aliases: ["atrovent"], typicalDoseRange: { min: 17, max: 34, unit: "mcg" }, routes: ["inhalation"], freqs: ["QID"] },
  { name: "Tiotropium", aliases: ["spiriva"], typicalDoseRange: { min: 18, max: 18, unit: "mcg" }, routes: ["inhalation"], freqs: ["daily"] },
  { name: "Montelukast", aliases: ["singulair"], typicalDoseRange: { min: 4, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Fluticasone", aliases: ["flonase", "flovent"], typicalDoseRange: { min: 50, max: 500, unit: "mcg" }, routes: ["inhalation"], freqs: ["BID"] },
  { name: "Gabapentin", aliases: ["neurontin"], typicalDoseRange: { min: 100, max: 3600, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Pregabalin", aliases: ["lyrica"], typicalDoseRange: { min: 25, max: 600, unit: "mg" }, routes: ["PO"], freqs: ["BID", "TID"] },
  { name: "Sertraline", aliases: ["zoloft"], typicalDoseRange: { min: 25, max: 200, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Escitalopram", aliases: ["lexapro"], typicalDoseRange: { min: 5, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Citalopram", aliases: ["celexa"], typicalDoseRange: { min: 10, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Celecoxib", aliases: ["celebrex"], typicalDoseRange: { min: 100, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["daily", "BID"] },
  { name: "Ibuprofen", aliases: ["motrin", "advil"], typicalDoseRange: { min: 200, max: 800, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Acetaminophen", aliases: ["tylenol", "apap"], typicalDoseRange: { min: 325, max: 1000, unit: "mg" }, routes: ["PO", "IV"], freqs: ["QID"] },
  { name: "Tramadol", aliases: ["ultram"], typicalDoseRange: { min: 25, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["QID", "PRN"] },
  { name: "Trazodone", aliases: [], typicalDoseRange: { min: 25, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Hydrocodone", aliases: [], typicalDoseRange: { min: 2.5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["QID", "PRN"] },
  { name: "Oxycodone", aliases: [], typicalDoseRange: { min: 5, max: 30, unit: "mg" }, routes: ["PO"], freqs: ["QID", "PRN"] },
  { name: "Morphine", aliases: [], typicalDoseRange: { min: 2, max: 30, unit: "mg" }, routes: ["PO", "IV"], freqs: ["PRN"] },
  { name: "Hydroxyzine", aliases: ["vistaril", "atarax"], typicalDoseRange: { min: 10, max: 100, unit: "mg" }, routes: ["PO", "IM"], freqs: ["QID", "PRN"] },
  { name: "Hydralazine", aliases: [], typicalDoseRange: { min: 10, max: 100, unit: "mg" }, routes: ["PO", "IV"], freqs: ["QID"] },
  { name: "Clonidine", aliases: ["catapres"], typicalDoseRange: { min: 0.1, max: 0.6, unit: "mg" }, routes: ["PO"], freqs: ["BID", "TID"] },
  { name: "Klonopin", aliases: ["clonazepam"], typicalDoseRange: { min: 0.25, max: 4, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Misoprostol", aliases: ["cytotec"], typicalDoseRange: { min: 100, max: 800, unit: "mcg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Glipizide", aliases: [], typicalDoseRange: { min: 2.5, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily", "BID"] },
  { name: "Glyburide", aliases: [], typicalDoseRange: { min: 1.25, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Insulin lispro", aliases: ["humalog"], typicalDoseRange: { min: 1, max: 50, unit: "units" }, routes: ["SQ"], freqs: ["TID"] },
  { name: "Insulin aspart", aliases: ["novolog"], typicalDoseRange: { min: 1, max: 50, unit: "units" }, routes: ["SQ"], freqs: ["TID"] },
  { name: "Heparin", aliases: [], typicalDoseRange: { min: 5000, max: 30000, unit: "units" }, routes: ["IV", "SQ"], freqs: ["BID"] },
  { name: "Enoxaparin", aliases: ["lovenox"], typicalDoseRange: { min: 30, max: 100, unit: "mg" }, routes: ["SQ"], freqs: ["daily", "BID"] },
  { name: "Ceftriaxone", aliases: ["rocephin"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV", "IM"], freqs: ["daily"] },
  { name: "Vancomycin", aliases: [], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV", "PO"], freqs: ["BID"] },
  { name: "Levofloxacin", aliases: ["levaquin"], typicalDoseRange: { min: 250, max: 750, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily"] },
  { name: "Azithromycin", aliases: ["zithromax"], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO", "IV"], freqs: ["daily"] },
];

// Look-alike / sound-alike pairs (bidirectional)
export const LASA: [string, string][] = [
  ["hydroxyzine", "hydralazine"],
  ["clonidine", "klonopin"],
  ["metoprolol", "misoprostol"],
  ["celebrex", "celexa"],
  ["tramadol", "trazodone"],
  ["prednisone", "prednisolone"],
  ["zyrtec", "zantac"],
  ["lamictal", "lamisil"],
  ["adderall", "inderal"],
  ["glipizide", "glyburide"],
  ["vinblastine", "vincristine"],
  ["hydrocodone", "oxycodone"],
  ["cycloserine", "cyclosporine"],
  ["chlorpromazine", "chlorpropamide"],
  ["epinephrine", "ephedrine"],
];

// Units — canonical + high-risk confusion set
export const UNITS = {
  canonical: ["mg", "mcg", "g", "mL", "units"],
  confusions: [
    ["mg", "mcg"],
    ["mcg", "g"],
    ["mg", "g"],
    ["units", "mL"],
  ] as [string, string][],
};

// -------------- detectors --------------

export type DetectedType =
  | "med"
  | "dose"
  | "numeric"
  | "laterality"
  | "negation"
  | "frequency"
  | "route";

export interface Detected {
  start: number;
  end: number;
  text: string;
  type: DetectedType;
  meta?: Record<string, unknown>;
}

function levenshtein(a: string, b: string, cap = 3): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const dp: number[] = Array(b.length + 1).fill(0).map((_, i) => i);
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

const MED_TOKENS: { canonical: string; token: string }[] = [];
for (const m of MEDS) {
  MED_TOKENS.push({ canonical: m.name, token: m.name.toLowerCase() });
  for (const a of m.aliases) MED_TOKENS.push({ canonical: m.name, token: a.toLowerCase() });
}

export function findMed(word: string): MedEntry | null {
  const w = word.toLowerCase();
  for (const t of MED_TOKENS) {
    if (t.token === w) return MEDS.find((m) => m.name === t.canonical) ?? null;
  }
  // fuzzy
  for (const t of MED_TOKENS) {
    if (Math.abs(t.token.length - w.length) <= 2 && levenshtein(t.token, w, 2) <= 2) {
      return MEDS.find((m) => m.name === t.canonical) ?? null;
    }
  }
  return null;
}

export function findLASA(word: string): string[] | null {
  const w = word.toLowerCase();
  for (const [a, b] of LASA) {
    if (w === a) return [a, b];
    if (w === b) return [b, a];
  }
  return null;
}

export function detectAll(text: string): Detected[] {
  const out: Detected[] = [];

  // dose+unit
  const doseRe = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|mL|units)\b/gi;
  for (let m: RegExpExecArray | null; (m = doseRe.exec(text)); ) {
    out.push({
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      type: "dose",
      meta: { value: parseFloat(m[1]), unit: m[2] },
    });
  }

  // laterality
  const latRe = /\b(left|right|bilateral|unilateral)\b/gi;
  for (let m: RegExpExecArray | null; (m = latRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "laterality" });
  }

  // negation
  const negRe = /\b(no|denies|without|negative for|absent)\b/gi;
  for (let m: RegExpExecArray | null; (m = negRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "negation" });
  }

  // frequency
  const freqRe = /\b(BID|TID|QID|QHS|PRN|QD|daily|nightly|weekly)\b/gi;
  for (let m: RegExpExecArray | null; (m = freqRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "frequency" });
  }

  // route
  const routeRe = /\b(PO|IV|IM|SC|SQ|SL|PR|topical|inhalation)\b/gi;
  for (let m: RegExpExecArray | null; (m = routeRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "route" });
  }

  // med names (word-boundary token match, case-insensitive, plus fuzzy)
  const wordRe = /\b[A-Za-z][A-Za-z-]{2,}\b/g;
  for (let m: RegExpExecArray | null; (m = wordRe.exec(text)); ) {
    const tok = m[0];
    const med = findMed(tok);
    if (med) {
      out.push({
        start: m.index,
        end: m.index + tok.length,
        text: tok,
        type: "med",
        meta: { med: med.name },
      });
    }
  }

  return out.sort((a, b) => a.start - b.start);
}
