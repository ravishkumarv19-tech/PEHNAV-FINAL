import React from "react";

interface BrandLogoProps {
  className?: string;
  textClassName?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "cyan" | "monochrome";
}

/**
 * PEHNAV Concept 4 — Swiss Architectural Folded Ribbon Logo
 * Clean, high-contrast, geometric origami ribbon monogram forming the letter "P".
 */
export default function BrandLogo({
  className = "",
  textClassName = "",
  iconOnly = false,
  size = "md",
  variant = "default",
}: BrandLogoProps) {
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-lg tracking-[0.2em]",
    md: "text-2xl tracking-[0.24em]",
    lg: "text-3xl tracking-[0.26em]",
    xl: "text-5xl tracking-[0.28em]",
  };

  const isMonochrome = variant === "monochrome";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* ── CONCEPT 4 VECTOR ARCHITECTURAL "P" EMBLEM ── */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_2px_10px_rgba(56,189,248,0.2)]"
        >
          <defs>
            {/* Signature Cyber Cyan Gradient for Diagonal Accent Fold */}
            <linearGradient id="c4-cyan-accent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>

            {/* Subtle Metallic Gradient for White/Monochrome */}
            <linearGradient id="c4-white-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          {/* Facet 1: Top Horizontal Folded Ribbon */}
          <polygon
            points="0.0,21.0 72.0,21.0 72.0,0.0 24.0,0.0"
            fill="currentColor"
          />

          {/* Facet 2: Right Vertical Folded Ribbon */}
          <polygon
            points="76.0,0.0 100.0,21.0 100.0,46.0 76.0,46.0"
            fill="currentColor"
            opacity={isMonochrome ? "1.0" : "0.92"}
          />

          {/* Facet 3: Bottom Horizontal Loop Ribbon */}
          <polygon
            points="53.0,49.0 100.0,49.0 76.0,70.0 29.0,70.0"
            fill="currentColor"
            opacity={isMonochrome ? "1.0" : "0.95"}
          />

          {/* Facet 4: Upper-Left Vertical Stem */}
          <polygon
            points="0.0,24.0 24.0,24.0 24.0,44.0 0.0,65.0"
            fill="currentColor"
          />

          {/* Facet 5: Lower Stem & 45° Diagonal Ribbon Fold (Hero Accent) */}
          <polygon
            points="0.0,69.0 50.0,26.0 50.0,47.0 24.0,69.0 24.0,79.0 0.0,100.0"
            fill={isMonochrome ? "currentColor" : "url(#c4-cyan-accent)"}
          />
        </svg>
      </div>

      {/* ── TYPOGRAPHIC WORDMARK ── */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-black uppercase transition-colors group-hover:text-cyan ${textSizes[size]} ${
                textClassName || "text-foreground"
              }`}
            >
              PEHNAV
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan inline-block animate-pulse shadow-[0_0_8px_#38bdf8]" />
          </div>
          {size === "lg" || size === "xl" ? (
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.32em] text-muted-foreground uppercase mt-0.5">
              ARCHITECTURAL STREETWEAR
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
