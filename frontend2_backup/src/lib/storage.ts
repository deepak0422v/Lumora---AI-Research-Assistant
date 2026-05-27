import type { Source } from "./api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  createdAt: number;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  uploadedAt: number;
}

const THREADS_KEY = "lumora.threads.v1";
const DOCS_KEY = "lumora.docs.v1";

const isBrowser = () => typeof window !== "undefined";

export function loadThreads(): Thread[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Thread[];
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (!isBrowser()) return;
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
}

export function loadDocs(): UploadedDoc[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UploadedDoc[];
  } catch {
    return [];
  }
}

export function saveDocs(docs: UploadedDoc[]) {
  if (!isBrowser()) return;
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function newId(): string {
  if (isBrowser() && crypto?.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function makeThread(): Thread {
  const now = Date.now();
  return {
    id: newId(),
    title: "New exploration",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function deriveTitle(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= 48) return clean;
  return clean.slice(0, 48) + "…";
}
