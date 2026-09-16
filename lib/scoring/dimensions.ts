import { DIMENSIONS, type Dimension, type DimensionScores } from './types';

export { DIMENSIONS };

export function emptyDimensionScores(): DimensionScores {
  return DIMENSIONS.reduce((scores, dimension) => {
    scores[dimension] = 0;
    return scores;
  }, {} as DimensionScores);
}

export function normalizeDimensionScores(raw: DimensionScores, maxRaw: DimensionScores): DimensionScores {
  return DIMENSIONS.reduce((scores, dimension) => {
    const rawValue = Number.isFinite(raw[dimension]) ? raw[dimension] : 0;
    const maxValue = Number.isFinite(maxRaw[dimension]) ? maxRaw[dimension] : 0;
    const ratio = maxValue > 0 ? (rawValue / maxValue) * 100 : rawValue > 0 ? 100 : 0;
    scores[dimension] = Math.min(100, Math.max(0, Math.round(ratio * 100) / 100));
    return scores;
  }, {} as DimensionScores);
}

export function clampDimensionScores(scores: DimensionScores): DimensionScores {
  return DIMENSIONS.reduce((result, dimension) => {
    result[dimension] = Math.min(100, Math.max(0, Math.round(scores[dimension] * 100) / 100));
    return result;
  }, {} as DimensionScores);
}

export function dimensionLabel(dimension: Dimension): string {
  return {
    P: '投递欲',
    A: '焦虑值',
    C: '比较心',
    I: '情报浓度',
    D: '梦司执念',
    S: '保底意识',
    W: '等待耐力',
    M: '玄学浓度',
    F: '秋招疲劳',
    O: '当前战果',
  }[dimension];
}

export function topDimensions(scores: DimensionScores, count = 4): Dimension[] {
  return [...DIMENSIONS].sort((left, right) => scores[right] - scores[left]).slice(0, count);
}
