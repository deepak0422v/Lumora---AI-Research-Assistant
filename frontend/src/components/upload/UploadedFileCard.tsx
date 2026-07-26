import { FileText, Trash2 } from "lucide-react";

interface UploadedFileCardProps {
  name: string;
  size?: string;
  onDelete: () => void;
}

export default function UploadedFileCard({
  name,
  size = "11.8 KB",
  onDelete,
}: UploadedFileCardProps) {
  return (
    <div
      className="
      group
      flex
      items-center
      justify-between
      gap-2.5
      rounded-xl
      border
      border-white/10
      bg-white/[0.03]
      backdrop-blur-md
      p-3
      transition-all
      hover:border-violet-500/40
      hover:bg-violet-500/10
      "
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-violet-500/20
          text-violet-300
          border
          border-violet-500/30
          "
        >
          <FileText size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white leading-tight">
            {name}
          </p>

          <p className="mt-0.5 text-xs text-[#9d93b5] leading-tight">
            {size}
          </p>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="
        opacity-0
        transition-all
        group-hover:opacity-100
        text-[#9d93b5]
        hover:text-red-400
        p-1
        cursor-pointer
        "
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}