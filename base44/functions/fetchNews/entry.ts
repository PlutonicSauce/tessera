import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { loadSourcesWithNextRef } from "../../shared/refs.ts";

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fromGdelt(q) {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q + " sourcelang:english")}&mode=artlist&maxrecords=25&format=json&sort=hybridrel&timespan=3months`;
  const res = await fetchWithTimeout(url, 6000);
  const data = JSON.parse(await res.text());
  return (data.articles || []).map((a) => {
    const sd = String(a.seendate || "");
    return { title: a.title, url: a.url, outlet: a.domain, date: sd.length >= 8 ? `${sd.slice(0, 4)}-${sd.slice(4, 6)}-${sd.slice(6, 8)}` : "", via: "GDELT" };
  });
}

const decode = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ""; };

async function fromGoogleNews(q) {
  const res = await fetchWithTimeout(`https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:90d")}&hl=en-US&gl=US&ceid=US:en`, 9000);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 25).map(([, item]) => {
    const outlet = tag(item, "source");
    const title = tag(item, "title").replace(new RegExp(`\\s+-\\s+${outlet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "");
    const d = new Date(tag(item, "pubDate"));
    return { title, url: tag(item, "link"), outlet, date: isNaN(d) ? "" : d.toISOString().slice(0, 10), via: "Google News" };
  });
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { dossier_id, query } = await req.json();
    const q = String(query || "").replace(/[^\w\s"'-]/g, " ").trim().slice(0, 150);
    if (!dossier_id || q.length < 3) return Response.json({ error: "Enter keywords to search news coverage" }, { status: 400 });

    let articles = [];
    let via = "GDELT";
    try { articles = await fromGdelt(q); } catch (_e) { articles = []; }
    if (!articles.length) { via = "Google News"; articles = await fromGoogleNews(q); }
    if (!articles.length) return Response.json({ created: 0, via, message: "No coverage found in the last 3 months. Try fewer or broader keywords." });

    const { existing, next } = await loadSourcesWithNextRef(base44, dossier_id);
    const seen = new Set(existing.map((s) => s.external_id).filter(Boolean));
    const titles = new Set(existing.filter((s) => s.channel === "news").map((s) => (s.title || "").toLowerCase().trim()));
    let ref = next;
    const records = [];
    for (const a of articles) {
      const key = (a.title || "").toLowerCase().trim();
      if (!a.url || !key || seen.has(a.url) || titles.has(key)) continue;
      titles.add(key);
      records.push({
        dossier_id, ref: `S${ref++}`, evidence_class: "reporting", channel: "news", title: a.title, content: a.title, url: a.url,
        outlet: a.outlet, author_type: "organization", published_date: a.date, origin: "gdelt", external_id: a.url, is_headline_only: true,
      });
    }
    if (records.length) await base44.entities.Source.bulkCreate(records);
    return Response.json({ created: records.length, via });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}