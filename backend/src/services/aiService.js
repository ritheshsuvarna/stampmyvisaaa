import { STATUSES } from "../config/checklistTemplate.js";
import { aiSuggestionArraySchema } from "../validation/schemas.js";

// gemini-2.5-flash: fast, free-tier friendly, good instruction-following for
// structured JSON extraction. Called via raw fetch rather than the Gemini
// SDK — one less dependency, and the REST shape is simple enough not to
// need it.
const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI features are not configured. Set GEMINI_API_KEY on the server.");
    this.name = "AiNotConfiguredError";
  }
}

export class AiParseError extends Error {
  constructor(message, raw) {
    super(message);
    this.name = "AiParseError";
    this.raw = raw;
  }
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiNotConfiguredError();
  return key;
}

function stripFences(raw) {
  return raw.replace(/```json|```/g, "").trim();
}

async function callGemini(prompt, { maxTokens = 1000 } = {}) {
  const key = getApiKey();

  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      // gemini-2.5-flash "thinks" by default, which silently eats into
      // maxOutputTokens before the model writes the actual answer —
      // without this, short-ish outputs (like the message drafter) were
      // getting truncated mid-sentence. This app doesn't need reasoning
      // traces, just the answer, so thinking is switched off entirely.
      generationConfig: { maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });

  if (res.status === 429) {
    throw new Error("Gemini API rate limit or quota exceeded — wait a moment and try again.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("\n");
}

/**
 * Paste-a-WhatsApp-update -> structured checklist suggestions.
 * Never trusts client-supplied checklist state — caller passes the
 * server's own current checklist items. Retries once with a corrective
 * prompt if the model returns non-JSON or schema-invalid output.
 */
export async function parseUpdateToSuggestions(checklistItems, text) {
  const itemList = checklistItems
    .map((i) => `${i.itemKey}: ${i.label} (currently ${i.status})`)
    .join("\n");

  const basePrompt = `You are helping a relocation-ops team update a checklist from a freeform WhatsApp-style note.

Checklist items (key: label (current status)):
${itemList}

Valid statuses: ${STATUSES.join(", ")}.

Note from the ops person:
"""
${text}
"""

Return ONLY a JSON array (no prose, no markdown fences) of objects for items the note clearly speaks to:
[{"key": "<item key>", "status": "<new status>", "note": "<short factual note, <=12 words>"}]

Only include an item if the note gives clear evidence of its new status. Do not guess. If nothing is clear, return [].`;

  let raw = await callGemini(basePrompt);
  let attempt = parseAndValidate(raw, checklistItems);

  if (!attempt.ok) {
    const retryPrompt = `Your previous output was not a valid JSON array matching the required shape. Output ONLY a JSON array like [{"key": "...", "status": "...", "note": "..."}] with no prose, no markdown fences, and no trailing text. Re-read this note and try again:

"""
${text}
"""

Checklist items:
${itemList}

Valid statuses: ${STATUSES.join(", ")}.`;
    raw = await callGemini(retryPrompt);
    attempt = parseAndValidate(raw, checklistItems);
  }

  if (!attempt.ok) {
    throw new AiParseError("The AI response could not be parsed into valid checklist suggestions.", raw);
  }

  return attempt.suggestions;
}

function parseAndValidate(raw, checklistItems) {
  const knownKeys = new Set(checklistItems.map((i) => i.itemKey));
  try {
    const cleaned = stripFences(raw);
    const parsed = JSON.parse(cleaned);
    const validated = aiSuggestionArraySchema.parse(parsed);
    const filtered = validated.filter((s) => knownKeys.has(s.key));
    return { ok: true, suggestions: filtered };
  } catch {
    return { ok: false };
  }
}

export async function draftCustomerMessage(relocation, groupedSummary) {
  const prompt = `Write a short, warm WhatsApp-style status update for a relocation customer named ${relocation.customerName}, moving from ${relocation.originCity} to ${relocation.destCity} on ${relocation.moveDate}.

Current checklist status:
${groupedSummary}

Rules:
- 3-5 sentences, plain language, no corporate tone.
- Lead with genuine progress, be honest about anything blocked or pending.
- No headers, no bullet points, no markdown — just the message text.`;

  const raw = await callGemini(prompt);
  return raw.trim();
}
