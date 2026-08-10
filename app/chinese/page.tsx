"use client";

import { useState } from "react";
import {
  CopyPrompt,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
} from "@/components/ui";
import {
  FORMAT_TRAPS,
  GENRES,
  PAPER2_PARTS,
  PHRASE_BANK,
  genreById,
} from "@/lib/chinese";
import type { GenreId } from "@/lib/chinese";
import {
  appliedWritingGradePrompt,
  chineseEssayOutlinePrompt,
  paper2DrillPrompt,
} from "@/lib/prompt";

const ESSAY_GENRES = ["记叙文", "议论文", "说明文", "抒情文"];

export default function ChinesePage() {
  const [genreId, setGenreId] = useState<GenreId>("gonghan");
  const [draft, setDraft] = useState("");

  const [topic, setTopic] = useState("");
  const [essayGenre, setEssayGenre] = useState(ESSAY_GENRES[1]);
  const [thesis, setThesis] = useState("");
  const [points, setPoints] = useState(["", "", ""]);
  const [materials, setMaterials] = useState("");

  const genre = genreById(genreId);

  return (
    <div className="space-y-4">
      <Panel
        title="应用文 · 骨架"
        subtitle="老师给的范文里，第 3、4、5 段几乎一字不改。真正要动脑的只有开头和详情两段 —— 所以应用文是背骨架换详情，是试卷一里最稳的分。"
      >
        <div className="grid gap-3 sm:grid-cols-[200px_1fr] sm:items-end">
          <Field label="文体">
            <Select value={genreId} onChange={(e) => setGenreId(e.target.value as GenreId)}>
              {GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-sm text-muted-foreground">{genre.audience}</p>
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold">版头格式</h3>
        <ol className="space-y-1 text-sm">
          {genre.header.map((h, i) => (
            <li key={i} className="flex gap-2">
              <span className="tnum text-muted-foreground">{i + 1}.</span>
              <span>{h}</span>
            </li>
          ))}
        </ol>

        <h3 className="mt-5 mb-2 text-sm font-semibold">
          标题写法
          <span className="ml-2 font-normal text-muted-foreground">末尾不加标点</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {genre.titlePatterns.map((p) => (
            <code key={p} className="rounded-md bg-surface-2 px-2 py-1 text-sm">
              {p}
            </code>
          ))}
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold">段落功能</h3>
        <ul className="space-y-2">
          {genre.paragraphs.map((p) => (
            <li key={p.n} className="rounded-xl border p-3">
              <p className="text-sm font-medium">
                <span className="tnum">第 {p.n} 段</span> · {p.role}
                <span
                  className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                    p.fixed ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn"
                  }`}
                >
                  {p.fixed ? "固定套语，背下来" : "每题不同，要动脑"}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
            </li>
          ))}
        </ul>

        <h3 className="mt-5 mb-2 text-sm font-semibold">
          要素表
          <span className="ml-2 font-normal text-muted-foreground">每项独立算分，写完逐项数一遍</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {genre.elements.map((e) => (
            <span key={e} className="rounded-md border px-2 py-1 text-sm">
              {e}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="批我的应用文" subtitle="按要素表逐项批，不是给个笼统评价。">
        <Textarea
          rows={8}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="把你写的整篇打进来（含版头），或者留空、待会直接发照片"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <CopyPrompt
            build={() => appliedWritingGradePrompt(genre, draft)}
            label={`让 Claude 批这篇${genre.name}`}
          />
          <CopyPrompt
            build={() =>
              paper2DrillPrompt(
                `华文 · 应用文 · ${genre.name}`,
                `要素表：${genre.elements.join("、")}。标题写法：${genre.titlePatterns.join("、")}。`,
              )
            }
            label="出题练这个文体"
          />
        </div>
      </Panel>

      <Panel title="固定套语库" subtitle="这些是原样背下来的，考场上不用现想。">
        <div className="space-y-4">
          {PHRASE_BANK.map((group) => (
            <div key={group.slot}>
              <h3 className="text-sm font-semibold">{group.slot}</h3>
              <p className="mb-1.5 text-xs text-muted-foreground">{group.note}</p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item} className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="格式陷阱" subtitle="每一条都是范文或考卷里真的丢过的分。">
        <ul className="space-y-2">
          {FORMAT_TRAPS.map((t) => (
            <li key={t.trap} className="rounded-xl border p-3">
              <p className="text-sm font-medium text-danger">✗ {t.trap}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.fix}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="作文 · 提纲检查"
        subtitle="作文的胜负在提纲，不在辞藻。审题偏了，写得再美也拿不到分。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="题目">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
          </Field>
          <Field label="文体">
            <Select value={essayGenre} onChange={(e) => setEssayGenre(e.target.value)}>
              {ESSAY_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-3 space-y-3">
          <Field label="中心思想" hint="一句话说清。说不清，就是还没想明白。">
            <Textarea rows={2} value={thesis} onChange={(e) => setThesis(e.target.value)} />
          </Field>
          {points.map((p, i) => (
            <Field key={i} label={`分论点 ${i + 1}`}>
              <Input
                value={p}
                onChange={(e) =>
                  setPoints((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                }
              />
            </Field>
          ))}
          <Field label="打算用的素材" hint="人物、事例、名言。空泛的例子会被指出来。">
            <Textarea
              rows={3}
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3">
          <CopyPrompt
            build={() =>
              chineseEssayOutlinePrompt({ topic, genre: essayGenre, thesis, points, materials })
            }
            label="让 Claude 批这份提纲"
          />
        </div>
      </Panel>

      <Panel title="试卷二 · 六个部分" subtitle="六种不相干的能力。文言文翻译和文化常识没有任何共同的复习方法。">
        <ul className="space-y-2">
          {PAPER2_PARTS.map((p) => (
            <li key={p.name} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {p.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">{p.detail}</span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{p.method}</p>
              </div>
              <CopyPrompt
                build={() => paper2DrillPrompt(`华文 · 试卷二 · ${p.name}`, p.detail)}
                label="出题练这部分"
              />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
