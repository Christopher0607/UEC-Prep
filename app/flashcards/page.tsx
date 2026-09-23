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
import { DECKS, TOTAL_CARDS, deckById, deckOfFront } from "@/lib/decks";
import { SUBJECTS, subjectById } from "@/lib/exam";
import { cardGenPrompt } from "@/lib/prompt";
import { seedDeck } from "@/lib/seed";
import { INTERVALS, dueCards, schedule } from "@/lib/srs";
import { newId, update, useData } from "@/lib/store";
import type { Card, SubjectId } from "@/lib/types";

/**
 * 复习范围。三百多张卡混在一起没法背 —— 「今天只背文学常识」必须做得到，
 * 所以范围除了按科目，还要能按卡组。存成字符串：
 * "all" ／ 科目 id ／ "deck:<卡组 id>"。
 */
type Scope = string;

const OTHER = "__other__";

/** 出牌顺序。弱项优先是默认，但想随便刷就得随便刷得了。 */
type Order = "weak" | "random";

/**
 * 同一个种子下顺序固定 —— 每答一张卡 data 就变一次，要是每次重算都重新洗，
 * 牌面会在你眼前乱跳。
 */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function FlashcardsPage() {
  const data = useData();
  const [subjectId, setSubjectId] = useState<SubjectId>("chinese");
  const [scope, setScope] = useState<Scope>("all");
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [deckMsg, setDeckMsg] = useState("");
  const [openGroup, setOpenGroup] = useState<Set<string>>(new Set());
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [pickingScope, setPickingScope] = useState(false);
  const [order, setOrder] = useState<Order>("weak");
  const [seed, setSeed] = useState(() => String(Math.random()));
  /**
   * 这一轮里「先放一放」的卡，按放下的先后排在队尾。
   * 「忘了」也走这里 —— 否则它会被原地再发一次：退回第 0 格意味着 0 天后到期，
   * 也就是现在；而队列按忘过的次数倒序排，刚忘过的那张又正好排第一。
   * 结果就是不会的卡永远翻不过去。
   */
  const [deferred, setDeferred] = useState<string[]>([]);

  const inScope = useMemo(() => {
    if (scope === "all") return data.cards;
    if (scope.startsWith("deck:")) {
      const id = scope.slice(5);
      return data.cards.filter((c) => deckOfFront(c.front, c.subjectId) === id);
    }
    return data.cards.filter((c) => c.subjectId === scope);
  }, [data.cards, scope]);

  const queue = useMemo(() => {
    const base = dueCards(inScope);
    const ordered =
      order === "random"
        ? [...base].sort((a, b) => hash(a.id + seed) - hash(b.id + seed))
        : base;
    if (!deferred.length) return ordered;
    const back = new Set(deferred);
    const front = ordered.filter((c) => !back.has(c.id));
    const tail = deferred
      .map((id) => ordered.find((c) => c.id === id))
      .filter((c): c is Card => !!c);
    return [...front, ...tail];
  }, [inScope, order, seed, deferred]);

  const scopeName =
    scope === "all"
      ? "全部"
      : scope.startsWith("deck:")
        ? (deckById(scope.slice(5))?.name ?? "卡组")
        : subjectById(scope as SubjectId).name;

  const current = queue[0];

  /** 卡片库按卡组分堆；不属于任何预制卡组的（自己导入的）单独一堆。 */
  const groups = useMemo(() => {
    const byGroup = new Map<string, Card[]>();
    for (const c of data.cards) {
      const key = deckOfFront(c.front, c.subjectId) ?? OTHER;
      const list = byGroup.get(key);
      if (list) list.push(c);
      else byGroup.set(key, [c]);
    }
    return [...byGroup.entries()]
      .map(([key, cards]) => ({
        key,
        name: key === OTHER ? "自己导入的" : (deckById(key)?.name ?? key),
        cards,
        due: dueCards(cards).length,
      }))
      .sort((a, b) =>
        a.key === OTHER ? 1 : b.key === OTHER ? -1 : b.cards.length - a.cards.length,
      );
  }, [data.cards]);

  /** 挪到这一轮的队尾。同一张卡重复放，只保留最后一次的位置。 */
  function sendToBack(id: string) {
    setDeferred((prev) => [...prev.filter((x) => x !== id), id]);
  }

  function answer(remembered: boolean) {
    if (!current) return;
    const next = schedule(current, remembered);
    update((d) => ({ ...d, cards: d.cards.map((c) => (c.id === next.id ? next : c)) }));
    // 忘了的卡今天还要再见，但要等一圈 —— 不能立刻又是它。
    if (remembered) setDeferred((prev) => prev.filter((x) => x !== next.id));
    else sendToBack(next.id);
    setRevealed(false);
  }

  /** 不给分、不改进度，纯粹换下一张。 */
  function skip() {
    if (!current) return;
    sendToBack(current.id);
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
        // New cards are due immediately — with weeks left, nothing waits.
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

  function toggleGroup(key: string) {
    setOpenGroup((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const weakTopics = data.topics
    .filter((t) => t.subjectId === subjectId && t.mastery <= 1 && !t.skipped)
    .map((t) => t.title);

  const scopeChip = (value: Scope, label: string, n: number) => (
    <button
      key={value}
      onClick={() => {
        setScope(value);
        setRevealed(false);
        setPickingScope(false);
      }}
      className={`rounded-lg border px-2.5 py-1 tnum transition ${
        scope === value ? "border-accent text-accent" : "hover:bg-surface-2"
      }`}
    >
      {label} {n}
    </button>
  );

  /** 背面一律按行排版：以 ▸ 开头的那行是答案，突出显示。 */
  const backLines = (back: string, strong: string, weak: string) =>
    back.split("\n").map((line, i) => (
      <p
        key={i}
        className={`whitespace-pre-wrap break-words leading-relaxed ${
          line.startsWith("▸") ? strong : weak
        }`}
      >
        {line}
      </p>
    ));

  return (
    <div className="space-y-4">
      <Panel
        title="今天要背的"
        subtitle="忘掉的卡退回第 0 格，挪到队尾，这一轮还会再见 —— 但不会原地卡住你。想跳就点「跳过」，想打乱就切「随机」。三百多张混在一起没法背，先用「换一组」挑一组。"
      >
        <ClientOnly>
          {/* 范围默认收起 —— 十个卡组平铺会把卡片挤出第一屏。 */}
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-muted-foreground">范围</span>
            <span className="font-medium">{scopeName}</span>
            <span className="tnum text-xs text-muted-foreground">
              到期 {queue.length} / 共 {inScope.length}
            </span>
            <Button onClick={() => setPickingScope((v) => !v)}>
              {pickingScope ? "收起" : "换一组"}
            </Button>
            <Button
              variant={order === "random" ? "primary" : "default"}
              onClick={() => {
                setOrder((v) => (v === "weak" ? "random" : "weak"));
                setSeed(String(Math.random()));
                setDeferred([]);
                setRevealed(false);
              }}
            >
              {order === "random" ? "随机中" : "弱项优先"}
            </Button>
            {order === "random" && (
              <Button
                onClick={() => {
                  setSeed(String(Math.random()));
                  setDeferred([]);
                  setRevealed(false);
                }}
              >
                重新洗牌
              </Button>
            )}
          </div>

          {pickingScope && (
            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {scopeChip("all", "全部", dueCards(data.cards).length)}
                {SUBJECTS.map((s) =>
                  scopeChip(
                    s.id,
                    s.short,
                    dueCards(data.cards.filter((c) => c.subjectId === s.id)).length,
                  ),
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {groups.map((g) =>
                  g.key === OTHER ? null : scopeChip(`deck:${g.key}`, g.name, g.due),
                )}
              </div>
            </div>
          )}
        </ClientOnly>

        <ClientOnly>
          {!current ? (
            <Empty>
              {data.cards.length === 0
                ? "还没有卡片。到下面「预制卡组」一键载入，或自己批量导入。"
                : inScope.length === 0
                  ? "这个范围里还没有卡片。"
                  : "这个范围到期的都背完了 —— 换个范围，或明天再来。"}
            </Empty>
          ) : (
            <div className="rounded-2xl border p-5 sm:p-6">
              <p className="mb-1 text-center text-xs tnum text-muted-foreground">
                剩 {queue.length} 张 · {subjectById(current.subjectId).name} · 第 {current.box} 格
                {current.lapses > 0 && ` · 忘过 ${current.lapses} 次`}
              </p>
              <p className="mt-4 whitespace-pre-wrap break-words text-center text-lg font-medium leading-relaxed">
                {current.front}
              </p>

              {revealed ? (
                <>
                  <hr className="my-5" />
                  <div className="space-y-1.5 text-left">
                    {backLines(
                      current.back,
                      "text-lg font-semibold text-accent",
                      "text-base text-muted-foreground",
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button variant="danger" onClick={() => answer(false)}>
                      忘了{queue.length > 1 && " —— 等一圈再来"}
                    </Button>
                    <Button variant="primary" onClick={() => answer(true)}>
                      记得（{INTERVALS[Math.min(current.box + 1, INTERVALS.length - 1)]} 天后再见）
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button onClick={() => setRevealed(true)}>先自己想 —— 想好了点这里</Button>
                  {queue.length > 1 && <Button onClick={skip}>跳过</Button>}
                </div>
              )}
            </div>
          )}
        </ClientOnly>
      </Panel>

      <Panel
        title="预制卡组"
        subtitle={`${DECKS.length} 组、共 ${TOTAL_CARDS} 张，全部来自 2026 预考的逐题批改与老师讲义。重复点不会重复加。`}
      >
        <ClientOnly>
          <div className="space-y-2">
            {DECKS.map((deck) => {
              const have = data.cards.filter((c) => deckOfFront(c.front, c.subjectId) === deck.id).length;
              return (
                <div
                  key={deck.id}
                  className="rounded-xl border p-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2"
                >
                  <div className="min-w-0 sm:flex-1">
                    <p className="font-medium">
                      {deck.name}
                      <span className="ml-2 text-xs font-normal tnum text-muted-foreground">
                        {deck.cards.length} 张
                      </span>
                      {have > 0 && (
                        <span className="ml-2 text-xs font-normal tnum text-ok">已载入 {have}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {deck.note}
                    </p>
                  </div>
                  <div className="mt-2.5 flex gap-2 sm:mt-0 sm:contents">
                    {have > 0 && (
                      <Button
                        onClick={() => {
                          setScope(`deck:${deck.id}`);
                          setRevealed(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        只背这组
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        const n = seedDeck(deck.id);
                        setDeckMsg(
                          n ? `「${deck.name}」新增 ${n} 张。` : `「${deck.name}」已经全在牌堆里了。`,
                        );
                      }}
                    >
                      载入
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                const n = DECKS.reduce((acc, d) => acc + seedDeck(d.id), 0);
                setDeckMsg(n ? `全部载入，新增 ${n} 张。` : `${DECKS.length} 组都已经在牌堆里了。`);
              }}
            >
              全部载入（{TOTAL_CARDS} 张）
            </Button>
            {deckMsg && <span className="text-sm text-ok">{deckMsg}</span>}
          </div>
        </ClientOnly>
      </Panel>

      <Panel title="卡片库" subtitle={`共 ${data.cards.length} 张，按卡组分开。点一张展开看全文。`}>
        <ClientOnly>
          {data.cards.length === 0 ? (
            <Empty>空的。上面一键载入。</Empty>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => {
                const isOpen = openGroup.has(g.key);
                return (
                  <div key={g.key} className="overflow-hidden rounded-xl border">
                    <button
                      onClick={() => toggleGroup(g.key)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-surface-2"
                    >
                      <span className="w-3 shrink-0 text-muted-foreground">{isOpen ? "▾" : "▸"}</span>
                      <span className="min-w-0 flex-1 font-medium">{g.name}</span>
                      <span className="shrink-0 text-xs tnum text-muted-foreground">
                        {g.cards.length} 张
                      </span>
                      {g.due > 0 && (
                        <span className="shrink-0 text-xs tnum text-accent">到期 {g.due}</span>
                      )}
                    </button>

                    {isOpen && (
                      <ul className="divide-y border-t">
                        {g.cards.map((c) => {
                          const expanded = openCard === c.id;
                          return (
                            <li key={c.id} className="px-3 py-2.5 text-sm">
                              <div className="flex items-start gap-3">
                                <span className="w-9 shrink-0 pt-0.5 text-xs tnum text-muted-foreground">
                                  {subjectById(c.subjectId).short}
                                  {c.box}
                                </span>
                                <button
                                  onClick={() => setOpenCard(expanded ? null : c.id)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <span className="block whitespace-pre-wrap break-words leading-relaxed">
                                    {c.front}
                                  </span>
                                  {!expanded && (
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                      点开看答案
                                    </span>
                                  )}
                                </button>
                                <button
                                  onClick={() => remove(c.id)}
                                  className="shrink-0 text-xs text-muted-foreground transition hover:text-danger"
                                >
                                  删除
                                </button>
                              </div>
                              {expanded && (
                                <div className="mt-2 space-y-1 border-l-2 border-accent pl-3">
                                  {backLines(c.back, "font-semibold text-accent", "text-muted-foreground")}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
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
            placeholder={
              "机会成本的定义是什么？|做出选择时，所放弃的其他选项中价值最高的那一个。\n什么是需求定律？|价格上升，需求量下降；价格下降，需求量上升（其他条件不变）。"
            }
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
    </div>
  );
}
