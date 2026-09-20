'use client';

interface BudgetProgressBarProps {
  current: number;
  goal: number | null;
}

export function BudgetProgressBar({ current, goal }: BudgetProgressBarProps) {
  if (goal === null || goal <= 0) return null;

  const pct = Math.min(100, (current / goal) * 100);
  const isWarning = pct >= 75 && pct < 100;
  const isDanger = pct >= 100;

  const barColor = isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-primary';

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200" data-testid="progress-bar">
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
