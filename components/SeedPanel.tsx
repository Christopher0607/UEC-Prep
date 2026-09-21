"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, ClientOnly, Panel } from "@/components/ui";
import { DECKS, TOTAL_CARDS } from "@/lib/decks";
import { SEED_MISTAKES, TOTAL_TOPICS, isEmpty, seedEverything } from "@/lib/seed";
import { useData } from "@/lib/store";

/**
 * 一键载入。数据存在浏览器里，没法替他预先填好 —— 但内容可以写进代码，
 * 点一下就全进去了。空的时候大声提示，有数据之后缩成一行小字，
 * 免得一个已经用起来的首页上永远挂着一块安装向导。
 */
export default function SeedPanel() {
  const data = useData();
  const [result, setResult] = useState<{ topics: number; cards: number; mistakes: number } | null>(
    null,
  );

  function run() {
    setResult(seedEverything());
  }

  return (
    <ClientOnly>
      {isEmpty(data) || result ? (
        <Panel
          title={result ? "装好了" : "先把内容装进来"}
          subtitle={
            result
              ? "刷新页面后这一块会缩成一行小字，不会一直占着首页。"
              : "网站现在是空的。这一个月积累的考点、背诵卡和预考错题都已经写进代码里了，点一下就全进去。"
          }
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              ["考点", TOTAL_TOPICS, "七科全套"],
              ["背诵卡", TOTAL_CARDS, `${DECKS.length} 个卡组`],
              ["预考错题", SEED_MISTAKES.length, "逐题批改"],
            ].map(([label, n, note]) => (
              <div key={label as string} className="rounded-xl border p-3">
                <p className="text-2xl font-bold tnum">{n as number}</p>
                <p className="text-xs text-muted-foreground">{label as string}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{note as string}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={run}>
              {result ? "再补一次" : "一键载入全部"}
            </Button>
            <span className="text-xs text-muted-foreground">
              重复点不会重复加。之后也可以在各页面单独载入某一科、某一组。
            </span>
          </div>

          {result && (
            <p className="mt-3 text-sm text-ok">
              已载入：考点 {result.topics} · 背诵卡 {result.cards} · 错题 {result.mistakes}。
              现在去<Link href="/syllabus" className="underline"> 考点页 </Link>
              给每个考点打掌握度，去<Link href="/flashcards" className="underline"> 背诵页 </Link>开始第一轮。
            </p>
          )}

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            ⚠️ 数据只存在这台设备的浏览器里。换设备或清缓存就没了 ——
            每周去<Link href="/data" className="underline"> 备份页 </Link>导出一次 JSON。
          </p>
        </Panel>
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            预制内容：考点 {TOTAL_TOPICS} · 卡 {TOTAL_CARDS} · 错题 {SEED_MISTAKES.length}
          </span>
          <Button onClick={run}>补载入缺的</Button>
        </div>
      )}
    </ClientOnly>
  );
}
