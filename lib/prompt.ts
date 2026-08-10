import { A1_THRESHOLD, subjectById } from "./exam";
import type { AppData, Mistake, SubjectId, Topic } from "./types";

/**
 * The app has no API key and no model. Every screen that would "use AI" instead
 * assembles a prompt precise enough that pasting it into a Claude conversation
 * gets a better answer than a bare screenshot would — because it carries the
 * subject, the syllabus topic, the student's own working, and the exact step
 * they got stuck on.
 */

const CAUSE_LABEL: Record<Mistake["cause"], string> = {
  concept: "概念不懂",
  method: "套路没背熟",
  careless: "粗心 / 手滑",
  time: "时间不够",
};

const HEADER =
  "我在准备 2026 年马来西亚高中统考（UEC-SM），目标是 A1（80 分以上）。";

export function mistakePrompt(m: Mistake, topic?: Topic): string {
  const subject = subjectById(m.subjectId);
  return [
    HEADER,
    "",
    `科目：${subject.name}（${subject.medium}卷）`,
    topic ? `考点：${topic.section} — ${topic.title}` : "考点：我自己也不确定属于哪个考点，请你判断",
    m.source ? `来源：${m.source}` : null,
    `我的自我归因：${CAUSE_LABEL[m.cause]}`,
    "",
    "【题目】",
    m.question,
    "",
    "【我的完整解题过程】",
    m.myWork || "（空白 — 我完全不知道从哪里下手）",
    "",
    "【我卡在哪一步】",
    m.stuckAt || "（说不清楚）",
    "",
    "请你：",
    "1. 判断我到底是概念不懂、套路没背熟，还是纯粹粗心 —— 这三种的补救方法完全不同，别混为一谈；",
    "2. 指出我第一次走错是在哪一行，不要从头重讲一遍；",
    "3. 给我这类题的通用解题套路，讲清楚看到什么特征就该用它；",
    "4. 出 2 道同类型但换了数字和情境的题让我练，先不要给答案。",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Photo-solve: the whole point is that it refuses to finish the question for you. */
export function hintPrompt(subjectId: SubjectId, question: string): string {
  const subject = subjectById(subjectId);
  return [
    HEADER,
    "",
    `科目：${subject.name}（${subject.medium}卷）`,
    "",
    "【题目】",
    question || "（见我接下来发的照片）",
    "",
    "**重要：不要给我答案，也不要写出完整解题过程。**",
    "",
    "只给我：",
    "1. 这题在考哪个考点；",
    "2. 第一步应该看什么、先做什么（只给第一步）；",
    "3. 一句话提示我最容易在哪里踩坑。",
    "",
    "我自己做完之后会把过程发给你，那时候你再批。如果我卡住了会再问你要下一步提示。",
  ].join("\n");
}

export function gradePrompt(subjectId: SubjectId, label: string): string {
  const subject = subjectById(subjectId);
  return [
    HEADER,
    "",
    `科目：${subject.name}（${subject.medium}卷）`,
    `试卷：${label}`,
    "",
    "我接下来会发我手写的答卷照片。请你严格按统考评分标准批改，不要放水：",
    "",
    "1. 逐题给分，写清楚每一分是怎么扣的（步骤分尤其要抠）；",
    "2. 算总分，换算成统考等级（A1 = 80 分以上）；",
    "3. 把丢掉的分数按「概念不懂 / 套路没背熟 / 粗心」三类统计，告诉我各丢了几分；",
    "4. 最后告诉我：如果只能改进一件事，改哪一件能拿回最多分。",
  ].join("\n");
}

/**
 * Feynman, run backwards: the student explains, Claude attacks. Reading a
 * chapter hides the holes; explaining it out loud is where they surface, so the
 * prompt forbids re-teaching until the gaps have been named.
 */
export function feynmanPrompt(
  subjectId: SubjectId,
  topicTitle: string,
  explanation: string,
): string {
  const subject = subjectById(subjectId);
  return [
    HEADER,
    "",
    `科目：${subject.name}（${subject.medium}卷）`,
    `考点：${topicTitle || "（我下面讲的这个）"}`,
    "",
    "我用费曼学习法，把这个考点讲一遍给你听。请你当考官，专挑漏洞。",
    "",
    "【我的讲解】",
    explanation,
    "",
    "请你：",
    "1. 指出我讲错的地方，以及我讲得含糊、其实自己也没真懂的地方（后者更重要）；",
    "2. 指出我漏讲了什么 —— 考纲里属于这个考点、但我完全没提到的部分；",
    "3. 追问我 3 个问题，专门打我讲解里最虚的那几处；",
    "4. 最后给我一个判断：这个考点我现在是「熟练能默写」「会做但易错」「看得懂但不会做」还是「其实没懂」。",
    "",
    "先不要重讲一遍正确版本 —— 等我回答完你的追问再说。",
  ].join("\n");
}

export function cardGenPrompt(subjectId: SubjectId, topicTitles: string[]): string {
  const subject = subjectById(subjectId);
  return [
    HEADER,
    "",
    `科目：${subject.name}（${subject.medium}卷）`,
    "",
    "请针对以下考点，帮我做背诵卡：",
    ...topicTitles.map((t) => `- ${t}`),
    "",
    "格式要求：每行一张卡，用 | 分隔正面和背面，不要编号，不要其他说明文字。",
    "正面是提问，背面是答案。背面尽量短，一眼能看完。",
    "",
    "例：",
    "机会成本的定义是什么？|做出选择时，所放弃的其他选项中价值最高的那一个。",
    "",
    "这样我可以直接复制粘贴进我的背诵卡系统批量导入。",
  ].join("\n");
}

/**
 * English is the first paper sat and the weakest subject, so it gets its own
 * prompt built around the teacher's actual rubric rather than generic essay
 * advice. The plan is checked *before* the essay is written — a broken thesis
 * or a heading too narrow to reach every level of analysis caps the band no
 * matter how good the prose is.
 */
export function essayPlanPrompt(input: {
  essayType: string;
  typeDemand: string;
  topic: string;
  hook: string;
  background: string;
  thesis: string;
  headings: string[];
  levelNotes: Record<string, string>;
  levelNames: { id: string; name: string }[];
}): string {
  const lines = [
    HEADER,
    "",
    "科目：英文（UEC Paper 1，Essay 部分）。这是我们老师给的评分要求，请严格按它来批：",
    "",
    "**开头结构**：Hook → Background information → Thesis Statement",
    "**Thesis Statement 硬性要求**：",
    "- 必须是一个句子写完接下来的三个大标题",
    "- 不能有语法错误",
    "- 不能分开成两句",
    "- 不能写错标题（thesis 里的标题必须和正文标题完全对得上）",
    "",
    "**内容要求**：正文不能只偏向一个主体。每个大标题都要够广，展开时要能覆盖到不同层次的分析（Individual / Family / Community / National …），覆盖得全才拿得到最高 tier。",
    "",
    `**这篇的类型**：${input.essayType} —— ${input.typeDemand}`,
    "",
    "---",
    "",
    `【题目】${input.topic || "（还没定）"}`,
    "",
    `【Hook】${input.hook || "（还没写）"}`,
    `【Background】${input.background || "（还没写）"}`,
    `【Thesis Statement】${input.thesis || "（还没写）"}`,
    "",
    "【三个大标题】",
    ...input.headings.map((h, i) => `${i + 1}. ${h || "（空）"}`),
    "",
    "【每个层次我打算怎么带到】",
    ...input.levelNames.map(
      (l) => `- ${l.name}：${input.levelNotes[l.id]?.trim() || "（还没想好）"}`,
    ),
    "",
    "---",
    "",
    "请你：",
    "1. 逐条对照上面的 Thesis 硬性要求批我的 thesis，语法错误要指出来并改对；",
    "2. 判断我这三个标题**够不够广** —— 逐个说，如果某个标题窄到撑不起五个层次，直接告诉我改成什么；",
    "3. 指出我哪个层次带得勉强或根本没带到；",
    "4. 这个类型（" + input.essayType + "）特有的坑，我这份计划踩了没有。",
    "",
    "先只批计划，不要帮我写正文 —— 正文我自己写完再发给你。",
  ];
  return lines.join("\n");
}

/**
 * 应用文 is graded against a fixed 要素 checklist, so the prompt ships that
 * checklist rather than asking for a general opinion — otherwise the reply is
 * "写得不错" instead of "你漏了活动名称，扣一分".
 */
export function appliedWritingGradePrompt(genre: {
  name: string;
  elements: string[];
  header: string[];
}, draft: string): string {
  return [
    HEADER,
    "",
    `科目：华文（试卷一 · 应用文 · ${genre.name}）`,
    "",
    `我们老师的${genre.name}要素表（每项独立算分）：`,
    ...genre.elements.map((e) => `- ${e}`),
    "",
    "版头格式要求：",
    ...genre.header.map((h) => `- ${h}`),
    "",
    "【我写的】",
    draft || "（我接下来发照片）",
    "",
    "请你：",
    "1. 逐项对照要素表，写明「有／无」，无的直接说漏了什么；",
    "2. 检查版头格式，特别是署名的身份跟题目给的身份是否一致；",
    "3. 检查段落编号（第 1 段不编号，第 2 段起才编）；",
    "4. 固定套语用对没有 —— 邀请类和投诉类的预设结果、结尾祈使是不一样的；",
    "5. 最后给一个估分和「最该改的一件事」。",
    "",
    "严格一点，不要放水。这部分是格式分，丢了最冤枉。",
  ].join("\n");
}

/** 华文作文 — the outline is where marks are won, same as the English essay. */
export function chineseEssayOutlinePrompt(input: {
  topic: string;
  genre: string;
  thesis: string;
  points: string[];
  materials: string;
}): string {
  return [
    HEADER,
    "",
    "科目：华文（试卷一 · 作文）",
    "",
    `【题目】${input.topic || "（还没定）"}`,
    `【我打算写的文体】${input.genre}`,
    `【中心思想】${input.thesis || "（还没想清楚）"}`,
    "",
    "【分论点】",
    ...input.points.map((p, i) => `${i + 1}. ${p || "（空）"}`),
    "",
    "【我打算用的素材】",
    input.materials || "（还没想好）",
    "",
    "请你：",
    "1. 判断我审题有没有偏 —— 题目真正问的是什么，我写的是不是同一件事；",
    "2. 我的中心思想够不够明确，能不能一句话说清；",
    "3. 三个分论点有没有重复、有没有层次（并列还是递进），顺序对不对；",
    "4. 素材撑不撑得起论点 —— 空泛的例子直接指出来，告诉我换成什么；",
    "5. 这个题目最容易写成流水账的地方在哪，我该怎么避开。",
    "",
    "先只批提纲，不要帮我写正文。",
  ].join("\n");
}

/** Paper 2 is five different skills; drilling them as one blurred mass wastes time. */
export function paper2DrillPrompt(sectionName: string, sectionDetail: string): string {
  return [
    HEADER,
    "",
    "科目：英文（UEC Paper 2）",
    `部分：${sectionName}`,
    `我们老师说这部分：${sectionDetail}`,
    "",
    "请你按这个部分的真实题型，出一套练习给我（先不要给答案）。",
    "出完之后告诉我：做这一部分应该按什么步骤走，以及最常见的三个失分点是什么。",
    "我做完会把答案发给你批。",
  ].join("\n");
}

/**
 * The weekly check-in. Ships the whole picture — coverage gaps, real paper
 * scores, unresolved mistakes — so the plan comes back grounded in data instead
 * of in whatever the student remembers to mention.
 */
export function weeklyReviewPrompt(data: AppData): string {
  const lines: string[] = [HEADER, "", "这是我这周的真实数据，请帮我复盘并排下周的计划。", ""];

  for (const subjectId of Object.keys(
    Object.fromEntries([
      ...data.topics.map((t) => [t.subjectId, true]),
      ...data.papers.map((p) => [p.subjectId, true]),
      ...data.mistakes.map((m) => [m.subjectId, true]),
    ]),
  ) as SubjectId[]) {
    const subject = subjectById(subjectId);
    const topics = data.topics.filter((t) => t.subjectId === subjectId);
    const weak = topics.filter((t) => t.mastery <= 1);
    const papers = data.papers
      .filter((p) => p.subjectId === subjectId)
      .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
    const latest = papers[papers.length - 1];
    const openMistakes = data.mistakes.filter((m) => m.subjectId === subjectId && !m.resolved);

    lines.push(`## ${subject.name}`);
    if (latest) {
      const pct = Math.round((latest.score / latest.total) * 100);
      lines.push(`- 最近一次真题：${latest.label} ${latest.score}/${latest.total}（${pct}%，距 A1 差 ${Math.max(0, A1_THRESHOLD - pct)} 分）`);
    } else {
      lines.push(`- 还没做过限时真题（校内平均 ${data.baselines[subjectId] ?? "未知"}，含作业分，偏高）`);
    }
    lines.push(`- 考点覆盖：${topics.length} 个考点中，${weak.length} 个还在「懵 / 看得懂但不会做」`);
    if (weak.length) {
      lines.push(`  弱项：${weak.slice(0, 12).map((t) => t.title).join("、")}${weak.length > 12 ? " …" : ""}`);
    }
    lines.push(`- 未解决错题：${openMistakes.length} 条`);
    lines.push("");
  }

  lines.push(
    "请告诉我：",
    "1. 下周每一科各应该分配多少小时，为什么这样分；",
    "2. 哪一科现在最危险，哪一科其实可以先放一放；",
    "3. 下周具体要清掉哪几个考点（点名，不要说「多做题」）。",
  );
  return lines.join("\n");
}

export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
