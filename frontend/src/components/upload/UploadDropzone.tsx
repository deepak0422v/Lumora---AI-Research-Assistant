import { useState } from "react";
import { Upload } from "lucide-react";

interface UploadDropzoneProps {
  onUploadFile?: (file: File) => void;
  onUpload?: (fileName: string) => void;
}

export default function UploadDropzone({
  onUploadFile,
  onUpload,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      if (onUploadFile) {
        onUploadFile(files[0]);
      } else if (onUpload) {
        onUpload(files[0].name);
      }
    }
  };

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onDrop={handleDrop}
      className={`
        relative
        flex
        h-36
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        backdrop-blur-xl
        transition-all
        cursor-pointer
        p-4
        text-center

        ${
          dragging
            ? "border-violet-500 bg-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            : "border-violet-500/30 bg-violet-500/[0.04] hover:border-violet-500/50 hover:bg-violet-500/[0.08]"
        }
      `}
    >
      <div
        className="
        mb-3
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        bg-violet-600
        text-white
        shadow-[0_0_20px_rgba(124,58,237,0.4)]
        "
      >
        <Upload size={18} />
      </div>

      <h3 className="text-sm font-semibold text-white mb-1">
        Drag & drop PDFs
      </h3>

      <p className="text-xs text-[#9d93b5]">
        or <span className="text-violet-400 underline cursor-pointer hover:text-violet-300">browse files</span>
      </p>

      <input
        type="file"
        accept=".pdf"
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-pointer
          opacity-0
        "
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            if (onUploadFile) {
              onUploadFile(file);
            } else if (onUpload) {
              onUpload(file.name);
            }
          }
        }}
      />
    </div>
  );
}