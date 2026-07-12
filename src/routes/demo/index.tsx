import { createFileRoute, redirect } from "@tanstack/react-router";
import { isDemoUnlocked } from "@/lib/demo-gate.functions";
import { EmrDashboard } from "@/components/demo/EmrDashboard";

export const Route = createFileRoute("/demo/")({
  ssr: false,
  loader: async () => {
    const { unlocked } = await isDemoUnlocked();
    if (!unlocked) throw redirect({ to: "/demo/unlock" });
    return null;
  },
  head: () => ({
    meta: [
      { title: "MayScribe Demo" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  return (
    <main className="min-h-screen w-full bg-hero lg:h-screen lg:overflow-y-auto lg:snap-y lg:snap-proximity">
      {/* Mobile notice */}
      <div className="lg:hidden min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full bg-white border border-border-default rounded-xl shadow-card p-8 text-center">
          <p className="text-[11px] font-bold tracking-[0.14em] text-brand">
            DEMO
          </p>
          <h1 className="mt-2 text-xl font-semibold text-ink tracking-tight">
            Must use desktop for demo access
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            The MayScribe EMR preview is optimized for desktop. Please revisit
            this page from a larger screen.
          </p>
        </div>
      </div>

      {/* Desktop content */}
      <div className="hidden lg:block">
        <section className="lg:snap-start">
          <div className="mx-auto max-w-[1240px] px-8 pt-10 pb-4">
            <p className="text-[11px] font-bold tracking-[0.14em] text-brand">
              DEMO
            </p>
            <h1 className="mt-1.5 text-[26px] leading-tight font-semibold text-ink tracking-tight">
              MayScribe EMR preview
            </h1>
            <p className="mt-1.5 text-sm text-ink-2">
              Interactive mock — explore the workspace below.
            </p>
          </div>
        </section>
        <section className="lg:snap-center lg:snap-always min-h-screen flex items-center justify-center">
          <div className="mx-auto w-full max-w-[1240px] px-8 pb-16">
            <div
              className="rounded-xl border border-border-default bg-white shadow-card overflow-hidden origin-top"
              style={{ transform: "scale(0.9)", transformOrigin: "top center", marginBottom: "-6%" }}
            >
              <EmrDashboard />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
