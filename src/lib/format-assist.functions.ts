import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  text: z.string(),
  toggles: z.object({
    spelling: z.boolean(),
    structure: z.boolean(),
  }),
});

const SYSTEM_PROMPT = `You reformat clinical note text. Fix spelling of ordinary English words. You may reorganize into paragraphs, hyphen bullet lists when the text enumerates items, and UPPERCASE header lines for clear subsections, and you may wrap genuinely critical values in **double asterisks**. You must preserve every number, unit, medication name, dose, negation word, and laterality term exactly as given. Never add, remove, or reword clinical content. Return JSON { formatted: string }.`;

export const formatAssist = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => InputSchema.parse(v))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false as const, reason: "no_key" };

    const instructions: string[] = [];
    if (data.toggles.spelling)
      instructions.push("Fix spelling of ordinary English words only.");
    if (data.toggles.structure)
      instructions.push(
        "Reorganize into paragraphs, hyphen bullet lists, and UPPERCASE header lines where appropriate. Wrap genuinely critical values in **double asterisks**.",
      );
    if (instructions.length === 0)
      return { ok: false as const, reason: "no_toggles" };

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "format-assist",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-lite",
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: JSON.stringify({
                  instructions,
                  text: data.text,
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
        const parsed = JSON.parse(content) as { formatted?: string };
        if (typeof parsed.formatted !== "string")
          return { ok: false as const, reason: "bad_shape" };
        return { ok: true as const, formatted: parsed.formatted };
      } catch {
        return { ok: false as const, reason: "bad_json" };
      }
    } catch (e) {
      clearTimeout(t);
      const msg = e instanceof Error ? e.message : "unknown";
      return { ok: false as const, reason: msg };
    }
  });
