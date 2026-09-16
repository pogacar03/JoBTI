import { describe, expect, it } from 'vitest';
import { PERSONALITIES } from '@/data/personalities';
import { buildDetailedShareDescription, buildShareCopy } from '@/lib/share/copy';

describe('share copy', () => {
  it('builds a detailed personality description from the primary profile', () => {
    const personality = PERSONALITIES[0];
    const description = buildDetailedShareDescription(personality);

    expect(description).toContain(personality.description);
    expect(description).toContain(personality.symptoms[0]);
    expect(description).toContain(personality.strength);
    expect(description).toContain(personality.weakness);
    expect(description).toContain(personality.diagnosis);
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
    expect(copy).toContain(personality.diagnosis);
    expect(copy).not.toContain(PERSONALITIES[1].name);
    expect(copy).not.toContain('不应出现在分享里的称号');
  });
});
