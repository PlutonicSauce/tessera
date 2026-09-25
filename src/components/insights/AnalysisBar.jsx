import { useEffect, useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { tessera } from "@/api/tesseraClient";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import AIBlock from "@/components/shared/AIBlock";

const STAGES = ["Reading the policy text…", "Weighing every source…", "Separating fact from opinion…", "Preserving minority views…", "Verifying quotes against sources…"];

function Stat({ label, value }) {
  return (
    <div>
      <div className="font-display text-4xl leading-none">{value}</div>
      <div className="eyebrow mt-2">{label}</div>
    </div>
  );
}

export default function AnalysisBar({ dossier, sources, findings, refresh }) {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const meta = dossier.analysis_meta || {};

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2600);
    return () => clearInterval(t);
  }, [running]);

  const run = async () => {
    setRunning(true);
    setStage(0);
    try {
      await tessera.functions.invoke("analyzeDossier", { dossier_id: dossier.id });
      refresh("findings", "dossier");
    } catch (e) {
      toast({ title: "Analysis failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const reviewed = findings.filter((f) => f.review_status !== "pending").length;
  const rate = meta.citation_count ? Math.round((meta.verified_citation_count / meta.citation_count) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {findings.length ? (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat label="Findings" value={findings.length} />
            <Stat label="Quotes verified" value={`${rate}%`} />
            <Stat label="Reviewed" value={`${reviewed}/${findings.length}`} />
            <Stat label="Sources read" value={meta.source_count ?? sources.length} />
          </div>
        ) : (
          <div>
            <h3 className="font-display text-3xl">Draft evidence-grounded findings</h3>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">Analyzes the policy text alongside {sources.length} sources. Every finding cites verbatim evidence and waits for your review.</p>
          </div>
        )}
        <Button onClick={run} disabled={running} size="lg" className="h-12 shrink-0 rounded-full px-6">
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{STAGES[stage]}</> : findings.length ? <><RefreshCw className="mr-2 h-4 w-4" />Re-run analysis</> : <><Sparkles className="mr-2 h-4 w-4" />Run analysis</>}
        </Button>
      </div>
      {findings.length > 0 && <p className="mt-4 text-xs text-muted-foreground">Re-running replaces pending and rejected findings; approved and edited findings are kept. Model: {meta.engine}</p>}

      {(meta.coverage_caveats?.length > 0 || meta.overall_uncertainty) && (
        <AIBlock label="Coverage caveats & uncertainty" className="mt-6">
          {meta.overall_uncertainty && <p className="font-serif text-[16px] leading-7">{meta.overall_uncertainty}</p>}
          <ul className="mt-3 space-y-1.5">
            {(meta.coverage_caveats || []).map((c) => <li key={c} className="flex gap-2 text-sm text-foreground/80"><span className="text-[#6D28D9]">—</span>{c}</li>)}
          </ul>
        </AIBlock>
      )}
    </div>
  );
}