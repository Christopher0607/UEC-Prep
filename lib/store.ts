"use client";

import { useSyncExternalStore } from "react";
import { SUBJECTS } from "./exam";
import type { AppData, SubjectId } from "./types";

const KEY = "uec-prep-v1";
const VERSION = 1;

function emptyData(): AppData {
  const baselines: Partial<Record<SubjectId, number>> = {};
  for (const s of SUBJECTS) {
    if (s.baseline !== null) baselines[s.id] = s.baseline;
  }
  return {
    version: VERSION,
    topics: [],
    mistakes: [],
    cards: [],
    papers: [],
    essays: [],
    baselines,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Server-rendered HTML has no localStorage, so the first paint uses this frozen
 * empty snapshot. Returning the *same object* every time matters —
 * useSyncExternalStore loops forever if the server snapshot is rebuilt per call.
 */
const SERVER_SNAPSHOT: AppData = Object.freeze(emptyData());

let cache: AppData | null = null;
const listeners = new Set<() => void>();

function read(): AppData {
  if (cache) return cache;
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? migrate(JSON.parse(raw)) : emptyData();
  } catch {
    // Corrupt or unreadable storage should not brick the app three weeks
    // before the exam — start clean rather than throwing on every render.
    cache = emptyData();
  }
  return cache;
}

function migrate(raw: unknown): AppData {
  const base = emptyData();
  if (!raw || typeof raw !== "object") return base;
  const d = raw as Partial<AppData>;
  return {
    ...base,
    ...d,
    version: VERSION,
    topics: d.topics ?? [],
    mistakes: d.mistakes ?? [],
    cards: d.cards ?? [],
    papers: d.papers ?? [],
    essays: d.essays ?? [],
    baselines: { ...base.baselines, ...(d.baselines ?? {}) },
  };
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function update(fn: (draft: AppData) => AppData | void): void {
  const current = read();
  const next = fn({ ...current }) ?? current;
  cache = { ...next, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Almost always the 5MB quota, and almost always a photo that dodged
    // downscaling. Say so plainly instead of failing silently.
    alert("保存失败：浏览器存储空间已满。到「备份」页导出一份，然后删掉几张旧照片。");
  }
  listeners.forEach((l) => l());
}

export function useData(): AppData {
  return useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT);
}

export function replaceAll(data: AppData): void {
  update(() => migrate(data));
}

export function exportJSON(): string {
  return JSON.stringify(read(), null, 2);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
