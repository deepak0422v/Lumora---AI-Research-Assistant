import {
  Sparkles,
  PanelLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  Square,
} from "lucide-react";
import { useState } from "react";
import type { useWorkspace } from "../../hooks/useWorkspace";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  workspace?: ReturnType<typeof useWorkspace>;
}

export default function Sidebar({ isOpen, onToggle, workspace }: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const sessions = workspace ? workspace.sessions : [];
  const activeSessionId = workspace ? workspace.activeSessionId : "";

  const handleCreateNew = () => {
    workspace?.handleNewSession();
  };

  const handleSelect = (id: string) => {
    workspace?.handleSelectSession(id);
  };

  const handleDelete = (id: string) => {
    workspace?.handleDeleteSession(id);
  };

  const saveRename = () => {
    if (!editedName.trim() || !editingId) return;
    workspace?.handleRenameSession(editingId, editedName);
    setEditingId(null);
  };

  if (!isOpen) {
    return (
      <div className="p-3 border-r border-[#1f172e] h-screen bg-[#0d0915] z-20">
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer text-[#8e84a3] hover:text-white hover:bg-[#1a1329]"
        >
          <PanelLeft size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="
      flex
      w-[280px]
      shrink-0
      flex-col
      justify-between
      border-r
      border-white/10
      bg-[#0d071a]/60
      backdrop-blur-2xl
      p-4.5
      h-screen
      overflow-hidden
      z-20
      "
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <div className="mb-5 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div
              className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              bg-fuchsia-500/20
              text-fuchsia-400
              border
              border-fuchsia-500/30
              "
            >
              <Sparkles size={13} />
            </div>

            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              Lumora
            </h2>
          </div>

          <button
            onClick={onToggle}
            className="
            rounded-lg
            p-1
            text-[#9d93b5]
            transition-all
            hover:bg-white/10
            hover:text-white
            cursor-pointer
            "
          >
            <PanelLeft size={16} />
          </button>
        </div>

        {/* New Exploration Button */}
        <button
          onClick={handleCreateNew}
          className="
          mb-5
          group
          flex
          w-full
          items-center
          gap-2.5
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-md
          py-2.5
          px-3.5
          text-sm
          font-medium
          text-white
          transition-all
          hover:bg-white/[0.08]
          hover:border-violet-500/40
          hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]
          cursor-pointer
          "
        >
          <div
            className="
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-violet-600
            text-white
            "
          >
            <Plus size={14} />
          </div>

          <span>New exploration</span>
        </button>

        {/* Recent Section */}
        <div className="flex-1 overflow-y-auto pr-0.5">
          <p
            className="
            mb-2.5
            px-1
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-[#7e7399]
            "
          >
            RECENT
          </p>

          <div className="space-y-1">
            {sessions.map((session) => (
              <div key={session.id}>
                {editingId === session.id ? (
                  <div className="flex items-center gap-1.5 rounded-xl border border-violet-500/50 bg-violet-500/15 backdrop-blur-md p-1.5">
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveRename();
                        }
                      }}
                      className="
                      flex-1
                      bg-transparent
                      px-2
                      py-0.5
                      text-sm
                      text-white
                      outline-none
                      "
                      autoFocus
                    />

                    <button
                      onClick={() => saveRename()}
                      className="text-emerald-400 cursor-pointer p-1 hover:bg-white/10 rounded"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleSelect(session.id)}
                    className={`
                    group
                    flex
                    items-center
                    justify-between
                    gap-2
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition-all
                    cursor-pointer

                    ${activeSessionId === session.id
                        ? `
                        border
                        border-violet-500/40
                        bg-violet-500/15
                        backdrop-blur-md
                        text-white
                        shadow-[0_0_20px_rgba(139,92,246,0.15)]
                        `
                        : `
                        border
                        border-transparent
                        text-[#9d93b5]
                        hover:bg-white/[0.05]
                        hover:text-white
                        `
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Square size={14} className="shrink-0 opacity-70" />
                      <span className="truncate flex-1">{session.title}</span>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(session.id);
                          setEditedName(session.title);
                        }}
                        className="
                        p-1
                        text-[#9d93b5]
                        hover:text-violet-300
                        hover:bg-white/10
                        rounded
                        transition-colors
                        cursor-pointer
                        "
                        title="Rename"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session.id);
                        }}
                        className="
                        p-1
                        text-[#9d93b5]
                        hover:text-red-400
                        hover:bg-white/10
                        rounded
                        transition-colors
                        cursor-pointer
                        "
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Card */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3.5">
        <p className="text-sm font-semibold text-white">Lumora Research</p>

        <p className="mt-0.5 text-xs text-[#9d93b5]">
          AI-assisted document exploration
        </p>
      </div>
    </aside>
  );
}