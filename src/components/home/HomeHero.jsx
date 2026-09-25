import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvidenceKey from "@/components/shared/EvidenceKey";

const PIPELINE = ["Gather", "Analyze", "Review", "Brief"];

export default function HomeHero({ onNew }) {
  return (
    <section className="grid gap-12 py-16 md:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow text-primary">Evidence-grounded policy intelligence</p>
        <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          Read the rule. Hear the public. <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent italic">Show the evidence.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tessera connects authoritative policy text with public comments, news coverage and citizen feedback — then drafts
          findings where every claim is cited, quote-verified and signed off by a human analyst.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Button onClick={onNew} size="lg" className="h-12 rounded-full bg-primary hover:bg-primary/90 px-7 text-[15px] shadow-[0_0_20px_rgba(79,101,241,0.4)] transition-all hover:shadow-[0_0_30px_rgba(79,101,241,0.6)]">
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
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.4 }}
        className="relative group rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/20 to-transparent opacity-50 pointer-events-none" />
        <p className="eyebrow mb-5 relative z-10">Every sentence knows where it came from</p>
        <div className="relative z-10">
          <EvidenceKey />
        </div>
      </motion.div>
    </section>
  );
}