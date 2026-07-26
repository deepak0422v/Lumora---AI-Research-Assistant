import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import ChatMessageComponent from "./ChatMessage";
import type { ApiMessage } from "../../services/api";

interface ChatWindowProps {
  messages: ApiMessage[];
  onRetry?: (messageId: string) => void;
  onEditPrompt?: (promptText: string) => void;
}

export default function ChatWindow({
  messages,
  onRetry,
  onEditPrompt,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const userScrolledUp = useRef(false);

  const checkIfNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom < 120;
  }, []);

  const handleScroll = useCallback(() => {
    const isNearBottom = checkIfNearBottom();
    userScrolledUp.current = !isNearBottom;
    setShowScrollBottom(!isNearBottom);
  }, [checkIfNearBottom]);

  const scrollToBottom = useCallback((smooth = true) => {
    userScrolledUp.current = false;
    setShowScrollBottom(false);
    if (smooth) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const prevCountRef = useRef(messages.length);

  // Auto-scroll logic: Smooth scroll on new prompt creation, direct scroll during streaming tokens to eliminate lag
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      userScrolledUp.current = false;
      scrollToBottom(true);
    } else if (!userScrolledUp.current) {
      scrollToBottom(false);
    }
    prevCountRef.current = messages.length;
  }, [messages, scrollToBottom]);

  return (
    <div className="relative flex-1 min-h-0 w-full flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto w-full max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth"
      >
        {messages.map((message, index) => {
          let prevUserMessageContent = "";
          if (message.role === "assistant") {
            for (let i = index - 1; i >= 0; i--) {
              if (messages[i].role === "user") {
                prevUserMessageContent = messages[i].content;
                break;
              }
            }
          }

          return (
            <ChatMessageComponent
              key={message.id}
              message={message}
              onRetry={onRetry}
              onEditPrompt={onEditPrompt}
              prevUserMessageContent={prevUserMessageContent}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-1/2 translate-x-1/2 flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-[#19102e]/90 px-3.5 py-1.5 text-xs text-violet-200 shadow-xl backdrop-blur-md hover:bg-violet-600/30 hover:text-white transition-all cursor-pointer z-20"
        >
          <ArrowDown size={14} className="animate-bounce" />
          <span>Scroll to bottom</span>
        </button>
      )}
    </div>
  );
}