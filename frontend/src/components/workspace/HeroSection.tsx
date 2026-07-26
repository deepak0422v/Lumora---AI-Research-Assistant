import { Sparkles } from "lucide-react";

import FeatureCards from "./FeatureCards";
import ChatInput from "../chat/ChatInput";
import ChatWindow from "../chat/ChatWindow";
import type { useWorkspace } from "../../hooks/useWorkspace";

interface HeroSectionProps {
  onOpenDocuments?: () => void;
  workspace?: ReturnType<typeof useWorkspace>;
}

export default function HeroSection({
  onOpenDocuments,
  workspace,
}: HeroSectionProps) {
  const messages = workspace ? workspace.messages : [];

  const handleSend = (text: string, files?: File[]) => {
    if (workspace) {
      workspace.handleSendMessage(text, files);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between pt-4 pb-3 px-4 overflow-hidden relative">
      {/* Main Message Window / Landing Cards Container */}
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center overflow-y-auto py-4">
            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto flex flex-col items-center text-center my-auto">
              {/* Top Glowing Flower Badge */}
              <div className="mb-5 flex justify-center">
                <div
                  className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#26133a]
                  border
                  border-[#48206d]
                  text-[#ec4899]
                  shadow-[0_0_15px_rgba(236,72,153,0.2)]
                  "
                >
                  <Sparkles size={18} />
                </div>
              </div>

              {/* Main Title */}
              <h1
                className="
                text-3xl
                sm:text-4xl
                font-bold
                tracking-tight
                text-white
                mb-3
                "
              >
                What would you like to{" "}
                <span
                  className="
                  bg-gradient-to-r
                  from-[#ba68ed]
                  to-[#ec4899]
                  bg-clip-text
                  text-transparent
                  "
                >
                  explore
                </span>
                <span className="text-white">?</span>
              </h1>

              {/* Subtitles */}
              <div className="space-y-0.5 mb-8 text-[#9d93b3] text-xs sm:text-sm max-w-lg leading-relaxed">
                <p>Lumora reads your documents and answers with grounded citations.</p>
                <p>Drop in PDFs and start asking.</p>
              </div>

              {/* Feature Cards Grid */}
              <div className="w-full">
                <FeatureCards
                  onCardClick={(desc) => handleSend(desc)}
                  onManageKnowledgeBase={onOpenDocuments}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 w-full">
            <ChatWindow
              messages={messages}
              onRetry={workspace?.handleRetryMessage}
              onEditPrompt={workspace?.handleEditPrompt}
            />
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="shrink-0 w-full max-w-4xl xl:max-w-5xl mx-auto pt-2 pb-1 z-10 bg-gradient-to-t from-[#0c0914] via-[#0c0914]/90 to-transparent">
        <ChatInput onSend={handleSend} inputRef={workspace?.chatInputRef} />
      </div>
    </div>
  );
}