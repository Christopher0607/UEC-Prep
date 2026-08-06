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
  SubjectSelect,
  Textarea,
} from "@/components/ui";
import { A1_THRESHOLD, SUBJECTS } from "@/lib/exam";
import { gradePrompt } from "@/lib/prompt";
import { newId, update, useData } from "@/lib/store";
import type { PaperAttempt, SubjectId } from "@/lib/types";

const EMPTY = {
  subjectId: "advmath" as SubjectId,
  label: "",
  score: "",
  total: "100",
  minutesTaken: "",
  minutesAllowed: "",
  lostToConcept: "",
  lostToMethod: "",
  lostToCareless: "",
  notes: "",
};

function num(v: string): number | undefined {
  const n = Number(v);
  return v.trim() === "" || Number.isNaN(n) ? undefined : n;
}

export default function PapersPage() {
  const data = useData();
  const [form, setForm] = useState(EMPTY);
  const [gradeSubject, setGradeSubject] = useState<SubjectId>("advmath");
  const [gradeLabel, setGradeLabel] = useState("");

  const bySubject = useMemo(() => {
    return SUBJECTS.map((s) => ({
      subject: s,
      attempts: data.papers
        .filter((p) => p.subjectId === s.id)
        .sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
    })).filter((g) => g.attempts.length > 0);
  }, [data.papers]);

  function add() {
    const score = num(form.score);
    const total = num(form.total);
    if (score === undefined || total === undefined || total <= 0) return;
    const attempt: PaperAttempt = {
      id: newId(),
      subjectId: form.subjectId,
      label: form.label.trim() || "未命名",
      score,
      total,
      minutesTaken: num(form.minutesTaken),
      minutesAllowed: num(form.minutesAllowed),
      lostToConcept: num(form.lostToConcept),
      lostToMethod: num(form.lostToMethod),
      lostToCareless: num(form.lostToCareless),
      notes: form.notes.trim() || undefined,
      takenAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, papers: [...d.papers, attempt] }));
    setForm({ ...EMPTY, subjectId: form.subjectId });
  }

  function remove(id: string) {
    update((d) => ({ ...d, papers: d.papers.filter((p) => p.id !== id) }));
  }

  return (
    <div className="space-y-4">
      <Panel
        title="批一份卷"
        subtitle="做完限时真题，拍照发给 Claude 严格批 —— 步骤分要抠出来，那才是 A1 和 A2 的差距。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="科目">
            <SubjectSelect value={gradeSubject} onChange={(v) => setGradeSubject(v as SubjectId)} />
          </Field>
          <Field label="试卷">
            <Input
              value={gradeLabel}
              onChange={(e) => setGradeLabel(e.target.value)}
              placeholder="2023 高数 Paper 1"
            />
          </Field>
        </div>
        <div className="mt-3">
          <CopyPrompt
            build={() => gradePrompt(gradeSubject, gradeLabel || "（我马上说是哪一份）")}
            label="复制批阅提问"
          />
        </div>
      </Panel>

      <Panel title="记一次成绩" subtitle="限时、闭卷做的才算数。含作业分的校内成绩会骗你。">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="科目">
            <SubjectSelect
              value={form.subjectId}
              onChange={(v) => setForm({ ...form, subjectId: v as SubjectId })}
            />
          </Field>
          <Field label="试卷">
            <Input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="2023 Paper 1"
            />
          </Field>
          <Field label="得分">
            <Input
              inputMode="numeric"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
            />
          </Field>
          <Field label="满分">
            <Input
              inputMode="numeric"
              value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
            />
          </Field>
          <Field label="实际用时（分钟）">
            <Input
              inputMode="numeric"
              value={form.minutesTaken}
              onChange={(e) => setForm({ ...form, minutesTaken: e.target.value })}
            />
          </Field>
          <Field label="规定时间（分钟）">
            <Input
              inputMode="numeric"
              value={form.minutesAllowed}
              onChange={(e) => setForm({ ...form, minutesAllowed: e.target.value })}
            />
          </Field>
        </div>

        <p className="mt-4 mb-2 text-sm font-medium">丢的分，按原因拆开</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="概念不懂">
            <Input
              inputMode="numeric"
              value={form.lostToConcept}
              onChange={(e) => setForm({ ...form, lostToConcept: e.target.value })}
            />
          </Field>
          <Field label="套路没背熟">
            <Input
              inputMode="numeric"
              value={form.lostToMethod}
              onChange={(e) => setForm({ ...form, lostToMethod: e.target.value })}
            />
          </Field>
          <Field label="粗心">
            <Input
              inputMode="numeric"
              value={form.lostToCareless}
              onChange={(e) => setForm({ ...form, lostToCareless: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-3">
          <Field label="备注">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Button variant="primary" onClick={add} disabled={!form.score.trim()}>
            记下来
          </Button>
        </div>
      </Panel>

      <Panel title="成绩走势">
        <ClientOnly>
          {bySubject.length === 0 ? (
            <Empty>还没有真题记录。诊断期的任务就是给每一科刷出第一个真实分数。</Empty>
          ) : (
            <div className="space-y-5">
              {bySubject.map(({ subject, attempts }) => {
                const pcts = attempts.map((a) => Math.round((a.score / a.total) * 100));
                const latest = pcts[pcts.length - 1];
                const gap = Math.max(0, A1_THRESHOLD - latest);
                return (
                  <div key={subject.id}>
                    <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
                      <h3 className="font-semibold">{subject.name}</h3>
                      <span className="text-sm tnum text-muted-foreground">
                        最近 {latest}%
                        {gap === 0 ? (
                          <span className="text-ok"> · 已达 A1</span>
                        ) : (
                          <span> · 距 A1 差 {gap} 分</span>
                        )}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {attempts.map((a, i) => {
                        const pct = pcts[i];
                        const overtime =
                          a.minutesTaken && a.minutesAllowed && a.minutesTaken > a.minutesAllowed;
                        return (
                          <li key={a.id} className="group flex items-center gap-3 text-sm">
                            <span className="w-32 shrink-0 truncate text-muted-foreground">
                              {a.label}
                            </span>
                            <div className="relative h-5 flex-1 overflow-hidden rounded bg-surface-2">
                              <div
                                className={`h-full ${pct >= A1_THRESHOLD ? "bg-ok" : pct >= 70 ? "bg-accent" : pct >= 55 ? "bg-warn" : "bg-danger"}`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                              <div
                                className="absolute inset-y-0 w-px bg-foreground/40"
                                style={{ left: `${A1_THRESHOLD}%` }}
                                title="A1 线"
                              />
                            </div>
                            <span className="w-24 shrink-0 text-right tnum text-xs text-muted-foreground">
                              {a.score}/{a.total} · {pct}%
                              {overtime && <span className="text-danger"> 超时</span>}
                            </span>
                            <button
                              onClick={() => remove(a.id)}
                              className="shrink-0 text-xs text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100"
                            >
                              删除
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </ClientOnly>
      </Panel>
    </div>
  );
}
