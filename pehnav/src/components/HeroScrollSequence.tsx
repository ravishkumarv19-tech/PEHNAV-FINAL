import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Flame,
  Cpu,
  ShieldCheck,
  ChevronDown,
  Compass,
} from "lucide-react";
import {
  HERO_FRAME_CONFIG,
  preloadFrameSequence,
  preloadFrameSequenceProgressive,
  drawCoverImage,
} from "@/lib/hero-frames";

interface HeroScrollSequenceProps {
  onChapterChange?: (chapterIndex: number) => void;
}

const CHAPTERS = [
  {
    id: "dreamers",
    name: "[01] ARCHIVE CORE",
    tag: "01 // ARCHIVE SILHOUETTE",
    titlePrefix: "OVERSIZED",
    highlight: "BOX-CUT",
    summary: "Architectural drop-shoulder proportion engineered for natural drape and bold street presence. 450 GSM French Terry handcrafted in India.",
    tagline: "450 GSM Heavy Fleece & Cyan LED Soles",
    specs: "Architectural oversized silhouette with drop-shoulder drape. Tactical cargos and cyan-illuminated platform soles on rain-slicked Tokyo streets.",
    icon: Layers,
    color: "#38bdf8",
  },
  {
    id: "textile",
    name: "[02] TEXTILE LAB",
    tag: "02 // TEXTILE CORE",
    titlePrefix: "450 GSM",
    highlight: "FRENCH TERRY",
    summary: "Ultra-dense combed cotton with micro-loop interior structure built to resist sagging through 500+ wears.",
    tagline: "450 GSM Macro Dense French Terry",
    specs: "Extreme macro yarn loops and double-rib collar weave. Preshrunk silicone enzyme washed to maintain architectural drape.",
    icon: Flame,
    color: "#818cf8",
  },
  {
    id: "utility",
    name: "[03] TACTICAL CARGO",
    tag: "03 // TACTICAL SPEC",
    titlePrefix: "PARACHUTE",
    highlight: "RIPSTOP",
    summary: "Weatherproof parachute nylon trousers with 8 modular storm-flap cargo pockets and hanging adjustment straps.",
    tagline: "Parachute Ripstop & Hanging Utility Straps",
    specs: "High-tensile parachute ripstop trousers, 8-pocket modular storage, and hanging quick-adjust straps in wet street motion.",
    icon: Sparkles,
    color: "#c084fc",
  },
  {
    id: "runway",
    name: "[04] CYBER RUNWAY",
    tag: "04 // CYBER RUNWAY",
    titlePrefix: "ILLUMINATED",
    highlight: "SOLES",
    summary: "Cyan-illuminated platform soles with 3M Scotchlite high-index reflective badges for night visibility.",
    tagline: "3M Reflective Platform Runners & Tunnel Walk",
    specs: "Futuristic neon light tunnel forward walk with illuminated 3M reflective Cyber Runner platform sneakers and modular tech layers.",
    icon: Compass,
    color: "#34d399",
  },
];

export default function HeroScrollSequence({ onChapterChange }: HeroScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadedPercent, setLoadedPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasCustomFrames, setHasCustomFrames] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cached frame references
  const framesRef = useRef<HTMLImageElement[]>([]);
  const fallbackImagesRef = useRef<HTMLImageElement[]>([]);

  // Smooth lerp state
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Generate target frame URLs
  const frameUrls = useMemo(() => {
    return Array.from({ length: HERO_FRAME_CONFIG.frameCount }, (_, i) =>
      HERO_FRAME_CONFIG.framePathPattern(i)
    );
  }, []);

  // Preload frame sequence progressively (Instant Frame 0 + Tier 1 Milestones + Tier 2 In-betweens)
  useEffect(() => {
    let cancelPreload: (() => void) | null = null;

    // 1. Preload fallback imagery
    preloadFrameSequence(HERO_FRAME_CONFIG.fallbackImages).then((fallbackImgs) => {
      fallbackImagesRef.current = fallbackImgs.filter(Boolean);
    });

    // 2. Initialize frames array of exact length
    const totalFrames = HERO_FRAME_CONFIG.frameCount;
    framesRef.current = new Array(totalFrames);

    // 3. Start high-speed progressive stream
    cancelPreload = preloadFrameSequenceProgressive(
      frameUrls,
      (index, img) => {
        framesRef.current[index] = img;
        if (index === 0) {
          setIsReady(true);
          setHasCustomFrames(true);
        }
      },
      (_loaded, _total, percent) => {
        setLoadedPercent(percent);
      }
    );

    return () => {
      cancelPreload?.();
    };
  }, [frameUrls]);

  // Main Canvas Render Loop with Butter-Smooth Linear Interpolation (Lerp)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      if (!canvas) return;
      // Cap DPR at 2 on mobile to prevent GPU thermal throttling on 3x Retina screens
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // Render loop
    const render = () => {
      // Snappy responsive lerp damping: tight synchronization so the animation stays locked to the scroll
      const diff = targetProgressRef.current - currentProgressRef.current;
      currentProgressRef.current += diff * (isMobile ? 0.45 : 0.35);

      const progress = Math.max(0, Math.min(1, currentProgressRef.current));
      setScrollProgress(progress);

      const canvasW = canvas.width;
      const canvasH = canvas.height;
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      // Clear full canvas buffer
      ctx.fillStyle = "#08080a";
      ctx.fillRect(0, 0, canvasW, canvasH);

      const frames = framesRef.current;
      const fallbacks = fallbackImagesRef.current;

      // Map progress from 0 to 0.85 so all frames and chapters 100% finish before the track unpins!
      const animProgress = Math.min(1, progress / 0.85);
      const totalFrames = HERO_FRAME_CONFIG.frameCount;

      if (frames.length > 0) {
        const frameIndex = Math.min(
          totalFrames - 1,
          Math.round(animProgress * (totalFrames - 1))
        );

        // Instant nearest-neighbor frame lookup ensures zero blank frames during fast scrubs
        let currentFrame = frames[frameIndex];
        if (!currentFrame) {
          for (let d = 1; d < totalFrames; d++) {
            if (frameIndex - d >= 0 && frames[frameIndex - d]) {
              currentFrame = frames[frameIndex - d];
              break;
            }
            if (frameIndex + d < totalFrames && frames[frameIndex + d]) {
              currentFrame = frames[frameIndex + d];
              break;
            }
          }
        }

        if (currentFrame) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          drawCoverImage(ctx, currentFrame, canvasW, canvasH, 1.0, 0);
        }
      } else if (fallbacks.length > 0) {
        // Fallback multi-angle parallax transitions
        const fallbackIndex = Math.min(
          fallbacks.length - 1,
          Math.floor(animProgress * fallbacks.length)
        );
        const currentImg = fallbacks[fallbackIndex];
        if (currentImg) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          drawCoverImage(ctx, currentImg, canvasW, canvasH, 1.0, 0);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Track scroll position across pinned sticky container immediately from scroll pixel 0
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      targetProgressRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Synchronize active chapter indicator with scroll position
  useEffect(() => {
    const chapterIdx =
      scrollProgress < 0.22 ? 0 : scrollProgress < 0.44 ? 1 : scrollProgress < 0.66 ? 2 : 3;
    setActiveChapter(chapterIdx);
    onChapterChange?.(chapterIdx);
  }, [scrollProgress, onChapterChange]);

  const scrollToPhase = (idx: number) => {
    setActiveChapter(idx);
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    const targetPercentages = [0.05, 0.28, 0.50, 0.75];
    const targetY = window.scrollY + rect.top + targetPercentages[idx] * totalScrollable;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const curChapter = CHAPTERS[activeChapter];

  // Helper to calculate opacity with instant, zero-lag transitions precisely matching 4 video segments
  const getStageOpacity = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (scrollProgress < start || scrollProgress > end) return 0;
    if (scrollProgress >= peakStart && scrollProgress <= peakEnd) return 1;
    if (scrollProgress < peakStart) {
      return (scrollProgress - start) / (peakStart - start);
    }
    return 1 - (scrollProgress - peakEnd) / (end - peakEnd);
  };

  // Helper to reveal individual callout items progressively with scroll
  const getItemOpacity = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (scrollProgress < start || scrollProgress > end) return 0;
    if (scrollProgress >= peakStart && scrollProgress <= peakEnd) return 1;
    if (scrollProgress < peakStart) {
      return (scrollProgress - start) / (peakStart - start);
    }
    return 1 - (scrollProgress - peakEnd) / (end - peakEnd);
  };

  // Initial title opacity (Fades cleanly out as user starts scrolling between 0% and 4%)
  const introTitleOpacity = Math.max(0, 1 - (scrollProgress / 0.04));

  // Bottom-left summary opacity: reveals smoothly as "WEAR YOUR STORY" fades out and animation starts
  const summaryOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.02) / 0.04));

  // Progressive CTA appearance in the final runway stage (held solid through 100%)
  const s4Cta = getItemOpacity(0.74, 0.78, 1.00, 1.00);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#08080a] text-white -mt-[64px]"
      style={{ height: isMobile ? "280vh" : "380vh" }}
    >
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none">
        
        {/* Canvas Background (Direct Physical Pixel Native Sharpness) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full pointer-events-none"
        />

        {/* Subtle bottom transition edge to blend cleanly into the next section */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#08080a] to-transparent pointer-events-none" />

        {/* ── INITIAL LANDING HERO: BOLD "WEAR YOUR STORY" ──────────────────────── */}
        <div
          style={{
            opacity: introTitleOpacity,
            transform: `translateY(${scrollProgress * -80}px) scale(${1 - scrollProgress * 0.5})`,
            pointerEvents: introTitleOpacity > 0.3 ? "auto" : "none",
          }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center pt-16 text-center px-4 transition-transform duration-75"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-3.5 py-1 sm:px-4 sm:py-1.5 backdrop-blur-xl mb-3 sm:mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan animate-ping" />
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-white tracking-[0.2em] sm:tracking-[0.25em] uppercase">PEHNAV ARCHIVE 2026</span>
          </div>

          <h1 className="heading-editorial text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-white uppercase drop-shadow-[0_12px_40px_rgba(0,0,0,0.9)] px-2">
            WEAR YOUR <span className="text-gradient-cyan">STORY</span>
          </h1>

          <p className="mt-3 sm:mt-4 max-w-lg font-mono text-[11px] sm:text-sm text-white/90 tracking-wider uppercase drop-shadow-md px-4">
            Architectural Luxury Streetwear • Handcrafted in India
          </p>

          <div className="mt-6 sm:mt-8 flex items-center gap-2 font-mono text-[11px] sm:text-xs text-cyan bg-black/60 border border-cyan/40 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.25)] animate-bounce">
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="tracking-wider uppercase font-bold">SCROLL TO REVEAL SPEC BLUEPRINT</span>
          </div>
        </div>

        {/* ── PERSISTENT EDITORIAL SUMMARY IN BOTTOM-LEFT (NO BOX, SAME THEME AS "WEAR YOUR STORY") ── */}
        <div
          style={{
            opacity: summaryOpacity,
            transform: `translateY(${(1 - summaryOpacity) * 15}px)`,
            pointerEvents: summaryOpacity > 0.5 ? "auto" : "none",
          }}
          className="absolute bottom-20 sm:bottom-12 md:bottom-14 left-4 sm:left-10 md:left-14 z-30 select-none max-w-[340px] sm:max-w-[460px] md:max-w-[560px] text-left transition-all duration-150"
        >
          {/* Micro Tag with Animated Ping */}
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 font-mono text-[10px] sm:text-xs font-bold text-cyan tracking-[0.25em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan animate-ping" />
            <span>{curChapter.tag}</span>
          </div>

          {/* Headline in exact same theme as "WEAR YOUR STORY" */}
          <h2 className="heading-editorial text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)] leading-[0.95]">
            {curChapter.titlePrefix}{" "}
            <span className="text-gradient-cyan">{curChapter.highlight}</span>
          </h2>

          {/* Concise Summary in same theme as hero subtitle */}
          <p className="mt-2 sm:mt-2.5 font-mono text-[11px] sm:text-xs md:text-sm text-white/90 tracking-wider uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-relaxed">
            {curChapter.summary}
          </p>

          {/* Minimal 4-stage chapter progress pips */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 pointer-events-auto">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToPhase(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeChapter === idx
                    ? "w-8 sm:w-10 bg-gradient-to-r from-cyan to-indigo-400 shadow-[0_0_8px_#38bdf8]"
                    : "w-2 sm:w-3 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Jump to chapter ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── STAGE 4 FINAL RUNWAY CTA BUTTON ── */}
        <div
          style={{
            opacity: s4Cta,
            transform: `translate(-50%, ${(1 - s4Cta) * 20}px)`,
            pointerEvents: s4Cta > 0.5 ? "auto" : "none",
          }}
          className="absolute left-1/2 bottom-16 sm:bottom-20 z-30 flex items-center gap-3 transition-all duration-150"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-cyan hover:text-black shadow-[0_0_24px_rgba(255,255,255,0.25)] spring-click"
          >
            <span>SHOP ARCHIVE</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
