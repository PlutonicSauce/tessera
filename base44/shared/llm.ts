import { readSecret } from "./env.ts";

// Uses Microsoft Foundry (Azure OpenAI deployment) when configured, otherwise the built-in model.
export async function callModel(base44, prompt, schema, model) {
  const endpoint = readSecret("AZURE_FOUNDRY_ENDPOINT");
  const key = readSecret("AZURE_FOUNDRY_API_KEY");
  const deployment = readSecret("AZURE_FOUNDRY_DEPLOYMENT");

  if (endpoint && key && deployment) {
    const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=2024-10-21`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": key },
      body: JSON.stringify({
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a careful, neutral public-policy analyst. Respond ONLY with a JSON object matching this JSON schema: " + JSON.stringify(schema) },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Foundry request failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return { result: JSON.parse(data.choices[0].message.content), engine: `Microsoft Foundry · ${deployment}` };
  }

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema, ...(model ? { model } : {}) });
  return { result, engine: `Built-in model${model ? ` · ${model}` : ""} (Foundry not configured)` };
}

const norm = (s) => String(s || "").toLowerCase().replace(/[\u2018\u2019\u201c\u201d"'`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// True when the quote appears (near-)verbatim in the text.
export function quoteAppears(quote, text) {
  const q = norm(quote);
  if (q.length < 8) return false;
  const t = norm(text);
  if (t.includes(q)) return true;
  const words = q.split(" ");
  if (words.length < 8) return false;
  const head = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const tail = words.slice(Math.floor(words.length / 2)).join(" ");
  return t.includes(head) && t.includes(tail);
}