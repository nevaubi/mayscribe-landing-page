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
    <main className="min-h-screen w-full bg-background">
      <header className="h-10 flex items-center px-4 border-b border-border-hair text-sm font-semibold text-ink">
        Test below
      </header>
      <EmrDashboard />
    </main>
  );
}
