/**
 * UEC English paper structure, exactly as the student's own English teacher
 * described it. Nothing here is inferred from general exam knowledge — if a
 * detail is not in this file, it was not confirmed, and the app must not
 * pretend otherwise.
 */

export interface EssayType {
  id: string;
  name: string;
  /** What the three body headings have to do for this essay type to score. */
  demand: string;
}

export const ESSAY_TYPES: EssayType[] = [
  {
    id: "opinion",
    name: "Opinion",
    demand: "立场必须从头到尾一致，三个标题都在支撑同一个立场，不能中途摇摆。",
  },
  {
    id: "cause-effect",
    name: "Cause and Effects",
    demand: "分清因和果。三个标题要么全是成因、要么全是影响，不要混着写。",
  },
  {
    id: "compare-contrast",
    name: "Compare and Contrast",
    demand: "每个标题下两边都要谈到，只写一边等于没比较。",
  },
  {
    id: "factual",
    name: "Factual",
    demand: "陈述事实，不掺个人立场。三个标题是三个不同的事实面向。",
  },
];

/**
 * The five levels of analysis, all five confirmed with the teacher. An essay
 * that only reaches some of them is capped below the top tier no matter how
 * well it is written, which is why the planner asks for a note on every level
 * before the body is drafted.
 */
export interface AnalysisLevel {
  id: string;
  name: string;
  hint: string;
  confirmed: boolean;
}

export const ANALYSIS_LEVELS: AnalysisLevel[] = [
  { id: "individual", name: "Individual", hint: "对个人本身的影响", confirmed: true },
  { id: "family", name: "Family", hint: "对家庭的影响", confirmed: true },
  { id: "community", name: "Community", hint: "对社区／群体的影响", confirmed: true },
  { id: "national", name: "National", hint: "对国家的影响", confirmed: true },
  { id: "global", name: "Global", hint: "对全球／国际的影响", confirmed: true },
];

/** Hook → Background → Thesis. The thesis is where the marks are won or lost. */
export const INTRO_PARTS = [
  { id: "hook", name: "Hook", hint: "抓住阅卷老师，第一句就要有力" },
  { id: "background", name: "Background information", hint: "交代话题背景，铺垫到 thesis" },
  { id: "thesis", name: "Thesis Statement", hint: "一句话讲完接下来的三个大标题" },
];

export interface ThesisCheck {
  rule: string;
  pass: boolean;
  detail: string;
}

/**
 * The teacher's thesis rules are mechanical, so they can be checked before the
 * essay is ever written: one sentence, all three headings named, no heading
 * invented or dropped. Grammar still needs a human (or Claude) — this only
 * catches the structural failures, which are the ones that cost whole bands.
 */
export function checkThesis(thesis: string, headings: string[]): ThesisCheck[] {
  const text = thesis.trim();
  const named = headings.filter((h) => h.trim());

  // Count sentence terminators that are followed by more content — a trailing
  // full stop is fine, a full stop in the middle means it was split in two.
  const midSentenceBreaks = (text.match(/[.!?;]+\s+\S/g) ?? []).length;

  const missing = named.filter((h) => {
    const needle = h.trim().toLowerCase();
    return !text.toLowerCase().includes(needle);
  });

  return [
    {
      rule: "必须是一个句子",
      pass: text.length > 0 && midSentenceBreaks === 0,
      detail:
        midSentenceBreaks === 0
          ? "没有在中间断句。"
          : `句子中间断了 ${midSentenceBreaks} 次 —— 老师说不能分开句子。`,
    },
    {
      rule: "三个大标题都要写进去",
      pass: named.length === 3 && missing.length === 0,
      detail:
        named.length !== 3
          ? `你只填了 ${named.length} 个标题，要三个。`
          : missing.length === 0
            ? "三个标题都出现在 thesis 里。"
            : `thesis 里找不到：${missing.join("、")}。写错标题或漏标题都会扣分。`,
    },
    {
      rule: "标题要够广，撑得起五个层次",
      pass: false,
      detail:
        "这条机器判断不了 —— 每个标题都必须能从 Individual 讲到最高层。用下面的按钮让 Claude 逐个标题检查。",
    },
  ];
}

/** Paper 2 sections, as described by the teacher. */
export const PAPER2_SECTIONS = [
  {
    id: "matching",
    name: "Section 1 · Matching Paragraph",
    detail: "4 篇文章，10 题。难在几篇内容很像，容易对错。",
    difficulty: "难",
  },
  {
    id: "comprehension-1",
    name: "Section 2 · 阅读理解（易）",
    detail: "题目直接，通常没什么难度。这里不能丢分。",
    difficulty: "易",
  },
  {
    id: "comprehension-2",
    name: "Section 3 · 阅读理解（难）",
    detail: "文章更难，选项之间非常接近，难以辨认。",
    difficulty: "难",
  },
  {
    id: "identify-error",
    name: "Section 4 · Identify Error",
    detail: "找出句子里有语病的那个词。纯语法，可以靠刷题和归类拿满。",
    difficulty: "中",
  },
  {
    id: "word-form",
    name: "Section 5 · Word Form",
    detail: "给定单词和句子，变形后拼成完整句子。规则有限，是性价比最高的一块。",
    difficulty: "中",
  },
];

/** Seeded straight from the teacher's breakdown, so the coverage table starts real. */
export const ENGLISH_SYLLABUS_SEED: { section: string; title: string }[] = [
  { section: "Paper 1 · Summary", title: "从文章抓 2–3 个 keypoints" },
  { section: "Paper 1 · Summary", title: "用自己的话改写，不照抄原文" },
  { section: "Paper 1 · Summary", title: "控制字数" },
  ...ESSAY_TYPES.map((t) => ({ section: "Paper 1 · Essay 类型", title: t.name })),
  { section: "Paper 1 · Essay 开头", title: "Hook" },
  { section: "Paper 1 · Essay 开头", title: "Background information" },
  { section: "Paper 1 · Essay 开头", title: "Thesis Statement（一句话讲完三个标题）" },
  ...ANALYSIS_LEVELS.map((l) => ({ section: "Paper 1 · 5 Levels of Analysis", title: l.name })),
  { section: "Paper 1 · Essay 内容", title: "标题够广，每个都能覆盖五个层次" },
  ...PAPER2_SECTIONS.map((s) => ({ section: "Paper 2", title: s.name })),
  { section: "语法（我的弱项）", title: "时态" },
  { section: "语法（我的弱项）", title: "主谓一致" },
  { section: "语法（我的弱项）", title: "冠词" },
  { section: "语法（我的弱项）", title: "介词" },
  { section: "语法（我的弱项）", title: "从句与连接词" },
  { section: "语法（我的弱项）", title: "词形变化（Word Form 规则）" },
];
