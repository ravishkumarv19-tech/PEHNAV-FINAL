import React from "react";

interface BrandLogoProps {
  className?: string;
  textClassName?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "glow" | "monochrome";
}

/**
 * PEHNAV Architectural Brand Logo & Vector Monogram
 * Inspired by Japanese origami folds, brutalist architectural geometry, and cyber-minimalism.
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

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* ── VECTOR ARCHITECTURAL "P" EMBLEM ── */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_2px_12px_rgba(56,189,248,0.25)]"
        >
          <defs>
            {/* Cyan to Indigo Electric Gradient */}
            <linearGradient id="pehnav-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Subtle Metallic Shadow Gradient */}
            <linearGradient id="pehnav-stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Glowing Accent Filter */}
            <filter id="pehnav-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background subtle hexagon/shield contour */}
          <polygon
            points="24,2 44,13 44,35 24,46 4,35 4,13"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            fill="rgba(10,12,18,0.4)"
          />

          {/* Vertical Architectural Pillar (Left Stem of P) */}
          <path
            d="M12 10 L19 6 L19 42 L12 38 Z"
            fill="url(#pehnav-stem-grad)"
          />

          {/* Top Angled Cross-Beam */}
          <path
            d="M19 6 L35 6 L40 14 L24 14 Z"
            fill="#ffffff"
          />

          {/* Right Geometric Faceted Bow (The Loop of the P) */}
          <path
            d="M40 14 L40 23 L33 30 L22 30 L22 23 L33 23 L35 14 Z"
            fill="url(#pehnav-cyan-grad)"
          />

          {/* Origami Fold Shadow Crease (Internal Negative Space) */}
          <polygon
            points="19,14 26,14 23,23 19,23"
            fill="#08080a"
          />

          {/* Origami Accent Facet */}
          <polygon
            points="19,23 33,23 27,30 19,30"
            fill="#0284c7"
            opacity="0.85"
          />

          {/* Micro Cyan Laser Pin / Focal Star */}
          <circle cx="36" cy="18.5" r="2" fill="#38bdf8" filter="url(#pehnav-glow)" />
          <circle cx="36" cy="18.5" r="0.9" fill="#ffffff" />
        </svg>
      </div>

      {/* ── TYPOGRAPHIC WORDMARK ── */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-black uppercase transition-colors group-hover:text-cyan ${textSizes[size]} ${textClassName || "text-foreground"}`}
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
