export default function TypingIndicator() {
  return (
    <div className="mb-6 flex justify-start">
      <div className="glass rounded-3xl px-5 py-4">
        <div className="flex gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}