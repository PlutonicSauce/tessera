// Full policy text lives in a private file (policy_text_uri); policy_text holds a display excerpt.
export async function loadPolicyText(base44, dossier) {
  if (dossier.policy_text_uri) {
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: dossier.policy_text_uri, expires_in: 120 });
    const r = await fetch(signed_url);
    if (r.ok) return await r.text();
  }
  return dossier.policy_text || dossier.abstract || "";
}

// Keeps the preamble and the regulatory text (usually at the end) within budget.
export function excerpt(text, budget) {
  if (text.length <= budget) return text;
  const head = Math.floor(budget * 0.6);
  return `${text.slice(0, head)}\n\n[… middle section omitted for length …]\n\n${text.slice(text.length - (budget - head))}`;
}