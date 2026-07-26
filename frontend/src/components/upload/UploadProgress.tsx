interface UploadProgressProps {
  stage: string;
}

export default function UploadProgress({
  stage,
}: UploadProgressProps) {
  const stages = [
    "Uploading",
    "Chunking",
    "Embedding",
    "Indexing",
    "Ready",
  ];

  return (
    <div className="mt-4 space-y-2">
      {stages.map((item) => (
        <div
          key={item}
          className="
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-white/5
          bg-white/[0.02]
          px-3
          py-2
          text-sm
          "
        >
          <span>{item}</span>

          <span
            className={
              stages.indexOf(item) <= stages.indexOf(stage)
                ? "text-emerald-400"
                : "text-slate-500"
            }
          >
            ✓
          </span>
        </div>
      ))}
    </div>
  );
}