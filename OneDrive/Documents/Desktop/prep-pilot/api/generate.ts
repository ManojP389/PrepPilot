import { GenerationError, generateInterviewResult } from "../server/generate.js";

export default async function handler(
  request: Request & { body?: { input?: unknown } },
  response: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => {
      json: (data: unknown) => unknown;
    };
  },
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const input = request.body?.input;

  if (typeof input !== "string" || input.trim().length === 0) {
    return response.status(400).json({
      error: "The input field must be a non-empty string.",
    });
  }

  try {
    const result = await generateInterviewResult(input);
    return response.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    if (error instanceof GenerationError) {
      return response.status(error.statusCode).json({ error: error.message });
    }

    console.error("Unexpected generation error", error);
    return response.status(500).json({
      error: "An unexpected server error occurred.",
    });
  }
}