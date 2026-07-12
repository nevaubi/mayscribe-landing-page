## Goal

Make the MayScribe whitepaper openly accessible from the landing page — no gating. Ship both a CDN-hosted PDF (for download/print) and an on-site `/whitepaper` reader route (for SEO, deep-linking, and readability).

## Changes

### 1. Host the PDF on the Lovable CDN
Upload `MayScribe_Whitepaper.pdf` from the upload to CDN storage and write the pointer to `src/assets/mayscribe-whitepaper.pdf.asset.json`. No binary in the repo.

### 2. New route: `/whitepaper`
Create `src/routes/whitepaper.tsx` — a full readable HTML rendering of the paper for SEO and easy skimming.

Layout:
- Sticky top bar: back link to `/`, "Download PDF" button (links to the CDN URL), "Book a demo" button.
- Header block: title "Clinical Dictation Without the Cloud", subtitle, "July 2026 · MayScribe · Prepared for hospital IT, compliance, and clinical informatics leadership".
- Table of contents (anchored to `#section-1` … `#section-9`).
- Body: sections 1–9 rendered as semantic HTML using the site's existing design tokens (Inter, `#061338` headings, `#46587E` body, blue kicker `#0D57FA`, hairline dividers `#E6EEF8`). Max content width ~720px, generous line-height for long-form reading.
- References list at the bottom with numbered anchors (`[1]`–`[15]`), linking inline citations to the reference entries.
- Footer reuses the site footer.

Route-level `head()`:
- title: "Whitepaper — Clinical Dictation Without the Cloud | MayScribe"
- description: A concise summary of the paper's argument (self-hosted dictation, zero audio retention, deterministic verification, honest SOC roadmap).
- og:title, og:description, twitter:card mirrored.
- canonical: `/whitepaper`.
- JSON-LD `Article` schema (headline, datePublished 2026-07, author "MayScribe", about).

### 3. Wire entry points on the landing page
In `src/routes/index.tsx`:
- **Dark CTA band**: replace the ghost "Request the whitepaper" button with a ghost "Read the whitepaper →" that links to `/whitepaper` (client `<Link>`, not `<a>`).
- **Footer row 1**: add a "Whitepaper" link between "Compliance" and "Contact".
- **Nav (desktop only)**: no change — keep the existing five items uncluttered. The whitepaper is reachable from the CTA band and footer.

### 4. Sitemap
Add `/whitepaper` as a `<url>` entry in `public/sitemap.xml` so it gets indexed.

## Non-goals / explicit choices

- No form gating. No "request the whitepaper" flow. The "Book a demo" modal remains the only lead-capture surface.
- Not adding a whitepaper link to the top nav — keeps the nav focused on Product / Workflow / Security / Integrations.
- Not embedding the PDF in an `<iframe>` — the HTML reader route is the primary reading experience; the PDF is a download for people who want to save, print, or share the file.
- No changes to the "Book a demo" flow, email templates, or existing sections.

## Technical notes

- CDN upload uses `lovable-assets create --file /mnt/user-uploads/MayScribe_Whitepaper.pdf --filename mayscribe-whitepaper.pdf`; write output to `src/assets/mayscribe-whitepaper.pdf.asset.json`.
- Import the pointer JSON in `whitepaper.tsx` and in `index.tsx` (for the PDF-download button that will also appear at the bottom of the reader page).
- The reader page content is authored inline as JSX from the parsed whitepaper text — no runtime PDF parsing. If sections are updated later, edit the JSX and re-upload the PDF.
- The route file is `src/routes/whitepaper.tsx` with `createFileRoute("/whitepaper")` — separate route, own `head()` per the SEO rules.
