import type { InterviewSkill } from "../types/interview.js";

type SkillListProps = {
  skills: InterviewSkill[];
};

export function SkillList({ skills }: SkillListProps) {
  return (
    <div className="skill-list">
      {skills.map((skill) => (
        <article className="skill-card" key={skill.name}>
          <div className="skill-mark" aria-hidden="true">
            {skill.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h3>{skill.name}</h3>
            <span className={`importance importance-${skill.importance.toLowerCase()}`}>
              {skill.importance} importance
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
