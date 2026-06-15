import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { IMAGES, categories, collections, products } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PEHNAV — Wear Your Story | Premium Fashion" },
      { name: "description", content: "Shop premium oversized tees, hoodies and cargos. Storytelling fashion for dreamers, hustlers, creators and wanderers." },
      { property: "og:title", content: "PEHNAV — Wear Your Story" },
      { property: "og:description", content: "Every outfit tells a story." },
      { property: "og:image", content: IMAGES.heroImg },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, tl } = useI18n();
  const newArrivals = products.filter((p) => p.badge === "new").concat(products).slice(0, 4);
  const trending = products.filter((p) => p.badge === "bestseller").slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden">
        <img src={IMAGES.heroImg} alt="PEHNAV hero" width={1600} height={1100} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-20 text-background">
          <p className="eyebrow animate-fade-up text-beige">Wear Your Story</p>
          <h1 className="animate-fade-up font-display text-6xl font-bold leading-[0.9] sm:text-8xl lg:text-[10rem]">PEHNAV</h1>
          <p className="mt-4 max-w-md animate-fade-up text-lg text-background/80">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="group inline-flex items-center gap-2 bg-background px-8 py-4 text-sm font-medium uppercase tracking-wider text-foreground transition-transform hover:-translate-y-0.5">
              {t("cta.shop")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/stories" className="inline-flex items-center gap-2 border border-background/60 px-8 py-4 text-sm font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground">
              {t("cta.stories")}
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-border bg-foreground py-3 text-background">
        <div className="marquee-track flex w-max gap-12 whitespace-nowrap text-sm uppercase tracking-[0.3em]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-12">
              <span>Free Shipping Over ₹1499</span><span className="text-gold">★</span>
              <span>Easy 7-Day Returns</span><span className="text-gold">★</span>
              <span>Crafted in India</span><span className="text-gold">★</span>
              <span>Members-Only Drops</span><span className="text-gold">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <SectionHead eyebrow="Explore" title={t("sec.categories")} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id } as never}
              className="group relative aspect-[3/4] overflow-hidden rounded-md animate-stagger-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <img src={c.image} alt={tl(c.name)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-lg font-semibold text-background">{tl(c.name)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SHOP BY STORY */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <SectionHead eyebrow="Collections" title={t("sec.shopByStory")} />
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map((col) => (
              <Link key={col.id} to="/collections/$id" params={{ id: col.id }} className="group relative aspect-[16/10] overflow-hidden rounded-md">
                <img src={col.image} alt={tl(col.name)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-background">
                  <p className="eyebrow text-beige">{tl(col.tagline)}</p>
                  <h3 className="mt-1 font-display text-3xl font-bold">{tl(col.name)}</h3>
                  <p className="mt-2 max-w-sm text-sm text-background/80">{tl(col.description)}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-wider">{t("cta.view")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <SectionHead eyebrow="Just Dropped" title={t("sec.new")} link="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CAMPAIGN */}
      <section className="relative h-[70vh] min-h-[460px] overflow-hidden">
        <img src={IMAGES.campaignImg} alt="PEHNAV campaign" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col items-center justify-center px-6 text-center text-background">
          <p className="eyebrow text-beige">{t("sec.campaign")}</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold sm:text-6xl">We don't make clothes. We make characters.</h2>
          <Link to="/stories" className="mt-8 inline-flex items-center gap-2 border border-background/60 px-8 py-4 text-sm uppercase tracking-wider transition-colors hover:bg-background hover:text-foreground">{t("cta.stories")}</Link>
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <SectionHead eyebrow="Most Loved" title={t("sec.trending")} link="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CUSTOMER STORIES */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <SectionHead eyebrow="#WearYourStory" title={t("sec.customer")} />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "Aarav S.", q: "The fit is unreal. PEHNAV feels like a brand that gets my generation." },
              { n: "Meera K.", q: "Finally an Indian label that nails premium streetwear without the markup." },
              { n: "Dev R.", q: "Every drop tells a story. I'm collecting them like chapters." },
            ].map((r, i) => (
              <figure
                key={r.n}
                className="rounded-md bg-card p-8 animate-stagger-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold" />)}</div>
                <blockquote className="mt-4 text-lg">"{r.q}"</blockquote>
                <figcaption className="mt-4 text-sm font-medium text-muted-foreground">— {r.n}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}

function SectionHead({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) {
  const { t } = useI18n();
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="hidden items-center gap-2 text-sm uppercase tracking-wider hover:text-gold sm:inline-flex">
          {t("cta.view")} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function Newsletter() {
  const { t } = useI18n();
  return (
    <section className="bg-foreground py-20 text-background">
      <div className="mx-auto max-w-xl px-6 text-center">
        <p className="eyebrow text-gold">Newsletter</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{t("news.title")}</h2>
        <p className="mt-3 text-background/70">{t("news.sub")}</p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input type="email" required placeholder={t("news.placeholder")} className="flex-1 rounded-md border border-background/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-background/40 focus:border-gold" />
          <button className="rounded-md bg-gold px-6 py-3 text-sm font-medium uppercase tracking-wider text-foreground transition-transform hover:-translate-y-0.5">{t("news.cta")}</button>
        </form>
      </div>
    </section>
  );
}
