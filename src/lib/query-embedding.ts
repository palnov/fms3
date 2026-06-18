function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function getQueryEmbedding(text: string, openRouterApiKey?: string): Promise<number[]> {
  const orKey = openRouterApiKey || process.env.OPENROUTER_API_KEY;
  if (!orKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const maxRetries = 5;
  let attempt = 0;

  while (true) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
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
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter HTTP error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`OpenRouter API error: ${JSON.stringify(data.error)}`);
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
        errorMessage.includes("429") ||
        lowerMessage.includes("fetch failed") ||
        lowerMessage.includes("timeout") ||
        lowerMessage.includes("econnreset") ||
        lowerMessage.includes("econnrefused") ||
        lowerMessage.includes("enotfound");

      if (isTransient && attempt <= maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(
          `Embedding failed (attempt ${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${Math.round(backoffMs)}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      console.error("Embedding generation failed:", errorMessage);
      throw err;
    }
  }
}
