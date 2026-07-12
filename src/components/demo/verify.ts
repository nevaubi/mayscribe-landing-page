import type { DGWord } from "./useDictation";
import { detectAll, findMed, findLASA, MEDS } from "./lexicon";

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

export interface VerifyResult {
  spans: Span[];
  committedText: string; // string with underscore placeholders for holds
}

const HOLD_CONF_THRESHOLD = 0.86;

function minConfidenceIn(
  words: DGWord[],
  spanText: string,
): number {
  // Words come from Deepgram with word-level confidence but no char offsets
  // into formatted text. Do a simple token match: for each token in the span,
  // find the word with matching text and take min confidence.
  if (!words.length) return 1;
  const tokens = spanText.toLowerCase().split(/\s+/).filter(Boolean);
  let min = 1;
  for (const tok of tokens) {
    const stripped = tok.replace(/[^a-z0-9.]/gi, "");
    if (!stripped) continue;
    const w = words.find(
      (x) =>
        (x.punctuated_word || x.word || "").toLowerCase().replace(/[^a-z0-9.]/gi, "") ===
        stripped,
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

export function verify(
  formattedText: string,
  words: DGWord[],
): VerifyResult {
  const detected = detectAll(formattedText);
  const spans: Span[] = [];

  // Med + dose HOLD logic: iterate detected in order, pair med with next dose within 40 chars.
  for (let i = 0; i < detected.length; i++) {
    const d = detected[i];
    if (d.type !== "med") continue;
    const medEntry = findMed(d.text);
    if (!medEntry) continue;

    // LASA check
    const lasa = findLASA(d.text);

    // find nearest dose after this med within 40 chars
    let nearestDose: (typeof detected)[number] | undefined;
    for (let j = i + 1; j < detected.length; j++) {
      if (detected[j].start - d.end > 40) break;
      if (detected[j].type === "dose") {
        nearestDose = detected[j];
        break;
      }
    }

    const conf = minConfidenceIn(words, d.text);
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
    }

    if (status === "commit" && conf < HOLD_CONF_THRESHOLD) {
      status = "hold";
      type = "low_confidence";
      reason = "Low confidence";
      candidates = [d.text, "(dismiss)"];
    }

    spans.push({
      id: nextId(),
      text: d.text,
      start: d.start,
      end: d.end,
      type,
      status,
      candidates,
      reason,
      minConfidence: conf,
    });
  }

  // Also flag low-confidence dose spans not attached to a med
  for (const d of detected) {
    if (d.type !== "dose") continue;
    const already = spans.some(
      (s) => s.start <= d.start && s.end >= d.end,
    );
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

  return { spans, committedText: out };
}

export const DEMO_ACTIVE_MEDS = MEDS
  .filter((m) =>
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
  )
  .map((m) => m.name);
