import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DossierHeader from "@/components/dossier/DossierHeader";
import PipelineSteps from "@/components/dossier/PipelineSteps";
import PolicyTab from "@/components/dossier/PolicyTab";
import EvidenceTab from "@/components/evidence/EvidenceTab";
import InsightsTab from "@/components/insights/InsightsTab";
import RevisionsTab from "@/components/revisions/RevisionsTab";
import BriefingTab from "@/components/briefing/BriefingTab";

const TABS = [["policy", "Policy"], ["evidence", "Evidence"], ["insights", "Insights"], ["revisions", "Revisions"], ["briefing", "Briefing"]];

export default function Dossier() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState("policy");

  const dossierQ = useQuery({ queryKey: ["dossier", id], queryFn: () => base44.entities.Dossier.get(id) });
  const sourcesQ = useQuery({ queryKey: ["sources", id], queryFn: () => base44.entities.Source.filter({ dossier_id: id }, "created_date", 500) });
  const findingsQ = useQuery({ queryKey: ["findings", id], queryFn: () => base44.entities.Finding.filter({ dossier_id: id }, "created_date", 500) });
  const briefingsQ = useQuery({ queryKey: ["briefings", id], queryFn: () => base44.entities.Briefing.filter({ dossier_id: id }, "-created_date", 50) });

  const refresh = (...keys) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k, id] }));

  if (dossierQ.isLoading) {
    return <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8"><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>;
  }
  if (!dossierQ.data) {
    return <div className="mx-auto max-w-7xl px-5 py-24 text-center font-display text-3xl sm:px-8">Dossier not found.</div>;
  }

  const ctx = {
    dossier: dossierQ.data,
    sources: sourcesQ.data || [],
    findings: findingsQ.data || [],
    briefings: briefingsQ.data || [],
    refresh,
    goTo: setTab,
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <DossierHeader dossier={ctx.dossier} />
      <PipelineSteps {...ctx} />
      <Tabs value={tab} onValueChange={setTab} className="mt-10">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0 print:hidden">
          {TABS.map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 text-[15px] text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="policy" className="mt-8"><PolicyTab {...ctx} /></TabsContent>
        <TabsContent value="evidence" className="mt-8"><EvidenceTab {...ctx} /></TabsContent>
        <TabsContent value="insights" className="mt-8"><InsightsTab {...ctx} /></TabsContent>
        <TabsContent value="revisions" className="mt-8"><RevisionsTab {...ctx} /></TabsContent>
        <TabsContent value="briefing" className="mt-8"><BriefingTab {...ctx} /></TabsContent>
      </Tabs>
    </div>
  );
}