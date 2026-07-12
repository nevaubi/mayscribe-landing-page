// Reversible display-only formatters for the Review popup.
// These never change words — only whitespace, punctuation, and casing.

export type FormatToggle = "punctuation" | "unitsAndAbbrev" | "sentenceCase";

export const FORMAT_TOGGLES: {
  id: FormatToggle;
  label: string;
  description: string;
}[] = [
  { id: "punctuation", label: "Punctuation", description: "Trim, spacing, terminal period" },
  { id: "unitsAndAbbrev", label: "Units & abbrev.", description: "10mg → 10 mg, bid → BID" },
  { id: "sentenceCase", label: "Sentence case", description: "Capitalize sentence starts" },
];

function applyPunctuation(text: string): string {
  let t = text.replace(/[ \t]+/g, " ");
  t = t.replace(/\s+([.,;:!?])/g, "$1");
  t = t.replace(/([.,;:!?])(?=[A-Za-z0-9])/g, "$1 ");
  t = t.trim();
  if (t && !/[.!?]$/.test(t)) t += ".";
  return t;
}

function applyUnitsAndAbbrev(text: string): string {
  let t = text;
  const rules: [RegExp, string][] = [
    [/\bq\.?h\.?s\.?\b/gi, "QHS"],
    [/\bq\.?a\.?m\.?\b/gi, "QAM"],
    [/\bq\.?p\.?m\.?\b/gi, "QPM"],
    [/\bb\.?i\.?d\.?\b/gi, "BID"],
    [/\bt\.?i\.?d\.?\b/gi, "TID"],
    [/\bq\.?i\.?d\.?\b/gi, "QID"],
    [/\bprn\b/gi, "PRN"],
    [/\bstat\b/gi, "STAT"],
    [/\bpo\b/gi, "PO"],
    [/\biv\b/gi, "IV"],
    [/\bim\b/gi, "IM"],
    [/\bsq\b/gi, "SQ"],
    [/\bsl\b/gi, "SL"],
  ];
  for (const [re, r] of rules) t = t.replace(re, r);
  t = t.replace(
    /(\d+(?:\.\d+)?)\s*(milligrams?|mg|micrograms?|mcg|grams?|g|milliliters?|ml|units?|meq|mmol)\b/gi,
    (_m, n, u) => {
      const map: Record<string, string> = {
        milligram: "mg", milligrams: "mg", mg: "mg",
        microgram: "mcg", micrograms: "mcg", mcg: "mcg",
        gram: "g", grams: "g", g: "g",
        milliliter: "mL", milliliters: "mL", ml: "mL",
        unit: "units", units: "units",
        meq: "mEq", mmol: "mmol",
      };
      return `${n} ${map[u.toLowerCase()] ?? u}`;
    },
  );
  return t;
}

function applySentenceCase(text: string): string {
  return text.replace(
    /(^|[.!?]\s+)([a-z])/g,
    (_m, pre, ch: string) => pre + ch.toUpperCase(),
  );
}

export function applyFormatToggles(
  text: string,
  toggles: Set<FormatToggle>,
): string {
  let t = text;
  if (toggles.has("unitsAndAbbrev")) t = applyUnitsAndAbbrev(t);
  if (toggles.has("punctuation")) t = applyPunctuation(t);
  if (toggles.has("sentenceCase")) t = applySentenceCase(t);
  return t;
}
