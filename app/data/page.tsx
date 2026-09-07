"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ClientOnly, Panel } from "@/components/ui";
import { storageUsage } from "@/lib/blobstore";
import { toMyDateString } from "@/lib/exam";
import { exportJSON, replaceAll, useData } from "@/lib/store";
import type { AppData } from "@/lib/types";

export default function DataPage() {
  const data = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [usage, setUsage] = useState<{ usedMB: number; quotaMB: number } | null>(null);

  useEffect(() => {
    storageUsage().then(setUsage);
  }, []);

  function download() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uec-prep-${toMyDateString(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    let parsed: AppData;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setMessage("这个文件不是有效的备份。");
      return;
    }
    // Import replaces everything, so make it an explicit decision rather than
    // something you discover after your mistake log is gone.
    if (!confirm("导入会覆盖现在的全部数据，确定？")) return;
    replaceAll(parsed);
    setMessage("已导入。");
  }

  const stats = [
    ["考点", data.topics.length],
    ["错题", data.mistakes.length],
    ["背诵卡", data.cards.length],
    ["真题记录", data.papers.length],
    ["题库卷子", data.bank.length],
  ] as const;

  return (
    <div className="space-y-4">
      <Panel title="备份" subtitle="数据只存在这台设备的浏览器里 —— 清缓存、换手机就没了。每周导出一次。">
        <ClientOnly>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([label, n]) => (
              <div key={label} className="rounded-xl border p-3">
                <p className="text-2xl font-bold tnum">{n}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </ClientOnly>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={download}>
            导出 JSON
          </Button>
          <Button onClick={() => fileRef.current?.click()}>导入 JSON</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => importFile(e.target.files?.[0])}
          />
        </div>
        {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}

        {usage && (
          <p className="mt-4 text-sm tnum text-muted-foreground">
            浏览器已用 {usage.usedMB.toFixed(1)} MB / 可用约 {Math.round(usage.quotaMB)} MB
            —— 卷面照片存在 IndexedDB，不受 localStorage 那 5MB 的限制。
          </p>
        )}

        <p className="mt-2 text-sm leading-relaxed text-warn">
          ⚠️ 导出的 JSON <strong>不包含题库的卷面照片</strong>（那会变成几十 MB 的文件）。
          原始试卷请自己另留一份在电脑或网盘 —— 照片只存在这台设备上。
        </p>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          想在手机和电脑之间同步：导出文件丢进网盘，另一台设备导入。
          真要自动同步就得接数据库 —— 那超出「零成本」的范围了，等考完再说。
        </p>
      </Panel>
    </div>
  );
}
