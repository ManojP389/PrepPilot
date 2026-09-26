import type {
  InterviewQuestion,
  InterviewResult,
  InterviewSkill,
} from "../types/interview.js";

type UnknownRecord = Record<string, unknown>;

type Importance = InterviewSkill["importance"];
type Difficulty = InterviewQuestion["difficulty"];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isImportance(value: unknown): value is Importance {
  return value === "High" || value === "Medium" || value === "Low";
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "Easy" || value === "Medium" || value === "Hard";
}

function validateSkill(value: unknown): value is InterviewSkill {
  if (!isRecord(value)) {
    return false;
  }

  return isNonEmptyString(value.name) && isImportance(value.importance);
}

function validateQuestion(value: unknown): value is InterviewQuestion {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    Number.isFinite(value.id) &&
    isNonEmptyString(value.question) &&
    isNonEmptyString(value.category) &&
    isDifficulty(value.difficulty) &&
    isNonEmptyString(value.answer)
  );
}

export function validateInterviewResult(
  data: unknown,
): InterviewResult | null {
  try {
    if (!isRecord(data)) {
      return null;
    }

    if (
      !isNonEmptyString(data.role) ||
      !isNonEmptyString(data.summary) ||
      !Array.isArray(data.skills) ||
      !Array.isArray(data.questions)
    ) {
      return null;
    }

    const skills = data.skills.filter(validateSkill);
    const questions = data.questions.filter(validateQuestion);

    if (
      skills.length !== data.skills.length ||
      skills.length < 6 ||
      skills.length > 8 ||
      questions.length !== data.questions.length ||
      questions.length < 10
    ) {
      return null;
    }

    const questionIds = new Set<number>();
    const categories = new Set<string>();
    const difficulties = new Set<Difficulty>();

    for (const question of questions) {
      if (questionIds.has(question.id)) {
        return null;
      }

      questionIds.add(question.id);
      categories.add(question.category);
      difficulties.add(question.difficulty);
    }

    if (
      categories.size < 3 ||
      !difficulties.has("Easy") ||
      !difficulties.has("Medium") ||
      !difficulties.has("Hard")
    ) {
      return null;
    }

    return {
      role: data.role,
      summary: data.summary,
      skills,
      questions,
    };
  } catch {
    return null;
  }
}
