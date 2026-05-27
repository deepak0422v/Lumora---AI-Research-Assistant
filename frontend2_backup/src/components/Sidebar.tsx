import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { LumoraLogo } from "./LumoraLogo";
import type { Thread } from "@/lib/storage";

interface Props {
  threads: Thread[];
  activeId?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewThread: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  threads,
  activeId,
  collapsed,
  onToggleCollapse,
  onNewThread,
  onRename,
  onDelete,
}: Props) {
  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col border-r border-border/60 bg-surface/60 backdrop-blur-xl transition-[width] duration-300 ease-out ${
        collapsed ? "w-[68px]" : "w-[280px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5">
        {!collapsed ? (
          <Link to="/" className="px-1.5">
            <LumoraLogo />
          </Link>
        ) : (
          <Link to="/" className="mx-auto">
            <LumoraLogo withWordmark={false} size={24} />
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`${
            collapsed ? "absolute right-2 top-3.5" : ""
          } rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-accent/40 hover:text-foreground`}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* New exploration */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewThread}
          className={`group flex w-full items-center gap-2.5 rounded-xl border border-border/70 bg-surface-elevated/60 px-3 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-glow ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="grid h-6 w-6 place-items-center rounded-md gradient-primary text-primary-foreground transition-transform group-hover:scale-110">
            <Plus size={14} strokeWidth={2.5} />
          </span>
          {!collapsed && <span>New exploration</span>}
        </button>
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {!collapsed && (
          <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Recent
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {threads.length === 0 && !collapsed && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No explorations yet.
            </div>
          )}
          {threads.map((t) => (
            <ThreadRow
              key={t.id}
              thread={t}
              active={t.id === activeId}
              collapsed={collapsed}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-border/60 p-3">
          <div className="rounded-xl glass px-3 py-2.5 text-[11px] text-muted-foreground">
            <div className="font-medium text-foreground/80">Lumora Research</div>
            <div>AI-assisted document exploration</div>
          </div>
        </div>
      )}
    </aside>
  );
}

function ThreadRow({
  thread,
  active,
  collapsed,
  onRename,
  onDelete,
}: {
  thread: Thread;
  active: boolean;
  collapsed: boolean;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { sessionId?: string };
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(thread.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const next = draft.trim() || thread.title;
    onRename(thread.id, next);
    setEditing(false);
  };

  return (
    <div
      className={`group relative flex items-center rounded-lg transition-all ${
        active
          ? "bg-accent/50 text-foreground ring-glow"
          : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
      }`}
    >
      <button
        onClick={() => {
          if (editing) return;
          if (params.sessionId !== thread.id) {
            navigate({ to: "/$sessionId", params: { sessionId: thread.id } });
          }
        }}
        className={`flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left text-sm ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <MessageSquare
          size={14}
          className={`shrink-0 ${active ? "text-primary-glow" : ""}`}
        />
        {!collapsed && (
          editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraft(thread.title);
                  setEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="min-w-0 flex-1 rounded border border-primary/40 bg-input/80 px-1.5 py-0.5 text-sm outline-none"
            />
          ) : (
            <span className="truncate">{thread.title}</span>
          )
        )}
      </button>
      {!collapsed && !editing && (
        <div className="relative pr-1" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={`grid h-7 w-7 place-items-center rounded-md transition-all ${
              menuOpen
                ? "bg-accent/60 text-foreground"
                : "text-muted-foreground opacity-0 hover:bg-accent/60 hover:text-foreground group-hover:opacity-100"
            }`}
            aria-label="Chat options"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-36 origin-top-right animate-scale-in overflow-hidden rounded-lg border border-border/80 glass-strong shadow-elevated">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setDraft(thread.title);
                  setEditing(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/60"
              >
                <Pencil size={13} /> Rename
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(thread.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/15"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
