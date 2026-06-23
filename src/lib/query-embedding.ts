function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const EMBEDDING_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getQueryEmbedding(text: string, openRouterApiKey?: string): Promise<number[]> {
  const orKey = openRouterApiKey || process.env.OPENROUTER_API_KEY;
  if (!orKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

  let attempt = 0;

  while (true) {
    try {
      const response = await fetchWithTimeout("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${orKey}`,
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-large",
          input: text,
          dimensions: 3072,
        }),
      }, EMBEDDING_TIMEOUT_MS);

      if (!response.ok) {
        throw new Error(`OpenRouter HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error("OpenRouter API error");
      }

      const embedding = data.data?.[0]?.embedding;
      if (!embedding) {
        throw new Error(`Invalid response structure from OpenRouter: ${JSON.stringify(data)}`);
      }

      return embedding;
    } catch (err: unknown) {
      attempt++;
      const errorMessage = getErrorMessage(err);
      const lowerMessage = errorMessage.toLowerCase();
      const isTransient =
        errorMessage.includes("500") ||
        errorMessage.includes("502") ||
        errorMessage.includes("503") ||
        errorMessage.includes("504") ||
        lowerMessage.includes("fetch failed") ||
        lowerMessage.includes("abort") ||
        lowerMessage.includes("timeout") ||
        lowerMessage.includes("econnreset") ||
        lowerMessage.includes("econnrefused") ||
        lowerMessage.includes("enotfound");

      if (isTransient && attempt <= MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(
          `Embedding failed (attempt ${attempt}/${MAX_RETRIES}): ${errorMessage}. Retrying in ${Math.round(backoffMs)}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      console.error("Embedding generation failed:", errorMessage);
      throw err;
    }
  }
}
