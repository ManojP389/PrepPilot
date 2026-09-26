import type { InterviewResult } from "../types/interview.js";
import { validateInterviewResult } from "./validateResult.js";

const url = "/api/generate";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function generateInterview(
  input: string,
): Promise<InterviewResult> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });
  } catch {
    throw new Error(
      "Unable to reach the interview service. Please try again.",
    );
  }

  let responseBody: Record<string, unknown> | null;

  try {
    const parsedBody: unknown = await response.json();
    responseBody = isRecord(parsedBody) ? parsedBody : null;
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(
      typeof responseBody?.error === "string"
        ? responseBody.error
        : `API request failed with status ${response.status}`,
    );
  }

  const result =
    response.ok &&
    responseBody?.success === true &&
    "data" in responseBody
      ? validateInterviewResult(responseBody.data)
      : null;

  if (!result) {
    throw new Error("The AI returned an invalid interview result. Please try again.");
  }

  return result;
}
