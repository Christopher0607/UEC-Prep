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
  SubjectSelect,
  Textarea,
} from "@/components/ui";
import { SUBJECTS, subjectById } from "@/lib/exam";
import { compressImage } from "@/lib/image";
import { hintPrompt, mistakePrompt } from "@/lib/prompt";
import { newId, update, useData } from "@/lib/store";
import type { Mistake, MistakeCause, SubjectId } from "@/lib/types";

const CAUSES: { value: MistakeCause; label: string; fix: string }[] = [
  { value: "concept", label: "概念不懂", fix: "回去补概念，做题没用" },
  { value: "method", label: "套路没背熟", fix: "整理解题模板，反复练同类" },
  { value: "careless", label: "粗心 / 手滑", fix: "改答题习惯，练检查流程" },
  { value: "time", label: "时间不够", fix: "练限时，调整答题顺序" },
];

const EMPTY_FORM = {
  subjectId: "english" as SubjectId,
  topicId: "",
  question: "",
  myWork: "",
  stuckAt: "",
  cause: "concept" as MistakeCause,
  source: "",
  photo: "" as string,
};

export default function MistakesPage() {
  const data = useData();
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState<SubjectId | "all">("all");
  const [showResolved, setShowResolved] = useState(false);

  // 拍照解题 — deliberately separate from the mistake log: this is for a question
  // you are still fighting, and it asks Claude for a nudge, never the answer.
  const [hintSubject, setHintSubject] = useState<SubjectId>("advmath");
  const [hintQuestion, setHintQuestion] = useState("");

  const topicsForForm = data.topics.filter((t) => t.subjectId === form.subjectId);

  const visible = useMemo(() => {
    return data.mistakes
      .filter((m) => (filter === "all" ? true : m.subjectId === filter))
      .filter((m) => (showResolved ? true : !m.resolved))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data.mistakes, filter, showResolved]);

  function add() {
    if (!form.question.trim() && !form.photo) return;
    const mistake: Mistake = {
      id: newId(),
      subjectId: form.subjectId,
      topicId: form.topicId || null,
      question: form.question.trim(),
      myWork: form.myWork.trim(),
      stuckAt: form.stuckAt.trim(),
      cause: form.cause,
      photo: form.photo || undefined,
      source: form.source.trim() || undefined,
      resolved: false,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, mistakes: [mistake, ...d.mistakes] }));
    setForm({ ...EMPTY_FORM, subjectId: form.subjectId });
  }

  function patch(id: string, changes: Partial<Mistake>) {
    update((d) => ({
      ...d,
      mistakes: d.mistakes.map((m) => (m.id === id ? { ...m, ...changes } : m)),
    }));
  }

  function remove(id: string) {
    update((d) => ({ ...d, mistakes: d.mistakes.filter((m) => m.id !== id) }));
  }

  async function pickPhoto(file: File | undefined, set: (v: string) => void) {
    if (!file) return;
    try {
      set(await compressImage(file));
    } catch {
      alert("这张图片读不了，换一张试试。");
    }
  }

  return (
    <div className="space-y-4">
      <Panel
        title="卡住了？先要思路"
        subtitle="这里只会给你考点、第一步和踩坑提醒 —— 不给答案。最后一步必须你自己走完。"
      >
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <Field label="科目">
            <SubjectSelect value={hintSubject} onChange={(v) => setHintSubject(v as SubjectId)} />
          </Field>
          <Field label="题目" hint="打字，或留空直接把照片发到对话里">
            <Textarea
              rows={3}
              value={hintQuestion}
              onChange={(e) => setHintQuestion(e.target.value)}
              placeholder="Find dy/dx when x³ + y³ = 6xy"
            />
          </Field>
        </div>
        <div className="mt-3">
          <CopyPrompt
            build={() => hintPrompt(hintSubject, hintQuestion)}
            label="复制「只给思路」的提问"
          />
        </div>
      </Panel>

      <Panel title="记一条错题" subtitle="关键不是抄答案，是写清楚你卡在哪一步。">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="科目">
            <SubjectSelect
              value={form.subjectId}
              onChange={(v) => setForm({ ...form, subjectId: v as SubjectId, topicId: "" })}
            />
          </Field>
          <Field label="考点">
            <Select
              value={form.topicId}
              onChange={(e) => setForm({ ...form, topicId: e.target.value })}
            >
              <option value="">（不确定 / 未录入）</option>
              {topicsForForm.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.section} — {t.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-3 space-y-3">
          <Field label="题目">
            <Textarea
              rows={3}
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
          </Field>
          <Field label="我的完整解题过程" hint="原样写，包括错的部分 —— 诊断全靠这个">
            <Textarea
              rows={4}
              value={form.myWork}
              onChange={(e) => setForm({ ...form, myWork: e.target.value })}
            />
          </Field>
          <Field label="我卡在哪一步">
            <Input
              value={form.stuckAt}
              onChange={(e) => setForm({ ...form, stuckAt: e.target.value })}
              placeholder="两边同时对 x 求导之后，不知道 y³ 那项怎么处理"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="归因">
              <Select
                value={form.cause}
                onChange={(e) => setForm({ ...form, cause: e.target.value as MistakeCause })}
              >
                {CAUSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — {c.fix}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="来源">
              <Input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="2023 Paper 1 Q7"
              />
            </Field>
          </div>

          <Field label="题目照片" hint="自动压缩后存在浏览器本地">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => pickPhoto(e.target.files?.[0], (v) => setForm({ ...form, photo: v }))}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:bg-surface file:px-3 file:py-1.5 file:text-sm"
            />
          </Field>
          {form.photo && (
            // eslint-disable-next-line @next/next/no-img-element -- data: URL from localStorage, next/image adds nothing here
            <img src={form.photo} alt="题目预览" className="max-h-48 rounded-lg border" />
          )}
        </div>

        <div className="mt-4">
          <Button variant="primary" onClick={add} disabled={!form.question.trim() && !form.photo}>
            记下来
          </Button>
        </div>
      </Panel>

      <Panel
        title="错题本"
        right={
          <div className="flex gap-2">
            <Button variant={showResolved ? "primary" : "default"} onClick={() => setShowResolved((v) => !v)}>
              {showResolved ? "含已解决" : "只看未解决"}
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg border px-2.5 py-1 ${filter === "all" ? "border-accent" : ""}`}
          >
            全部
          </button>
          {SUBJECTS.map((s) => {
            const n = data.mistakes.filter((m) => m.subjectId === s.id && !m.resolved).length;
            return (
              <button
                key={s.id}
                onClick={() => setFilter(s.id)}
                className={`rounded-lg border px-2.5 py-1 tnum ${filter === s.id ? "border-accent" : ""}`}
              >
                {s.short} {n}
              </button>
            );
          })}
        </div>

        <ClientOnly>
          {visible.length === 0 ? (
            <Empty>还没有错题。每做完一套卷，把错的都记进来。</Empty>
          ) : (
            <ul className="space-y-3">
              {visible.map((m) => {
                const topic = data.topics.find((t) => t.id === m.topicId);
                const cause = CAUSES.find((c) => c.value === m.cause);
                return (
                  <li key={m.id} className={`rounded-xl border p-3 ${m.resolved ? "opacity-50" : ""}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-surface-2 px-2 py-0.5 font-medium text-foreground">
                        {subjectById(m.subjectId).name}
                      </span>
                      {topic && <span>{topic.section} — {topic.title}</span>}
                      {m.source && <span>{m.source}</span>}
                      <span className="text-warn">{cause?.label}</span>
                      {m.reviewCount > 0 && <span className="tnum">复习过 {m.reviewCount} 次</span>}
                    </div>

                    <p className="whitespace-pre-wrap text-sm">{m.question}</p>
                    {m.stuckAt && (
                      <p className="mt-2 border-l-2 border-warn pl-3 text-sm text-muted-foreground">
                        卡在：{m.stuckAt}
                      </p>
                    )}
                    {m.photo && (
                      // eslint-disable-next-line @next/next/no-img-element -- data: URL from localStorage
                      <img src={m.photo} alt="题目" className="mt-2 max-h-56 rounded-lg border" />
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <CopyPrompt build={() => mistakePrompt(m, topic)} />
                      <Button
                        onClick={() =>
                          patch(m.id, {
                            reviewCount: m.reviewCount + 1,
                            lastReviewedAt: new Date().toISOString(),
                          })
                        }
                      >
                        又复习了一次
                      </Button>
                      <Button onClick={() => patch(m.id, { resolved: !m.resolved })}>
                        {m.resolved ? "重新打开" : "标记已解决"}
                      </Button>
                      <Button variant="danger" onClick={() => remove(m.id)}>
                        删除
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ClientOnly>
      </Panel>
    </div>
  );
}
