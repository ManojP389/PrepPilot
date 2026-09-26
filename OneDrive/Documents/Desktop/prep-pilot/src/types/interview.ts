export interface InterviewSkill {
  name: string;
  importance: "High" | "Medium" | "Low";
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  answer: string;
}

export interface InterviewResult {
  role: string;
  summary: string;
  skills: InterviewSkill[];
  questions: InterviewQuestion[];
}
