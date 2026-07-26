import { useEffect, useState } from "react";

const words = [
  "Research Papers",
  "Technical Documents",
  "Reports",
  "PDFs",
  "Knowledge Bases",
];

export default function TypingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setVisible(true);
      }, 300);

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`
        mt-6
        h-10
        text-center
        text-2xl
        font-semibold
        text-violet-300
        transition-all
        duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {words[index]}
    </div>
  );
}