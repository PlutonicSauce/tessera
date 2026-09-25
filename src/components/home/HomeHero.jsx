import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvidenceKey from "@/components/shared/EvidenceKey";

const PIPELINE = ["Gather", "Analyze", "Review", "Brief"];

export default function HomeHero({ onNew }) {
  return (
    <section className="grid gap-12 py-16 md:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow">Evidence-grounded policy intelligence</p>
        <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          Read the rule. Hear the public. <em className="text-[#2B45B8]">Show the evidence.</em>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tessera connects authoritative policy text with public comments, news coverage and citizen feedback — then drafts
          findings where every claim is cited, quote-verified and signed off by a human analyst.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Button onClick={onNew} size="lg" className="h-12 rounded-full px-7 text-[15px]">
            New dossier <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {PIPELINE.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                {p}
                {i < PIPELINE.length - 1 && <span className="h-px w-4 bg-border" />}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
        className="rounded-2xl border border-border bg-card p-7 shadow-[0_30px_60px_-40px_rgba(20,22,29,0.35)]"
      >
        <p className="eyebrow mb-5">Every sentence knows where it came from</p>
        <EvidenceKey />
      </motion.div>
    </section>
  );
}