// Returns existing sources for a dossier and the next free "S#" reference number.
export async function loadSourcesWithNextRef(base44, dossierId) {
  const existing = await base44.entities.Source.filter({ dossier_id: dossierId }, "created_date", 500);
  let max = 0;
  for (const s of existing) {
    const n = parseInt(String(s.ref || "").replace(/\D/g, ""), 10);
    if (n > max) max = n;
  }
  return { existing, next: max + 1 };
}