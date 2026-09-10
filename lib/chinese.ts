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

/**
 * 应用文的逐项给分表，照 2025 年高三上学年统考的《评阅标准参考》原文录入。
 *
 * 这份东西改变了应用文该怎么练：内容 5% 不是整体印象分，是九到十个格子，
 * 每格 0.5%–2%。写满格子就拿满分，漏一格就少 0.5%。所以练的方式不是
 * 「多写几篇」，是「背下格子清单，考场上逐格打勾」。
 */
export interface MarkSlot {
  slot: string;
  marks: string;
  sample: string;
}

export interface ApplicationRubric {
  genre: string;
  question: string;
  breakdown: string;
  slots: MarkSlot[];
  notes: string[];
}

export const APPLICATION_RUBRICS: ApplicationRubric[] = [
  {
    genre: "道歉启事",
    question:
      "《大事记日报》因误植照片而影响他人声誉。试以该报社总编辑林见贤名义，拟一则道歉启事。",
    breakdown: "内容 5%　格式 2%　语言 2%　技术 1%",
    slots: [
      { slot: "发信单位", marks: "—", sample: "《大事记日报》报社" },
      { slot: "标题", marks: "—", sample: "道歉启事" },
      {
        slot: "事件描述（道歉原因）",
        marks: "1%",
        sample:
          "本报于 6 月 10 日报道（0.5%）吉隆坡市陈姓医生遭控医疗失误案新闻（0.5%），由于一时疏忽而刊登了永康诊所及该诊所医生的照片，有损该诊所声誉（0.5%），特此道歉。",
      },
      { slot: "报道日期", marks: "0.5%", sample: "6 月 10 日" },
      { slot: "发启事目的", marks: "0.5%", sample: "特此向受害者道歉" },
      {
        slot: "详情 ×3（每个 0.5%）",
        marks: "1.5%",
        sample:
          "从这五个里挑三个写：澄清事件／名字与身份（务必写全名）／采取措施（下架照片、作出赔偿、犯错者被革职）／造成影响／表达歉疚",
      },
      { slot: "联络人", marks: "0.5%", sample: "若有任何疑问，请致电本人林见贤，联络电话 03-12345678" },
      { slot: "保证", marks: "0.5%", sample: "本报承诺日后处理新闻将更加谨慎，保证不再犯上同样错误" },
      { slot: "致歉", marks: "0.5%", sample: "谨此致歉" },
    ],
    notes: [
      "名字务必写全名 —— 评分参考特别标了这一句。",
      "详情只需三个，写第四第五个不加分；但少写一个就是 −0.5%。",
    ],
  },
  {
    genre: "通告",
    question:
      "仁爱中学校史馆即将开放参观，校方制定规则供学生遵守。试以该馆主任林见贤名义，拟一则校史馆参观规则通告。",
    breakdown: "内容 5%　格式 2%　语言 2%　技术 1%",
    slots: [
      { slot: "发通告单位", marks: "—", sample: "仁爱中学校史馆" },
      { slot: "对象", marks: "—", sample: "致：全体学生" },
      { slot: "标题", marks: "—", sample: "校史馆参观规则通告" },
      {
        slot: "宗旨 ×2",
        marks: "1%",
        sample: "为加强校史馆管理、保障馆内文物安全，维持校史馆的秩序与安宁，特定以下规则",
      },
      { slot: "日期／时间／地点", marks: "0.5%", sample: "即日起生效" },
      { slot: "写通告目的", marks: "0.5%", sample: "特此敬请全体学生垂注" },
      {
        slot: "详情 ×4（每个 0.5%）",
        marks: "2%",
        sample:
          "从这六个里挑四个：①开放时段／闭馆时间　②凭学生证入馆，限本人使用，不得转借　③珍贵文物仅限阅览室参阅，概不外借　④禁带食物饮料／书包入馆　⑤不遵守者可拒绝入馆，查证属实按情节扣分记过（必写）　⑥联系人",
      },
      { slot: "呼吁", marks: "0.5%", sample: "请同学们共同遵守规则" },
      { slot: "致谢", marks: "0.5%", sample: "先此致谢。" },
    ],
    notes: [
      "第 ⑤ 条「违规后果」评分参考标了「必写」—— 四个详情里这一个是固定的，只需再挑三个。",
      "内容详情若写成要点式（分行列点）扣 0.5% 语言分 —— 必须写成句子。",
    ],
  },
];

/** 格式与技术分是机器一样的扣法，考场上照着自查就能捡回来。 */
export const MECHANICAL_RULES: { area: string; rule: string }[] = [
  { area: "应用文格式 2%", rule: "按董总应用文要求。空错格、空错行、序号错 —— 每一项都扣分。" },
  { area: "应用文语言 2%", rule: "内容详情写成要点式（分行列点）扣 0.5%。必须是完整句子。" },
  { area: "作文技术 2%", rule: "每 2 个错别字 = 1 个错误点。" },
  { area: "作文技术 2%", rule: "每 4 个标点错误 = 1 个错误点。" },
  { area: "作文技术 2%", rule: "没写题号／题目 = 1 个错误点。" },
  { area: "作文技术 2%", rule: "半命题或材料作文没按要求拟题 = 1 个错误点。" },
];

/**
 * 作文评分的天花板规则 —— 这一条比任何写作技巧都重要：
 * 内容评 E 等，语言和结构最高只能评 C 等。跑题的作文，文笔再好也封顶。
 */
export const ESSAY_CEILING =
  "附则：内容评 E 等 → 语言、结构最高只能评 C 等；内容评 1.5% → 直接归入 E 等。校内评分内容总分最高 24%。换句话说：切题是天花板，不是及格线。审题多花三分钟，比多写两百字值钱得多。";

/** 2025 预试的五道作文题与官方的切题／偏题／离题界线。审题练习用真题最准。 */
export const ESSAY_PROMPTS: {
  title: string;
  genre: string;
  key: string;
  onTopic: string;
  drift: string;
  off: string;
}[] = [
  {
    title: "十字路口",
    genre: "抒情／记叙／夹叙夹议",
    key: "心理描写，人生抉择",
    onTopic:
      "把「十字路口」当意象，串起几个人生阶段的抉择片段（文理分科、专业选择、是否转学），重点写抉择时的心理斗争与最终决定。",
    drift: "提到了十字路口，但大篇幅写实际交通场景，缺乏引申意义，或主题模糊。",
    off: "完全脱离象征意义 —— 写巴刹口、商店门口这类其他地点。",
  },
  {
    title: "这次换我来守护",
    genre: "叙事抒情",
    key: "情感转变，具体行动",
    onTopic:
      "突出「从被守护到主动守护」的心理变化，并用动作、语言、神态的细节写出守护的实际行为。",
    drift: "写了守护，但没体现「换我」的转变与主动性，或内容松散。",
    off: "写成自己被守护、或只写自我成长而没有守护他人。",
  },
  {
    title: "＿＿也是一种智慧（宽容／等待／低头）",
    genre: "议论／夹叙夹议",
    key: "概念重新定义 · 哲理思考",
    onTopic:
      "把所选的词重新定义：宽容不是懦弱而是力量；等待不是消极而是蓄势；低头不是认输而是以退为进。必须论证它「为什么是智慧」。",
    drift: "选了词，但论证薄弱，只写行为本身而不阐释其智慧性。",
    off: "没选给定的三个词，或完全没体现「智慧」。",
  },
  {
    title: "科技越强，人类真的越弱吗？",
    genre: "议论",
    key: "辩证分析，论据充分",
    onTopic:
      "不要简单选「认同／不认同」—— 评分参考明写这种二元对立不佳。要提出自己更精细的观点：科技重新定义了「强」／关键在使用者而非科技／人文精神才是不可替代的强。",
    drift: "观点模糊，只罗列现象没有分析，没深入探讨「强弱」的辩证关系。",
    off: "完全没回应题目问题，或脱离「科技与人类」的关系。",
  },
  {
    title: "材料作文（马拉松选手林默的承诺）",
    genre: "议论／夹叙夹议",
    key: "精准概括 · 引述材料 · 联系实际",
    onTopic:
      "四个可选角度：承诺责任（一诺千金）／信念力量（精神超越肉体极限）／亲情之爱（爱是最强驱动力）／生命意义（为他人而战）。自拟题目要扣住所选角度。",
    drift: "与材料有关但主题不突出，过度发挥或忽略关键情节。",
    off: "完全脱离材料，自拟题目与材料无关，或没有引用材料。",
  },
];

/**
 * 2026 预试的课内文言文范围 —— 老师原件的红／灰标注：红为重要、灰为次要。
 * 【年份】= 该篇在统考已经考过的年份。老师给的备考顺序是「统考未考过的先」。
 */
export const WENYAN_SCOPE: {
  book: string;
  pieces: { name: string; author: string; weight: "重要" | "次要"; examined?: string }[];
}[] = [
  {
    book: "高一上册",
    pieces: [
      { name: "先妣事略", author: "归有光", weight: "重要" },
      { name: "五柳先生传", author: "陶渊明", weight: "重要" },
    ],
  },
  {
    book: "高二上册",
    pieces: [
      { name: "孔子论「仁」", author: "《论语》", weight: "次要" },
      { name: "鱼我所欲也", author: "《孟子》", weight: "重要" },
      { name: "与妻诀别书", author: "林觉民", weight: "重要" },
      { name: "答司马谏议书", author: "王安石", weight: "重要" },
    ],
  },
  {
    book: "高二下册",
    pieces: [
      { name: "庖丁解牛", author: "庄子", weight: "重要" },
      { name: "公输", author: "墨子", weight: "重要" },
      { name: "察今", author: "《吕氏春秋》", weight: "重要", examined: "2014" },
      { name: "干将莫邪", author: "干宝", weight: "重要" },
      { name: "《世说新语》选", author: "刘义庆", weight: "重要" },
      { name: "口技", author: "蒲松龄", weight: "重要" },
    ],
  },
  {
    book: "高三上册",
    pieces: [
      { name: "前赤壁赋", author: "苏轼", weight: "次要" },
      { name: "与陈伯之书", author: "丘迟", weight: "重要" },
    ],
  },
  {
    book: "高三下册",
    pieces: [
      { name: "过秦论", author: "贾谊", weight: "重要", examined: "2012" },
      { name: "师说", author: "韩愈", weight: "重要", examined: "2013" },
    ],
  },
];

/**
 * 诗词背诵范围。标了年份的是统考已考过的 —— 老师的备考顺序是未考过的优先，
 * 所以没有年份的那几首反而该先背。
 */
export const POETRY_SCOPE: {
  book: string;
  poems: { name: string; examined?: string }[];
}[] = [
  {
    book: "高一上册",
    poems: [
      { name: "夜雨寄北" },
      { name: "从军行" },
      { name: "示儿" },
      { name: "草" },
      { name: "山居秋暝" },
      { name: "登高", examined: "2025、2017" },
      { name: "黄鹤楼", examined: "2024" },
      { name: "和子由渑池怀旧" },
    ],
  },
  {
    book: "高一下册",
    poems: [
      { name: "陌上桑 第 1 段", examined: "2023" },
      { name: "行行重行行", examined: "2022" },
    ],
  },
  {
    book: "高二上册",
    poems: [
      { name: "归园田居", examined: "2020" },
      { name: "饮酒", examined: "2012" },
      { name: "短歌行（山不厌高，海不厌深。周公吐哺，天下归心）", examined: "2021" },
    ],
  },
  {
    book: "高二下册",
    poems: [{ name: "关雎", examined: "2015" }, { name: "硕鼠" }],
  },
  {
    book: "高三上册",
    poems: [
      { name: "琵琶行 第 2 段", examined: "2014" },
      { name: "将进酒", examined: "2019" },
      { name: "正气歌 第 1、2 段", examined: "2013、2018" },
    ],
  },
  {
    book: "高三下册",
    poems: [
      { name: "相见欢" },
      { name: "声声慢" },
      { name: "念奴娇", examined: "2016" },
    ],
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
