import type { Personality } from '@/lib/scoring/types';

export interface ShareCopyResult {
  primary: Personality;
  secondary?: Personality;
  combinationTitle?: string;
}

export function buildDetailedShareDescription(personality: Personality): string {
  const symptoms = personality.symptoms.slice(0, 2).join('；');
  return [
    '你是一个什么样的人？',
    personality.description,
    '',
    `当你遇到秋招里的等待、比较和不确定时，你通常会：${symptoms}。`,
    `你的优势是${personality.strength}；也要留意${personality.weakness}`,
    '',
    `一句话诊断：${personality.diagnosis}`,
  ].join('\n');
}

export function buildShareCopy({ primary }: ShareCopyResult): string {
  return [
    `救命，测出来我是 ${primary.code}「${primary.name}」😂`,
    '',
    buildDetailedShareDescription(primary),
    '',
    '#JOBTI #秋招 #秋招人格测试',
  ].join('\n');
}
