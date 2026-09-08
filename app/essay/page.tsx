"use client";

import { useMemo, useState } from "react";
import {
  Button,
  ClientOnly,
  CopyPrompt,
  Empty,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
} from "@/components/ui";
import {
  ANALYSIS_LEVELS,
  ESSAY_TYPES,
  GRAMMAR_TRAPS,
  PAPER2_SECTIONS,
  SUFFIX_TABLE,
  WORD_FORM_METHOD,
  WORD_FORM_MISSES,
  checkFiveLevels,
  checkLevelSpread,
  checkThesis,
  levelById,
} from "@/lib/english";
import { essayPlanPrompt, paper2DrillPrompt } from "@/lib/prompt";
import { newId, update, useData } from "@/lib/store";
import type { EssayHeading, EssayPlan, LevelMode } from "@/lib/types";

const BLANK_HEADINGS: EssayHeading[] = [
  { text: "", level: "", plan: "" },
  { text: "", level: "", plan: "" },
  { text: "", level: "", plan: "" },
];

interface Draft {
  essayType: string;
  topic: string;
  hook: string;
  background: string;
  thesis: string;
  headings: EssayHeading[];
  levelMode: LevelMode;
  levelNotes: Record<string, string>;
  revisionOf?: string;
}

const EMPTY: Draft = {
  essayType: ESSAY_TYPES[0].id,
  topic: "",
  hook: "",
  background: "",
  thesis: "",
  headings: BLANK_HEADINGS,
  // The teacher's rule has been read both ways; "five" is the current one.
  levelMode: "five",
  levelNotes: {},
};

const MODE_LABEL: Record<LevelMode, string> = {
  five: "五层全覆盖",
  perHeading: "一标题一层",
};

export default function EssayPage() {
  const data = useData();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const essayType = ESSAY_TYPES.find((t) => t.id === draft.essayType) ?? ESSAY_TYPES[0];
  const checks = checkThesis(
    draft.thesis,
    draft.headings.map((h) => h.text),
  );
  const levelCheck =
    draft.levelMode === "five"
      ? checkFiveLevels(draft.levelNotes)
      : checkLevelSpread(draft.headings.map((h) => h.level));

  const plans = useMemo(
    () =>
      data.essays
        .filter((e) => e.subjectId === "english")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.essays],
  );

  /** Groups every revision of a question together, oldest first. */
  const chains = useMemo(() => {
    const byId = new Map(plans.map((p) => [p.id, p]));
    const rootOf = (p: EssayPlan): string => {
      let cur = p;
      const seen = new Set<string>();
      while (cur.revisionOf && byId.has(cur.revisionOf) && !seen.has(cur.id)) {
        seen.add(cur.id);
        cur = byId.get(cur.revisionOf)!;
      }
      return cur.id;
    };
    const groups = new Map<string, EssayPlan[]>();
    for (const p of plans) {
      const root = rootOf(p);
      groups.set(root, [...(groups.get(root) ?? []), p]);
    }
    return [...groups.values()].map((list) =>
      [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    );
  }, [plans]);

  const previous = draft.revisionOf ? plans.find((p) => p.id === draft.revisionOf) : undefined;

  function setHeading(i: number, changes: Partial<EssayHeading>) {
    setDraft((d) => ({
      ...d,
      headings: d.headings.map((h, idx) => (idx === i ? { ...h, ...changes } : h)),
    }));
  }

  function save() {
    if (!draft.topic.trim() && !draft.thesis.trim()) return;
    const plan: EssayPlan = {
      id: newId(),
      subjectId: "english",
      essayType: essayType.name,
      topic: draft.topic.trim(),
      hook: draft.hook.trim(),
      background: draft.background.trim(),
      thesis: draft.thesis.trim(),
      headings: draft.headings,
      levelMode: draft.levelMode,
      levelNotes: draft.levelMode === "five" ? draft.levelNotes : undefined,
      revisionOf: draft.revisionOf,
      createdAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, essays: [...d.essays, plan] }));
    setDraft(EMPTY);
  }

  function reviseFrom(plan: EssayPlan) {
    setDraft({
      essayType: ESSAY_TYPES.find((t) => t.name === plan.essayType)?.id ?? ESSAY_TYPES[0].id,
      topic: plan.topic,
      hook: plan.hook,
      background: plan.background,
      thesis: plan.thesis,
      headings: plan.headings.length ? plan.headings : BLANK_HEADINGS,
      levelMode: plan.levelMode ?? "five",
      levelNotes: plan.levelNotes ?? {},
      revisionOf: plan.id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function patchPlan(id: string, changes: Partial<EssayPlan>) {
    update((d) => ({
      ...d,
      essays: d.essays.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    }));
  }

  function removePlan(id: string) {
    update((d) => ({ ...d, essays: d.essays.filter((e) => e.id !== id) }));
  }

  return (
    <div className="space-y-4">
      <Panel
        title={draft.revisionOf ? "英文作文 · 改进版" : "英文作文 · 计划检查"}
        subtitle="英文是第一场考、也是你最弱的一科。Thesis 和标题选错，正文写得再好也封顶 —— 所以先批计划，再写正文。"
        right={
          draft.revisionOf ? (
            <Button onClick={() => setDraft(EMPTY)}>放弃改进，新开一篇</Button>
          ) : undefined
        }
      >
        {previous && (
          <p className="mb-3 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm">
            正在改进：<strong>{previous.topic || "未命名"}</strong>
            {previous.grammarErrors !== undefined && (
              <span className="text-muted-foreground">
                （上一版 {previous.grammarErrors} 处语法错误）
              </span>
            )}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Essay 类型">
            <Select
              value={draft.essayType}
              onChange={(e) => setDraft({ ...draft, essayType: e.target.value })}
            >
              {ESSAY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="题目">
            <Input
              value={draft.topic}
              onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
            />
          </Field>
        </div>
        <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
          <strong>{essayType.name}</strong>：{essayType.demand}
        </p>

        {/* The rule has flip-flopped; a switch beats rewriting the page again. */}
        <div className="mt-4">
          <p className="mb-1.5 text-sm font-medium">5 Levels 怎么用</p>
          <div className="flex flex-wrap gap-2">
            {(["five", "perHeading"] as LevelMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDraft((d) => ({ ...d, levelMode: mode }))}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  draft.levelMode === mode
                    ? "border-accent bg-accent text-accent-foreground"
                    : "hover:bg-surface-2"
                }`}
              >
                {MODE_LABEL[mode]}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {draft.levelMode === "five"
              ? "整篇覆盖 Individual → Family → Community → National → Global 五层，每层都要带到。"
              : "三个标题各对应一个层次，落在三个不同的层次上。"}
          </p>
        </div>
      </Panel>

      <Panel title="开头三件套" subtitle="Hook → Background information → Thesis Statement">
        <div className="space-y-3">
          <Field label="Hook" hint="第一句就要有力，不要跟 Background 说同一件事">
            <Textarea
              rows={2}
              value={draft.hook}
              onChange={(e) => setDraft({ ...draft, hook: e.target.value })}
            />
          </Field>
          <Field label="Background information" hint="交代背景，铺垫到 thesis">
            <Textarea
              rows={2}
              value={draft.background}
              onChange={(e) => setDraft({ ...draft, background: e.target.value })}
            />
          </Field>
          <Field
            label="Thesis Statement"
            hint="一个句子写完下面三个大标题。不能断句、不能有语法错误、不能写错标题、三项要平行。"
          >
            <Textarea
              rows={3}
              value={draft.thesis}
              onChange={(e) => setDraft({ ...draft, thesis: e.target.value })}
            />
          </Field>
        </div>

        <ClientOnly>
          <ul className="mt-3 space-y-1.5">
            {[...checks, levelCheck].map((c) => (
              <li key={c.rule} className="flex gap-2 text-sm">
                <span className={c.pass ? "text-ok" : "text-warn"}>{c.pass ? "✓" : "!"}</span>
                <span>
                  <strong>{c.rule}</strong>
                  <span className="text-muted-foreground"> — {c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </ClientOnly>
      </Panel>

      <Panel
        title="三个大标题"
        subtitle={
          draft.levelMode === "five"
            ? "每个标题都要够广 —— 广到能从 Individual 一路铺到 Global。"
            : "一个标题对一个层次。三个标题必须落在三个不同的层次上。"
        }
      >
        <div className="space-y-4">
          {draft.headings.map((h, i) => (
            <div key={i} className="rounded-xl border p-3">
              <div
                className={
                  draft.levelMode === "perHeading"
                    ? "grid gap-3 sm:grid-cols-[1fr_180px]"
                    : undefined
                }
              >
                <Field label={`标题 ${i + 1}`}>
                  <Input value={h.text} onChange={(e) => setHeading(i, { text: e.target.value })} />
                </Field>
                {draft.levelMode === "perHeading" && (
                  <Field label="对应层次">
                    <Select
                      value={h.level}
                      onChange={(e) => setHeading(i, { level: e.target.value })}
                    >
                      <option value="">（未选）</option>
                      {ANALYSIS_LEVELS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}
              </div>
              <div className="mt-3">
                <Field
                  label="打算怎么写"
                  hint={
                    draft.levelMode === "perHeading"
                      ? h.level
                        ? levelById(h.level)?.hint
                        : "先选层次"
                      : "这个标题下面要讲什么"
                  }
                >
                  <Textarea
                    rows={3}
                    value={h.plan}
                    onChange={(e) => setHeading(i, { plan: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {draft.levelMode === "five" && (
        <Panel
          title="5 Levels of Analysis"
          subtitle="说明不能只偏向一个主体。五层都要带到，才拿得到最高 tier。"
        >
          <div className="space-y-3">
            {ANALYSIS_LEVELS.map((level) => (
              <Field key={level.id} label={level.name} hint={level.hint}>
                <Textarea
                  rows={2}
                  value={draft.levelNotes[level.id] ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      levelNotes: { ...d.levelNotes, [level.id]: e.target.value },
                    }))
                  }
                  placeholder="这一层打算怎么带到？"
                />
              </Field>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="批改与保存">
        <div className="flex flex-wrap items-center gap-3">
          <CopyPrompt
            build={() =>
              essayPlanPrompt({
                essayType: essayType.name,
                typeDemand: essayType.demand,
                topic: draft.topic,
                hook: draft.hook,
                background: draft.background,
                thesis: draft.thesis,
                headings: draft.headings.map((h) => ({
                  text: h.text,
                  levelName: levelById(h.level)?.name ?? "",
                  plan: h.plan,
                })),
                levelMode: draft.levelMode,
                levelNotes: ANALYSIS_LEVELS.map(
                  (l) => [l.name, draft.levelNotes[l.id] ?? ""] as [string, string],
                ),
                previous: previous
                  ? { thesis: previous.thesis, grammarErrors: previous.grammarErrors }
                  : undefined,
              })
            }
            label="让 Claude 批这份计划"
          />
          <Button
            variant="primary"
            onClick={save}
            disabled={!draft.topic.trim() && !draft.thesis.trim()}
          >
            {draft.revisionOf ? "存成新一版" : "存进准备库"}
          </Button>
          <span className="text-xs text-muted-foreground">
            批完回来把语法错误数填进去 —— 那个数字降下来，才叫真的进步。
          </span>
        </div>
      </Panel>

      <Panel
        title="准备库"
        subtitle={`${plans.length} 份计划 · 同一题的每一版排在一起，方便对比`}
      >
        <ClientOnly>
          {chains.length === 0 ? (
            <Empty>还没有存过计划。上面写完点「存进准备库」，下次就能拿出来改进。</Empty>
          ) : (
            <div className="space-y-4">
              {chains.map((chain) => {
                const first = chain[0];
                const latest = chain[chain.length - 1];
                const trend = chain
                  .map((p) => p.grammarErrors)
                  .filter((n): n is number => n !== undefined);
                return (
                  <div key={first.id} className="rounded-xl border p-3">
                    <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
                      <h3 className="font-semibold">{first.topic || "未命名"}</h3>
                      <span className="text-xs text-muted-foreground">{first.essayType}</span>
                      <span className="text-xs tnum text-muted-foreground">
                        {chain.length} 版
                      </span>
                      {trend.length >= 2 && (
                        <span
                          className={`text-xs tnum ${trend[trend.length - 1] < trend[0] ? "text-ok" : "text-warn"}`}
                        >
                          语法错误 {trend.join(" → ")}
                          {trend[trend.length - 1] < trend[0]
                            ? `　↓ 少了 ${trend[0] - trend[trend.length - 1]} 处`
                            : ""}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {chain.map((p, i) => (
                        <li key={p.id} className="rounded-lg border px-3 py-2">
                          <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">v{i + 1}</span>
                            <span className="tnum">{p.createdAt.slice(0, 10)}</span>
                            <span className="rounded bg-surface-2 px-1.5 py-0.5">
                              {MODE_LABEL[p.levelMode ?? "five"]}
                            </span>
                            {(p.levelMode ?? "five") === "five"
                              ? ANALYSIS_LEVELS.filter((l) => p.levelNotes?.[l.id]?.trim()).map(
                                  (l) => (
                                    <span key={l.id} className="rounded bg-surface-2 px-1.5 py-0.5">
                                      {l.name}
                                    </span>
                                  ),
                                )
                              : p.headings.map(
                                  (h) =>
                                    h.level && (
                                      <span
                                        key={h.level}
                                        className="rounded bg-surface-2 px-1.5 py-0.5"
                                      >
                                        {levelById(h.level)?.name}
                                      </span>
                                    ),
                                )}
                          </div>
                          <p className="mt-1.5 text-sm">{p.thesis || "（thesis 空白）"}</p>

                          <div className="mt-2 flex flex-wrap items-end gap-3">
                            <Field label="语法错误数">
                              <Input
                                inputMode="numeric"
                                className="w-24"
                                value={p.grammarErrors ?? ""}
                                onChange={(e) =>
                                  patchPlan(p.id, {
                                    grammarErrors:
                                      e.target.value === "" ? undefined : Number(e.target.value),
                                  })
                                }
                              />
                            </Field>
                            {p.id === latest.id && (
                              <Button onClick={() => reviseFrom(p)}>基于这版改进</Button>
                            )}
                            <Button variant="danger" onClick={() => removePlan(p.id)}>
                              删除
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </ClientOnly>
      </Panel>

      <Panel
        title="我的常犯语法错"
        subtitle="全部来自你自己被批过的作文。这几类也正好是 Paper 2 Section 4 考的 —— 修一次，两处回报。"
      >
        <ul className="space-y-2">
          {GRAMMAR_TRAPS.map((t) => (
            <li key={t.name} className="rounded-xl border p-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="mt-1 text-sm text-danger">✗ {t.wrong}</p>
              <p className="text-sm text-ok">✓ {t.right.replace(/\*\*/g, "")}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Word Forms · 三步流程"
        subtitle="预考这部分只拿 2/10，而它是全科规则最有限的一块。失分不是因为没时间 —— 这部分是第三个做的 —— 是因为跳过了第一步。"
      >
        <ol className="space-y-2">
          {WORD_FORM_METHOD.map((m) => (
            <li key={m.step} className="rounded-xl border p-3">
              <p className="text-sm font-medium">{m.step}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.detail}</p>
            </li>
          ))}
        </ol>

        <h3 className="mt-5 mb-2 text-sm font-semibold">后缀速查</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {SUFFIX_TABLE.map((r) => (
                <tr key={r.pos} className="border-b last:border-b-0">
                  <td className="py-2 pr-3 align-top font-medium whitespace-nowrap">{r.pos}</td>
                  <td className="py-2 pr-3 align-top font-mono text-xs">{r.suffixes}</td>
                  <td className="py-2 align-top text-muted-foreground">
                    {r.examples.replace(/\*\*/g, "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold">预考丢掉的八个空</h3>
        <ul className="space-y-1.5">
          {WORD_FORM_MISSES.map((m) => (
            <li key={m.n} className="flex flex-wrap items-baseline gap-x-2 rounded-lg border px-3 py-2 text-sm">
              <span className="w-8 shrink-0 tnum text-muted-foreground">{m.n}</span>
              <span className="w-20 shrink-0 font-mono text-xs">({m.root})</span>
              <span className="text-danger line-through">{m.wrote}</span>
              <span className="text-ok">{m.right}</span>
              <span className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">{m.why}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Paper 2 · 五个部分" subtitle="五种不同的能力，混在一起刷是浪费时间。一个一个打。">
        <ul className="space-y-2">
          {PAPER2_SECTIONS.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {s.name}
                  <span
                    className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                      s.difficulty === "难"
                        ? "bg-danger/15 text-danger"
                        : s.difficulty === "易"
                          ? "bg-ok/15 text-ok"
                          : "bg-surface-2"
                    }`}
                  >
                    {s.difficulty}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>
              </div>
              <CopyPrompt build={() => paper2DrillPrompt(s.name, s.detail)} label="出题练这部分" />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
