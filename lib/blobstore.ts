"use client";

/**
 * Image storage for past-paper scans.
 *
 * localStorage caps out around 5MB, which is one or two phone photos — nowhere
 * near enough for a paper bank. IndexedDB has no such cap (the browser grants a
 * share of free disk, typically hundreds of MB), so scans live here and only
 * their ids go into the localStorage-backed app state. Still zero-cost, still
 * a static site, still no backend.
 */

const DB_NAME = "uec-prep-images";
const STORE = "images";
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function putImage(id: string, dataUrl: string): Promise<void> {
  await tx("readwrite", (s) => s.put(dataUrl, id));
}

export async function getImage(id: string): Promise<string | undefined> {
  try {
    return await tx<string | undefined>("readonly", (s) => s.get(id));
  } catch {
    // A cleared origin or a private window loses the store; the paper's index
    // is still useful without its scans, so never let this throw upward.
    return undefined;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    // Already gone is the outcome we wanted.
  }
}

/** Real numbers beat guessing about quota — shown on the 备份 page. */
export async function storageUsage(): Promise<{ usedMB: number; quotaMB: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usedMB: usage / 1_048_576, quotaMB: quota / 1_048_576 };
  } catch {
    return null;
  }
}
