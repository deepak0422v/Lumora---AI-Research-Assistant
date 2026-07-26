import { FileText, BookOpen, Lightbulb, Sparkles, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: FileText,
    title: "Summarize a paper",
    description:
      "Summarize the key findings from my latest uploaded research paper.",
  },
  {
    icon: BookOpen,
    title: "Compare sources",
    description:
      "Compare the methodologies used across the documents in my knowledge base.",
  },
  {
    icon: Lightbulb,
    title: "Generate ideas",
    description:
      "Suggest follow-up research questions based on the materials I've shared.",
  },
  {
    icon: Sparkles,
    title: "Extract insights",
    description:
      "Pull out the most important insights and quote the supporting passages.",
  },
];

interface FeatureCardsProps {
  onCardClick?: (text: string) => void;
  onManageKnowledgeBase?: () => void;
}

export default function FeatureCards({
  onCardClick,
  onManageKnowledgeBase,
}: FeatureCardsProps) {
  return (
    <div className="w-full max-w-[680px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => onCardClick?.(card.description)}
              className="
              group
              flex
              items-start
              gap-3.5
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-xl
              p-4
              text-left
              cursor-pointer
              transition-all
              duration-250
              hover:border-violet-500/40
              hover:bg-violet-500/10
              hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]
              "
            >
              <div
                className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-violet-500/30
                bg-violet-500/15
                text-violet-300
                backdrop-blur-md
                transition-colors
                group-hover:border-violet-500/50
                group-hover:bg-violet-500/25
                group-hover:text-violet-200
                "
              >
                <Icon size={16} />
              </div>

              <div className="flex-1">
                <h3
                  className="
                  mb-0.5
                  text-xs
                  font-semibold
                  text-white
                  transition-colors
                  group-hover:text-violet-200
                  "
                >
                  {card.title}
                </h3>

                <p
                  className="
                  text-[11px]
                  leading-relaxed
                  text-[#9d93b5]
                  transition-colors
                  group-hover:text-[#c4b5fd]
                  "
                >
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={onManageKnowledgeBase}
          className="
          inline-flex
          items-center
          gap-1
          text-xs
          font-medium
          text-[#a78bfa]
          transition-colors
          hover:text-[#c4b5fd]
          cursor-pointer
          "
        >
          <span>Manage knowledge base</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}