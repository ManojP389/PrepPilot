import { useState } from "react";
import type { InterviewQuestion } from "../types/interview.js";

export type QuestionStatus = "unanswered" | "known" | "practice";

type QuestionCardProps = {
  question: InterviewQuestion;
  position: number;
  status: QuestionStatus;
  onStatusChange: (status: QuestionStatus) => void;
};

export function QuestionCard({
  question,
  position,
  status,
  onStatusChange,
}: QuestionCardProps) {
  const [answerVisible, setAnswerVisible] = useState(false);

  return (
    <article className="question-card">
      <div className="question-card-topline">
        <span className="question-number">Question {String(position).padStart(2, "0")}</span>
        <div className="question-tags">
          <span className="tag category-tag">{question.category}</span>
          <span className={`tag difficulty-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
        </div>
      </div>
      <h3>{question.question}</h3>
      {answerVisible && (
        <div className="answer-panel">
          <p className="section-kicker">MODEL ANSWER</p>
          <p>{question.answer}</p>
        </div>
      )}
      <div className="question-actions">
        <button className="reveal-button" type="button" onClick={() => setAnswerVisible((visible) => !visible)}>
          {answerVisible ? "Hide answer" : "Reveal answer"}
        </button>
        <div className="status-actions" role="group" aria-label={`Status for question ${position}`}>
          <button
            className={status === "known" ? "status-button known active" : "status-button known"}
            type="button"
            onClick={() => onStatusChange(status === "known" ? "unanswered" : "known")}
            aria-pressed={status === "known"}
          >
            I know this
          </button>
          <button
            className={status === "practice" ? "status-button practice active" : "status-button practice"}
            type="button"
            onClick={() => onStatusChange(status === "practice" ? "unanswered" : "practice")}
            aria-pressed={status === "practice"}
          >
            Need practice
          </button>
        </div>
      </div>
    </article>
  );
}
