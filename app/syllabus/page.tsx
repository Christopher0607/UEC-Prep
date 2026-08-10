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
import { SUBJECTS, subjectById } from "@/lib/exam";
import { newId, update, useData } from "@/lib/store";
import { ACCOUNTING_SYLLABUS_SEED, ECONOMICS_SYLLABUS_SEED } from "@/lib/syllabi";
import { buildTree, countTopics, isChapterSkipped } from "@/lib/topics";
import type { Chapter } from "@/lib/topics";
import type { Mastery, SubjectId, Topic } from "@/lib/types";

/** Syllabi already transcribed from the student's own textbooks and teachers. */
const SEEDS: { subject: SubjectId; label: string; data: { section: string; title: string }[] }[] = [
  { subject: "english", label: "英文考纲", data: ENGLISH_SYLLABUS_SEED },
  { subject: "chinese", label: "华文考纲", data: CHINESE_SYLLABUS_SEED },
  { subject: "accounting", label: "会计目录", data: ACCOUNTING_SYLLABUS_SEED },
  { subject: "economics", label: "经济目录", data: ECONOMICS_SYLLABUS_SEED },
];

/**
 * Accepts one topic per line, optionally "组 · 章 | 考点". The " · " inside the
 * left half is what builds the collapsible tree; "|" separates location from
 * topic name.
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

function Bar({ topics }: { topics: Topic[] }) {
  const active = topics.filter((t) => !t.skipped);
  if (!active.length) return null;
  return (
    <div className="flex h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-2">
      {[0, 1, 2, 3].map((level) => {
        const n = active.filter((t) => t.mastery === level).length;
        if (!n) return null;
        return (
          <div
            key={level}
            className={["bg-danger", "bg-warn", "bg-accent", "bg-ok"][level]}
            style={{ width: `${(n / active.length) * 100}%` }}
          />
        );
      })}
    </div>
  );
}

export default function SyllabusPage() {
  const data = useData();
  const [subjectId, setSubjectId] = useState<SubjectId>("accounting");
  const [draft, setDraft] = useState("");
  const [weakOnly, setWeakOnly] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());

  const topics = useMemo(
    () => data.topics.filter((t) => t.subjectId === subjectId),
    [data.topics, subjectId],
  );

  const visible = useMemo(() => {
    let list = topics;
    if (!showSkipped) list = list.filter((t) => !t.skipped);
    if (weakOnly) list = list.filter((t) => t.mastery <= 1 && !t.skipped);
    return list;
  }, [topics, weakOnly, showSkipped]);

  const tree = useMemo(() => buildTree(visible), [visible]);
  const counts = countTopics(topics);

  // Filtering already narrowed things down, so keep everything open — otherwise
  // you filter to your blind spots and then have to click through to see them.
  const forceOpen = weakOnly;

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function patchTopics(ids: string[], changes: Partial<Topic>) {
    const idSet = new Set(ids);
    update((d) => ({
      ...d,
      topics: d.topics.map((t) =>
        idSet.has(t.id) ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }

  function removeTopic(id: string) {
    update((d) => ({ ...d, topics: d.topics.filter((t) => t.id !== id) }));
  }

  function toggleChapterSkip(chapter: Chapter) {
    const skip = !isChapterSkipped(chapter);
    patchTopics(
      chapter.topics.map((t) => t.id),
      { skipped: skip },
    );
  }

  function loadSeed(subject: SubjectId, seed: { section: string; title: string }[]) {
    setSubjectId(subject);
    setDraft(seed.map((t) => `${t.section} | ${t.title}`).join("\n"));
  }

  return (
    <div className="space-y-4">
      <Panel
        title="考点覆盖表"
        subtitle="7 个 A1 的本质不是某科特别强，而是没有一个盲区。掌握度 3 才算安全。不用复习的整章跳过，别让它一直挂在总数里。"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Field label="科目">
            <SubjectSelect value={subjectId} onChange={(v) => setSubjectId(v as SubjectId)} />
          </Field>
          <Button variant={weakOnly ? "primary" : "default"} onClick={() => setWeakOnly((v) => !v)}>
            {weakOnly ? "显示全部" : "只看盲区"}
          </Button>
          <Button
            variant={showSkipped ? "primary" : "default"}
            onClick={() => setShowSkipped((v) => !v)}
          >
            {showSkipped ? "隐藏已跳过" : `已跳过 ${counts.skipped}`}
          </Button>
        </div>

        <ClientOnly>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {SUBJECTS.map((s) => {
              const c = countTopics(data.topics.filter((t) => t.subjectId === s.id));
              return (
                <button
                  key={s.id}
                  onClick={() => setSubjectId(s.id)}
                  className={`rounded-lg border px-2.5 py-1 tnum transition ${
                    s.id === subjectId ? "border-accent" : "hover:bg-surface-2"
                  }`}
                >
                  {s.short} {c.mastered}/{c.total}
                </button>
              );
            })}
          </div>
        </ClientOnly>
      </Panel>

      <Panel
        title={`${subjectById(subjectId).name} · 考点`}
        subtitle={
          counts.total || counts.skipped
            ? `熟练 ${counts.mastered} / ${counts.total}` +
              (counts.weak ? ` · 盲区 ${counts.weak}` : "") +
              (counts.skipped ? ` · 已跳过 ${counts.skipped}` : "")
            : undefined
        }
      >
        <ClientOnly>
          {topics.length === 0 ? (
            <Empty>还没录入考点。下面一键载入，或把课本目录贴进来。</Empty>
          ) : tree.length === 0 ? (
            <Empty>{weakOnly ? "这一科没有盲区了。" : "没有可显示的考点。"}</Empty>
          ) : (
            <div className="space-y-2">
              {tree.map((group) => {
                const groupOpen = forceOpen || open.has(group.key);
                return (
                  <div key={group.key} className="overflow-hidden rounded-xl border">
                    <button
                      onClick={() => toggle(group.key)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-surface-2"
                    >
                      <span className="w-3 shrink-0 text-muted-foreground">
                        {groupOpen ? "▾" : "▸"}
                      </span>
                      <span className="flex-1 font-semibold">{group.name}</span>
                      <Bar topics={group.chapters.flatMap((c) => c.topics)} />
                      <span className="shrink-0 text-xs tnum text-muted-foreground">
                        {group.counts.mastered}/{group.counts.total}
                      </span>
                    </button>

                    {groupOpen && (
                      <div className="border-t">
                        {group.chapters.map((chapter) => {
                          const chapterOpen = forceOpen || open.has(chapter.key);
                          const skipped = isChapterSkipped(chapter);
                          return (
                            <div key={chapter.key} className="border-b last:border-b-0">
                              <div
                                className={`flex items-center gap-2 pl-6 pr-3 ${skipped ? "opacity-45" : ""}`}
                              >
                                <button
                                  onClick={() => toggle(chapter.key)}
                                  className="flex flex-1 items-center gap-3 py-2 text-left"
                                >
                                  <span className="w-3 shrink-0 text-xs text-muted-foreground">
                                    {chapterOpen ? "▾" : "▸"}
                                  </span>
                                  <span className="flex-1 text-sm">{chapter.name}</span>
                                  <Bar topics={chapter.topics} />
                                  <span className="shrink-0 text-xs tnum text-muted-foreground">
                                    {skipped
                                      ? `跳过 ${chapter.topics.length}`
                                      : `${chapter.counts.mastered}/${chapter.counts.total}`}
                                  </span>
                                </button>
                                <button
                                  onClick={() => toggleChapterSkip(chapter)}
                                  className="shrink-0 rounded-md border px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
                                >
                                  {skipped ? "恢复" : "整章跳过"}
                                </button>
                              </div>

                              {chapterOpen && (
                                <ul className="space-y-1 py-1 pl-10 pr-3">
                                  {chapter.topics.map((topic) => (
                                    <li
                                      key={topic.id}
                                      className={`group flex items-center gap-3 rounded-lg border px-3 py-2 ${
                                        topic.skipped ? "opacity-45" : ""
                                      }`}
                                    >
                                      <MasteryPicker
                                        value={topic.mastery}
                                        onChange={(m) => patchTopics([topic.id], { mastery: m })}
                                      />
                                      <span className="flex-1 text-sm">{topic.title}</span>
                                      <span className="hidden shrink-0 text-xs text-muted-foreground lg:inline">
                                        {topic.skipped ? "不用复习" : MASTERY_LABELS[topic.mastery]}
                                      </span>
                                      <button
                                        onClick={() =>
                                          patchTopics([topic.id], { skipped: !topic.skipped })
                                        }
                                        className="shrink-0 text-xs text-muted-foreground opacity-0 transition hover:text-foreground group-hover:opacity-100"
                                      >
                                        {topic.skipped ? "恢复" : "跳过"}
                                      </button>
                                      <button
                                        onClick={() => removeTopic(topic.id)}
                                        className="shrink-0 text-xs text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100"
                                      >
                                        删除
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ClientOnly>
      </Panel>

      <Panel title="批量录入" subtitle="一行一个考点，写「组 · 章 | 考点」。中间的「 · 」就是折叠层级的分界。">
        <Textarea
          rows={6}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={"Book 1 · 5 Double entry bookkeeping | 5.1 双式簿记概念\n上册 · 第3章 弹性理论 | 3.2 需求的价格弹性"}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              const parsed = parseTopics(draft, subjectId);
              if (!parsed.length) return;
              update((d) => ({ ...d, topics: [...d.topics, ...parsed] }));
              setDraft("");
            }}
            disabled={!draft.trim()}
          >
            导入到{subjectById(subjectId).name}
          </Button>
          {SEEDS.map((seed) => (
            <Button key={seed.subject} onClick={() => loadSeed(seed.subject, seed.data)}>
              载入{seed.label}（{seed.data.length}）
            </Button>
          ))}
          <span className="text-xs text-muted-foreground">
            数学、高数、商业：把课本目录发给 Claude，让它整理成这个格式，再贴回来。
          </span>
        </div>
      </Panel>
    </div>
  );
}
