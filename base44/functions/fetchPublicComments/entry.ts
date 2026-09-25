import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { readSecret } from "../../shared/env.ts";
import { redactPII } from "../../shared/redact.ts";
import { loadSourcesWithNextRef } from "../../shared/refs.ts";

// Classifies submitter type from category, organization, or the "Comment Submitted by …" title (the name itself is never stored).
function authorType(a) {
  const cat = String(a.category || "").toLowerCase();
  const by = String(a.title || "").replace(/^comment (submitted )?(by|from)\s*/i, "").toLowerCase();
  if (!cat && !a.organization && by) {
    if (/anonymous/.test(by)) return "anonymous";
    if (/(city of|county|state of|department|authority|commission|board of|office of|tribe|tribal|representative|senator|governor|mayor)/.test(by)) return "government";
    if (/(university|college|institute|school of)/.test(by)) return "academic";
    if (/(inc\b|llc|corp|company|realty|properties|management|bank|group\b)/.test(by)) return "business";
    if (/(association|coalition|council|center|alliance|network|foundation|legal|aid|advocates|project|society|union|league|housing|partners|committee|fund|org)/.test(by)) return "organization";
    if (/^[a-z'.-]+(\s[a-z'.-]+){1,3}$/.test(by.trim())) return "individual";
  }
  if (cat.includes("anonymous")) return "anonymous";
  if (/(federal|state|local|tribal|government|elected)/.test(cat)) return "government";
  if (/(academic|university|research)/.test(cat)) return "academic";
  if (/(business|industry|company|corporation|trade)/.test(cat)) return "business";
  if (a.organization) return "organization";
  if (/(individual|citizen|consumer)/.test(cat) || a.firstName) return "individual";
  return "unknown";
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { dossier_id, docket_id, limit, page } = await req.json();
    const pageNum = Math.min(Math.max(parseInt(page) || 1, 1), 20);
    const docket = String(docket_id || "").trim();
    if (!dossier_id || !/^[\w-]{3,60}$/.test(docket)) return Response.json({ error: "A valid docket ID is required" }, { status: 400 });
    const size = Math.min(Math.max(parseInt(limit) || 25, 5), 25);
    const key = readSecret("REGULATIONS_GOV_API_KEY") || "DEMO_KEY";

    const listUrl = `https://api.regulations.gov/v4/comments?filter[docketId]=${encodeURIComponent(docket)}&page[size]=${size}&page[number]=${pageNum}&sort=-postedDate&api_key=${key}`;
    const listRes = await fetch(listUrl);
    if (listRes.status === 429) return Response.json({ error: "Regulations.gov rate limit reached. Add a free api.data.gov key to raise the limit, or try again later." }, { status: 429 });
    if (!listRes.ok) return Response.json({ error: `Regulations.gov returned ${listRes.status}` }, { status: 502 });
    const list = await listRes.json();
    const items = (list.data || []).slice(0, size);
    if (!items.length) return Response.json({ created: 0, attachment_only: 0, unavailable: 0, message: "No more public comments on this page of the docket." });

    const { existing, next } = await loadSourcesWithNextRef(base44, dossier_id);
    const seen = new Set(existing.map((s) => s.external_id).filter(Boolean));

    const details = await Promise.all(
      items.filter((i) => !seen.has(i.id)).map(async (i) => {
        const r = await fetch(`https://api.regulations.gov/v4/comments/${i.id}?api_key=${key}`);
        if (!r.ok) return null;
        const j = await r.json();
        return { id: i.id, a: j.data?.attributes || {} };
      })
    );

    let ref = next;
    let attachmentOnly = 0;
    let unavailable = 0;
    let redactions = 0;
    const records = [];
    for (const d of details) {
      if (!d) { unavailable++; continue; }
      const raw = String(d.a.comment || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ").trim();
      if (!raw || (raw.length < 220 && /(attach|see (the )?(enclosed|uploaded)|comments? (is|are) (included|enclosed))/i.test(raw))) { attachmentOnly++; continue; }
      const { text, count } = redactPII(raw.slice(0, 6000));
      redactions += count;
      const type = authorType(d.a);
      const byName = String(d.a.title || "").replace(/^comment (submitted )?(by|from)\s*/i, "").trim();
      const orgName = d.a.organization || (["organization", "government", "academic", "business"].includes(type) ? byName : "");
      records.push({
        dossier_id,
        ref: `S${ref++}`,
        evidence_class: "public_opinion",
        channel: "public_comment",
        title: orgName ? `Comment from ${orgName}` : `Public comment ${d.id}`,
        content: text,
        url: `https://www.regulations.gov/comment/${d.id}`,
        outlet: "Regulations.gov",
        author_type: type,
        published_date: (d.a.postedDate || "").slice(0, 10),
        origin: "regulations_gov",
        external_id: d.id,
        pii_redactions: count,
      });
    }
    if (records.length) await base44.entities.Source.bulkCreate(records);
    return Response.json({ created: records.length, attachment_only: attachmentOnly, unavailable, redactions, page: pageNum });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}