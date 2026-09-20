import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Star,
  Zap,
  Truck,
  RefreshCw,
  Shield,
  Sparkles,
  ShoppingBag,
  Plus,
  Eye,
  CheckCircle2,
  Compass,
  Flame,
  Feather,
  Layers,
  Terminal,
  Cpu,
} from "lucide-react";
import { categories, collections, products, IMAGES, formatPrice } from "@/lib/data";
import { fetchAllProducts } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/data";
import { heroImg, campaignImg, COLLECTION_IMAGES, A } from "@/lib/assets";
import HeroScrollSequence from "@/components/HeroScrollSequence";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PEHNAV — FUTURE ARCHIVE | Modern Streetwear & Apparel" },
      {
        name: "description",
        content:
          "High-end contemporary streetwear and utility garments. Heavyweight 450 GSM hoodies, 280 GSM vintage boxy tees, parachute cargos, and cyber platform runners.",
      },
      { property: "og:title", content: "PEHNAV — Future Archive" },
    ],
  }),
  component: Home,
});

// ── Scroll reveal hook ─────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealed");
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Cursor glow effect ─────────────────────────────────────────────────────────
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    const fn = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        ref.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return <div ref={ref} className="cursor-glow hidden sm:block" aria-hidden />;
}

// ── Modern Section heading ────────────────────────────────────────────────────
function SectionHead({
  eyebrow,
  title,
  subtitle,
  link,
  linkLabel = "Explore Catalog",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan" />
          <p className="eyebrow font-black text-cyan tracking-[0.25em]">{eyebrow}</p>
        </div>
        <h2 className="heading-editorial mt-2 text-3xl sm:text-5xl text-foreground font-black tracking-tight">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground max-w-lg font-mono leading-relaxed">{subtitle}</p>}
      </div>
      {link && (
        <Link
          to={link as any}
          className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground underline-draw hover:text-cyan"
        >
          {linkLabel} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5 text-cyan" />
        </Link>
      )}
    </div>
  );
}

// ── Modern Streetwear Chapters Configuration ──────────────────────────────────
const CHAPTERS = [
  {
    id: "dreamers",
    name: "[01] ARCHIVE CORE",
    tagline: "450 GSM Heavy Fleece & Raw Tees",
    quote: "Architectural proportions. Drop-shoulder drape and heavyweight fabrics built for silent dominance.",
    icon: Layers,
    color: "#38bdf8",
  },
  {
    id: "hustlers",
    name: "[02] HYPER-UTILITY",
    tagline: "Parachute Ripstop & Tactical Cargos",
    quote: "8-pocket compartmentalized utility trousers, magnetic snaps, and waterproof hardware engineered for relentless pace.",
    icon: Flame,
    color: "#818cf8",
  },
  {
    id: "creators",
    name: "[03] MONOCHROME LAB",
    tagline: "Washed Denim & Graphic Silhouettes",
    quote: "Tactile washes, custom distressing, and expressive shapes designed to disrupt the everyday canvas.",
    icon: Sparkles,
    color: "#c084fc",
  },
  {
    id: "wanderers",
    name: "[04] MODULAR TECH",
    tagline: "Cropped Puffers & Cyber Runners",
    quote: "Thermal down insulation, breathable tech mesh, and modular waterproof layers for the global nomad.",
    icon: Compass,
    color: "#34d399",
  },
];

// ── Hotspot items for "Shop the Fit" Lookbook ───────────────────────────────────
const LOOKBOOK_HOTSPOTS = [
  {
    id: "voyager-bomber",
    title: "Matte Cropped Down Puffer",
    price: 3499,
    compareAt: 4999,
    top: "34%",
    left: "48%",
    category: "Thermal Japanese Ripstop Nylon",
    image: A.jacket,
  },
  {
    id: "drift-cargo",
    title: "Tactical Parachute Wide Cargos",
    price: 2299,
    compareAt: 2999,
    top: "65%",
    left: "52%",
    category: "8-Pocket Parachute Ripstop",
    image: A.cargoParachute,
  },
  {
    id: "cloud-low-sneakers",
    title: "Cyber Runner Platform Sneakers",
    price: 3999,
    compareAt: 5499,
    top: "89%",
    left: "46%",
    category: "Chunky 3M Reflective EVA",
    image: A.sneakerRunner,
  },
  {
    id: "crossbody-bag",
    title: "Modular Tactical Crossbody Bag",
    price: 1499,
    compareAt: 1799,
    top: "48%",
    left: "62%",
    category: "Waterproof Waxed Canvas & Cordura",
    image: A.bagCrossbody,
  },
];

export default function Home() {
  const { tl } = useI18n();
  const { addToCart } = useStore();
  const { cartToast } = useToast();
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);
  const [activeChapter, setActiveChapter] = useState(0);
  const [selectedDropCategory, setSelectedDropCategory] = useState("all");
  const [activeHotspot, setActiveHotspot] = useState<string | null>("voyager-bomber");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useReveal();

  useEffect(() => {
    fetchAllProducts().then(setLiveProducts).catch(() => {});
  }, []);

  // Parallax on hero image
  useEffect(() => {
    const heroImage = heroRef.current?.querySelector(".hero-bg-img") as HTMLElement | null;
    if (!heroImage) return;
    const fn = () => {
      const scroll = window.scrollY;
      heroImage.style.transform = `scale(1.05) translateY(${scroll * 0.2}px)`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Filtered drops
  const filteredDrops = liveProducts.filter((p) => {
    if (selectedDropCategory === "all") return true;
    if (selectedDropCategory === "tees") return p.category === "tees";
    if (selectedDropCategory === "hoodies") return p.category === "hoodies" || p.category === "sweatshirts";
    if (selectedDropCategory === "cargo") return p.category === "cargo" || p.category === "joggers" || p.category === "denim";
    if (selectedDropCategory === "accessories") return p.group === "accessories" || p.group === "footwear";
    return true;
  }).slice(0, 8);

  const curChapter = CHAPTERS[activeChapter];

  const handleHotspotAddToCart = (item: (typeof LOOKBOOK_HOTSPOTS)[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const matchedProduct = liveProducts.find((p) => p.id === item.id) || liveProducts[0];
    addToCart(matchedProduct, matchedProduct.sizes[1] ?? matchedProduct.sizes[0] ?? "M", matchedProduct.colors[0] ?? "#000", 1);
    cartToast(item.title, item.image);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes("@")) {
      setNewsletterSubscribed(true);
    }
  };

  return (
    <div className="relative bg-background text-foreground">
      <CursorGlow />

      {/* ── SCROLL-DRIVEN 60FPS CANVAS HERO (Google Veo / Frame Sequencer Engine) ── */}
      <HeroScrollSequence />

      {/* ── MODERN INFINITE STREETWEAR MARQUEE ────────────────────────────────── */}
      <div className="relative overflow-hidden border-y border-border bg-foreground py-3.5 text-background select-none shadow-sm">
        <div className="marquee-track flex w-max gap-12 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.28em] font-mono">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>/// 450 GSM CUSTOM FLEECE</span>
              <span className="text-cyan text-xs">✦</span>
              <span>BOX-CUT SILHOUETTES</span>
              <span className="text-cyan text-xs">✦</span>
              <span>TACTICAL 8-POCKET CARGOS</span>
              <span className="text-cyan text-xs">✦</span>
              <span>SILICONE ENZYME WASHED</span>
              <span className="text-cyan text-xs">✦</span>
              <span>LIMITED RUN 500 UNITS</span>
              <span className="text-cyan text-xs">✦</span>
              <span>EXPRESS 24H DISPATCH</span>
              <span className="text-cyan text-xs">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── TRUST & DISPATCH PILLARS ─────────────────────────────────────────── */}
      <section className="reveal mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Truck, title: "Express Dispatch", sub: "Dispatched within 24 hours with live GPS courier tracking" },
            { icon: RefreshCw, title: "7-Day Size Swaps", sub: "Doorstep size swaps & instant wallet refunds" },
            { icon: Shield, title: "Zero-Risk Checkout", sub: "UPI, Cards, NetBanking, EMI & Cash on Delivery" },
            { icon: Zap, title: "Numbered Archive Drops", sub: "Each piece comes with custom serialized authenticity tag" },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`reveal reveal-delay-${i + 1} flex items-start gap-3.5 rounded-xl border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-cyan border border-border">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CURATED DROPS WITH INTERACTIVE FILTER TABS ────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan" />
              <p className="eyebrow font-black text-cyan">SEASONAL CATALOG</p>
            </div>
            <h2 className="heading-editorial mt-2 text-3xl sm:text-5xl text-foreground font-black">CURATED DROPS</h2>
          </div>

          {/* Interactive Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none font-mono">
            {[
              { id: "all", label: "ALL PIECES" },
              { id: "tees", label: "TEES [280 GSM]" },
              { id: "hoodies", label: "FLEECE & HOODIES" },
              { id: "cargo", label: "CARGOS & PANTS" },
              { id: "accessories", label: "KICKS & BAGS" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDropCategory(tab.id)}
                className={`rounded-md px-4 py-2 text-xs font-black uppercase tracking-wider transition-all spring-click ${
                  selectedDropCategory === tab.id
                    ? "bg-foreground text-background shadow-md"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filteredDrops.map((p) => (
            <div key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 rounded-md border border-border bg-card px-8 py-4 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-background hover:border-foreground spring-click shadow-sm"
          >
            <span>VIEW COMPLETE CATALOG ({liveProducts.length} PIECES)</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </Link>
        </div>
      </section>

      {/* ── 🌟 INTERACTIVE "SHOP THE FIT" LOOKBOOK HOTSPOTS ──────────────────── */}
      <section className="bg-secondary/40 py-20 border-y border-border">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="reveal">
            <SectionHead
              eyebrow="INTERACTIVE LOOKBOOK // 04"
              title="SHOP THE FIT"
              subtitle="Tap the glowing coordinate markers on the studio look to inspect and quick-add curated streetwear pieces to your bag."
              link="/shop"
              linkLabel="Browse Outfits"
            />
          </div>

          <div className="reveal relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="grid lg:grid-cols-12">
              {/* Lookbook Full Image with Interactive Hotspot Pins (7 cols) */}
              <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:col-span-7 overflow-hidden bg-black">
                <img
                  src={campaignImg}
                  alt="PEHNAV Streetwear Campaign Model Shoot"
                  className="h-full w-full object-cover object-center filter brightness-95 contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Hotspot Pins */}
                {LOOKBOOK_HOTSPOTS.map((pin) => {
                  const isActive = activeHotspot === pin.id;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => setActiveHotspot(pin.id)}
                      style={{ top: pin.top, left: pin.left }}
                      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer"
                      aria-label={`View ${pin.title}`}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="hotspot-pin absolute h-10 w-10 rounded-full" />
                        <div
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-2xl transition-all duration-300 ${
                            isActive ? "bg-cyan text-black scale-125" : "bg-black text-white hover:scale-110"
                          }`}
                        >
                          <Plus className={`h-4 w-4 transition-transform duration-300 ${isActive ? "rotate-45" : ""}`} />
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 text-white text-xs z-30">
                  {/* Active piece mobile preview overlay */}
                  {(() => {
                    const activeItem = LOOKBOOK_HOTSPOTS.find((h) => h.id === activeHotspot);
                    if (!activeItem) return null;
                    return (
                      <div className="flex sm:hidden items-center justify-between gap-3 rounded-xl bg-black/90 p-2.5 backdrop-blur-md border border-white/20 shadow-2xl animate-fade-up">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={activeItem.image} alt="" className="h-11 w-10 rounded-md object-cover border border-white/10" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white leading-tight">{activeItem.title}</p>
                            <p className="text-xs font-black text-cyan font-mono">{formatPrice(activeItem.price)}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleHotspotAddToCart(activeItem, e)}
                          className="flex items-center gap-1 rounded-lg bg-cyan px-3 py-2 text-[10px] font-mono font-bold text-black active:scale-95 transition-transform"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          ADD
                        </button>
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2 rounded-md bg-black/80 px-3.5 py-1.5 backdrop-blur-md border border-white/20 font-mono text-[11px] self-start">
                    <Sparkles className="h-3 w-3 text-cyan" />
                    <span className="hidden sm:inline">TAP COORDINATES TO INSPECT PIECES</span>
                    <span className="sm:hidden">TAP PINS TO INSPECT</span>
                  </div>
                </div>
              </div>

              {/* Hotspot details sidebar (5 cols) */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-card">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                    <div>
                      <p className="eyebrow text-cyan font-black">CURATED ENSEMBLE</p>
                      <h3 className="heading-editorial text-2xl font-black text-foreground">STREET ARCHIVE 04</h3>
                    </div>
                    <span className="rounded-md bg-secondary px-3 py-1 text-[10px] font-mono font-bold text-cyan uppercase border border-border">
                      4 PIECES
                    </span>
                  </div>

                  {/* Hotspot items cards */}
                  <div className="space-y-3">
                    {LOOKBOOK_HOTSPOTS.map((item) => {
                      const isSelected = activeHotspot === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setActiveHotspot(item.id)}
                          className={`group cursor-pointer rounded-xl border p-4 transition-all duration-300 flex items-center justify-between ${
                            isSelected
                              ? "border-cyan bg-cyan/5 shadow-md"
                              : "border-border/80 bg-secondary/30 hover:border-border hover:bg-secondary/60"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-16 w-14 rounded-lg object-cover bg-secondary border border-border"
                            />
                            <div>
                              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan">{item.category}</p>
                              <h4 className="text-sm font-black text-foreground transition-colors group-hover:text-cyan">
                                {item.title}
                              </h4>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-black text-foreground">{formatPrice(item.price)}</span>
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(item.compareAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleHotspotAddToCart(item, e)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all spring-click ${
                              isSelected ? "bg-cyan text-black shadow-md hover:scale-110" : "bg-foreground text-background hover:bg-cyan hover:text-black"
                            }`}
                            title="Add to Bag"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Complete Fit Add-to-bag banner */}
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">COMPLETE OUTFIT BUNDLE</p>
                    <p className="text-2xl font-black text-foreground">₹11,296</p>
                  </div>
                  <Link
                    to="/shop"
                    className="rounded-md bg-foreground px-6 py-3.5 text-xs font-black uppercase tracking-widest text-background transition-all hover:bg-cyan hover:text-black spring-click"
                  >
                    EXPLORE ALL LOOKS →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MATERIAL & FABRIC INTELLIGENCE ────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="reveal">
          <SectionHead
            eyebrow="TEXTILE ENGINEERING"
            title="BEHIND THE FABRIC"
            subtitle="Custom-milled textiles, preshrunk structured drape, and industrial precision hardware designed to outlast fast-fashion trends."
          />
        </div>

        <div className="reveal grid gap-6 md:grid-cols-3">
          {[
            {
              number: "450 GSM",
              title: "Custom Heavy French Terry",
              desc: "Dense, structured loops provide a clean architectural drape and thermal warmth without losing its rigid silhouette.",
              icon: Layers,
            },
            {
              number: "280 GSM",
              title: "Ring-Spun Compact Cotton",
              desc: "High-density Indian cotton fibers with smooth surface finish that resists pilling and sagging through hundreds of wears.",
              icon: Feather,
            },
            {
              number: "100%",
              title: "Silicone Enzyme Washed",
              desc: "Every cut undergoes industrial garment-washing to lock in fit and eliminate post-purchase shrinking forever.",
              icon: CheckCircle2,
            },
          ].map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.title}
                className="group relative rounded-2xl border border-border/80 bg-card p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-cyan/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-4xl font-black text-cyan">{spec.number}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-cyan group-hover:text-black transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-foreground mb-2 uppercase">{spec.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-mono">{spec.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── IDENTITY COLLECTIONS SHOWCASE ─────────────────────────────────────── */}
      <section className="bg-secondary/30 py-20 border-y border-border">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="reveal">
            <SectionHead
              eyebrow="THE ARCHIVE CAPSULES"
              title="EXPLORE BY IDENTITY"
              subtitle="Four distinctive silhouettes engineered for contemporary youth culture. Choose your trajectory."
              link="/collections"
              linkLabel="All Capsules"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {collections.map((col, i) => (
              <Link
                key={col.id}
                to="/collections/$id"
                params={{ id: col.id }}
                className={`reveal reveal-delay-${(i % 2) + 1} group relative overflow-hidden rounded-2xl border border-border shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={COLLECTION_IMAGES[col.id] || col.image || IMAGES.placeholder}
                    alt={tl(col.name)}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = IMAGES.placeholder;
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="eyebrow text-cyan font-black">{tl(col.tagline)}</p>
                  <h3 className="heading-editorial mt-1 text-2xl sm:text-3xl font-black text-white">{tl(col.name)}</h3>
                  <p className="mt-2 max-w-sm text-xs sm:text-sm text-white/75 font-mono leading-relaxed">{tl(col.description)}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:text-cyan transition-colors">
                    <span>EXPLORE CAPSULE</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODERN CREED MANIFESTO BANNER ─────────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden bg-black flex items-center justify-center">
        <img
          src={campaignImg}
          alt="PEHNAV Manifesto"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover filter brightness-[0.3] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          <p className="eyebrow text-cyan font-black mb-4">OUR PHILOSOPHY</p>
          <h2 className="heading-editorial text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.0] tracking-tight">
            FORM FOLLOWS FUNCTION. <br />
            <span className="text-gradient-cyan">ATTITUDE FOLLOWS FIT.</span>
          </h2>
          <p className="mt-6 mx-auto max-w-xl text-sm sm:text-base text-white/70 font-mono">
            Every cut, silhouette, and stitch is engineered to empower the pioneers shaping contemporary street culture.
          </p>
          <Link
            to="/stories"
            className="mt-8 inline-flex items-center gap-3 rounded-md border border-white/30 bg-black/50 px-8 py-4 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white hover:text-black hover:border-white spring-click"
          >
            <span>READ THE ARCHIVE STORIES</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── VERIFIED COMMUNITY REVIEWS ────────────────────────────────────────── */}
      <section className="bg-foreground py-20 text-background">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="reveal text-center max-w-2xl mx-auto">
            <p className="eyebrow text-cyan font-black">COMMUNITY VOICES</p>
            <h2 className="heading-editorial mt-2 text-3xl sm:text-5xl font-black">WEARER FEEDBACK</h2>
            <p className="mt-2 text-sm text-background/70 font-mono">
              Tested and verified by 10,000+ streetwear enthusiasts across India.
            </p>
          </div>

          <div className="reveal mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                rating: 5,
                name: "Aryan K.",
                city: "Bengaluru",
                text: "The fabric weight is genuinely unmatched. The 280 GSM Raw Boxy Tee has been in my weekly rotation for 4 months — zero collar sagging and insane drape.",
                product: "Raw Boxy Heavyweight Tee",
              },
              {
                rating: 5,
                name: "Priya S.",
                city: "Mumbai",
                text: "Finally an Indian brand that nails oversized streetwear proportions without looking sloppy. The Tactical Parachute Cargo is literally a masterpiece.",
                product: "Tactical Parachute Cargo",
              },
              {
                rating: 5,
                name: "Zaid M.",
                city: "Delhi NCR",
                text: "The heavy matte zippers, 450 GSM fleece, and deep double-layered hood feel like a 200-dollar international drop. PEHNAV is on another tier.",
                product: "Archival Heavy Fleece Hoodie",
              },
            ].map((review, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${i + 1} flex flex-col justify-between rounded-2xl border border-background/15 bg-background/5 p-8 backdrop-blur-md transition-transform hover:-translate-y-1`}
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-cyan text-cyan" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-background/85 font-mono">"{review.text}"</p>
                </div>

                <div className="mt-6 pt-4 border-t border-background/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black">{review.name}</p>
                    <p className="text-[10px] text-background/50 font-mono">{review.city}</p>
                  </div>
                  <span className="rounded-md bg-background/10 px-3 py-1 text-[10px] font-mono font-bold text-cyan">
                    VERIFIED BUYER
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODERN VIP DROP ACCESS NEWSLETTER ─────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="reveal overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-16 text-center shadow-xl relative">
          <div className="ambient-glow-cyan -top-20 left-1/2 -translate-x-1/2 opacity-50" />

          <div className="relative z-10 max-w-xl mx-auto">
            <p className="eyebrow text-cyan font-black">PRIVATE EARLY ACCESS</p>
            <h2 className="heading-editorial mt-2 text-3xl sm:text-5xl font-black text-foreground">
              GET VIP NOTIFICATIONS BEFORE EVERY DROP
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-mono">
              Join 15,000+ members who receive private passcodes 2 hours before seasonal capsules go live.
            </p>

            {newsletterSubscribed ? (
              <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-scale-in">
                <CheckCircle2 className="h-5 w-5" />
                <span>You are on the VIP drop list. Welcome to the PEHNAV Lab.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="input-glow flex-1 rounded-md border border-border bg-background px-6 py-4 text-sm outline-none transition-all placeholder:text-muted-foreground font-mono"
                />
                <button
                  type="submit"
                  className="rounded-md bg-foreground px-8 py-4 text-xs font-black uppercase tracking-widest text-background transition-all hover:bg-cyan hover:text-black spring-click shadow-md"
                >
                  JOIN VIP LIST
                </button>
              </form>
            )}

            <p className="mt-4 text-[11px] text-muted-foreground font-mono">Zero spam. Only private drop invitations.</p>
          </div>
        </div>
      </section>
    </div>
  );
}