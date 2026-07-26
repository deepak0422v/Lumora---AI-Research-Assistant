interface SourceCardProps {
  title: string;
  page: number;
  snippet: string;
}

export default function SourceCard({
  title,
  page,
  snippet,
}: SourceCardProps) {
  return (
    <div
      className="
      glass
      mt-3
      rounded-2xl
      p-4
      "
    >
      <div className="mb-2 flex justify-between">
        <span className="font-medium">
          {title}
        </span>

        <span className="text-slate-400">
          Page {page}
        </span>
      </div>

      <p className="text-sm text-slate-400">
        {snippet}
      </p>
    </div>
  );
}