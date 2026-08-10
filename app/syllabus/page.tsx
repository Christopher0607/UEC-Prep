"use client";

import { useMemo, useState } from "react";
import {
  Button,
  ClientOnly,
  Empty,
  Field,
  MASTERY_LABELS,
  MasteryPicker,
  Panel,
  SubjectSelect,
  Textarea,
} from "@/components/ui";
import { CHINESE_SYLLABUS_SEED } from "@/lib/chinese";
import { ENGLISH_SYLLABUS_SEED } from "@/lib/english";
import { ACCOUNTING_SYLLABUS_SEED, ECONOMICS_SYLLABUS_SEED } from "@/lib/syllabi";
import { SUBJECTS, subjectById } from "@/lib/exam";
import { newId, update, useData } from "@/lib/store";
import type { Mastery, SubjectId, Topic } from "@/lib/types";

/** Syllabi already transcribed from the student's own textbooks and teachers. */
const SEEDS: { subject: SubjectId; label: string; data: { section: string; title: string }[] }[] = [
  { subject: "english", label: "英文考纲", data: ENGLISH_SYLLABUS_SEED },
  { subject: "chinese", label: "华文考纲", data: CHINESE_SYLLABUS_SEED },
  { subject: "accounting", label: "会计目录", data: ACCOUNTING_SYLLABUS_SEED },
  { subject: "economics", label: "经济目录", data: ECONOMICS_SYLLABUS_SEED },
];

/**
 * Accepts one topic per line, optionally "章节 | 考点". Anything the student can
 * paste out of the 考纲 PDF works — the point is to get the real syllabus in
 * without retyping it, since guessed topics are worse than none.
 */
function parseTopics(text: string, subjectId: SubjectId): Topic[] {
  const now = new Date().toISOString();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split("|").map((p) => p.trim());
      return {
        id: newId(),
        subjectId,
        section: b ? a : "未分类",
        title: b ?? a,
        mastery: 0 as Mastery,
        frequency: 0,
        updatedAt: now,
      };
    });
}

export default function SyllabusPage() {
  const data = useData();
  const [subjectId, setSubjectId] = useState<SubjectId>("english");
  const [draft, setDraft] = useState("");
  const [weakOnly, setWeakOnly] = useState(false);

  const topics = useMemo(
    () => data.topics.filter((t) => t.subjectId === subjectId),
    [data.topics, subjectId],
  );

  const sections = useMemo(() => {
    const visible = weakOnly ? topics.filter((t) => t.mastery <= 1) : topics;
    const map = new Map<string, Topic[]>();
    for (const t of visible) {
      const list = map.get(t.section) ?? [];
      list.push(t);
      map.set(t.section, list);
    }
    return [...map.entries()];
  }, [topics, weakOnly]);

  function setMastery(id: string, mastery: Mastery) {
    update((d) => ({
      ...d,
      topics: d.topics.map((t) =>
        t.id === id ? { ...t, mastery, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }

  function removeTopic(id: string) {
    update((d) => ({ ...d, topics: d.topics.filter((t) => t.id !== id) }));
  }

  function importDraft() {
    const parsed = parseTopics(draft, subjectId);
    if (!parsed.length) return;
    update((d) => ({ ...d, topics: [...d.topics, ...parsed] }));
    setDraft("");
  }

  /** English and Chinese are pre-filled from the student's own teachers, not from guesswork. */
  function loadSeed(subject: SubjectId, seed: { section: string; title: string }[]) {
    setSubjectId(subject);
    setDraft(seed.map((t) => `${t.section} | ${t.title}`).join("\n"));
  }

  const mastered = topics.filter((t) => t.mastery === 3).length;

  return (
    <div className="space-y-4">
      <Panel
        title="考点覆盖表"
        subtitle="7 个 A1 的本质不是某科特别强，而是没有一个盲区。掌握度 3 才算安全。"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="科目">
            <SubjectSelect value={subjectId} onChange={(v) => setSubjectId(v as SubjectId)} />
          </Field>
          <Button variant={weakOnly ? "primary" : "default"} onClick={() => setWeakOnly((v) => !v)}>
            {weakOnly ? "显示全部" : "只看盲区"}
          </Button>
        </div>

        <ClientOnly>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {SUBJECTS.map((s) => {
              const ts = data.topics.filter((t) => t.subjectId === s.id);
              const done = ts.filter((t) => t.mastery === 3).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setSubjectId(s.id)}
                  className={`rounded-lg border px-2.5 py-1 tnum transition ${
                    s.id === subjectId ? "border-accent" : "hover:bg-surface-2"
                  }`}
                >
                  {s.short} {done}/{ts.length}
                </button>
              );
            })}
          </div>
        </ClientOnly>
      </Panel>

      <Panel
        title={`${subjectById(subjectId).name} · 考点`}
        subtitle={topics.length ? `熟练 ${mastered} / ${topics.length}` : undefined}
      >
        <ClientOnly>
          {topics.length === 0 ? (
            <Empty>
              还没录入考点。把官方《统一考试标准课程纲要》里这一科的目录贴到下面 —— 一行一个考点。
            </Empty>
          ) : sections.length === 0 ? (
            <Empty>这一科没有盲区了。</Empty>
          ) : (
            <div className="space-y-5">
              {sections.map(([section, list]) => (
                <div key={section}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{section}</h3>
                  <ul className="space-y-1">
                    {list.map((topic) => (
                      <li
                        key={topic.id}
                        className="group flex items-center gap-3 rounded-lg border px-3 py-2"
                      >
                        <MasteryPicker
                          value={topic.mastery}
                          onChange={(m) => setMastery(topic.id, m)}
                        />
                        <span className="flex-1 text-sm">{topic.title}</span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {MASTERY_LABELS[topic.mastery]}
                        </span>
                        <button
                          onClick={() => removeTopic(topic.id)}
                          className="text-xs text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100"
                          aria-label="删除考点"
                        >
                          删除
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </ClientOnly>
      </Panel>

      <Panel title="批量录入" subtitle="一行一个考点。想分章节就写「章节 | 考点」。">
        <Textarea
          rows={7}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={"微积分 | 链式法则\n微积分 | 隐函数微分\n三角函数 | 和差化积"}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={importDraft} disabled={!draft.trim()}>
            导入到{subjectById(subjectId).name}
          </Button>
          {SEEDS.map((seed) => (
            <Button key={seed.subject} onClick={() => loadSeed(seed.subject, seed.data)}>
              载入{seed.label}（{seed.data.length}）
            </Button>
          ))}
          <span className="text-xs text-muted-foreground">
            数学、高数、商业：把考纲发给 Claude，让它整理成这个格式，再贴回来。
          </span>
        </div>
      </Panel>
    </div>
  );
}
