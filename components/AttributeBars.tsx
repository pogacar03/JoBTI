import { dimensionLabel, topDimensions } from '@/lib/scoring/dimensions';
import type { DimensionScores } from '@/lib/scoring/types';

export function AttributeBars({ scores }: { scores: DimensionScores }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {topDimensions(scores, 4).map((dimension) => {
        const value = Math.round(scores[dimension]);
        return (
          <div key={dimension}>
            <div className="mb-2 flex items-baseline justify-between gap-3 font-mono text-[11px]"><span>{dimensionLabel(dimension)}</span><span className="font-bold text-vermilion">{value}</span></div>
            <div className="h-3 border border-ink/45 bg-paper" aria-label={`${dimensionLabel(dimension)} ${value}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full bg-pine" style={{ width: `${value}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}
