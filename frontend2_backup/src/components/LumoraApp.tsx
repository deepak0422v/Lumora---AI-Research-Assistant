import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { DocumentPanel } from "./DocumentPanel";
import {
  loadThreads,
  makeThread,
  saveThreads,
  deriveTitle,
  type Thread,
  type ChatMessage,
} from "@/lib/storage";

interface Props {
  sessionId?: string;
}

export function LumoraApp({ sessionId }: Props) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Bootstrap from localStorage (idempotent, runs once)
  useEffect(() => {
    const stored = loadThreads();

    if (sessionId) {
      const exists = stored.find((t) => t.id === sessionId);
      if (exists) {
        setThreads(stored);
      } else {
        // unknown id — provision a thread with that id so URL is the source of truth
        const t: Thread = { ...makeThread(), id: sessionId };
        const next = [t, ...stored];
        setThreads(next);
        saveThreads(next);
      }
      setReady(true);
      return;
    }

    // No session in URL — create or pick most recent and navigate
    let target: Thread;
    let next = stored;
    if (stored.length === 0) {
      target = makeThread();
      next = [target];
      saveThreads(next);
    } else {
      target = stored[0];
    }
    setThreads(next);
    setReady(true);
    navigate({ to: "/$sessionId", params: { sessionId: target.id }, replace: true });
  }, [sessionId, navigate]);

  const active = threads.find((t) => t.id === sessionId) ?? threads[0];

  const updateMessages = useCallback(
    (messages: ChatMessage[]) => {
      if (!active) return;
      setThreads((prev) => {
        const next = prev.map((t) =>
          t.id === active.id ? { ...t, messages, updatedAt: Date.now() } : t,
        );
        saveThreads(next);
        return next;
      });
    },
    [active],
  );

  const autoTitle = useCallback(
    (firstUserText: string) => {
      if (!active) return;
      setThreads((prev) => {
        const next = prev.map((t) =>
          t.id === active.id && t.title === "New exploration"
            ? { ...t, title: deriveTitle(firstUserText) }
            : t,
        );
        saveThreads(next);
        return next;
      });
    },
    [active],
  );

  const onNewThread = () => {
    const t = makeThread();
    const next = [t, ...threads];
    setThreads(next);
    saveThreads(next);
    navigate({ to: "/$sessionId", params: { sessionId: t.id } });
  };

  const onRename = (id: string, title: string) => {
    setThreads((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, title } : t));
      saveThreads(next);
      return next;
    });
  };

  const onDelete = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveThreads(next);
      if (id === sessionId) {
        if (next.length > 0) {
          navigate({ to: "/$sessionId", params: { sessionId: next[0].id }, replace: true });
        } else {
          const fresh = makeThread();
          const seeded = [fresh];
          saveThreads(seeded);
          navigate({ to: "/$sessionId", params: { sessionId: fresh.id }, replace: true });
          return seeded;
        }
      }
      return next;
    });
  };

  if (!ready || !active) {
    return (
      <div className="grid h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      <Sidebar
        threads={threads}
        activeId={active.id}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onNewThread={onNewThread}
        onRename={onRename}
        onDelete={onDelete}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setDocsOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs font-medium transition-all hover:border-primary/40 hover:shadow-glow ${
              docsOpen ? "glass-strong ring-glow" : "glass"
            }`}
          >
            <FileText size={13} />
            Documents
          </button>
        </header>

        <ChatArea
          // Key by thread id so state resets between threads
          key={active.id}
          thread={active}
          onUpdateMessages={updateMessages}
          onAutoTitle={autoTitle}
          onOpenDocs={() => setDocsOpen(true)}
        />
      </div>

      <DocumentPanel open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
