import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube, ArrowUpRight, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";

const LINKS = {
  shop: [
    { label: "Men", to: "/shop", search: { gender: "men" } },
    { label: "Women", to: "/shop", search: { gender: "women" } },
    { label: "New Arrivals", to: "/shop", search: { badge: "new" } },
    { label: "Best Sellers", to: "/shop", search: { badge: "bestseller" } },
    { label: "Collections", to: "/collections" },
  ],
  help: [
    { label: "Track Your Order", to: "/track" },
    { label: "Returns & Exchanges", to: "/returns" },
    { label: "Size Guide", to: "/size-guide" },
    { label: "Contact Us", to: "/contact" },
  ],
  about: [
    { label: "Our Story", to: "/stories" },
    { label: "Sustainability", to: "/sustainability" },
    { label: "Collections", to: "/collections" },
  ],
};

export default function Footer() {
  const { isAdmin } = useAuth();

  return (
    <footer className="mt-0 border-t border-border">
      {/* Upper */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-[1400px] px-6 py-12 sm:py-16">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-2">
              <Link to="/" className="group inline-block" aria-label="PEHNAV Home">
                <BrandLogo size="lg" textClassName="text-background" />
              </Link>
              <p className="mt-3 max-w-xs text-xs sm:text-sm leading-relaxed text-background/60">
                Premium Indian fashion for those who wear their stories. Every stitch intentional. Every piece personal.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-background/20 text-background/60 transition-all hover:border-gold hover:text-gold active:scale-95"
                  aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-background/20 text-background/60 transition-all hover:border-gold hover:text-gold active:scale-95"
                  aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-background/20 text-background/60 transition-all hover:border-gold hover:text-gold active:scale-95"
                  aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="mailto:hello@pehnav.com"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-background/20 text-background/60 transition-all hover:border-gold hover:text-gold active:scale-95"
                  aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="eyebrow text-gold mb-3 sm:mb-4 text-[11px] sm:text-xs">Shop</h4>
              <ul className="space-y-2">
                {LINKS.shop.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to as any} search={l.search as any}
                      className="underline-draw text-xs sm:text-sm text-background/60 transition-colors hover:text-background py-0.5 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="eyebrow text-gold mb-3 sm:mb-4 text-[11px] sm:text-xs">Help</h4>
              <ul className="space-y-2">
                {LINKS.help.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to as any}
                      className="underline-draw text-xs sm:text-sm text-background/60 transition-colors hover:text-background py-0.5 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="eyebrow text-gold mb-3 sm:mb-4 text-[11px] sm:text-xs">Company</h4>
              <ul className="space-y-2">
                {LINKS.about.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to as any}
                      className="underline-draw text-xs sm:text-sm text-background/60 transition-colors hover:text-background py-0.5 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <Link to="/admin" className="flex items-center gap-1 text-xs sm:text-sm text-gold underline-draw py-0.5">
                      Admin ↗
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lower */}
      <div className="bg-foreground border-t border-background/10 pb-24 sm:pb-5">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row text-center sm:text-left">
          <p className="text-[11px] text-background/40">
            © {new Date().getFullYear()} PEHNAV. All rights reserved. Made with ♥ in India.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {["Privacy Policy", "Terms of Service", "Shipping Policy"].map((l) => (
              <Link key={l} to="/contact" className="text-[11px] text-background/40 underline-draw hover:text-background/60 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
