import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { callModel } from "../../shared/llm.ts";

const SCHEMA = {
  type: "object",
  properties: { title: { type: "string" }, markdown: { type: "string" } },
  required: ["title", "markdown"],
};

const AUDIENCE = {
  leadership: `LEADERSHIP BRIEF (max ~450 words). Sections as "## " headings in this order: Bottom Line (3 bullets), What the Policy Does, What Reporting Shows, What the Public Is Saying (include reasons for support and opposition, plus minority views), Misunderstandings to Address, Confidence & Gaps, Decisions for Leadership.`,
  analyst: `ANALYST BRIEF (max ~900 words). Sections as "## " headings in this order: Summary, Key Provisions, Affected Programs & Stakeholders, Public Response by Theme (concerns, support reasons, prevalence), Minority & Conflicting Views, Misunderstandings, Emerging Issues, Evidence Quality, Representativeness & Bias, Open Questions for Analyst Judgment.`,
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { dossier_id, audience } = await req.json();
    const aud = audience === "analyst" ? "analyst" : "leadership";
    const dossier = await base44.entities.Dossier.get(dossier_id);
    if (!dossier) return Response.json({ error: "Dossier not found" }, { status: 404 });

    const all = await base44.entities.Finding.filter({ dossier_id }, "created_date", 300);
    const approved = all.filter((f) => f.review_status === "approved" || f.review_status === "edited");
    if (!approved.length) return Response.json({ error: "Approve at least one finding before generating a briefing." }, { status: 400 });

    const sources = await base44.entities.Source.filter({ dossier_id }, "created_date", 500);
    const refs = new Set(approved.flatMap((f) => (f.citations || []).map((c) => c.ref)));
    const sourceIndex = sources.filter((s) => refs.has(s.ref)).map((s) => `[${s.ref}] ${s.evidence_class} · ${s.channel} · ${s.outlet || s.author_type}: ${s.title || ""}`).join("\n");

    const findingsText = approved.map((f, i) =>
      `${i + 1}. (${f.category}; stance=${f.stance}; prevalence=${f.prevalence}; confidence=${f.confidence}) ${f.title} — ${f.detail}${f.uncertainty ? ` | Uncertainty: ${f.uncertainty}` : ""}${f.analyst_note ? ` | ANALYST NOTE (authoritative): ${f.analyst_note}` : ""} | Evidence: ${(f.citations || []).map((c) => `[${c.ref}] "${c.quote}"`).join("; ")}`
    ).join("\n");

    const meta = dossier.analysis_meta || {};
    const prompt = `Draft a briefing for "${dossier.title}" (${dossier.agency || ""}). Use ONLY the analyst-approved findings below — do not add facts, numbers or claims that are not in them. Analyst notes override the AI text.

${AUDIENCE[aud]}

Formatting rules:
- Cite evidence inline with bracketed refs exactly as given, e.g. [S3] or [POLICY], after each claim.
- Attribute clearly: "The rule states…" (policy language), "Coverage reports…" (reporting), "Commenters argue…" (opinion). Never present opinion as fact.
- State confidence in words where it matters (e.g., "moderate confidence").
- Do not name private individuals. No policy recommendations unless phrased as options for decision-makers.
- Do not include a title heading; start directly with the first section.

Coverage caveats from analysis: ${(meta.coverage_caveats || []).join("; ") || "none recorded"}
Overall uncertainty: ${meta.overall_uncertainty || "not recorded"}

APPROVED FINDINGS:
${findingsText}

SOURCE INDEX:
${sourceIndex}`;

    const { result, engine } = await callModel(base44, prompt, SCHEMA);
    const briefing = await base44.entities.Briefing.create({
      dossier_id,
      audience: aud,
      title: result.title,
      content: result.markdown,
      finding_count: approved.length,
      source_count: refs.size,
      engine,
    });
    await base44.entities.Dossier.update(dossier_id, { status: "briefed" });
    return Response.json({ briefing });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}