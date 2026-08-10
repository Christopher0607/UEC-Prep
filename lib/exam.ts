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
  /**
   * Minutes for 卷一 and 卷二, taken from 坤成中学 2026 预试时间表 (Sr3Com column).
   * The trial mirrors the real paper lengths, so these are the numbers to set a
   * timer to when doing past papers — practising "roughly an hour" trains the
   * wrong pace.
   */
  minutes: [number, number];
}

export const A1_THRESHOLD = 80;

export const SUBJECTS: Subject[] = [
  { id: "english", name: "英文", medium: "英文", date: "2026-10-21", session: "上午", baseline: 61, short: "英", minutes: [100, 80] },
  { id: "accounting", name: "会计学", medium: "英文", date: "2026-10-21", session: "下午", baseline: 77, short: "会", minutes: [30, 180] },
  { id: "chinese", name: "华文", medium: "中文", date: "2026-10-22", session: "上午", baseline: 64, short: "华", minutes: [105, 105] },
  { id: "economics", name: "经济学", medium: "中文", date: "2026-10-22", session: "下午", baseline: 80, short: "经", minutes: [45, 150] },
  { id: "math", name: "数学", medium: "英文", date: "2026-10-23", session: "上午", baseline: null, short: "数", minutes: [60, 120] },
  { id: "business", name: "商业学", medium: "中文", date: "2026-10-24", session: "下午", baseline: 70, short: "商", minutes: [50, 120] },
  { id: "advmath", name: "高级数学", medium: "英文", date: "2026-10-27", session: "上午", baseline: 69, short: "高", minutes: [60, 120] },
];

/**
 * 坤成中学 2026 统考预试, Sr3Com column. 预试一律不给予补考.
 *
 * Worth noting how differently it is spread: the trial gives a rest day between
 * most papers, while the real UEC sits four subjects inside 48 hours. Doing well
 * here does not prove you can survive that density.
 */
export interface TrialExam {
  date: string;
  weekday: string;
  subjectId: SubjectId | null;
  /** Trial-only subject label when it maps to no registered UEC subject. */
  label?: string;
  slots: string[];
}

export const TRIAL_EXAMS: TrialExam[] = [
  { date: "2026-09-07", weekday: "一", subjectId: "economics", slots: ["8:15–9:00 卷一 45min", "9:15–11:45 卷二 2hr30"] },
  { date: "2026-09-08", weekday: "二", subjectId: "english", slots: ["8:15–9:55 卷一 1hr40", "10:10–11:30 卷二 1hr20"] },
  { date: "2026-09-09", weekday: "三", subjectId: "advmath", slots: ["8:15–9:15 卷一 1hr", "9:30–11:30 卷二 2hr"] },
  { date: "2026-09-10", weekday: "四", subjectId: "business", slots: ["8:15–9:05 卷一 50min", "9:10–11:10 卷二 2hr"] },
  { date: "2026-09-11", weekday: "五", subjectId: "chinese", slots: ["8:15–10:00 卷一 1hr45", "10:15–12:00 卷二 1hr45"] },
  // BM is on the Sr3Com timetable but not a subject this student sits, so the
  // whole day is free — and 12–13/9, 15–16/9 and 19/9 are already 居家备考.
  { date: "2026-09-14", weekday: "一", subjectId: null, label: "BM（我不考）— 整天空档", slots: [] },
  { date: "2026-09-17", weekday: "四", subjectId: "accounting", slots: ["8:15–8:45 卷一 30min", "9:00–12:00 卷二 3hr"] },
  { date: "2026-09-18", weekday: "五", subjectId: "math", slots: ["8:15–9:15 卷一 1hr", "9:30–11:30 卷二 2hr"] },
];

export const TRIAL_START = new Date(`2026-09-07T08:15:00${MY_OFFSET}`);

/** Rules off the timetable that cost marks if forgotten. */
export const TRIAL_NOTES = [
  "预试一律不给予补考 —— 缺考就是零分，没有第二次。",
  "卷一与卷二之间有 15 分钟暂停。卷一收齐后可暂离考场，但必须在卷二开考前 5 分钟回场填答案卡。",
  "允许的计算机型号：Casio fx-570ms / fx-350ms / fx-991MS（含 -2 版）、Canon F-788SG / F-570SG、Olympia ES-570MS / -3e、基本计算机。",
  "禁带智能手表、手环、可擦拭原子笔、铅笔盒、印章、涂改液、水壶套。身份证放桌面左上角。",
  "考试不超过 90 分钟的场次不准上洗手间。",
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
    goal: "每科限时做一套历届真题，拿到不含作业分的真实基线。不知道起点，后面全是瞎猜。",
  },
  {
    key: "gaps",
    name: "补洞期（一）· 预考前",
    start: "2026-08-17",
    end: "2026-09-06",
    goal: "三周，按考点覆盖表清盲区。目标不是「学完」，是让预考量出一个值得参考的成绩。",
  },
  {
    key: "trial",
    name: "校内预考",
    start: "2026-09-07",
    end: "2026-09-19",
    goal: "全真环境、不给补考。这是统考前唯一一次别人替你严格计时和批改的机会 —— 当成真的考。",
  },
  {
    key: "gaps2",
    name: "补洞期（二）· 按预考结果",
    start: "2026-09-20",
    end: "2026-10-12",
    goal: "三周，照预考丢分的地方重排优先级。这一段的计划要等成绩出来才定，现在别提前锁死。",
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
    name: "统考周",
    start: "2026-10-21",
    end: "2026-10-27",
    goal: "头两天考掉四科。剩下数学、商业、高数有缓冲，考完一科立刻切换。",
  },
];

/**
 * The student's actual daily blocks, in their own words. Planning against these
 * beats planning against a total: a 30-minute gap and a 3-hour evening are not
 * interchangeable, and matching the task to the block is most of what "studying
 * efficiently" means when the total is fixed.
 */
export interface StudyBlock {
  label: string;
  minutes: number;
  /** What this block is actually good for. Short blocks cannot do deep work. */
  bestFor: string;
  why: string;
}

export const STUDY_BLOCKS: StudyBlock[] = [
  {
    label: "40 分钟",
    minutes: 40,
    bestFor: "背诵卡 + 错题重做",
    why: "太短，开不了新章节。用来清到期的卡和重做昨天的错题，正好。",
  },
  {
    label: "30 分钟",
    minutes: 30,
    bestFor: "语法 / Word Form 刷题",
    why: "Paper 2 的 Section 4、5 是规则题，碎片时间刷最划算。",
  },
  {
    label: "3 小时",
    minutes: 180,
    bestFor: "补洞，或一整套限时模考",
    why: "唯一装得下一套完整试卷的块。别用来背单词 —— 那是浪费。",
  },
  {
    label: "2 小时（补习）",
    minutes: 120,
    bestFor: "跟老师的进度 + 当场把不懂的问掉",
    why: "有人可以问的时间最贵。听不懂的当场问，别带回家。",
  },
];

export const DAILY_MINUTES = STUDY_BLOCKS.reduce((sum, b) => sum + b.minutes, 0);

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
