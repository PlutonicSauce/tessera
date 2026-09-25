import { useState } from "react";
import { Loader2, FileSignature } from "lucide-react";
import { tessera } from "@/api/tesseraClient";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import BriefingDocument from "@/components/briefing/BriefingDocument";

export default function BriefingTab({ dossier, sources, findings, briefings, refresh, goTo }) {
  const [audience, setAudience] = useState("leadership");
  const [selectedId, setSelectedId] = useState(null);
  const [running, setRunning] = useState(false);
  const approved = findings.filter((f) => ["approved", "edited"].includes(f.review_status)).length;
  const current = briefings.find((b) => b.id === selectedId) || briefings[0];

  const generate = async () => {
    setRunning(true);
    try {
      const { data } = await tessera.functions.invoke("generateBriefing", { dossier_id: dossier.id, audience });
      setSelectedId(data.briefing.id);
      refresh("briefings", "dossier");
    } catch (e) {
      toast({ title: "Briefing failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-6 print:hidden">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="eyebrow">Audience</p>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
            {[["leadership", "Leadership"], ["analyst", "Analyst"]].map(([k, l]) => (
              <button key={k} onClick={() => setAudience(k)} className={`rounded-full py-1.5 text-xs transition ${audience === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Built only from <span className="font-medium text-foreground">{approved} analyst-approved</span> findings.
            {approved === 0 && <button onClick={() => goTo("insights")} className="ml-1 text-[#2B45B8] hover:underline">Review findings →</button>}
          </p>
          <Button onClick={generate} disabled={running || approved === 0} className="mt-4 h-11 w-full rounded-full">
            {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Drafting…</> : <><FileSignature className="mr-2 h-4 w-4" />Draft briefing</>}
          </Button>
        </div>

        {briefings.length > 0 && (
          <div>
            <p className="eyebrow mb-2">History</p>
            <div className="space-y-1">
              {briefings.map((b) => (
                <button key={b.id} onClick={() => setSelectedId(b.id)} className={`w-full rounded-xl px-3 py-2.5 text-left transition ${current?.id === b.id ? "bg-card shadow-sm" : "hover:bg-card/60"}`}>
                  <div className="text-xs font-medium capitalize">{b.audience} brief {b.signed_off_by && "· signed"}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{new Date(b.created_date).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {current ? (
        <BriefingDocument briefing={current} dossier={dossier} sources={sources} onChange={() => refresh("briefings")} />
      ) : (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-border p-10 text-center">
          <div>
            <p className="font-display text-3xl">No briefing yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">Approve findings in Insights, then draft a cited leadership or analyst briefing here.</p>
          </div>
        </div>
      )}
    </div>
  );
}