import { useState } from "react";
import { FINDING_GROUPS } from "@/lib/evidence";
import AnalysisBar from "@/components/insights/AnalysisBar";
import StanceSpectrum from "@/components/insights/StanceSpectrum";
import FindingCard from "@/components/insights/FindingCard";

const FILTERS = [["all", "All"], ["pending", "Needs review"], ["approved", "Approved"], ["rejected", "Rejected"]];

export default function InsightsTab({ dossier, sources, findings, refresh }) {
  const [filter, setFilter] = useState("all");
  const byRef = Object.fromEntries(sources.map((s) => [s.ref, s]));
  const matches = (f) => filter === "all" || (filter === "approved" ? ["approved", "edited"].includes(f.review_status) : f.review_status === filter);
  const onChange = () => refresh("findings");

  return (
    <div className="space-y-10">
      <AnalysisBar dossier={dossier} sources={sources} findings={findings} refresh={refresh} />

      {findings.length > 0 && (
        <>
          <StanceSpectrum findings={findings} />
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-3 py-1.5 text-xs transition ${filter === k ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {l} · {findings.filter((f) => k === "all" || (k === "approved" ? ["approved", "edited"].includes(f.review_status) : f.review_status === k)).length}
              </button>
            ))}
          </div>
          {FINDING_GROUPS.map((g) => {
            const items = findings.filter((f) => g.categories.includes(f.category) && matches(f));
            if (!items.length) return null;
            return (
              <section key={g.key}>
                <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
                  <h3 className="font-display text-3xl">{g.title}</h3>
                  <span className="eyebrow">{g.note}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((f) => <FindingCard key={f.id} finding={f} byRef={byRef} onChange={onChange} />)}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}