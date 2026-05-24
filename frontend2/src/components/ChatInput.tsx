import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";

interface Props {
  onSubmit: (text: string) => void;
  onStop?: () => void;
  busy: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, onStop, busy, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-focus & auto-resize
  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    if (!busy) ref.current?.focus();
  }, [busy]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = value.trim();
    if (!text || busy || disabled) return;
    onSubmit(text);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="relative mx-auto w-full max-w-3xl"
    >
      <div className="relative rounded-2xl border border-border/70 glass-strong shadow-elevated transition-all focus-within:border-primary/60 focus-within:ring-glow">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "Ask Lumora anything about your documents…"}
          rows={1}
          disabled={disabled}
          className="block w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-[0.95rem] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50"
          style={{ maxHeight: 220 }}
        />
        <div className="absolute bottom-2.5 right-2.5">
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/90 text-destructive-foreground transition-all hover:bg-destructive"
              aria-label="Stop generating"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || disabled}
              className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Send message"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] text-muted-foreground/60">
        Lumora can make mistakes — verify important details with the cited sources.
      </div>
    </form>
  );
}
