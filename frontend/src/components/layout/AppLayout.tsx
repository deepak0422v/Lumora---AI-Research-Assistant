import React, { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import KnowledgePanel from "./KnowledgePanel";
import { FileText, FileDown, Printer, Download } from "lucide-react";
import type { useWorkspace } from "../../hooks/useWorkspace";

interface AppLayoutProps {
  children: ReactNode;
  workspace?: ReturnType<typeof useWorkspace>;
}

export default function AppLayout({ children, workspace }: AppLayoutProps) {
  const sidebarOpen = workspace ? workspace.sidebarOpen : true;
  const documentsOpen = workspace ? workspace.documentsOpen : true;
  const setSidebarOpen = workspace ? workspace.setSidebarOpen : () => {};
  const setDocumentsOpen = workspace ? workspace.setDocumentsOpen : () => {};

  const activeSession = workspace?.sessions.find((s) => s.id === workspace.activeSessionId);
  const messages = workspace ? workspace.messages : [];

  const handleExportMarkdown = () => {
    if (!activeSession || messages.length === 0) return;
    
    let mdContent = `# Research Session: ${activeSession.title}\n\n`;
    messages.forEach((msg, index) => {
      const roleName = msg.role === "user" ? "User" : "Lumora (AI)";
      mdContent += `## ${index + 1}. ${roleName}\n\n${msg.content}\n\n`;
      if (msg.sources && msg.sources.length > 0) {
        mdContent += `### Sources:\n`;
        msg.sources.forEach((src, idx) => {
          mdContent += `- [${idx + 1}] **${src.source}**${src.page ? ` (Page ${src.page})` : ""}: *${src.snippet}*\n`;
        });
        mdContent += `\n`;
      }
    });

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSession.title.replace(/[^a-z0-9_.-]/gi, "_").toLowerCase()}_conversation.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-white relative bg-[#0c0914]">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        workspace={workspace}
      />

      {/* Ambient background glows */}
      <div
        className="
        absolute
        top-[-200px]
        left-[25%]
        h-[500px]
        w-[500px]
        rounded-full
        bg-violet-600/10
        blur-[180px]
        pointer-events-none
        "
      />

      {/* Main Center Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header Controls */}
        <div className="absolute top-5 right-6 z-20 flex items-center gap-3">
          {activeSession && activeSession.title !== "New exploration" && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/20 px-3.5 py-1.5 backdrop-blur-md text-xs text-violet-200 shadow-md">
              <span className="truncate max-w-[200px]">{activeSession.title}</span>
            </div>
          )}

          {/* Export & Report Button Group */}
          {activeSession && messages.length > 0 && (
            <div className="flex items-center gap-2 no-print">
              {/* Print PDF Button */}
              <button
                onClick={handlePrint}
                title="Print or Save as PDF"
                className="
                group
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-[#312252]
                bg-[#160f27]/90
                transition-all
                hover:border-[#583a91]
                hover:bg-[#201538]
                text-[#e2d9f3]
                hover:text-white
                cursor-pointer
                "
              >
                <Printer size={14} />
              </button>

              {/* Export Markdown Button */}
              <button
                onClick={handleExportMarkdown}
                title="Export as Markdown"
                className="
                group
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-[#312252]
                bg-[#160f27]/90
                transition-all
                hover:border-[#583a91]
                hover:bg-[#201538]
                text-[#e2d9f3]
                hover:text-white
                cursor-pointer
                "
              >
                <Download size={14} />
              </button>

              {/* Download Report Button */}
              <button
                onClick={workspace?.handleDownloadReport}
                disabled={workspace?.isGeneratingReport}
                className="
                group
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[#312252]
                bg-[#160f27]/90
                px-4
                py-2
                text-xs
                font-medium
                text-[#e2d9f3]
                backdrop-blur-md
                transition-all
                duration-200
                hover:border-[#583a91]
                hover:bg-[#201538]
                hover:text-white
                cursor-pointer
                disabled:opacity-50
                disabled:cursor-not-allowed
                "
              >
                <FileDown size={14} className="text-[#a78bfa] group-hover:text-white" />
                <span>{workspace?.isGeneratingReport ? "Generating..." : "Download Report"}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setDocumentsOpen(!documentsOpen)}
            className={`
            group
            flex
            items-center
            gap-2
            rounded-full
            border
            px-4
            py-2
            text-xs
            font-medium
            backdrop-blur-md
            transition-all
            duration-200
            cursor-pointer
            shadow-lg
            ${
              documentsOpen
                ? "border-[#7c3aed]/50 bg-[#1c1233] text-white shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                : "border-[#312252] bg-[#160f27]/90 text-[#e2d9f3] hover:border-[#583a91] hover:bg-[#201538] hover:text-white"
            }
            `}
          >
            <FileText
              size={14}
              className={`transition-colors ${
                documentsOpen ? "text-[#c4b5fd]" : "text-[#a78bfa] group-hover:text-white"
              }`}
            />
            <span>Documents</span>
            {documentsOpen && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
            )}
          </button>
        </div>

        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              onOpenDocuments: () => setDocumentsOpen(true),
            })
          : children}
      </main>

      {/* Right Knowledge Base Panel */}
      {documentsOpen && (
        <KnowledgePanel
          isOpen={documentsOpen}
          onToggle={() => setDocumentsOpen(false)}
          workspace={workspace}
        />
      )}
    </div>
  );
}