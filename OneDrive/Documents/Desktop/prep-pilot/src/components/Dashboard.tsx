import { useState } from "react";
import type { InterviewResult } from "../types/interview.js";
import { FilterBar, type DifficultyFilter } from "./FilterBar.js";
import { ProgressBar } from "./ProgressBar.js";
import { QuestionCard, type QuestionStatus } from "./QuestionCard.js";
import { SkillList } from "./SkillList.js";

type DashboardProps = {
  result: InterviewResult;
};

type QuestionStatusMap = Record<number, QuestionStatus>;

export function Dashboard({ result }: DashboardProps) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [category, setCategory] = useState("All");
  const [practiceOnly, setPracticeOnly] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatusMap>({});

  const categories = Array.from(new Set(result.questions.map((question) => question.category))).sort();
  const filteredQuestions = result.questions.filter((question) => {
    const matchesDifficulty = difficulty === "All" || question.difficulty === difficulty;
    const matchesCategory = category === "All" || question.category === category;
    const matchesPractice = !practiceOnly || questionStatus[question.id] === "practice";
    return matchesDifficulty && matchesCategory && matchesPractice;
  });
  const visibleIndex = Math.min(questionIndex, Math.max(filteredQuestions.length - 1, 0));
  const activeQuestion = filteredQuestions[visibleIndex];
  const knownCount = result.questions.filter((question) => questionStatus[question.id] === "known").length;
  const practiceCount = result.questions.filter((question) => questionStatus[question.id] === "practice").length;

  function updateQuestionStatus(questionId: number, status: QuestionStatus) {
    setQuestionStatus((current) => ({ ...current, [questionId]: status }));
    setQuestionIndex(0);
  }

  function showPracticeAreas() {
    setDifficulty("All");
    setCategory("All");
    setPracticeOnly(true);
    setQuestionIndex(0);
  }

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard-hero">
        <div>
          <p className="section-kicker">YOUR INTERVIEW PLAN</p>
          <h2 id="dashboard-title">{result.role}</h2>
          <p className="summary">{result.summary}</p>
        </div>
        <div className="hero-count">
          <strong>{result.questions.length}</strong>
          <span>questions ready</span>
        </div>
      </header>

      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <ProgressBar total={result.questions.length} known={knownCount} practice={practiceCount} />
          <section className="skills-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">FOCUS AREAS</p>
                <h2>Skills to sharpen</h2>
              </div>
              <span className="panel-count">{result.skills.length}</span>
            </div>
            <SkillList skills={result.skills} />
          </section>
        </aside>

        <section className="questions-panel" aria-labelledby="questions-title">
          <div className="section-heading questions-heading">
            <div>
              <p className="section-kicker">PRACTICE SET</p>
              <h2 id="questions-title">Interview questions</h2>
            </div>
            <span className="question-position">
              {filteredQuestions.length === 0 ? "0 / 0" : `${visibleIndex + 1} / ${filteredQuestions.length}`}
            </span>
          </div>
          <FilterBar
            difficulty={difficulty}
            category={category}
            categories={categories}
            practiceOnly={practiceOnly}
            onDifficultyChange={(value) => {
              setDifficulty(value);
              setPracticeOnly(false);
              setQuestionIndex(0);
            }}
            onCategoryChange={(value) => {
              setCategory(value);
              setPracticeOnly(false);
              setQuestionIndex(0);
            }}
            onPracticeWeakAreas={showPracticeAreas}
          />

          {activeQuestion ? (
            <>
              <QuestionCard
                key={activeQuestion.id}
                question={activeQuestion}
                position={result.questions.findIndex((question) => question.id === activeQuestion.id) + 1}
                status={questionStatus[activeQuestion.id] ?? "unanswered"}
                onStatusChange={(status) => updateQuestionStatus(activeQuestion.id, status)}
              />
              <nav className="question-navigation" aria-label="Question navigation">
                <button
                  className="nav-button"
                  type="button"
                  onClick={() => setQuestionIndex((index) => Math.max(index - 1, 0))}
                  disabled={visibleIndex === 0}
                >
                  <span aria-hidden="true">←</span> Previous
                </button>
                <span>Question {visibleIndex + 1} of {filteredQuestions.length}</span>
                <button
                  className="nav-button next-button"
                  type="button"
                  onClick={() => setQuestionIndex((index) => Math.min(index + 1, filteredQuestions.length - 1))}
                  disabled={visibleIndex === filteredQuestions.length - 1}
                >
                  Next <span aria-hidden="true">→</span>
                </button>
              </nav>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">✦</span>
              <h3>{practiceOnly ? "No weak areas yet" : "No questions match these filters"}</h3>
              <p>{practiceOnly ? "Mark questions as Need practice and they will appear here." : "Try a different difficulty or category."}</p>
              {practiceOnly && <button className="reveal-button" type="button" onClick={() => setPracticeOnly(false)}>Show all questions</button>}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
