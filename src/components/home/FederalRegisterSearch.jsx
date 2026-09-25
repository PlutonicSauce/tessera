import { useState } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const SUGGESTIONS = ["SNAP work requirements", "artificial intelligence hiring", "PFAS drinking water", "student loan repayment"];

export default function FederalRegisterSearch({ onCreated }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("PRORULE");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);

  const search = async (q = query) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    try {
      const r = await base44.functions.invoke("searchFederalRegister", { query: q, type: type === "any" ? "" : type });
      setResults(r.data.results);
    } catch (e) {
      toast({ title: "Search failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const importDoc = async (doc) => {
    setImporting(doc.document_number);
    try {
      const r = await base44.functions.invoke("importFederalRegister", { document_number: doc.document_number });
      const d = await base44.entities.Dossier.create({ ...r.data.dossier, status: "gathering" });
      onCreated(d);
    } catch (e) {
      toast({ title: "Import failed", description: e.response?.data?.error || e.message, variant: "destructive" });
      setImporting(null);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rules, notices, topics…" className="h-11 rounded-full pl-10" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-11 w-36 rounded-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PRORULE">Proposed rules</SelectItem>
            <SelectItem value="RULE">Final rules</SelectItem>
            <SelectItem value="NOTICE">Notices</SelectItem>
            <SelectItem value="any">All types</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="h-11 rounded-full px-5" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {!results && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => search(s)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-foreground/40 hover:text-foreground">{s}</button>
          ))}
        </div>
      )}

      {results && (
        <div className="mt-5 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {results.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No documents found. Try broader terms.</p>}
          {results.map((d) => (
            <div key={d.document_number} className="rounded-xl border border-border p-4 transition hover:bg-background">
              <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                <span>{d.type}</span><span>{d.publication_date}</span>
                {d.comments_count != null && <span>{d.comments_count.toLocaleString()} comments</span>}
              </div>
              <p className="mt-1.5 font-medium leading-snug">{d.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.agency}</p>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="outline" className="rounded-full" disabled={!!importing} onClick={() => importDoc(d)}>
                  {importing === d.document_number ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Importing full text…</> : <>Create dossier <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}