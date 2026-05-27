import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Trash2, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  loadDocs,
  newId,
  saveDocs,
  type UploadedDoc,
} from "@/lib/storage";
import { uploadDocument, API_BASE } from "@/lib/api";

interface UploadState {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DocumentPanel({ open, onClose }: Props) {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocs(loadDocs());
  }, [open]);

  const persist = (next: UploadedDoc[]) => {
    setDocs(next);
    saveDocs(next);
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
      if (pdfs.length === 0) return;

      for (const file of pdfs) {
        const id = newId();
        setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
        try {
          await uploadDocument(file, (pct) => {
            setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: pct } : x)));
          });
          setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: 100 } : x)));
          persist([
            { id, name: file.name, size: file.size, uploadedAt: Date.now() },
            ...loadDocs(),
          ]);
          setTimeout(() => {
            setUploads((u) => u.filter((x) => x.id !== id));
          }, 800);
        } catch (e) {
          setUploads((u) =>
            u.map((x) =>
              x.id === id ? { ...x, error: (e as Error).message } : x,
            ),
          );
        }
      }
    },
    [],
  );

  const removeDoc = async (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if(!doc) return;
    try{
      await fetch (
        `${API_BASE}/documents/${doc.name}`,
        {
          method: "DELETE"
        }
      );
      persist(docs.filter((d) => d.id !== id));
    }
    catch(error){
      console.error("Delete failed:", error);
    }
  };

  if (!open) return null;

  return (
    <aside className="flex h-screen w-[340px] shrink-0 animate-fade-in-up flex-col border-l border-border/60 bg-surface/60 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
        <div>
          <div className="text-sm font-semibold">Knowledge base</div>
          <div className="text-[11px] text-muted-foreground">PDF documents</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close documents"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all ${
            dragging
              ? "border-primary bg-primary/10 ring-glow"
              : "border-border/70 bg-surface-elevated/40 hover:border-primary/50 hover:bg-accent/20"
          }`}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Upload size={18} />
          </div>
          <div className="text-sm font-medium">
            {dragging ? "Drop to upload" : "Drag & drop PDFs"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            or <span className="text-primary-glow underline">browse files</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {uploads.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {uploads.map((u) => (
              <div
                key={u.id}
                className="overflow-hidden rounded-xl border border-border/70 glass px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  {u.error ? (
                    <AlertCircle size={13} className="shrink-0 text-destructive" />
                  ) : u.progress === 100 ? (
                    <CheckCircle2 size={13} className="shrink-0 text-primary-glow" />
                  ) : (
                    <FileText size={13} className="shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {u.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {u.error ? "Failed" : `${u.progress}%`}
                  </span>
                </div>
                {!u.error && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-input">
                    <div
                      className="h-full gradient-primary transition-[width] duration-200"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
                {u.error && (
                  <div className="mt-1 text-[10px] text-destructive">{u.error}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {docs.length > 0 ? `${docs.length} document${docs.length > 1 ? "s" : ""}` : "Documents"}
        </div>

        {docs.length === 0 && uploads.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
            No documents yet. Upload PDFs to ground Lumora's answers.
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {docs.map((d) => (
            <div
              key={d.id}
              className="group flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface-elevated/40 px-3 py-2 transition-all hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/15 text-primary-glow">
                <FileText size={13} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{d.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {formatBytes(d.size)}
                </div>
              </div>
              <button
                onClick={async () => await removeDoc(d.id)}
                aria-label="Remove document"
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
