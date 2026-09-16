export const DIMENSIONS = ['P', 'A', 'C', 'I', 'D', 'S', 'W', 'M', 'F', 'O'] as const;
export type Dimension = (typeof DIMENSIONS)[number];
export type DimensionScores = Record<Dimension, number>;

export const PERSONALITY_TAGS = [
  'HIGH_VOLUME',
  'EXAM_HELL',
  'REFERRAL',
  'LATE_START',
  'POOLING',
  'HR_KEEP_WARM',
  'DREAM_COMPANY',
  'SUPERSTITION',
  'LOCATION_FLEX',
  'ROLE_JUMP',
  'COMPARISON',
  'RETRY',
  'HOLD_OFFER',
  'SALARY_NEGOTIATION',
  'REVERSE_INTERVIEW',
  'OFFER_RICH',
  'SIGNED',
  'STATUS_CHECK',
  'OC_HYPERVIGILANCE',
  'INFO_HUNT',
  'NO_PIPELINE',
  'PREMATURE_OC',
] as const;
export type PersonalityTag = (typeof PERSONALITY_TAGS)[number];
export type TagScores = Partial<Record<PersonalityTag, number>>;

export type PersonalityFamily =
  | 'FLOW_VICTIM'
  | 'APPLICATION'
  | 'MENTAL'
  | 'INTEL'
  | 'DREAM'
  | 'UPPER_GAME'
  | 'SPECIAL';

export type PersonalityRarity = 'COMMON' | 'RARE' | 'HIDDEN' | 'SSR';
export type ComparisonOp = 'gte' | 'lte' | 'eq';

export type GateRule =
  | { kind: 'dimension'; dimension: Dimension; op: ComparisonOp; value: number }
  | { kind: 'tag'; tag: PersonalityTag; op: ComparisonOp; value: number };

export interface BonusRule {
  when: GateRule;
  amount: number;
}

export interface Personality {
  code: string;
  name: string;
  family: PersonalityFamily;
  rarity: PersonalityRarity;
  targetVector: DimensionScores;
  dimensionWeights: Partial<Record<Dimension, number>>;
  tagProfile?: TagScores;
  gates?: GateRule[];
  bonusRules?: BonusRule[];
  tagline: string;
  description: string;
  symptoms: string[];
  catchphrase: string;
  strength: string;
  weakness: string;
  enemy: string;
  diagnosis: string;
  shareText: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  note?: string;
  delta: Partial<DimensionScores>;
  tagDelta?: TagScores;
}

export interface Question {
  id: string;
  number: number;
  prompt: string;
  eyebrow: string;
  options: QuestionOption[];
  hidden?: boolean;
}

export interface HiddenQuestion extends Question {
  hidden: true;
  unlockWhen: (answers: Record<string, string>) => boolean;
}

export interface AssessmentInput {
  scores: DimensionScores;
  tags: TagScores;
}

export interface PersonalityScore {
  code: string;
  eligible: boolean;
  vectorSimilarity: number;
  tagMatch: number;
  bonus: number;
  total: number;
}

export interface ResolvedResult {
  primary: Personality;
  secondary: Personality;
  primaryScore: PersonalityScore;
  secondaryScore: PersonalityScore;
  combinationTitle: string;
  normalizedScores: DimensionScores;
  tags: TagScores;
}
