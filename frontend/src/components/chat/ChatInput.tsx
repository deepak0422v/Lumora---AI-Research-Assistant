import { ArrowUp, Eye, Paperclip, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend?: (message: string, files?: File[]) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
}

export default function ChatInput({ onSend, inputRef }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync internal ref with external inputRef if provided
  useEffect(() => {
    if (inputRef && internalRef.current) {
      (inputRef as React.MutableRefObject<any>).current = internalRef.current;
    }
  }, [inputRef]);

  // Adjust textarea height dynamically up to 200px
  const adjustHeight = () => {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 200);
    el.style.height = `${newHeight}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    if (!message.trim() && files.length === 0) return;
    onSend?.(message, files);
    setMessage("");
    setFiles([]);
    if (internalRef.current) {
      internalRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* FILE PREVIEW */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 w-full">
          {files.map((file, index) => (
            <div
              key={index}
              className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-[#3c2a5c]
              bg-[#1d1433]
              px-2.5
              py-1
              text-xs
              text-slate-200
              "
            >
              <span className="max-w-[180px] truncate">{file.name}</span>

              <button
                onClick={() => window.open(URL.createObjectURL(file))}
                className="text-slate-400 hover:text-white"
              >
                <Eye size={12} />
              </button>

              <button
                onClick={() => removeFile(index)}
                className="text-slate-400 hover:text-red-400"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* INPUT BAR */}
      <div
        className="
        relative
        flex
        w-full
        items-end
        gap-2.5
        rounded-[24px]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-2xl
        px-4
        py-2.5
        shadow-[0_10px_35px_rgba(0,0,0,0.45)]
        transition-all
        focus-within:border-violet-500/50
        focus-within:bg-white/[0.06]
        focus-within:shadow-[0_0_30px_rgba(139,92,246,0.25)]
        "
      >
        {/* ATTACHMENT ICON BUTTON */}
        <label
          className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          text-[#8e84a3]
          transition-colors
          hover:bg-white/10
          hover:text-white
          cursor-pointer
          shrink-0
          mb-0.5
          "
          title="Add attachment"
        >
          <Paperclip size={16} />

          <input
            type="file"
            hidden
            multiple
            accept=".pdf"
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              if (selected.length) {
                setFiles((prev) => [...prev, ...selected]);
              }
            }}
          />
        </label>

        {/* AUTO-EXPANDING TEXTAREA */}
        <textarea
          ref={internalRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask Lumora anything about your documents..."
          className="
          flex-1
          bg-transparent
          text-sm
          text-white
          outline-none
          placeholder:text-[#7d7296]
          resize-none
          max-h-[200px]
          py-1.5
          leading-relaxed
          overflow-y-auto
          "
          style={{ height: "auto" }}
        />

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          className="
          flex
          h-8.5
          w-8.5
          items-center
          justify-center
          rounded-full
          bg-[#7c3aed]
          text-white
          transition-all
          hover:bg-[#6d28d9]
          shrink-0
          cursor-pointer
          mb-0.5
          "
        >
          <ArrowUp size={16} />
        </button>
      </div>

      {/* DISCLAIMER */}
      <p className="mt-2 text-xs text-[#6e6388] text-center font-normal">
        Lumora can make mistakes — verify important details with the cited sources.
      </p>
    </div>
  );
}