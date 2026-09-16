import { describe, expect, it } from 'vitest';
import { PERSONALITIES } from '@/data/personalities';
import { buildDetailedShareDescription, buildPosterSummary, buildShareCopy } from '@/lib/share/copy';

describe('share copy', () => {
  it('builds a detailed personality description from the primary profile', () => {
    const personality = PERSONALITIES[0];
    const description = buildDetailedShareDescription(personality);

    expect(description).toContain(personality.description);
    expect(description).toContain(personality.symptoms[0]);
    expect(description).toContain(personality.strength);
    expect(description).toContain(personality.weakness);
    expect(description).not.toContain(personality.diagnosis);
  });

  it('keeps the poster summary short and separate from the punchline diagnosis', () => {
    const summary = buildPosterSummary(PERSONALITIES[0]);

    expect(summary).toBe([
      '你不是没有流程，只是流程目前选择了静音。',
      '典型状态：投递记录很多，状态更新很少。',
    ].join('\n'));
    expect(summary).not.toContain('自己泡在池子里');
  });

  it('does not mention secondary personality or combination title', () => {
    const personality = PERSONALITIES[0];
    const copy = buildShareCopy({
      primary: personality,
      secondary: PERSONALITIES[1],
      combinationTitle: '不应出现在分享里的称号',
    });

    expect(copy).toContain(`「${personality.name}」`);
    expect(copy).toContain('你是一个什么样的人');
    expect(copy).toContain(`毒舌鉴定：${personality.diagnosis}`);
    expect(copy.match(new RegExp(personality.diagnosis, 'g'))).toHaveLength(1);
    expect(copy).not.toContain(PERSONALITIES[1].name);
    expect(copy).not.toContain('不应出现在分享里的称号');
  });
});
