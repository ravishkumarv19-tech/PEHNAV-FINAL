import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import sustHeroImg from "@/assets/sustainability-hero.jpg";
import {
  Leaf,
  Droplets,
  Recycle,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  TreeDeciduous,
  ArrowRight,
  Package,
  Sparkles,
  Wind,
  Sun,
  Layers,
  Award,
} from "lucide-react";
import { IMAGES } from "@/lib/data";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability & Ethics — PEHNAV" },
      {
        name: "description",
        content:
          "Our commitment to circular fashion, 100% GOTS organic cotton, plastic-free packaging, and ethical craft.",
      },
    ],
  }),
  component: SustainabilityPage,
});

const PILLARS = [
  {
    icon: Leaf,
    title: "100% GOTS Organic Cotton",
    tagline: "Cultivated with zero harmful pesticides",
    stat: "91%",
    statLabel: "Less water consumed vs conventional cotton",
    description:
      "All PEHNAV tees and hoodies start at certified organic cooperative farms in Gujarat and Tamil Nadu. We use non-GMO seeds, natural crop rotation, and rain-fed irrigation that preserves the rich Indian soil for generations.",
    points: [
      "Zero toxic runoff into local water ecosystems",
      "Soft, hypoallergenic combed yarns (240–380 GSM)",
      "Certified by Global Organic Textile Standard (GOTS)",
    ],
  },
  {
    icon: Package,
    title: "Zero-Plastic Packaging",
    tagline: "100% compostable from mailer to garment bag",
    stat: "100%",
    statLabel: "Biodegradable within 90 days in compost",
    description:
      "Your order arrives in cassava and cornstarch-based polybags and recycled FSC-certified kraft cardboard. No single-use petroleum plastic ever touches your clothes or enters landfills.",
    points: [
      "Plastic-free paper tape with water-activated adhesive",
      "Organic cotton dust bags for footwear & outerwear",
      "Minimalist hangtags on recycled seed paper you can plant",
    ],
  },
  {
    icon: Droplets,
    title: "Closed-Loop Non-Toxic Dyes",
    tagline: "AZO-free color with 98% water reclamation",
    stat: "98%",
    statLabel: "Industrial water recycled & purified",
    description:
      "Our dyeing facilities operate state-of-the-art closed-loop Effluent Treatment Plants (ETP). The water is treated, filtered, and continuously recirculated, ensuring zero hazardous dyes are discharged into waterways.",
    points: [
      "OEKO-TEX Standard 100 certified non-toxic dyes",
      "Natural earthen mineral pigments for Earth tones",
      "High colorfastness that resists fading for 50+ washes",
    ],
  },
  {
    icon: HeartHandshake,
    title: "Artisanal Equity & Fair Wages",
    tagline: "Empowering master weavers & craftspeople",
    stat: "2.4x",
    statLabel: "Above regional minimum wage standard",
    description:
      "True luxury cannot come at the expense of human dignity. Our studio partners in Mumbai, Surat, and Tiruppur provide air-conditioned, naturally lit environments, comprehensive healthcare, and retirement security.",
    points: [
      "Fair living wages audited quarterly by third-party councils",
      "Skill preservation workshops for traditional hand-stitching",
      "40-hour work weeks with paid parental & sick leave",
    ],
  },
];

const CIRCULAR_STEPS = [
  {
    num: "01",
    title: "Organic Sourcing",
    desc: "100% certified organic cotton and recycled poly blends with traceable origin.",
  },
  {
    num: "02",
    title: "Precision Craft",
    desc: "Reinforced double-needle seams engineered to outlast fast-fashion by 5x.",
  },
  {
    num: "03",
    title: "Eco Packaging",
    desc: "Plastic-free, plant-based compostable mailers with zero single-use plastics.",
  },
  {
    num: "04",
    title: "Long Life Wear",
    desc: "Heavyweight fabrics that soften and gain character with every wash.",
  },
  {
    num: "05",
    title: "PEHNAV Re-Wear",
    desc: "Return worn pieces for ₹300 store credit. We recycle fibers into new collections.",
  },
];

const FAQS = [
  {
    q: "How can I participate in the PEHNAV Re-Wear circular initiative?",
    a: "When your PEHNAV piece reaches the end of its life, ship it back using our prepaid return label or drop it at any partner studio. You'll instantly receive a ₹300 voucher towards your next purchase, and we shred and spin the yarn into our recycled capsule collection.",
  },
  {
    q: "Are all garments 100% organic cotton?",
    a: "Our tees, shirts, and hoodies are 100% GOTS-certified organic combed cotton. For high-performance outerwear and cargo pants, we utilize GRS-certified recycled nylon and technical fabrics made from recycled ocean plastics.",
  },
  {
    q: "How do you offset shipping emissions?",
    a: "Every domestic and international order shipped by PEHNAV is carbon-neutral. We calculate the exact CO₂ emissions per gram of cargo and invest in verified reforestation projects across the Western Ghats of India.",
  },
  {
    q: "What certifications does PEHNAV hold?",
    a: "Our supply chain partners are certified under GOTS (Global Organic Textile Standard), OEKO-TEX Standard 100 (harmful chemical-free), Fair Trade Certified, and GRS (Global Recycled Standard).",
  },
];

export default function SustainabilityPage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [orderCountCalc, setOrderCountCalc] = useState<number>(3);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Calculations based on order count
  const waterSaved = orderCountCalc * 2400; // Liters
  const co2Prevented = (orderCountCalc * 3.8).toFixed(1); // kg
  const plasticDiverted = (orderCountCalc * 180).toLocaleString("en-IN"); // grams
  const treesPlanted = Math.max(1, Math.floor(orderCountCalc / 2));

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-[#0d0f14] py-24 sm:py-32 border-b border-border/40">
        <div className="absolute inset-0 opacity-40">
          <img
            src={sustHeroImg}
            alt="PEHNAV Sustainable Craft"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14]/85 to-black/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
              <Leaf className="h-3.5 w-3.5" />
              <span>Planet & People First</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Fashion with a Conscience. <br />
              <span className="text-gold">Luxury with Responsibility.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              We reject the fast-fashion race to the bottom. At PEHNAV, every garment is an intentional pledge: 100% organic fibers, closed-loop ethical milling, zero single-use plastics, and dignified craftspeople.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="btn-luxury inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-gold-light"
              >
                Explore Conscious Drops
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                Calculate Impact
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Impact Scorecard ── */}
      <section className="border-b border-border bg-card/40 py-12">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-secondary/30 border border-border/60">
              <span className="font-display text-3xl font-black text-emerald-500 sm:text-4xl">100%</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organic Cotton</span>
              <span className="text-[11px] text-muted-foreground/80 mt-1">GOTS Certified Origin</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-secondary/30 border border-border/60">
              <span className="font-display text-3xl font-black text-cyan sm:text-4xl">0g</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Virgin Plastic</span>
              <span className="text-[11px] text-muted-foreground/80 mt-1">100% Plant-Based Packaging</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-secondary/30 border border-border/60">
              <span className="font-display text-3xl font-black text-gold sm:text-4xl">2.4x</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fair Wage Index</span>
              <span className="text-[11px] text-muted-foreground/80 mt-1">Ethical Atelier Studios</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-secondary/30 border border-border/60">
              <span className="font-display text-3xl font-black text-purple-400 sm:text-4xl">Net-0</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Carbon</span>
              <span className="text-[11px] text-muted-foreground/80 mt-1">Offset via Western Ghats</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── The 4 Core Sustainability Pillars ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow text-gold font-bold">Our Philosophy</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              The 4 Pillars of Responsible Luxury
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              We design garments that honor both the wearer and the planet. Here is how our materials, methods, and people align.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 transition-all hover:border-gold/60 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <span className="font-display text-2xl font-black text-gold">{pillar.stat}</span>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{pillar.statLabel}</p>
                    </div>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-bold text-foreground">{pillar.title}</h3>
                  <p className="text-xs font-semibold text-gold mb-3">{pillar.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>

                  <div className="mt-6 space-y-2 border-t border-border/60 pt-4">
                    {pillar.points.map((pt) => (
                      <div key={pt} className="flex items-center gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive Impact Calculator ── */}
      <section id="calculator" className="py-20 bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-2xl">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold">
                  <Sparkles className="h-4 w-4" />
                  <span>Interactive Impact Simulator</span>
                </div>
                <h2 className="mt-2 font-display text-3xl font-bold">See What Choosing PEHNAV Saves</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Compared to conventional fast-fashion garments produced with chemical-heavy synthetic cotton and single-use plastics, your conscious choice makes an immediate tangible difference.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Number of Garments in Wardrobe:</span>
                    <span className="font-mono text-gold text-base">{orderCountCalc} {orderCountCalc === 1 ? "piece" : "pieces"}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={orderCountCalc}
                    onChange={(e) => setOrderCountCalc(Number(e.target.value))}
                    className="w-full accent-gold cursor-pointer h-2 bg-secondary rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>1 piece</span>
                    <span>10 pieces</span>
                    <span>20 pieces</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/80 bg-background p-5 text-center">
                  <Droplets className="mx-auto h-7 w-7 text-cyan mb-2" />
                  <p className="font-display text-2xl font-black text-cyan sm:text-3xl">{waterSaved.toLocaleString("en-IN")} L</p>
                  <p className="mt-1 text-xs font-bold text-foreground">Clean Water Saved</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Over conventional dyeing & irrigation</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-5 text-center">
                  <Wind className="mx-auto h-7 w-7 text-purple-400 mb-2" />
                  <p className="font-display text-2xl font-black text-purple-400 sm:text-3xl">{co2Prevented} kg</p>
                  <p className="mt-1 text-xs font-bold text-foreground">CO₂ Emissions Avoided</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Via organic farming & green logistics</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-5 text-center">
                  <Package className="mx-auto h-7 w-7 text-emerald-400 mb-2" />
                  <p className="font-display text-2xl font-black text-emerald-400 sm:text-3xl">{plasticDiverted} g</p>
                  <p className="mt-1 text-xs font-bold text-foreground">Plastic Diverted</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">100% compostable bio-poly</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-5 text-center">
                  <TreeDeciduous className="mx-auto h-7 w-7 text-gold mb-2" />
                  <p className="font-display text-2xl font-black text-gold sm:text-3xl">{treesPlanted}</p>
                  <p className="mt-1 text-xs font-bold text-foreground">Native Trees Funded</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Planted in Western Ghats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Circular Lifecycle Diagram ── */}
      <section className="py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow text-gold font-bold">Circular Fashion</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              From Seed to Soil: The Full Cycle
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              We take responsibility for the entire lifecycle of our garments, ensuring nothing is destined for a landfill.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CIRCULAR_STEPS.map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl border border-border/80 bg-card p-6 transition-transform hover:-translate-y-1"
              >
                <span className="font-mono text-3xl font-black text-gold/30">{step.num}</span>
                <h3 className="mt-3 font-display text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Certifications ── */}
      <section className="py-16 bg-card border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
            Independently Verified & Audited Standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-85">
            {[
              { name: "GOTS Organic", badge: "Global Organic Textile Standard" },
              { name: "OEKO-TEX 100", badge: "Tested for Harmful Substances" },
              { name: "Fair Trade Certified", badge: "Ethical Labor & Living Wages" },
              { name: "FSC Packaging", badge: "100% Recycled Forest Stewardship" },
              { name: "GRS Recycled", badge: "Global Recycled Standard" },
            ].map((cert) => (
              <div key={cert.name} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-gold">
                  <Award className="h-6 w-6" />
                </div>
                <span className="mt-2 text-xs font-bold text-foreground">{cert.name}</span>
                <span className="text-[10px] text-muted-foreground">{cert.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sustainability FAQ ── */}
      <section className="py-20 border-t border-border bg-background">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about our sourcing, packaging, and circular initiative.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm hover:text-gold transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 text-gold font-mono text-lg">{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to action ── */}
      <section className="py-16 bg-[#0f1117] text-white border-t border-border/40 text-center">
        <div className="mx-auto max-w-[800px] px-6">
          <Leaf className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Join the Mindful Fashion Movement</h2>
          <p className="mt-3 text-sm text-gray-400">
            Every piece you own tells a story. Choose one crafted with respect for the artisans and the Earth.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/shop"
              className="rounded-full bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-gold-light"
            >
              Shop Sustainable Collection →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
