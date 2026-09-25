import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASS_META } from "@/lib/evidence";
import SourceRow from "@/components/evidence/SourceRow";
import ImportCommentsCard from "@/components/evidence/ImportCommentsCard";
import ImportNewsCard from "@/components/evidence/ImportNewsCard";
import AddSourceDialog from "@/components/evidence/AddSourceDialog";
import RepresentativenessPanel from "@/components/evidence/RepresentativenessPanel";

export default function EvidenceTab({ dossier, sources, refresh }) {
  const [cls, setCls] = useState("all");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const filtered = sources
    .filter((s) => cls === "all" || s.evidence_class === cls)
    .filter((s) => !q || `${s.title} ${s.content} ${s.outlet}`.toLowerCase().includes(q.toLowerCase()));
  const chips = [["all", `All · ${sources.length}`], ...["policy_text", "reporting", "public_opinion"].map((k) => [k, `${CLASS_META[k].short} · ${sources.filter((s) => s.evidence_class === k).length}`])];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {chips.map(([k, l]) => (
              <button key={k} onClick={() => setCls(k)} className={`rounded-full px-3 py-1.5 text-xs transition ${cls === k ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search evidence" className="h-9 w-full rounded-full pl-8 sm:w-52" />
            </div>
            <Button size="sm" className="h-9 rounded-full" onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Add</Button>
          </div>
        </div>

        <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {filtered.length === 0 ? (
            <div className="p-14 text-center">
              <p className="font-display text-2xl">No evidence yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Pull public comments and news coverage, or add feedback you've collected.</p>
            </div>
          ) : (
            filtered.map((s) => <SourceRow key={s.id} source={s} onDeleted={() => refresh("sources")} />)
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <ImportCommentsCard dossier={dossier} sources={sources} onDone={() => refresh("sources")} />
        <ImportNewsCard dossier={dossier} sources={sources} onDone={() => refresh("sources")} />
        <RepresentativenessPanel sources={sources} />
      </aside>

      <AddSourceDialog open={adding} onOpenChange={setAdding} dossier={dossier} sources={sources} onDone={() => refresh("sources")} />
    </div>
  );
}