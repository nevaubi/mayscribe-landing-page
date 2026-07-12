import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { BookDemoDialog } from "@/components/BookDemoDialog";

const DESCRIPTION =
  "Preview: self-hosted clinical dictation with zero audio retention, deterministic verification, and a clear compliance path.";

export const Route = createFileRoute("/whitepaper")({
  component: WhitepaperPage,
  head: () => ({
    meta: [
      { title: "Whitepaper preview — MayScribe" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "MayScribe whitepaper preview" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://mayscribe.com/whitepaper" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MayScribe whitepaper preview" },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://mayscribe.com/whitepaper" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Clinical Dictation, Without the Vendor Risk",
          description: DESCRIPTION,
          datePublished: "2026-07-01",
          author: { "@type": "Organization", name: "MayScribe" },
          publisher: { "@type": "Organization", name: "MayScribe" },
          about: "Self-hosted, HIPAA-aligned clinical dictation",
          mainEntityOfPage: "https://mayscribe.com/whitepaper",
        }),
      },
    ],
  }),
});

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wp-lg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0B5DFF" />
          <stop offset="100%" stopColor="#0FD1D6" />
        </linearGradient>
      </defs>
      <path d="M16 2.5 5 6v9c0 6.6 4.6 12.6 11 15 6.4-2.4 11-8.4 11-15V6L16 2.5Z" fill="url(#wp-lg)" />
      <path
        d="M8 17.5h3l1.8-4.5 2.6 8 2.4-5.2 1.6 2.2H24"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11.5px] font-bold tracking-[0.18em] text-[color:var(--brand)] uppercase">
      {children}
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-3 text-[28px] md:text-[36px] font-bold tracking-[-0.015em] leading-[1.15] text-[color:var(--ink)] scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 className="text-[16.5px] md:text-[17px] font-semibold text-[color:var(--ink)] mt-6">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-[15px] leading-[1.7] text-[color:var(--ink-2)]">{children}</p>
  );
}

function Divider() {
  return <div className="my-14 h-px" style={{ background: "var(--border-hair)" }} />;
}

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="max-w-[880px] mx-auto px-6 lg:px-10">{children}</section>
  );
}

function StatBlock({ value, label, cite }: { value: string; label: string; cite: string }) {
  return (
    <div
      className="rounded-[10px] p-5 bg-white"
      style={{ border: "1px solid var(--border-default)" }}
    >
      <div className="text-[32px] md:text-[36px] font-bold text-[color:var(--ink)] leading-none tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-3 text-[13.5px] leading-[1.5] text-[color:var(--ink-2)]">{label}</div>
      <div className="mt-3 text-[11.5px] font-semibold tracking-[0.08em] uppercase text-[color:var(--muted-ink)]">
        {cite}
      </div>
    </div>
  );
}

function FeatureTile({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-[10px] p-5 text-center"
      style={{ background: "var(--hero)", border: "1px solid var(--border-hair)" }}
    >
      <div className="text-[15px] font-semibold text-[color:var(--ink)]">{title}</div>
      <div className="mt-2 text-[13px] leading-[1.55] text-[color:var(--ink-2)]">{body}</div>
    </div>
  );
}

function TopBar({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <div
      className="sticky top-0 z-30 bg-white/95 backdrop-blur"
      style={{ borderBottom: "1px solid var(--border-hair)" }}
    >
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-[color:var(--ink)]">
          <Logo size={26} />
          <span className="text-[16px] font-bold">MayScribe</span>
          <span className="hidden sm:inline text-[color:var(--muted-ink)] text-[13px] ml-2">
            / Whitepaper preview
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-[13px] font-semibold text-[color:var(--ink-2)]"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-[13px] font-semibold text-[color:var(--ink)]"
            style={{ border: "1px solid var(--border-strong)" }}
          >
            <Download className="h-4 w-4" /> Download PDF
          </a>
          <button
            onClick={onBookDemo}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-[13px] font-semibold text-white bg-gradient-brand shadow-btn"
          >
            Book a demo <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TOC() {
  const items = [
    ["overview", "Overview"],
    ["problem", "The Problem"],
    ["architecture", "Security Architecture"],
    ["compliance", "Compliance"],
    ["performance", "Performance"],
    ["accuracy", "Clinical Accuracy"],
    ["pricing", "Pricing & Scale"],
    ["closing", "Built to be Audited"],
  ];
  return (
    <nav
      className="rounded-[10px] p-5 bg-white"
      style={{ border: "1px solid var(--border-default)" }}
      aria-label="Table of contents"
    >
      <div className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-[color:var(--brand)]">
        Contents
      </div>
      <ol className="mt-3 space-y-2 text-[13.5px] text-[color:var(--ink-2)]">
        {items.map(([id, label], i) => (
          <li key={id} className="flex gap-3">
            <span className="text-[color:var(--muted-ink)] w-5 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <a href={`#${id}`} className="hover:text-[color:var(--brand)]">
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

const ERROR_ROWS: { name: string; score: number }[] = [
  { name: "Dose errors", score: 95 },
  { name: "Unit errors (mg vs mcg)", score: 90 },
  { name: "Negation drops", score: 88 },
  { name: "Laterality errors (left/right)", score: 85 },
  { name: "Sound-alike drug names", score: 82 },
  { name: "Word boundary errors", score: 40 },
  { name: "General vocabulary errors", score: 25 },
];

const THREAT_ROWS: [string, string][] = [
  ["Vendor cloud compromise", "No vendor cloud exists in the data path"],
  ["Stored patient audio theft", "Zero audio retention — nothing to steal"],
  ["Transport interception", "Mutual TLS inside a private VPN"],
  ["Silent record tampering", "Write-once audit storage with object locking"],
  ["Model supply-chain drift", "Hash-pinned weights, cryptographically verified"],
  ["Per-seat cost scaling", "Infrastructure model — marginal cost of next user is zero"],
];

const PRICING_ROWS: [string, string, string][] = [
  ["Pricing model", "Per seat / per month", "Infrastructure compute (you control)"],
  ["Cost as you scale", "Increases with every new clinician", "Marginal cost of next user: ~$0"],
  ["Audio data location", "Vendor data centers", "Your VPC only"],
  ["Outage risk", "Shared across all vendor customers", "Isolated to your own environment"],
  ["Update schedule", "Vendor-controlled", "Your change management process"],
  ["Tuning", "Global average", "Per-hospital formulary & case mix"],
];

const PIPELINE_STEPS: { title: string; body: string }[] = [
  {
    title: "Clinician Speaks",
    body: "Push-to-talk with voice activity detection. Microphone open only when deliberately activated.",
  },
  {
    title: "Pass 1 · Streaming Draft",
    body: "Fast speech model tuned for latency. Partial text appears at cursor within a fraction of a second.",
  },
  {
    title: "Pass 2 · Rescoring",
    body: "Larger background model corrects word boundaries, rare terminology, and numbers on completed utterances.",
  },
  {
    title: "Verification Layer",
    body: "Deterministic clinical checks: doses, units, laterality, negations validated against curated vocabularies.",
  },
  {
    title: "Commit or Hold",
    body: "High-confidence spans commit instantly. Flagged spans held for single-keystroke clinician review.",
  },
  {
    title: "Text at Cursor",
    body: "Lands directly in the EHR — including virtualized desktop environments. No round trip to external services.",
  },
];

const QUESTIONS = [
  "Where does the audio go, physically, and who holds root on those machines?",
  "How long is audio retained, and who can change it?",
  "Is patient data used to train or tune models, and is that contractual?",
  "What happened to customers during your last significant outage or breach?",
  "Which checks run on drug names, doses, and units before text enters the chart?",
  "Can our security team inspect the running system — not a diagram of it?",
];

const ARCH_CARDS: { title: string; body: string }[] = [
  {
    title: "Deployed Inside Your Own Cloud",
    body: "Your VPC. Your subnets. No internet gateway in the audio path. Traffic moves over site-to-site VPN with mutual TLS. There is no MayScribe cloud in the path — PHI never transits infrastructure you don't control.",
  },
  {
    title: "Zero Audio Retention",
    body: "Audio streams into memory-backed buffers, is transcribed, and discarded when the session closes. No persistent storage. No retention setting to configure. An attacker who fully compromises the environment finds no archive of patient voice recordings, because none exists.",
  },
  {
    title: "Tamper-Proof Audit Trail",
    body: "Every session produces an append-only audit record: who dictated, when, into which system, what verification checks ran, which spans were flagged, and what the clinician did. Written with write-once object locking; cannot be silently altered, even by an administrator.",
  },
  {
    title: "Hash-Pinned Model Integrity",
    body: "Speech and verification models are self-hosted with hash-pinned weights. No external network calls at inference time. The artifacts running in production are cryptographically the artifacts that were reviewed and approved.",
  },
];

function WhitepaperPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <main className="min-h-screen bg-white">
      <TopBar onBookDemo={() => setDemoOpen(true)} />

      {/* HERO */}
      <section style={{ background: "var(--hero)" }} className="pt-12 md:pt-14 pb-14 md:pb-16">
        <div className="max-w-[880px] mx-auto px-6 lg:px-10">
          <Kicker>Whitepaper (Preview) · July 2026</Kicker>
          <h1
            className="mt-4 text-[40px] md:text-[60px] font-bold tracking-[-0.02em] leading-[1.05] text-[color:var(--ink)]"
            style={{ fontFamily: "'Inter', serif" }}
          >
            Clinical Dictation, Without the Vendor Risk
          </h1>
          <p className="mt-6 text-[17px] md:text-[19px] leading-[1.55] text-[color:var(--ink-2)] max-w-[720px]">
            Security, compliance, and real-time performance in hospital speech recognition. And why the
            safest place to run it is inside your own network.
          </p>
          <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-3">
            <FeatureTile
              title="Zero Audio Retention"
              body="No patient audio ever leaves your infrastructure."
            />
            <FeatureTile
              title="Self-Hosted in Your VPC"
              body="Fully deployed within your own private network."
            />
            <FeatureTile
              title="Deterministic Clinical Verification"
              body="Auditable, reproducible outputs for compliance."
            />
          </div>
          <div className="mt-10 h-px" style={{ background: "var(--border-hair)" }} />
          <p className="mt-4 text-[13px] italic text-[color:var(--muted-ink)]">
            Prepared for: Hospital IT, Compliance, and Clinical Informatics Leadership.
          </p>
        </div>
      </section>

      {/* BODY GRID */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TOC />
          </div>
        </aside>

        <article>
          {/* Overview */}
          <section id="overview">
            <Kicker>Overview</Kicker>
            <H2 id="overview-title">The Case for Keeping Dictation Inside Your Own Walls</H2>
            <P>
              Hospitals have spent two decades buying dictation software that lives in someone else's
              cloud. The costs are now well documented: patient audio accumulates in vendor data centers,
              transcription errors cluster around the exact things that hurt patients (drug names, doses,
              units), and when the vendor has an outage or breach, every hospital on the platform goes
              down with it.
            </P>
            <P>
              MayScribe takes a different position. Clinical dictation is infrastructure, and
              infrastructure that touches protected health information belongs inside the hospital's own
              security boundary. MayScribe is a <strong>self-hosted</strong>, real-time medical dictation
              system that runs entirely within the customer's cloud environment, on GPU instances the
              customer controls. Audio is processed in memory and discarded when the session ends.{" "}
              <strong>Nothing is retained.</strong>
            </P>
            <blockquote
              className="mt-8 rounded-[10px] p-5 md:p-6 text-[15px] leading-[1.65] text-[color:var(--ink)]"
              style={{ background: "var(--hero)", borderLeft: "3px solid var(--brand)" }}
            >
              "Between the speech model and the medical record sits a deterministic verification layer
              that checks doses, units, laterality, and sound-alike drug names against curated clinical
              vocabularies before a single word is committed to the note."
            </blockquote>
          </section>

          <Divider />

          {/* Problem */}
          <section id="problem">
            <Kicker>The Problem</Kicker>
            <H2 id="problem-title">What Goes Wrong with Clinical Dictation Today</H2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatBlock
                value="96.3%"
                label="of unedited dictated notes contain at least one error"
                cite="JAMA Network Open, 2018"
              />
              <StatBlock
                value="30,000+"
                label="clinicians exposed to AI hallucination via Whisper-based tools"
                cite="AP, Oct 2024"
              />
              <StatBlock
                value="$7.42M"
                label="average healthcare data breach cost — highest of any industry, 14 years running"
                cite="IBM, 2025"
              />
            </div>

            <H3>Errors Are Frequent, and the Dangerous Ones Look Ordinary</H3>
            <P>
              A 2018 JAMA Network Open study of 217 notes found 7.4 errors per 100 words, with{" "}
              <strong>96.3% of unedited notes</strong> containing at least one error. About 1 in 6 errors
              involved clinical information. The Joint Commission documented cases like a spoken order for
              40 mg of Lasix captured as 400 mg.
            </P>

            <H3>Newer Models Fabricate Fluent Text</H3>
            <P>
              In October 2024, an AP investigation found OpenAI's Whisper model, used by 30,000+
              clinicians across ~40 health systems, <strong>fabricates text never spoken</strong>,
              including invented medical treatments. Academic research found hallucinated content
              clustering around pauses common in clinical conversation.
            </P>

            <H3>Cloud Concentration Creates Systemic Risk</H3>
            <P>
              The 2017 NotPetya attack took down Nuance Communications for weeks — $68M in lost revenue
              and $24M in remediation. IBM's 2025 report puts the average healthcare breach at $7.42M, the
              highest of any industry for 14 consecutive years.
            </P>
          </section>

          <Divider />

          {/* Architecture */}
          <section id="architecture">
            <Kicker>Security Architecture</Kicker>
            <H2 id="architecture-title">Security by Architecture, Not by Policy</H2>
            <P>
              Most vendor security stories are stacks of policy: we promise not to look, we promise to
              delete. MayScribe's position is that the strongest controls are structural — the system is
              built so the risky thing cannot happen, rather than promised not to.
            </P>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
              {ARCH_CARDS.map((c) => (
                <div
                  key={c.title}
                  className="rounded-[10px] p-5 bg-white"
                  style={{ border: "1px solid var(--border-default)" }}
                >
                  <div className="text-[15.5px] font-semibold text-[color:var(--ink)]">{c.title}</div>
                  <div className="mt-2 text-[13.5px] leading-[1.6] text-[color:var(--ink-2)]">
                    {c.body}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <div className="text-[13px] font-bold tracking-[0.14em] uppercase text-[color:var(--brand)]">
                Threat Model
              </div>
              <div className="mt-3 text-[15px] text-[color:var(--ink-2)]">
                What this architecture removes.
              </div>
              <div
                className="mt-4 rounded-[10px] overflow-hidden"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <table className="w-full text-[13.5px]">
                  <thead>
                    <tr style={{ background: "var(--hero)" }}>
                      <th className="text-left px-4 py-3 font-semibold text-[color:var(--ink)] w-[42%]">
                        Threat
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-[color:var(--ink)]">
                        How MayScribe eliminates it
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {THREAT_ROWS.map(([t, m], i) => (
                      <tr
                        key={t}
                        style={{
                          borderTop: "1px solid var(--border-hair)",
                          background: i % 2 ? "var(--row-bg)" : "#fff",
                        }}
                      >
                        <td className="px-4 py-3 text-[color:var(--ink)] font-medium">{t}</td>
                        <td className="px-4 py-3 text-[color:var(--ink-2)]">{m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <Divider />

          {/* Compliance */}
          <section id="compliance">
            <Kicker>Compliance</Kicker>
            <H2 id="compliance-title">A Compliance Posture Your Team Can Verify</H2>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className="rounded-[10px] p-5 bg-white"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <div className="text-[15.5px] font-semibold text-[color:var(--ink)]">
                  HIPAA Alignment Today
                </div>
                <P>
                  MayScribe maps cleanly onto HIPAA's Security Rule because the architecture was designed
                  with its categories in mind. Technical safeguards: mutual TLS over a private VPN, no
                  persistent audio at rest, role-based access, and unique authentication for every user
                  and service. Administrative safeguards: documented risk analysis, access review,
                  incident response, and workforce policies — available as living documents, not
                  summaries on a trust page. BAA chain is complete from clinician to hardware.
                </P>
              </div>
              <div
                className="rounded-[10px] p-5 bg-white"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <div className="text-[15.5px] font-semibold text-[color:var(--ink)]">SOC 2 Roadmap</div>
                <P>
                  No vendor can hand you a legitimate SOC 2 report on day one. MayScribe's controls are
                  designed, documented, and operating now, mapped to the Trust Services Criteria. An
                  independent SOC 2 examination is targeted within the first year of production
                  deployment. In the interim, MayScribe provides the control matrix, policies,
                  architecture documentation, and evidence samples under NDA.
                </P>
              </div>
            </div>

            <div className="mt-10">
              <div className="text-[13px] font-bold tracking-[0.14em] uppercase text-[color:var(--brand)]">
                6 Questions to Ask Any Dictation Vendor
              </div>
              <ol className="mt-4 space-y-2">
                {QUESTIONS.map((q, i) => (
                  <li key={q} className="flex gap-3 text-[14.5px] leading-[1.6] text-[color:var(--ink)]">
                    <span
                      className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[12px] font-bold shrink-0"
                      style={{
                        background: "var(--chip-blue-bg)",
                        border: "1px solid var(--chip-blue-border)",
                        color: "var(--brand)",
                      }}
                    >
                      {i + 1}
                    </span>
                    {q}
                  </li>
                ))}
              </ol>
              <div
                className="mt-5 rounded-[10px] p-4 text-[13.5px] leading-[1.6] text-[color:var(--ink)]"
                style={{ background: "var(--chip-blue-bg)", border: "1px solid var(--chip-blue-border)" }}
              >
                <span className="font-semibold">MayScribe's answers:</span> your VPC · zero retention ·
                never · not applicable by architecture · deterministic checks on every commit · yes.
              </div>
            </div>
          </section>

          <Divider />

          {/* Performance */}
          <section id="performance">
            <Kicker>Performance</Kicker>
            <H2 id="performance-title">Real-Time Engineering Without Shortcuts</H2>
            <P>
              Clinicians abandon dictation tools that make them wait. The engineering problem is that the
              two things hospitals want — immediate text and verified text — pull in opposite directions.
              MayScribe resolves the tension with a two-pass design instead of a compromise.
            </P>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatBlock
                value="~0.4s"
                label="Median latency from end of speech to committed text at cursor"
                cite="Design target"
              />
              <StatBlock
                value="2-Pass"
                label="Streaming draft + background rescoring model running in tandem"
                cite="Architecture"
              />
              <StatBlock
                value="0 Retention"
                label="Entire pipeline runs in memory on GPU hosts inside your VPC"
                cite="Deployment"
              />
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
              {PIPELINE_STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className="rounded-[10px] p-5 bg-white"
                  style={{ border: "1px solid var(--border-default)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-[6px]"
                      style={{
                        background: "var(--chip-blue-bg)",
                        border: "1px solid var(--chip-blue-border)",
                        color: "var(--brand)",
                      }}
                    >
                      STEP {i + 1}
                    </span>
                    <div className="text-[15px] font-semibold text-[color:var(--ink)]">{s.title}</div>
                  </div>
                  <div className="mt-2 text-[13.5px] leading-[1.6] text-[color:var(--ink-2)]">
                    {s.body}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Accuracy */}
          <section id="accuracy">
            <Kicker>Clinical Accuracy</Kicker>
            <H2 id="accuracy-title">Accuracy Is a System Property, Not a Model Score</H2>
            <P>
              The errors that matter clinically are concentrated in a handful of token types, and the
              newest models add fluent fabrication to the list. A credible accuracy story has to be about
              the system around the model, not the model alone.
            </P>

            <H3>A Clinical Lexicon Underneath Everything</H3>
            <P>
              Verification runs against RxNorm, SNOMED CT, ICD-10-CM, and LOINC, together with the ISMP
              list of look-alike, sound-alike drug pairs. When a clinician says a drug name, the system
              resolves the utterance against a formulary-aware vocabulary — not pattern-matching
              syllables. Sound-alike pairs trigger review rather than silent commitment.
            </P>

            <H3>Deterministic Checks Between Model and Chart</H3>
            <P>
              Before any text is committed, a rule layer validates doses against plausible ranges,
              normalizes units deterministically (a spoken milligram cannot silently become a microgram),
              flags unsupported laterality terms, and tracks negations so a dropped word cannot reverse a
              clinical statement. These checks are rules, not model opinions. They behave the same way
              every time.
            </P>

            <H3>Human Judgment Spent Where Risk Actually Is</H3>
            <P>
              Clean, high-confidence dictation commits automatically. Roughly one span in every few dozen
              — doses, units, sided terms, negations the system is unsure about — is held for the
              clinician with alternatives ready for single-keystroke resolution. The machine handles the
              volume; human attention is reserved for the spans that carry real risk.
            </P>

            <div className="mt-10">
              <div className="text-[13px] font-bold tracking-[0.14em] uppercase text-[color:var(--brand)]">
                Error Categories MayScribe Targets
              </div>
              <div className="mt-3 text-[13px] text-[color:var(--ink-2)]">
                Relative clinical risk score (0–100).
              </div>
              <div
                className="mt-4 rounded-[10px] p-5 bg-white"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <ul className="space-y-3">
                  {ERROR_ROWS.map((r) => (
                    <li key={r.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                      <div>
                        <div className="text-[13.5px] font-medium text-[color:var(--ink)]">{r.name}</div>
                        <div
                          className="mt-1.5 h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--chip-blue-bg)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${r.score}%`,
                              background:
                                r.score >= 80
                                  ? "linear-gradient(90deg,#0B5DFF,#0FD1D6)"
                                  : "var(--brand)",
                              opacity: r.score >= 80 ? 1 : 0.5,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-[13px] font-bold text-[color:var(--ink)] tabular-nums w-10 text-right">
                        {r.score}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-[13.5px] leading-[1.6] text-[color:var(--ink-2)]">
                High-risk error categories — doses, units, negations, laterality, and sound-alike drug
                names — all score above 80. MayScribe's deterministic rule layer and clinical lexicon are
                purpose-built to intercept precisely these categories before any text reaches the chart.
              </p>
            </div>
          </section>

          <Divider />

          {/* Pricing */}
          <section id="pricing">
            <Kicker>Pricing & Scale</Kicker>
            <H2 id="pricing-title">Scaling on the Hospital's Terms</H2>
            <P>
              Cloud dictation is priced per seat per month, meaning the cost scales with exactly the thing
              a hospital wants to grow: the number of clinicians using it. Self-hosting inverts the model.
            </P>

            <H3>Infrastructure Pricing, Not Per-Seat Licensing</H3>
            <P>
              MayScribe runs as containerized inference services on a small number of GPU instances
              inside the hospital's cloud account. The design target for a community hospital's full
              dictation load is two GPU nodes, with capacity added by adding nodes, not by renegotiating
              licenses. The hospital pays its cloud provider for compute it controls, and the marginal
              cost of the next physician who starts dictating is effectively zero.
            </P>

            <H3>Tuned to Your Hospital, Not a Global Average</H3>
            <P>
              Because the system is deployed per customer, tuning is per customer too: the formulary in
              the lexicon is the hospital's formulary, the specialty vocabulary reflects the hospital's
              case mix, and performance is measured against that hospital's real acoustic conditions.
            </P>

            <H3>Availability That Doesn't Depend on Anyone Else</H3>
            <P>
              A hospital running MayScribe is not sharing fate with a thousand other customers on a
              vendor's platform. Its dictation capacity is its own infrastructure, inside its own disaster
              recovery posture. An incident elsewhere in the world does not reach it. Updates ship as
              versioned, hash-pinned artifacts the hospital applies on its own schedule, through the same
              change-management process it uses for any clinical system.
            </P>

            <div
              className="mt-10 rounded-[10px] overflow-hidden"
              style={{ border: "1px solid var(--border-default)" }}
            >
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr style={{ background: "var(--hero)" }}>
                    <th className="text-left px-4 py-3 font-semibold text-[color:var(--ink)]">
                      Dimension
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[color:var(--ink)]">
                      Cloud dictation (typical)
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[color:var(--ink)]">
                      MayScribe (self-hosted)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING_ROWS.map(([d, c, m], i) => (
                    <tr
                      key={d}
                      style={{
                        borderTop: "1px solid var(--border-hair)",
                        background: i % 2 ? "var(--row-bg)" : "#fff",
                      }}
                    >
                      <td className="px-4 py-3 text-[color:var(--ink)] font-medium">{d}</td>
                      <td className="px-4 py-3 text-[color:var(--ink-2)]">{c}</td>
                      <td className="px-4 py-3 text-[color:var(--ink)]">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Divider />

          {/* Closing */}
          <section id="closing">
            <H2 id="closing-title">Built to Be Audited. Designed to Be Trusted.</H2>
            <P>
              Hospitals evaluating dictation vendors do not need to take any of this on faith. The
              architecture is inspectable in your own environment, and the roadmap to independent
              attestation is stated in plain terms. That is what it looks like when a vendor expects to be
              audited — and builds accordingly.
            </P>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                className="rounded-[10px] p-5"
                style={{ background: "var(--hero)", border: "1px solid var(--border-hair)" }}
              >
                <div className="text-[15px] font-semibold text-[color:var(--ink)]">
                  Security Whitepaper
                </div>
                <div className="mt-2 text-[13px] leading-[1.55] text-[color:var(--ink-2)]">
                  Available under NDA to hospital security and compliance teams.
                </div>
              </div>
              <div
                className="rounded-[10px] p-5"
                style={{ background: "var(--hero)", border: "1px solid var(--border-hair)" }}
              >
                <div className="text-[15px] font-semibold text-[color:var(--ink)]">
                  Control Matrix & Architecture Review
                </div>
                <div className="mt-2 text-[13px] leading-[1.55] text-[color:var(--ink-2)]">
                  Full documentation provided to your risk team before contract.
                </div>
              </div>
              <div
                className="rounded-[10px] p-5"
                style={{ background: "var(--hero)", border: "1px solid var(--border-hair)" }}
              >
                <div className="text-[15px] font-semibold text-[color:var(--ink)]">
                  Pilot Validation
                </div>
                <div className="mt-2 text-[13px] leading-[1.55] text-[color:var(--ink-2)]">
                  Design-target figures validated per deployment during pilot.
                </div>
              </div>
            </div>

            <p className="mt-8 text-[13px] italic leading-[1.6] text-[color:var(--muted-ink)]">
              MayScribe provides a security whitepaper, control matrix, and architecture review under NDA
              to hospital security and compliance teams. Design-target figures cited in this document are
              validated per deployment during pilot.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[8px] text-[14px] font-semibold text-white bg-gradient-brand shadow-btn"
              >
                Book a demo <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={PDF_URL}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[8px] text-[14px] font-semibold text-[color:var(--ink)] bg-white"
                style={{ border: "1px solid var(--border-strong)" }}
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </div>
          </section>
        </article>
      </div>

      <BookDemoDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </main>
  );
}
