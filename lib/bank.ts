import type { BankQuestion, PastPaper, QuestionType, SubjectId } from "./types";

/**
 * Helpers for 历年考题题库. The scans are the obvious part, but the value is in
 * the per-question index: eight years of papers only becomes actionable once
 * you can say which chapters actually get examined and which barely appear.
 */

export const QUESTION_TYPES: { id: QuestionType; name: string; defaultMarks?: number }[] = [
  { id: "mcq", name: "选择题", defaultMarks: 1 },
  { id: "short", name: "短答题", defaultMarks: 5 },
  { id: "long", name: "长答题", defaultMarks: 10 },
  { id: "other", name: "其他" },
];

export function typeName(id: QuestionType): string {
  return QUESTION_TYPES.find((t) => t.id === id)?.name ?? id;
}

export interface ChapterFrequency {
  chapter: string;
  /** How many questions across all indexed papers touched this chapter. */
  count: number;
  /** Total marks those questions were worth — the number that matters. */
  marks: number;
  /** Which years it showed up in, so a one-off is not read as a trend. */
  years: string[];
  attempted: number;
  correct: number;
}

/**
 * Ranks chapters by how many marks they have actually been worth. Marks beat
 * raw question counts: thirty 1-mark MCQs spread over ten chapters matter less
 * than one chapter that owns a 10-mark question every single year.
 */
export function chapterFrequency(bank: PastPaper[], subjectId: SubjectId): ChapterFrequency[] {
  const map = new Map<string, ChapterFrequency>();

  for (const paper of bank) {
    if (paper.subjectId !== subjectId) continue;
    for (const q of paper.questions) {
      const key = q.chapter.trim();
      if (!key) continue;
      const entry = map.get(key) ?? {
        chapter: key,
        count: 0,
        marks: 0,
        years: [],
        attempted: 0,
        correct: 0,
      };
      entry.count += 1;
      entry.marks += q.marks ?? 0;
      if (!entry.years.includes(paper.year)) entry.years.push(paper.year);
      if (q.attempted) entry.attempted += 1;
      if (q.correct) entry.correct += 1;
      map.set(key, entry);
    }
  }

  return [...map.values()]
    .map((e) => ({ ...e, years: [...e.years].sort() }))
    .sort((a, b) => b.marks - a.marks || b.count - a.count);
}

/**
 * Parses a pasted question index so a whole paper can be entered in one go.
 * One question per line: `题号 | 题型 | 分数 | 章节`, with everything after the
 * number optional. Typing thirty MCQs one field at a time is how a good tool
 * stops getting used.
 */
export function parseQuestions(text: string): BankQuestion[] {
  const out: BankQuestion[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split("|").map((p) => p.trim());
    const [number, typeRaw = "", marksRaw = "", chapter = ""] = parts;
    if (!number) continue;

    const type =
      QUESTION_TYPES.find((t) => t.id === typeRaw || t.name === typeRaw)?.id ??
      (parts.length === 1 ? "mcq" : "other");
    const marks = Number(marksRaw);

    out.push({
      id: `${Date.now().toString(36)}-${out.length}-${Math.random().toString(36).slice(2, 6)}`,
      number,
      type,
      marks: Number.isFinite(marks) && marksRaw !== ""
        ? marks
        : QUESTION_TYPES.find((t) => t.id === type)?.defaultMarks,
      chapter,
      attempted: false,
    });
  }
  return out;
}

/** "2023 · 试卷二" — used for headings and for the grading prompt's paper name. */
export function paperLabel(p: PastPaper): string {
  return [p.year, p.paper].filter(Boolean).join(" · ");
}
