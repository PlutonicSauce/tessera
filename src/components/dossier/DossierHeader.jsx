import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TYPE_LABEL } from "@/lib/evidence";
import StatusPill from "@/components/shared/StatusPill";

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-mono text-[13px]">{value}</div>
    </div>
  );
}

export default function DossierHeader({ dossier: d }) {
  return (
    <header className="pt-8 print:hidden">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All dossiers
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="eyebrow">{TYPE_LABEL[d.policy_type] || "Policy"}</span>
        <span className="h-3 w-px bg-border" />
        <span className="text-sm text-muted-foreground">{d.agency}</span>
        <StatusPill status={d.status} />
      </div>
      <h1 className="mt-3 max-w-5xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{d.title}</h1>
      <div className="mt-7 flex flex-wrap items-end gap-x-10 gap-y-4">
        <Meta label="FR document" value={d.fr_document_number} />
        <Meta label="Docket" value={d.docket_id} />
        <Meta label="Published" value={d.publication_date} />
        <Meta label="Comments close" value={d.comment_deadline} />
        {d.source_url && (
          <a href={d.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#2B45B8] hover:underline">
            Official source <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </header>
  );
}