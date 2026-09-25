import { useState } from "react";
import { Loader2, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { tessera } from "@/api/tesseraClient";

const STOP = new Set(["the", "of", "and", "for", "to", "a", "in", "on", "program", "rule", "act", "establishing", "implementation", "provisions", "amendments", "regulations"]);
const defaultQuery = (title) => title.split(/[^A-Za-z]+/).filter((w) => w.length > 2 && !STOP.has(w.toLowerCase())).slice(0, 4).join(" ");

export default function ImportNewsCard({ dossier, onDone }) {
  const [q, setQ] = useState(defaultQuery(dossier.title || ""));
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await tessera.functions.invoke("fetchNews", { dossier_id: dossier.id, query: q });
      toast({ title: data.created ? `Added ${data.created} news reports` : "No new coverage found", description: data.message || `Headline-level coverage via ${data.via}, last 3 months.` });
      onDone();
    } catch (e) {
      toast({ title: "News search failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-[#0F766E]" />
        <p className="text-sm font-medium">News coverage</p>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">GDELT + News · 90 days</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Global news monitoring. Outlets are tracked so concentration and bias can be flagged.</p>
      <div className="mt-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keywords" className="h-9 text-xs" />
        <Button size="sm" className="h-9 shrink-0 rounded-full" onClick={run} disabled={loading || q.trim().length < 3}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>
    </div>
  );
}