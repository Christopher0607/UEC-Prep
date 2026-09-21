/**
 * 一键载入 —— 让网站开箱可用。
 *
 * 数据存在浏览器 localStorage 里，我没法替你敲进去；但可以把内容写进代码，
 * 你点一下就全进去了。三样东西：
 *   考点表（七科全套）· 背诵卡（10 个卡组）· 预考错题本（逐题批改的结果）
 *
 * 全部幂等：重复点不会产生重复条目（按 科目+标题 / 正面 / 来源+题目 去重）。
 */
import { DECKS } from "./decks";
import { CHINESE_SYLLABUS_SEED } from "./chinese";
import { ENGLISH_SYLLABUS_SEED } from "./english";
import {
  ACCOUNTING_SYLLABUS_SEED,
  ADVMATH_SYLLABUS_SEED,
  BUSINESS_SYLLABUS_SEED,
  ECONOMICS_SYLLABUS_SEED,
  MATH_SYLLABUS_SEED,
} from "./syllabi";
import { newId, update } from "./store";
import type { AppData, Card, Mistake, MistakeCause, SubjectId, Topic } from "./types";

export const SYLLABI: { subjectId: SubjectId; label: string; data: { section: string; title: string }[] }[] = [
  { subjectId: "english", label: "英文", data: ENGLISH_SYLLABUS_SEED },
  { subjectId: "chinese", label: "华文", data: CHINESE_SYLLABUS_SEED },
  { subjectId: "accounting", label: "会计学", data: ACCOUNTING_SYLLABUS_SEED },
  { subjectId: "economics", label: "经济学", data: ECONOMICS_SYLLABUS_SEED },
  { subjectId: "business", label: "商业学", data: BUSINESS_SYLLABUS_SEED },
  { subjectId: "math", label: "数学", data: MATH_SYLLABUS_SEED },
  { subjectId: "advmath", label: "高级数学", data: ADVMATH_SYLLABUS_SEED },
];

export const TOTAL_TOPICS = SYLLABI.reduce((n, s) => n + s.data.length, 0);

/** 预考错题 —— 七科逐题批改后，值得进错题本的那些。 */
export const SEED_MISTAKES: {
  subjectId: SubjectId;
  question: string;
  myWork: string;
  stuckAt: string;
  cause: MistakeCause;
  source: string;
}[] = [
  { subjectId: "advmath", question: "Find the domain of f(x)=√(x+1)/(x−4)", myWork: "选了 A [−1,∞)。卷面上自己写了「x≠4」", stuckAt: "条件写出来了却没用进选项。正解 B：[−1,4)∪(4,∞)", cause: "careless", source: "2026 预考 高数 P1 Q1" },
  { subjectId: "advmath", question: "Simplify (2^(3x+1))(3^(x−1))/4^(x−2)", myWork: "选了 B (3/32)6ˣ，卷面标「不会」", stuckAt: "系数算成了倒数。2^(3x+1)/2^(2x−4)＝2^(x+5)＝32·2ˣ → 正解 A (32/3)6ˣ", cause: "concept", source: "2026 预考 高数 P1 Q3" },
  { subjectId: "advmath", question: "Evaluate Σ(k=3→50)(3k+1)²", myWork: "选了 D 392,960", stuckAt: "拆成 9Σk²+6Σk+Σ1 之后区间没处理对。正解 B 393,960", cause: "method", source: "2026 预考 高数 P1 Q6" },
  { subjectId: "advmath", question: "A(30°N,120°E) 飞到 C(50°S,60°W) 的大圆最短距离", myWork: "选了 A 8,400 n.m.", stuckAt: "只算了一条路。120°E 与 60°W 差 180°，同一大圆：过南极 160°、过北极 200°，取小的 ×60 → B 9,600", cause: "method", source: "2026 预考 高数 P1 Q8" },
  { subjectId: "advmath", question: "半径 9cm、θ=0.8rad 的小扇形被挖掉，求余下部分的周长", myWork: "选了 C 18π−18；卷面算的是面积 ½r²θ=32.4", stuckAt: "答非所问，而且忘了加两条半径。正解 A：9(2π−0.8)+18 ＝ 18π+10.8", cause: "careless", source: "2026 预考 高数 P1 Q9" },
  { subjectId: "advmath", question: "△ABC 内接于半径 10cm 的圆，最大角 120°，求最长边", myWork: "选了 D 20", stuckAt: "算出 2R=20 就停了。a ＝ 2R sin A ＝ 20 sin120° ＝ 10√3 → B", cause: "careless", source: "2026 预考 高数 P1 Q10" },
  { subjectId: "advmath", question: "3x−4y+7=0 是圆心 (2,−3) 的圆的切线，求切点", myWork: "选了 D (7,7)；卷面把圆心到直线的距离算成 5（正确）", stuckAt: "算出半径就停了，没求切点。作垂足 → (−1,1) ＝ B", cause: "careless", source: "2026 预考 高数 P1 Q12" },
  { subjectId: "advmath", question: "已知 d/dx ln(x+√(x²+9))=1/√(x²+9)，求 ∫₀ˣ 1/√(t²+9) dt", myWork: "选了 B ln(x+√(x²+9))", stuckAt: "用了给的结果（对），但漏了下限 −ln(0+√9)＝−ln3。正解 A ln[(x+√(x²+9))/3]", cause: "careless", source: "2026 预考 高数 P1 Q19" },
  { subjectId: "math", question: "求 y=2x²−4x+3 在 (2,3) 处法线的斜率", myWork: "dy/dx=4x−4，代 x=2 得 4，圈了 D", stuckAt: "4 是切线斜率。法线要取负倒数 −1/4 ＝ B", cause: "careless", source: "2026 预考 数学 P1 Q18" },
  { subjectId: "math", question: "∫ (√x+2)/√x dx", myWork: "选了 B x²+4√x+C", stuckAt: "分子分母分开积分（无效）。先化简 1+2x^(−1/2) → x+4√x+C ＝ D", cause: "method", source: "2026 预考 数学 P1 Q19" },
  { subjectId: "math", question: "Show that d/dx[x/(x²+1)]=(−x²+1)/(x²+1)²。Hence find ∫₀¹(2−2x²)/(x²+1)² dx", myWork: "把 (x²+1)² 展开成 x⁴+2x²+1 硬算，答 5/7", stuckAt: "「Hence」＝必须用刚证出的结果。被积函数是那个导数的 2 倍 → 2[x/(x²+1)]₀¹ ＝ 1", cause: "method", source: "2026 预考 数学 P2 Q5" },
  { subjectId: "math", question: "y=x²√(x²−1)，求 dy/dx", myWork: "选了 A (3x³−2x²)/√(x²−1)", stuckAt: "法则用对了，合并同分母时分子写错次方。正解 D (3x³−2x)/√(x²−1)", cause: "careless", source: "2026 预考 数学 P1 Q17" },
  { subjectId: "math", question: "简化 (√(b/√(a⁵)))⁴ × (∛(a²/b))⁶", myWork: "选了 C (ab)^(1/3)", stuckAt: "根号套根号的指数换算错。√(a⁵)=a^(5/2) → b²/a⁵ × a⁴/b² ＝ a⁻¹ ＝ A", cause: "concept", source: "2026 预考 数学 P1 Q3" },
  { subjectId: "math", question: "分组数据补表：110–114、115–119… 求组中点", myWork: "写成 112.5、116.5、122.5…，间距忽大忽小", stuckAt: "组中点＝(下限+上限)/2 且必须等距。110–114 的中点是 112", cause: "concept", source: "2026 预考 数学 P2 Q10(a)" },
  { subjectId: "math", question: "用公式求分组数据的中位数", myWork: "答 144.9", stuckAt: "全部数据只在 110–139 之间，144.9 不可能。L+[(n/2−F)/f]×c ＝ 124.5+(10/19)×5 ＝ 127.132", cause: "method", source: "2026 预考 数学 P2 Q10(c)" },
  { subjectId: "math", question: "40 人中 10 人带饭盒，抽 2 人，恰好一人带饭盒的概率", myWork: "写 10C1/40 ＝ 0.25", stuckAt: "这是「抽一个人带饭盒」的概率。两人里恰好一个 ＝ (10C1×30C1)/40C2 ＝ 5/13", cause: "concept", source: "2026 预考 数学 P2 Q11(b)(i)" },
  { subjectId: "math", question: "至少一人带饭盒的概率", myWork: "答 0.975", stuckAt: "全班只有 1/4 带饭盒，0.975 不合理。1 − 30C2/40C2 ＝ 23/52 ≈ 0.442", cause: "concept", source: "2026 预考 数学 P2 Q11(b)(ii)" },
  { subjectId: "math", question: "△OBC 的面积（C 在 AB 上，BC=2/5 BA）", myWork: "(b) 用 C=(0,−2) 算出 6，(c) 却答 C=(−2,−4)", stuckAt: "同一题两个 C，自相矛盾。图上标的 3 和 2 就是 AC:CB=3:2 → C=(−2,−4)，面积 ＝ 4", cause: "careless", source: "2026 预考 数学 P2 Q9(b)" },
  { subjectId: "math", question: "P 到 B 的距离恒为到 A 的两倍，求轨迹", myWork: "答 3x²+5y²−20x+108", stuckAt: "阿波罗尼斯轨迹一定是圆，x² 与 y² 系数必须相等。正解 3x²+3y²−44x−32y−20＝0", cause: "concept", source: "2026 预考 数学 P2 Q9(d)" },
  { subjectId: "accounting", question: "Which characteristic means free from material error and bias?", myWork: "选了 B Verifiability", stuckAt: "Verifiability 是「不同的人看了得出同样结论」。正解 D Faithful representation", cause: "concept", source: "2026 预考 会计 P1 Q1" },
  { subjectId: "accounting", question: "Fundamental qualitative characteristics per IASB framework?", myWork: "选了 D（四项全选）", stuckAt: "fundamental 只有两个：Relevance ＋ Faithful Representation。其余四个是 enhancing", cause: "concept", source: "2026 预考 会计 P1 Q19" },
  { subjectId: "accounting", question: "Partners receive interest on capital because it is a…", myWork: "选了 D Liability of the partnership", stuckAt: "是利润分配（appropriation），所以放 Appropriation Account 而非 P/L。正解 C", cause: "concept", source: "2026 预考 会计 P1 Q7" },
  { subjectId: "accounting", question: "Which receipt is a capital receipt?", myWork: "选了 B Donation for general expenses", stuckAt: "终身会员费一次收管一辈子 → 资本收入。正解 C Life membership fee", cause: "concept", source: "2026 预考 会计 P1 Q9" },
  { subjectId: "accounting", question: "What does a high gearing ratio indicate?", myWork: "选了 C No reliance on debt financing", stuckAt: "正好说反。高 gearing ＝ 更依赖债务 ＝ 固定利息负担重 ＝ 风险高。正解 B", cause: "concept", source: "2026 预考 会计 P1 Q17" },
  { subjectId: "accounting", question: "Bonus issue vs Rights issue，哪几行正确？", myWork: "四行全打了勾，却圈了排除第 III 行的 C", stuckAt: "自己的判断和选项不一致。III（总权益：红利股无影响／附加股增加）成立 → 应选 A", cause: "careless", source: "2026 预考 会计 P1 Q15" },
  { subjectId: "accounting", question: "间接法中流动负债增加代表什么？", myWork: "选了 A「增加税前利润与现金流」", stuckAt: "流动负债增加不会增加税前利润。正解 D：减少了税前利润但没动现金，所以加回", cause: "concept", source: "2026 预考 会计 P1 Q20" },
  { subjectId: "business", question: "CFR 贸易术语下，哪一项叙述是错的？", myWork: "选了 B", stuckAt: "CFR 不含保险，CIF 才含。选项 D「出口商必须购买保险」才是错的那一项", cause: "concept", source: "2026 预考 商业 卷一 Q5" },
  { subjectId: "business", question: "遇到不诚实商家、金额较小，应向哪个政府机构正式投诉？", myWork: "选了 B 消费人协会", stuckAt: "消费人协会是 NGO 不是政府机构，也不受理索偿。≤RM50,000 走消费者索偿仲裁庭（D）", cause: "concept", source: "2026 预考 商业 卷一 Q11" },
  { subjectId: "business", question: "LLP 相对普通合伙的优势有哪些？", myWork: "选了 A（含「合伙人上限 20 人」）", stuckAt: "上限 20 人是普通合伙的限制，LLP 没有上限。优势＝独立法人+有限责任+永续经营", cause: "concept", source: "2026 预考 商业 卷一 Q7" },
  { subjectId: "business", question: "售价 8、变动成本 5、固定成本 15,000，要赚 3,000 净利的产量？", myWork: "15000÷(8−5)＝5000，选 B", stuckAt: "用了损益平衡点公式，漏了目标利润。(15,000+3,000)÷3 ＝ 6,000", cause: "method", source: "2026 预考 商业 卷一 Q30" },
  { subjectId: "business", question: "求速动比率", myWork: "520,000÷200,000＝2.6，选 C", stuckAt: "那是流动比率。速动要先减存货：(520,000−180,000)÷200,000 ＝ 1.70", cause: "method", source: "2026 预考 商业 卷一 Q32" },
  { subjectId: "business", question: "Sinar 面对的一种外部风险与一种内部风险，并说明对营运成本与利润的影响", myWork: "只写了「财务」「经济不行、通货膨胀」", stuckAt: "2%+2% 的题要写因果链，不能停在名词上。而且「原料采购不足」是采购／营运风险，不是财务风险", cause: "method", source: "2026 预考 商业 卷二 Q4(c)" },
  { subjectId: "economics", question: "慈悯援助金（STR）本身是否直接计入 GDP？", myWork: "写了「Yes, Expenses」", stuckAt: "转移性支付不计入 GDP —— 政府没换到任何当期生产的商品或服务。政府支出 G 也不含补助金", cause: "concept", source: "2026 预考 经济 卷二 Q6(a)" },
  { subjectId: "economics", question: "绘图说明最低薪金制对劳动市场的变化（5%）", myWork: "卷面标「不会」，空白", stuckAt: "Wmin 画在均衡 We 之上（价格下限），Ls>Ld，Ls−Ld ＝ 劳动过剩 ＝ 失业，要在图上标出来", cause: "concept", source: "2026 预考 经济 卷二 Q5(a)" },
  { subjectId: "chinese", question: "下列加点词的汉语拼音，哪一项完全正确？", myWork: "选了 A", stuckAt: "广袤无垠的「垠」读 yín 不是 hén。正解 B（蹊跷 qī／伛偻 yǔ／断壁残垣 yuán 三个全对）", cause: "concept", source: "2026 预考 华文 卷二 基础 Q1" },
  { subjectId: "chinese", question: "「劣马拉车虽慢，但努力不懈，走十天也可以到达」填成语", myWork: "写了「契而不舍」", stuckAt: "①成语选错，应是「驽马十驾」②就算写锲而不舍，正字是「锲」不是「契」", cause: "concept", source: "2026 预考 华文 卷二 基础 Q4" },
  { subjectId: "chinese", question: "汉赋、唐诗、宋词、元曲的叙述，不正确的一项", myWork: "选了 D", stuckAt: "元曲三要素是「唱、科、白」，不是「吟」。正解 C", cause: "concept", source: "2026 预考 华文 卷二 常识 Q1" },
  { subjectId: "chinese", question: "盛唐两大诗派填空", myWork: "(b) 写了「婉约」", stuckAt: "婉约是宋词流派，朝代都不对。王维、孟浩然 ＝ 山水田园诗派", cause: "concept", source: "2026 预考 华文 卷二 常识 Q3" },
  { subjectId: "chinese", question: "默写《声声慢》中的诗句", myWork: "空白", stuckAt: "满地黄花堆积，憔悴损，如今有谁堪摘？（此篇属「统考未考过」的优先九首）", cause: "concept", source: "2026 预考 华文 卷二 常识 Q5" },
  { subjectId: "chinese", question: "「漫天的鸟如撕碎纸片的自由」运用了什么修辞？试分析其表达效果（3%）", myWork: "只写了「比喻」两个字", stuckAt: "3 分的题要四段：手法＋本体喻体＋写出什么特点＋表达什么情感。只写手法最多 1 分", cause: "method", source: "2026 预考 华文 卷二 现代文 文2-4" },
  { subjectId: "chinese", question: "作文「我重新发现了这所学校的温度」", myWork: "提纲写成「一直讨厌 → 后来喜欢」", stuckAt: "「重新」两个字没落实。要三段式：曾经感受过 → 中间失去麻木 → 如今再次找到。而且全篇没有一个实物细节", cause: "concept", source: "2026 预考 华文 卷一 作文" },
  { subjectId: "english", question: "Word Forms：42. civilisation（括号给 civilise）", myWork: "写了 civilisation，答案要 civilisations", stuckAt: "没先判词性与单复数就直接改词尾。三步法：遮住括号 → 判词性 → 才想变形", cause: "method", source: "2026 预考 英文 P2 Q42" },
  { subjectId: "english", question: "Word Forms 整体（10 题只对 2 题）", myWork: "Vocabulary 8/10，Word Forms 2/10", stuckAt: "认得出（辨认）但产不出（生成）。这条裂缝在高数、会计也出现过", cause: "concept", source: "2026 预考 英文 P2 Section B" },
];

function nowISO() {
  return new Date().toISOString();
}

/** 载入一科的考点。已存在的（同科目同标题）跳过，掌握度不会被覆盖。 */
export function seedTopics(subjectId: SubjectId): number {
  const entry = SYLLABI.find((s) => s.subjectId === subjectId);
  if (!entry) return 0;
  let added = 0;
  update((d) => {
    const have = new Set(
      d.topics.filter((t) => t.subjectId === subjectId).map((t) => t.title),
    );
    const fresh: Topic[] = entry.data
      .filter((t) => !have.has(t.title))
      .map((t) => ({
        id: newId(),
        subjectId,
        section: t.section,
        title: t.title,
        mastery: 0,
        frequency: 0,
        updatedAt: nowISO(),
      }));
    added = fresh.length;
    return { ...d, topics: [...d.topics, ...fresh] };
  });
  return added;
}

/** 载入一个卡组。按「正面」去重，已背过的进度不受影响。 */
export function seedDeck(deckId: string): number {
  const deck = DECKS.find((x) => x.id === deckId);
  if (!deck) return 0;
  let added = 0;
  update((d) => {
    const have = new Set(d.cards.map((c) => c.front));
    const now = nowISO();
    const fresh: Card[] = deck.cards
      .filter(([front]) => !have.has(front))
      .map(([front, back]) => ({
        id: newId(),
        subjectId: deck.subjectId,
        front,
        back,
        box: 0,
        dueAt: now,
        lapses: 0,
        createdAt: now,
      }));
    added = fresh.length;
    return { ...d, cards: [...d.cards, ...fresh] };
  });
  return added;
}

/** 载入预考错题。按「来源 + 题目」去重。 */
export function seedMistakes(): number {
  let added = 0;
  update((d) => {
    const have = new Set(d.mistakes.map((m) => `${m.source ?? ""}|${m.question}`));
    const now = nowISO();
    const fresh: Mistake[] = SEED_MISTAKES.filter(
      (m) => !have.has(`${m.source}|${m.question}`),
    ).map((m) => ({
      id: newId(),
      subjectId: m.subjectId,
      topicId: null,
      question: m.question,
      myWork: m.myWork,
      stuckAt: m.stuckAt,
      cause: m.cause,
      source: m.source,
      resolved: false,
      reviewCount: 0,
      createdAt: now,
    }));
    added = fresh.length;
    return { ...d, mistakes: [...d.mistakes, ...fresh] };
  });
  return added;
}

/** 一键把三样全部载入。返回各自新增的条数。 */
export function seedEverything(): { topics: number; cards: number; mistakes: number } {
  const topics = SYLLABI.reduce((n, s) => n + seedTopics(s.subjectId), 0);
  const cards = DECKS.reduce((n, deck) => n + seedDeck(deck.id), 0);
  const mistakes = seedMistakes();
  return { topics, cards, mistakes };
}

/** 数据是不是还空着 —— 决定首页要不要显示「一键载入」。 */
export function isEmpty(d: AppData): boolean {
  return d.topics.length === 0 && d.cards.length === 0 && d.mistakes.length === 0;
}
