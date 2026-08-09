export function ProgressMeter({
  percentage,
  label,
}: Readonly<{ percentage: number; label?: string }>) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-ink">
          {label ?? "Program progress"}
        </span>
        <span className="font-mono font-semibold text-yaye-blue">
          {percentage}%
        </span>
      </div>
      <div
        className="mt-2 h-2 bg-ink/10"
        role="progressbar"
        aria-label={label ?? "Program progress"}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-yaye-teal"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
