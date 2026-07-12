import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const recipient = "fshaher@mayscribe.com";

    try {
      const { sendTemplateEmail } = await import(
        "@/lib/email-templates/send-email"
      );
      const result = await sendTemplateEmail(
        "demo-request-notification",
        recipient,
        {
          templateData: {
            name: data.name,
            email: data.email,
            company: data.company || "",
            role: data.role || "",
            message: data.message,
            submittedAt: new Date().toISOString(),
          },
          replyTo: data.email,
          idempotencyKey: `demo-request-${data.email}-${Date.now()}`,
        },
      );
      if (!result.sent) {
        console.warn("[demo-request] not sent:", result.reason);
      }
    } catch (err) {
      // Log server-side; surface a generic error to the client
      console.error("[demo-request] send failed:", err);
      throw new Error(
        "We couldn't send your request right now. Please try again shortly or email fshaher@mayscribe.com directly.",
      );
    }

    return { ok: true as const };
  });
