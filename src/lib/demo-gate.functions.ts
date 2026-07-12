import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

type GateSession = { unlocked?: boolean };

function getSessionConfig() {
  const password = process.env.DEMO_SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("DEMO_SESSION_SECRET is not set (must be 32+ chars).");
  }
  return {
    password,
    name: "demo-gate",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

const UnlockSchema = z.object({
  passcode: z.string().min(1).max(200),
});

export const unlockDemo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UnlockSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("verify_demo_passcode", {
      input: data.passcode,
    });

    if (error) {
      console.error("[demo-gate] verify failed", error);
      return { ok: false as const };
    }

    if (ok !== true) {
      return { ok: false as const };
    }

    const session = await useSession<GateSession>(getSessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });


export const isDemoUnlocked = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useSession<GateSession>(getSessionConfig());
    return { unlocked: session.data.unlocked === true };
  },
);

export const lockDemo = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(getSessionConfig());
  await session.clear();
  return { ok: true as const };
});
