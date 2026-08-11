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

/** 会计学：Book 3（第 23–30 章）。27 和 28 必有一个出在最后一题。 */
const ACC_BOOK3: [string, string[]][] = [
  ["23 Financial statements for limited company – Introduction", []],
  ["24 Financial statements for limited company – Shares, loan notes, dividend and reserves", []],
  ["25 Financial statements for limited company – IFRS 18", []],
  ["26 Financial statements for limited company – IAS 7 Statement of cash flows", []],
  ["27 Analysis of accounting ratios ⭐", []],
  ["28 Budgeting ⭐", []],
  ["29 Introduction to cost analysis", []],
  ["30 Cost – Volume – Profit analysis", []],
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
        name: "只考一张卷",
        parts: [
          { name: "Part 1", detail: "20 题选择题" },
          { name: "Part 2", detail: "10 题简答题" },
          {
            name: "Part 3",
            detail: "大题。一题可以混 2–3 个单元一起考，所以单元之间的连接要打通。",
          },
        ],
      },
    ],
    takeaways: [
      "最后一题必定出自 Chapter 27（会计比率分析）或 Chapter 28（预算），出哪个看出题人 —— 所以两章都要会，不能赌。",
      "这两章在 Book 3，通常是最后才教、练得最少的部分。但它们是保底出现的大题，优先级应该排在前面，不是后面。",
      "Part 3 会跨单元出题。只会单章不够，要练「一道题里同时用到折旧 + 应计预付 + 财务报表」这种组合。",
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
];

export function structureFor(subjectId: SubjectId): PaperStructure | undefined {
  return PAPER_STRUCTURES.find((s) => s.subjectId === subjectId);
}
