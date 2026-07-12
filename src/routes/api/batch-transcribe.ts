import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/batch-transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.TOGETHER_API_KEY;
        if (!key) {
          return Response.json(
            { error: "TOGETHER_API_KEY missing" },
            { status: 500 },
          );
        }
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "bad_form" }, { status: 400 });
        }
        const file = form.get("file");
        if (!(file instanceof Blob)) {
          return Response.json({ error: "missing file" }, { status: 400 });
        }

        const out = new FormData();
        // Together's REST audio/transcriptions accepts a file + model.
        out.append(
          "file",
          new File([file], "audio.wav", { type: "audio/wav" }),
        );
        out.append(
          "model",
          "firasshaher99_0edd/nvidia/parakeet-tdt-0.6b-v3-361f8f03",
        );

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);
        try {
          const res = await fetch(
            "https://api.together.xyz/v1/audio/transcriptions",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${key}` },
              body: out,
              signal: controller.signal,
            },
          );
          clearTimeout(timer);
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            return Response.json(
              { error: `together_${res.status}`, detail: text.slice(0, 400) },
              { status: 502 },
            );
          }
          const j = (await res.json()) as { text?: string };
          return Response.json({ text: j.text ?? "" });
        } catch (e) {
          clearTimeout(timer);
          const msg = e instanceof Error ? e.message : "unknown";
          return Response.json({ error: msg }, { status: 502 });
        }
      },
    },
  },
});
