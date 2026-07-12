## Goal
Clicking either "Book a demo" button (nav + hero) opens a modal form. Submitting the form sends an email notification to `fshaher@mayscribe.com` with the submitted info, and shows a success state.

## Form fields
- Name (required)
- Work email (required, validated)
- Company (optional)
- Role / title (optional)
- Message (required, textarea)

Client-side validation with zod (trim, length caps, email format). Submit button shows loading state; on success shows a "Thanks, we'll be in touch" confirmation inside the modal; on failure shows an inline error.

## UI
- New `BookDemoDialog` component using existing shadcn `Dialog` primitives, styled to match the landing page tokens (Inter, `#061338` ink, `#0D57FA` accent, 8px radii, card shadow).
- Lift open state into `Landing` via React context (or a small `useDemoDialog` hook) so both the `Nav` gradient button and the hero "Book a demo" button trigger the same dialog.
- Accessible: focus trap (from Radix Dialog), Escape to close, labeled inputs, error text tied via `aria-describedby`.

## Backend (email delivery)
This requires backend infrastructure, so as prerequisites we will:
1. Enable **Lovable Cloud** (needed to send email).
2. Set up a **Lovable email domain** on `mayscribe.com` (or a delegated subdomain like `notify.mayscribe.com`) — the user completes DNS via the in-app setup dialog. Emails cannot send until the domain is verified; auth-only fallback doesn't apply here since this is an app email.
3. **Scaffold app email templates** (creates the registry + server send helper + preview route).

Then implement:
- A React Email template `demo-request-notification.tsx` in `src/lib/email-templates/` — internal notification styled simply (name, email, company, role, message, timestamp). Subject: `New demo request from {name}`.
- Register the template in `src/lib/email-templates/registry.ts`.
- A **server function** `submitDemoRequest` in `src/lib/demo-request.functions.ts` using `createServerFn` with a zod `inputValidator`. Handler:
  - Re-validates input server-side.
  - Calls `sendTemplateEmail('demo-request-notification', 'fshaher@mayscribe.com', { templateData: {...}, replyTo: submitter email, idempotencyKey: hash of email+timestamp })`.
  - Returns `{ ok: true }` or throws a typed error.
- The dialog calls the server fn via `useServerFn` on submit.

No database table is created — this is purely a notification email. (If the user later wants a record of submissions, that can be added.)

## Files touched
- `src/components/BookDemoDialog.tsx` (new)
- `src/components/DemoDialogProvider.tsx` (new — context + hook)
- `src/routes/__root.tsx` (mount provider)
- `src/routes/index.tsx` (wire both "Book a demo" buttons to `openDemoDialog()`)
- `src/lib/demo-request.functions.ts` (new server fn)
- `src/lib/email-templates/demo-request-notification.tsx` (new template)
- `src/lib/email-templates/registry.ts` (register template — created by scaffold step)

## Order of operations
1. Enable Lovable Cloud.
2. Prompt user to set up email domain for `mayscribe.com`.
3. Scaffold app email templates.
4. Add template + server fn + dialog + wiring.
5. Verify by submitting the form once domain is verified.

## Notes / confirmations needed
- Recipient confirmed: `fshaher@mayscribe.com`.
- Sender domain: I'll suggest `notify.mayscribe.com` during setup unless you prefer sending directly from `mayscribe.com`.
- No CAPTCHA in v1; if spam becomes an issue we can add a honeypot field or Turnstile later.