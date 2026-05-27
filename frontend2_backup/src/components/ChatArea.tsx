import { useEffect, useRef, useState } from "react";
import { Sparkles, FileSearch, BookOpen, Lightbulb } from "lucide-react";
import { LumoraLogo } from "./LumoraLogo";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { SourcePreview } from "./SourcePreview";
import type { Thread, ChatMessage } from "@/lib/storage";
import { newId } from "@/lib/storage";
import type { Source } from "@/lib/api";
import { ask, streamAsk } from "@/lib/api";

const STREAMING_ENABLED = true;

const SUGGESTIONS = [
  { icon: FileSearch, title: "Summarize a paper", text: "Summarize the key findings from my latest uploaded research paper." },
  { icon: BookOpen, title: "Compare sources", text: "Compare the methodologies used across the documents in my knowledge base." },
  { icon: Lightbulb, title: "Generate ideas", text: "Suggest follow-up research questions based on the materials I've shared." },
  { icon: Sparkles, title: "Extract insights", text: "Pull out the most important insights and quote the supporting passages." },
];

interface Props {
  thread: Thread;
  onUpdateMessages: (messages: ChatMessage[]) => void;
  onAutoTitle: (title: string) => void;
  onOpenDocs: () => void;
}

export function ChatArea({ thread, onUpdateMessages, onAutoTitle, onOpenDocs }: Props) {
  const [busy, setBusy] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef(true);

  // Auto-scroll: only if user is near bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickyRef.current = dist < 120;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!stickyRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.messages, streamingId]);

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setStreamingId(null);
  };

  const send = async (text: string) => {
    if (busy) return;

    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    const assistantMsg: ChatMessage = {
      id: newId(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };

    const wasEmpty = thread.messages.length === 0;
    let working: ChatMessage[] = [...thread.messages, userMsg, assistantMsg];
    onUpdateMessages(working);
    if (wasEmpty) onAutoTitle(text);

    setBusy(true);
    setStreamingId(assistantMsg.id);
    stickyRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (STREAMING_ENABLED) {
        // Stream tokens, then fetch sources via /ask in parallel for citation cards.
        const sourcesPromise = ask(text, thread.id)
          .then((r) => r.sources)
          .catch(() => [] as Source[]);

        await streamAsk(
          text,
          thread.id,
          (_chunk, accumulated) => {
            working = working.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: accumulated } : m,
            );
            onUpdateMessages(working);
          },
          controller.signal,
        );

        const sources = await sourcesPromise;
        working = working.map((m) =>
          m.id === assistantMsg.id ? { ...m, sources } : m,
        );
        onUpdateMessages(working);
      } else {
        const r = await ask(text, thread.id);
        working = working.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: r.answer, sources: r.sources } : m,
        );
        onUpdateMessages(working);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // keep partial
      } else {
        working = working.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content:
                  m.content ||
                  `⚠️ Couldn't reach the Lumora backend.\n\n\`${(err as Error).message}\``,
              }
            : m,
        );
        onUpdateMessages(working);
      }
    } finally {
      setBusy(false);
      setStreamingId(null);
      abortRef.current = null;
    }
  };

  const empty = thread.messages.length === 0;

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col">
      {/* Scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {empty ? (
          <EmptyState onPick={send} onOpenDocs={onOpenDocs} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8 pb-40">
            {thread.messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                sessionId={thread.id}
                streaming={streamingId === m.id}
                onPreviewSource={setPreviewSource}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky composer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="pointer-events-auto relative">
          <ChatInput onSubmit={send} onStop={stop} busy={busy} />
        </div>
      </div>

      <SourcePreview source={previewSource} onClose={() => setPreviewSource(null)} />
    </div>
  );
}

function EmptyState({
  onPick,
  onOpenDocs,
}: {
  onPick: (t: string) => void;
  onOpenDocs: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-12 pb-44">
      <div className="animate-scale-in">
        <LumoraLogo size={56} withWordmark={false} />
      </div>
      <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        What would you like to <span className="gradient-text">explore</span>?
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        Lumora reads your documents and answers with grounded citations. Drop in PDFs and start asking.
      </p>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.text)}
            className="group flex items-start gap-3 rounded-2xl border border-border/70 glass p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-glow transition-transform group-hover:scale-110">
              <s.icon size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{s.title}</div>
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {s.text}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenDocs}
        className="mt-6 text-xs font-medium text-primary-glow hover:underline"
      >
        Manage knowledge base →
      </button>
    </div>
  );
}
