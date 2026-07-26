import { motion } from "framer-motion";

export default function AnimatedLogo() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.6,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 12,
      filter: "blur(12px)",
      textShadow: "0 0 0px rgba(167, 139, 250, 0)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      textShadow: [
        "0 0 0px rgba(167, 139, 250, 0)",
        "0 0 30px rgba(167, 139, 250, 0.8)",
        "0 0 15px rgba(167, 139, 250, 0.5)"
      ],
      transition: {
        type: "spring" as any,
        stiffness: 35,
        damping: 12,
        opacity: { duration: 0.9 },
        filter: { duration: 0.8 },
      },
    },
  };

  const flareVariants = {
    hidden: { width: "0%", opacity: 0 },
    visible: {
      width: "80%",
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 1.2,
        ease: [0.25, 1, 0.5, 1] as any,
      },
    },
  };

  const flareCenterVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.4, 1],
      opacity: [0, 1, 0.85],
      transition: {
        delay: 0.4,
        duration: 0.8,
        ease: "easeOut" as any,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    visible: {
      opacity: 0.75,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 1.8,
        duration: 0.9,
        ease: "easeOut" as any,
      },
    },
  };

  const titleLetters = Array.from("LUMORA");

  return (
    <div className="relative flex flex-col items-center justify-center select-none text-center px-4">
      {/* 1. Main Title Reveal */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-[44px] sm:text-[60px] md:text-[72px] font-semibold text-white tracking-[0.28em] mr-[-0.28em]"
        style={{
          fontFamily: "'Cinzel', 'Georgia', serif",
        }}
      >
        {titleLetters.map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>

      {/* 2. Anamorphic Lens Flare Line */}
      <div className="relative w-full max-w-[450px] h-[15px] flex items-center justify-center mt-3 mb-4">
        <motion.div
          variants={flareVariants}
          initial="hidden"
          animate="visible"
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6]/50 via-white via-[#8b5cf6]/50 to-transparent blur-[0.5px]"
          style={{
            boxShadow: "0 0 8px rgba(139, 92, 246, 0.4), 0 0 16px rgba(139, 92, 246, 0.2)",
          }}
        />
        <motion.div
          variants={flareCenterVariants}
          initial="hidden"
          animate="visible"
          className="absolute w-[8px] h-[8px] rounded-full bg-white filter blur-[0.8px]"
          style={{
            boxShadow:
              "0 0 12px #ffffff, 0 0 24px rgba(139, 92, 246, 0.8), 0 0 48px rgba(139, 92, 246, 0.4)",
          }}
        />
      </div>

      {/* 3. Subtitle Reveal */}
      <motion.p
        variants={subtitleVariants}
        initial="hidden"
        animate="visible"
        className="text-[10px] sm:text-[11px] font-semibold tracking-[0.45em] text-[#c4b5fd] uppercase mr-[-0.45em] opacity-80"
        style={{
          fontFamily: "var(--font-sans), 'Inter', sans-serif",
        }}
      >
        AI Research Assistant
      </motion.p>
    </div>
  );
}
