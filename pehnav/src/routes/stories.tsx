import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Feather,
  Compass,
  Scissors,
  Layers,
  Heart,
  Shield,
  Eye,
  Quote,
  CheckCircle2,
  Leaf,
  Globe2,
} from "lucide-react";
import { IMAGES, collections } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Our Story — The PEHNAV Universe" },
      {
        name: "description",
        content:
          "Discover the soul of PEHNAV: Indian minimalist luxury, heavyweight organic craft, and stories behind every collection chapter.",
      },
    ],
  }),
  component: StoriesPage,
});

const PILLARS = [
  {
    icon: Feather,
    title: "Heavyweight 240–380 GSM",
    desc: "We exclusively knit using long-staple combed cotton yarns. Substantial, structured, and luxuriously soft with zero cling.",
  },
  {
    icon: Scissors,
    title: "Master Pattern Tailoring",
    desc: "Every silhouette is individually draped and engineered on over 100 Indian body types for the ideal boxy, relaxed drop-shoulder fit.",
  },
  {
    icon: Layers,
    title: "Double-Needle Integrity",
    desc: "Single-needle ribbed collars that never bacon, reinforced side-slits, and high-density bar-tack stitching at stress points.",
  },
  {
    icon: Leaf,
    title: "Mindful Circularity",
    desc: "100% GOTS organic certified cotton, closed-loop AZO-free botanical dyeing, and compostable packaging.",
  },
];

const TIMELINE = [
  {
    year: "2023",
    title: "The Genesis in Mumbai",
    desc: "Frustrated by disposable fast-fashion and shapeless generic streetwear, PEHNAV began in a small Bandra workshop with one mission: create the definitive Indian heavyweight tee.",
  },
  {
    year: "2024",
    title: "The Four Chapters",
    desc: "Introduced our thematic design philosophy: clothing built around personas—Dreamers, Hustlers, Creators, and Wanderers. Launched our first 240 GSM organic drops.",
  },
  {
    year: "2025",
    title: "Ethical Atelier Expansion",
    desc: "Partnered directly with master cotton weavers in Coimbatore and Tiruppur, instituting fair living wages (2.4x minimum wage) and zero-plastic compostable packaging.",
  },
  {
    year: "Today",
    title: "The Vanguard of Indian Luxury",
    desc: "Over 50,000 discerning wearers worldwide who don't just put on clothes—they wear their story with unyielding pride.",
  },
];

export default function StoriesPage() {
  const { tl } = useI18n();
  const [activeChapter, setActiveChapter] = useState(collections[0]?.id ?? "dreamers");

  const selectedCol = collections.find((c) => c.id === activeChapter) ?? collections[0];

  return (
    <div className="bg-background text-foreground">
      {/* ── Cinematic Hero ── */}
      <section className="relative h-[75vh] min-h-[520px] overflow-hidden bg-[#0a0c10]">
        <img
          src={IMAGES.campaignImg}
          alt="PEHNAV Our Story"
          className="absolute inset-0 h-full w-full object-cover object-center filter brightness-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/40 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold w-fit mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Story & Manifesto</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl max-w-4xl leading-[1.08]">
            Every Thread Has a Tale. <br />
            <span className="text-gold">Every Stitch Is Personal.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-200 leading-relaxed">
            PEHNAV was founded on a simple conviction: clothing is not passive fabric. It is armor, expression, and the silent language of who you are.
          </p>
        </div>
      </section>

      {/* ── Brand Manifesto ── */}
      <section className="py-20 lg:py-28 border-b border-border">
        <div className="mx-auto max-w-[1100px] px-6 text-center">
          <p className="eyebrow text-gold font-bold">The Manifesto</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl leading-tight">
            "We do not make garments for the crowd. <br className="hidden sm:inline" />
            We craft pieces for the individual who moves with purpose."
          </h2>

          <div className="mt-10 grid gap-8 text-left text-sm text-muted-foreground sm:grid-cols-2 leading-relaxed">
            <p>
              In a world flooded by relentless micro-trends, disposable synthetic fibers, and throwaway hype, PEHNAV stands as an intentional counterweight. We draw from India’s millennia-old textile supremacy—from the density of organic combed cotton to the nuance of bespoke tailoring—and infuse it with the sharp architectural silhouettes of modern global streetwear.
            </p>
            <p>
              When you wear PEHNAV, you feel the difference before you look in the mirror. The comforting weight of 240 GSM organic jersey draping effortlessly over your shoulders. Collars that stay crisp after 50 washes. Hues inspired by the volcanic obsidian, raw earthen clay, and starlight of the subcontinent.
            </p>
          </div>
        </div>
      </section>

      {/* ── The 4 Craftsmanship Pillars ── */}
      <section className="py-20 bg-secondary/30">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow text-gold font-bold">Uncompromising Quality</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              The 4 Pillars of PEHNAV Craft
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Precision in every millimeter. Sourced ethically, engineered thoughtfully.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-3xl border border-border bg-card p-8 transition-transform hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive Chapter Explorer (Collections) ── */}
      <section className="py-24 border-y border-border">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow text-gold font-bold">The Universe</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Our 4 Chapters
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every collection explores a distinct archetype of the human experience.
            </p>
          </div>

          {/* Chapter Selector Tabs */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChapter(c.id)}
                className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeChapter === c.id
                    ? "bg-foreground text-background shadow-md scale-105"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {tl(c.name)}
              </button>
            ))}
          </div>

          {/* Active Chapter Showcase */}
          {selectedCol && (
            <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-fade-in">
              <div className="grid lg:grid-cols-2">
                <div className="relative aspect-[16/11] lg:aspect-auto">
                  <img
                    src={selectedCol.image}
                    alt={tl(selectedCol.name)}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-14 lg:p-16">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold">
                    Collection Spotlight
                  </span>
                  <h3 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                    {tl(selectedCol.name)}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-gold italic">
                    "{tl(selectedCol.tagline)}"
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {tl(selectedCol.description)}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/collections/$id"
                      params={{ id: selectedCol.id }}
                      className="btn-primary gap-2"
                    >
                      Explore Chapter Pieces <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/shop"
                      search={{ collection: selectedCol.id } as any}
                      className="btn-ghost"
                    >
                      Shop Collection
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Brand Journey Timeline ── */}
      <section className="py-24 bg-card/40">
        <div className="mx-auto max-w-[1000px] px-6">
          <div className="text-center max-w-xl mx-auto">
            <p className="eyebrow text-gold font-bold">The Journey</p>
            <h2 className="mt-2 font-display text-3xl font-bold">How We Built the Dream</h2>
          </div>

          <div className="mt-14 space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-1/2 before:w-0.5 before:bg-border/60">
            {TIMELINE.map((item, idx) => (
              <div
                key={item.year}
                className={`relative flex flex-col sm:flex-row items-start ${
                  idx % 2 === 0 ? "sm:flex-row-reverse text-left" : "text-left"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-black font-bold text-xs absolute left-0 sm:left-1/2 -translate-x-1/2 z-10 shadow-lg ring-4 ring-background">
                  {idx + 1}
                </div>

                <div className={`w-full sm:w-1/2 pl-12 sm:pl-0 ${idx % 2 === 0 ? "sm:pl-10" : "sm:pr-10"}`}>
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-md hover:border-gold/50 transition-colors">
                    <span className="font-mono text-xs font-bold text-gold">{item.year}</span>
                    <h3 className="font-display text-base font-bold text-foreground mt-1">{item.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sustainability CTA link ── */}
      <section className="py-16 bg-[#0f1117] text-white border-t border-border/40">
        <div className="mx-auto max-w-[1200px] px-6 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Leaf className="h-4 w-4" />
              <span>Ethics & Environment</span>
            </div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Committed to 100% Organic & Circularity</h2>
            <p className="mt-1 text-xs text-gray-400">Discover our transparent water-savings, living-wage ateliers, and zero-plastic mailers.</p>
          </div>
          <Link
            to="/sustainability"
            className="rounded-full bg-emerald-500 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-emerald-400 whitespace-nowrap"
          >
            Read Sustainability Report →
          </Link>
        </div>
      </section>
    </div>
  );
}
