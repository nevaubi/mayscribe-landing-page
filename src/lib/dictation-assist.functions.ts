import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  transcript: z.string(),
  spans: z.array(
    z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(),
      type: z.string(),
      status: z.string(),
      candidates: z.array(z.string()),
      reason: z.string().optional(),
    }),
  ),
  activeMeds: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are a clinical dictation formatting checker inside a hospital documentation system. You receive one transcript fragment, its detected protected spans, and the patient's active medication list. Return only JSON matching the schema. You may normalize formatting (drug name capitalization, dose formatting like 12.5 mg, spoken-number expansion) and rank the provided candidates. Never introduce a medication, number, dose, unit, laterality term, or negation absent from the transcript or candidate list. If unsure, set needsReview true.

Return strictly this JSON shape:
{ "formattedText": string, "spans": [{ "text": string, "start": number, "end": number, "type": string, "needsReview": boolean, "candidates": string[], "reason": string }] }`;

export const dictationAssist = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => InputSchema.parse(v))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { ok: false as const, reason: "no_key" };
    }
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2000);
    try {
      const res = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "dictation-assist",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-lite",
            temperature: 1,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: JSON.stringify({
                  transcript: data.transcript,
                  spans: data.spans,
                  activeMeds: data.activeMeds,
                }),
              },
            ],
          }),
        },
      );
      clearTimeout(t);
      if (!res.ok) return { ok: false as const, reason: `http_${res.status}` };
      const j = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = j.choices?.[0]?.message?.content;
      if (!content) return { ok: false as const, reason: "empty" };
      try {
        const parsed = JSON.parse(content);
        return { ok: true as const, result: parsed };
      } catch {
        return { ok: false as const, reason: "bad_json" };
      }
    } catch (e) {
      clearTimeout(t);
      const msg = e instanceof Error ? e.message : "unknown";
      return { ok: false as const, reason: msg };
    }
  });
