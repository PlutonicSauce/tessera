const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export function computeRepresentativeness(sources) {
  const count = (key) => sources.reduce((acc, s) => ({ ...acc, [s[key] || "unknown"]: (acc[s[key] || "unknown"] || 0) + 1 }), {});
  const byClass = count("evidence_class");
  const opinions = sources.filter((s) => s.evidence_class === "public_opinion");
  const reporting = sources.filter((s) => s.evidence_class === "reporting");
  const byAuthor = opinions.reduce((acc, s) => ({ ...acc, [s.author_type || "unknown"]: (acc[s.author_type || "unknown"] || 0) + 1 }), {});

  const outletCounts = reporting.reduce((acc, s) => ({ ...acc, [s.outlet || "unknown"]: (acc[s.outlet || "unknown"] || 0) + 1 }), {});
  const topOutlets = Object.entries(outletCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Near-identical opinion texts suggest an organized / form-letter campaign.
  const groups = {};
  opinions.forEach((s) => {
    const key = norm(s.content).slice(0, 140);
    if (key.length > 60) groups[key] = (groups[key] || 0) + 1;
  });
  const campaigns = Object.values(groups).filter((n) => n >= 3);
  const campaignItems = campaigns.reduce((a, b) => a + b, 0);

  const warnings = [];
  if (!byClass.public_opinion) warnings.push("No public-opinion evidence yet — findings will describe policy text only.");
  if (!byClass.reporting) warnings.push("No news coverage in the corpus; media framing is not represented.");
  if (reporting.length >= 4 && topOutlets[0] && topOutlets[0][1] / reporting.length >= 0.35)
    warnings.push(`${topOutlets[0][0]} supplies ${Math.round((topOutlets[0][1] / reporting.length) * 100)}% of reporting — possible outlet concentration.`);
  if (reporting.some((s) => s.is_headline_only)) warnings.push("News items are headline-level only; article bodies were not analyzed.");
  if (opinions.length >= 5 && (byAuthor.individual || 0) / opinions.length < 0.2) warnings.push("Few individual voices — organized stakeholders dominate public input.");
  if (campaignItems) warnings.push(`${campaignItems} near-identical comments in ${campaigns.length} cluster(s) — likely form-letter campaign; volume ≠ breadth of support.`);
  if (opinions.length > 0 && opinions.length < 10) warnings.push(`Only ${opinions.length} public-opinion items — treat prevalence estimates as indicative.`);
  warnings.push("Self-selected comments are not a representative sample of the public.");

  return { total: sources.length, byClass, byAuthor, opinionTotal: opinions.length, topOutlets, reportingTotal: reporting.length, warnings };
}