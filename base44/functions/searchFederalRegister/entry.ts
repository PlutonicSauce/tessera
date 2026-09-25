import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";

const FIELDS = ["title", "type", "agency_names", "document_number", "publication_date", "abstract", "html_url", "docket_ids", "comments_close_on", "regulations_dot_gov_info"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { query, type } = await req.json();
    const term = String(query || "").trim().slice(0, 200);
    if (!term) return Response.json({ error: "Enter a search term" }, { status: 400 });

    const params = new URLSearchParams({ "conditions[term]": term, per_page: "12", order: "relevance" });
    FIELDS.forEach((f) => params.append("fields[]", f));
    if (type) params.append("conditions[type][]", type);

    const res = await fetch(`https://www.federalregister.gov/api/v1/documents.json?${params}`);
    if (!res.ok) return Response.json({ error: `Federal Register returned ${res.status}` }, { status: 502 });
    const data = await res.json();

    const results = (data.results || []).map((d) => ({
      title: d.title,
      type: d.type,
      agency: (d.agency_names || []).join(", "),
      document_number: d.document_number,
      publication_date: d.publication_date,
      abstract: d.abstract,
      html_url: d.html_url,
      docket_id: d.regulations_dot_gov_info?.docket_id || (d.docket_ids || [])[0] || "",
      comments_close_on: d.comments_close_on,
      comments_count: d.regulations_dot_gov_info?.comments_count ?? null,
    }));
    return Response.json({ results, total: data.count || 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}