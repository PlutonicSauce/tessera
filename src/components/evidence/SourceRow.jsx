import { useState } from "react";
import { ExternalLink, Trash2, EyeOff } from "lucide-react";
import { tessera } from "@/api/tesseraClient";
import { CHANNEL_LABEL, AUTHOR_LABEL } from "@/lib/evidence";
import ClassBadge from "@/components/shared/ClassBadge";

export default function SourceRow({ source: s, onDeleted }) {
  const [open, setOpen] = useState(false);
  const long = (s.content || "").length > 260;

  const remove = async () => {
    await tessera.entities.Source.delete(s.id);
    onDeleted();
  };

  return (
    <div id={`src-${s.ref}`} className="group p-5 transition hover:bg-background/60">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">{s.ref}</span>
        <ClassBadge cls={s.evidence_class} />
        <span className="text-xs text-muted-foreground">
          {CHANNEL_LABEL[s.channel]}
          {s.evidence_class !== "policy_text" && ` · ${AUTHOR_LABEL[s.author_type] || "Unknown"}`}
          {s.outlet && ` · ${s.outlet}`}
          {s.published_date && ` · ${s.published_date}`}
        </span>
        {s.pii_redactions > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            <EyeOff className="h-3 w-3" />{s.pii_redactions} redacted
          </span>
        )}
        {s.is_headline_only && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Headline only</span>}
        <div className="ml-auto flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
          {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="rounded-md p-1.5 hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /></a>}
          <button onClick={remove} className="rounded-md p-1.5 hover:bg-muted" aria-label="Remove source"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      {s.title && s.title !== s.content && <p className="mt-2.5 font-medium leading-snug">{s.title}</p>}
      <p className={`mt-1.5 font-serif text-[15px] leading-7 text-foreground/85 ${open ? "" : "line-clamp-3"}`}>{s.content}</p>
      {long && (
        <button onClick={() => setOpen(!open)} className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:underline">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}