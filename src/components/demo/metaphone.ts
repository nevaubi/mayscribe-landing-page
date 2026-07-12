// Compact Double Metaphone (primary code only). Sufficient for pharmacology
// name matching. Not a full spec implementation — trimmed to the rules that
// materially affect drug-name confusability (silent prefixes, PH→F, TH→0,
// X→KS, soft C/G, digraphs SH/CH). Deterministic and side-effect free.

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);

function isVowel(s: string, i: number): boolean {
  return i >= 0 && i < s.length && VOWELS.has(s[i]);
}

/**
 * Primary Double Metaphone code for a single token.
 * Returns uppercase code, empty string for empty input.
 */
export function metaphonePrimary(input: string): string {
  if (!input) return "";
  // Normalize
  let s = input.toUpperCase().replace(/[^A-Z]/g, "");
  if (!s) return "";

  // Silent starting-letter pairs
  if (/^(GN|KN|PN|WR|PS)/.test(s)) s = s.slice(1);
  if (s.startsWith("X")) s = "S" + s.slice(1); // Xavier→Savier

  let out = "";
  let i = 0;
  const n = s.length;

  while (i < n && out.length < 8) {
    const c = s[i];
    const next = s[i + 1] ?? "";
    const nn = s[i + 2] ?? "";

    switch (c) {
      case "A":
      case "E":
      case "I":
      case "O":
      case "U":
      case "Y":
        // Only encode leading vowel
        if (i === 0) out += "A";
        i += 1;
        break;

      case "B":
        out += "P";
        i += next === "B" ? 2 : 1;
        break;

      case "Ç":
      case "C":
        // CH → X (as "sh") for most cases; keep as K for chemistry-y CH pairs is
        // a rare edge — we choose X consistently, since drug names use "chlor"
        // → both "K" (chlor) and "X" (chart) exist. Use K for CH before hard
        // consonants (CHL, CHR, CHM, CHN) which covers "chlorpromazine".
        if (next === "H") {
          if (/^[LRMN]/.test(nn)) {
            out += "K";
          } else {
            out += "X";
          }
          i += 2;
        } else if (next === "C") {
          out += "K";
          i += 2;
        } else if (/^[IEY]/.test(next)) {
          out += "S";
          i += 1;
        } else {
          out += "K";
          i += 1;
        }
        break;

      case "D":
        if (next === "G" && /^[IEY]/.test(nn)) {
          out += "J";
          i += 3;
        } else {
          out += "T";
          i += next === "D" ? 2 : 1;
        }
        break;

      case "F":
        out += "F";
        i += next === "F" ? 2 : 1;
        break;

      case "G":
        if (next === "H") {
          // GH mostly silent, but leading GH acts as K
          if (i === 0) out += "K";
          i += 2;
        } else if (next === "N") {
          // GN — silent G
          i += 1;
        } else if (/^[IEY]/.test(next)) {
          out += "J";
          i += 1;
        } else {
          out += "K";
          i += next === "G" ? 2 : 1;
        }
        break;

      case "H":
        // H only encoded when between vowels
        if (i > 0 && isVowel(s, i - 1) && isVowel(s, i + 1)) {
          out += "H";
        }
        i += 1;
        break;

      case "J":
        out += "J";
        i += next === "J" ? 2 : 1;
        break;

      case "K":
        // Silent when preceded by C (already handled in C branch)
        out += "K";
        i += next === "K" ? 2 : 1;
        break;

      case "L":
        out += "L";
        i += next === "L" ? 2 : 1;
        break;

      case "M":
        out += "M";
        i += next === "M" ? 2 : 1;
        break;

      case "N":
        out += "N";
        i += next === "N" ? 2 : 1;
        break;

      case "P":
        if (next === "H") {
          out += "F";
          i += 2;
        } else {
          out += "P";
          i += next === "P" ? 2 : 1;
        }
        break;

      case "Q":
        out += "K";
        i += 1;
        break;

      case "R":
        out += "R";
        i += next === "R" ? 2 : 1;
        break;

      case "S":
        if (next === "H") {
          out += "X";
          i += 2;
        } else if (next === "C" && nn === "H") {
          out += "X";
          i += 3;
        } else if (/^[IEY]/.test(next) && (s[i + 2] === "O" || s[i + 2] === "A")) {
          // SIO / SIA → X (as in "-sion")
          out += "X";
          i += 1;
        } else {
          out += "S";
          i += next === "S" ? 2 : 1;
        }
        break;

      case "T":
        if (next === "H") {
          out += "0"; // theta
          i += 2;
        } else if (next === "I" && (nn === "O" || nn === "A")) {
          out += "X";
          i += 1;
        } else if (next === "C" && nn === "H") {
          out += "X";
          i += 3;
        } else {
          out += "T";
          i += next === "T" ? 2 : 1;
        }
        break;

      case "V":
        out += "F";
        i += next === "V" ? 2 : 1;
        break;

      case "W":
        // Only encoded when followed by a vowel
        if (isVowel(s, i + 1)) out += "W";
        i += 1;
        break;

      case "X":
        out += "KS";
        i += 1;
        break;

      case "Z":
        out += "S";
        i += next === "Z" ? 2 : 1;
        break;

      default:
        i += 1;
        break;
    }
  }

  return out;
}
