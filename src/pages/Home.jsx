import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import HomeHero from "@/components/home/HomeHero";
import DossierCard from "@/components/home/DossierCard";
import NewDossierDialog from "@/components/home/NewDossierDialog";

export default function Home() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: dossiers = [], isLoading } = useQuery({
    queryKey: ["dossiers"],
    queryFn: () => base44.entities.Dossier.list("-updated_date", 100),
  });

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <HomeHero onNew={() => setOpen(true)} />

      <section className="mt-6">
        <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2 className="mt-1 font-display text-3xl">Policy dossiers</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{dossiers.length} total</span>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : dossiers.length === 0 ? (
          <button onClick={() => setOpen(true)} className="w-full rounded-2xl border border-dashed border-border p-16 text-center transition hover:bg-card">
            <p className="font-display text-3xl">Start your first dossier</p>
            <p className="mt-2 text-sm text-muted-foreground">Import a live rule from the Federal Register, or paste any bill or regulation.</p>
          </button>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {dossiers.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}>
                <DossierCard dossier={d} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <NewDossierDialog open={open} onOpenChange={setOpen} onCreated={(d) => navigate(`/dossier/${d.id}`)} />
    </div>
  );
}