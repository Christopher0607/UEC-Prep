import type { SubjectId } from "./types";

/**
 * 第52届高中统考 timetable, transcribed from 董总考试局《2026年度统考行事历》
 * (修定于2026年3月10日).
 *
 * The PDF only prints 上午 / 下午, not clock times. 08:00 and 14:00 are stand-ins
 * so the countdown has something to aim at — confirm the real times on the
 * 准考证 and correct them here if they differ. Malaysia is UTC+8 year round, and
 * the offset is written out explicitly so the countdown is identical whether the
 * page is opened on a phone in KL or a laptop set to another timezone.
 */
const MY_OFFSET = "+08:00";

export interface Subject {
  id: SubjectId;
  name: string;
  /** Language the paper is sat in — it changes how you revise, so it is shown. */
  medium: "中文" | "英文";
  date: string;
  session: "上午" | "下午";
  /** Mid-year report card average, coursework included (so: optimistic). */
  baseline: number | null;
  short: string;
}

export const A1_THRESHOLD = 80;

export const SUBJECTS: Subject[] = [
  { id: "english", name: "英文", medium: "英文", date: "2026-10-21", session: "上午", baseline: 61, short: "英" },
  { id: "accounting", name: "会计学", medium: "英文", date: "2026-10-21", session: "下午", baseline: 77, short: "会" },
  { id: "chinese", name: "华文", medium: "中文", date: "2026-10-22", session: "上午", baseline: 64, short: "华" },
  { id: "economics", name: "经济学", medium: "中文", date: "2026-10-22", session: "下午", baseline: 80, short: "经" },
  { id: "math", name: "数学", medium: "英文", date: "2026-10-23", session: "上午", baseline: null, short: "数" },
  { id: "business", name: "商业学", medium: "中文", date: "2026-10-24", session: "下午", baseline: 70, short: "商" },
  { id: "advmath", name: "高级数学", medium: "英文", date: "2026-10-27", session: "上午", baseline: 69, short: "高" },
];

export function subjectById(id: SubjectId): Subject {
  const found = SUBJECTS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown subject: ${id}`);
  return found;
}

export function examDate(subject: Subject): Date {
  const time = subject.session === "上午" ? "08:00:00" : "14:00:00";
  return new Date(`${subject.date}T${time}${MY_OFFSET}`);
}

/** Subjects in the order they are sat, which is the order they must be ready in. */
export const SUBJECTS_BY_DATE = [...SUBJECTS].sort(
  (a, b) => examDate(a).getTime() - examDate(b).getTime(),
);

export const FIRST_EXAM = examDate(SUBJECTS_BY_DATE[0]);
export const LAST_EXAM = examDate(SUBJECTS_BY_DATE[SUBJECTS_BY_DATE.length - 1]);
export const RESULTS_DAY = new Date(`2026-12-30T00:00:00${MY_OFFSET}`);

export interface Phase {
  key: string;
  name: string;
  start: string;
  end: string;
  goal: string;
}

/**
 * 英文、会计、华文、经济 are all sat inside the first 48 hours, so there is no
 * "revise it the night before" room for four of the seven. The plan front-loads
 * everything and keeps the last week for review only.
 */
export const PHASES: Phase[] = [
  {
    key: "diagnose",
    name: "诊断期",
    start: "2026-08-06",
    end: "2026-08-16",
    goal: "每科限时做一套真题，拿到不含作业分的真实基线。不知道起点，后面全是瞎猜。",
  },
  {
    key: "gaps",
    name: "补洞期",
    start: "2026-08-17",
    end: "2026-09-20",
    goal: "按考点覆盖表逐个清盲区，把掌握度推到 3。英文每天不断。",
  },
  {
    key: "drill",
    name: "刷卷期",
    start: "2026-09-21",
    end: "2026-10-12",
    goal: "全真限时模考，每科 3–5 套。练的是步骤分和时间分配，不是新知识。",
  },
  {
    key: "consolidate",
    name: "收口期",
    start: "2026-10-13",
    end: "2026-10-20",
    goal: "只看错题本和背诵卡，不碰新题。这周的目标是不忘，不是多学。",
  },
  {
    key: "exam",
    name: "考试周",
    start: "2026-10-21",
    end: "2026-10-27",
    goal: "头两天考掉四科。剩下数学、商业、高数有缓冲，考完一科立刻切换。",
  },
];

export function phaseOn(now: Date): Phase | null {
  const today = toMyDateString(now);
  return PHASES.find((p) => today >= p.start && today <= p.end) ?? null;
}

/** YYYY-MM-DD as it reads on a calendar in Malaysia, not in the viewer's timezone. */
export function toMyDateString(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function daysUntil(target: Date, now: Date): number {
  const ms = target.getTime() - now.getTime();
  return Math.floor(ms / 86_400_000);
}

export function formatExamDay(subject: Subject): string {
  const d = new Date(`${subject.date}T00:00:00${MY_OFFSET}`);
  const weekday = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: "short",
  }).format(d);
  const [, month, day] = subject.date.split("-");
  return `${Number(month)}月${Number(day)}日 ${weekday} ${subject.session}`;
}
