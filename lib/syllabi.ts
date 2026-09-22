import type { SubjectId } from "./types";

/**
 * 会计学与经济学的课本目录 + 试卷结构，照学生上传的课本目录页录入。
 * 章节名一律照课本原文，不改写、不合并 —— 覆盖表要跟课本对得上，
 * 复习时才能一页一页对着划掉。
 */

/** 会计学：Book 1（第 1–12 章） */
const ACC_BOOK1: [string, string[]][] = [
  ["1 Introduction to the types of organisation", [
    "1.1 Types of organisation",
    "1.2 Types and nature of profit organisation / business entity",
    "1.3 The nature of not-for-profit organisation",
  ]],
  ["2 Development and roles of bookkeeping and accounting", [
    "2.1 Purposes and scopes of financial reporting",
    "2.2 Users of financial reports",
  ]],
  ["3 Business cycles and documentations", ["3.1 Types of business documentations"]],
  ["4 Types and uses of journals, ledger and cash book", [
    "4.1 The accounting cycle in financial reporting",
    "4.2 The types and roles of books of entry",
  ]],
  ["5 Double entry bookkeeping", [
    "5.1 Fundamentals of double entry bookkeeping / double entry concept",
    "5.2 Rules of double entry in the ledgers",
    "5.3 Uses of books of prime entry and ledgers",
    "5.4 Purpose of trial balance",
    "5.5 Preparing the trial balance",
    "5.6 The limitations of trial balance",
  ]],
  ["6 Cash Book", [
    "6.1 Maintaining Cash and Bank Account",
    "6.2 Development and format of Cash Book",
    "6.3 Writing up a Cash Book",
    "6.4 Writing up Journals, Ledgers and Cash Book",
  ]],
  ["7 Petty Cash Book", ["7.1 Maintaining Petty Cash", "7.2 Writing up a Petty Cash Book"]],
  ["8 Irrecoverable debts and allowance for receivables", [
    "8.1 Irrecoverable debts",
    "8.2 Irrecoverable debts recovered",
    "8.3 Allowance for receivables",
  ]],
  ["9 Control accounts", [
    "9.1 What is control account?",
    "9.2 The purposes of control accounts",
    "9.3 Preparation of receivables control account",
    "9.4 Preparation of payables control account",
    "9.5 Reconciliation of balances in subsidiary ledgers and control accounts",
    "9.6 Disclosure of receivables and payables control accounts",
  ]],
  ["10 Tangible non-current assets and Depreciation", [
    "10.1 Tangible non-current assets",
    "10.2 Capital expenditure and revenue expenditure",
    "10.3 Introduction to depreciation",
    "10.4 Methods of depreciation",
    "10.5 Partial year depreciation",
    "10.6 Accounting for depreciation",
    "10.7 Accounting for disposal of non-current assets",
  ]],
  ["11 Accruals and prepayments", [
    "11.1 Purpose of accruals and prepayments adjustments",
    "11.2 Accrued expenses (Accruals)",
    "11.3 Prepaid expenses",
    "11.4 Accrued income",
    "11.5 Prepaid / Unearned income",
  ]],
  ["12 Fundamental accounting principles and concepts", [
    "12.1 Importance of accounting principles and concepts",
    "12.2 Fundamental accounting principles and concepts",
    "12.3 Business entity concept",
    "12.4 Accounting period / Time interval / Periodic concept",
    "12.5 Money measurement Concept",
    "12.6 Going concern / Continuity of activity concept",
    "12.7 Objectivity concept",
    "12.8 Historical cost concept",
    "12.9 Materiality concept",
    "12.10 Substance over form concept",
    "12.11 Consistency concept",
    "12.12 Prudence / Conservatism concept",
    "12.13 Accruals / matching concept",
  ]],
];

/** 会计学：Book 2（第 13–22 章） */
const ACC_BOOK2: [string, string[]][] = [
  ["13 Correction of errors", [
    "13.1 Types of errors in double entry bookkeeping",
    "13.2 Correction of errors that NOT affecting the trial balance agreement",
    "13.3 Correction of errors that affecting the trial balance agreement",
    "13.4 The impact of errors on financial statements and preparation of corrected financial statements",
  ]],
  ["14 Bank reconciliation statement", [
    "14.1 Understanding of cash book and bank statement",
    "14.2 Causes of difference between balances in cash book and bank statement",
    "14.3 Preparing the bank reconciliation statement",
  ]],
  ["15 Incomplete records", [
    "15.1 Causes of incomplete records",
    "15.2 Methods of retrieving financial information from incomplete records",
    "15.3 Estimation of loss of stock / inventory",
    "15.4 Preparation of financial statements with incomplete records and end-of-period adjustments",
  ]],
  ["16 Preparation of financial statements for sole proprietorship", [
    "16.1 The accounting cycle in financial reporting",
    "16.2 From source documents to financial statements",
    "16.3 Preparing financial statements without inventory and end of period adjustments",
    "16.4 Preparing financial statements with inventory but without end of period adjustments",
    "16.5 Preparing financial statements with inventory and end of period adjustments",
  ]],
  ["17 Preparation of financial statements for partnership", [
    "17.1 Formation of new partnership",
    "17.2 Partnership agreement / deed",
    "17.3 Preparing financial statements without changes in the partnership",
  ]],
  ["18 Preparation of financial statements for partnership - Changes in partnership", [
    "18.1 Accounting for changes in the partnership",
  ]],
  ["19 Preparation of financial statements for not-for-profit organisation", [
    "19.1 The nature of non-profit organisation",
    "19.2 The operation and accounting of club / society",
    "19.3 Financial reporting of club / society",
  ]],
  ["20 Inventories", [
    "20.1 Types and costs of inventories / stocks",
    "20.2 Inventory system",
    "20.3 Methods of inventory valuation",
    "20.4 Impact of inventory valuation methods on gross profit",
    "20.5 Measurement and disclosure of inventory",
  ]],
  ["21 Regulatory framework", [
    "21.1 The needs of regulatory framework",
    "21.2 The roles of IFRS Foundation and the IASB",
    "21.3 The roles of International Financial Reporting Standards (IFRS)",
  ]],
  ["22 Financial reporting principles", [
    "22.1 The needs of conceptual framework",
    "22.2 The conceptual framework for financial reporting",
    "22.3 The qualitative characteristics of useful financial information",
  ]],
];

/**
 * 会计学：Book 3（第 23–30 章）。27 和 28 必有一个出在最后一题。
 *
 * Book 1／2 的小节号照课本目录录入；**Book 3 的小节是按 2026 预考试卷二逐题
 * 反推 ＋ 统考范围常规结构写的**，拿到课本目录后照目录重录。
 * 不写小节就只剩 8 个章级考点 —— 而试卷二的三大题全在这一册，
 * 那样等于整本最值钱的书没有覆盖表。
 */
const ACC_BOOK3: [string, string[]][] = [
  ["23 Financial statements for limited company – Introduction", [
    "23.1 有限公司的性质：法人地位、有限责任、与独资／合伙的差别",
    "23.2 Private limited (Sdn Bhd) 与 public limited (Bhd) 的分别",
    "23.3 有限公司的组成文件与法定账簿",
    "23.4 股本相关用词：authorised / issued / called-up / paid-up capital",
  ]],
  ["24 Financial statements for limited company – Shares, loan notes, dividend and reserves", [
    "24.1 普通股与优先股：表决权、股息次序、参与与否",
    "24.2 Loan notes / debentures 是负债不是股本 —— 利息进损益，不是分配",
    "24.3 发行股份的分录（按面值、溢价 share premium）",
    "24.4 红利股 bonus issue：来源、分录、对股东权益总额与流动性的影响",
    "24.5 配股 rights issue 与 bonus issue 的分别",
    "24.6 已宣布股息 interim / final dividend 的分录与呈报位置",
    "24.7 Revenue reserve 与 capital reserve 的界线（retained earnings vs share premium / revaluation）",
  ]],
  ["25 Financial statements for limited company – IFRS 18", [
    "25.1 IFRS 18 的五个类别：operating / investing / financing / income tax / discontinued",
    "25.2 Statement of profit or loss and other comprehensive income 的排列",
    "25.3 Statement of financial position 的排列与流动／非流动划分",
    "25.4 Statement of changes in equity 的行与列",
    "25.5 期末调整并入公司财报：折旧、应计、预付、呆账",
    "25.6 公司税 taxation 的估计数与上期差额处理",
  ]],
  ["26 Financial statements for limited company – IAS 7 Statement of cash flows", [
    "26.1 三大类现金流：operating / investing / financing 的归类判断",
    "26.2 间接法：由税前利润倒推营业现金流的调整顺序",
    "26.3 非现金项目加回：折旧、摊销、处置损益",
    "26.4 营运资本变动的方向（存货／应收增加＝流出）",
    "26.5 利息、股息、税款付出的列示位置",
    "26.6 非流动资产购置与处置金额的还原（用 T 账户倒推）",
    "26.7 期末现金及现金等价物的对账",
  ]],
  ["27 Analysis of accounting ratios ⭐", [
    "27.1 获利能力：gross / profit margin、ROCE、mark-up 与 margin 的换算",
    "27.2 流动性：current ratio、quick (acid test) ratio",
    "27.3 营运效率：inventory turnover、receivables / payables days、asset turnover",
    "27.4 资本结构：gearing 的算法与高低的方向含义",
    "27.5 投资比率：EPS、dividend per share、dividend cover、P/E",
    "27.6 比率的解读：写因果链，不能只写「比较好」",
    "27.7 比率分析的局限（历史成本、单一年度、行业差异）",
  ]],
  ["28 Budgeting ⭐", [
    "28.1 预算的目的与预算期间",
    "28.2 销售预算与生产预算（含期初期末存货的推算）",
    "28.3 原料采购预算：用量 vs 采购量",
    "28.4 人工与生产费用预算",
    "28.5 现金预算 cash budget：收现／付现的时间差是考点",
    "28.6 预算式财务报表 budgeted statements",
    "28.7 差异的解释与预算控制",
  ]],
  ["29 Introduction to cost analysis", [
    "29.1 成本分类：direct / indirect、product / period",
    "29.2 固定、变动与半变动成本（high-low method 分离）",
    "29.3 制造成本表：prime cost、production cost、cost of goods manufactured",
    "29.4 制造业的三种存货（原料、在制品、制成品）",
    "29.5 吸收成本法与变动成本法的利润差",
  ]],
  ["30 Cost – Volume – Profit analysis", [
    "30.1 边际贡献 contribution 与 contribution margin ratio",
    "30.2 损益平衡点：单位法与金额法",
    "30.3 目标利润所需销量",
    "30.4 安全边际 margin of safety",
    "30.5 损益平衡图的画法与读图",
    "30.6 CVP 的假设与局限",
  ]],
];

function flatten(book: string, chapters: [string, string[]][]) {
  return chapters.flatMap(([chapter, sections]) =>
    sections.length
      ? sections.map((s) => ({ section: `${book} · ${chapter}`, title: s }))
      : [{ section: book, title: chapter }],
  );
}

export const ACCOUNTING_SYLLABUS_SEED = [
  ...flatten("Book 1", ACC_BOOK1),
  ...flatten("Book 2", ACC_BOOK2),
  ...flatten("Book 3", ACC_BOOK3),
];

/**
 * 《试题分类集》的上册章号跟课本对不上：从第 6 章起整个错位。课本是最新版，
 * 所以覆盖表以课本为准，但每章并排标出分类集的章号 —— 拿分类集刷题时不用
 * 再回头换算，也不会刷错单元。键 = 课本章号，值 = 分类集章号。
 */
const CLASSIFIER_CHAPTER: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5,
  6: 11, // 生产要素市场 —— 分类集把它挪到了最后
  7: 6, 8: 7, 9: 8, 10: 9, 11: 10,
};

/** 经济学上册。章节名与编号照课本原文。 */
const ECON_VOL1: [string, string[]][] = [
  ["第1章 绪论", [
    "1.1 经济学成立的历史背景",
    "1.2 经济学的定义",
    "1.3 经济问题的发生",
    "1.4 基本的经济问题与解决方法",
    "1.5 生产可能曲线",
    "1.6 物品的分类",
    "1.7 经济制度",
  ]],
  ["第2章 需求与供给", [
    "2.1 需求",
    "2.2 需求量变动与需求变动",
    "2.3 需求量变动与需求变动的主要因素",
    "2.4 供给",
    "2.5 供给量变动与供给变动",
    "2.6 供给变动的主要因素",
    "2.7 市场均衡机能",
    "2.8 供需变动与价格的影响",
  ]],
  ["第3章 弹性理论", [
    "3.1 弹性的定义",
    "3.2 需求的价格弹性",
    "3.3 需求的所得弹性",
    "3.4 需求的交叉弹性",
    "3.5 供给的价格弹性",
  ]],
  ["第4章 市场效率与政府干预", [
    "4.1 消费者剩余",
    "4.2 生产者剩余",
    "4.3 总剩余",
    "4.4 政府对市场的干预",
  ]],
  ["第5章 消费行为的研究", [
    "5.1 欲望与消费的基本概念",
    "5.2 效用的意义",
    "5.3 边际效用递减法则",
    "5.4 水与钻石之价值矛盾",
    "5.5 消费者均衡",
  ]],
  ["第6章 生产要素市场", [
    "6.1 生产的一般概念",
    "6.2 劳动与工资",
    "6.3 资本与利息",
    "6.4 土地与地租",
    "6.5 企业与利润",
  ]],
  ["第7章 生产与成本", ["7.1 生产、成本与利润", "7.2 生产理论", "7.3 成本分析"]],
  ["第8章 完全竞争市场", [
    "8.1 市场结构",
    "8.2 完全竞争市场的特征",
    "8.3 厂商收益的基本概念",
    "8.4 完全竞争市场价格的决定",
    "8.5 最适产量的决定",
    "8.6 完全竞争厂商的短期均衡",
    "8.7 厂商在短期面临亏损后的决策",
    "8.8 短期供给曲线及市场供给曲线",
    "8.9 完全竞争厂商的长期均衡",
  ]],
  ["第9章 垄断市场", [
    "9.1 垄断市场的特征",
    "9.2 垄断厂商的收益",
    "9.3 垄断厂商的收益与需求弹性的关系",
    "9.4 垄断厂商的短期均衡",
    "9.5 垄断厂商的长期均衡",
    "9.6 垄断市场与社会福利",
  ]],
  ["第10章 不完全竞争市场", [
    "10.1 垄断性竞争市场的特征",
    "10.2 垄断性竞争市场的短期均衡",
    "10.3 垄断性竞争厂商在面临亏损后的决策",
    "10.4 垄断性竞争厂商的长期均衡",
    "10.5 寡占市场的特征",
    "10.6 各种市场的比较",
  ]],
  ["第11章 市场失灵", [
    "11.1 市场失灵的定义和原因",
    "11.2 外部效果的类型与对策",
    "11.3 公共财",
    "11.4 讯息不对称",
  ]],
];

/**
 * 经济学下册（宏观），照课本目录录到小节。
 *
 * 下册的章号跟《试题分类集》是一致的（不像上册那样错位），只有三个章名
 * 措辞略有出入：第3章课本作「经济发展与循环」、分类集作「经济循环与发展」；
 * 第4章课本作「失业与通货膨胀」、分类集多了「物价」；第7章课本作
 * 「财政政策」、分类集作「政府的收支及财政政策」。按章号找不会出错。
 */
const ECON_VOL2: [string, string[]][] = [
  ["第1章 国家生产总值", [
    "1.1 国家产出的基本概念",
    "1.2 GDP 的计算法",
    "1.3 国家产出统计的局限性",
  ]],
  ["第2章 国民所得水准的决定", [
    "2.1 国民所得的循环流转",
    "2.2 消费、储蓄与投资",
    "2.3 均衡所得水准",
  ]],
  ["第3章 经济发展与循环", ["3.1 经济成长", "3.2 经济发展", "3.3 经济循环"]],
  ["第4章 失业与通货膨胀", [
    "4.1 失业的定义",
    "4.2 失业的种类与对策",
    "4.3 失业的影响",
    "4.4 自然失业率与充分就业",
    "4.5 一般物价水平的测量方法",
    "4.6 通货膨胀",
    "4.7 通货紧缩",
  ]],
  ["第5章 货币与存款货币的创造", [
    "5.1 货币的演进",
    "5.2 货币的基本功能",
    "5.3 货币的特征",
    "5.4 货币的供给",
    "5.5 存款货币的创造",
    "5.6 货币数量学说",
  ]],
  ["第6章 中央银行与货币政策", [
    "6.1 中央银行的职能",
    "6.2 货币政策的工具",
    "6.3 均衡利率的决定",
    "6.4 货币政策与利率",
  ]],
  ["第7章 财政政策", [
    "7.1 政府的收入",
    "7.2 政府的支出",
    "7.3 财政预算案",
    "7.4 财政政策",
    "7.5 财政政策实施的困难",
  ]],
  ["第8章 国际贸易", ["8.1 国际贸易理论", "8.2 自由贸易与保护贸易", "8.3 经济全球化"]],
  ["第9章 汇率", [
    "9.1 外汇、汇率与外汇存底",
    "9.2 外汇的需求与供给",
    "9.3 汇率制度的种类",
    "9.4 汇率的变动",
    "9.5 汇率变动的影响",
  ]],
  ["第10章 国际收支", [
    "10.1 国际收支平衡表",
    "10.2 国际收支差额的涵义",
    "10.3 国际收支失衡",
  ]],
];

/** 「第7章 生产与成本」→「第7章 生产与成本（分类集 第6章）」 */
function withClassifier(chapter: string): string {
  const n = Number(chapter.match(/^第(\d+)章/)?.[1]);
  const alt = CLASSIFIER_CHAPTER[n];
  return alt && alt !== n ? `${chapter}（分类集 第${alt}章）` : chapter;
}

export const ECONOMICS_SYLLABUS_SEED = [
  ...ECON_VOL1.flatMap(([chapter, sections]) =>
    sections.map((s) => ({ section: `上册 · ${withClassifier(chapter)}`, title: s })),
  ),
  ...ECON_VOL2.flatMap(([chapter, sections]) =>
    // 下册章号与分类集一致，不需要并排标注。
    sections.map((s) => ({ section: `下册 · ${chapter}`, title: s })),
  ),
];

/** 上下册等分 35 分，但上册的小节多 48%，所以下册每个考点更值钱。 */
export const ECON_VOL1_SECTIONS = ECON_VOL1.reduce((n, [, s]) => n + s.length, 0);
export const ECON_VOL2_SECTIONS = ECON_VOL2.reduce((n, [, s]) => n + s.length, 0);

/**
 * 商业学：三册 21 章，章节编号照老师给的总复习 PPT（每章「本章必背重点 →
 * 核心考点 → 常考题型 → 易错点」那一套）。复习 PPT 把相邻小节合并讲的地方
 * （5.3–5.5、7.1–7.3 之类），这里照它的合并方式录入 —— 覆盖表要跟复习时
 * 真正翻的那一页对得上，拆得比 PPT 细反而没法一页一页划掉。
 */
const BIZ_BOOK1: [string, string[]][] = [
  ["第1章 商业学学习与专题研习", [
    "1.1 联想与系统思考",
    "1.2 专题研习的功能与流程",
    "1.3 常用思考工具：5W1H、黄金圈法则、思维导图",
  ]],
  ["第2章 商业与永续性", [
    "2.1 商业的概念：定义、物物交换五缺点、货物vs服务、贸易vs辅助贸易",
    "2.2 商业交易的五个步骤",
    "2.3 商业的重要性：个人／国家／世界",
    "2.4 评估商业环境的七项因素",
    "2.5 商业循环四阶段与商家的经营目标",
    "2.6 商业的发展趋势与永续性",
  ]],
  ["第3章 国内贸易", [
    "3.1 分销途径与中间商：批发商 vs 代理商、选择途径的四项因素",
    "3.2 零售商的类型：有店铺与无店铺",
    "3.3 连锁经营：直营连锁 vs 特许加盟连锁",
    "3.4 贸易文件：重要性、使用顺序、折扣与凭单四组易混",
    "3.5 付款方式：支票、卡式付款与电子付款",
  ]],
  ["第4章 国际贸易", [
    "4.1–4.2 三大类型与国际贸易的好处",
    "4.3 国际贸易的七项特征",
    "4.4 国际商业术语 FOB / CFR / CIF ⭐",
    "4.5 国际贸易的五大文件",
    "4.6 付款方式：汇款 / 托收 / 信用证",
    "4.7 自由贸易政策 vs 保护贸易政策",
  ]],
  ["第5章 企业组织", [
    "5.1 组织的概念与三类组织架构",
    "5.3–5.5 五大企业组织（一）：拥有人・资金・法人地位・债务责任",
    "5.3–5.5 五大企业组织（二）：税务・内部管理・盈利享有・财务资料",
    "5.5 私人有限公司 vs 公共有限公司：成立与优缺点",
    "5.6–5.7 商团组织与公共机构",
    "5.7–5.9 私营化、社会企业与其他组织",
  ]],
  ["第6章 个人理财", [
    "6.1 个人理财的六大基本原则",
    "6.1 个人理财规划的五个步骤",
    "6.3–6.4 消费信贷：租购 vs 赊购 vs 租用",
    "6.5 风险与个人保险：概念与类型",
    "6.5 保险的四大原则（含两条赔偿规则）",
    "6.6 金钱的时间值：单利、复利、现值、未来值",
    "6.7 投资、风险与回酬",
  ]],
  ["第7章 精明消费", [
    "7.1–7.2 精明消费的定义与消费者八大权利",
    "7.3 消费者的责任：对自己 vs 对社会",
    "7.4 消费者的支援单位：非政府组织・法令・政府部门 ⭐",
    "7.5 商家对消费者的六项责任",
  ]],
];

const BIZ_BOOK2: [string, string[]][] = [
  ["第1章 营运管理", [
    "1.1–1.3 生产 vs 营运与生产流程（投入→转换→产出→控制）",
    "1.4 五种制程选择",
    "1.5 品质管理",
  ]],
  ["第2章 供应链管理", [
    "2.1–2.2 供应链的结构与四大流：商流・物流・资金流・信息流",
    "2.3–2.4 管理项目与工具：及时制库存、外包、ERP",
  ]],
  ["第3章 行销管理 I", [
    "3.1–3.2 行销管理的重要性与消费者购买行为",
    "3.3 STP：市场区隔 → 目标市场选择 → 市场定位",
    "3.4 行销组合 4P：产品・定价・通路・推广",
    "3.5 产品生命周期四阶段与行销策略",
  ]],
  ["第4章 行销管理 II（服务行销）", [
    "4.1–4.2 服务的定义与四大特性",
    "4.3–4.4 服务行销 7P 与顾客关系管理 CRM",
  ]],
  ["第5章 人力资源管理 I", [
    "5.1–5.3 工作分析、工作说明书与工作规范",
    "5.4–5.6 培训、绩效评估与薪金制度",
    "5.7–5.9 职业安全与健康、劳资关系与员工体验",
  ]],
  ["第6章 人力资源管理 II（激励）", [
    "6.1–6.2 马斯洛需要层次与双因素理论",
    "6.3 外在／内在激励、员工敬业度与工作伦理",
  ]],
  ["第7章 财务管理 I", [
    "7.1–7.3 财务管理的重要性与预算",
    "7.4 资金来源（一）：内部资金来源与短期融资",
    "7.4 股票与融资工具：优先股 vs 普通股、银行透支 vs 银行贷款",
    "7.4 其他四种融资方式",
    "7.5 企业各阶段的融资策略：创立→成长→成熟→衰退",
    "7.4 / 7.6 政府财务援助计划与银行审核借贷能力",
  ]],
  ["第8章 财务管理 II", [
    "8.1–8.2 损益平衡分析（计算必考）⭐",
    "8.3 三大财务报表与其对不同对象的重要性",
    "8.4 三大类财务比率与判读（计算必考）⭐",
  ]],
];

const BIZ_BOOK3: [string, string[]][] = [
  ["第1章 创业与企业家精神", [
    "1.1–1.2 商机、创业与创业点子",
    "1.3 四种创业方式的优点与挑战",
    "1.4–1.5 红海／蓝海市场、商业计划书与第二曲线",
    "1.6 企业家精神五要素与对社会的贡献",
  ]],
  ["第2章 商业模式", [
    "2.1 商业模式的四大基本框架",
    "2.2 四种常考的互联网商业模式",
  ]],
  ["第3章 领导与管理", [
    "3.1 领导 vs 管理：领导者与管理者的主要责任",
    "3.2–3.3 领导品质「智信仁勇严」与五项核心领导力",
    "3.4–3.5 交易型 vs 变革型领导、目标管理四步骤",
  ]],
  ["第4章 企业治理与责任", [
    "4.1 六大利益相关者与企业的基本责任",
    "4.2 企业责任的四大方面",
    "4.3 企业治理结构与三项重要性",
  ]],
  ["第5章 企业风险管理", [
    "5.1–5.2 内部风险（七类）与外部风险（四类）",
    "5.3 四种风险管理方法（超高频）⭐",
    "5.3 风险管理过程六步骤",
    "5.4 保险合约与企业投保类型",
  ]],
  ["第6章 政府预算与税务", [
    "6.1 国家财政预算案：角色、资金来源与分配",
    "6.1 预算案的类型：盈余预算 vs 赤字预算",
    "6.2–6.3 直接税 vs 间接税",
    "6.2 所得税：公司税、个人所得税与估税方式",
    "6.3 间接税：关税、国内税与 SST",
  ]],
];

export const BUSINESS_SYLLABUS_SEED = [
  ...flatten("第一册", BIZ_BOOK1),
  ...flatten("第二册", BIZ_BOOK2),
  ...flatten("第三册", BIZ_BOOK3),
];

/**
 * 数学与高级数学的考点表。
 *
 * 这两科没有拿到课本目录，所以考点是**从 2026 预考两张卷子逐题反推**的 ——
 * 涵盖实际考过的每一个考点，外加同一章里必然相邻的几个。
 * 拿到课本目录后应该照目录重录一次，但在那之前，这份表比空白有用得多。
 */
const MATH_TOPICS: { section: string; title: string }[] = [
  { section: "数学 · 代数", title: "二次方程：根与系数的关系（和 −b/a、积 c/a）" },
  { section: "数学 · 代数", title: "代数分式的化简与四则" },
  { section: "数学 · 代数", title: "指数与根式：分数指数换算" },
  { section: "数学 · 代数", title: "函数与复合函数 fg(x)" },
  { section: "数学 · 代数", title: "解三元一次方程组" },
  { section: "数学 · 代数", title: "不等式与线性规划：阴影区域的不等式组" },
  { section: "数学 · 代数", title: "对数：换底公式与化简" },
  { section: "数学 · 数列与矩阵", title: "等差数列：通项与指定项" },
  { section: "数学 · 数列与矩阵", title: "矩阵：行向量乘矩阵" },
  { section: "数学 · 数列与矩阵", title: "2×2 矩阵求逆与解方程组 AX=B" },
  { section: "数学 · 三角与几何", title: "三角比与象限判断" },
  { section: "数学 · 三角与几何", title: "三角恒等式化简（含 tanθ 已知求值）" },
  { section: "数学 · 三角与几何", title: "扇形：弧长与面积" },
  { section: "数学 · 三角与几何", title: "立体几何：直线与底面的夹角" },
  { section: "数学 · 三角与几何", title: "解三角形：正弦定理与余弦定理" },
  { section: "数学 · 三角与几何", title: "仰角与俯角的应用" },
  { section: "数学 · 坐标几何", title: "两点距离与中点" },
  { section: "数学 · 坐标几何", title: "内分点与外分点坐标" },
  { section: "数学 · 坐标几何", title: "直线方程、平行与垂直" },
  { section: "数学 · 坐标几何", title: "三角形面积（行列式法）" },
  { section: "数学 · 坐标几何", title: "动点轨迹方程（阿波罗尼斯圆：两平方项系数必相等）" },
  { section: "数学 · 统计与概率", title: "原始数据：平均数、中位数、众数" },
  { section: "数学 · 统计与概率", title: "四分位差" },
  { section: "数学 · 统计与概率", title: "分组数据：组中点必须等距" },
  { section: "数学 · 统计与概率", title: "分组数据：平均数与标准差" },
  { section: "数学 · 统计与概率", title: "分组数据：中位数 L+[(n/2−F)/f]×c" },
  { section: "数学 · 统计与概率", title: "价格指数与综合指数" },
  { section: "数学 · 统计与概率", title: "单步概率与独立事件" },
  { section: "数学 · 统计与概率", title: "两次抽取：恰好一个／至少一个" },
  { section: "数学 · 微积分", title: "微分：乘积法则与链式法则" },
  { section: "数学 · 微积分", title: "切线斜率与法线斜率（取负倒数）" },
  { section: "数学 · 微积分", title: "驻点与极值判断" },
  { section: "数学 · 微积分", title: "积分：先化简再逐项积分" },
  { section: "数学 · 微积分", title: "定积分：上下限与区间相加性" },
  { section: "数学 · 微积分", title: "「Show that … Hence …」必须回头用结果" },
];

const ADVMATH_TOPICS: { section: string; title: string }[] = [
  { section: "高数 · 代数与函数", title: "函数的定义域与值域（条件要用进答案）" },
  { section: "高数 · 代数与函数", title: "反函数与复合函数" },
  { section: "高数 · 代数与函数", title: "指数化简：根号套根号先换分数指数" },
  { section: "高数 · 代数与函数", title: "对数方程（多层 log 由外向内剥）" },
  { section: "高数 · 代数与函数", title: "二次方程：根与系数、(α−β)²＝(α+β)²−4αβ" },
  { section: "高数 · 代数与函数", title: "含根号的方程（须验根）" },
  { section: "高数 · 代数与函数", title: "有理不等式与数轴标根「奇穿偶不穿」" },
  { section: "高数 · 代数与函数", title: "多项式：余数定理与因式定理、多项式除法" },
  { section: "高数 · 代数与函数", title: "部分分式分解" },
  { section: "高数 · 数列与级数", title: "等差与等比数列" },
  { section: "高数 · 数列与级数", title: "Σ 求和公式：Σk、Σk²、Σk³" },
  { section: "高数 · 数列与级数", title: "指定区间求和（k=3→50 要先减前两项）" },
  { section: "高数 · 数列与级数", title: "二项式定理与指定项系数" },
  { section: "高数 · 数列与级数", title: "年金与偿债基金（sinking fund）" },
  { section: "高数 · 矩阵与行列式", title: "2×2、3×3 矩阵求逆" },
  { section: "高数 · 矩阵与行列式", title: "行列式的性质（行的线性组合与换行变号）" },
  { section: "高数 · 矩阵与行列式", title: "用矩阵解三元方程组" },
  { section: "高数 · 三角", title: "三角恒等式证明" },
  { section: "高数 · 三角", title: "R 公式 a cosθ ± b sinθ ＝ R cos(θ±α)" },
  { section: "高数 · 三角", title: "三角方程解的个数（指定区间）" },
  { section: "高数 · 三角", title: "正弦定理与外接圆 a/sinA＝2R" },
  { section: "高数 · 三角", title: "扇形：弧长、面积、周长（余下部分要加两条半径）" },
  { section: "高数 · 三角", title: "球面几何：大圆航行（南北两条路都要算）" },
  { section: "高数 · 坐标几何", title: "垂直平分线" },
  { section: "高数 · 坐标几何", title: "圆的方程与切线、切点坐标" },
  { section: "高数 · 坐标几何", title: "点到圆的最短与最长距离" },
  { section: "高数 · 坐标几何", title: "轨迹：到定点与到定直线之比" },
  { section: "高数 · 立体几何", title: "长方体：线与面、面与面的夹角" },
  { section: "高数 · 统计与概率", title: "排列组合：重复字母的排列、圆排列" },
  { section: "高数 · 统计与概率", title: "概率与期望值（反求概率）" },
  { section: "高数 · 统计与概率", title: "正态分布：由概率反求 μ 与 σ" },
  { section: "高数 · 统计与概率", title: "价格指数与综合指数" },
  { section: "高数 · 统计与概率", title: "变异系数" },
  { section: "高数 · 微积分", title: "极限：0/0 型有理化、sin/tan 的极限" },
  { section: "高数 · 微积分", title: "微分：乘积、商、链式法则" },
  { section: "高数 · 微积分", title: "隐函数微分" },
  { section: "高数 · 微积分", title: "相关变化率（related rates）" },
  { section: "高数 · 微积分", title: "驻点与极值、拐点" },
  { section: "高数 · 微积分", title: "切线与法线方程" },
  { section: "高数 · 微积分", title: "积分：换元与部分分式" },
  { section: "高数 · 微积分", title: "定积分与两曲线围成的面积" },
];

export const MATH_SYLLABUS_SEED = MATH_TOPICS;
export const ADVMATH_SYLLABUS_SEED = ADVMATH_TOPICS;

export interface PaperPart {
  name: string;
  marks?: string;
  detail: string;
}

export interface PaperStructure {
  subjectId: SubjectId;
  papers: { name: string; parts: PaperPart[] }[];
  /** 从卷面结构直接推出来的复习结论 —— 这才是录入结构的意义。 */
  takeaways: string[];
}

export const PAPER_STRUCTURES: PaperStructure[] = [
  {
    subjectId: "accounting",
    papers: [
      {
        name: "Paper 1（30 分钟）",
        parts: [{ name: "Multiple-choice", marks: "20%", detail: "20 题，全答" }],
      },
      {
        name: "Paper 2（180 分钟）· 7 题全答",
        parts: [
          { name: "Q1–Q4 小题", marks: "各 5%", detail: "会计原则／合伙商誉与资本比较法／统制账与 EPS／权益变动表" },
          { name: "Q5", marks: "20%", detail: "合伙：分配账 ＋ 清盘（实现账、资本账、银行账）" },
          { name: "Q6", marks: "20%", detail: "(a) 改错分录 10%　(b) 移动加权平均存货卡 10%" },
          { name: "Q7", marks: "20%", detail: "现金流量表（IAS 7 间接法）" },
        ],
      },
    ],
    takeaways: [
      "试卷二的后三题（Q5／Q6／Q7）合计 60 分 —— 是整份卷子的 75%、整科的 48%。前四题加起来才 20 分。练题的时间该按这个比例分。",
      "2026 预考试卷一：计算题 7/7 全对，理论与术语题只有 5/13。八道错题里七道卡在英文会计术语，没有一道是算错的 —— 这一科的瓶颈是词，不是账。",
      "「最后一题必定是 Ch27 比率分析或 Ch28 预算」这条判断，2026 预考没有兑现：最后一题是现金流量表（Ch26），比率只出了 2 分，预算与成本分析（Ch28–30）整份没考。要向老师重新确认统考的实际情况，别照旧判断押题。",
      "Paper 2 卷头明写「Workings must be shown」「Begin each answer on a fresh page」—— 这两条不做就是白送的扣分。",
    ],
  },
  {
    subjectId: "economics",
    papers: [
      {
        name: "试卷一",
        parts: [{ name: "选择题", marks: "30 分", detail: "30 题，每题 1 分" }],
      },
      {
        name: "试卷二（70 分）· 全部必答",
        parts: [
          { name: "上册 · 短答", marks: "15 分", detail: "5 / 5 / 5 三题" },
          { name: "上册 · 长答", marks: "20 分", detail: "2 题，每题 10 分" },
          { name: "下册 · 短答", marks: "15 分", detail: "5 / 5 / 5 三题" },
          { name: "下册 · 长答", marks: "20 分", detail: "2 题，每题 10 分" },
        ],
      },
    ],
    takeaways: [
      "试卷二全部必答，没有选答。所以 21 章一章都不能放弃 —— 这一科没有任何战略性取舍的空间，只能全覆盖。",
      "上册 35 分、下册 35 分完全等重，但上册有 62 个小节、下册只有 42 个。同样一节内容，下册值 0.83 分、上册只值 0.56 分 —— 下册每小时的回报约是上册的 1.5 倍。落后的话，先补下册。",
      "选择题 30 分占全科 30% —— 是整科最便宜的分，值得单独刷。",
      "上册章号跟《试题分类集》错位，覆盖表里已并排标出分类集章号；下册两边章号一致，直接按章号找题就行。",
    ],
  },
  {
    subjectId: "english",
    papers: [
      {
        name: "Paper 1（100 分钟）",
        parts: [
          { name: "Section A · Summary Writing", marks: "15%", detail: "摘要写作" },
          { name: "Section B · Essay Writing", marks: "35%", detail: "作文，五层分析 Individual→Global" },
        ],
      },
      {
        name: "Paper 2（80 分钟）",
        parts: [
          { name: "Section A Part I", marks: "—", detail: "Matching Paragraph（段落配对）" },
          { name: "Section A Part II", marks: "—", detail: "Vocabulary（词义）" },
          { name: "Section A Part III", marks: "—", detail: "Comprehension（阅读理解）" },
          { name: "Section B Part I", marks: "—", detail: "Error Identification（找错）" },
          { name: "Section B Part II", marks: "—", detail: "Word Forms（词形变化）" },
        ],
      },
    ],
    takeaways: [
      "2026 预考 Paper 2 官方 25/40（62.5%）。逐题数出 27–28 题答对（共 50 题）却只得 25/40 —— 卷二不是每题 1 分，Section B 很可能每题 0.5 分。拿到卷头分值表后要核对。",
      "Paper 1 占英文的一半（Summary 15% ＋ Essay 35%），但答卷至今没拿回来 —— 这是七科里最该追的一份卷。",
      "Vocabulary 8/10 对 Word Forms 2/10 —— 认得出但产不出。Word Forms 先判词性再想变形，别直接改词尾。",
      "英文是 10/21 上午第一场；而且会计八道错题里七道卡在英文术语，数学与高数也是英文出题 —— 补英文等于同时补四科。",
    ],
  },
  {
    subjectId: "chinese",
    papers: [
      {
        name: "试卷一 写作（105 分钟）",
        parts: [
          { name: "甲组 作文", marks: "30%", detail: "5 题选 1，至少 600 字，不可用诗歌或戏剧体裁" },
          { name: "乙组 应用文", marks: "10%", detail: "2 题选 1，新式应用文格式" },
        ],
      },
      {
        name: "试卷二 语文测验（105 分钟）",
        parts: [
          { name: "甲组(I) 语文基础知识", marks: "8%", detail: "6 题全答：字音／错别字／感情色彩／成语／语病／仿写" },
          { name: "甲组(II) 文学文化常识", marks: "10%", detail: "6 题全答：文体／作家配对／诗派／世称／默写／称谓" },
          { name: "乙组 现代文阅读", marks: "24%", detail: "2 篇 × 5 题全答" },
          { name: "丙组 古诗文阅读", marks: "18%", detail: "3 篇：课内文言文／课外文言文／古诗" },
        ],
      },
    ],
    takeaways: [
      "2026 预考试卷二 13/60（21.7%），七科最低。但卷二 60 分里有 36 分（语文基础 8 ＋ 文学常识 10 ＋ 古诗文 18）是纯记忆或范围固定的 —— 这一科不是能力问题，是账没记。",
      "现代文阅读 24 分有八种固定题型，每种都有采分骨架。写够段数就有分：3 分的修辞题只写「比喻」两个字最多拿 1 分。",
      "应用文「内容 5%」是九到十个格子，每格 0.5–2%。题目印出来的地址必须照抄进公函版头 —— 那是送分。",
      "作文评分附则：内容评 E 等 → 语言、结构最高只能评 C 等。切题是天花板，不是及格线。",
      "诗词默写按「统考未考过的先背」—— 2026 预考考的《声声慢》正是那九首之一，这个优先级已验证过。",
    ],
  },
  {
    subjectId: "advmath",
    papers: [
      {
        name: "Paper 1（60 分钟）",
        parts: [{ name: "Multiple-choice", marks: "40%", detail: "20 题，全答" }],
      },
      {
        name: "Paper 2（120 分钟）· 共答 9 题",
        parts: [
          { name: "Section A", marks: "20%", detail: "Q1–Q5 全答：多项式／轨迹／正态分布／解三角形／相关变化率" },
          { name: "Section B", marks: "40%", detail: "Q6–Q12 七选四，每题 10%。微积分集中在 Q11、Q12" },
        ],
      },
    ],
    takeaways: [
      "2026 预考 Paper 1 只有 9/20（45%），而同周数学 Paper 1 是 16/20（80%）—— 同样 20 题选择、同样一小时，差了近一倍。",
      "自评与实际严重脱节：考后自述「试卷一状态还好」，卷面只标了 3 个 Tembak，实际错 11 题。数学那次标了 5 个且标得很准 —— 高数这次的自我校准失灵，比分数低更危险。",
      "十一道错题里有五道属于「算对了中间那一步就停了」：知道 x≠4 却选含 4 的选项、算出 2R=20 没乘 sin120°、算出圆心到直线距离 5 却没求切点、扇形忘了加两条半径、定积分漏了下限 ln3。救回这五道就是 14/20（70%）。",
      "「差最后一步」不是高数独有：数学 Paper 1 Q18（切线斜率忘了取负倒数）、数学 Paper 2 Q5（Show that 证完不用）是同一个毛病。两科共用一张自查表。",
      "Paper 1 的失分不集中在微积分（只有 Q19 一题），而是散布在定义域、指数、数列求和、球面几何、圆与扇形、解析几何、排列组合与概率 —— 每章都掉一两分。这和数学（微积分集中失分）是两种病。",
    ],
  },
  {
    subjectId: "math",
    papers: [
      {
        name: "试卷一（60 分钟）",
        parts: [{ name: "选择题", marks: "40%", detail: "20 题，全答" }],
      },
      {
        name: "试卷二（120 分钟）",
        parts: [
          { name: "Section A", marks: "20%", detail: "Q1–Q5 全答" },
          { name: "Section B", marks: "40%", detail: "Q6–Q12 七题选四，每题 10%" },
        ],
      },
    ],
    takeaways: [
      "2026 预考：试卷一 16/20（32/40），试卷二约 31/60，全科约 63 —— 离 A1 还差约 17 分。试卷二才是差距所在。",
      "试卷一非微积分 15/15 全对、微积分 1/4；试卷二则是统计与概率崩盘（分组数据中点／标准差／中位数、两次抽取的概率，五处全错），而试卷一的简单统计两题全对。分界线是「原始数据的直觉算法会，公式化的分组统计与组合概率不会」。",
      "微积分板块和高级数学重叠，高数试卷二崩溃的也是这一块 —— 补一次，数学（10/23）和高数（10/27）两科同时受益。",
      "「Show that … Hence …」＝ 必须用前一问证出的结果。试卷二 Q5 证完不用、硬展开分母，和试卷一 Q19「不先化简就积分」是同一个根。",
      "三个答案在交卷前就能看出不可能：中位数 144.9（数据只到 139）、轨迹 3x²+5y²（阿波罗尼斯轨迹必是圆，两系数须相等）、P(至少一个)=0.975（全班只有 1/4 带饭盒）。交卷前三分钟做合理性检查。",
      "会做却留空约 4 分：Q4(a) 平均数（同表的 (b) 做对了）、Q6(a)(ii) 矩阵 X（(i) 的 A⁻¹ 已求对）。算到一半跳过去就没回头。",
      "Section B 七选四，选题本身是分。本次选的 Q6/Q9/Q10/Q11 得 4/4/4/5，而没选的 Q7 三小问全是常规代数（复合函数、双重根号、多项式除法）。下次先花 2 分钟扫七题按熟悉度选，别按顺序选。",
    ],
  },
  {
    subjectId: "business",
    papers: [
      {
        name: "试卷一",
        parts: [{ name: "选择题", marks: "35%", detail: "35 题，每题 1 分" }],
      },
      {
        name: "试卷二（65%）· 5 题全答",
        parts: [
          { name: "个案题 ×5", marks: "65%", detail: "每题 10–15 分，拆成 (a)–(d) 小问；每题另起一张纸" },
        ],
      },
    ],
    takeaways: [
      "试卷二 5 题全答，没有选答 —— 21 章一章都不能丢。跟经济学一样，这一科没有战略性取舍的空间。",
      "试卷二 65 分是试卷一的将近两倍。选择题练得再熟，也补不回作答题的洞 —— 2026 预考试卷一 30/35，试卷二却有 22 分不会写。",
      "同一个考点会在两张卷子里各出一次。预考里贸易术语（试卷一 Q5 ＋ 试卷二 1c）和消费者投诉管道（Q11 ＋ 5d）就是这样各收了两次钱，合计 10 分。补一章＝拿两处的分。",
      "作答公式：Keypoint（关键词）＋ Huraian（解释）＋ Example（例子）。凡是题目写「说明」「试举例」「并解释」，只写关键词最多拿一半分。",
      "计算题固定考损益平衡与财务比率两处，而且陷阱都在「用哪条公式」而不是「算得对不对」：目标利润要 +利润，速动比率要 −存货。",
    ],
  },
];

export function structureFor(subjectId: SubjectId): PaperStructure | undefined {
  return PAPER_STRUCTURES.find((s) => s.subjectId === subjectId);
}
