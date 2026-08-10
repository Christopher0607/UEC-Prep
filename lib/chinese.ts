/**
 * 华文应用文 — reverse-engineered from the student's own teacher-issued SPM
 * samples and slides, then carried over to UEC (their teacher's instruction).
 *
 * The finding that drives this whole file: across every sample, paragraphs 3, 4
 * and 5 are essentially fixed formulas. Only the opening (缘由) and paragraph 2
 * (详情) actually change per question. So 应用文 is a memorised skeleton with
 * two slots — which makes it the single most reliable source of marks on
 * Paper 1, and worth drilling to automatic before anything else.
 */

export type GenreId = "gonghan" | "tonggao" | "qishi";

export interface Genre {
  id: GenreId;
  name: string;
  /** Who it is addressed to — this is what changes the 版头 layout. */
  audience: string;
  /** Header block differences, the thing students lose format marks on. */
  header: string[];
  titlePatterns: string[];
  /** 要素 checklist, straight from the teacher's slides. */
  elements: string[];
  paragraphs: { n: string; role: string; fixed: boolean; note: string }[];
}

export const GENRES: Genre[] = [
  {
    id: "gonghan",
    name: "公函",
    audience: "写给某个具体的人／机构（对外）",
    header: [
      "发信机构名称",
      "发信地址（两行）",
      "一条横线",
      "收信人职衔（如「国光中学校长」）",
      "收信人姓名 + 先生／女士",
      "收信地址（两行）＋ 同一行右侧写日期",
      "称谓：「陈先生：」（姓 + 先生 + 全角冒号）",
      "标题（事由，不加标点）",
    ],
    titlePatterns: ["请【动宾】", "【偏正】事宜", "商借【地点】", "投诉【对象】"],
    elements: ["宗旨／原因", "日期、时间、地点", "活动名称", "目的", "详情", "赞语", "复函／呼吁", "致谢"],
    paragraphs: [
      { n: "1", role: "缘由 + 目的", fixed: false, note: "「为了……，本校拟于〔日期〕〔时间〕，在〔地点〕举办〔活动〕。故特此函……」——日期时间地点活动缺一个扣一个。" },
      { n: "2", role: "详情", fixed: false, note: "题目独有的信息全放这里：名额、截止日期、导师、联络方式、要求。这一段是唯一真正要动脑的地方。" },
      { n: "3", role: "联络", fixed: true, note: "如有疑问，请联络本人（012-3456789）。" },
      { n: "4", role: "赞语 + 预设结果", fixed: true, note: "「素仰／素闻／欣闻／听闻 + 对方优点，如蒙应允／如能妥善处理此事，必能 + 好处。」" },
      { n: "5", role: "结尾祈使 + 致谢", fixed: true, note: "「敬祈早赐佳音／敬祈早日赐复／敬祈早日采取行动。先此致谢。」" },
    ],
  },
  {
    id: "tonggao",
    name: "通告",
    audience: "写给自己单位内部的一群人（对内）",
    header: [
      "发文单位名称",
      "地址（两行）",
      "一条横线",
      "日期（右侧，没有收信人栏）",
      "「致：全体师生／全体队员／全体学员」",
      "标题（事由 + 「通告」二字）",
    ],
    titlePatterns: ["请【动宾】", "【偏正】通告"],
    elements: ["原因（看情况）", "宗旨", "日期、时间、地点", "活动名称", "目的", "详情", "呼吁／致歉", "致谢"],
    paragraphs: [
      { n: "1", role: "缘由 + 目的", fixed: false, note: "「为了……，本院定于〔日期〕〔时间〕，假／在〔地点〕举办〔活动〕。特此通告，请……」" },
      { n: "2", role: "详情", fixed: false, note: "名额、时长、报名方式、截止日期。若是取消／致歉类，这里写变故原因与善后安排。" },
      { n: "3", role: "联络", fixed: true, note: "如有疑问，请联络本人（012-3456789）。" },
      { n: "4", role: "呼吁／致歉 + 致谢", fixed: true, note: "呼吁类：「请尽早报名，以免向隅。先此致谢。」致歉类：「……实属不得已，尚祈见谅。先此致谢。」" },
    ],
  },
  {
    id: "qishi",
    name: "启事",
    audience: "写给不特定的社会大众（对外公开）",
    header: [
      "发文单位名称",
      "地址（两行）",
      "一条横线",
      "日期（右侧）",
      "没有收信人栏，也没有「致：」——这是启事和通告最容易混的地方",
      "标题（事由 + 「启事」二字）",
    ],
    titlePatterns: ["请【动宾】", "【偏正】启事"],
    elements: ["宗旨／原因（看情况）", "日期、时间、地点", "活动名称", "目的", "详情（占比最重）", "呼吁／致歉", "致谢"],
    paragraphs: [
      { n: "1", role: "缘由 + 目的", fixed: false, note: "「为了……／因……，本部于即日起〔做什么〕。特此启事，……」" },
      { n: "2–3", role: "详情", fixed: false, note: "老师的要素表里详情占 4 分，是三种文体中最重的。资格条件、申请方式、后续流程要分开写清楚。" },
      { n: "4", role: "联络", fixed: true, note: "如有疑问，请联络本人（012-3456789）。" },
      { n: "5", role: "呼吁 + 致谢", fixed: true, note: "「请有意者前来应聘。先此致谢。」" },
    ],
  },
];

export function genreById(id: GenreId): Genre {
  const g = GENRES.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown genre: ${id}`);
  return g;
}

/** 固定套语库 — the phrases worth memorising verbatim, grouped by slot. */
export const PHRASE_BANK: { slot: string; note: string; items: string[] }[] = [
  {
    slot: "自称 / 称对方",
    note: "全篇要一致。写错人称是白丢的格式分。",
    items: ["自称：本人、本会、本校、本院、本部、本队", "称对方：您、贵校、贵会、贵局、贵公司、贵团"],
  },
  {
    slot: "开头客套（第4段用）",
    note: "四选一，看对象是个人还是机构。",
    items: ["素闻", "素仰", "欣闻", "听闻"],
  },
  {
    slot: "赞语（第4段用）",
    note: "对方是谁就夸对应的点。背四五句就够轮着用。",
    items: [
      "欣闻您学识渊博，是文坛／学术界的翘楚",
      "素闻贵会热心公益",
      "听闻您向来关心学生，注重学生福利",
      "素仰贵会热心教育，大力栽培莘莘学子",
      "素仰贵局关心居民健康情况",
      "素闻贵校作育英才",
    ],
  },
  {
    slot: "预设结果（第4段用）",
    note: "邀请类和投诉类用的不一样，别混。",
    items: ["邀请／请派员：如蒙应允、若能应允", "投诉类：如能妥善处理此事"],
  },
  {
    slot: "好处（第4段收尾）",
    note: "接在「必能……」后面。",
    items: ["获益匪浅", "增色不少", "顺利进行", "蓬荜生辉", "让学生获益", "让居民获益"],
  },
  {
    slot: "结尾祈使（最后一段）",
    note: "选对类型，然后一律接「先此致谢。」",
    items: [
      "邀请／请派员：敬祈早赐佳音、敬祈早日赐复",
      "投诉：敬祈早日采取行动",
      "通告呼吁：请尽早报名，以免向隅",
      "通告致歉：……实属不得已，尚祈见谅",
      "启事招聘：请有意者前来应聘",
    ],
  },
  {
    slot: "完全固定的一句",
    note: "每一篇都有，一字不改。",
    items: ["如有疑问，请联络本人（012-3456789）。"],
  },
];

/** Format traps seen in the samples — each one is a mark someone actually lost. */
export const FORMAT_TRAPS: { trap: string; fix: string }[] = [
  {
    trap: "署名的身份和题目给的身份不一致",
    fix: "题目说「以修齐中学校长名义」，署名就必须是修齐中学校长。老师给的范文里就有一份署名写成了「修齐学院中文系主任」——那是范文自己的笔误，别照抄。写之前先把题目里的身份圈出来。",
  },
  {
    trap: "通告写成启事、启事写成通告",
    fix: "通告有「致：全体……」，启事没有。通告对内，启事对外公开。看清楚题目要求的是哪一种。",
  },
  {
    trap: "第 1 段漏掉日期／时间／地点／活动名称",
    fix: "这四样是要素表里独立算分的。写完第 1 段回头数一遍，四样齐不齐。",
  },
  {
    trap: "段落不编号，或从第 1 段就开始编号",
    fix: "第 1 段不编号，从第 2 段起写「2.」「3.」「4.」「5.」，编号后空一格（Tab）。",
  },
  {
    trap: "标题加了标点",
    fix: "标题末尾不加句号。带活动名称时用双引号，如：请派代表参加“写作训练营”。",
  },
  {
    trap: "公函漏写收信人职衔",
    fix: "收信人栏是「职衔 / 姓名先生 / 地址」三部分。只写姓名会扣格式分。",
  },
];

/**
 * 试卷二 structure, as described by the student. Splitting it out matters
 * because these are five unrelated skills — 文言文翻译 and 文化常识 share no
 * revision method at all.
 */
export const PAPER2_PARTS: { name: string; detail: string; method: string }[] = [
  {
    name: "文学知识",
    detail: "作家、作品、体裁、文学史",
    method: "纯记忆，做成背诵卡，用碎片时间刷。是最不该丢分的部分。",
  },
  {
    name: "语文常识",
    detail: "字词、成语、语法、修辞",
    method: "错一个记一个。成语和错别字靠积累，没有捷径，但量有限。",
  },
  {
    name: "文化常识",
    detail: "节日、礼俗、称谓、典故",
    method: "同样纯记忆。和文学知识一起做卡，一次背两块。",
  },
  {
    name: "现代文理解 ×2",
    detail: "两篇阅读理解，问答题",
    method: "练「答案从原文找」的习惯。答题先定位段落，再组织语言，不要凭印象答。",
  },
  {
    name: "课内文言文",
    detail: "解说、回答问题、翻译",
    method: "范围有限，是整张卷子里最该拿满的。逐篇翻译过一遍，实词虚词做成卡。",
  },
  {
    name: "课外文言文",
    detail: "解说、回答问题、翻译",
    method: "考的是课内积累的迁移。课内实词虚词背熟了，课外自然读得懂——所以先做课内。",
  },
];

/** 华文 coverage-table seed, so the syllabus page starts with something real. */
export const CHINESE_SYLLABUS_SEED: { section: string; title: string }[] = [
  { section: "试卷一 · 作文", title: "审题与立意" },
  { section: "试卷一 · 作文", title: "结构：开头、过渡、结尾" },
  { section: "试卷一 · 作文", title: "素材库（人物／事例／名言）" },
  { section: "试卷一 · 作文", title: "描写与细节" },
  { section: "试卷一 · 作文", title: "字数与时间控制" },
  ...GENRES.flatMap((g) => [
    { section: `试卷一 · 应用文 · ${g.name}`, title: `${g.name}版头格式` },
    { section: `试卷一 · 应用文 · ${g.name}`, title: `${g.name}标题写法` },
    { section: `试卷一 · 应用文 · ${g.name}`, title: `${g.name}段落功能与编号` },
    { section: `试卷一 · 应用文 · ${g.name}`, title: `${g.name}固定套语` },
  ]),
  ...PAPER2_PARTS.map((p) => ({ section: "试卷二", title: p.name })),
];
