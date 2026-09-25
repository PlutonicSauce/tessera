import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";

const TYPE_MAP = { "Proposed Rule": "proposed_rule", Rule: "final_rule", Notice: "notice", "Presidential Document": "executive_order" };
const MAX_TEXT = 16000;

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|h\d|li|pre|br)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { document_number } = await req.json();
    const num = String(document_number || "").trim();
    if (!/^[\w-]{4,30}$/.test(num)) return Response.json({ error: "Invalid document number" }, { status: 400 });

    const res = await fetch(`https://www.federalregister.gov/api/v1/documents/${num}.json`);
    if (!res.ok) return Response.json({ error: `Document not found (${res.status})` }, { status: 404 });
    const d = await res.json();

    // Full text via GovInfo (official FR edition), falling back to the FR raw text endpoint.
    const candidates = [
      d.publication_date ? `https://www.govinfo.gov/content/pkg/FR-${d.publication_date}/html/${d.document_number}.htm` : null,
      d.raw_text_url,
    ].filter(Boolean);
    let text = "";
    for (const u of candidates) {
      const t = await fetch(u, { headers: { "User-Agent": "Tessera policy analysis (research prototype)" } });
      if (!t.ok) continue;
      const cleaned = stripHtml(await t.text());
      if (cleaned.length > 500 && !/Request Access/i.test(cleaned.slice(0, 300))) { text = cleaned; break; }
    }
    if (!text) text = d.abstract || "";
    const truncated = text.length > MAX_TEXT;
    let policy_text_uri = "";
    if (truncated) {
      const file = new File([text.slice(0, 400000)], `${d.document_number}.txt`, { type: "text/plain" });
      const up = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
      policy_text_uri = up.file_uri;
    }

    return Response.json({
      dossier: {
        title: d.title,
        policy_type: TYPE_MAP[d.type] || "other",
        agency: (d.agencies || []).map((a) => a.name).filter(Boolean).join(", "),
        docket_id: d.regulations_dot_gov_info?.docket_id || (d.docket_ids || [])[0] || "",
        fr_document_number: d.document_number,
        source_url: d.html_url,
        publication_date: d.publication_date,
        comment_deadline: d.comments_close_on || undefined,
        abstract: d.abstract || "",
        policy_text: truncated ? text.slice(0, MAX_TEXT) + "\n\n[… excerpt — full text is stored with this dossier …]" : text,
        policy_text_uri,
        full_text_length: text.length,
      },
      truncated,
      full_length: text.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}