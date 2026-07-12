## Scope

1. **Rename** `/whitepaper` page and CTAs to **"Whitepaper preview"**.
2. **Replace** all page content with the 9 sections from the uploaded PDF (`Clinical-Dictation-Without-the-Cloud.pdf`), matching the PDF's structure, section labels, stats, tables, and closing block.
3. **Restyle** the page to echo the PDF's editorial layout (kicker labels, big serif-style titles, stat blocks, threat/comparison tables, numbered checklist, closing "Built to be audited" block). All within existing MayScribe design tokens.

## Rename changes

- `src/routes/index.tsx`
  - Hero button label → **"Whitepaper preview"** (both instances of "Read the whitepaper")
  - CTA band button → **"Whitepaper preview"**
  - Footer link text → **"Whitepaper preview"**
- `src/routes/whitepaper.tsx`
  - Sticky top-bar title / kicker: **"Whitepaper preview"**
  - `head()` title/description updated (still under 60/160 chars)
  - JSON-LD `Article` name updated
- `Download PDF` button: keep pointing to the existing CDN asset (`src/assets/mayscribe-whitepaper.pdf.asset.json`) — I will NOT swap the underlying PDF in this change. If you want the download to serve the new preview PDF, tell me and I'll upload it via `lovable-assets` in the same edit.

## New page structure (matches PDF page-by-page)

Each section rendered as a `<section>` with a small blue kicker, an H2 title, and body. Uses existing tokens (`--ink`, `--ink-2`, `--brand`, `--hero`, `--border-default`, chip colors).

1. **Hero** — Kicker "WHITEPAPER (PREVIEW) · JULY 2026". Title "Clinical Dictation, Without the Vendor Risk". Subtitle from PDF. Three feature tiles (Zero Audio Retention / Self-Hosted in Your VPC / Deterministic Clinical Verification). Italic "Prepared for:" line under a hairline divider.
2. **Overview** — "The Case for Keeping Dictation Inside Your Own Walls" + two paragraphs + pull-quote card.
3. **The Problem** — Three big stat blocks (96.3%, 30,000+, $7.42M) with citations, then three subsections (errors frequent, newer models fabricate, cloud concentration).
4. **Security Architecture** — Intro + 4 architecture cards (Deployed Inside Your Own Cloud / Zero Audio Retention / Tamper-Proof Audit Trail / Hash-Pinned Model Integrity). "Threat Model" table (6 rows).
5. **Compliance** — HIPAA Alignment Today + SOC 2 Roadmap side-by-side. Numbered "6 Questions to Ask Any Dictation Vendor" list + MayScribe answers line.
6. **Performance** — 3 stat blocks (~0.4s / 2-Pass / 0 Retention). Six pipeline-step cards (Clinician Speaks → Pass 1 → Pass 2 → Verification Layer → Commit or Hold → Text at Cursor).
7. **Clinical Accuracy** — Intro + 3 subsections. Error-category table with a horizontal bar (CSS width % from score) for each of the 7 rows.
8. **Pricing & Scale** — Intro + 3 subsections. Comparison table (Cloud Dictation vs MayScribe) across 6 dimensions.
9. **Closing** — "Built to Be Audited. Designed to Be Trusted." + 3 tile block (Security Whitepaper / Control Matrix / Pilot Validation) + italic footnote.

Existing Table of Contents in the sticky/side rail is regenerated to point at these 9 sections. References section from the current page is removed (the PDF cites sources inline as "JAMA Network Open, 2018", "AP, Oct 2024", "IBM, 2025" — these appear inline in Section 3).

## Style notes

- Match PDF visual hierarchy: uppercase blue kicker, large title, generous whitespace between sections.
- Stat blocks: large ink number, small caption below, muted citation.
- Tables: hairline borders `--border-hair`, alternating row background `--row-bg`, semibold ink for headers.
- Bar chart in section 7: div with `background: var(--chip-blue-bg)`, inner fill `background: var(--brand)`, width `${score}%`.
- Keep sticky top bar with "Download PDF" and "Book a demo" actions.
- All in one file (`src/routes/whitepaper.tsx`) — no new components file.

## Out of scope

- Not replacing the downloadable PDF binary (unless you say so).
- No changes to the landing page hero visuals, compliance/security/CTA sections, or backend.

Confirm and I'll implement.
