import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TYPE_LABEL } from "@/lib/evidence";
import StatusPill from "@/components/shared/StatusPill";

export default function DossierCard({ dossier: d }) {
  const meta = d.analysis_meta || {};
  return (
    <Link
      to={`/dossier/${d.id}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(20,22,29,0.4)]"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{TYPE_LABEL[d.policy_type] || "Policy"}</span>
        <StatusPill status={d.status} />
      </div>
      <h3 className="mt-4 line-clamp-3 font-display text-[26px] leading-[1.1]">{d.title}</h3>
      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{d.agency || "—"}</p>
      <div className="mt-auto flex items-end justify-between pt-8">
        <div className="flex gap-5 font-mono text-[11px] text-muted-foreground">
          {d.docket_id && <span>{d.docket_id}</span>}
          {meta.source_count != null && <span>{meta.source_count} sources</span>}
          {meta.finding_count != null && <span>{meta.finding_count} findings</span>}
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}