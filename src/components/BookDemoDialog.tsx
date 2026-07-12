import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ArrowRight, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { submitDemoRequest } from "@/lib/demo-request.functions";

const FormSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(254),
  company: z.string().trim().max(160).optional(),
  role: z.string().trim().max(120).optional(),
  message: z.string().trim().min(1, "Please add a short message").max(4000),
});

type FormValues = z.infer<typeof FormSchema>;
type Errors = Partial<Record<keyof FormValues, string>>;

const initial: FormValues = {
  name: "",
  email: "",
  company: "",
  role: "",
  message: "",
};

export function BookDemoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const submit = useServerFn(submitDemoRequest);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = <K extends keyof FormValues>(key: K, v: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setStatus("idle");
    setErrorMsg(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Delay reset until close animation completes
      setTimeout(reset, 200);
    }
    onOpenChange(next);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormValues;
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    try {
      await submit({ data: parsed.data });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 bg-white border-[color:var(--border-default)] rounded-[12px] overflow-hidden">
        {status === "success" ? (
          <div className="p-8 text-center">
            <div
              className="mx-auto h-12 w-12 rounded-full inline-flex items-center justify-center"
              style={{
                background: "var(--chip-green-bg)",
                border: "1px solid var(--chip-green-border)",
              }}
            >
              <Check className="h-6 w-6" style={{ color: "var(--chip-green-text)" }} strokeWidth={2.5} />
            </div>
            <DialogHeader className="mt-4">
              <DialogTitle className="text-[20px] font-bold text-[color:var(--ink)] text-center">
                Thanks — we'll be in touch.
              </DialogTitle>
              <DialogDescription className="text-[14px] text-[color:var(--ink-2)] text-center mt-2">
                Your request has been sent to the MayScribe team. Expect a reply at{" "}
                <span className="font-semibold text-[color:var(--ink)]">{values.email}</span> within one business day.
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={() => handleOpenChange(false)}
              className="mt-6 bg-[color:var(--brand-deep)] text-white rounded-[8px] h-10 px-5 text-[14px] font-semibold inline-flex items-center gap-1.5 shadow-btn"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border-hair)" }}>
              <DialogHeader>
                <DialogTitle className="text-[20px] font-bold text-[color:var(--ink)] tracking-[-0.01em]">
                  Book a demo
                </DialogTitle>
                <DialogDescription className="text-[13.5px] text-[color:var(--ink-2)] leading-[1.5]">
                  Tell us a bit about your team and we'll set up a walkthrough of MayScribe.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
              <Field
                label="Name"
                required
                value={values.name}
                onChange={(v) => set("name", v)}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Work email"
                required
                type="email"
                value={values.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
                autoComplete="email"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Company"
                  value={values.company ?? ""}
                  onChange={(v) => set("company", v)}
                  error={errors.company}
                  autoComplete="organization"
                  optional
                />
                <Field
                  label="Role"
                  value={values.role ?? ""}
                  onChange={(v) => set("role", v)}
                  error={errors.role}
                  autoComplete="organization-title"
                  optional
                />
              </div>
              <TextareaField
                label="Message"
                required
                value={values.message}
                onChange={(v) => set("message", v)}
                error={errors.message}
                placeholder="What are you hoping to solve? Team size, specialty, timelines — anything helps."
              />

              {status === "error" && errorMsg && (
                <div
                  className="text-[13px] rounded-[8px] px-3 py-2"
                  style={{
                    background: "#FFF5F5",
                    border: "1px solid #F5C6C6",
                    color: "#8A1F1F",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-[8px] h-10 px-4 text-[14px] font-semibold text-[color:var(--ink-2)] bg-white"
                  style={{ border: "1px solid var(--border-strong)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="bg-[color:var(--brand-deep)] text-white rounded-[8px] h-10 px-5 text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-btn disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Sending…" : (
                    <>
                      Send request <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  required,
  optional,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-[color:var(--ink)] mb-1.5">
        {label}
        {optional && (
          <span className="ml-1.5 text-[12px] font-medium text-[color:var(--muted-ink)]">optional</span>
        )}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className="w-full rounded-[8px] h-10 px-3 text-[14px] text-[color:var(--ink)] bg-white outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25 focus:border-[color:var(--brand)]"
        style={{ border: `1px solid ${error ? "#E88" : "var(--border-strong)"}` }}
      />
      {error && <span className="mt-1 block text-[12px] text-[#C0392B]">{error}</span>}
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-[color:var(--ink)] mb-1.5">{label}</span>
      <textarea
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        aria-invalid={!!error}
        className="w-full rounded-[8px] px-3 py-2 text-[14px] text-[color:var(--ink)] bg-white outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25 focus:border-[color:var(--brand)] resize-y min-h-[100px]"
        style={{ border: `1px solid ${error ? "#E88" : "var(--border-strong)"}` }}
      />
      {error && <span className="mt-1 block text-[12px] text-[#C0392B]">{error}</span>}
    </label>
  );
}
