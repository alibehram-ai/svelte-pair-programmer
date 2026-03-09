import { z } from "zod";
import { env } from "$env/dynamic/private";

type ReviewInput = {
  content: string;
  language: string;
  filename?: string;
};

const ReviewSchema = z.object({
  summary: z.string().min(1),
  scores: z.object({
    readability: z.number().int().min(1).max(10),
    structure: z.number().int().min(1).max(10),
    maintainability: z.number().int().min(1).max(10),
  }),
  comments: z
    .array(
      z.object({
        category: z.enum(["READABILITY", "STRUCTURE", "MAINTAINABILITY", "BEST_PRACTICE"]),
        message: z.string().min(1),
        lineStart: z.number().int().min(1).optional(),
        lineEnd: z.number().int().min(1).optional(),
      })
    )
    .max(50),
});

export type ReviewOutput = z.infer<typeof ReviewSchema>;

type Provider = "openai" | "anthropic";

const getProvider = (): Provider => (env.AI_PROVIDER ?? "openai").toLowerCase() as Provider;

const getOpenAiModel = () => env.OPENAI_MODEL ?? "gpt-4o-mini";
const getAnthropicModel = () => env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

const systemPrompt = `You are a senior engineer performing a code review. Focus on readability, structure, and maintainability. Return JSON only.`;

const userPrompt = (input: ReviewInput) => {
  const header = input.filename ? `File: ${input.filename}` : "";
  return [
    "Review the following code.",
    header,
    `Language: ${input.language}`,
    "Provide:",
    "1) summary (short paragraph)",
    "2) scores {readability, structure, maintainability} from 1-10",
    "3) comments[] with category and message and optional lineStart/lineEnd",
    "Return only valid JSON matching this schema:",
    JSON.stringify({
      summary: "...",
      scores: { readability: 1, structure: 1, maintainability: 1 },
      comments: [
        { category: "READABILITY", message: "...", lineStart: 1, lineEnd: 2 },
      ],
    }),
    "--- CODE START ---",
    input.content,
    "--- CODE END ---",
  ]
    .filter(Boolean)
    .join("\n");
};

const parseResponse = (text: string): ReviewOutput => {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const raw = jsonStart >= 0 && jsonEnd >= 0 ? text.slice(jsonStart, jsonEnd + 1) : text;
  const parsed = JSON.parse(raw);
  return ReviewSchema.parse(parsed);
};

const reviewWithOpenAI = async (input: ReviewInput): Promise<ReviewOutput> => {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  return parseResponse(content);
};

const reviewWithAnthropic = async (input: ReviewInput): Promise<ReviewOutput> => {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: getAnthropicModel(),
      max_tokens: 1200,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt(input) }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: "text"; text: string }>;
  };

  const content = data.content?.[0]?.text ?? "";
  return parseResponse(content);
};

export const reviewCode = async (input: ReviewInput): Promise<ReviewOutput> => {
  if (getProvider() === "anthropic") {
    return reviewWithAnthropic(input);
  }

  return reviewWithOpenAI(input);
};
