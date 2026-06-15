import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-3xl font-bold tracking-[0.18em]">PEHNAV</div>
          <p className="mt-3 max-w-xs text-sm text-background/60">Wear Your Story. Premium fashion for dreamers, hustlers, creators and wanderers.</p>
          <div className="mt-5 flex gap-4 text-background/70">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gold"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gold"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>
        <div>
          <h4 className="eyebrow text-gold">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm text-background/70">
            <li><Link to="/shop" search={{ gender: "men" } as never} className="hover:text-background">{t("nav.men")}</Link></li>
            <li><Link to="/shop" search={{ gender: "women" } as never} className="hover:text-background">{t("nav.women")}</Link></li>
            <li><Link to="/shop" search={{ badge: "new" } as never} className="hover:text-background">{t("nav.new")}</Link></li>
            <li><Link to="/collections" className="hover:text-background">{t("nav.collections")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-gold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-background/70">
            <li><Link to="/stories" className="hover:text-background">{t("nav.stories")}</Link></li>
            <li><Link to="/blog" className="hover:text-background">{t("nav.blog")}</Link></li>
            <li><Link to="/contact" className="hover:text-background">{t("nav.contact")}</Link></li>
            <li><Link to="/track" className="hover:text-background">Order Tracking</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-gold">Account</h4>
          <ul className="mt-4 space-y-2 text-sm text-background/70">
            <li><Link to="/account" className="hover:text-background">My Account</Link></li>
            <li><Link to="/wishlist" className="hover:text-background">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-background">Cart</Link></li>
            <li><Link to="/admin" className="hover:text-background">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 py-6 text-center text-xs text-background/50">
        © {new Date().getFullYear()} PEHNAV. Wear Your Story.
      </div>
    </footer>
  );
}
