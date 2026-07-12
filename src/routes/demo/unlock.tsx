import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { unlockDemo } from "@/lib/demo-gate.functions";

export const Route = createFileRoute("/demo/unlock")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Enter passcode — MayScribe Demo" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const navigate = useNavigate();
  const unlock = useServerFn(unlockDemo);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await unlock({ data: { passcode } });
      if (res.ok) {
        await navigate({ to: "/demo" });
        return;
      }
      setError("Incorrect passcode.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="lg:hidden"
        style={{
          minHeight: "100vh",
          background: "#F8FBFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 380,
            width: "100%",
            background: "#FFFFFF",
            border: "1px solid #D8E2F0",
            borderRadius: 12,
            boxShadow: "0 16px 36px -12px rgba(5,18,56,0.08)",
            padding: 28,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#0D57FA" }}>
            DEMO
          </p>
          <h1 style={{ margin: "8px 0 10px", fontSize: 20, fontWeight: 600, color: "#061338", letterSpacing: "-0.01em" }}>
            Must use desktop for demo access
          </h1>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#46587E" }}>
            The MayScribe demo is optimized for desktop. Please revisit from a larger screen.
          </p>
        </div>
      </div>
      <main
        className="hidden lg:flex"
        style={{
          minHeight: "100vh",
          background: "#F8FBFF",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          border: "1px solid #D8E2F0",
          borderRadius: 12,
          boxShadow: "0 16px 36px -12px rgba(5,18,56,0.08)",
          padding: 32,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#061338",
            letterSpacing: "-0.01em",
          }}
        >
          MayScribe demo
        </h1>
        <p
          style={{
            margin: "8px 0 24px",
            fontSize: 14,
            lineHeight: 1.55,
            color: "#46587E",
          }}
        >
          Enter your passcode to continue.
        </p>

        <label
          htmlFor="passcode"
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "#46587E",
            marginBottom: 6,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            height: 44,
            padding: "0 12px",
            fontSize: 15,
            color: "#061338",
            background: "#FFFFFF",
            border: `1px solid ${error ? "#DC2626" : "#C9D6EC"}`,
            borderRadius: 8,
            outline: "none",
          }}
        />

        {error && (
          <p
            role="alert"
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              color: "#DC2626",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || passcode.length === 0}
          style={{
            marginTop: 20,
            width: "100%",
            height: 44,
            border: "none",
            borderRadius: 8,
            background: "#1D3461",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
            opacity: submitting || passcode.length === 0 ? 0.6 : 1,
            boxShadow: "0 12px 24px -8px rgba(5,64,199,0.24)",
          }}
        >
          {submitting ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
    </>
  );
}

