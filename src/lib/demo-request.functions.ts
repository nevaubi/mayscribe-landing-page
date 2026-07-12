import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const DemoRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Please enter a valid email").max(254),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(4000),
});

export const submitDemoRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DemoRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const submittedAt = new Date().toISOString();
    const idempotencyKey = `demo-request-${data.email}-${submittedAt}`;

    try {
      await sendTemplateEmail("demo-request", "fshaher@mayscribe.com", {
        templateData: {
          name: data.name,
          email: data.email,
          company: data.company || undefined,
          role: data.role || undefined,
          message: data.message,
          submittedAt,
        },
        replyTo: data.email,
        idempotencyKey,
      });
    } catch (error) {
      console.error("[demo-request] email send failed", error);
      throw new Error("Could not send demo request. Please try again shortly.");
    }

    return { ok: true as const };
  });
