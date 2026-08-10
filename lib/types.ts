export type SubjectId =
  | "english"
  | "accounting"
  | "chinese"
  | "economics"
  | "math"
  | "business"
  | "advmath";

/** 0–3. The whole point of the coverage table is that only level 3 is safe. */
export type Mastery = 0 | 1 | 2 | 3;

/** Why the question was lost. Each cause needs a different fix. */
export type MistakeCause = "concept" | "method" | "careless" | "time";

export interface Topic {
  id: string;
  subjectId: SubjectId;
  /**
   * Where the topic sits in the book, as "组 · 章" (e.g. "Book 1 · 5 Double
   * entry bookkeeping"). The " · " separator is what the coverage table splits
   * on to build its collapsible tree, so keep it when seeding syllabi.
   */
  section: string;
  title: string;
  mastery: Mastery;
  /**
   * Out of scope — not on the syllabus, already dropped, or simply not worth
   * revising. Hidden by default and excluded from every count, so a 96-topic
   * subject stays usable instead of permanently showing an unreachable total.
   */
  skipped?: boolean;
  /** How often this topic showed up in past papers, filled in by hand. */
  frequency: number;
  updatedAt: string;
}

export interface Mistake {
  id: string;
  subjectId: SubjectId;
  topicId: string | null;
  /** The question itself, typed or transcribed. */
  question: string;
  /** What the student actually wrote — the diagnosis lives here, not in the answer. */
  myWork: string;
  /** The exact step where it fell apart. */
  stuckAt: string;
  cause: MistakeCause;
  /** data: URL of a photo of the question, kept small by client-side downscaling. */
  photo?: string;
  source?: string;
  resolved: boolean;
  /** Bumped every time it is reviewed, so stubborn mistakes stand out. */
  reviewCount: number;
  createdAt: string;
  lastReviewedAt?: string;
}

export interface Card {
  id: string;
  subjectId: SubjectId;
  front: string;
  back: string;
  /** Leitner box, 0–6. See lib/srs.ts. */
  box: number;
  dueAt: string;
  lapses: number;
  createdAt: string;
}

export interface PaperAttempt {
  id: string;
  subjectId: SubjectId;
  /** e.g. "2023 Paper 1". */
  label: string;
  score: number;
  total: number;
  /** Minutes actually spent, versus the paper's official allowance. */
  minutesTaken?: number;
  minutesAllowed?: number;
  /** Marks lost, split by cause — this is what tells you where to spend the next week. */
  lostToConcept?: number;
  lostToMethod?: number;
  lostToCareless?: number;
  notes?: string;
  takenAt: string;
}

export interface AppData {
  version: number;
  topics: Topic[];
  mistakes: Mistake[];
  cards: Card[];
  papers: PaperAttempt[];
  /** Baseline from the mid-year report card, used until a real paper score exists. */
  baselines: Partial<Record<SubjectId, number>>;
  updatedAt: string;
}
