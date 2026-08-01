import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "./ParticleBackground";
import AnimatedLogo from "./AnimatedLogo";
import CircularRing from "./CircularRing";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const skippedRef = useRef(false);

  // 1. Dynamic Font Injection and Motion Preferences Detection
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // 2. Skip handler
  const handleSkip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 250); // Fast fade out duration
  };

  // 3. Skip Event Bindings
  useEffect(() => {
    const handleKeyDown = () => {
      handleSkip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 4. Timeline Timers
  useEffect(() => {
    if (prefersReducedMotion) {
      // Reduced motion users get 1.2s static logo and immediate skip
      const timer = setTimeout(() => {
        handleSkip();
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Normal cinematic timeline
    const mainTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 500); // Overlay exit fade
    }, 3600); // Start fade-out at 3.6s (total ~4.1s screen presence)

    return () => clearTimeout(mainTimer);
  }, [prefersReducedMotion]);

  // Accessibility Fallback: static centered logo for prefers-reduced-motion
  if (prefersReducedMotion) {
    return (
      <AnimatePresence>
        {!isFadingOut && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleSkip}
            className="fixed inset-0 bg-[#030107] z-[9999] flex flex-col items-center justify-center cursor-pointer select-none text-center"
          >
            <h1
              className="text-[44px] sm:text-[60px] text-white tracking-[0.28em] font-semibold mr-[-0.28em]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              LUMORA
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#c4b5fd]/80 tracking-[0.45em] uppercase mt-3 mr-[-0.45em]">
              AI Research Assistant
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          onClick={handleSkip}
          className="fixed inset-0 bg-[#030107] z-[9999] flex items-center justify-center overflow-hidden cursor-pointer select-none"
        >
          {/* Edge Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020005] via-transparent to-[#020005] pointer-events-none z-10" />

          {/* Nebula Canvas */}
          <ParticleBackground />

          {/* Stardust Ripple Ring */}
          <CircularRing />

          {/* Staggered Logo letters */}
          <div className="z-20">
            <AnimatedLogo />
          </div>

          {/* Action indicator */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-30 opacity-20 hover:opacity-55 transition-opacity duration-300">
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#c4b5fd]/40">
              Press any key or click to skip
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
