import logoSrc from "@/assets/lumora-logo.png";

interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function LumoraLogo({ size = 28, withWordmark = true, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 rounded-full shadow-glow"
        style={{ width: size, height: size }}
      >
        <img
          src={logoSrc}
          alt="Lumora"
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
      {withWordmark && (
        <span className="text-base font-semibold tracking-tight">
          <span className="gradient-text">Lumora</span>
        </span>
      )}
    </div>
  );
}
