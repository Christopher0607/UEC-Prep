"use client";

import { useState } from "react";
import {
  ClientOnly,
  CopyPrompt,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
} from "@/components/ui";
import { ANALYSIS_LEVELS, ESSAY_TYPES, PAPER2_SECTIONS, checkThesis } from "@/lib/english";
import { essayPlanPrompt, paper2DrillPrompt } from "@/lib/prompt";

export default function EssayPage() {
  const [typeId, setTypeId] = useState(ESSAY_TYPES[0].id);
  const [topic, setTopic] = useState("");
  const [hook, setHook] = useState("");
  const [background, setBackground] = useState("");
  const [thesis, setThesis] = useState("");
  const [headings, setHeadings] = useState(["", "", ""]);
  const [levelNotes, setLevelNotes] = useState<Record<string, string>>({});

  const essayType = ESSAY_TYPES.find((t) => t.id === typeId)!;
  const checks = checkThesis(thesis, headings);

  function setHeading(i: number, value: string) {
    setHeadings((prev) => prev.map((h, idx) => (idx === i ? value : h)));
  }

  return (
    <div className="space-y-4">
      <Panel
        title="英文作文 · 计划检查"
        subtitle="英文是第一场考、也是你最弱的一科。Thesis 和标题选错，正文写得再好也封顶 —— 所以先批计划，再写正文。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Essay 类型">
            <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {ESSAY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="题目">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
          </Field>
        </div>
        <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
          <strong>{essayType.name}</strong>：{essayType.demand}
        </p>
      </Panel>

      <Panel title="开头三件套" subtitle="Hook → Background information → Thesis Statement">
        <div className="space-y-3">
          <Field label="Hook" hint="第一句就要有力">
            <Textarea rows={2} value={hook} onChange={(e) => setHook(e.target.value)} />
          </Field>
          <Field label="Background information" hint="交代背景，铺垫到 thesis">
            <Textarea
              rows={2}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />
          </Field>
          <Field
            label="Thesis Statement"
            hint="一个句子写完下面三个大标题。不能断句、不能有语法错误、不能写错标题。"
          >
            <Textarea rows={3} value={thesis} onChange={(e) => setThesis(e.target.value)} />
          </Field>
        </div>

        <ClientOnly>
          <ul className="mt-3 space-y-1.5">
            {checks.map((c) => (
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

      <Panel title="三个大标题" subtitle="每个标题都必须够广 —— 广到能从 Individual 一路讲到最高层。">
        <div className="space-y-3">
          {headings.map((h, i) => (
            <Field key={i} label={`标题 ${i + 1}`}>
              <Input value={h} onChange={(e) => setHeading(i, e.target.value)} />
            </Field>
          ))}
        </div>
      </Panel>

      <Panel
        title="5 Levels of Analysis"
        subtitle="说明不能只偏向一个主体。每一层都要带到，才拿得到最高 tier。"
      >
        <div className="space-y-3">
          {ANALYSIS_LEVELS.map((level) => (
            <div key={level.id}>
              <Field
                label={level.name}
                hint={level.hint}
              >
                <Input
                  value={levelNotes[level.id] ?? ""}
                  onChange={(e) =>
                    setLevelNotes((prev) => ({ ...prev, [level.id]: e.target.value }))
                  }
                  placeholder="这一层打算怎么带到？"
                />
              </Field>
              {!level.confirmed && (
                <p className="mt-1 text-xs text-warn">
                  ⚠️ 这一层的名字还没确认 —— 去问老师，告诉我之后我改进代码里。
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <CopyPrompt
            build={() =>
              essayPlanPrompt({
                essayType: essayType.name,
                typeDemand: essayType.demand,
                topic,
                hook,
                background,
                thesis,
                headings,
                levelNotes,
                levelNames: ANALYSIS_LEVELS.map((l) => ({ id: l.id, name: l.name })),
              })
            }
            label="让 Claude 批这份计划"
          />
        </div>
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
