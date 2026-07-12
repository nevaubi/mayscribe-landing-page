import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { MEDS } from "./lexicon";

export interface QuickLookupHandle {
  openWith: (query: string) => void;
}

interface MedResult {
  name: string;
  strengths: string[];
}
interface CondResult {
  name: string;
}
interface LookupResult {
  meds: MedResult[];
  conditions: CondResult[];
}

const RXTERMS_URL = "https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search";
const CONDITIONS_URL = "https://clinicaltables.nlm.nih.gov/api/conditions/v3/search";
const DEBOUNCE_MS = 200;
const MIN_LEN = 2;

// -------- fuzzy fallback over lexicon.MEDS --------
function levenshtein(a: string, b: string, cap = 2): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const dp = Array(b.length + 1)
    .fill(0)
    .map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    let minRow = dp[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
      if (dp[j] < minRow) minRow = dp[j];
    }
    if (minRow > cap) return cap + 1;
  }
  return dp[b.length];
}

function fuzzyFallbackMeds(q: string): MedResult[] {
  const w = q.toLowerCase();
  const scored: { r: MedResult; s: number }[] = [];
  for (const m of MEDS) {
    const names = [m.name, ...m.aliases].map((s) => s.toLowerCase());
    let best = Infinity;
    for (const n of names) {
      if (n.includes(w)) best = Math.min(best, 0);
      else best = Math.min(best, levenshtein(n, w, 2));
    }
    if (best <= 2) {
      const r = m.typicalDoseRange;
      const strengths = r
        ? [`${r.min} ${r.unit}`, `${r.max} ${r.unit}`]
        : [];
      scored.push({ r: { name: m.name, strengths }, s: best });
    }
  }
  scored.sort((a, b) => a.s - b.s);
  return scored.slice(0, 5).map((x) => x.r);
}

async function fetchRxTerms(q: string, signal: AbortSignal): Promise<MedResult[]> {
  const url = `${RXTERMS_URL}?terms=${encodeURIComponent(q)}&ef=STRENGTHS_AND_FORMS&maxList=5`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as [
    number,
    string[],
    { STRENGTHS_AND_FORMS?: string[] } | null,
    string[][],
  ];
  const display = data[3] ?? [];
  const strengthsArr = data[2]?.STRENGTHS_AND_FORMS ?? [];
  return display.slice(0, 5).map((row, i) => {
    const name = Array.isArray(row) ? row[0] : String(row);
    const raw = strengthsArr[i] ?? "";
    const strengths = raw
      .split(/[|;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
    return { name, strengths };
  });
}

async function fetchConditions(q: string, signal: AbortSignal): Promise<CondResult[]> {
  const url = `${CONDITIONS_URL}?terms=${encodeURIComponent(q)}&maxList=5`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as [number, string[], unknown, string[][]];
  const display = data[3] ?? [];
  return display.slice(0, 5).map((row) => ({
    name: Array.isArray(row) ? row[0] : String(row),
  }));
}

// Local condition list used only when the NLM /conditions endpoint fails.
const CONDITIONS_FALLBACK: string[] = [
  "Hypertension", "Type 2 diabetes mellitus", "Type 1 diabetes mellitus",
  "Hyperlipidemia", "Coronary artery disease", "Congestive heart failure",
  "Atrial fibrillation", "Chronic kidney disease", "End-stage renal disease",
  "Asthma", "Chronic obstructive pulmonary disease", "Obstructive sleep apnea",
  "Pneumonia", "Urinary tract infection", "Cellulitis", "Sepsis",
  "Gastroesophageal reflux disease", "Peptic ulcer disease",
  "Irritable bowel syndrome", "Inflammatory bowel disease", "Crohn disease",
  "Ulcerative colitis", "Cirrhosis", "Hepatitis C", "Hypothyroidism",
  "Hyperthyroidism", "Osteoporosis", "Osteoarthritis", "Rheumatoid arthritis",
  "Gout", "Migraine", "Epilepsy", "Parkinson disease", "Alzheimer disease",
  "Major depressive disorder", "Generalized anxiety disorder",
  "Bipolar disorder", "Schizophrenia", "Anemia", "Iron deficiency anemia",
  "Vitamin D deficiency", "Obesity", "Chronic pain", "Low back pain",
  "Deep vein thrombosis", "Pulmonary embolism", "Cerebrovascular accident",
  "Transient ischemic attack", "Benign prostatic hyperplasia",
  "Chronic sinusitis", "Allergic rhinitis",
];

function fallbackConditions(q: string): CondResult[] {
  const w = q.toLowerCase();
  return CONDITIONS_FALLBACK.filter((c) => c.toLowerCase().includes(w))
    .slice(0, 5)
    .map((name) => ({ name }));
}

export const QuickLookup = forwardRef<QuickLookupHandle>(function QuickLookup(_props, ref) {
  const [portalReady, setPortalReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [settled, setSettled] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [copiedChip, setCopiedChip] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, LookupResult>>(new Map());

  useEffect(() => {
    setPortalReady(typeof document !== "undefined");
  }, []);

  useImperativeHandle(ref, () => ({
    openWith: (q: string) => {
      setVisible(true);
      setQuery(q);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    },
  }));

  // debounce
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // fetch
  useEffect(() => {
    const q = debounced.toLowerCase();
    if (q.length < MIN_LEN) {
      setResult(null);
      setLoading(false);
      setSettled(false);
      setActiveIdx(0);
      return;
    }

    const cached = cacheRef.current.get(q);
    if (cached) {
      setResult(cached);
      setLoading(false);
      setSettled(true);
      setActiveIdx(0);
      return;
    }

    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    setLoading(true);
    setSettled(false);

    Promise.allSettled([
      fetchRxTerms(q, ctl.signal),
      fetchConditions(q, ctl.signal),
    ]).then(([medsRes, condRes]) => {
      if (ctl.signal.aborted) return;
      const meds =
        medsRes.status === "fulfilled" ? medsRes.value : fuzzyFallbackMeds(q);
      const conditions =
        condRes.status === "fulfilled" ? condRes.value : fallbackConditions(q);
      const merged: LookupResult = { meds, conditions };
      cacheRef.current.set(q, merged);
      setResult(merged);
      setLoading(false);
      setSettled(true);
      setActiveIdx(0);
    });

    return () => ctl.abort();
  }, [debounced]);

  // flatten for keyboard nav
  const flatItems = useMemo(() => {
    if (!result) return [] as { kind: "med" | "cond"; key: string; label: string }[];
    const out: { kind: "med" | "cond"; key: string; label: string }[] = [];
    for (const m of result.meds) out.push({ kind: "med", key: m.name, label: m.name });
    for (const c of result.conditions) out.push({ kind: "cond", key: c.name, label: c.name });
    return out;
  }, [result]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, Math.max(0, flatItems.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const item = flatItems[activeIdx];
        if (item?.kind === "med") {
          e.preventDefault();
          setExpandedMed((p) => (p === item.key ? null : item.key));
        }
      } else if (e.key === "Escape") {
        setVisible(false);
      }
    },
    [flatItems, activeIdx],
  );

  const copyChip = useCallback((medName: string, strength: string) => {
    const text = `${medName} ${strength}`.trim();
    const chipKey = `${medName}|${strength}`;
    void navigator.clipboard?.writeText(text);
    setCopiedChip(chipKey);
    window.setTimeout(() => {
      setCopiedChip((cur) => (cur === chipKey ? null : cur));
    }, 1500);
  }, []);

  const showResults = debounced.length >= MIN_LEN;
  const showEmpty =
    showResults &&
    settled &&
    !loading &&
    result &&
    result.meds.length === 0 &&
    result.conditions.length === 0;

  if (!portalReady || !visible) return null;

  const node = (
    <div
      className="fixed right-8 bottom-28 pointer-events-none"
      style={{ zIndex: 9998, fontFamily: "'Inter', sans-serif" }}
    >
      <div
        ref={rootRef}
        className="pointer-events-auto w-[320px] overflow-hidden rounded-xl border bg-white/95 shadow-card"
        style={{
          borderColor: "#D8E2F0",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow:
            "0 24px 64px -24px rgba(5,18,56,0.28), 0 8px 20px -12px rgba(5,18,56,0.18)",
        }}
      >
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Clinical Lookup
        </span>
        <button
          type="button"
          aria-label="Close lookup"
          onClick={() => setVisible(false)}
          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search meds or conditions…"
            className="w-full h-7 pl-7 pr-7 text-[11px] bg-white border border-border rounded focus:outline-none focus:border-[#1B4F8A] placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {showResults && (
          <div className="mt-2 space-y-2">
            {loading && !result && (
              <div className="space-y-1">
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Medications
                </div>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-4 rounded bg-slate-100 animate-pulse"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                ))}
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70 pt-1">
                  Conditions
                </div>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-4 rounded bg-slate-100 animate-pulse"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                ))}
              </div>
            )}

            {result && result.meds.length > 0 && (
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">
                  Medications
                </div>
                <div className="space-y-0.5">
                  {result.meds.map((m, i) => {
                    const flatIdx = i;
                    const isActive = flatIdx === activeIdx;
                    const expanded = expandedMed === m.name;
                    return (
                      <div key={m.name}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIdx(flatIdx)}
                          onClick={() =>
                            setExpandedMed((p) => (p === m.name ? null : m.name))
                          }
                          className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors ${
                            isActive
                              ? "bg-[#EEF4FC] text-[#1B4F8A]"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{m.name}</span>
                            {m.strengths.length > 0 && (
                              <span className="text-[9px] font-mono text-muted-foreground">
                                {m.strengths.length}
                              </span>
                            )}
                          </div>
                        </button>
                        {expanded && m.strengths.length > 0 && (
                          <div className="flex flex-wrap gap-1 px-2 pb-1.5 pt-1">
                            {m.strengths.map((s) => {
                              const chipKey = `${m.name}|${s}`;
                              const copied = copiedChip === chipKey;
                              return (
                                <button
                                  key={chipKey}
                                  type="button"
                                  onClick={() => copyChip(m.name, s)}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                    copied
                                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                      : "border-border bg-white text-foreground hover:border-[#0D57FA] hover:text-[#0D57FA]"
                                  }`}
                                >
                                  {copied ? "Copied" : s}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result && result.conditions.length > 0 && (
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">
                  Conditions
                </div>
                <div className="space-y-0.5">
                  {result.conditions.map((c, i) => {
                    const flatIdx = (result.meds.length ?? 0) + i;
                    const isActive = flatIdx === activeIdx;
                    return (
                      <div
                        key={c.name}
                        onMouseEnter={() => setActiveIdx(flatIdx)}
                        className={`px-2 py-1 rounded text-[11px] transition-colors ${
                          isActive
                            ? "bg-[#EEF4FC] text-[#1B4F8A]"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {c.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {showEmpty && (
              <div className="text-[11px] text-muted-foreground px-1 py-1">
                No matches
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
});
