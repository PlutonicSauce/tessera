import { Check } from "lucide-react";

export default function PipelineSteps({ dossier, sources, findings, briefings, goTo }) {
  const reviewed = findings.filter((f) => f.review_status !== "pending").length;
  const steps = [
    { tab: "evidence", title: "Gather evidence", sub: `${sources.length} sources`, done: sources.length > 0 },
    { tab: "insights", title: "AI analysis", sub: dossier.last_analyzed_at ? `${findings.length} findings drafted` : "Not run yet", done: !!dossier.last_analyzed_at },
    { tab: "insights", title: "Analyst review", sub: findings.length ? `${reviewed} of ${findings.length} reviewed` : "Awaiting findings", done: findings.length > 0 && reviewed === findings.length },
    { tab: "briefing", title: "Briefing", sub: briefings.length ? `${briefings.length} drafted` : "Not drafted", done: briefings.some((b) => b.signed_off_by) },
  ];
  const current = steps.findIndex((s) => !s.done);

  return (
    <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl md:grid-cols-4 print:hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
      {steps.map((s, i) => (
        <button key={s.title} onClick={() => goTo(s.tab)} className="group flex items-start gap-3 bg-card/40 p-5 text-left transition-all duration-300 hover:bg-white/5 hover:shadow-inner">
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] transition-colors duration-300 ${
              s.done ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(79,101,241,0.5)]" : i === current ? "border-2 border-primary text-primary" : "border border-border text-muted-foreground"
            }`}
          >
            {s.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span>
            <span className="block text-sm font-medium group-hover:text-primary transition-colors">{s.title}</span>
            <span className="block text-xs text-muted-foreground">{s.sub}</span>
          </span>
        </button>
      ))}
    </div>
  );
}