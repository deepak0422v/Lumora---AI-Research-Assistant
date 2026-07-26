import { X } from "lucide-react";
import { useState } from "react";
import UploadDropzone from "../upload/UploadDropzone";
import UploadProgress from "../upload/UploadProgress";
import UploadedFileCard from "../upload/UploadedFileCard";
import type { useWorkspace } from "../../hooks/useWorkspace";

interface KnowledgePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  workspace?: ReturnType<typeof useWorkspace>;
}

export default function KnowledgePanel({
  isOpen,
  onToggle,
  workspace,
}: KnowledgePanelProps) {
  const [stage, setStage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const documents = workspace ? workspace.documents : [];

  const handleUploadFile = async (file: File) => {
    setErrorMsg("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF files are supported.");
      return;
    }

    if (documents.some((d) => d.filename.toLowerCase() === file.name.toLowerCase())) {
      setErrorMsg(`"${file.name}" is already in your knowledge base.`);
      return;
    }

    setStage("Uploading");

    setTimeout(() => setStage("Chunking"), 600);
    setTimeout(() => setStage("Embedding"), 1200);
    setTimeout(() => setStage("Indexing"), 1800);

    try {
      if (workspace) {
        await workspace.handleUploadFile(file);
      }
      setStage("Ready");
      setTimeout(() => setStage(""), 1000);
    } catch (err: any) {
      console.error("Upload error:", err);
      const rawMsg = err?.message || "Failed to upload document to server.";
      const cleanMsg = rawMsg.replace(/^Error:\s*/, "").trim();
      setErrorMsg(cleanMsg || "Failed to upload document to server.");
      setStage("");
    }
  };

  const handleDeleteFile = (filename: string) => {
    if (workspace) {
      workspace.handleDeleteFile(filename);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      className="
      relative
      h-screen
      w-[320px]
      shrink-0
      flex
      flex-col
      border-l
      border-white/10
      bg-[#0d071a]/60
      backdrop-blur-2xl
      p-5
      overflow-hidden
      z-20
      "
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between px-0.5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Knowledge base
          </h2>
          <p className="text-xs text-[#9d93b5] mt-0.5">
            PDF documents
          </p>
        </div>

        <button
          onClick={onToggle}
          className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          bg-white/10
          backdrop-blur-md
          text-[#9d93b5]
          transition-all
          hover:bg-white/20
          hover:text-white
          cursor-pointer
          "
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5">
        <UploadDropzone onUploadFile={handleUploadFile} />

        {errorMsg && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        {stage && <UploadProgress stage={stage} />}

        <div className="mt-6">
          <h3
            className="
            mb-3
            px-0.5
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-[#7e7399]
            "
          >
            {documents.length} {documents.length === 1 ? "DOCUMENT" : "DOCUMENTS"}
          </h3>

          <div className="space-y-2.5">
            {documents.length === 0 ? (
              <div
                className="
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-md
                p-4
                text-xs
                text-[#9d93b5]
                text-center
                "
              >
                No documents uploaded yet.
              </div>
            ) : (
              documents.map((doc) => (
                <UploadedFileCard
                  key={doc.id || doc.filename}
                  name={doc.filename}
                  size={doc.file_size || "11.8 KB"}
                  onDelete={() => handleDeleteFile(doc.filename)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}