export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total === 0 ? 0 : Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="flex items-center gap-3" aria-label={`问卷进度 ${Math.round(percent)}%`}>
      <div className="h-2 flex-1 border border-ink/35 bg-paper" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
        <div className="h-full bg-vermilion transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
      <span className="font-mono text-[10px] text-ink/60">{Math.round(percent)}%</span>
    </div>
  );
}
