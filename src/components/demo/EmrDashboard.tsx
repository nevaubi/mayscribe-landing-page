import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDictation, type DGWord } from "./useDictation";
import { DictationStrip } from "./DictationStrip";
import { verify, DEMO_ACTIVE_MEDS, type Span } from "./verify";
import { ReviewTray, type HoldEntry } from "./ReviewTray";
import { QuickLookup, type QuickLookupHandle } from "./QuickLookup";
import { dictationAssist } from "@/lib/dictation-assist.functions";
import {
  getStrengthsAndForms,
  checkDoseAgainstStrengths,
  searchRxTerms,
  type Strength,
} from "./lookupClient";
import {
  Search,
  Bell,
  ChevronDown,
  AlertTriangle,
  User,
  FileText,
  Activity,
  Pill,
  FlaskConical,
  ClipboardList,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Stethoscope,
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Weight,
  Save,
  Send,
  Plus,
  Lock,
  MessageSquare,
  TriangleAlert,
  ShieldAlert,
  Info,
  Printer,
  MoreHorizontal,
  LogOut,
  Settings,
  CalendarDays,
  ArrowUpDown,
} from "lucide-react";

const PATIENTS = [
  { id: 1, name: "Delray, John M.", mrn: "0847291", dob: "09/14/1957", age: 67, sex: "M", room: "4W-214", status: "active", flag: "critical" },
  { id: 2, name: "Okonkwo, Fatima A.", mrn: "0712844", dob: "03/22/1981", age: 45, sex: "F", room: "3E-108", status: "active", flag: "warning" },
  { id: 3, name: "Vasquez, Carlos R.", mrn: "0930571", dob: "11/05/1949", age: 76, sex: "M", room: "5W-301", status: "active", flag: null },
  { id: 4, name: "Kim, Soon-Yi", mrn: "0654832", dob: "07/19/1966", age: 59, sex: "F", room: "4E-117", status: "active", flag: "warning" },
  { id: 5, name: "Thornton, James L.", mrn: "1023487", dob: "05/30/1939", age: 87, sex: "M", room: "ICU-06", status: "active", flag: "critical" },
  { id: 6, name: "Abramowitz, Rachel", mrn: "0788340", dob: "02/08/1972", age: 54, sex: "F", room: "3W-204", status: "active", flag: null },
  { id: 7, name: "Nguyen, Minh T.", mrn: "0901234", dob: "12/17/1985", age: 40, sex: "M", room: "4W-219", status: "active", flag: null },
];

const PRIOR_NOTES = [
  {
    id: 1,
    type: "Progress Note",
    author: "Chen, Sarah L., MD",
    role: "Attending - Internal Medicine",
    date: "07/11/2026",
    time: "18:42",
    status: "signed",
    content: "Patient remains hemodynamically stable. BNP trending down from 2,840 to 1,920 pg/mL. Diuresis ongoing - net negative 1.2L over past 24h. Creatinine stable at 1.8 mg/dL. Ambulated x2 with PT today, tolerated well. Continue current diuretic regimen. Will reassess fluid status AM rounds.",
    diagnoses: ["HFrEF (EF 30%)", "AKI on CKD Stage 3"],
  },
  {
    id: 2,
    type: "Cardiology Consult",
    author: "Patel, Arjun V., MD",
    role: "Cardiology - Consulting",
    date: "07/10/2026",
    time: "14:17",
    status: "signed",
    content: "Thank you for the consult. 67M with known HFrEF (LVEF 30% on last TTE 3/2026) presenting with NYHA Class III–IV symptoms x 5 days. Echo today confirms LVEF 28%, no new WMA, moderate MR. Recommend: uptitrate carvedilol to 12.5mg BID pending HR/BP tolerance, IV furosemide 80mg BID, low-sodium diet strict adherence education. Would not recommend ICD upgrade at this time given active decompensation.",
    diagnoses: ["HFrEF - decompensated", "Moderate MR"],
  },
  {
    id: 3,
    type: "Nursing Assessment",
    author: "Torres, Maria A., RN",
    role: "RN - 4W",
    date: "07/12/2026",
    time: "07:15",
    status: "signed",
    content: "0700 assessment: Pt A&Ox3, cooperative, no acute distress. Denies chest pain. Mild dyspnea at rest, SpO2 96% on 2L NC. Bilateral pitting edema 2+ ankles. Foley in place - UO 45ml/hr overnight. IV site patent. Meals: consumed 60% breakfast. Weights obtained: 187 lbs (down 2.4 lbs from yesterday).",
    diagnoses: [],
  },
];

const ACTIVE_PROBLEMS = [
  { dx: "Heart Failure, Reduced EF (HFrEF)", icd: "I50.20", onset: "03/2019", severity: "chronic-active" },
  { dx: "Type 2 Diabetes Mellitus", icd: "E11.9", onset: "08/2012", severity: "chronic-active" },
  { dx: "Hypertension", icd: "I10", onset: "2009", severity: "chronic-active" },
  { dx: "CKD Stage 3b", icd: "N18.32", onset: "01/2022", severity: "chronic-active" },
  { dx: "Acute Decompensated HF", icd: "I50.21", onset: "07/08/2026", severity: "acute" },
  { dx: "Moderate Mitral Regurgitation", icd: "I34.0", onset: "03/2026", severity: "chronic-active" },
];

const MEDS = [
  { name: "Furosemide", dose: "80 mg IV", freq: "BID", route: "IV", status: "active" },
  { name: "Carvedilol", dose: "6.25 mg", freq: "BID", route: "PO", status: "active" },
  { name: "Lisinopril", dose: "10 mg", freq: "Daily", route: "PO", status: "hold" },
  { name: "Spironolactone", dose: "25 mg", freq: "Daily", route: "PO", status: "active" },
  { name: "Metformin", dose: "1000 mg", freq: "BID", route: "PO", status: "hold" },
  { name: "Atorvastatin", dose: "40 mg", freq: "QHS", route: "PO", status: "active" },
  { name: "Aspirin", dose: "81 mg", freq: "Daily", route: "PO", status: "active" },
  { name: "Insulin Glargine", dose: "18 units", freq: "QHS", route: "SQ", status: "active" },
];

const VITALS = [
  { label: "BP", value: "142 / 88", unit: "mmHg", icon: HeartPulse, trend: "up", alert: true },
  { label: "HR", value: "76", unit: "bpm", icon: Activity, trend: "stable", alert: false },
  { label: "SpO₂", value: "96", unit: "%", icon: Droplets, trend: "stable", alert: false },
  { label: "RR", value: "18", unit: "/min", icon: Wind, trend: "stable", alert: false },
  { label: "Temp", value: "98.4", unit: "°F", icon: Thermometer, trend: "stable", alert: false },
  { label: "Weight", value: "187", unit: "lbs", icon: Weight, trend: "down", alert: false },
];

const TABS = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "vitals", label: "Vitals", icon: Activity },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "orders", label: "Orders", icon: ClipboardList },
];

type SoapSection = "subjective" | "objective" | "assessment" | "plan";

const SOAP_DEFAULTS: Record<SoapSection, string> = {
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
};

// Deepgram dictation-mode -> clean, EMR-ready text.
// Preserves \n (spoken "new line" / "new paragraph") and normalizes clinical tokens.
function normalizeMedicalTokens(text: string): string {
  let t = text;
  const rules: [RegExp, string][] = [
    [/\bq\.?h\.?s\.?\b/gi, "QHS"],
    [/\bb\.?i\.?d\.?\b/gi, "BID"],
    [/\bt\.?i\.?d\.?\b/gi, "TID"],
    [/\bq\.?i\.?d\.?\b/gi, "QID"],
    [/\bprn\b/gi, "PRN"],
    [/\bpo\b/gi, "PO"],
    [/\biv\b/gi, "IV"],
  ];
  for (const [re, r] of rules) t = t.replace(re, r);
  const unitMap: Record<string, string> = {
    milligram: "mg", milligrams: "mg", mg: "mg",
    microgram: "mcg", micrograms: "mcg", mcg: "mcg",
    gram: "g", grams: "g", g: "g",
    milliliter: "mL", milliliters: "mL", ml: "mL",
    unit: "units", units: "units",
  };
  t = t.replace(
    /(\d+(?:\.\d+)?)\s*(milligrams?|mg|micrograms?|mcg|grams?|g|milliliters?|ml|units?)\b/gi,
    (_m, n, u) => `${n} ${unitMap[u.toLowerCase()] ?? u}`,
  );
  return t;
}

function formatDictationInsert(rawText: string, before: string): string {
  // 1. Collapse only spaces/tabs; preserve \n.
  let text = rawText.replace(/[ \t]+/g, " ");
  // 2. Trim leading/trailing spaces/tabs (not newlines).
  text = text.replace(/^[ \t]+|[ \t]+$/g, "");
  if (!text) return "";
  // 3. Spacing normalization.
  text = text.replace(/\s+([.,;:!?])/g, "$1");
  text = text.replace(/([.,;:!?])([A-Za-z0-9])/g, "$1 $2");
  // 4. Medical token normalization.
  text = normalizeMedicalTokens(text);
  // 5. Sentence casing.
  const shouldCap =
    before.length === 0 ||
    /\n\s*$/.test(before) ||
    /[.!?]\s*$/.test(before);
  if (shouldCap) {
    text = text.replace(/([a-z])/, (_c, ch: string) => ch.toUpperCase());
  }
  // 6. Leading space if joining onto existing text.
  const startsWithPunct = /^[,.;:!?)]/.test(text);
  const endsWithOpening = /[(\[{\s]$/.test(before);
  const needsLeadingSpace =
    before.length > 0 &&
    !/\s$/.test(before) &&
    !startsWithPunct &&
    !endsWithOpening;
  return (needsLeadingSpace ? " " : "") + text;
}

function StatusDot({ flag }: { flag: string | null }) {
  if (flag === "critical") return <span className="w-2 h-2 rounded-full bg-red-500 inline-block flex-shrink-0" />;
  if (flag === "warning") return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block flex-shrink-0" />;
  return <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block flex-shrink-0" />;
}

function VitalTrend({ trend }: { trend: string }) {
  if (trend === "up") return <span className="text-red-500 text-xs font-mono">↑</span>;
  if (trend === "down") return <span className="text-emerald-500 text-xs font-mono">↓</span>;
  return <span className="text-muted-foreground text-xs font-mono">→</span>;
}

export function EmrDashboard() {
  const [activePatient, setActivePatient] = useState(PATIENTS[0]);
  const [activeTab, setActiveTab] = useState("notes");
  const [soap, setSoap] = useState<Record<SoapSection, string>>(SOAP_DEFAULTS);
  const [activeSoapSection, setActiveSoapSection] =
    useState<SoapSection>("subjective");
  const [noteType, setNoteType] = useState("Progress Note");
  const [searchQuery, setSearchQuery] = useState("");
  const [interim, setInterim] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [lastCommitAt, setLastCommitAt] = useState<Date | null>(null);
  const [lastCommitText, setLastCommitText] = useState<string | null>(null);

  // Verification anchors — track holds and dismissed spans per section
  interface Anchor {
    id: string;
    section: SoapSection;
    start: number;
    end: number;
    span: Span;
    rawText: string;
    state: "hold" | "dismissed" | "resolved";
  }
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [activeHoldIndex, setActiveHoldIndex] = useState(0);
  const [verifyStats, setVerifyStats] = useState({ checked: 0, held: 0 });
  const [flashRange, setFlashRange] = useState<
    { section: SoapSection; start: number; end: number } | null
  >(null);
  const [signPulse, setSignPulse] = useState(false);
  const [showReview, setShowReview] = useState(true);

  const activeSectionRef = useRef<SoapSection>("subjective");
  activeSectionRef.current = activeSoapSection;
  const dictationTargetRef = useRef<SoapSection>("subjective");
  const caretRef = useRef<Record<SoapSection, number>>({
    subjective: 0,
    objective: 0,
    assessment: 0,
    plan: 0,
  });
  const textareaRefs = useRef<Record<SoapSection, HTMLTextAreaElement | null>>({
    subjective: null,
    objective: null,
    assessment: null,
    plan: null,
  });
  const soapRef = useRef(soap);
  soapRef.current = soap;
  const anchorsRef = useRef(anchors);
  anchorsRef.current = anchors;
  const prevSoapRef = useRef<Record<SoapSection, string>>(soap);
  const quickLookupRef = useRef<QuickLookupHandle>(null);

  const handleLookup = useCallback((q: string) => {
    quickLookupRef.current?.openWith(q);
  }, []);


  const syncCaretFromElement = useCallback((el: HTMLTextAreaElement) => {
    const section = el.dataset.soapSection as SoapSection | undefined;
    if (!section) return;
    activeSectionRef.current = section;
    setActiveSoapSection(section);
    caretRef.current[section] = el.selectionStart ?? el.value.length;
  }, []);

  const captureActiveCaret = useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLTextAreaElement && active.dataset.soapSection) {
      syncCaretFromElement(active);
      return;
    }

    const section = activeSectionRef.current;
    const el = textareaRefs.current[section];
    if (el) {
      caretRef.current[section] = el.selectionStart ?? el.value.length;
    }
  }, [syncCaretFromElement]);

  const openHolds = useMemo(
    () => anchors.filter((a) => a.state === "hold"),
    [anchors],
  );

  const holdEntries: HoldEntry[] = useMemo(
    () =>
      openHolds.map((a) => ({
        anchorId: a.id,
        section: a.section,
        span: a.span,
        start: a.start,
        end: a.end,
        rawText: a.rawText,
      })),
    [openHolds],
  );

  const commitFinal = useCallback(
    (text: string, words: DGWord[], meta: { speechFinal: boolean }) => {
      const section = dictationTargetRef.current || activeSectionRef.current;
      setInterim("");
      const current = soapRef.current[section] ?? "";
      const caret = Math.min(
        Math.max(0, caretRef.current[section] ?? current.length),
        current.length,
      );
      let before = current.slice(0, caret);
      const after = current.slice(caret);

      // Sentence-close prior committed text if utterance is finished
      let leadPrefix = "";
      if (meta.speechFinal && /[A-Za-z0-9]$/.test(before)) {
        leadPrefix = ".";
        before = before + leadPrefix;
      }

      const formatted = formatDictationInsert(text, before);
      if (!formatted) return;
      setLastCommitText(formatted);
      window.setTimeout(() => {
        setLastCommitText((current) => (current === formatted ? null : current));
      }, 900);

      const { spans, committedText, pendingRangeChecks, pendingRxTermsMedChecks } = verify(formatted, words);
      const insert = leadPrefix + committedText;
      const nextValue = before.slice(0, before.length - leadPrefix.length) + insert + after;

      // Build anchors for holds
      const insertOffset = caret; // where committedText starts in section (after leadPrefix)
      const holdSpans = spans.filter((s) => s.status === "hold");
      const newAnchors: Anchor[] = holdSpans.map((s) => ({
        id: s.id,
        section,
        // committedText has same length as formatted (placeholders replace 1:1)
        start: insertOffset + leadPrefix.length + s.start,
        end: insertOffset + leadPrefix.length + s.end,
        span: s,
        rawText: s.text,
        state: "hold",
      }));

      // Shift existing anchors past caret by insert length
      const shiftAmount = insert.length;
      const updatedAnchors = anchorsRef.current.map((a) =>
        a.section === section && a.start >= caret
          ? { ...a, start: a.start + shiftAmount, end: a.end + shiftAmount }
          : a,
      );

      const nextCaret = caret + insert.length;
      caretRef.current[section] = nextCaret;

      setSoap((prev) => ({ ...prev, [section]: nextValue }));
      prevSoapRef.current = { ...prevSoapRef.current, [section]: nextValue };
      setAnchors([...updatedAnchors, ...newAnchors]);
      setVerifyStats((s) => ({
        checked: s.checked + spans.length,
        held: s.held + holdSpans.length,
      }));

      // Range flash on committed (non-hold) portion
      setFlashRange({
        section,
        start: insertOffset + leadPrefix.length,
        end: insertOffset + leadPrefix.length + committedText.length,
      });
      setLastCommitAt(new Date());
      window.setTimeout(() => setFlashRange(null), 600);

      // Restore caret
      window.requestAnimationFrame(() => {
        const el = textareaRefs.current[section];
        if (el) {
          el.focus({ preventScroll: true });
          el.selectionStart = nextCaret;
          el.selectionEnd = nextCaret;
        }
      });

      // Async Gemini assist — may upgrade commits to holds within 2s
      const deterministicSpans = spans.map((s) => ({
        text: s.text,
        start: s.start,
        end: s.end,
        type: s.type,
        status: s.status,
        candidates: s.candidates,
        reason: s.reason,
      }));
      void dictationAssist({
        data: {
          transcript: formatted,
          spans: deterministicSpans,
          activeMeds: DEMO_ACTIVE_MEDS,
        },
      })
        .then((r) => {
          if (!r || !("ok" in r) || !r.ok) return;
          const result = r.result as {
            spans?: Array<{
              text: string;
              start: number;
              end: number;
              type: string;
              needsReview?: boolean;
              candidates?: string[];
              reason?: string;
            }>;
          };
          const gspans = result.spans ?? [];
          // Only apply new holds Gemini added inside its own window that aren't already held
          for (const g of gspans) {
            if (!g.needsReview) continue;
            const already = anchorsRef.current.some(
              (a) =>
                a.section === section &&
                a.start === insertOffset + leadPrefix.length + g.start &&
                a.end === insertOffset + leadPrefix.length + g.end,
            );
            if (already) continue;
            // Splice text back to placeholder
            const absStart = insertOffset + leadPrefix.length + g.start;
            const absEnd = insertOffset + leadPrefix.length + g.end;
            const sectionText = soapRef.current[section] ?? "";
            if (absEnd > sectionText.length) continue;
            const placeholder = "_".repeat(Math.max(1, absEnd - absStart));
            const nextText =
              sectionText.slice(0, absStart) + placeholder + sectionText.slice(absEnd);
            setSoap((prev) => ({ ...prev, [section]: nextText }));
            prevSoapRef.current = { ...prevSoapRef.current, [section]: nextText };
            const newSpan: Span = {
              id: `gem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              text: g.text,
              start: g.start,
              end: g.end,
              type: "med",
              status: "hold",
              candidates: g.candidates ?? [g.text],
              reason: g.reason ?? "Assist review",
              minConfidence: 1,
            };
            setAnchors((prev) => [
              ...prev,
              {
                id: newSpan.id,
                section,
                start: absStart,
                end: absEnd,
                span: newSpan,
                rawText: g.text,
                state: "hold",
              },
            ]);
            setVerifyStats((s) => ({ checked: s.checked, held: s.held + 1 }));
          }
        })
        .catch(() => {
          // 2s timeout or bad JSON — silent, deterministic result unchanged
        });

      // Async RxTerms STRENGTHS_AND_FORMS dose checks (add-only, 400ms budget).
      for (const pc of pendingRangeChecks) {
        void (async () => {
          const ctrl = new AbortController();
          const timer = window.setTimeout(() => ctrl.abort(), 400);
          try {
            const strengths = await getStrengthsAndForms(pc.medName, ctrl.signal);
            if (!strengths.length) return;
            const { ok, nearest } = checkDoseAgainstStrengths(
              pc.dose,
              pc.unit,
              strengths,
            );
            if (ok || !nearest.length) return;
            const absStart = insertOffset + leadPrefix.length + pc.doseStart;
            const absEnd = insertOffset + leadPrefix.length + pc.doseEnd;
            const already = anchorsRef.current.some(
              (a) => a.section === section && a.start === absStart && a.end === absEnd,
            );
            if (already) return;
            const sectionText = soapRef.current[section] ?? "";
            if (absEnd > sectionText.length) return;
            const placeholder = "_".repeat(Math.max(1, absEnd - absStart));
            const nextText =
              sectionText.slice(0, absStart) + placeholder + sectionText.slice(absEnd);
            setSoap((prev) => ({ ...prev, [section]: nextText }));
            prevSoapRef.current = { ...prevSoapRef.current, [section]: nextText };
            const newSpan: Span = {
              id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              text: pc.doseText,
              start: pc.doseStart,
              end: pc.doseEnd,
              type: "dose",
              status: "hold",
              candidates: nearest.map((s: Strength) => `${s.value} ${s.unit}`),
              reason: `Available strengths: ${nearest.map((s: Strength) => `${s.value} ${s.unit}`).join(", ")}`,
              minConfidence: 1,
            };
            setAnchors((prev) => [
              ...prev,
              {
                id: newSpan.id,
                section,
                start: absStart,
                end: absEnd,
                span: newSpan,
                rawText: pc.doseText,
                state: "hold",
              },
            ]);
            setVerifyStats((s) => ({ checked: s.checked, held: s.held + 1 }));
          } catch {
            // timeout or fetch failure — fall back to deterministic result
          } finally {
            window.clearTimeout(timer);
          }
        })();
      }

      // Async RxTerms fallback: strong-context tokens with no lexicon match.
      for (const rc of pendingRxTermsMedChecks) {
        void (async () => {
          const ctrl = new AbortController();
          const timer = window.setTimeout(() => ctrl.abort(), 400);
          try {
            const results = await searchRxTerms(rc.token, ctrl.signal);
            if (!results.length) return; // not a medication
            const lower = rc.token.toLowerCase();
            const close = results.find((r) => {
              const name = r.name.toLowerCase();
              return name.startsWith(lower) || lower.startsWith(name.split(/\s+/)[0]);
            });
            if (!close) return;
            const absStart = insertOffset + leadPrefix.length + rc.start;
            const absEnd = insertOffset + leadPrefix.length + rc.end;
            const already = anchorsRef.current.some(
              (a) => a.section === section && a.start === absStart && a.end === absEnd,
            );
            if (already) return;
            // Mark as a low-confidence med hold so the reviewer confirms it.
            const sectionText = soapRef.current[section] ?? "";
            if (absEnd > sectionText.length) return;
            const placeholder = "_".repeat(Math.max(1, absEnd - absStart));
            const nextText =
              sectionText.slice(0, absStart) + placeholder + sectionText.slice(absEnd);
            setSoap((prev) => ({ ...prev, [section]: nextText }));
            prevSoapRef.current = { ...prevSoapRef.current, [section]: nextText };
            const medName = close.name.split(/\s+/)[0];
            const newSpan: Span = {
              id: `rxt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              text: rc.token,
              start: rc.start,
              end: rc.end,
              type: "med",
              status: "hold",
              candidates: [medName, "(dismiss)"],
              reason: `Possible medication: ${medName}`,
              minConfidence: 1,
            };
            setAnchors((prev) => [
              ...prev,
              {
                id: newSpan.id,
                section,
                start: absStart,
                end: absEnd,
                span: newSpan,
                rawText: rc.token,
                state: "hold",
              },
            ]);
            setVerifyStats((s) => ({ checked: s.checked, held: s.held + 1 }));
          } catch {
            // timeout / abort — no hold
          } finally {
            window.clearTimeout(timer);
          }
        })();
      }
    },
    [],
  );

  const dictation = useDictation({
    onInterim: (t) => setInterim(t),
    onFinal: (t, w, meta) => commitFinal(t, w, meta),
    onUtteranceEnd: () => {
      // Sentence-close on utterance end
      const section = dictationTargetRef.current;
      const current = soapRef.current[section] ?? "";
      if (/[A-Za-z0-9]$/.test(current)) {
        const nextText = current + ".";
        setSoap((prev) => ({ ...prev, [section]: nextText }));
        prevSoapRef.current = { ...prevSoapRef.current, [section]: nextText };
        caretRef.current[section] = nextText.length;
      }
    },
    onError: () => setInterim(""),
    onQuietStop: () => {
      setStartedAt(null);
      setInterim("");
    },
  });

  const {
    status,
    start,
    stop,
    audioLevel,
    quietMsRemaining,
    expired,
    errorMessage,
  } = dictation;

  const toggleDictation = useCallback(() => {
    if (status === "listening" || status === "connecting") {
      stop();
      setStartedAt(null);
      setInterim("");
    } else {
      captureActiveCaret();
      dictationTargetRef.current = activeSectionRef.current;
      setInterim("");
      setStartedAt(Date.now());
      void start();
    }
  }, [captureActiveCaret, status, start, stop]);

  // F1 / F2 hotkeys — capture phase so textareas & browser defaults can't swallow them
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      if (e.key === "F2") {
        e.preventDefault();
        e.stopPropagation();
        toggleDictation();
      } else if (e.key === "F1") {
        e.preventDefault();
        e.stopPropagation();
        setShowReview((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [toggleDictation]);

  // Confirm / dismiss handlers used by ReviewTray + tray keybindings.
  const confirmHold = useCallback((anchorId: string, choice: string) => {
    const anchor = anchorsRef.current.find((a) => a.id === anchorId);
    if (!anchor) return;
    if (choice === "(dismiss)") {
      // treat as dismiss
      setAnchors((prev) =>
        prev.map((a) => (a.id === anchorId ? { ...a, state: "resolved" } : a)),
      );
      setVerifyStats((s) => ({ ...s, held: Math.max(0, s.held - 1) }));
      return;
    }
    const section = anchor.section;
    const current = soapRef.current[section] ?? "";
    const nextText =
      current.slice(0, anchor.start) + choice + current.slice(anchor.end);
    const delta = choice.length - (anchor.end - anchor.start);
    setSoap((prev) => ({ ...prev, [section]: nextText }));
    prevSoapRef.current = { ...prevSoapRef.current, [section]: nextText };
    setAnchors((prev) =>
      prev.map((a) => {
        if (a.id === anchorId) {
          return { ...a, state: "resolved", end: a.start + choice.length };
        }
        if (a.section === section && a.start > anchor.start) {
          return { ...a, start: a.start + delta, end: a.end + delta };
        }
        return a;
      }),
    );
    setVerifyStats((s) => ({ ...s, held: Math.max(0, s.held - 1) }));
  }, []);

  const dismissHold = useCallback((anchorId: string) => {
    const anchor = anchorsRef.current.find((a) => a.id === anchorId);
    if (!anchor) return;
    // Replace placeholder with raw transcript, mark dismissed for amber underline
    const section = anchor.section;
    const current = soapRef.current[section] ?? "";
    const nextText =
      current.slice(0, anchor.start) + anchor.rawText + current.slice(anchor.end);
    const delta = anchor.rawText.length - (anchor.end - anchor.start);
    setSoap((prev) => ({ ...prev, [section]: nextText }));
    prevSoapRef.current = { ...prevSoapRef.current, [section]: nextText };
    setAnchors((prev) =>
      prev.map((a) => {
        if (a.id === anchorId) {
          return {
            ...a,
            state: "dismissed",
            end: a.start + anchor.rawText.length,
          };
        }
        if (a.section === section && a.start > anchor.start) {
          return { ...a, start: a.start + delta, end: a.end + delta };
        }
        return a;
      }),
    );
    setVerifyStats((s) => ({ ...s, held: Math.max(0, s.held - 1) }));
  }, []);

  // Global keys while tray open
  useEffect(() => {
    if (openHolds.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "SELECT")) return;
      const active = openHolds[activeHoldIndex];
      if (!active) return;
      if (e.key === "1" || e.key === "2" || e.key === "3") {
        const idx = parseInt(e.key, 10) - 1;
        const c = active.span.candidates[idx];
        if (c) {
          e.preventDefault();
          confirmHold(active.id, c);
        }
      } else if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
        // If focus is in textarea, don't hijack
        if (target?.tagName === "TEXTAREA") return;
        const c = active.span.candidates[0];
        if (c) {
          e.preventDefault();
          confirmHold(active.id, c);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        dismissHold(active.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openHolds, activeHoldIndex, confirmHold, dismissHold]);

  // Reset active hold pointer when holds change
  useEffect(() => {
    if (activeHoldIndex >= openHolds.length) {
      setActiveHoldIndex(0);
    }
  }, [openHolds.length, activeHoldIndex]);

  // Sign pulse when last hold clears
  const prevOpenCountRef = useRef(0);
  useEffect(() => {
    if (prevOpenCountRef.current > 0 && openHolds.length === 0) {
      setSignPulse(true);
      const t = window.setTimeout(() => setSignPulse(false), 800);
      return () => clearTimeout(t);
    }
    prevOpenCountRef.current = openHolds.length;
  }, [openHolds.length]);

  // Manual-edit anchor tracking: when the user edits a textarea by hand,
  // shift anchors past the edit point by the length delta.
  const handleManualEdit = useCallback(
    (section: SoapSection, newValue: string) => {
      const prev = prevSoapRef.current[section] ?? "";
      if (prev === newValue) return;
      // Find common prefix
      let p = 0;
      const minLen = Math.min(prev.length, newValue.length);
      while (p < minLen && prev[p] === newValue[p]) p++;
      const delta = newValue.length - prev.length;
      // Remove or shift anchors intersecting the edited region
      setAnchors((cur) =>
        cur
          .map((a) => {
            if (a.section !== section) return a;
            if (a.end <= p) return a; // before edit
            if (a.start >= p) {
              return { ...a, start: a.start + delta, end: a.end + delta };
            }
            // intersects — invalidate this anchor
            return null;
          })
          .filter((a): a is Anchor => a !== null),
      );
      prevSoapRef.current = { ...prevSoapRef.current, [section]: newValue };
    },
    [],
  );



  const draftTime = (lastCommitAt ?? new Date(2026, 6, 12, 9, 41))
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const filteredPatients = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.includes(searchQuery) ||
    p.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <DictationStrip
        status={status}
        audioLevel={audioLevel}
        interim={interim}
        startedAt={startedAt}
        quietMsRemaining={quietMsRemaining}
        errorMessage={errorMessage}
        expired={expired}
        section={dictationTargetRef.current}
        lastCommit={lastCommitText}
        holdCount={openHolds.length}
        reviewTrayClosed={!showReview}
        onStop={() => {
          stop();
          setStartedAt(null);
          setInterim("");
        }}
      />
      <QuickLookup ref={quickLookupRef} />
      <div className="h-[calc(100vh-2.5rem)] w-full flex flex-col overflow-hidden bg-background" style={{ fontFamily: "'Figtree', sans-serif" }}>

      {/* ── TOP NAV ─────────────────────────────────────────────────── */}
      <header className="h-12 bg-[#12294D] flex items-center px-3 gap-3 flex-shrink-0 z-50 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2 pr-3 border-r border-[rgba(255,255,255,0.15)]">
          <div className="w-7 h-7 rounded bg-[#1B4F8A] flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm tracking-tight">Example</span>
            <span className="text-[#4A7FC1] text-xs ml-1 font-mono">EMR</span>
          </div>
        </div>

        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5A7AB0]" />
          
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button className="relative h-7 w-7 rounded flex items-center justify-center hover:bg-[#1E3A6E] transition-colors">
            <Bell className="w-4 h-4 text-[#8AAFD4]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
          </button>
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-[rgba(255,255,255,0.12)] cursor-pointer hover:bg-[#1E3A6E] rounded px-2 h-7 transition-colors">
            <div className="w-5 h-5 rounded-full bg-[#1B4F8A] flex items-center justify-center text-white text-[10px] font-semibold">SC</div>
            <span className="text-xs text-[#C8D8EC]">Dr. Sarah Chen</span>
            <ChevronDown className="w-3 h-3 text-[#5A7AB0]" />
          </div>
        </div>
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR: Patient List ─────────────────────────────── */}
        <aside className="w-52 bg-[#12294D] flex flex-col flex-shrink-0 border-r border-[rgba(255,255,255,0.06)]">
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-widest text-[#4A7FC1] uppercase">My Patients</span>
              <span className="text-[10px] text-[#4A7FC1] font-mono bg-[#1B4F8A]/40 px-1.5 py-0.5 rounded">{PATIENTS.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4A7FC1]" />
              <input
                className="w-full h-6 bg-[#0D1F3C] border border-[rgba(255,255,255,0.08)] rounded pl-6 pr-2 text-[11px] text-white placeholder-[#4A6A96] focus:outline-none focus:border-[#4A7FC1]"
                placeholder="Filter..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredPatients.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePatient(p)}
                className={`w-full text-left px-3 py-2.5 border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-[#1E3A6E] ${activePatient.id === p.id ? "bg-[#1B4F8A] border-l-2 border-l-[#4A9EE8]" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <StatusDot flag={p.flag} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-white leading-tight truncate">{p.name}</div>
                    <div className="text-[10px] text-[#6B90B8] mt-0.5 font-mono">{p.room}</div>
                    <div className="text-[10px] text-[#4A7096] font-mono">{p.age}{p.sex} · MRN {p.mrn}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-[rgba(255,255,255,0.08)]">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-[#6B90B8] hover:text-white hover:bg-[#1E3A6E] transition-colors">
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-[#6B90B8] hover:text-white hover:bg-[#1E3A6E] transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN AREA ─────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* ── PATIENT BANNER ────────────────────────────────────────── */}
          <div className="bg-card border-b border-border flex-shrink-0">
            <div className="px-4 pt-3 pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#DAE4F0] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#1B4F8A]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-semibold text-foreground">{activePatient.name.replace(",", "").split(" ").reverse().join(" ")}</h1>
                      
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200">FULL CODE</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="font-mono">MRN: {activePatient.mrn}</span>
                      <span>·</span>
                      <span>DOB: {activePatient.dob} · Age {activePatient.age} · {activePatient.sex === "M" ? "Male" : "Female"}</span>
                      <span>·</span>
                      <span>Room <strong className="text-foreground">{activePatient.room}</strong></span>
                      <span>·</span>
                      <span>Attending: <strong className="text-foreground">Chen, Sarah L., MD</strong></span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Admitted 07/08/2026 · Day 5</span>
                      <span>·</span>
                      <span>Internal Medicine - General</span>
                      <span>·</span>
                      <span className="text-red-600 font-medium flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> PCN, Sulfa, Codeine</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5" /> More
                  </button>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex gap-0 mt-3 -mb-px">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-[#1B4F8A] text-[#1B4F8A]"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── TAB CONTENT ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden flex">

            {activeTab === "notes" && (
              <>
                {/* ── NOTE EDITOR (center) ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">

                  {/* New Note Header */}
                  <div className="relative bg-card border border-border rounded-md mb-4 overflow-hidden">
                    <div className="px-4 py-2.5 bg-[#F0F5FB] border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-widest text-[#1B4F8A] uppercase">New Note</span>
                        <div className="flex items-center gap-1.5">
                          <select
                            className="h-6 text-xs border border-border rounded px-2 bg-white text-foreground focus:outline-none focus:border-[#1B4F8A]"
                            value={noteType}
                            onChange={e => setNoteType(e.target.value)}
                          >
                            <option>Progress Note</option>
                            <option>H&P</option>
                            <option>Procedure Note</option>
                            <option>Discharge Summary</option>
                            <option>Consult Note</option>
                          </select>
                          {status === "error" && errorMessage?.startsWith("Microphone") && (
                            <span className="text-[10px] text-red-600 font-medium">
                              Microphone blocked — enable it in the browser bar
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <Clock className="w-3 h-3" />
                        07/12/2026 - {draftTime}
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">DRAFT</span>
                      </div>
                    </div>

                    {/* SOAP Tabs */}
                    <div className="flex border-b border-border bg-white">
                      {(["subjective", "objective", "assessment", "plan"] as const).map(section => (
                        <button
                          key={section}
                          onClick={() => {
                            setActiveSoapSection(section);
                            activeSectionRef.current = section;
                            window.requestAnimationFrame(() => {
                              const el = textareaRefs.current[section];
                              if (!el) return;
                              el.focus({ preventScroll: true });
                              const caret = Math.min(
                                caretRef.current[section] ?? el.value.length,
                                el.value.length,
                              );
                              el.selectionStart = caret;
                              el.selectionEnd = caret;
                            });
                          }}
                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                            activeSoapSection === section
                              ? "text-[#1B4F8A] bg-[#EEF4FC] border-b-2 border-[#1B4F8A]"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {section === "subjective" ? "S - Subjective" :
                           section === "objective" ? "O - Objective" :
                           section === "assessment" ? "A - Assessment" :
                           "P - Plan"}
                        </button>
                      ))}
                    </div>

                    <div className="p-0 relative">
                      {(["subjective", "objective", "assessment", "plan"] as const).map(section => {
                        const isActive = activeSoapSection === section;
                        return (
                          <div
                            key={section}
                            className={`relative ${isActive ? "block" : "hidden"}`}
                          >
                            <textarea
                              ref={(el) => { textareaRefs.current[section] = el; }}
                              data-soap-section={section}
                              className="relative w-full resize-none p-4 text-xs leading-relaxed focus:outline-none border-none bg-transparent"
                              rows={12}
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "11.5px",
                                lineHeight: "1.7",
                                color: "#0B1F52",
                              }}
                              placeholder="Press F2 to dictate."
                              value={soap[section]}
                              onChange={e => {
                                const v = e.target.value;
                                setSoap(prev => ({ ...prev, [section]: v }));
                                handleManualEdit(section, v);
                                syncCaretFromElement(e.target);
                              }}
                              onSelect={e => syncCaretFromElement(e.target as HTMLTextAreaElement)}
                              onFocus={e => syncCaretFromElement(e.target)}
                              onKeyUp={e => syncCaretFromElement(e.target as HTMLTextAreaElement)}
                              onClick={e => syncCaretFromElement(e.target as HTMLTextAreaElement)}
                              onBlur={e => {
                                caretRef.current[section] = e.target.selectionStart ?? e.target.value.length;
                              }}
                            />
                          </div>
                        );
                      })}

                    </div>

                    {/* Review Panel — toggle with F1, visible during dictation or when holds exist */}
                    {showReview && (
                        <ReviewTray
                          holds={holdEntries}
                          activeIndex={activeHoldIndex}
                          onSelect={(idx) => setActiveHoldIndex(idx)}
                          onConfirm={(id, choice) => confirmHold(id, choice)}
                          onDismiss={(id) => dismissHold(id)}
                          onLookup={handleLookup}
                          sectionText={soap[dictationTargetRef.current] ?? soap[activeSoapSection]}
                          interim={interim}
                          sectionLabel={
                            dictationTargetRef.current === "subjective" ? "S · Subjective" :
                            dictationTargetRef.current === "objective" ? "O · Objective" :
                            dictationTargetRef.current === "assessment" ? "A · Assessment" :
                            "P · Plan"
                          }
                        />
                      )}

                    <div className="px-4 py-2.5 border-t border-border bg-[#F8FAFC] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Info className="w-3.5 h-3.5 text-[#1B4F8A]" />
                        Auto-saved {draftTime} · Chen, Sarah L., MD
                        {verifyStats.checked > 0 && (
                          <span className="ml-2 text-[10px] text-[#7A8AAC]">
                            · {verifyStats.checked} verified{verifyStats.held > 0 ? ` · ${verifyStats.held} held` : ""}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors">
                          <Save className="w-3.5 h-3.5" /> Save Draft
                        </button>
                        <button
                          disabled={openHolds.length > 0}
                          title={openHolds.length > 0 ? `${openHolds.length} item${openHolds.length === 1 ? "" : "s"} need review` : ""}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-all font-medium ${
                            openHolds.length > 0
                              ? "bg-slate-300 text-white cursor-not-allowed"
                              : `bg-[#1B4F8A] text-white hover:bg-[#153F70] ${signPulse ? "ring-2 ring-[#0D57FA] ring-offset-1" : ""}`
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" /> Sign & Submit
                        </button>
                      </div>
                    </div>
                  </div>


                </div>

                {/* ── RIGHT PANEL ──────────────────────────────────── */}
                <aside className="w-64 border-l border-border bg-card flex-shrink-0 overflow-y-auto scrollbar-hide">

                  {/* Vitals */}
                  <div className="border-b border-border">
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Vitals - 07:00 AM</span>
                      <button className="text-[10px] text-[#0B7FAF] hover:underline">Trend</button>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-border mx-3 mb-3 rounded overflow-hidden border border-border">
                      {VITALS.map(v => {
                        const Icon = v.icon;
                        return (
                          <div key={v.label} className={`bg-card px-2.5 py-2 ${v.alert ? "bg-red-50" : ""}`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Icon className={`w-2.5 h-2.5 ${v.alert ? "text-red-500" : ""}`} /> {v.label}
                              </span>
                              <VitalTrend trend={v.trend} />
                            </div>
                            <div className={`font-mono font-semibold text-sm ${v.alert ? "text-red-600" : "text-foreground"}`}>{v.value}</div>
                            <div className="text-[9px] text-muted-foreground font-mono">{v.unit}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Problems */}
                  <div className="border-b border-border">
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Problem List</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{ACTIVE_PROBLEMS.length}</span>
                    </div>
                    <div className="px-3 pb-3 space-y-1">
                      {ACTIVE_PROBLEMS.map(p => (
                        <div key={p.icd} className="flex items-start gap-1.5 py-1 border-b border-border/50 last:border-0">
                          <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.severity === "acute" ? "bg-red-500" : "bg-[#1B4F8A]"}`} />
                          <div className="min-w-0">
                            <div className="text-[11px] text-foreground leading-tight">{p.dx}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-mono text-muted-foreground">{p.icd}</span>
                              {p.severity === "acute" && <span className="text-[9px] text-red-600 font-semibold uppercase">Acute</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Active Meds</span>
                      <button className="text-[10px] text-[#0B7FAF] hover:underline">All</button>
                    </div>
                    <div className="px-3 pb-3 space-y-1">
                      {MEDS.map(m => (
                        <div key={m.name} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[11px] font-medium ${m.status === "hold" ? "text-muted-foreground line-through" : "text-foreground"}`}>{m.name}</span>
                              {m.status === "hold" && <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded font-semibold uppercase">HOLD</span>}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">{m.dose} · {m.freq} · {m.route}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </>
            )}

            {activeTab === "vitals" && (
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-[#F0F5FB]">
                    <h3 className="text-xs font-semibold text-foreground">Vital Signs - Trend (Last 5 Days)</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Admission: 07/08/2026 - Current: 07/12/2026</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">Vital</th>
                          {["07/08", "07/09", "07/10", "07/11", "07/12"].map(d => (
                            <th key={d} className="text-center px-4 py-2.5 font-mono font-medium text-muted-foreground text-[10px]">{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { label: "BP (mmHg)", values: ["168/102", "158/96", "152/92", "148/90", "142/88"], alert: [true, true, false, false, false] },
                          { label: "HR (bpm)", values: ["92", "88", "82", "80", "76"], alert: [false, false, false, false, false] },
                          { label: "SpO₂ (%)", values: ["91", "93", "95", "96", "96"], alert: [true, false, false, false, false] },
                          { label: "RR (/min)", values: ["22", "20", "18", "18", "18"], alert: [false, false, false, false, false] },
                          { label: "Temp (°F)", values: ["99.1", "98.9", "98.7", "98.6", "98.4"], alert: [false, false, false, false, false] },
                          { label: "Weight (lbs)", values: ["193.8", "192.1", "190.4", "189.4", "187.0"], alert: [false, false, false, false, false] },
                        ].map(row => (
                          <tr key={row.label} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-foreground">{row.label}</td>
                            {row.values.map((v, i) => (
                              <td key={i} className={`text-center px-4 py-2.5 font-mono ${row.alert[i] ? "text-red-600 font-semibold" : "text-foreground"}`}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "medications" && (
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-[#F0F5FB] flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground">Medication Administration Record</h3>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-[#1B4F8A] text-white rounded hover:bg-[#153F70] transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Order
                    </button>
                  </div>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {["Medication", "Dose", "Route", "Frequency", "Last Given", "Next Due", "Status"].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MEDS.map(m => (
                        <tr key={m.name} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">{m.name}</td>
                          <td className="px-4 py-3 font-mono text-foreground">{m.dose}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.route}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.freq}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">07/12 08:00</td>
                          <td className="px-4 py-3 font-mono text-foreground">07/12 20:00</td>
                          <td className="px-4 py-3">
                            {m.status === "hold" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                <XCircle className="w-2.5 h-2.5" /> HOLD
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "labs" && (
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-[#F0F5FB]">
                    <h3 className="text-xs font-semibold text-foreground">Laboratory Results</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Collected 07/12/2026 04:30 AM · Resulted 06:18 AM</p>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { group: "Basic Metabolic Panel", results: [
                        { test: "Sodium (Na)", value: "136", unit: "mEq/L", ref: "136–145", flag: null },
                        { test: "Potassium (K)", value: "4.1", unit: "mEq/L", ref: "3.5–5.0", flag: null },
                        { test: "Chloride (Cl)", value: "99", unit: "mEq/L", ref: "98–107", flag: null },
                        { test: "CO₂", value: "24", unit: "mEq/L", ref: "22–29", flag: null },
                        { test: "BUN", value: "42", unit: "mg/dL", ref: "7–25", flag: "H" },
                        { test: "Creatinine", value: "1.8", unit: "mg/dL", ref: "0.7–1.3", flag: "H" },
                        { test: "eGFR", value: "38", unit: "mL/min", ref: ">60", flag: "L" },
                        { test: "Glucose", value: "148", unit: "mg/dL", ref: "70–100", flag: "H" },
                      ]},
                      { group: "Cardiac Biomarkers", results: [
                        { test: "BNP", value: "1,920", unit: "pg/mL", ref: "<100", flag: "H" },
                        { test: "Troponin I (hs)", value: "0.018", unit: "ng/mL", ref: "<0.04", flag: null },
                      ]},
                      { group: "CBC", results: [
                        { test: "WBC", value: "8.2", unit: "×10³/μL", ref: "4.5–11.0", flag: null },
                        { test: "Hemoglobin", value: "11.4", unit: "g/dL", ref: "13.5–17.5", flag: "L" },
                        { test: "Hematocrit", value: "34.2", unit: "%", ref: "41–53", flag: "L" },
                        { test: "Platelets", value: "214", unit: "×10³/μL", ref: "150–400", flag: null },
                      ]},
                    ].map(group => (
                      <div key={group.group}>
                        <div className="px-4 py-2 bg-muted/40 border-b border-border">
                          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{group.group}</span>
                        </div>
                        {group.results.map(r => (
                          <div key={r.test} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors border-b border-border/40 last:border-0">
                            <span className="text-xs text-foreground w-48">{r.test}</span>
                            <span className={`font-mono font-semibold text-sm w-20 text-right ${r.flag === "H" ? "text-red-600" : r.flag === "L" ? "text-blue-600" : "text-foreground"}`}>
                              {r.value}
                              {r.flag && <span className="ml-1 text-[10px] font-bold">{r.flag}</span>}
                            </span>
                            <span className="text-[11px] text-muted-foreground w-20 text-center font-mono">{r.unit}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">Ref: {r.ref}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-[#F0F5FB] flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground">Active Orders</h3>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-[#1B4F8A] text-white rounded hover:bg-[#153F70] transition-colors">
                      <Plus className="w-3.5 h-3.5" /> New Order
                    </button>
                  </div>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {["Order", "Category", "Ordered By", "Date/Time", "Status"].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { order: "BMP - Basic Metabolic Panel", cat: "Laboratory", by: "Chen, S.", dt: "07/12 04:00", status: "completed" },
                        { order: "CBC with Differential", cat: "Laboratory", by: "Chen, S.", dt: "07/12 04:00", status: "completed" },
                        { order: "BNP", cat: "Laboratory", by: "Chen, S.", dt: "07/12 04:00", status: "completed" },
                        { order: "Chest X-Ray - Portable AP", cat: "Radiology", by: "Chen, S.", dt: "07/12 07:30", status: "pending" },
                        { order: "Furosemide 80mg IV BID", cat: "Medication", by: "Patel, A.", dt: "07/10 14:30", status: "active" },
                        { order: "Daily Weight - AM", cat: "Nursing", by: "Chen, S.", dt: "07/08 09:00", status: "active" },
                        { order: "Strict I&O", cat: "Nursing", by: "Chen, S.", dt: "07/08 09:00", status: "active" },
                        { order: "2g Sodium Diet", cat: "Nutrition", by: "Chen, S.", dt: "07/08 09:00", status: "active" },
                        { order: "1.5L Fluid Restriction", cat: "Nutrition", by: "Chen, S.", dt: "07/08 09:00", status: "active" },
                        { order: "Transthoracic Echo", cat: "Cardiology", by: "Patel, A.", dt: "07/12 06:00", status: "completed" },
                      ].map(o => (
                        <tr key={o.order} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{o.order}</td>
                          <td className="px-4 py-3 text-muted-foreground">{o.cat}</td>
                          <td className="px-4 py-3 text-muted-foreground">{o.by}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{o.dt}</td>
                          <td className="px-4 py-3">
                            {o.status === "completed" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                              </span>
                            )}
                            {o.status === "active" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Active
                              </span>
                            )}
                            {o.status === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-2.5 h-2.5" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── BOTTOM STATUS BAR ─────────────────────────────────────────── */}
      <footer className="h-6 bg-[#0D1F3C] border-t border-[rgba(255,255,255,0.06)] flex items-center px-4 gap-4 flex-shrink-0">
        <span className="text-[10px] text-[#4A7096] font-mono">MedChart EMR v14.2.1</span>
        <span className="text-[#2A4A6A]">|</span>
        <span className="text-[10px] text-[#4A7096] font-mono">Session: Dr. Chen · 4W - Internal Medicine</span>
        <span className="text-[#2A4A6A]">|</span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Connected · HL7 FHIR R4</span>
        <div className="ml-auto text-[10px] text-[#4A7096] font-mono">07/12/2026 · 09:41 AM</div>
      </footer>
      </div>
    </>
  );
}
