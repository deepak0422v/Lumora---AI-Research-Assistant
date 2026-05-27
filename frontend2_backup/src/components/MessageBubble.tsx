import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, FileText } from "lucide-react";
import { generateReport } from "@/lib/api";
import { LumoraLogo } from "./LumoraLogo";
import { SourceList } from "./SourceList";
import type { ChatMessage } from "@/lib/storage";
import type { Source } from "@/lib/api";

interface Props {
  message: ChatMessage;
  sessionId: string;
  streaming?: boolean;
  onPreviewSource?: (s: Source) => void;
}

export function MessageBubble({ message, sessionId, streaming, onPreviewSource }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (isUser) {
    return (
      <div className="flex animate-fade-in-up justify-end">
        <div className="group flex max-w-[80%] flex-col items-end gap-1.5">
          <div className="rounded-2xl rounded-tr-md gradient-primary px-4 py-2.5 text-[0.95rem] leading-relaxed text-primary-foreground shadow-glow">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex animate-fade-in-up gap-3">
      <div className="mt-0.5 shrink-0">
        <LumoraLogo withWordmark={false} size={26} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Lumora
        </div>
        <div className="prose-chat text-foreground/95">
          {message.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          ) : streaming ? (
            <TypingIndicator />
          ) : null}
          {streaming && message.content && (
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-primary-glow align-middle" />
          )}
        </div>
        {message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} onPreview={onPreviewSource} />
        )}
        {message.content && !streaming && (
          <div className="group mt-2 flex items-center gap-2 opacity-100 hover:opacity-100 transition-opacity">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() =>
                generateReport(
                  message.content,
                  sessionId
                )
              }
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <FileText size={11} />
              Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="shimmer text-sm font-medium">Thinking</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary-glow"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
