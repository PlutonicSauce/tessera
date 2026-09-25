import { STANCE_META } from "@/lib/evidence";

const VOICE = ["concern", "support_reason", "misunderstanding", "minority_view", "emerging_issue", "conflict"];
const WEIGHT = { widespread: 3, recurring: 2, isolated: 1, "n/a": 1 };
const ORDER = ["support", "mixed", "question", "misunderstand", "oppose"];

export default function StanceSpectrum({ findings }) {
  const voice = findings.filter((f) => VOICE.includes(f.category) && f.review_status !== "rejected");
  const totals = ORDER.map((k) => [k, voice.filter((f) => f.stance === k).reduce((n, f) => n + (WEIGHT[f.prevalence] || 1), 0)]);
  const sum = totals.reduce((n, [, v]) => n + v, 0);
  if (!sum) return null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl">Shape of public response</h3>
        <span className="text-xs text-muted-foreground">Themes weighted by estimated prevalence · not a poll, not representative</span>
      </div>
      <div className="flex h-10 overflow-hidden rounded-xl">
        {totals.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex items-center justify-center text-[11px] font-medium text-white transition-all duration-700" style={{ width: `${(v / sum) * 100}%`, background: STANCE_META[k].hex }}>
            {v / sum > 0.08 && `${Math.round((v / sum) * 100)}%`}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {totals.map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: STANCE_META[k].hex }} />
            {STANCE_META[k].label} · {voice.filter((f) => f.stance === k).length} themes
          </span>
        ))}
      </div>
    </div>
  );
}