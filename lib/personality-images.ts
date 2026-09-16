/**
 * The visual identity manifest is intentionally kept separate from scoring data.
 * Every code has exactly one local, lower-case JPEG so UI surfaces cannot silently
 * borrow another personality's art.
 */
export const PERSONALITY_IMAGE_CODES = [
  'POOL', 'MALO', 'HITO', 'COMP', 'KING', 'HUMN', 'PEND', 'OCER', 'SAFE', 'LOVE', 'WISH', 'GAPY',
  'NOTE', 'EXAM', 'WAIT', 'CALM', 'REFR', 'LATE', 'RTRY', 'FLEX', 'JUMP', 'HOLD', 'BARG', 'SPIN',
] as const;

export type PersonalityImageCode = (typeof PERSONALITY_IMAGE_CODES)[number];

export const PERSONALITY_IMAGE_MAP: Record<PersonalityImageCode, string> = {
  POOL: '/personalities/pool.jpg',
  MALO: '/personalities/malo.jpg',
  HITO: '/personalities/hito.jpg',
  COMP: '/personalities/comp.jpg',
  KING: '/personalities/king.jpg',
  HUMN: '/personalities/humn.jpg',
  PEND: '/personalities/pend.jpg',
  OCER: '/personalities/ocer.jpg',
  SAFE: '/personalities/safe.jpg',
  LOVE: '/personalities/love.jpg',
  WISH: '/personalities/wish.jpg',
  GAPY: '/personalities/gapy.jpg',
  NOTE: '/personalities/note.jpg',
  EXAM: '/personalities/exam.jpg',
  WAIT: '/personalities/wait.jpg',
  CALM: '/personalities/calm.jpg',
  REFR: '/personalities/refr.jpg',
  LATE: '/personalities/late.jpg',
  RTRY: '/personalities/rtry.jpg',
  FLEX: '/personalities/flex.jpg',
  JUMP: '/personalities/jump.jpg',
  HOLD: '/personalities/hold.jpg',
  BARG: '/personalities/barg.jpg',
  SPIN: '/personalities/spin.jpg',
};

export function getPersonalityImage(code: string): string {
  if (!Object.prototype.hasOwnProperty.call(PERSONALITY_IMAGE_MAP, code)) {
    throw new Error(`Missing personality image for code: ${code}`);
  }
  return PERSONALITY_IMAGE_MAP[code as PersonalityImageCode];
}
