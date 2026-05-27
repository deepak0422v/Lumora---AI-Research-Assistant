import { X, FileText, ExternalLink } from "lucide-react";
import type { Source } from "@/lib/api";
interface Props {
  source: Source | null;
  onClose: () => void;
}
export function SourcePreview({
  source,
  onClose
}: Props) {
  if (!source) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/70 glass-strong shadow-elevated"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary-glow">
              <FileText size={15}/>
            </div>
            <div>
              <div className="text-sm font-semibold">
                📄 {source.source}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Page {source.page}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent/40"
          >
            <X size={16}/>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-glow">
            Evidence used by Lumora
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            <div className="space-y-3">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="mb-2 text-xs font-semibold text-primary-glow">Evidence Location</div>
                <div className="text-xs text-muted-foreground">📄 {source.source}</div>
                <div className="text-xs text-muted-foreground">📍 Page {source.page}</div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                <mark className="rounded bg-primary/20 px-1 py-0.5 text-foreground">
                  {source.snippet}
                </mark>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <button onClick={() => {
              if(source.pdf_url){
                window.open(
                  `${source.pdf_url}#page=${source.page}`,
                  "_blank"
                )
              }
            }}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent/30"
            >
              <ExternalLink size={13}/>
              Open Original PDF
            </button>
          </div>
          <div className="mt-4 text-center text-[11px] text-muted-foreground/70">
            Retrieved chunk from page {source.page}
          </div>
        </div>
      </div>
    </div>
  );
}