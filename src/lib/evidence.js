export const CLASS_META = {
  policy_text: { label: "Policy language", short: "Policy", dot: "bg-[#2B45B8]", text: "text-[#2B45B8]", soft: "bg-[#2B45B8]/10", border: "border-[#2B45B8]/30", hex: "#2B45B8" },
  reporting: { label: "Factual reporting", short: "Reporting", dot: "bg-[#0F766E]", text: "text-[#0F766E]", soft: "bg-[#0F766E]/10", border: "border-[#0F766E]/30", hex: "#0F766E" },
  public_opinion: { label: "Public opinion", short: "Opinion", dot: "bg-[#B45309]", text: "text-[#B45309]", soft: "bg-[#B45309]/10", border: "border-[#B45309]/30", hex: "#B45309" },
  ai: { label: "AI interpretation", short: "AI", dot: "bg-[#6D28D9]", text: "text-[#6D28D9]", soft: "bg-[#6D28D9]/5", border: "border-[#6D28D9]/30", hex: "#6D28D9" },
};

export const CHANNEL_LABEL = {
  policy_document: "Policy document", news: "News", public_comment: "Public comment", survey: "Survey response",
  correspondence: "Citizen correspondence", call_transcript: "Call-center transcript", social: "Social post", hearing: "Hearing testimony", other: "Other",
};

export const AUTHOR_LABEL = {
  individual: "Individual", organization: "Organization", business: "Business", government: "Government",
  academic: "Academic", anonymous: "Anonymous", unknown: "Unknown",
};

export const TYPE_LABEL = {
  bill: "Bill", proposed_rule: "Proposed rule", final_rule: "Final rule", notice: "Notice",
  executive_order: "Executive order", state_legislation: "State legislation", other: "Policy",
};

export const CATEGORY_META = {
  provision: { label: "Key provision" },
  affected_program: { label: "Affected program" },
  stakeholder: { label: "Stakeholder group" },
  concern: { label: "Recurring concern" },
  support_reason: { label: "Reason for support" },
  emerging_issue: { label: "Emerging issue" },
  misunderstanding: { label: "Misunderstanding" },
  minority_view: { label: "Minority viewpoint" },
  conflict: { label: "Conflicting evidence" },
  open_question: { label: "Open question" },
};

export const FINDING_GROUPS = [
  { key: "policy", title: "What the policy says", note: "Grounded in policy language", categories: ["provision", "affected_program"] },
  { key: "people", title: "Who is affected", note: "Stakeholder groups and how", categories: ["stakeholder"] },
  { key: "voice", title: "What people are saying — and why", note: "Reasons, not just scores", categories: ["concern", "support_reason", "misunderstanding", "minority_view"] },
  { key: "signals", title: "Signals & tensions", note: "Emerging, contested, unresolved", categories: ["emerging_issue", "conflict", "open_question"] },
];

export const STANCE_META = {
  support: { label: "Support", hex: "#4D7C0F", pill: "bg-[#4D7C0F]/10 text-[#4D7C0F]" },
  oppose: { label: "Oppose", hex: "#B91C1C", pill: "bg-[#B91C1C]/10 text-[#B91C1C]" },
  question: { label: "Question", hex: "#0369A1", pill: "bg-[#0369A1]/10 text-[#0369A1]" },
  misunderstand: { label: "Misunderstanding", hex: "#C2410C", pill: "bg-[#C2410C]/10 text-[#C2410C]" },
  mixed: { label: "Mixed", hex: "#78716C", pill: "bg-[#78716C]/10 text-[#57534E]" },
  neutral: { label: "Neutral", hex: "#A8A29E", pill: "bg-[#A8A29E]/15 text-[#57534E]" },
};