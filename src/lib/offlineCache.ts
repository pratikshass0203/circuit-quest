import { supabase } from './supabase';

const DB_NAME = 'circuitquest-offline';
const DB_VERSION = 1;
const STORE_QUESTIONS = 'questions';
const STORE_META = 'meta';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_QUESTIONS)) db.createObjectStore(STORE_QUESTIONS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

export async function cacheAllQuestions(): Promise<number> {
  const modules = ['gate-puzzler', 'circuit-builder', 'waveform-lab', 'power-quest', 'state-machine', 'cpu-boss'];
  let total = 0;
  for (const m of modules) {
    const { data, error } = await supabase.from('module_questions').select('*').eq('module_id', m);
    if (error || !data) continue;
    const db = await openDB();
    const tx = db.transaction([STORE_QUESTIONS, STORE_META], 'readwrite');
    for (const q of data) tx.objectStore(STORE_QUESTIONS).put(q);
    total += data.length;
    await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); tx.onerror = () => resolve(); });
  }
  const db = await openDB();
  const tx = db.transaction(STORE_META, 'readwrite');
  tx.objectStore(STORE_META).put({ key: 'all_cached_at', value: Date.now() });
  await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); tx.onerror = () => resolve(); });
  return total;
}

export async function getCachedQuestions(moduleId: string, level?: string): Promise<unknown[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_QUESTIONS, 'readonly');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(STORE_QUESTIONS).getAll();
    req.onsuccess = () => {
      const all = req.result as Array<Record<string, unknown>>;
      let filtered = all.filter((q) => q.module_id === moduleId);
      if (level) filtered = filtered.filter((q) => q.level === level);
      resolve(filtered);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function isCacheFresh(): Promise<boolean> {
  const db = await openDB();
  const tx = db.transaction(STORE_META, 'readonly');
  return new Promise((resolve) => {
    const req = tx.objectStore(STORE_META).get('all_cached_at');
    req.onsuccess = () => {
      const result = req.result as { key: string; value: number } | undefined;
      if (!result?.value) { resolve(false); return; }
      resolve(Date.now() - result.value < 7 * 24 * 60 * 60 * 1000);
    };
    req.onerror = () => resolve(false);
  });
}

export async function getCacheInfo(): Promise<{ cached: boolean; cachedAt: number | null; count: number }> {
  const db = await openDB();
  const tx = db.transaction([STORE_META, STORE_QUESTIONS], 'readonly');
  return new Promise((resolve) => {
    const metaReq = tx.objectStore(STORE_META).get('all_cached_at');
    const qReq = tx.objectStore(STORE_QUESTIONS).count();
    let cachedAt: number | null = null;
    let count = 0;
    let done = 0;
    const checkDone = () => { done++; if (done === 2) resolve({ cached: cachedAt !== null, cachedAt, count }); };
    metaReq.onsuccess = () => { const r = metaReq.result as { key: string; value: number } | undefined; cachedAt = r?.value ?? null; checkDone(); };
    metaReq.onerror = () => checkDone();
    qReq.onsuccess = () => { count = qReq.result; checkDone(); };
    qReq.onerror = () => checkDone();
  });
}

export async function clearCache(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_QUESTIONS, STORE_META], 'readwrite');
  tx.objectStore(STORE_QUESTIONS).clear();
  tx.objectStore(STORE_META).clear();
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}
