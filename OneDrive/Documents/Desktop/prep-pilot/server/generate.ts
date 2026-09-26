import type { InterviewResult } from "../src/types/interview.js";
import { validateInterviewResult } from "../src/lib/validateResult.js";

export class GenerationError extends Error {
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = "GenerationError";
  }
}

const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqModel = "openai/gpt-oss-20b";

const generationPrompt = `
You are an expert interview preparation assistant.

Create interview preparation from the user's input. Return ONLY valid JSON with no markdown, code fences, or extra text.
Generate exactly 6 to 8 relevant skills and exactly 10 relevant interview questions.
Questions must cover at least three relevant categories and include Easy, Medium, and Hard difficulty levels.
Make every question and answer specific to the user's input rather than generic.
The JSON must exactly follow this structure:
{
  "role": "string",
  "summary": "string",
  "skills": [
    {
      "name": "string",
      "importance": "High"
    }
  ],
  "questions": [
    {
      "id": 1,
      "question": "string",
      "category": "string",
      "difficulty": "Easy",
      "answer": "string"
    }
  ]
}

The only valid importance values are High, Medium, and Low. The only valid difficulty values are Easy, Medium, and Hard.
Use unique sequential numeric question ids from 1 through 10. Return exactly one JSON object and no text outside it. Do not add fields outside this structure.
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSafeProviderMessage(body: unknown): string | undefined {
  if (!isRecord(body) || !isRecord(body.error)) {
    return undefined;
  }

  return typeof body.error.message === "string"
    ? body.error.message
    : undefined;
}

function getResponseContent(body: unknown): string | undefined {
  if (!isRecord(body) || !Array.isArray(body.choices)) {
    return undefined;
  }

  const firstChoice = body.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return undefined;
  }

  return typeof firstChoice.message.content === "string"
    ? firstChoice.message.content
    : undefined;
}

export async function generateInterviewResult(
  input: string,
): Promise<InterviewResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new GenerationError("Groq API key is not configured.", 503);
  }

  let response: Response;

  try {
    response = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: "system", content: generationPrompt },
          { role: "user", content: input },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });
  } catch {
    throw new GenerationError("Groq API request failed.", 502);
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw new GenerationError("Groq returned invalid JSON.", 502);
  }

  if (!response.ok) {
    const providerMessage = getSafeProviderMessage(responseBody);
    const safeBody = JSON.stringify(responseBody).replaceAll(
      apiKey,
      "[REDACTED]",
    );
    console.error("Groq API request failed", {
      status: response.status,
      message: providerMessage,
      body: safeBody,
    });
    throw new GenerationError("Groq API request failed.", 502);
  }

  const responseText = getResponseContent(responseBody);

  if (!responseText) {
    throw new GenerationError("Groq returned an empty response.", 502);
  }

  let parsedResponse: unknown;

  try {
    parsedResponse = JSON.parse(responseText);
  } catch {
    throw new GenerationError("Groq returned invalid JSON.", 502);
  }

  const validatedResult = validateInterviewResult(parsedResponse);

  if (!validatedResult) {
    throw new GenerationError(
      "Groq returned an invalid interview result.",
      502,
    );
  }

  return validatedResult;
}
