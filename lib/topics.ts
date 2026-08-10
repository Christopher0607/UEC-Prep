import type { Mastery, Topic } from "./types";

/**
 * Shared helpers for the coverage table. Skipped topics are excluded
 * *everywhere* — dashboard, weekly review, Feynman suggestions — so that
 * "熟练 40/48" always means 48 topics the student actually intends to revise.
 */

export function activeTopics(topics: Topic[]): Topic[] {
  return topics.filter((t) => !t.skipped);
}

export interface Counts {
  total: number;
  mastered: number;
  weak: number;
  skipped: number;
}

export function countTopics(topics: Topic[]): Counts {
  const active = activeTopics(topics);
  return {
    total: active.length,
    mastered: active.filter((t) => t.mastery === 3).length,
    weak: active.filter((t) => t.mastery <= 1).length,
    skipped: topics.length - active.length,
  };
}

export interface Chapter {
  key: string;
  name: string;
  topics: Topic[];
  counts: Counts;
}

export interface Group {
  key: string;
  name: string;
  chapters: Chapter[];
  counts: Counts;
}

const NO_CHAPTER = "（未分章）";

/**
 * Splits "Book 1 · 5 Double entry bookkeeping" into group "Book 1" and chapter
 * "5 Double entry bookkeeping". Sections with extra separators
 * ("试卷一 · 应用文 · 公函") keep everything after the first as the chapter, so
 * the tree stays two levels deep no matter how the syllabus was written.
 */
export function buildTree(topics: Topic[]): Group[] {
  const groups = new Map<string, Map<string, Topic[]>>();

  for (const topic of topics) {
    const parts = topic.section.split(" · ").map((p) => p.trim()).filter(Boolean);
    const groupName = parts[0] ?? "未分类";
    const chapterName = parts.slice(1).join(" · ") || NO_CHAPTER;

    if (!groups.has(groupName)) groups.set(groupName, new Map());
    const chapters = groups.get(groupName)!;
    if (!chapters.has(chapterName)) chapters.set(chapterName, []);
    chapters.get(chapterName)!.push(topic);
  }

  return [...groups.entries()].map(([groupName, chapters]) => {
    const built: Chapter[] = [...chapters.entries()].map(([chapterName, list]) => ({
      key: `${groupName}::${chapterName}`,
      name: chapterName,
      topics: list,
      counts: countTopics(list),
    }));
    return {
      key: groupName,
      name: groupName,
      chapters: built,
      counts: countTopics(built.flatMap((c) => c.topics)),
    };
  });
}

/** A chapter counts as skipped only when every topic in it is skipped. */
export function isChapterSkipped(chapter: Chapter): boolean {
  return chapter.topics.length > 0 && chapter.counts.total === 0;
}

export const MASTERY_LEVELS: Mastery[] = [0, 1, 2, 3];
