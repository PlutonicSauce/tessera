import { useState } from "react";
import { Check, X, Pencil, Undo2, HelpCircle, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORY_META, STANCE_META } from "@/lib/evidence";
import CitationChip from "@/components/insights/CitationChip";
import ConfidenceMeter from "@/components/insights/ConfidenceMeter";
import EditFindingDialog from "@/components/insights/EditFindingDialog";

const POLICY_CATS = ["provision", "affected_program"];
const FRAME = {
  pending: "border-dashed border-[#6D28D9]/35",
  approved: "border-solid border-foreground/70",
  edited: "border-solid border-foreground/70",
  rejected: "border-dashed border-border opacity-55",
};

export default function FindingCard({ finding: f, byRef, onChange }) {
  const [editing, setEditing] = useState(false);
  const stance = STANCE_META[f.stance];

  const review = async (status, extra = {}) => {
    const me = await base44.auth.me();
    await base44.entities.Finding.update(f.id, { review_status: status, reviewed_by: me.full_name || me.email, reviewed_at: new Date().toISOString(), ...extra });
    onChange();
  };

  return (
    <article className={`flex flex-col rounded-2xl border bg-card p-5 transition ${FRAME[f.review_status]}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow">{CATEGORY_META[f.category]?.label}</span>
        {!POLICY_CATS.includes(f.category) && stance && f.stance !== "neutral" && <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${stance.pill}`}>{stance.label}</span>}
        {f.prevalence && f.prevalence !== "n/a" && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize text-muted-foreground">{f.prevalence}</span>}
        <span className="ml-auto"><ConfidenceMeter value={f.confidence} /></span>
      </div>
      <h4 className="mt-3 text-[17px] font-medium leading-snug">{f.title}</h4>
      <p className="mt-1.5 font-serif text-[15px] leading-7 text-foreground/85">{f.detail}</p>
      {f.stakeholder_group && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{f.stakeholder_group}</p>}
      {f.uncertainty && <p className="mt-2 flex gap-1.5 text-xs italic leading-relaxed text-muted-foreground"><HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 not-italic" />{f.uncertainty}</p>}
      {f.analyst_note && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs"><span className="font-medium">Analyst note:</span> {f.analyst_note}</p>}

      <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
        {(f.citations || []).map((c, i) => <CitationChip key={i} refId={c.ref} quote={c.quote} verified={c.verified} byRef={byRef} />)}
      </div>

      <div className="mt-auto flex items-center gap-1 border-t border-border pt-3">
        {f.review_status === "pending" ? (
          <>
            <button onClick={() => review("approved")} className="flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs text-background transition hover:opacity-90"><Check className="h-3.5 w-3.5" />Approve</button>
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition hover:bg-muted"><Pencil className="h-3.5 w-3.5" />Edit</button>
            <button onClick={() => review("rejected")} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted"><X className="h-3.5 w-3.5" />Reject</button>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground"><span className="font-medium capitalize text-foreground">{f.review_status}</span> by {f.reviewed_by}</span>
            <button onClick={() => review("pending")} className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted"><Undo2 className="h-3.5 w-3.5" />Undo</button>
          </>
        )}
      </div>
      <EditFindingDialog open={editing} onOpenChange={setEditing} finding={f} onSave={(data) => review("edited", data)} />
    </article>
  );
}