import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TYPE_LABEL } from "@/lib/evidence";
import StatusPill from "@/components/shared/StatusPill";

export default function DossierCard({ dossier: d }) {
  const meta = d.analysis_meta || {};
  return (
    <Link
      to={`/dossier/${d.id}`}
      className="group relative flex h-full flex-col rounded-3xl border border-white/5 bg-card/40 backdrop-blur-sm p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between">
        <span className="eyebrow text-primary/80">{TYPE_LABEL[d.policy_type] || "Policy"}</span>
        <StatusPill status={d.status} />
      </div>
      <h3 className="relative z-10 mt-5 line-clamp-3 font-display text-[28px] leading-[1.1] group-hover:text-primary transition-colors duration-300">{d.title}</h3>
      <p className="relative z-10 mt-3 line-clamp-1 text-sm text-muted-foreground font-medium">{d.agency || "—"}</p>
      <div className="relative z-10 mt-auto flex items-end justify-between pt-8">
        <div className="flex gap-4 font-mono text-[11px] text-muted-foreground">
          {d.docket_id && <span className="bg-white/5 px-2 py-1 rounded-md">{d.docket_id}</span>}
          {meta.source_count != null && <span className="bg-white/5 px-2 py-1 rounded-md">{meta.source_count} sources</span>}
          {meta.finding_count != null && <span className="bg-white/5 px-2 py-1 rounded-md">{meta.finding_count} findings</span>}
        </div>
        <div className="rounded-full bg-white/5 p-2 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
        </div>
      </div>
    </Link>
  );
}