export type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

type FilterBarProps = {
  difficulty: DifficultyFilter;
  category: string;
  categories: string[];
  practiceOnly: boolean;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onCategoryChange: (category: string) => void;
  onPracticeWeakAreas: () => void;
};

const difficulties: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];

export function FilterBar({
  difficulty,
  category,
  categories,
  practiceOnly,
  onDifficultyChange,
  onCategoryChange,
  onPracticeWeakAreas,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="difficulty-filters" role="group" aria-label="Filter by difficulty">
        {difficulties.map((option) => (
          <button
            className={difficulty === option && !practiceOnly ? "filter-button active" : "filter-button"}
            key={option}
            type="button"
            onClick={() => onDifficultyChange(option)}
            aria-pressed={difficulty === option && !practiceOnly}
          >
            {option}
          </button>
        ))}
      </div>
      <label className="category-filter">
        <span>Category</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="All">All categories</option>
          {categories.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <button
        className={practiceOnly ? "weak-button active" : "weak-button"}
        type="button"
        onClick={onPracticeWeakAreas}
        aria-pressed={practiceOnly}
      >
        Practice weak areas
      </button>
    </div>
  );
}
