import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  text: z.string(),
  toggles: z.object({
    spelling: z.boolean(),
    autoFormat: z.boolean(),
    doseUnits: z.boolean(),
  }),
});

const SYSTEM_PROMPT = `You reformat clinical note text. You must return strict JSON of shape:
{ "formatted": string, "doseChanges": [{ "before": string, "after": string }] }

Rules:
- "formatted" contains the note after applying whichever of these are enabled:
  * spelling: fix ordinary English spelling, spacing, whitespace, punctuation, and casing errors.
  * autoFormat: reorganize into paragraphs, hyphen bullet lists, and UPPERCASE header lines where appropriate. You may wrap genuinely critical values in **double asterisks**.
- "formatted" MUST preserve every dose-unit word (milligrams, micrograms, milliliters, units, mEq, mmol, IU, %, mmHg, bpm, and their abbreviations mg / mcg / mL / g / kg) EXACTLY as they appear in the input. Do NOT abbreviate or expand them in "formatted".
- If doseUnits is enabled, list every proposed dosage-unit normalization in "doseChanges" (e.g. { "before": "10 milligrams", "after": "10 mg" }). Include the number and unit exactly as they appear in "formatted". Only include dosage measurements attached to a number. Do not propose changes to route/frequency abbreviations or lab shorthand. If doseUnits is disabled, "doseChanges" must be an empty array.
- Never invent medications, numbers, doses, negations, or laterality terms not present in the input.
- Preserve line breaks in "formatted" using \\n.`;

async function callFireworks(
  key: string,
  userContent: string,
  signal: AbortSignal,
): Promise<{ formatted: string; doseChanges: { before: string; after: string }[] } | null> {
  const res = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/glm-5p2",
        max_tokens: 4096,
        top_k: 40,
        temperature: 0,
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    },
  );
  if (!res.ok) {
    if (res.status >= 500) throw new Error(`http_${res.status}`);
    return null;
  }
  const j = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = j.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as {
      formatted?: string;
      doseChanges?: unknown;
    };
    if (typeof parsed.formatted !== "string") return null;
    const rawChanges = Array.isArray(parsed.doseChanges) ? parsed.doseChanges : [];
    const doseChanges: { before: string; after: string }[] = [];
    for (const c of rawChanges) {
      if (
        c &&
        typeof (c as { before?: unknown }).before === "string" &&
        typeof (c as { after?: unknown }).after === "string"
      ) {
        const before = (c as { before: string }).before;
        const after = (c as { after: string }).after;
        if (before && after && before !== after) {
          doseChanges.push({ before, after });
        }
      }
    }
    return { formatted: parsed.formatted, doseChanges };
  } catch {
    return null;
  }
}

export const formatAssist = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => InputSchema.parse(v))
  .handler(async ({ data }) => {
    const key = process.env.FIREWORKS_API_SECRET;
    if (!key) return { ok: false as const, reason: "no_key" };

    if (!data.toggles.spelling && !data.toggles.autoFormat && !data.toggles.doseUnits) {
      return { ok: false as const, reason: "no_toggles" };
    }

    const userContent = JSON.stringify({
      instructions: {
        spelling: data.toggles.spelling,
        autoFormat: data.toggles.autoFormat,
        doseUnits: data.toggles.doseUnits,
      },
      text: data.text,
    });

    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 6000);
      try {
        const result = await callFireworks(key, userContent, controller.signal);
        clearTimeout(t);
        if (result != null) {
          return {
            ok: true as const,
            formatted: result.formatted,
            doseChanges: result.doseChanges,
          };
        }
      } catch (e) {
        clearTimeout(t);
        if (attempt === 1) {
          const msg = e instanceof Error ? e.message : "unknown";
          return { ok: false as const, reason: msg };
        }
      }
    }
    return { ok: false as const, reason: "retry_exhausted" };
  });
