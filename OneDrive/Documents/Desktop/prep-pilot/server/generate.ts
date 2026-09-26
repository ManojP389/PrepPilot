import { GoogleGenAI } from "@google/genai";
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

const generationPrompt = `
You are an expert interview preparation assistant.

Create interview preparation from the user's input. Return ONLY valid JSON with no markdown, code fences, or extra text.

Generate exactly 6 to 8 relevant skills and exactly 10 relevant interview questions.

Questions must:
- Cover at least three relevant categories.
- Include Easy, Medium, and Hard difficulty levels.
- Be specific to the user's input rather than generic.
- Have concise but useful answers suitable for interview preparation.

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

Rules:
- The only valid importance values are High, Medium, and Low.
- The only valid difficulty values are Easy, Medium, and Hard.
- Use unique sequential numeric question ids from 1 through 10.
- Return exactly 10 questions.
- Return exactly one JSON object.
- Do not add fields outside the specified structure.
- Do not return markdown, code fences, explanations, or any text outside the JSON object.
`;

export async function generateInterviewResult(
  input: string,
): Promise<InterviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GenerationError(
      "Gemini API key is not configured.",
      503,
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  let response: Awaited<
    ReturnType<typeof ai.models.generateContent>
  >;

  try {
    response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `${generationPrompt}\nUser input:\n${input}`,
      config: {
        responseMimeType: "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("Gemini API request failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown Gemini API error";

    throw new GenerationError(
      `Gemini API request failed: ${message}`,
      502,
    );
  }

  const responseText = response.text;

  if (!responseText) {
    throw new GenerationError(
      "Gemini returned an empty response.",
      502,
    );
  }

  let parsedResponse: unknown;

  try {
    parsedResponse = JSON.parse(responseText);
  } catch (error: unknown) {
    console.error("Gemini returned invalid JSON:", error);

    throw new GenerationError(
      "Gemini returned invalid JSON.",
      502,
    );
  }

  const validatedResult =
    validateInterviewResult(parsedResponse);

  if (!validatedResult) {
    console.error(
      "Gemini returned an invalid interview result:",
      parsedResponse,
    );

    throw new GenerationError(
      "Gemini returned an invalid interview result.",
      502,
    );
  }

  return validatedResult;
}