import type { Personality } from '@/lib/scoring/types';

export const SHARE_SITE_URL = 'https://qiuzhao.site';

export interface ShareCopyResult {
  primary: Personality;
  secondary?: Personality;
  combinationTitle?: string;
}

export function buildDetailedShareDescription(personality: Personality): string {
  const symptoms = personality.symptoms.slice(0, 2).join('；');
  return [
    personality.description,
    '',
    `当你遇到秋招里的等待、比较和不确定时，你通常会：${symptoms}。`,
    `你的优势是${personality.strength}；也要留意${personality.weakness}`,
  ].join('\n');
}

export function buildPosterSummary(personality: Personality): string {
  return [
    personality.description,
    `典型状态：${personality.symptoms[0]}。`,
  ].join('\n');
}

export function buildShareCopy({ primary }: ShareCopyResult): string {
  return [
    `救命，测出来我是 ${primary.code}「${primary.name}」😂`,
    '',
    '你是一个什么样的人？',
    buildDetailedShareDescription(primary),
    '',
    `毒舌鉴定：${primary.diagnosis}`,
    '',
    `来 ${SHARE_SITE_URL.replace('https://', '')} 测测你的秋招人格`,
    '',
    '#JOBTI #秋招 #秋招人格测试',
  ].join('\n');
}
