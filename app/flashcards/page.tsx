"use client";

import { useMemo, useState } from "react";
import {
  Button,
  ClientOnly,
  CopyPrompt,
  Empty,
  Field,
  Panel,
  SubjectSelect,
  Textarea,
} from "@/components/ui";
import { SUBJECTS, subjectById } from "@/lib/exam";
import { cardGenPrompt } from "@/lib/prompt";
import { INTERVALS, dueCards, schedule } from "@/lib/srs";
import { newId, update, useData } from "@/lib/store";
import type { Card, SubjectId } from "@/lib/types";

export default function FlashcardsPage() {
  const data = useData();
  const [subjectId, setSubjectId] = useState<SubjectId>("business");
  const [scope, setScope] = useState<SubjectId | "all">("all");
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);

  const queue = useMemo(() => {
    const pool = scope === "all" ? data.cards : data.cards.filter((c) => c.subjectId === scope);
    return dueCards(pool);
  }, [data.cards, scope]);

  const current = queue[0];

  function answer(remembered: boolean) {
    if (!current) return;
    const next = schedule(current, remembered);
    update((d) => ({ ...d, cards: d.cards.map((c) => (c.id === next.id ? next : c)) }));
    setRevealed(false);
  }

  function importDraft() {
    const now = new Date().toISOString();
    const cards: Card[] = draft
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [front, ...rest] = line.split("|");
        return { front: front.trim(), back: rest.join("|").trim() };
      })
      .filter((c) => c.front && c.back)
      .map((c) => ({
        id: newId(),
        subjectId,
        front: c.front,
        back: c.back,
        box: 0,
        // New cards are due immediately — with 11 weeks left, nothing waits.
        dueAt: now,
        lapses: 0,
        createdAt: now,
      }));
    if (!cards.length) return;
    update((d) => ({ ...d, cards: [...d.cards, ...cards] }));
    setDraft("");
  }

  function remove(id: string) {
    update((d) => ({ ...d, cards: d.cards.filter((c) => c.id !== id) }));
  }

  const weakTopics = data.topics
    .filter((t) => t.subjectId === subjectId && t.mastery <= 1 && !t.skipped)
    .map((t) => t.title);

  return (
    <div className="space-y-4">
      <Panel title="今天要背的" subtitle="忘掉的卡直接退回第 0 格，重新走一遍梯子。">
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => setScope("all")}
            className={`rounded-lg border px-2.5 py-1 ${scope === "all" ? "border-accent" : ""}`}
          >
            全部
          </button>
          {SUBJECTS.map((s) => {
            const n = dueCards(data.cards.filter((c) => c.subjectId === s.id)).length;
            return (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className={`rounded-lg border px-2.5 py-1 tnum ${scope === s.id ? "border-accent" : ""}`}
              >
                {s.short} {n}
              </button>
            );
          })}
        </div>

        <ClientOnly>
          {!current ? (
            <Empty>
              {data.cards.length === 0
                ? "还没有卡片。下面批量导入，或让 Claude 帮你生成。"
                : "到期的都背完了。明天再来。"}
            </Empty>
          ) : (
            <div className="rounded-2xl border p-6 text-center">
              <p className="mb-1 text-xs tnum text-muted-foreground">
                剩 {queue.length} 张 · {subjectById(current.subjectId).name} · 第 {current.box} 格
                {current.lapses > 0 && ` · 忘过 ${current.lapses} 次`}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-lg font-medium">{current.front}</p>

              {revealed ? (
                <>
                  <hr className="my-5" />
                  <p className="whitespace-pre-wrap text-base">{current.back}</p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Button variant="danger" onClick={() => answer(false)}>
                      忘了
                    </Button>
                    <Button variant="primary" onClick={() => answer(true)}>
                      记得（{INTERVALS[Math.min(current.box + 1, INTERVALS.length - 1)]} 天后再见）
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="mt-6" onClick={() => setRevealed(true)}>
                  先自己想 —— 想好了点这里
                </Button>
              )}
            </div>
          )}
        </ClientOnly>
      </Panel>

      <Panel title="批量导入" subtitle="一行一张卡，用 | 分隔正面和背面。">
        <Field label="科目">
          <SubjectSelect value={subjectId} onChange={(v) => setSubjectId(v as SubjectId)} />
        </Field>
        <div className="mt-3">
          <Textarea
            rows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"机会成本的定义是什么？|做出选择时，所放弃的其他选项中价值最高的那一个。\n什么是需求定律？|价格上升，需求量下降；价格下降，需求量上升（其他条件不变）。"}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={importDraft} disabled={!draft.trim()}>
            导入
          </Button>
          <CopyPrompt
            build={() =>
              cardGenPrompt(
                subjectId,
                weakTopics.length ? weakTopics : ["（我还没录入考点，请你先问我要考纲）"],
              )
            }
            label={
              weakTopics.length
                ? `让 Claude 按 ${weakTopics.length} 个盲区生成卡片`
                : "让 Claude 帮我生成卡片"
            }
          />
        </div>
      </Panel>

      <Panel title="卡片库" subtitle={`共 ${data.cards.length} 张`}>
        <ClientOnly>
          {data.cards.length === 0 ? (
            <Empty>空的。</Empty>
          ) : (
            <ul className="divide-y">
              {data.cards.map((c) => (
                <li key={c.id} className="group flex items-center gap-3 py-2 text-sm">
                  <span className="w-8 shrink-0 text-xs tnum text-muted-foreground">
                    {subjectById(c.subjectId).short}
                    {c.box}
                  </span>
                  <span className="flex-1 truncate">{c.front}</span>
                  <span className="hidden flex-1 truncate text-muted-foreground sm:inline">
                    {c.back}
                  </span>
                  <button
                    onClick={() => remove(c.id)}
                    className="shrink-0 text-xs text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ClientOnly>
      </Panel>
    </div>
  );
}
