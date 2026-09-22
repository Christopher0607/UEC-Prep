import { DECKS, TOTAL_CARDS, deckOfFront } from "./lib/decks";
import { SYLLABI, TOTAL_TOPICS, SEED_MISTAKES } from "./lib/seed";
import { SUBJECTS, SUBJECTS_BY_DATE, TRIAL_EXAMS, PHASES, examDate } from "./lib/exam";
import { PAPER_STRUCTURES } from "./lib/syllabi";
import { INTERVALS } from "./lib/srs";

const ids = new Set(SUBJECTS.map((s) => s.id));
const bad: string[] = [];
const warn: string[] = [];

// --- 卡组 ---
const seenFront = new Map<string, string>();
let emptyCards = 0, longFront = 0, noAnswer = 0;
for (const d of DECKS) {
  if (!ids.has(d.subjectId)) bad.push(`卡组 ${d.id} 的 subjectId 非法: ${d.subjectId}`);
  if (!d.cards.length) bad.push(`卡组 ${d.id} 是空的`);
  for (const [f, b] of d.cards) {
    if (!f.trim() || !b.trim()) emptyCards++;
    if (f.length > 60) longFront++;
    const key = `${d.subjectId}|${f}`;
    if (seenFront.has(key)) bad.push(`同科目内重复正面: ${f.slice(0,40)} → ${seenFront.get(key)} / ${d.id}`);
    seenFront.set(key, d.id);
    if (deckOfFront(f, d.subjectId) !== d.id) bad.push(`deckOfFront 回查不一致: ${f.slice(0,30)}`);
    if (b.split("\n").length === 1 && b.length > 120) noAnswer++;
  }
}
console.log(`卡组 ${DECKS.length} 组 / ${TOTAL_CARDS} 张；空卡 ${emptyCards}；正面>60字 ${longFront}；背面单行且>120字 ${noAnswer}`);
if (emptyCards) bad.push(`有 ${emptyCards} 张空卡`);

// --- 考点 ---
let dupTopic = 0, noSep = 0;
for (const s of SYLLABI) {
  if (!ids.has(s.subjectId)) bad.push(`考纲 subjectId 非法: ${s.subjectId}`);
  const seen = new Set<string>();
  for (const t of s.data) {
    if (seen.has(t.title)) { dupTopic++; warn.push(`${s.label} 重复考点: ${t.title}`); }
    seen.add(t.title);
    if (!t.title.trim() || !t.section.trim()) bad.push(`${s.label} 有空考点`);
    if (!t.section.includes(" · ")) noSep++;
  }
}
console.log(`考点 ${TOTAL_TOPICS} 个；重复 ${dupTopic}；section 缺「 · 」分隔（不会分两层）${noSep}`);

// --- 错题 ---
for (const m of SEED_MISTAKES) {
  if (!ids.has(m.subjectId)) bad.push(`错题 subjectId 非法: ${m.subjectId}`);
  if (!m.question.trim() || !m.stuckAt.trim()) bad.push(`错题缺字段: ${m.source}`);
  if (!["concept","method","careless","time"].includes(m.cause)) bad.push(`错题 cause 非法: ${m.source}`);
}
const bySub = new Map<string, number>();
for (const m of SEED_MISTAKES) bySub.set(m.subjectId, (bySub.get(m.subjectId) ?? 0) + 1);
console.log(`错题 ${SEED_MISTAKES.length} 道:`, [...bySub].map(([k,v])=>`${k} ${v}`).join(" "));

// --- 七科覆盖 ---
for (const s of SUBJECTS) {
  const t = SYLLABI.find((x) => x.subjectId === s.id)?.data.length ?? 0;
  const c = DECKS.filter((d) => d.subjectId === s.id).reduce((n, d) => n + d.cards.length, 0);
  const m = bySub.get(s.id) ?? 0;
  const p = PAPER_STRUCTURES.some((x) => x.subjectId === s.id);
  console.log(`  ${s.name.padEnd(5)} 考点 ${String(t).padStart(3)} · 卡 ${String(c).padStart(3)} · 错题 ${String(m).padStart(2)} · 卷面结构 ${p ? "有" : "无"}`);
  if (!t) bad.push(`${s.name} 没有考点`);
  if (!p) warn.push(`${s.name} 没有录入卷面结构`);
}

// --- 日期 ---
const order = SUBJECTS_BY_DATE.map((s) => `${s.name}${s.date}`);
console.log("考试顺序:", order.join(" → "));
for (let i = 1; i < SUBJECTS_BY_DATE.length; i++) {
  if (examDate(SUBJECTS_BY_DATE[i]) < examDate(SUBJECTS_BY_DATE[i-1])) bad.push("SUBJECTS_BY_DATE 没按日期排序");
}
for (const s of SUBJECTS) if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date)) bad.push(`${s.name} 日期格式怪: ${s.date}`);
console.log("预考", TRIAL_EXAMS.length, "场；六阶段", PHASES.length, "个；Leitner 间隔", INTERVALS.join(","));

console.log("\n=== 错误 ===");
if (bad.length) bad.forEach((x) => console.log("✗", x));
else console.log("（无）");
console.log("=== 提醒 ===");
if (warn.length) warn.slice(0, 15).forEach((x) => console.log("!", x));
else console.log("（无）");
if (warn.length > 15) console.log(`… 另有 ${warn.length-15} 条`);
