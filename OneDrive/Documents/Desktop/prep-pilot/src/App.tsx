import { type FormEvent, useRef, useState } from "react";
import { Dashboard } from "./components/Dashboard.js";
import { generateInterview } from "./lib/api.js";
import type { InterviewResult } from "./types/interview.js";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentRequestId = ++requestId.current;
    const trimmedInput = input.trim();

    setError(null);
    setResult(null);

    if (!trimmedInput) {
      setError("Tell us what role or job description you are preparing for.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const interviewResult = await generateInterview(trimmedInput);

      if (currentRequestId === requestId.current) {
        setResult(interviewResult);
      }
    } catch (requestError: unknown) {
      if (currentRequestId === requestId.current) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong. Please try again.",
        );
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="page-title">
        <header className="prompt-header">
          <div>
            <p className="eyebrow">PREPPILOT / INTERVIEW LAB</p>
            <h1 id="page-title">Build your interview edge.</h1>
          </div>
          <p className="intro">
            Paste a role, job description, or skill list. PrepPilot will turn it
            into focused preparation material.
          </p>
        </header>

        <form className="prompt-form" onSubmit={handleSubmit}>
          <label htmlFor="interview-input">What are you preparing for?</label>
          <textarea
            id="interview-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="e.g. Data Analyst role requiring Python, SQL, Power BI and statistics"
            rows={6}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Generating preparation..." : "Generate preparation"}
          </button>
        </form>

        {loading && (
          <p className="status-message" role="status">
            Reviewing the role and drafting your preparation set...
          </p>
        )}

        {error && (
          <section className="feedback error-state" role="alert">
            <h2>We could not generate your preparation</h2>
            <p>{error}</p>
          </section>
        )}

        {result && <Dashboard result={result} />}
      </section>
    </main>
  );
}

export default App;
