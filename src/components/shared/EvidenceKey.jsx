import { CLASS_META } from "@/lib/evidence";

const NOTES = {
  policy_text: "What the law or rule actually says",
  reporting: "What journalists report as fact",
  public_opinion: "What people, groups and businesses think",
  ai: "What the model infers — always reviewable",
};

export default function EvidenceKey({ compact = false }) {
  return (
    <div className={compact ? "flex flex-wrap gap-x-5 gap-y-2" : "space-y-3"}>
      {Object.entries(CLASS_META).map(([k, m]) => (
        <div key={k} className="flex items-start gap-3">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-[3px] ${m.dot} ${k === "ai" ? "ring-1 ring-dashed ring-offset-1 ring-[#6D28D9]/40" : ""}`} />
          <div>
            <div className="text-sm font-medium">{m.label}</div>
            {!compact && <div className="text-xs text-muted-foreground">{NOTES[k]}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}