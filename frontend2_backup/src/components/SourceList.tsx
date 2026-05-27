import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import type { Source } from "@/lib/api";

interface Props {
  sources: Source[];
  onPreview?: (source: Source) => void;
}

export function SourceList({ sources, onPreview }: Props) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        Sources · {sources.length}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((s, i) => (
          <SourceCard key={`${s.source}-${i}`} index={i + 1} source={s} onPreview={onPreview} />
        ))}
      </div>
    </div>
  );
}

function SourceCard({
  index,
  source,
  onPreview,
}: {
  index: number;
  source: Source;
  onPreview?: (source: Source) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 glass transition-all hover:border-primary/40 hover:shadow-glow">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/15 text-[10px] font-bold text-primary-glow">
          {index}
        </span>
        <FileText size={13} className="shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">📄 {source.source}</div>
          {source.page && (
            <div className="text-[10px] text-muted-foreground">Page {source.page}</div>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-border/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <p className="line-clamp-[10] whitespace-pre-wrap">{source.snippet}</p>
          {onPreview && (
            <button
              onClick={() => onPreview(source)}
              className="mt-2 text-[11px] font-medium text-primary-glow hover:underline"
            >
              Open preview →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
