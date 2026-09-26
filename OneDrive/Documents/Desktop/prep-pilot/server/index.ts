import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { GenerationError, generateInterviewResult } from "./generate.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/generate", async (request, response) => {
  const input = request.body?.input;

  if (typeof input !== "string" || input.trim().length === 0) {
    response.status(400).json({
      error: "The input field must be a non-empty string.",
    });
    return;
  }

  try {
    const result = await generateInterviewResult(input);
    response.json({ success: true, data: result });
  } catch (error: unknown) {
    if (error instanceof GenerationError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.error("Unexpected generation error", error);
    response.status(500).json({ error: "An unexpected server error occurred." });
  }
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    if (error instanceof SyntaxError) {
      response.status(400).json({ error: "Request body must be valid JSON." });
      return;
    }

    console.error("Unexpected server error", error);
    response.status(500).json({ error: "An unexpected server error occurred." });
  },
);

app.listen(port, () => {
  console.log(`PrepPilot backend listening on http://localhost:${port}`);
});
