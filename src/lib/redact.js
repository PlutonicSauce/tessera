const PATTERNS = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]"],
  [/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]"],
  [/\b(?:\d[ -]?){15,16}\b/g, "[CARD]"],
  [/(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/g, "[PHONE]"],
  [/\b\d{1,5}\s+(?:[A-Z][a-z]+\s){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\b\.?/g, "[ADDRESS]"],
  [/\b([Mm]y name is|[Ss]incerely,?|[Rr]egards,?|[Tt]hank you,?|[Rr]espectfully,?)\s+([A-Z][a-z]+(?:\s[A-Z]\.?)?(?:\s[A-Z][a-z]+){0,2})/g, "$1 [NAME]"],
];

// Removes emails, phone numbers, SSNs, card numbers, street addresses and signed names.
export function redactPII(input) {
  let text = String(input || "");
  let count = 0;
  for (const [re, rep] of PATTERNS) {
    text = text.replace(re, (...args) => {
      count++;
      return rep.includes("$1") ? rep.replace("$1", args[1]) : rep;
    });
  }
  return { text, count };
}