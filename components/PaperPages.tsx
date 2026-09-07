"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { deleteImage, getImage } from "@/lib/blobstore";

/**
 * Loads scans out of IndexedDB on demand. They are never held in app state —
 * a dozen 300KB pages would blow the localStorage budget the moment anything
 * serialised it.
 */
export default function PaperPages({
  pageIds,
  onRemove,
}: {
  pageIds: string[];
  onRemove: (id: string) => void;
}) {
  const [images, setImages] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all(pageIds.map(async (id) => [id, await getImage(id)] as const)).then((pairs) => {
      if (!live) return;
      const next: Record<string, string> = {};
      for (const [id, src] of pairs) if (src) next[id] = src;
      setImages(next);
    });
    return () => {
      live = false;
    };
  }, [pageIds]);

  if (!pageIds.length) {
    return <p className="text-sm text-muted-foreground">还没上传卷面照片。</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {pageIds.map((id, i) => (
          <div key={id} className="group relative">
            {images[id] ? (
              // eslint-disable-next-line @next/next/no-img-element -- data: URL from IndexedDB
              <img
                src={images[id]}
                alt={`第 ${i + 1} 页`}
                onClick={() => setOpen(id)}
                className="h-28 w-20 cursor-zoom-in rounded-lg border object-cover"
              />
            ) : (
              <div className="flex h-28 w-20 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                载入中
              </div>
            )}
            <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1 text-xs tnum">
              {i + 1}
            </span>
            <button
              onClick={async () => {
                await deleteImage(id);
                onRemove(id);
              }}
              className="absolute right-1 top-1 rounded bg-background/80 px-1 text-xs text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100"
              aria-label="删除这一页"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {open && images[open] && (
        <div
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-start justify-center overflow-auto bg-black/80 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from IndexedDB */}
          <img src={images[open]} alt="卷面" className="max-w-4xl rounded-lg" />
          <Button className="fixed right-4 top-4" onClick={() => setOpen(null)}>
            关闭
          </Button>
        </div>
      )}
    </>
  );
}
