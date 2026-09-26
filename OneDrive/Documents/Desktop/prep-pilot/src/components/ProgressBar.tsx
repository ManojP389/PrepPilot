type ProgressBarProps = {
  total: number;
  known: number;
  practice: number;
};

export function ProgressBar({ total, known, practice }: ProgressBarProps) {
  const completed = known + practice;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="progress-panel" aria-label="Preparation progress">
      <div className="section-heading compact-heading">
        <div>
          <p className="section-kicker">YOUR PROGRESS</p>
          <h2>{percentage}% ready</h2>
        </div>
        <span className="progress-fraction">{completed}/{total}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-label={`${percentage}% of questions completed`}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="progress-legend">
        <span><i className="legend-dot known-dot" />{known} know this</span>
        <span><i className="legend-dot practice-dot" />{practice} to practice</span>
      </div>
    </section>
  );
}
