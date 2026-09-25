import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { callModel, quoteAppears } from "../../shared/llm.ts";
import { loadPolicyText, excerpt } from "../../shared/policyText.ts";

const SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          change_type: { type: "string", enum: ["added", "removed", "modified"] },
          section: { type: "string" },
          before: { type: "string" },
          after: { type: "string" },
          significance: { type: "string", enum: ["high", "medium", "low"] },
          affected_stakeholders: { type: "array", items: { type: "string" } },
          interpretation: { type: "string" },
        },
        required: ["change_type", "section", "significance", "interpretation"],
      },
    },
    unchanged_notes: { type: "string" },
  },
  required: ["headline", "changes"],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { dossier_id } = await req.json();
    const d = await base44.entities.Dossier.get(dossier_id);
    if (!d?.prior_version_text || !(d?.policy_text || d?.policy_text_uri)) return Response.json({ error: "Both a prior version and current policy text are required." }, { status: 400 });

    const prior = excerpt(d.prior_version_text, 20000);
    const current = excerpt(await loadPolicyText(base44, d), 20000);
    const prompt = `Compare two versions of the policy "${d.title}". Identify substantive changes only (ignore formatting, numbering and typo fixes). Order by significance.
For each change: "before" = verbatim excerpt (<=40 words) from the PRIOR version ("" if added); "after" = verbatim excerpt (<=40 words) from the CURRENT version ("" if removed). Copy excerpts exactly. "interpretation" = one or two neutral sentences on the practical effect — this is AI interpretation and will be labeled as such. List affected stakeholder groups (never individuals). "unchanged_notes" = notable provisions that stayed the same.

=== PRIOR VERSION ===
${prior}

=== CURRENT VERSION ===
${current}`;

    const { result, engine } = await callModel(base44, prompt, SCHEMA);
    const changes = (result.changes || []).map((c) => ({
      ...c,
      before_verified: c.before ? quoteAppears(c.before, prior) : null,
      after_verified: c.after ? quoteAppears(c.after, current) : null,
    }));
    const revision_analysis = { headline: result.headline, changes, unchanged_notes: result.unchanged_notes || "", engine, generated_at: new Date().toISOString() };
    await base44.entities.Dossier.update(dossier_id, { revision_analysis });
    return Response.json({ revision_analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}