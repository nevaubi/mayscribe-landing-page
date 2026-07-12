import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  text: z.string(),
  toggles: z.object({
    spelling: z.boolean(),
    structure: z.boolean(),
  }),
});

const SYSTEM_PROMPT = `You reformat clinical note text. Fix ordinary English spelling, spacing, and whitespace/casing errors. You may reorganize into paragraphs, hyphen bullet lists when the text enumerates items, and UPPERCASE header lines for clear subsections, and you may wrap genuinely critical values in **double asterisks**. You must preserve every number, unit, medication name, dose, negation word, and laterality term exactly as given (whitespace/case around units may be normalized, e.g. "5mg" -> "5 mg"). Never add, remove, or reword clinical content. Return JSON { "formatted": string }.`;

async function callFireworks(
  key: string,
  userContent: string,
  signal: AbortSignal,
): Promise<string | null> {
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
        presence_penalty: 0,
        frequency_penalty: 0,
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
    const parsed = JSON.parse(content) as { formatted?: string };
    if (typeof parsed.formatted !== "string") return null;
    return parsed.formatted;
  } catch {
    return null;
  }
}

export const formatAssist = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => InputSchema.parse(v))
  .handler(async ({ data }) => {
    const key = process.env.FIREWORKS_API_SECRET;
    if (!key) return { ok: false as const, reason: "no_key" };

    const instructions: string[] = [];
    if (data.toggles.spelling)
      instructions.push(
        "Fix spelling of ordinary English words and correct any spacing, whitespace, or casing errors.",
      );
    if (data.toggles.structure)
      instructions.push(
        "Reorganize into paragraphs, hyphen bullet lists, and UPPERCASE header lines where appropriate. Wrap genuinely critical values in **double asterisks**.",
      );
    if (instructions.length === 0)
      return { ok: false as const, reason: "no_toggles" };

    const userContent = JSON.stringify({ instructions, text: data.text });

    // 6s timeout, single retry on network/5xx/parse failure.
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 6000);
      try {
        const formatted = await callFireworks(
          key,
          userContent,
          controller.signal,
        );
        clearTimeout(t);
        if (formatted != null)
          return { ok: true as const, formatted };
        // parse fail — retry once
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
