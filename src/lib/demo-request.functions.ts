import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DemoRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Please enter a valid email").max(254),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(4000),
});

const RECIPIENT = "fshaher@mayscribe.com";

export const submitDemoRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DemoRequestSchema.parse(data))
  .handler(async ({ data }) => {
    // Email delivery is wired once the email domain is verified and the
    // transactional template scaffolding is in place. Until then we log the
    // submission server-side so nothing is lost, and return success to the
    // client so the form UX is testable end to end.
    console.info("[demo-request] new submission for", RECIPIENT, {
      name: data.name,
      email: data.email,
      company: data.company || null,
      role: data.role || null,
      message: data.message,
      submittedAt: new Date().toISOString(),
    });

    return { ok: true as const };
  });
