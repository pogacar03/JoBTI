import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PERSONALITIES } from '@/data/personalities';
import {
  PERSONALITY_IMAGE_CODES,
  PERSONALITY_IMAGE_MAP,
  getPersonalityImage,
} from '@/lib/personality-images';

const EXPECTED_CODES = [
  'POOL', 'MALO', 'HITO', 'COMP', 'KING', 'HUMN', 'PEND', 'OCER', 'SAFE', 'LOVE', 'WISH', 'GAPY',
  'NOTE', 'EXAM', 'WAIT', 'CALM', 'REFR', 'LATE', 'RTRY', 'FLEX', 'JUMP', 'HOLD', 'BARG', 'SPIN',
] as const;

describe('personality image manifest', () => {
  it('maps every personality code to one lowercase public asset', () => {
    expect(PERSONALITY_IMAGE_CODES).toEqual(EXPECTED_CODES);
    expect(Object.keys(PERSONALITY_IMAGE_MAP)).toHaveLength(24);
    expect(new Set(Object.values(PERSONALITY_IMAGE_MAP)).size).toBe(24);

    for (const code of EXPECTED_CODES) {
      expect(getPersonalityImage(code)).toBe(`/personalities/${code.toLowerCase()}.jpg`);
      expect(existsSync(resolve(process.cwd(), 'public', getPersonalityImage(code).slice(1)))).toBe(true);
      expect(PERSONALITIES.some((personality) => personality.code === code)).toBe(true);
    }
  });

  it('fails loudly for an unknown personality code', () => {
    expect(() => getPersonalityImage('NOT_A_PERSONALITY')).toThrow(/missing personality image/i);
  });
});
