import config from "@/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export async function generateTaskSuggestions(
  topic: string,
  count = 3
): Promise<string[]> {
  const capped = Math.max(1, Math.min(count, 5));

  const system = "You generate concise, actionable todo suggestions.";
  const user = `Topic: "${topic}". Return exactly ${capped} short, practical task suggestions as a plain list (no numbering metadata, no explanations).`;

  const response = await client.responses.create({
    model: config.OPENAI_MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = (response as any).output_text as string;

  return text
    .split("\n")
    .map((s) => s.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, capped);
}

export { client as openaiClient };
