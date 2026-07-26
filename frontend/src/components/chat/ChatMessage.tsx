import { useState } from "react";
import { Copy, Check, Flag, FileText, ChevronDown, ChevronUp, AlertCircle, RotateCcw, Edit3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ApiMessage } from "../../services/api";

interface ChatMessageProps {
  message: ApiMessage;
  onRetry?: (messageId: string) => void;
  onEditPrompt?: (promptText: string) => void;
  prevUserMessageContent?: string;
}

const markdownComponents = {
  table: ({ children, ...props }: any) => (
    <div className="my-4 w-full overflow-x-auto rounded-xl border border-violet-500/30 bg-[#160b2d]/90 backdrop-blur-md shadow-xl">
      <table className="w-full text-left text-xs sm:text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-[#241347]/90 border-b border-violet-500/30 text-violet-200 font-semibold" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-3 border-r last:border-r-0 border-white/10 font-semibold text-violet-200 tracking-wide text-xs sm:text-sm" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-3 border-b border-r last:border-r-0 border-white/10 text-[#e0daee] leading-relaxed" {...props}>
      {children}
    </td>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-white/[0.04] transition-colors odd:bg-white/[0.02]" {...props}>
      {children}
    </tr>
  ),
  p: ({ children, ...props }: any) => (
    <p className="mb-3 last:mb-0 leading-relaxed text-[#d4cfdf]" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="mb-3 ml-5 list-disc space-y-1 text-[#d4cfdf]" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1 text-[#d4cfdf]" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-white" {...props}>
      {children}
    </strong>
  ),
  code: ({ children, inline, ...props }: any) => (
    <code className="rounded bg-[#1e143b] px-1.5 py-0.5 font-mono text-xs text-pink-300 border border-violet-500/20" {...props}>
      {children}
    </code>
  ),
  a: ({ children, href, ...props }: any) => {
    if (href && href.startsWith("#source-")) {
      const index = href.replace("#source-", "");
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById(href.slice(1));
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "center" });
              target.classList.add("bg-violet-500/30", "border-violet-500/80", "shadow-[0_0_15px_rgba(139,92,246,0.3)]");
              setTimeout(() => {
                target.classList.remove("bg-violet-500/30", "border-violet-500/80", "shadow-[0_0_15px_rgba(139,92,246,0.3)]");
              }, 2000);
            }
          }}
          className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-violet-600/40 border border-violet-500/50 text-[10px] font-semibold text-violet-200 hover:bg-violet-600 hover:text-white transition-all mx-0.5"
          {...props}
        >
          {index}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-400 hover:text-white hover:underline transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },
};

export default function ChatMessage({
  message,
  onRetry,
  onEditPrompt,
  prevUserMessageContent,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="mb-6 flex justify-end">
        <div className="rounded-2xl border border-violet-500/40 bg-violet-600/30 px-4.5 py-3 backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.15)] max-w-[85%]">
          <p className="text-sm font-medium text-white whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const sources = message.sources || [];
  const isStreaming = message.status === "streaming";
  const isThinking =
    message.status === "thinking" ||
    message.status === "searching" ||
    message.status === "retrieving" ||
    message.status === "generating" ||
    (!message.content && !message.error && message.status !== "complete");
  const isError = message.status === "error" || Boolean(message.error);

  const thinkingText = message.thinkingText || "Thinking...";

  const preprocessContent = (text: string) => {
    if (!text) return "";
    return text.replace(/\[([0-9]+)\]/g, "[$1](#source-$1)");
  };

  return (
    <div className="mb-8 w-full">
      {/* Lumora Header */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            isStreaming || isThinking ? "bg-violet-400 animate-ping" : "bg-pink-500 animate-pulse"
          }`}
        />
        <span className="text-xs font-semibold tracking-wider text-pink-400 font-mono">
          LUMORA
        </span>
      </div>

      {/* Minimal Inline Thinking Indicator */}
      {isThinking && (
        <div className="flex items-center gap-2 text-[#a78bfa] py-1 text-xs sm:text-sm font-medium animate-pulse mb-2">
          <div className="flex gap-1 items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" />
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-[#c4b5fd] text-xs font-mono">{thinkingText}</span>
        </div>
      )}

      {/* AI Message Content */}
      <div className="text-sm sm:text-base text-[#d4cfdf] leading-relaxed font-normal">
        {message.content && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {preprocessContent(message.content)}
          </ReactMarkdown>
        )}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-violet-400 animate-pulse rounded-sm align-middle" />
        )}
      </div>

      {/* Inline Error Component */}
      {isError && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-200 backdrop-blur-md w-fit shadow-md">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <span>Unable to generate a response.</span>
          </div>

          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-500/40 cursor-pointer shadow-sm"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            )}

            {onEditPrompt && prevUserMessageContent && (
              <button
                onClick={() => onEditPrompt(prevUserMessageContent)}
                className="flex items-center gap-1 text-xs text-violet-300 hover:text-white transition-colors cursor-pointer px-1 py-0.5"
              >
                <Edit3 size={12} />
                Edit Prompt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sources Section */}
      {sources.length > 0 && (
        <div className="mt-5 pt-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7e7399]">
            SOURCES • {sources.length}
          </div>

          <div className="space-y-2">
            {sources.map((src, index) => {
              const srcId = src.id || `${src.source}-${index}`;
              const isExpanded = expandedSource === srcId;
              const fileName = src.source || src.title || "Document.pdf";

              return (
                <div key={srcId} className="w-full max-w-md sm:max-w-lg">
                  <div
                    id={`source-${index + 1}`}
                    className="flex flex-col rounded-xl border border-white/10 bg-[#130a24]/80 backdrop-blur-md overflow-hidden transition-all duration-300"
                  >
                    <div
                      onClick={() => setExpandedSource(isExpanded ? null : srcId)}
                      className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Number Badge */}
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/30 border border-violet-500/40 text-xs font-semibold text-violet-300">
                          {index + 1}
                        </div>

                        {/* File Details */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FileText size={14} className="text-violet-400 shrink-0" />
                          {src.pdf_url ? (
                            <a
                              href={src.page ? `${src.pdf_url}#page=${src.page}` : src.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="truncate text-xs font-medium text-violet-300 hover:text-white hover:underline transition-colors"
                            >
                              {fileName}
                            </a>
                          ) : (
                            <span className="truncate text-xs font-medium text-white">
                              {fileName}
                            </span>
                          )}
                          {src.page && (
                            <span className="text-xs text-[#9d93b5] shrink-0">
                              Page {src.page}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chevron button */}
                      <div className="text-[#9d93b5] hover:text-white p-0.5">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>

                    {/* Expanded snippet view */}
                    {isExpanded && src.snippet && (
                      <div className="border-t border-white/10 bg-black/20 p-3 text-xs text-[#b3a8cb] leading-relaxed italic">
                        "{src.snippet}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Toolbar (Copy & Report) */}
      {message.content && !isThinking && (
        <div className="mt-4 flex items-center gap-3.5 text-xs text-[#9d93b5]">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>

          <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <Flag size={13} />
            <span>Report</span>
          </button>
        </div>
      )}
    </div>
  );
}