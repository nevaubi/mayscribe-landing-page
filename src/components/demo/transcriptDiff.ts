// Lightweight word-level LCS diff between the streamed transcript
// and the batch (Together AI Parakeet) transcript.
// Emits ranges where they disagree with a short context window.

export interface TranscriptDiff {
  streamed: string;
  batch: string;
  contextBefore: string;
  contextAfter: string;
}

function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? []);
}

// Standard LCS table -> diff runs.
export function diffTranscripts(streamed: string, batch: string): TranscriptDiff[] {
  const a = tokenize(streamed);
  const b = tokenize(batch);
  if (!a.length || !b.length) return [];

  const n = a.length;
  const m = b.length;
  // Guard against runaway memory; cap to 2000x2000 (~4MB int32).
  if (n * m > 4_000_000) return [];

  const dp: Int32Array = new Int32Array((n + 1) * (m + 1));
  const w = m + 1;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * w + j] =
        a[i] === b[j]
          ? dp[(i + 1) * w + (j + 1)] + 1
          : Math.max(dp[(i + 1) * w + j], dp[i * w + (j + 1)]);
    }
  }

  interface Op { kind: "eq" | "del" | "ins"; av?: string; bv?: string }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: "eq", av: a[i], bv: b[j] });
      i++; j++;
    } else if (dp[(i + 1) * w + j] >= dp[i * w + (j + 1)]) {
      ops.push({ kind: "del", av: a[i] });
      i++;
    } else {
      ops.push({ kind: "ins", bv: b[j] });
      j++;
    }
  }
  while (i < n) { ops.push({ kind: "del", av: a[i++] }); }
  while (j < m) { ops.push({ kind: "ins", bv: b[j++] }); }

  // Coalesce adjacent del/ins runs into diff blocks.
  const diffs: TranscriptDiff[] = [];
  const CONTEXT = 4;
  let k = 0;
  while (k < ops.length) {
    if (ops[k].kind === "eq") { k++; continue; }
    const runStart = k;
    const delTokens: string[] = [];
    const insTokens: string[] = [];
    while (k < ops.length && ops[k].kind !== "eq") {
      if (ops[k].kind === "del") delTokens.push(ops[k].av!);
      else insTokens.push(ops[k].bv!);
      k++;
    }
    const before: string[] = [];
    for (let p = runStart - 1; p >= 0 && before.length < CONTEXT; p--) {
      if (ops[p].kind === "eq") before.unshift(ops[p].av!);
    }
    const after: string[] = [];
    for (let p = k; p < ops.length && after.length < CONTEXT; p++) {
      if (ops[p].kind === "eq") after.push(ops[p].av!);
    }
    // Skip cosmetic differences (identical when normalized).
    if (delTokens.join(" ") === insTokens.join(" ")) continue;
    diffs.push({
      streamed: delTokens.join(" "),
      batch: insTokens.join(" "),
      contextBefore: before.join(" "),
      contextAfter: after.join(" "),
    });
  }
  return diffs;
}
