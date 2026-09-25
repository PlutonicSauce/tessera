import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { callModel, quoteAppears } from "../../shared/llm.ts";
import { loadPolicyText, excerpt } from "../../shared/policyText.ts";

const CATEGORIES = ["provision", "affected_program", "stakeholder", "concern", "support_reason", "emerging_issue", "misunderstanding", "minority_view", "conflict", "open_question"];

const SCHEMA = {
  type: "object",
  properties: {
    policy_summary: { type: "string", description: "3-5 sentence plain-language summary of what the policy text itself does. Policy language only." },
    findings: {
      type: "array",
      minItems: 12,
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: CATEGORIES },
          title: { type: "string" },
          detail: { type: "string" },
          stance: { type: "string", enum: ["support", "oppose", "question", "misunderstand", "mixed", "neutral"] },
          stakeholder_group: { type: "string" },
          prevalence: { type: "string", enum: ["widespread", "recurring", "isolated", "n/a"] },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
          uncertainty: { type: "string" },
          citations: { type: "array", items: { type: "object", properties: { ref: { type: "string" }, quote: { type: "string" } }, required: ["ref", "quote"] } },
        },
        required: ["category", "title", "detail", "stance", "confidence", "citations"],
      },
    },
    coverage_caveats: { type: "array", items: { type: "string" } },
    overall_uncertainty: { type: "string" },
  },
  required: ["policy_summary", "findings", "coverage_caveats", "overall_uncertainty"],
};

const CLASS_LABEL = { policy_text: "POLICY LANGUAGE", reporting: "FACTUAL REPORTING", public_opinion: "PUBLIC OPINION" };

function buildPrompt(dossier, policyText, sources) {
  let budget = 60000;
  const blocks = [];
  for (const s of sources) {
    const body = String(s.content || "").slice(0, 1400);
    if (budget - body.length < 0) break;
    budget -= body.length;
    blocks.push(`[${s.ref}] class=${CLASS_LABEL[s.evidence_class]} channel=${s.channel} author=${s.author_type || "unknown"} outlet=${s.outlet || "-"}${s.is_headline_only ? " (HEADLINE ONLY)" : ""}\n${body}`);
  }
  return `You are assisting a government policy analyst. Produce evidence-grounded findings connecting the policy text with public response and news coverage. A human analyst will review every finding; you draft, they decide.

POLICY: "${dossier.title}" (${dossier.policy_type}, ${dossier.agency || "agency unknown"})
[POLICY] class=POLICY LANGUAGE
${dossier.abstract ? `ABSTRACT: ${dossier.abstract}\n\n` : ""}${excerpt(policyText, 26000)}

EVIDENCE CORPUS (${blocks.length} items):
${blocks.join("\n\n")}

RULES:
1. Every finding MUST cite 1-4 sources using the exact ref ("POLICY" or "S#") and a VERBATIM quote of 5-30 words copied exactly from that source. Never paraphrase inside quotes. Never invent refs.
2. Keep evidence classes distinct: describe what the policy SAYS using POLICY citations; what news REPORTS using reporting sources; what people THINK using public opinion sources. Do not present opinion as fact.
3. Aim for 14-24 distinct, non-overlapping findings across categories: 3-6 "provision" (key provisions, cite POLICY), 1-4 "affected_program", 2-6 "stakeholder" (groups affected and how), recurring "concern" and "support_reason" items explaining WHY people hold positions, "emerging_issue" (new or rising themes), "misunderstanding" (public claims that conflict with the actual policy text — cite both the claim and POLICY), "conflict" (sources that contradict each other), "minority_view" (distinct viewpoints held by few — preserve them, do not average away), and "open_question" (what evidence cannot answer).
4. prevalence: widespread / recurring / isolated based on how many sources in the corpus express it; use n/a for provisions and programs. Volume of comments is NOT representative of the population — say so where relevant.
5. confidence reflects evidence strength (number, independence and directness of sources). uncertainty explains in one sentence what could make the finding wrong (e.g., small sample, headline-only coverage, organized comment campaign, ambiguous text).
6. Never include personal names, contact details or identifying information about private individuals. Refer to stakeholder groups, not people.
7. Do not infer demographics that the sources don't state. Stay neutral; no policy recommendations.
8. coverage_caveats: list concrete gaps in representativeness or source bias (e.g., "No correspondence from rural residents", "News coverage dominated by 2 outlets", "Only headlines available for reporting").`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { dossier_id } = await req.json();
    const dossier = await base44.entities.Dossier.get(dossier_id);
    if (!dossier) return Response.json({ error: "Dossier not found" }, { status: 404 });
    if (!dossier.policy_text && !dossier.abstract) return Response.json({ error: "Add policy text before running analysis" }, { status: 400 });

    const sources = await base44.entities.Source.filter({ dossier_id }, "created_date", 150);
    const fullText = await loadPolicyText(base44, dossier);
    const { result, engine } = await callModel(base44, buildPrompt(dossier, fullText, sources), SCHEMA);

    const byRef = Object.fromEntries(sources.map((s) => [s.ref, s]));
    const policyText = `${fullText}\n${dossier.abstract || ""}`;
    let totalCites = 0;
    let verifiedCites = 0;

    const findings = (result.findings || []).filter((f) => CATEGORIES.includes(f.category)).map((f) => {
      const citations = (f.citations || []).map((c) => {
        const ref = String(c.ref || "").replace(/[\[\]]/g, "").trim().toUpperCase();
        const src = ref === "POLICY" ? null : byRef[ref];
        if (ref !== "POLICY" && !src) return null;
        const text = src ? `${src.title || ""} ${src.content || ""}` : policyText;
        const verified = quoteAppears(c.quote, text);
        totalCites++;
        if (verified) verifiedCites++;
        return { ref, source_id: src?.id || "", quote: String(c.quote || "").slice(0, 400), verified };
      }).filter(Boolean);

      let confidence = f.confidence || "medium";
      let uncertainty = f.uncertainty || "";
      if (!citations.some((c) => c.verified)) {
        confidence = "low";
        uncertainty = `No quote could be verified verbatim against the cited sources. ${uncertainty}`.trim();
      }
      return {
        dossier_id,
        category: f.category,
        title: String(f.title || "").slice(0, 200),
        detail: f.detail || "",
        stance: f.stance || "neutral",
        stakeholder_group: f.stakeholder_group || "",
        prevalence: f.prevalence || "n/a",
        confidence,
        uncertainty,
        citations,
        review_status: "pending",
      };
    });

    const old = await base44.entities.Finding.filter({ dossier_id }, "-created_date", 500);
    await Promise.all(old.filter((f) => f.review_status === "pending" || f.review_status === "rejected").map((f) => base44.entities.Finding.delete(f.id)));
    if (findings.length) await base44.entities.Finding.bulkCreate(findings);

    const meta = {
      engine,
      policy_summary: result.policy_summary,
      coverage_caveats: result.coverage_caveats || [],
      overall_uncertainty: result.overall_uncertainty || "",
      source_count: sources.length,
      finding_count: findings.length,
      citation_count: totalCites,
      verified_citation_count: verifiedCites,
    };
    await base44.entities.Dossier.update(dossier_id, { analysis_meta: meta, status: "in_review", last_analyzed_at: new Date().toISOString() });
    return Response.json({ ok: true, ...meta });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}