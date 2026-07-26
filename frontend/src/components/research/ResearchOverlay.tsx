interface ResearchOverlayProps {
  visible: boolean;
}

export default function ResearchOverlay({
  visible,
}: ResearchOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="
      absolute
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      backdrop-blur-md
      "
    >
      <div
        className="
        glass
        w-[520px]
        rounded-3xl
        p-8
        "
      >
        <h2
          className="
          mb-6
          text-center
          text-xl
          font-semibold
          "
        >
          Lumora is analyzing your documents...
        </h2>

        <div className="space-y-4">

          <div className="flex items-center gap-3">
            <span>✓</span>
            <span>Reading Documents</span>
          </div>

          <div className="flex items-center gap-3">
            <span>✓</span>
            <span>Retrieving Context</span>
          </div>

          <div className="flex items-center gap-3">
            <span>✓</span>
            <span>Ranking Sources</span>
          </div>

          <div className="flex items-center gap-3 text-violet-300">
            <span>⟳</span>
            <span>Generating Answer</span>
          </div>

        </div>
      </div>
    </div>
  );
}