import { ShieldCheck, Quote, UserCheck, Scale, EyeOff, Cpu } from "lucide-react";

export default function GuardrailsCard({ dossier }) {
  const meta = dossier.analysis_meta || {};
  const rate = meta.citation_count ? Math.round((meta.verified_citation_count / meta.citation_count) * 100) : null;
  const items = [
    { icon: EyeOff, title: "Personal data redacted", body: "Emails, phones, SSNs, addresses and signed names are stripped before storage or analysis." },
    { icon: Quote, title: "Quotes verified", body: rate != null ? `${rate}% of AI citations matched their source verbatim. Unverified quotes are flagged.` : "Every AI citation is checked verbatim against its source." },
    { icon: Scale, title: "Representativeness surfaced", body: "Outlet concentration, form-letter campaigns and missing voices are flagged — volume is never treated as consensus." },
    { icon: UserCheck, title: "Human sign-off", body: "Only analyst-approved findings reach a briefing. Analyst notes override AI text." },
    { icon: Cpu, title: "Model", body: meta.engine || "Runs when you start analysis." },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        <p className="eyebrow text-foreground">Responsible AI guardrails</p>
      </div>
      <ul className="mt-5 space-y-5">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{title}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}