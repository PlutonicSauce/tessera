import { AlertTriangle, Scale } from "lucide-react";
import { AUTHOR_LABEL } from "@/lib/evidence";
import { computeRepresentativeness } from "@/lib/representativeness";

const AUTHOR_COLORS = { individual: "#B45309", organization: "#2B45B8", business: "#0F766E", government: "#6D28D9", academic: "#0369A1", anonymous: "#A8A29E", unknown: "#D6D3D1" };

export default function RepresentativenessPanel({ sources }) {
  const r = computeRepresentativeness(sources);
  const authors = Object.entries(r.byAuthor).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4" />
        <p className="text-sm font-medium">Who is speaking?</p>
      </div>

      {r.opinionTotal > 0 && (
        <div className="mt-4">
          <p className="eyebrow mb-2">Public voices by submitter · {r.opinionTotal}</p>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            {authors.map(([k, n]) => <div key={k} style={{ width: `${(n / r.opinionTotal) * 100}%`, background: AUTHOR_COLORS[k] }} />)}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            {authors.map(([k, n]) => (
              <span key={k} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: AUTHOR_COLORS[k] }} />{AUTHOR_LABEL[k]} {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {r.topOutlets.length > 0 && (
        <div className="mt-5">
          <p className="eyebrow mb-2">Top outlets · {r.reportingTotal} reports</p>
          {r.topOutlets.map(([o, n]) => (
            <div key={o} className="flex items-center gap-2 py-0.5 text-xs">
              <span className="w-32 truncate text-muted-foreground">{o}</span>
              <div className="h-1.5 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${(n / r.reportingTotal) * 100}%` }} /></div>
              <span className="w-5 text-right font-mono text-[10px]">{n}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2 border-t border-border pt-4">
        {r.warnings.map((w) => (
          <p key={w} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]" />{w}
          </p>
        ))}
      </div>
    </div>
  );
}