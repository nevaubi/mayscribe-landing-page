// Reversible display-only formatters for the Review popup.
// Deterministic layer. Never changes words, only whitespace, punctuation,
// casing, and (for Paragraphs) blank-line breaks at conservative cue words.

export type FormatToggle =
  | "punctuation"
  | "unitsAndAbbrev"
  | "sentenceCase"
  | "abbrevPlus"
  | "paragraphs"
  | "spelling"
  | "structure";

export const FORMAT_TOGGLES: {
  id: FormatToggle;
  label: string;
  description: string;
  ai?: boolean;
}[] = [
  { id: "punctuation", label: "Punctuation", description: "Trim, spacing, terminal period" },
  { id: "unitsAndAbbrev", label: "Units & abbrev.", description: "10mg → 10 mg, bid → BID" },
  { id: "sentenceCase", label: "Sentence case", description: "Capitalize sentence starts" },
  { id: "abbrevPlus", label: "Abbreviations+", description: "Expand ~250 clinical shorthand forms" },
  { id: "paragraphs", label: "Paragraphs", description: "Break at topic-shift cues" },
  { id: "spelling", label: "Spelling", description: "Fix ordinary English spelling", ai: true },
  { id: "structure", label: "Structure", description: "Headers, bullets, paragraphs", ai: true },
];

// ~250 word-boundary rewrites: labs, vitals, routes, frequencies, shorthand.
// Applied case-insensitive with a word boundary check.
// Left side is the recognized dictated form; right side is the canonical form.
export const ABBREVIATIONS: Record<string, string> = {
  // Frequencies
  "qd": "daily", "q.d.": "daily", "qday": "daily", "once daily": "daily",
  "bid": "BID", "b.i.d.": "BID", "twice daily": "BID",
  "tid": "TID", "t.i.d.": "TID", "three times daily": "TID",
  "qid": "QID", "q.i.d.": "QID", "four times daily": "QID",
  "qhs": "QHS", "at bedtime": "QHS",
  "qam": "QAM", "qpm": "QPM",
  "prn": "PRN", "as needed": "PRN",
  "stat": "STAT",
  "q4h": "Q4H", "q6h": "Q6H", "q8h": "Q8H", "q12h": "Q12H", "q24h": "Q24H",
  "q4 hours": "Q4H", "q6 hours": "Q6H", "q8 hours": "Q8H", "q12 hours": "Q12H",
  "qac": "QAC", "qpc": "QPC", "qod": "QOD", "qweek": "weekly", "qwk": "weekly",
  // Routes
  "po": "PO", "p.o.": "PO", "by mouth": "PO",
  "iv": "IV", "i.v.": "IV", "intravenous": "IV",
  "im": "IM", "i.m.": "IM", "intramuscular": "IM",
  "sc": "SC", "subq": "SC", "subcutaneous": "SC", "sq": "SC",
  "sl": "SL", "sublingual": "SL",
  "pr": "PR", "per rectum": "PR",
  "in": "IN", "intranasal": "IN",
  "top": "TOP", "topical": "TOP",
  "os": "OS", "od": "OD", "ou": "OU",
  "au": "AU", "as": "AS", "ad": "AD",
  "ng": "NG", "og": "OG",
  // Vitals
  "bp": "BP", "hr": "HR", "rr": "RR", "temp": "Temp", "temperature": "Temp",
  "spo2": "SpO2", "sat": "SpO2", "sats": "SpO2", "o2 sat": "SpO2",
  "bmi": "BMI", "wt": "weight", "ht": "height",
  // Labs (chemistry)
  "na": "Na", "sodium": "Na", "k": "K", "potassium": "K",
  "cl": "Cl", "chloride": "Cl", "hco3": "HCO3", "bicarb": "HCO3", "bicarbonate": "HCO3",
  "bun": "BUN", "cr": "Cr", "creatinine": "Cr", "gluc": "glucose",
  "ca": "Ca", "calcium": "Ca", "mg++": "Mg", "phos": "Phos", "phosphorus": "Phos",
  "gfr": "GFR", "egfr": "eGFR",
  // Labs (heme)
  "wbc": "WBC", "rbc": "RBC", "hgb": "Hgb", "hemoglobin": "Hgb",
  "hct": "Hct", "hematocrit": "Hct", "plt": "Plt", "platelets": "Plt",
  "mcv": "MCV", "mch": "MCH", "mchc": "MCHC", "rdw": "RDW",
  // Labs (coag)
  "inr": "INR", "ptt": "PTT", "aptt": "aPTT",
  // Labs (LFT / lipids / cardiac / endocrine / renal)
  "ast": "AST", "alt": "ALT", "alp": "ALP", "alkphos": "ALP",
  "tbili": "T. bili", "total bilirubin": "T. bili", "dbili": "D. bili",
  "albumin": "albumin", "alb": "albumin",
  "tsh": "TSH", "ft4": "FT4", "ft3": "FT3", "t4": "T4", "t3": "T3",
  "a1c": "HbA1c", "hba1c": "HbA1c", "hemoglobin a1c": "HbA1c",
  "ldl": "LDL", "hdl": "HDL", "tg": "TG", "triglycerides": "TG",
  "crp": "CRP", "esr": "ESR", "procal": "procalcitonin",
  "bnp": "BNP", "nt-probnp": "NT-proBNP", "trop": "troponin", "troponin i": "troponin I",
  "ck": "CK", "ck-mb": "CK-MB", "cpk": "CPK", "ldh": "LDH",
  "lactate": "lactate", "lac": "lactate",
  "abg": "ABG", "vbg": "VBG",
  "ua": "UA", "urinalysis": "UA", "urine culture": "urine culture",
  "cbc": "CBC", "cmp": "CMP", "bmp": "BMP", "lft": "LFTs", "lfts": "LFTs",
  // Imaging
  "cxr": "CXR", "chest x-ray": "CXR", "kub": "KUB",
  "ct": "CT", "ct scan": "CT", "mri": "MRI", "us": "US", "ultrasound": "US",
  "echo": "echo", "ekg": "EKG", "ecg": "ECG", "eeg": "EEG", "emg": "EMG",
  "pet": "PET", "dexa": "DEXA",
  // Anatomy / body systems
  "lue": "LUE", "rue": "RUE", "lle": "LLE", "rle": "RLE",
  "cv": "CV", "resp": "resp", "pulm": "pulm", "gi": "GI", "gu": "GU",
  "msk": "MSK", "heent": "HEENT", "cns": "CNS", "pns": "PNS",
  // Symptoms / findings (shorthand)
  "sob": "shortness of breath", "doe": "dyspnea on exertion",
  "cp": "chest pain", "n/v": "nausea/vomiting", "nv": "nausea/vomiting",
  "n/v/d": "nausea/vomiting/diarrhea", "ha": "headache", "abd": "abdominal",
  "loc": "loss of consciousness", "lbp": "low back pain",
  "aki": "AKI", "ckd": "CKD", "chf": "CHF", "cad": "CAD", "cabg": "CABG",
  "copd": "COPD", "dm": "DM", "dm2": "type 2 DM", "t2dm": "type 2 DM",
  "htn": "HTN", "hld": "HLD", "hlp": "HLD", "afib": "atrial fibrillation",
  "vt": "ventricular tachycardia", "svt": "SVT", "mi": "MI", "stemi": "STEMI",
  "nstemi": "NSTEMI", "acs": "ACS", "cva": "CVA", "tia": "TIA",
  "dvt": "DVT", "pe": "PE", "uti": "UTI", "utis": "UTIs",
  "gerd": "GERD", "ibd": "IBD", "ibs": "IBS", "gib": "GI bleed",
  "uc": "ulcerative colitis", "esrd": "ESRD", "hd": "hemodialysis",
  "osa": "OSA", "asa": "ASA", "afib rvr": "atrial fibrillation with RVR",
  // History sections
  "hpi": "HPI", "pmh": "PMH", "psh": "PSH", "fhx": "FHx", "shx": "SHx",
  "ros": "ROS", "meds": "meds", "med rec": "medication reconciliation",
  "nka": "NKA", "nkda": "NKDA", "a/p": "A/P", "dx": "diagnosis",
  "ddx": "differential diagnosis", "tx": "treatment", "rx": "prescription",
  "hx": "hx", "sx": "sx", "s/p": "s/p", "r/o": "r/o", "c/o": "c/o",
  "w/": "with", "w/o": "without", "y/o": "y/o", "yo": "y/o",
  "pt": "patient", "pts": "patients", "f/u": "follow-up", "fu": "follow-up",
  "d/c": "discharge", "dc": "discharge",
  // Exam
  "on exam": "on exam", "wnl": "within normal limits",
  "rrr": "RRR", "ctab": "CTAB", "nabs": "NABS", "nad": "no acute distress",
  "aaox3": "alert and oriented x3", "aox3": "alert and oriented x3",
  "ln": "lymph node", "lad": "lymphadenopathy",
  // Misc units words
  "milligrams": "mg", "milligram": "mg",
  "micrograms": "mcg", "microgram": "mcg",
  "milliliters": "mL", "milliliter": "mL",
  "kilograms": "kg", "kilogram": "kg", "kilo": "kg",
  "grams": "g", "gram": "g",
  "units": "units", "meq": "mEq", "mmol": "mmol",
  "iu": "IU",
  "mmhg": "mmHg", "millimeters of mercury": "mmHg",
  "bpm": "bpm", "beats per minute": "bpm",
  "cm": "cm", "mm": "mm",
};

const CUE_WORDS = ["Then", "Plan", "Assessment", "On exam", "Labs", "Imaging"];

function splitSentences(text: string): string[] {
  const raw = text.split(/(?<=[.!?])\s+/);
  return raw.filter((s) => s.trim().length > 0);
}

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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyAbbrevPlus(text: string): string {
  // Sort by length desc so longer phrases match first ("q.i.d." before "q").
  const keys = Object.keys(ABBREVIATIONS).sort((a, b) => b.length - a.length);
  let t = text;
  for (const k of keys) {
    const v = ABBREVIATIONS[k];
    // Word-boundary variant that also tolerates internal punctuation like "b.i.d."
    const boundary = /^[a-z0-9]/.test(k[0]) ? "\\b" : "";
    const boundaryEnd = /[a-z0-9]$/i.test(k[k.length - 1]) ? "\\b" : "";
    const re = new RegExp(`${boundary}${escapeRegex(k)}${boundaryEnd}`, "gi");
    t = t.replace(re, v);
  }
  return t;
}

function applyParagraphs(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length <= 3) return text;
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i]!.trim();
    const startsWithCue = CUE_WORDS.some((cue) =>
      new RegExp(`^${cue}\\b`, "i").test(s),
    );
    if (startsWithCue && out.length > 0) {
      out.push("");
    }
    out.push(s);
  }
  // Convert to blank-line separated paragraphs
  const lines: string[] = [];
  let buf: string[] = [];
  for (const p of out) {
    if (p === "") {
      if (buf.length) lines.push(buf.join(" "));
      buf = [];
      lines.push("");
    } else {
      buf.push(p);
    }
  }
  if (buf.length) lines.push(buf.join(" "));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function applyFormatToggles(
  text: string,
  toggles: Set<FormatToggle>,
): string {
  let t = text;
  if (toggles.has("unitsAndAbbrev")) t = applyUnitsAndAbbrev(t);
  if (toggles.has("abbrevPlus")) t = applyAbbrevPlus(t);
  if (toggles.has("punctuation")) t = applyPunctuation(t);
  if (toggles.has("sentenceCase")) t = applySentenceCase(t);
  if (toggles.has("paragraphs")) t = applyParagraphs(t);
  return t;
}

// Deterministic-only subset for the Format-tab pipeline. Skips LLM toggles.
export function applyDeterministicFormat(
  text: string,
  toggles: Set<FormatToggle>,
): string {
  return applyFormatToggles(text, toggles);
}

// Strip preview-only markdown to produce the plain text that lands in the
// SOAP textarea on Apply.
// - **bold** → bold text without asterisks
// - # HEADER / lines that are purely markdown-header syntax → UPPERCASE plain line
// - "- item" → "- item" (kept)
// - blank lines → kept as blank lines
export function toAppliedPlainText(markdownish: string): string {
  const lines = markdownish.split("\n").map((ln) => {
    // Header syntax → uppercase plain line
    const hm = ln.match(/^\s*#{1,6}\s+(.*)$/);
    if (hm) return hm[1]!.toUpperCase();
    // Strip bold markers, keep inner text
    return ln.replace(/\*\*(.+?)\*\*/g, "$1");
  });
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}
