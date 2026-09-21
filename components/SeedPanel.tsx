"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, ClientOnly, Panel } from "@/components/ui";
import { DECKS, TOTAL_CARDS } from "@/lib/decks";
import { SEED_MISTAKES, TOTAL_TOPICS, seedEverything } from "@/lib/seed";
import { useData } from "@/lib/store";

/**
 * 一键载入。数据存在浏览器里，没法替他预先填好 —— 但内容可以写进代码，
 * 点一下就全进去了。
 *
 * 这一块**永远显示**。先前的版本把它藏在「数据为空」的条件后面，结果
 * 只要手动加过一条，主按钮就消失、只剩一行很容易漏看的小字 ——
 * 找不到按钮的人没错，是这个设计错了。现在一直显示「已载入 / 共」的进度，
 * 缺什么一眼看得见，按钮也一直在。
 */
export default function SeedPanel() {
  const data = useData();
  const [result, setResult] = useState<{ topics: number; cards: number; mistakes: number } | null>(
    null,
  );

  const rows: [string, number, number, string][] = [
    ["考点", data.topics.length, TOTAL_TOPICS, "七科全套"],
    ["背诵卡", data.cards.length, TOTAL_CARDS, `${DECKS.length} 个卡组`],
    ["预考错题", data.mistakes.length, SEED_MISTAKES.length, "逐题批改"],
  ];
  const missing = rows.some(([, have, total]) => have < total);

  return (
    <ClientOnly>
      <Panel
        title={missing ? "先把内容装进来" : "内容已装好"}
        subtitle={
          missing
            ? "这一个月积累的考点、背诵卡和预考错题都写进代码里了，点一下就全进去。重复点不会重复加。"
            : "预制内容都在里面了。以后往卡组里加了东西，回来点一次「补载入缺的」就只会进新的。"
        }
      >
        <div className="grid grid-cols-3 gap-3">
          {rows.map(([label, have, total, note]) => (
            <div key={label} className="rounded-xl border p-3">
              <p className="tnum text-2xl font-bold">
                {have}
                <span className="text-base font-normal text-muted-foreground"> / {total}</span>
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => setResult(seedEverything())}>
            {missing ? "一键载入全部" : "补载入缺的"}
          </Button>
          {result && (
            <span className="text-sm text-ok">
              {result.topics + result.cards + result.mistakes === 0
                ? "都已经在里面了，没有要补的。"
                : `新增：考点 ${result.topics} · 卡 ${result.cards} · 错题 ${result.mistakes}`}
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          载入后去<Link href="/syllabus" className="underline"> 考点页 </Link>
          给每个考点打掌握度，去<Link href="/flashcards" className="underline"> 背诵页 </Link>
          开始第一轮。
          <br />
          ⚠️ 数据只存在这台设备的浏览器里。换设备或清缓存就没了 ——
          每周去<Link href="/data" className="underline"> 备份页 </Link>导出一次 JSON。
        </p>
      </Panel>
    </ClientOnly>
  );
}
