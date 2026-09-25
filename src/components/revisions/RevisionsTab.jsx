import { useState } from "react";
import { Loader2, GitCompare } from "lucide-react";
import { tessera } from "@/api/tesseraClient";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import ClassBadge from "@/components/shared/ClassBadge";
import ChangeCard from "@/components/revisions/ChangeCard";

export default function RevisionsTab({ dossier: d, refresh }) {
  const [prior, setPrior] = useState(d.prior_version_text || "");
  const [running, setRunning] = useState(false);
  const ra = d.revision_analysis;

  const compare = async () => {
    setRunning(true);
    try {
      await tessera.entities.Dossier.update(d.id, { prior_version_text: prior.slice(0, 16000) });
      await tessera.functions.invoke("compareRevisions", { dossier_id: d.id });
      refresh("dossier");
    } catch (e) {
      toast({ title: "Comparison failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between"><ClassBadge cls="policy_text" label="Prior version" /><span className="font-mono text-[10px] text-muted-foreground">{prior.length.toLocaleString()} / 16,000</span></div>
          <Textarea value={prior} onChange={(e) => setPrior(e.target.value)} rows={14} maxLength={16000} placeholder="Paste the earlier draft, introduced bill, or proposed rule text…" className="rounded-2xl bg-card p-5 font-serif text-[14px] leading-6" />
        </div>
        <div>
          <div className="mb-2"><ClassBadge cls="policy_text" label="Current version (this dossier)" /></div>
          <pre className="h-[318px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-border bg-card p-5 font-serif text-[14px] leading-6 text-foreground/80">{d.policy_text}</pre>
        </div>
      </div>
      <div className="flex justify-center">
        <Button onClick={compare} disabled={running || prior.trim().length < 50} size="lg" className="h-12 rounded-full px-7">
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Comparing versions…</> : <><GitCompare className="mr-2 h-4 w-4" />Compare versions</>}
        </Button>
      </div>

      {ra && (
        <section>
          <p className="eyebrow">What changed</p>
          <h3 className="mt-2 max-w-4xl font-display text-4xl leading-tight">{ra.headline}</h3>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">{ra.changes?.length} substantive changes · {ra.engine}</p>
          <div className="mt-6 space-y-4">
            {(ra.changes || []).map((c, i) => <ChangeCard key={i} change={c} />)}
          </div>
          {ra.unchanged_notes && <p className="mt-6 text-sm text-muted-foreground"><span className="font-medium text-foreground">Unchanged: </span>{ra.unchanged_notes}</p>}
        </section>
      )}
    </div>
  );
}