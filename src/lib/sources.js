import { base44 } from "@/api/base44Client";

export function nextRefNumber(sources) {
  return sources.reduce((max, s) => Math.max(max, parseInt(String(s.ref || "").replace(/\D/g, ""), 10) || 0), 0) + 1;
}

// Assigns sequential S# references and saves the records.
export async function createSources(existing, records) {
  let n = nextRefNumber(existing);
  const withRefs = records.map((r) => ({ ...r, ref: `S${n++}` }));
  if (withRefs.length) await base44.entities.Source.bulkCreate(withRefs);
  return withRefs.length;
}