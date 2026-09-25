import ReactMarkdown from "react-markdown";
import { Printer, Copy, BadgeCheck } from "lucide-react";
import { tessera } from "@/api/tesseraClient";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import CitationChip from "@/components/insights/CitationChip";
import EvidenceKey from "@/components/shared/EvidenceKey";

const REF_GROUP = /\[((?:S\d+|POLICY)(?:\s*[,;]\s*(?:S\d+|POLICY))*)\]/g;
const toChips = (md) => md.replace(REF_GROUP, (_, g) => g.split(/[,;]/).map((r) => ` \`${r.trim()}\``).join(""));

export default function BriefingDocument({ briefing: b, dossier, sources, onChange }) {
  const byRef = Object.fromEntries(sources.map((s) => [s.ref, s]));

  const signOff = async () => {
    const me = await tessera.auth.me();
    await tessera.entities.Briefing.update(b.id, { signed_off_by: me.full_name || me.email, signed_off_at: new Date().toISOString() });
    onChange();
  };
  const copy = async () => {
    await navigator.clipboard.writeText(`# ${b.title}\n\n${b.content}`);
    toast({ title: "Briefing copied as Markdown" });
  };

  return (
    <article className="rounded-2xl border border-border bg-card shadow-[0_40px_80px_-50px_rgba(20,22,29,0.35)] print:border-0 print:shadow-none">
      <div className={`flex flex-wrap items-center gap-3 rounded-t-2xl px-6 py-3 text-xs sm:px-10 ${b.signed_off_by ? "bg-[#0F766E]/10 text-[#0F766E]" : "bg-[#B45309]/10 text-[#B45309]"}`}>
        {b.signed_off_by ? <><BadgeCheck className="h-4 w-4" />Signed off by {b.signed_off_by} · {new Date(b.signed_off_at).toLocaleDateString()}</> : "DRAFT — AI-assisted, awaiting analyst sign-off"}
        <div className="ml-auto flex gap-1 print:hidden">
          <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs" onClick={copy}><Copy className="mr-1 h-3.5 w-3.5" />Copy</Button>
          <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs" onClick={() => window.print()}><Printer className="mr-1 h-3.5 w-3.5" />Print</Button>
          {!b.signed_off_by && <Button size="sm" className="h-7 rounded-full text-xs" onClick={signOff}>Sign off</Button>}
        </div>
      </div>

      <div className="px-6 py-10 sm:px-12 sm:py-14">
        <p className="eyebrow">{b.audience === "analyst" ? "Analyst briefing" : "Leadership briefing"} · {dossier.agency}</p>
        <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{b.title}</h2>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          {b.finding_count} approved findings · {b.source_count} cited sources · {b.engine}
        </p>
        <div className="briefing-prose mt-4">
          <ReactMarkdown components={{ code: ({ children }) => <CitationChip refId={String(children)} byRef={byRef} /> }}>{toChips(b.content || "")}</ReactMarkdown>
        </div>
        <div className="mt-14 border-t border-border pt-6">
          <EvidenceKey compact />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Drafted with AI from analyst-approved findings only. Bracketed references link to verifiable sources. Public comments are self-selected and not a
            representative sample. Final conclusions are the responsibility of the signing analyst.
          </p>
        </div>
      </div>
    </article>
  );
}