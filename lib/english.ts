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
  { name: "单复数", wrong: "individual must be / Across ancient civilisation", right: "individual**s** / ancient civilisation**s**（预考 Q42 丢分）" },
  { name: "主谓一致", wrong: "A large number of students has chosen", right: "…**have** chosen（预考 Q34 丢分）" },
  { name: "可数 / 不可数", wrong: "fewer evidence / works from educations", right: "**less** evidence / through **education**（预考 Q33 丢分）" },
  { name: "词性判断", wrong: "a everyday occured / we knowing carry on", right: "a everyday **occurrence**（名词）/ **knowingly**（副词）（预考 Q49、Q50 丢分）" },
  { name: "名词后缀选错", wrong: "symbolisation / twenties century", right: "**symbolism** / **twentieth** century（预考 Q47、Q48 丢分）" },
  { name: "冠词漏写", wrong: "have right to choose / think out of box", right: "have **the** right / think outside **the** box" },
  { name: "介词搭配", wrong: "make jokes of others / influx on immigrants", right: "jokes **about** others / influx **of** immigrants（预考 Q39 丢分）" },
  { name: "近形词混用", wrong: "residence（住宅）/ eminent（杰出的）", right: "resident**s**（居民）/ **imminent**（迫近的）（预考 Q35 丢分）" },
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
/** "five" mode: every level needs a plan, or the essay is capped below top tier. */
export function checkFiveLevels(notes: Record<string, string>): ThesisCheck {
  const missing = ANALYSIS_LEVELS.filter((l) => !notes[l.id]?.trim());
  return {
    rule: "五个层次全部要带到",
    pass: missing.length === 0,
    detail: missing.length
      ? `还差 ${missing.map((l) => l.name).join("、")} —— 少一层就上不了最高 tier。`
      : "五层齐全。",
  };
}

/**
 * "perHeading" mode: three headings on three different levels is what
 * "不可以只偏向一个主体" asks for. Two headings sharing a level is the failure.
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

/**
 * 全科分值，照 2026 预考卷面（坤成中学 SY03）。两张卷各占 50%。
 * 作文一项就占 35% —— 是全科最大的一块，比 Paper 2 任何一部分大三倍。
 */
export const PAPER_WEIGHTS: { paper: string; part: string; weight: number; note: string }[] = [
  { paper: "Paper 1", part: "Section A · Summary Writing", weight: 15, note: "150 字以内，考抓重点 + 换句话说" },
  { paper: "Paper 1", part: "Section B · Essay Writing", weight: 35, note: "不少于 350 字，五选一。全科最大的一块" },
  { paper: "Paper 2", part: "Section A Part I · Matching Paragraph", weight: 10, note: "四段文章配十题，内容相近容易错" },
  { paper: "Paper 2", part: "Section A Part II · Vocabulary", weight: 10, note: "词义辨析，考的是词汇量" },
  { paper: "Paper 2", part: "Section A Part III · Comprehension", weight: 10, note: "推论、语气、写作意图，比字面理解难" },
  { paper: "Paper 2", part: "Section B Part I · Error Identification", weight: 10, note: "四处画线挑一处错。纯语法规则" },
  { paper: "Paper 2", part: "Section B Part II · Word Forms", weight: 10, note: "给词根填正确词形。规则有限，最该拿满" },
];

/**
 * Paper 2 的五个部分。注意：Section A Part II 是 Vocabulary（词义），
 * 不是第二篇阅读理解 —— 整张卷只有一篇 comprehension。
 */
export const PAPER2_SECTIONS = [
  {
    id: "matching",
    name: "Part I · Matching Paragraph（10%）",
    detail: "四段文章，十题定位。难在几段内容很像，容易对错。",
    difficulty: "难",
  },
  {
    id: "vocabulary",
    name: "Part II · Vocabulary（10%）",
    detail: "词义辨析：coined / palatability / onerous 这类。纯粹考词汇量，靠积累。",
    difficulty: "中",
  },
  {
    id: "comprehension",
    name: "Part III · Comprehension（10%）",
    detail: "推论、作者态度、写作意图。选项之间非常接近，是阅读里最难的一块。",
    difficulty: "难",
  },
  {
    id: "identify-error",
    name: "Section B Part I · Error Identification（10%）",
    detail: "四处画线挑一处错。考的是有限的几条语法规则，可以刷到很高。",
    difficulty: "中",
  },
  {
    id: "word-form",
    name: "Section B Part II · Word Forms（10%）",
    detail: "给词根填正确词形。规则最有限、最该拿满的一部分。",
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

/**
 * Word Forms 是全科规则最有限、最该拿满的一块，而预考只拿了 2/10。
 * 失分的直接原因不是时间——这一部分是第三个做的，状态还好——而是没有
 * 「先判词性」这一步：看到括号里的词就开始猜变形，结果第 49、50 题
 * 连词性都不对。
 */
export const WORD_FORM_METHOD = [
  {
    step: "1. 遮住括号里的词",
    detail: "先不要看词根。看了就会开始猜变形，跳过判断词性这一步。",
  },
  {
    step: "2. 只看空格前后，判断这里要什么词性",
    detail:
      "前面是 a / an / the / 形容词 → 名词；修饰动词或整句 → 副词；在 be 动词后、名词前 → 形容词；主语后没有动词 → 动词。",
  },
  {
    step: "3. 词性定了，才想那个词根变成这个词性长什么样",
    detail: "顺带检查单复数、时态、以及要不要加前缀（un- / in- / re-）。",
  },
];

/** 后缀速查。词性定了之后，从这里选形状。 */
export const SUFFIX_TABLE: { pos: string; suffixes: string; examples: string }[] = [
  {
    pos: "名词 · 抽象概念",
    suffixes: "-tion / -sion / -ment / -ness / -ity / -ance / -ence / -ism",
    examples: "civilisation、achievement、happiness、ability、importance、symbol**ism**",
  },
  {
    pos: "名词 · 人",
    suffixes: "-er / -or / -ian / -ist / -ant",
    examples: "teacher、director、histor**ian**、scientist、assistant",
  },
  {
    pos: "名词 · 事件／实例",
    suffixes: "-ence / -ance / -al",
    examples: "occur → occurr**ence**、arrive → arrival、appear → appearance",
  },
  {
    pos: "动词",
    suffixes: "-ise / -ize / -ify / -en / -ate",
    examples: "modernise、simplify、strengthen、activate",
  },
  {
    pos: "形容词",
    suffixes: "-able / -ible / -al / -ful / -less / -ous / -ive / -ic / -ent / -ant",
    examples: "reliable、national、careful、endless、dangerous、effective",
  },
  { pos: "副词", suffixes: "-ly", examples: "silent → silent**ly**、know → know**ingly**" },
  {
    pos: "序数词",
    suffixes: "-th / -st / -nd / -rd",
    examples: "twenty → twent**ieth**（不是 twenties）、five → fifth",
  },
];

/** 预考里真丢分的十个空，是最值得反复回看的一组。 */
export const WORD_FORM_MISSES: { n: number; root: string; wrote: string; right: string; why: string }[] = [
  { n: 42, root: "civilise", wrote: "civilisation", right: "civilisations", why: "「across ancient …」要复数" },
  { n: 43, root: "history", wrote: "historicst", right: "historians", why: "指人，用 -ian" },
  { n: 44, root: "light", wrote: "unlighten", right: "lit", why: "不规则动词的过去分词" },
  { n: 45, root: "corporate", wrote: "corporations", right: "incorporating", why: "要加前缀 in- 再变分词" },
  { n: 47, root: "symbol", wrote: "symbolisation", right: "symbolism", why: "指「象征意义」用 -ism，不是动作名词" },
  { n: 48, root: "twenty", wrote: "twenties", right: "twentieth", why: "「the early ___ century」要序数词" },
  { n: 49, root: "occur", wrote: "occured", right: "occurrence", why: "空格前是形容词 → 要名词；且双写 r" },
  { n: 50, root: "know", wrote: "knowing", right: "knowingly", why: "修饰动词 carry → 要副词" },
];

