import { createFileRoute, redirect } from "@tanstack/react-router";
import { isDemoUnlocked } from "@/lib/demo-gate.functions";

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
  return <main style={{ minHeight: "100vh", background: "#FFFFFF" }} />;
}
