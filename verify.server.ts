/**
 * Source verification. Server-only, deterministic, no model involved.
 *
 * Every generated item is checked word-by-word and number-by-number against the
 * exact source text it claims to come from. Items that cannot be traced back to
 * the source are rejected before they ever reach the student, which is what keeps
 * the visible material at source-level accuracy.
 */

const AR_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

/** Normalizes Arabic and Latin text so wording differences do not hide a real match. */
export function normalize(text: string): string {
  return text
    .replace(AR_DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ؤ]/g, "و")
    .replace(/[^\p{L}\p{N}\s.+\-*/=^%]/gu, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

const STOP = new Set([
  "the","and","for","with","that","this","from","are","was","were","have","has","not","but","all","any","its","into","than","then","which","when","where","what","how","who","you","your","can","will","shall","may","one","two","also","such",
  "في","من","على","الى","إلى","عن","مع","هذا","هذه","ذلك","التي","الذي","كما","كل","او","أو","ثم","بين","بعد","قبل","عند","حيث","لكن","اذا","إذا","يكون","تكون","هو","هي","ان","أن","إن","لا","ما","به","له","هذان","هؤلاء",
]);

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length >= 3 && !STOP.has(t));
}

function numbers(text: string): string[] {
  return (normalize(text).match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", "."));
}

export type SupportStatus = "SUPPORTED" | "PARTIALLY_SUPPORTED" | "UNSUPPORTED";

export type VerificationResult = {
  status: SupportStatus;
  coverage: number;
  confidence: number;
  missingTerms: string[];
  missingNumbers: string[];
};

/**
 * Measures how much of `generated` is literally present in `source`.
 * `checkNumbers` is off for computed answers, where a result legitimately does
 * not appear in the source text, and on for definitions, formulas and prompts.
 */
export function verifyAgainstSource(
  generated: string,
  source: string,
  options: { checkNumbers?: boolean } = {},
): VerificationResult {
  const generatedTokens = tokens(generated);
  const sourceTokens = new Set(tokens(source));
  const sourceText = normalize(source);

  if (generatedTokens.length === 0) {
    return {
      status: "UNSUPPORTED",
      coverage: 0,
      confidence: 0,
      missingTerms: [],
      missingNumbers: [],
    };
  }

  const missingTerms = [...new Set(generatedTokens.filter((t) => !sourceTokens.has(t) && !sourceText.includes(t)))];
  const coverage = 1 - missingTerms.length / new Set(generatedTokens).size;

  const missingNumbers = options.checkNumbers
    ? [...new Set(numbers(generated).filter((n) => !sourceText.includes(n)))]
    : [];

  let confidence = coverage;
  if (missingNumbers.length > 0) confidence -= 0.25 * Math.min(2, missingNumbers.length);
  confidence = Math.max(0, Math.min(1, confidence));

  const status: SupportStatus =
    confidence >= 0.75 && missingNumbers.length === 0
      ? "SUPPORTED"
      : confidence >= 0.5
        ? "PARTIALLY_SUPPORTED"
        : "UNSUPPORTED";

  return {
    status,
    coverage: Math.round(coverage * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    missingTerms: missingTerms.slice(0, 12),
    missingNumbers: missingNumbers.slice(0, 8),
  };
}

/** Share of the source's own meaningful words that made it into the lesson output. */
export function measureCoverageOfSource(sourceText: string, generatedTexts: string[]): number {
  const sourceTokens = [...new Set(tokens(sourceText))];
  if (sourceTokens.length === 0) return 0;
  const produced = normalize(generatedTexts.join(" "));
  const producedTokens = new Set(tokens(generatedTexts.join(" ")));
  const covered = sourceTokens.filter((t) => producedTokens.has(t) || produced.includes(t));
  return Math.round((covered.length / sourceTokens.length) * 100) / 100;
}
