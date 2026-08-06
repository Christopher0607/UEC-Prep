"use client";

import { useMemo, useState } from "react";
import {
  ClientOnly,
  CopyPrompt,
  Empty,
  Field,
  MASTERY_LABELS,
  MasteryPicker,
  Panel,
  Select,
  SubjectSelect,
  Textarea,
} from "@/components/ui";
import { subjectById } from "@/lib/exam";
import { feynmanPrompt } from "@/lib/prompt";
import { update, useData } from "@/lib/store";
import type { Mastery, SubjectId } from "@/lib/types";

export default function FeynmanPage() {
  const data = useData();
  const [subjectId, setSubjectId] = useState<SubjectId>("advmath");
  const [topicId, setTopicId] = useState("");
  const [explanation, setExplanation] = useState("");

  const topics = useMemo(
    () => data.topics.filter((t) => t.subjectId === subjectId),
    [data.topics, subjectId],
  );
  const topic = topics.find((t) => t.id === topicId);

  // Anything you have not marked as 熟练 is worth explaining out loud, and the
  // shakiest ones first.
  const suggested = topics
    .filter((t) => t.mastery > 0 && t.mastery < 3)
    .sort((a, b) => a.mastery - b.mastery);

  function setMastery(mastery: Mastery) {
    if (!topic) return;
    update((d) => ({
      ...d,
      topics: d.topics.map((t) =>
        t.id === topic.id ? { ...t, mastery, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }

  return (
    <div className="space-y-4">
      <Panel
        title="反向讲题（费曼）"
        subtitle="讲不下去的地方，就是你的真实漏洞 —— 这种洞自己看书是发现不了的。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="科目">
            <SubjectSelect
              value={subjectId}
              onChange={(v) => {
                setSubjectId(v as SubjectId);
                setTopicId("");
              }}
            />
          </Field>
          <Field label="考点">
            <Select value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              <option value="">（自由发挥 / 考点还没录入）</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.section} — {t.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <ClientOnly>
          {suggested.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-muted-foreground">最该讲的（按掌握度从低到高）：</p>
              <div className="flex flex-wrap gap-2">
                {suggested.slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTopicId(t.id)}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition hover:bg-surface-2 ${
                      t.id === topicId ? "border-accent" : ""
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ClientOnly>

        <div className="mt-4">
          <Field
            label="讲一遍"
            hint="当作在教一个完全没学过的同学。不要抄书上的话 —— 用你自己的话，那才测得出你懂不懂。"
          >
            <Textarea
              rows={10}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder={
                "隐函数微分就是……当 y 没办法单独解出来的时候，我们对等式两边同时对 x 求导。\n因为 y 是 x 的函数，所以对 y 的项求导要再乘上 dy/dx（链式法则）……"
              }
            />
          </Field>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CopyPrompt
            build={() => feynmanPrompt(subjectId, topic?.title ?? "", explanation)}
            label="复制给 Claude 挑漏洞"
          />
          <span className="text-xs text-muted-foreground">
            讲完贴给 Claude，回答完它的追问，再回来更新掌握度。
          </span>
        </div>
      </Panel>

      {topic && (
        <Panel title="讲完了，更新掌握度" subtitle={`${subjectById(subjectId).name} · ${topic.title}`}>
          <div className="flex flex-wrap items-center gap-4">
            <MasteryPicker value={topic.mastery} onChange={setMastery} />
            <span className="text-sm text-muted-foreground">{MASTERY_LABELS[topic.mastery]}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            诚实一点。这张表虚报了，最后骗的是你自己 —— 到 10 月 21 号那天它可帮不了你。
          </p>
        </Panel>
      )}

      {topics.length === 0 && (
        <Empty>
          这一科还没录入考点。先去「考点」页把考纲贴进来，讲题时才知道该讲哪些、还剩哪些没讲。
        </Empty>
      )}
    </div>
  );
}
