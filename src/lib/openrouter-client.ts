const OPENROUTER_TIMEOUT_MS = 25_000;
const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-v4-flash";

function normalizeModel(model: string) {
  const aliases: Record<string, string> = {
    "gpt-4o": "openai/gpt-4o",
    "gpt 4o": "openai/gpt-4o",
    "gpt-4 omni": "openai/gpt-4o",
    "gpt 4 omni": "openai/gpt-4o",
    "openai gpt-4o": "openai/gpt-4o",
    "openai gpt 4o": "openai/gpt-4o",
    "openai gpt-4 omni": "openai/gpt-4o",
    "openai gpt 4 omni": "openai/gpt-4o",
    deepseek: DEFAULT_OPENROUTER_MODEL,
    "deepseek flash": DEFAULT_OPENROUTER_MODEL,
    "deepseek v4 flash": DEFAULT_OPENROUTER_MODEL,
  };
  return aliases[model.toLowerCase()] || model;
}

export function getOpenRouterModel() {
  return normalizeModel(process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL);
}

function isSafetyOnlyAnswer(text: string) {
  const normalized = text.trim();
  if (!normalized) return true;
  return [
    /^user safety\s*:\s*(safe|unsafe|unknown)\.?$/i,
    /^safety\s*:\s*(safe|unsafe|unknown)\.?$/i,
    /^content safety\s*:\s*(safe|unsafe|unknown)\.?$/i,
    /^safe\.?$/i,
  ].some((pattern) => pattern.test(normalized));
}

export async function generateOpenRouterAnswer(prompt: string, apiKey: string) {
  const model = getOpenRouterModel();
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://fms3.ru",
        "X-Title": "FMS3 Migration Assistant",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn("OpenRouter chat request failed", { status: response.status, model });
      throw new Error(`OpenRouter chat request failed with status ${response.status}`);
    }
    const data = await response.json() as { error?: unknown; choices?: Array<{ message?: { content?: unknown } }> };
    if (data.error) throw new Error("OpenRouter chat returned an error.");
    const text = data.choices?.[0]?.message?.content;
    if (typeof text !== "string" || isSafetyOnlyAnswer(text)) {
      throw new Error("OpenRouter chat returned an invalid response.");
    }
    return text;
  } catch (error) {
    console.warn("OpenRouter chat request threw", { model });
    throw error;
  }
}
