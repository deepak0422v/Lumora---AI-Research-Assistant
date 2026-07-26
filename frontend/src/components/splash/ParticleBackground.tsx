import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  decaySpeed: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const maxParticles = 120;

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -Math.random() * 0.2 - 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        decaySpeed: Math.random() * 0.002 + 0.001,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw central nebula ambient glow
      const nebulaGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.min(width, height) * 0.6
      );
      nebulaGlow.addColorStop(0, "rgba(59, 20, 110, 0.14)");
      nebulaGlow.addColorStop(0.5, "rgba(42, 10, 85, 0.06)");
      nebulaGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebulaGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw stardust particles
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(167, 139, 250, 0.3)";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 204, 250, ${p.opacity})`;
        ctx.fill();

        // Update position
        p.y += p.speedY;
        p.x += p.speedX;

        // Breathe opacity
        p.opacity += p.decaySpeed;
        if (p.opacity > 0.85 || p.opacity < 0.08) {
          p.decaySpeed = -p.decaySpeed;
        }

        // Wrap around screen boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block pointer-events-none z-0"
    />
  );
}
