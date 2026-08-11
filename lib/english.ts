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

export type AnalysisLevelId =
  | "individual"
  | "family"
  | "community"
  | "national"
  | "global";

/**
 * The five levels of analysis. **One heading targets one level** — the five are
 * a menu to pick three from, not a checklist to exhaust inside every heading.
 *
 * What the rule actually guards against is an essay that sits entirely at one
 * level ("说明不可以只偏向一个主体"), so the planner checks that the three
 * headings land on three *different* levels rather than demanding all five.
 */
export interface AnalysisLevel {
  id: AnalysisLevelId;
  name: string;
  hint: string;
  /** Rough scale order, used to suggest a clean escalation across headings. */
  rank: number;
}

export const ANALYSIS_LEVELS: AnalysisLevel[] = [
  { id: "individual", name: "Individual", hint: "对个人本身的影响", rank: 1 },
  { id: "family", name: "Family", hint: "对家庭的影响", rank: 2 },
  { id: "community", name: "Community", hint: "对社区／群体的影响", rank: 3 },
  { id: "national", name: "National", hint: "对国家的影响", rank: 4 },
  { id: "global", name: "Global", hint: "对全球／国际的影响", rank: 5 },
];

export function levelById(id: string): AnalysisLevel | undefined {
  return ANALYSIS_LEVELS.find((l) => l.id === id);
}

/**
 * Grammar slips pulled from the student's own marked work. These four
 * categories accounted for most of the errors in the first graded plan, and
 * they are the same ones Paper 2 Section 4 (Identify Error) tests — so drilling
 * them pays twice.
 */
export const GRAMMAR_TRAPS: { name: string; wrong: string; right: string }[] = [
  { name: "单复数", wrong: "individual must be open-minded", right: "individual**s** must be open-minded" },
  { name: "主谓一致", wrong: "we should always helps / who is in difficult situations", right: "we should always help / who **are** in difficult situations" },
  { name: "冠词漏写", wrong: "have right to choose / think out of box", right: "have **the** right to choose / think outside **the** box" },
  { name: "介词搭配", wrong: "make jokes of others / give a hand on our neighbour", right: "make jokes **about** others / lend a hand **to** our neighbours" },
  { name: "近形词混用", wrong: "As a good residence（住宅）", right: "As good **residents**（居民）" },
  { name: "不可数名词", wrong: "works from educations", right: "through **education**" },
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
/**
 * Three headings on three different levels is what "不可以只偏向一个主体"
 * actually asks for. Two headings sharing a level is the failure mode.
 */
export function checkLevelSpread(levels: string[]): ThesisCheck {
  const chosen = levels.filter(Boolean);
  const unique = new Set(chosen);
  if (chosen.length < 3) {
    return {
      rule: "三个标题落在三个不同层次",
      pass: false,
      detail: `还有 ${3 - chosen.length} 个标题没选层次。`,
    };
  }
  if (unique.size < chosen.length) {
    const dupes = chosen.filter((l, i) => chosen.indexOf(l) !== i);
    const names = [...new Set(dupes)].map((d) => levelById(d)?.name ?? d).join("、");
    return {
      rule: "三个标题落在三个不同层次",
      pass: false,
      detail: `${names} 被用了两次 —— 整篇偏向同一个主体，拿不到最高 tier。换一个层次。`,
    };
  }
  const names = chosen.map((l) => levelById(l)?.name ?? l).join(" → ");
  return { rule: "三个标题落在三个不同层次", pass: true, detail: names };
}

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
      // Parallel structure is the single most common way a list-form thesis
      // loses marks, and it cannot be checked reliably by string matching —
      // "accept / helping / works" is three different grammatical forms.
      rule: "三项必须同一语法形式（平行结构）",
      pass: false,
      detail:
        "机器判断不了。三项要么都是动名词（accepting / supporting / strengthening），要么都是名词短语 —— 混用一眼就被看出来。最后一项前面别忘了 and。",
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
