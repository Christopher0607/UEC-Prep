"use client";

import Link from "next/link";
import Countdown from "@/components/Countdown";
import { ClientOnly, CopyPrompt, Empty, Panel } from "@/components/ui";
import {
  A1_THRESHOLD,
  DAILY_MINUTES,
  FIRST_EXAM,
  PHASES,
  STUDY_BLOCKS,
  RESULTS_DAY,
  SUBJECTS_BY_DATE,
  daysUntil,
  examDate,
  formatExamDay,
  phaseOn,
  toMyDateString,
} from "@/lib/exam";
import { weeklyReviewPrompt } from "@/lib/prompt";
import { dueCards } from "@/lib/srs";
import { countTopics } from "@/lib/topics";
import { useData } from "@/lib/store";
import type { AppData, SubjectId } from "@/lib/types";

/** Latest timed paper if there is one; otherwise the (inflated) report-card average. */
function currentScore(data: AppData, id: SubjectId) {
  const papers = data.papers
    .filter((p) => p.subjectId === id && p.total > 0)
    .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const latest = papers[papers.length - 1];
  if (latest) {
    return { value: Math.round((latest.score / latest.total) * 100), real: true };
  }
  const baseline = data.baselines[id];
  return baseline === undefined ? null : { value: baseline, real: false };
}

export default function Dashboard() {
  const data = useData();
  const now = new Date();
  const phase = phaseOn(now);
  const today = toMyDateString(now);

  const due = dueCards(data.cards, now);
  const openMistakes = data.mistakes.filter((m) => !m.resolved);

  return (
    <div className="space-y-4">
      <Panel>
        <p className="text-sm font-medium text-muted-foreground">
          距第一场 · 英文（{formatExamDay(SUBJECTS_BY_DATE[0])}）
        </p>
        <ClientOnly>
          <div className="mt-2">
            <Countdown target={FIRST_EXAM} />
          </div>
        </ClientOnly>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>考试周 10/21 – 10/27</span>
          <span>放榜 12/30（暂定）</span>
          <span className="tnum">距放榜 {daysUntil(RESULTS_DAY, now)} 天</span>
        </div>
      </Panel>

      <Panel title="⚠️ 头 48 小时考掉四科">
        <p className="text-sm leading-relaxed text-muted-foreground">
          10/21 考<strong className="text-foreground">英文 + 会计</strong>，10/22 考
          <strong className="text-foreground">华文 + 经济</strong>。这四科
          <strong className="text-foreground">没有临考突击的空间</strong>
          ，必须在 10 月 20 日之前全部就绪。只有数学（10/23）、商业（10/24）、高数（10/27）留了缓冲。
          <br />
          所以复习顺序按<strong className="text-foreground">考试先后</strong>排，不是按科目强弱排。
        </p>
      </Panel>

      {phase && (
        <Panel title={`当前阶段 · ${phase.name}`} subtitle={`${phase.start} → ${phase.end}`}>
          <p className="text-sm leading-relaxed">{phase.goal}</p>
          <ol className="mt-4 space-y-1 text-sm text-muted-foreground">
            {PHASES.map((p) => (
              <li key={p.key} className={p.key === phase.key ? "font-semibold text-foreground" : ""}>
                {p.key === phase.key ? "▸ " : "　"}
                {p.name}
                <span className="ml-2 tnum text-xs">
                  {p.start.slice(5)} – {p.end.slice(5)}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <Panel
        title="每天的时间块"
        subtitle={`合计约 ${Math.round((DAILY_MINUTES / 60) * 10) / 10} 小时 · 到第一场约 ${Math.round((daysUntil(FIRST_EXAM, now) * DAILY_MINUTES) / 60)} 小时`}
      >
        <ul className="space-y-2">
          {STUDY_BLOCKS.map((block) => (
            <li key={block.label} className="flex flex-wrap items-baseline gap-x-3 rounded-xl border p-3">
              <span className="w-24 shrink-0 font-semibold tnum">{block.label}</span>
              <span className="text-sm font-medium">{block.bestFor}</span>
              <span className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1">
                {block.why}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          把任务配对块，是总量固定时唯一能提效的地方 —— 3 小时的块拿去背单词，等于把最贵的时间浪费掉。
        </p>
      </Panel>

      <Panel
        title="今日"
        subtitle={today}
        right={
          <CopyPrompt build={() => weeklyReviewPrompt(data)} label="周复盘 · 复制给 Claude" />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/flashcards/"
            className="rounded-xl border p-4 transition hover:bg-surface-2"
          >
            <p className="text-3xl font-bold tnum">{due.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">张背诵卡到期</p>
          </Link>
          <Link href="/mistakes/" className="rounded-xl border p-4 transition hover:bg-surface-2">
            <p className="text-3xl font-bold tnum">{openMistakes.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">条错题还没解决</p>
          </Link>
        </div>
      </Panel>

      <Panel title="七科现况" subtitle="按考试先后排序 · A1 线 = 80 分">
        {data.topics.length === 0 && (
          <div className="mb-4">
            <Empty>
              考点表还是空的。先去<Link href="/syllabus/" className="text-accent underline">考点</Link>
              页把考纲贴进来 —— 覆盖率是这整套系统的核心。
            </Empty>
          </div>
        )}
        <ul className="space-y-2">
          {SUBJECTS_BY_DATE.map((subject) => {
            const topics = data.topics.filter((t) => t.subjectId === subject.id && !t.skipped);
            const { mastered, weak } = countTopics(topics);
            const score = currentScore(data, subject.id);
            const gap = score ? Math.max(0, A1_THRESHOLD - score.value) : null;
            const mistakes = openMistakes.filter((m) => m.subjectId === subject.id).length;

            return (
              <li
                key={subject.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border p-3"
              >
                <div className="min-w-32">
                  <p className="font-semibold">
                    {subject.name}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {subject.medium}卷
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs tnum text-muted-foreground">
                    {formatExamDay(subject)} · 还有 {daysUntil(examDate(subject), now)} 天
                  </p>
                </div>

                <div className="min-w-28">
                  {score ? (
                    <>
                      <p className="text-sm tnum">
                        <span className="font-semibold">{score.value}</span>
                        <span className="text-muted-foreground"> / 80</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {gap === 0 ? (
                          <span className="text-ok">已达 A1 线</span>
                        ) : (
                          <>差 {gap} 分</>
                        )}
                        {!score.real && " · 含作业分"}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">还没有分数</p>
                  )}
                </div>

                <div className="min-w-32 flex-1">
                  {topics.length > 0 ? (
                    <>
                      <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
                        {[0, 1, 2, 3].map((level) => {
                          const count = topics.filter((t) => t.mastery === level).length;
                          if (!count) return null;
                          return (
                            <div
                              key={level}
                              className={["bg-danger", "bg-warn", "bg-accent", "bg-ok"][level]}
                              style={{ width: `${(count / topics.length) * 100}%` }}
                            />
                          );
                        })}
                      </div>
                      <p className="mt-1 text-xs tnum text-muted-foreground">
                        熟练 {mastered}/{topics.length}
                        {weak > 0 && <span className="text-danger"> · {weak} 个盲区</span>}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">考点未录入</p>
                  )}
                </div>

                {mistakes > 0 && (
                  <span className="rounded-md bg-surface-2 px-2 py-1 text-xs tnum">
                    错题 {mistakes}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
