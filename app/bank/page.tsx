"use client";

import { useMemo, useState } from "react";
import PaperPages from "@/components/PaperPages";
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
import { QUESTION_TYPES, chapterFrequency, paperLabel, parseQuestions, typeName } from "@/lib/bank";
import { subjectById } from "@/lib/exam";
import { putImage } from "@/lib/blobstore";
import { PAPER_EDGE, PAPER_QUALITY, compressImage } from "@/lib/image";
import { gradePrompt } from "@/lib/prompt";
import { newId, update, useData } from "@/lib/store";
import type { BankQuestion, PastPaper, SubjectId } from "@/lib/types";

const PAPER_NAMES = ["试卷一", "试卷二", "单卷"];

export default function BankPage() {
  const data = useData();
  const [subjectId, setSubjectId] = useState<SubjectId>("economics");
  const [year, setYear] = useState("");
  const [paperName, setPaperName] = useState(PAPER_NAMES[0]);
  const [indexDraft, setIndexDraft] = useState("");
  const [busy, setBusy] = useState("");

  const papers = useMemo(
    () =>
      data.bank
        .filter((p) => p.subjectId === subjectId)
        .sort((a, b) => b.year.localeCompare(a.year) || a.paper.localeCompare(b.paper)),
    [data.bank, subjectId],
  );

  const frequency = useMemo(
    () => chapterFrequency(data.bank, subjectId),
    [data.bank, subjectId],
  );

  /** Chapters already in the coverage table — the dropdown for tagging questions. */
  const chapters = useMemo(() => {
    const set = new Set(
      data.topics.filter((t) => t.subjectId === subjectId).map((t) => t.section),
    );
    return [...set].sort();
  }, [data.topics, subjectId]);

  function addPaper() {
    if (!year.trim()) return;
    const paper: PastPaper = {
      id: newId(),
      subjectId,
      year: year.trim(),
      paper: paperName,
      pageIds: [],
      questions: parseQuestions(indexDraft),
      createdAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, bank: [...d.bank, paper] }));
    setYear("");
    setIndexDraft("");
  }

  function patchPaper(id: string, changes: Partial<PastPaper>) {
    update((d) => ({ ...d, bank: d.bank.map((p) => (p.id === id ? { ...p, ...changes } : p)) }));
  }

  function patchQuestion(paperId: string, qId: string, changes: Partial<BankQuestion>) {
    update((d) => ({
      ...d,
      bank: d.bank.map((p) =>
        p.id === paperId
          ? { ...p, questions: p.questions.map((q) => (q.id === qId ? { ...q, ...changes } : q)) }
          : p,
      ),
    }));
  }

  function removePaper(id: string) {
    if (!confirm("删除这份卷子和它的所有照片？")) return;
    update((d) => ({ ...d, bank: d.bank.filter((p) => p.id !== id) }));
  }

  /** Scans go to IndexedDB; only their ids reach app state. */
  async function uploadPages(paper: PastPaper, files: FileList | null) {
    if (!files?.length) return;
    setBusy(paper.id);
    const ids: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const dataUrl = await compressImage(file, PAPER_EDGE, PAPER_QUALITY);
        const id = newId();
        await putImage(id, dataUrl);
        ids.push(id);
      } catch {
        alert(`「${file.name}」读不了，跳过。`);
      }
    }
    if (ids.length) patchPaper(paper.id, { pageIds: [...paper.pageIds, ...ids] });
    setBusy("");
  }

  return (
    <div className="space-y-4">
      <Panel
        title="历年考题题库"
        subtitle="卷面照片存在浏览器的 IndexedDB 里（不是 localStorage，所以没有 5MB 上限）。真正值钱的是逐题索引 —— 它把「我有八年的卷子」变成「第几章考得最多」。"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
          <Field label="科目">
            <SubjectSelect value={subjectId} onChange={(v) => setSubjectId(v as SubjectId)} />
          </Field>
          <Field label="年份">
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2023" />
          </Field>
          <Field label="卷号">
            <Select value={paperName} onChange={(e) => setPaperName(e.target.value)}>
              {PAPER_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-3">
          <Field
            label="逐题索引（可留空，之后再补）"
            hint="一行一题：题号 | 题型 | 分数 | 章节。只写题号也行，默认当选择题。"
          >
            <Textarea
              rows={5}
              value={indexDraft}
              onChange={(e) => setIndexDraft(e.target.value)}
              placeholder={"1 | 选择题 | 1 | 上册 · 第2章 需求与供给\n2 | 选择题 | 1 | 上册 · 第3章 弹性理论\n5(a) | 短答题 | 5 | 下册 · 第4章 失业与通货膨胀\n7 | 长答题 | 10 | 下册 · 第7章 财政政策"}
            />
          </Field>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={addPaper} disabled={!year.trim()}>
            加入题库
          </Button>
          <span className="text-xs text-muted-foreground">
            加进来之后再上传卷面照片，一次可以选多张。
          </span>
        </div>
      </Panel>

      <Panel
        title="出题频率"
        subtitle="按分数排，不是按题数 —— 十道分散的选择题，比不上一章年年出一道 10 分大题。"
      >
        <ClientOnly>
          {frequency.length === 0 ? (
            <Empty>
              还没有逐题索引。把卷子加进来、给每题标上章节，这张表才有东西 —— 它是决定复习顺序的依据。
            </Empty>
          ) : (
            <ul className="space-y-1.5">
              {frequency.map((f) => (
                <li
                  key={f.chapter}
                  className="flex flex-wrap items-baseline gap-x-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">{f.chapter}</span>
                  <span className="tnum font-semibold text-accent">{f.marks} 分</span>
                  <span className="tnum text-xs text-muted-foreground">{f.count} 题</span>
                  <span className="text-xs text-muted-foreground">
                    出现于 {f.years.join("、")}
                  </span>
                  {f.attempted > 0 && (
                    <span className="tnum text-xs text-muted-foreground">
                      做过 {f.attempted} · 对 {f.correct}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ClientOnly>
      </Panel>

      <Panel title={`${subjectById(subjectId).name} · 卷子`} subtitle={`${papers.length} 份`}>
        <ClientOnly>
          {papers.length === 0 ? (
            <Empty>这一科还没有卷子。</Empty>
          ) : (
            <div className="space-y-4">
              {papers.map((paper) => (
                <div key={paper.id} className="rounded-xl border p-3">
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
                    <h3 className="font-semibold">{paperLabel(paper)}</h3>
                    <span className="text-xs tnum text-muted-foreground">
                      {paper.questions.length} 题 · {paper.pageIds.length} 页
                    </span>
                    <span className="tnum text-xs text-muted-foreground">
                      已做 {paper.questions.filter((q) => q.attempted).length}
                    </span>
                  </div>

                  <PaperPages
                    pageIds={paper.pageIds}
                    onRemove={(id) =>
                      patchPaper(paper.id, {
                        pageIds: paper.pageIds.filter((p) => p !== id),
                      })
                    }
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition hover:bg-surface-2">
                      {busy === paper.id ? "压缩中…" : "上传卷面照片"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => uploadPages(paper, e.target.files)}
                      />
                    </label>
                    <CopyPrompt
                      build={() => gradePrompt(paper.subjectId, paperLabel(paper))}
                      label="复制批阅提问"
                    />
                    <Button variant="danger" onClick={() => removePaper(paper.id)}>
                      删除整份
                    </Button>
                  </div>

                  {paper.questions.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {paper.questions.map((q) => (
                        <li
                          key={q.id}
                          className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-2.5 py-1.5 text-sm ${
                            q.attempted ? "" : "opacity-70"
                          }`}
                        >
                          <span className="w-12 shrink-0 tnum font-medium">{q.number}</span>
                          <span className="w-16 shrink-0 text-xs text-muted-foreground">
                            {typeName(q.type)}
                          </span>
                          <span className="w-10 shrink-0 tnum text-xs text-muted-foreground">
                            {q.marks ?? "—"} 分
                          </span>
                          <Select
                            value={q.chapter}
                            onChange={(e) =>
                              patchQuestion(paper.id, q.id, { chapter: e.target.value })
                            }
                            className="min-w-0 flex-1 !py-1 text-xs"
                          >
                            <option value="">（未标章节）</option>
                            {chapters.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            {q.chapter && !chapters.includes(q.chapter) && (
                              <option value={q.chapter}>{q.chapter}</option>
                            )}
                          </Select>
                          <button
                            onClick={() =>
                              patchQuestion(paper.id, q.id, {
                                attempted: !q.attempted,
                                correct: q.attempted ? undefined : q.correct,
                              })
                            }
                            className={`shrink-0 rounded-md border px-2 py-0.5 text-xs transition ${
                              q.attempted ? "border-accent text-accent" : "text-muted-foreground"
                            }`}
                          >
                            {q.attempted ? "做过" : "没做"}
                          </button>
                          {q.attempted && (
                            <button
                              onClick={() =>
                                patchQuestion(paper.id, q.id, { correct: !q.correct })
                              }
                              className={`shrink-0 rounded-md border px-2 py-0.5 text-xs transition ${
                                q.correct ? "border-ok text-ok" : "border-danger text-danger"
                              }`}
                            >
                              {q.correct ? "对" : "错"}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </ClientOnly>
      </Panel>

      <Panel title="题型说明" subtitle="索引里「题型」那一栏可以写这些名字，也可以写英文 id。">
        <ul className="flex flex-wrap gap-2 text-sm">
          {QUESTION_TYPES.map((t) => (
            <li key={t.id} className="rounded-lg border px-2.5 py-1">
              {t.name}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {t.id}
                {t.defaultMarks ? ` · 默认 ${t.defaultMarks} 分` : ""}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          ⚠️ 照片只存在这台设备上，「备份」页导出的 JSON <strong>不包含照片</strong>（几十 MB 的
          JSON 没法用）。原始试卷请自己另外留一份在电脑或网盘里 —— 这个题库是索引，不是保险箱。
        </p>
      </Panel>
    </div>
  );
}
