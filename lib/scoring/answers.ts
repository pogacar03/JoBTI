import { PROGRESS_OPTIONS, QUESTIONS, START_OPTIONS } from '@/data/questions';
import { emptyDimensionScores, normalizeDimensionScores } from './dimensions';
import type { AssessmentInput, Dimension, DimensionScores, TagScores } from './types';

export type QuizAnswers = Record<string, string>;

function addDelta(target: DimensionScores, delta: Partial<DimensionScores>): void {
  for (const [dimension, value] of Object.entries(delta) as [Dimension, number][]) {
    target[dimension] += value;
  }
}

function addTags(target: TagScores, tags: TagScores | undefined): void {
  for (const [tag, value] of Object.entries(tags ?? {})) {
    target[tag as keyof TagScores] = (target[tag as keyof TagScores] ?? 0) + (value ?? 0);
  }
}

function maxDimensionScores(): DimensionScores {
  const max = emptyDimensionScores();
  max.O = 100;
  for (const question of QUESTIONS) {
    for (const dimension of ['P', 'A', 'C', 'I', 'D', 'S', 'W', 'M', 'F'] as Dimension[]) {
      const questionMax = Math.max(...question.options.map((option) => option.delta[dimension] ?? 0), 0);
      max[dimension] += questionMax;
    }
  }
  return max;
}

export function aggregateAnswers(answers: QuizAnswers): AssessmentInput {
  const raw = emptyDimensionScores();
  const tags: TagScores = {};
  const progress = PROGRESS_OPTIONS.find((option) => option.id === answers.q0);
  if (progress) {
    addDelta(raw, progress.fixedScores);
    addTags(tags, progress.tagDelta);
  }
  const start = START_OPTIONS.find((option) => option.id === answers.start);
  if (start) addTags(tags, start.tagDelta);
  for (const question of QUESTIONS) {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected) continue;
    addDelta(raw, selected.delta);
    addTags(tags, selected.tagDelta);
  }
  return { scores: normalizeDimensionScores(raw, maxDimensionScores()), tags };
}

export function feedbackForAnswers(answers: QuizAnswers): string | null {
  const assessment = aggregateAnswers(answers);
  if ((assessment.tags.HIGH_VOLUME ?? 0) >= 5) return '招聘网站感谢你的 DAU 贡献。';
  if (assessment.scores.A >= 65) return '系统已记录你的精神状态。';
  if ((assessment.tags.INFO_HUNT ?? 0) >= 5) return '情报部门已经开始超负荷运行。';
  if ((assessment.tags.SUPERSTITION ?? 0) >= 4) return '科学部分已结束，正在连接宇宙。';
  return null;
}
