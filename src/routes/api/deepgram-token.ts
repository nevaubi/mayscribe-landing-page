import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOST_SUFFIXES = [
  "localhost",
  "127.0.0.1",
  ".lovable.app",
  "lovable.app",
  "mayscribe.com",
  ".mayscribe.com",
];

function originAllowed(originHeader: string | null): boolean {
  if (!originHeader) return false;
  try {
    const host = new URL(originHeader).hostname;
    return ALLOWED_HOST_SUFFIXES.some(
      (suf) => host === suf || host.endsWith(suf),
    );
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/deepgram-token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin =
          request.headers.get("origin") ||
          (request.headers.get("referer")
            ? new URL(request.headers.get("referer")!).origin
            : null);
        if (!originAllowed(origin)) {
          return new Response("Forbidden", { status: 403 });
        }
        const key = process.env.DEEPGRAM_API_KEY;
        if (!key) return new Response("Server misconfigured", { status: 500 });
        const res = await fetch("https://api.deepgram.com/v1/auth/grant", {
          method: "POST",
          headers: { Authorization: `Token ${key}` },
        });
        if (!res.ok) {
          return new Response("Upstream error", { status: 502 });
        }
        const data = (await res.json()) as {
          access_token: string;
          expires_in: number;
        };
        return Response.json(
          { access_token: data.access_token, expires_in: data.expires_in },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
