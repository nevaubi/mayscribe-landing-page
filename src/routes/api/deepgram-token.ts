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
        const text = await res.text();
        if (!res.ok) {
          return new Response(
            JSON.stringify({ upstream_status: res.status, upstream_body: text }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
        let data: { access_token?: string; key?: string; expires_in?: number };
        try {
          data = JSON.parse(text);
        } catch {
          return new Response(
            JSON.stringify({ upstream_status: res.status, upstream_body: text }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
        const token = data.access_token ?? data.key;
        return Response.json(
          { access_token: token, expires_in: data.expires_in },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
