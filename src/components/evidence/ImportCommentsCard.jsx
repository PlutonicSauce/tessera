import { useState } from "react";
import { Loader2, MessagesSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function ImportCommentsCard({ dossier, sources, onDone }) {
  const imported = sources.filter((s) => s.origin === "regulations_gov").length;
  const [docket, setDocket] = useState(dossier.docket_id || "");
  const [page, setPage] = useState(Math.floor(imported / 25) + 1);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke("fetchPublicComments", { dossier_id: dossier.id, docket_id: docket, page });
      toast({
        title: data.created ? `Added ${data.created} public comments` : "No new comments added",
        description: data.message || `${data.attachment_only} attachment-only skipped · ${data.redactions} personal details redacted`,
      });
      setPage(page + 1);
      onDone();
    } catch (e) {
      toast({ title: "Couldn't load comments", description: e.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-4 w-4 text-[#B45309]" />
        <p className="text-sm font-medium">Public comments</p>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">Regulations.gov</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Pulls submitted comments for the docket, classifies submitter type and redacts personal data.</p>
      <div className="mt-4 flex gap-2">
        <Input value={docket} onChange={(e) => setDocket(e.target.value)} placeholder="Docket ID" className="h-9 font-mono text-xs" />
        <Button size="sm" className="h-9 shrink-0 rounded-full" onClick={run} disabled={loading || !docket.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : page > 1 ? "Next batch" : "Import"}
        </Button>
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">{imported} imported · batch {page} of up to 25</p>
    </div>
  );
}