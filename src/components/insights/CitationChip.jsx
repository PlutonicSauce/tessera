import { Check, AlertCircle, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CLASS_META, CHANNEL_LABEL } from "@/lib/evidence";
import ClassBadge from "@/components/shared/ClassBadge";

export default function CitationChip({ refId, quote, verified, byRef }) {
  const src = refId === "POLICY" ? null : byRef[refId];
  const cls = src ? src.evidence_class : "policy_text";
  const m = CLASS_META[cls];
  const hasQuote = quote != null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 align-middle font-mono text-[10px] transition hover:shadow-sm ${m.border} ${m.soft} ${m.text}`}>
          {refId}
          {hasQuote && (verified ? <Check className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5 text-[#B91C1C]" />)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-xl p-4" align="start">
        <div className="flex items-center justify-between">
          <ClassBadge cls={cls} />
          <span className="font-mono text-[10px] text-muted-foreground">{refId}</span>
        </div>
        <p className="mt-2 text-sm font-medium leading-snug">{src ? src.title || CHANNEL_LABEL[src.channel] : "Policy text"}</p>
        {src?.outlet && <p className="text-xs text-muted-foreground">{src.outlet}{src.published_date && ` · ${src.published_date}`}</p>}
        <blockquote className={`mt-3 border-l-2 pl-3 font-serif text-[14px] italic leading-6 ${m.border}`}>
          “{hasQuote ? quote : (src?.content || "").slice(0, 220)}”
        </blockquote>
        {hasQuote && (
          <p className={`mt-3 flex items-center gap-1.5 text-[11px] ${verified ? "text-[#4D7C0F]" : "text-[#B91C1C]"}`}>
            {verified ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {verified ? "Quote verified verbatim in source" : "Could not verify verbatim — check the source"}
          </p>
        )}
        {src?.url && (
          <a href={src.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-[#2B45B8] hover:underline">
            Open source <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </PopoverContent>
    </Popover>
  );
}