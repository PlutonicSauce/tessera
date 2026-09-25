import { Check, AlertCircle, Sparkles } from "lucide-react";

const TYPE = {
  added: { label: "Added", cls: "bg-[#4D7C0F]/10 text-[#4D7C0F]" },
  removed: { label: "Removed", cls: "bg-[#B91C1C]/10 text-[#B91C1C]" },
  modified: { label: "Modified", cls: "bg-[#2B45B8]/10 text-[#2B45B8]" },
};

function Excerpt({ label, text, verified, tone }) {
  if (!text) return null;
  return (
    <div className={`rounded-xl p-4 ${tone}`}>
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        <span className={`flex items-center gap-1 normal-case tracking-normal ${verified ? "text-[#4D7C0F]" : "text-[#B91C1C]"}`}>
          {verified ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}{verified ? "verbatim" : "unverified"}
        </span>
      </div>
      <p className="font-serif text-[14px] leading-6">{text}</p>
    </div>
  );
}

export default function ChangeCard({ change: c }) {
  const t = TYPE[c.change_type] || TYPE.modified;
  return (
    <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${t.cls}`}>{t.label}</span>
        <span className="text-sm font-medium">{c.section}</span>
        <span className="ml-auto eyebrow">{c.significance} significance</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Excerpt label="Before" text={c.before} verified={c.before_verified} tone="bg-[#B91C1C]/[0.04]" />
        <Excerpt label="After" text={c.after} verified={c.after_verified} tone="bg-[#4D7C0F]/[0.05]" />
      </div>
      <p className="mt-4 flex gap-2 text-sm leading-relaxed text-foreground/85">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6D28D9]" />
        <span><span className="font-medium text-[#6D28D9]">AI interpretation: </span>{c.interpretation}</span>
      </p>
      {c.affected_stakeholders?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.affected_stakeholders.map((s) => <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">{s}</span>)}
        </div>
      )}
    </article>
  );
}