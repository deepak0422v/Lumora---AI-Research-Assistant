import { motion } from "framer-motion";

export default function CircularRing() {
  const ringVariants = {
    hidden: { scale: 0.75, opacity: 0, rotate: -20 },
    visible: {
      scale: [0.75, 1.12, 1.24],
      opacity: [0, 0.42, 0.15, 0],
      rotate: 20,
      transition: {
        delay: 1.3, // Triggers right as letters finish materializing
        duration: 1.3,
        ease: [0.16, 1, 0.3, 1] as any,
      },
    },
  };

  return (
    <motion.div
      variants={ringVariants}
      initial="hidden"
      animate="visible"
      className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full border border-dashed border-[#d8b4fe]/25 pointer-events-none z-0 flex items-center justify-center"
      style={{
        background: "radial-gradient(circle, transparent 65%, rgba(168, 85, 247, 0.03) 100%)",
        boxShadow:
          "0 0 30px rgba(168, 85, 247, 0.12), inset 0 0 30px rgba(168, 85, 247, 0.08)",
      }}
    />
  );
}
