import { FileText } from "lucide-react";
import { tessera } from "@/api/tesseraClient";
import { Button } from "@/components/ui/button";
import AIBlock from "@/components/shared/AIBlock";
import ClassBadge from "@/components/shared/ClassBadge";
import GuardrailsCard from "@/components/dossier/GuardrailsCard";

export default function PolicyTab({ dossier: d }) {
  const summary = d.analysis_meta?.policy_summary;
  const openFull = async () => {
    const { signed_url } = await tessera.integrations.Core.CreateFileSignedUrl({ file_uri: d.policy_text_uri, expires_in: 600 });
    window.open(signed_url, "_blank");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        {summary && (
          <AIBlock label="AI summary of the policy language">
            <p className="font-serif text-[17px] leading-8">{summary}</p>
          </AIBlock>
        )}

        {d.abstract && (
          <section>
            <ClassBadge cls="policy_text" label="Official abstract" />
            <p className="mt-3 font-serif text-[17px] leading-8 text-foreground/90">{d.abstract}</p>
          </section>
        )}

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ClassBadge cls="policy_text" label="Policy text" />
              {d.full_text_length > (d.policy_text || "").length && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  excerpt · full text {d.full_text_length.toLocaleString()} chars analyzed
                </span>
              )}
            </div>
            {d.policy_text_uri && (
              <Button variant="outline" size="sm" className="rounded-full" onClick={openFull}>
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Open full text
              </Button>
            )}
          </div>
          <div className="max-h-[640px] overflow-y-auto rounded-2xl border border-[#2B45B8]/20 bg-card p-6 sm:p-8">
            <pre className="whitespace-pre-wrap font-serif text-[15px] leading-7 text-foreground/90">{d.policy_text || "No policy text added."}</pre>
          </div>
        </section>
      </div>
      <aside className="space-y-6">
        <GuardrailsCard dossier={d} />
      </aside>
    </div>
  );
}