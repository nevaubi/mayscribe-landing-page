import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Server, Lock, ArrowRight, Pause, Square, Flag } from "lucide-react";
import { BookDemoDialog } from "@/components/BookDemoDialog";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0B5DFF" />
          <stop offset="100%" stopColor="#0FD1D6" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 5 6v9c0 6.6 4.6 12.6 11 15 6.4-2.4 11-8.4 11-15V6L16 2.5Z"
        fill="url(#lg)"
      />
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

function NavLink({ children }: { children: React.ReactNode }) {
  return (
    <a href="#" className="text-[14px] font-medium text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
      {children}
    </a>
  );
}

function GradientButton({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-brand text-white shadow-btn rounded-[8px] px-4 h-10 text-[14px] font-semibold inline-flex items-center gap-1.5 ${className}`}
    >
      {children}
    </button>
  );
}

function Nav({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <header className="w-full">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-[60px] md:h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="text-[22px] font-bold text-[color:var(--ink)] tracking-tight">MayScribe</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <NavLink>Product</NavLink>
          <NavLink>Workflow</NavLink>
          <NavLink>Security</NavLink>
          <NavLink>Integrations</NavLink>
        </nav>
        <div className="flex items-center gap-5">
          <GradientButton onClick={onBookDemo}>
            Book a demo <ArrowRight className="h-4 w-4" />
          </GradientButton>
        </div>
      </div>
    </header>
  );
}

function AmberChip({ children, inline = false }: { children: React.ReactNode; inline?: boolean }) {
  return (
    <span
      className={`${inline ? "inline-flex" : "flex"} items-center gap-2 rounded-[6px] border px-2.5 py-1 text-[13px] font-semibold`}
      style={{
        background: "var(--chip-amber-bg)",
        borderColor: "var(--chip-amber-border)",
        color: "var(--chip-amber-text)",
      }}
    >
      {children}
    </span>
  );
}

function WorkspaceCard() {
  return (
    <div
      className="relative bg-white rounded-[12px] shadow-card w-full"
      style={{ border: "1px solid var(--border-default)" }}
    >
      <div className="p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-[color:var(--brand)]">EHR WORKSPACE</div>
            <div className="mt-1 text-[18px] font-semibold text-[color:var(--ink)]">Patient note review</div>
          </div>
          <div
            className="rounded-[8px] px-3 py-2 text-[13px] font-semibold text-[color:var(--ink)]"
            style={{ background: "var(--hero)", border: "1px solid var(--border-hair)" }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold text-[color:var(--brand)]"
                style={{ background: "var(--chip-blue-bg)" }}
              >
                JH
              </span>
              Jane H. · MRN 12345678
            </span>
          </div>
        </div>

        <div className="my-5 h-px" style={{ background: "var(--border-hair)" }} />

        <div className="flex flex-wrap gap-2">
          {[
            { label: "Normal", active: false },
            { label: "HPI", active: true },
            { label: "Assessment", active: false },
            { label: "Plan", active: false },
          ].map((t) => (
            <span
              key={t.label}
              className="text-[13px] font-semibold rounded-[8px] px-3 py-1.5"
              style={
                t.active
                  ? { background: "var(--chip-blue-bg)", border: "1px solid var(--chip-blue-border)", color: "var(--brand)" }
                  : { background: "#fff", border: "1px solid var(--border-hair)", color: "var(--ink-2)" }
              }
            >
              {t.label}
            </span>
          ))}
        </div>

        <div className="mt-6 text-[12px] font-bold tracking-[0.14em] text-[color:var(--brand)]">HPI</div>
        <p className="mt-2 text-[14px] leading-[1.7] text-[#0B1F52]">
          Patient is a 52-year-old female who presents for follow-up of{" "}
          <AmberChip inline>hypertension</AmberChip> and <AmberChip inline>type 2 diabetes mellitus</AmberChip>. She
          reports medication adherence and denies chest pain.
        </p>

        <div className="mt-6 text-[12px] font-bold tracking-[0.14em] text-[color:var(--brand)]">ASSESSMENT</div>
        <div className="mt-2 space-y-2">
          {[
            "Hypertension, essential",
            "Type 2 diabetes without complication",
            "Hyperlipidemia, unspecified",
          ].map((t, i) => (
            <AmberChip key={t}>
              <span
                className="inline-flex items-center justify-center h-5 w-5 rounded-full text-[11px] font-bold"
                style={{ background: "#fff", color: "var(--chip-amber-badge)", border: "1px solid var(--chip-amber-border)" }}
              >
                {i + 1}
              </span>
              {t}
            </AmberChip>
          ))}
        </div>

        <div className="mt-6 text-[12px] font-bold tracking-[0.14em] text-[color:var(--brand)]">PLAN</div>
        <ul className="mt-2 space-y-1.5 text-[14px] text-[#0B1F52] list-disc pl-5">
          <li>Continue current medications</li>
          <li>Lifestyle modifications discussed</li>
          <li>Follow up in 3 months</li>
        </ul>

        <div className="mt-6 flex justify-end">
          <button className="bg-[color:var(--brand-deep)] text-white rounded-[8px] px-4 h-10 text-[14px] font-semibold inline-flex items-center gap-1.5 shadow-btn">
            Accept <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingDictation() {
  const bars = Array.from({ length: 24 }, (_, i) => {
    const heights = [24, 38, 56, 30, 46, 62, 34, 28, 50, 44, 58, 36, 26, 52, 42, 60, 32, 40, 54, 28, 46, 38, 50, 30];
    return { h: heights[i], d: (i % 8) * 0.09 };
  });
  return (
    <div
      className="bg-white rounded-[12px] shadow-card p-4 w-[260px]"
      style={{ border: "1px solid var(--border-strong)" }}
    >
      <div className="flex items-center gap-2">
        <Logo size={22} />
        <span className="text-[15px] font-bold text-[color:var(--ink)]">MayScribe</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{ background: "var(--chip-green-bg)", border: "1px solid var(--chip-green-border)", color: "var(--chip-green-text)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--chip-green-text)]" />
          Listening
        </span>
        <span className="text-[12px] font-semibold text-[color:var(--ink-2)] tabular-nums">00:28</span>
      </div>
      <div className="mt-3 h-[72px] flex items-center justify-between gap-[3px]">
        {bars.map((b, i) => (
          <span
            key={i}
            className="wave-bar bg-gradient-brand rounded-[2.5px]"
            style={{ width: 5, height: b.h, animationDelay: `${b.d}s` }}
          />
        ))}
      </div>
      <div
        className="mt-3 w-full rounded-[8px] px-3 py-2 text-[12.5px] font-semibold text-[color:var(--ink-2)]"
        style={{ background: "var(--hero)", border: "1px solid var(--border-hair)" }}
      >
        Auto-detecting specialty
      </div>
      <div className="mt-3 flex items-center gap-2">
        {[Pause, Square, Flag].map((Icon, i) => (
          <button
            key={i}
            className="h-8 w-8 rounded-[8px] inline-flex items-center justify-center"
            style={{ background: "var(--chip-blue-bg)", border: "1px solid var(--chip-blue-border)" }}
          >
            <Icon className="h-4 w-4 text-[color:var(--brand)]" strokeWidth={2.2} />
          </button>
        ))}
      </div>
      <div
        className="mt-3 w-full rounded-[8px] px-3 py-2 text-[12.5px] font-semibold text-center"
        style={{ background: "var(--chip-green-bg)", border: "1px solid var(--chip-green-border)", color: "var(--chip-green-text)" }}
      >
        Secure connection
      </div>
    </div>
  );
}

function SuggestedMeds() {
  const meds = ["Lisinopril 10 mg daily", "Metformin 500 mg BID", "Atorvastatin 20 mg daily"];
  return (
    <div
      className="bg-white rounded-[10px] shadow-card p-4 w-[232px]"
      style={{ border: "1px solid var(--border-strong)" }}
    >
      <div className="text-[14px] font-semibold text-[color:var(--ink)]">Suggested medications</div>
      <div className="mt-3 space-y-2">
        {meds.map((m) => (
          <div
            key={m}
            className="flex items-center justify-between rounded-[6px] px-2.5 py-2 text-[12px] font-semibold text-[#0B1F52]"
            style={{ background: "var(--row-bg)", border: "1px solid var(--row-border)" }}
          >
            <span>{m}</span>
            <a className="text-[color:var(--brand)] text-[12px] font-semibold" href="#">
              Add
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--hero)" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[560px] w-[560px] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(15,209,214,0.35), rgba(11,93,255,0.10) 55%, transparent 75%)",
        }}
      />
      <Nav />
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pb-14 pt-4 lg:pb-24 lg:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <h1 className="text-[38px] sm:text-[56px] lg:text-[64px] font-bold leading-[1.08] lg:leading-[1.05] tracking-[-0.02em] text-[color:var(--ink)]">
              Clinical
              <br />
              documentation.
              <br />
              <span style={{ color: "#3D5CA1" }}>Done right.</span>
            </h1>
            <p className="mt-5 lg:mt-6 max-w-[540px] text-[15.5px] lg:text-[18px] leading-[24px] lg:leading-[28px] text-[color:var(--ink-2)]">
              A clinician-controlled dictation experience with confidence-aware review, medication intelligence, and
              fast insertion into the existing note workflow.
            </p>
            <div className="mt-7 lg:mt-8 flex flex-wrap gap-3">
              <button
                className="bg-white rounded-[8px] h-11 lg:h-12 px-5 text-[14.5px] lg:text-[15px] font-semibold text-[color:var(--ink)] inline-flex items-center gap-2 flex-1 sm:flex-none justify-center"
                style={{ border: "1px solid var(--border-strong)" }}
              >
                Book a demo <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-8 lg:mt-10 flex flex-wrap gap-x-6 lg:gap-x-10 gap-y-2 lg:gap-y-3 text-[14px] lg:text-[16px] font-semibold text-[color:var(--ink-2)]">
              <span>HIPAA-aligned</span>
              <span>Secure by design</span>
              <span>No default retention</span>
            </div>
          </div>

          <div className="hidden md:block lg:col-span-7">
            <div className="relative lg:mb-[-160px]">
              <div className="relative w-full lg:scale-[0.75] lg:origin-top">
                <WorkspaceCard />
                {/* Floating dictation - overlaps left edge */}
                <div className="absolute -left-6 top-32 z-10">
                  <FloatingDictation />
                </div>
                {/* Suggested meds - overlaps bottom right */}
                <div className="absolute -right-4 bottom-20 z-10">
                  <SuggestedMeds />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Compliance() {
  const cards = [
    {
      stage: "NOW",
      title: "HIPAA-aligned, BAA-ready",
      body:
        "Administrative, technical, and physical safeguards mapped to the Security Rule. Business associate agreements executed with your organization and AWS.",
    },
    {
      stage: "PLANNED",
      title: "SOC 1 and SOC 2 Type II",
      body:
        "Operating-effectiveness audits over a full observation window follow Type I, covering both financial and security control objectives.",
    },
  ];
  return (
    <section style={{ background: "var(--hero)" }} className="py-12 md:py-[76px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center">
          <div className="text-[12px] font-bold tracking-[0.16em] text-[color:var(--brand)]">COMPLIANCE</div>
          <h2 className="mt-3 text-[26px] md:text-[32px] font-bold text-[color:var(--ink)] tracking-[-0.01em]">
            A clear path to HIPAA, SOC 1, and SOC 2
          </h2>
          <p className="mt-4 mx-auto max-w-[660px] text-[14.5px] md:text-[15.5px] leading-[1.6] text-[color:var(--ink-2)]">
            MayScribe ships HIPAA-aligned and BAA-ready. Independent attestations are scoped and staged, and every
            control is inspectable in your own environment along the way.
          </p>
        </div>
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[820px] mx-auto">
          {cards.map((c) => (
            <div
              key={c.stage}
              className="bg-white rounded-[10px] p-5 md:p-6"
              style={{ border: "1px solid var(--border-default)" }}
            >
              <div className="text-[12px] font-bold tracking-[0.14em] text-[color:var(--brand)]">{c.stage}</div>
              <div className="mt-1.5 text-[16px] font-semibold text-[color:var(--ink)]">{c.title}</div>
              <p className="mt-3 text-[13.5px] leading-[1.55] text-[color:var(--ink-2)]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    {
      Icon: ShieldCheck,
      title: "Zero audio retention",
      body:
        "Dictation is processed in memory and discarded at session end. There is no stored audio to leak, subpoena, or breach.",
    },
    {
      Icon: Server,
      title: "Runs in your VPC",
      body:
        "Models, GPUs, and audit logs live inside infrastructure your hospital controls. PHI never crosses a vendor cloud.",
    },
    {
      Icon: Lock,
      title: "Encrypted end to end",
      body:
        "mTLS 1.3 in transit over a private VPN path; append-only, WORM-locked audit records at rest.",
    },
  ];
  return (
    <section className="py-12 md:py-[76px] bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center">
          <div className="text-[12px] font-bold tracking-[0.16em] text-[color:var(--brand)]">DATA SECURITY</div>
          <h2 className="mt-3 text-[26px] md:text-[32px] font-bold text-[color:var(--ink)] tracking-[-0.01em]">
            Nothing stored means nothing to breach
          </h2>
          <p className="mt-4 mx-auto max-w-[660px] text-[14.5px] md:text-[15.5px] leading-[1.6] text-[color:var(--ink-2)]">
            The strongest security posture is not holding the data at all. MayScribe processes audio in memory, verifies
            deterministically, and keeps PHI inside infrastructure you control.
          </p>
        </div>
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(({ Icon, title, body }) => (
            <div key={title} className="bg-white rounded-[10px] p-5 md:p-6" style={{ border: "1px solid var(--border-default)" }}>
              <div
                className="h-9 w-9 rounded-[8px] inline-flex items-center justify-center"
                style={{ background: "var(--chip-blue-bg)", border: "1px solid var(--chip-blue-border)" }}
              >
                <Icon className="h-[18px] w-[18px] text-[color:var(--brand)]" strokeWidth={2.2} />
              </div>
              <div className="mt-5 text-[16.5px] font-semibold text-[color:var(--ink)]">{title}</div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-[color:var(--ink-2)]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section style={{ background: "var(--dark)" }} className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
        <div className="max-w-[560px]">
          <h3 className="text-[22px] md:text-[26px] font-bold text-white leading-tight tracking-[-0.01em]">Bring your compliance team.</h3>
          <p className="mt-3 text-[13.5px] md:text-[14px] leading-[1.6] max-w-[520px]" style={{ color: "var(--dark-body)" }}>
            We built the audit trail, the BAA package, and the control documentation for exactly this review.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            className="text-white rounded-[8px] h-11 px-5 text-[14px] font-semibold w-full sm:w-auto"
            style={{ border: "1px solid var(--dark-border)", background: "transparent" }}
          >
            Request the whitepaper
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white" style={{ borderTop: "1px solid var(--border-hair)" }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-[16px] font-bold text-[color:var(--ink)]">MayScribe</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-6 text-[12.5px] font-medium text-[color:var(--ink-2)]">
            <a href="#">Product</a>
            <a href="#">Security</a>
            <a href="#">Compliance</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11.5px] text-[color:var(--muted-ink)]">
          <div>HIPAA-aligned · BAA-ready · SOC attestations on roadmap</div>
          <div>© 2026 MayScribe</div>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Compliance />
      <Security />
      <CtaBand />
      <Footer />
    </main>
  );
}
