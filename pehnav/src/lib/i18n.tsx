import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "hi";

const dict = {
  en: {
    "nav.home": "Home", "nav.men": "Men", "nav.women": "Women", "nav.unisex": "Unisex",
    "nav.collections": "Collections", "nav.new": "New Arrivals", "nav.best": "Best Sellers",
    "nav.stories": "Stories", "nav.contact": "Contact",
    "hero.sub": "Every outfit tells a story.",
    "cta.shop": "Shop Now", "cta.stories": "Explore Stories", "cta.view": "View",
    "cta.addCart": "Add to Cart", "cta.buyNow": "Buy Now", "cta.wishlist": "Wishlist",
    "sec.categories": "Featured Categories", "sec.shopByStory": "Shop by Story",
    "sec.new": "New Arrivals", "sec.trending": "Trending Now",
    "sec.campaign": "The PEHNAV Campaign", "sec.customer": "Customer Stories",
    "news.title": "Join the Story", "news.sub": "Get early access to drops, stories and members-only offers.",
    "news.placeholder": "Enter your email", "news.cta": "Subscribe",
    "filter.title": "Filters", "filter.price": "Price", "filter.size": "Size",
    "filter.color": "Color", "filter.gender": "Gender", "filter.availability": "In Stock Only",
    "sort.label": "Sort", "sort.featured": "Featured", "sort.priceLow": "Price: Low to High",
    "sort.priceHigh": "Price: High to Low", "sort.rating": "Top Rated",
    "pdp.story": "The Story", "pdp.desc": "Description", "pdp.specs": "Specifications",
    "pdp.reviews": "Reviews", "pdp.related": "You May Also Like", "pdp.size": "Size", "pdp.color": "Color",
    "cart.title": "Your Cart", "cart.empty": "Your cart is empty.", "cart.subtotal": "Subtotal",
    "cart.checkout": "Checkout", "cart.coupon": "Coupon code", "cart.apply": "Apply",
    "cart.total": "Total", "cart.shipping": "Shipping", "cart.free": "Free",
    "wishlist.title": "Your Wishlist", "wishlist.empty": "No saved items yet.",
    "common.search": "Search products...", "common.results": "results",
  },
  hi: {
    "nav.home": "होम", "nav.men": "पुरुष", "nav.women": "महिला", "nav.unisex": "यूनिसेक्स",
    "nav.collections": "कलेक्शन", "nav.new": "नए आगमन", "nav.best": "बेस्ट सेलर",
    "nav.stories": "कहानियाँ", "nav.contact": "संपर्क",
    "hero.sub": "हर पहनावा एक कहानी कहता है।",
    "cta.shop": "अभी खरीदें", "cta.stories": "कहानियाँ देखें", "cta.view": "देखें",
    "cta.addCart": "कार्ट में डालें", "cta.buyNow": "अभी खरीदें", "cta.wishlist": "विशलिस्ट",
    "sec.categories": "विशेष श्रेणियाँ", "sec.shopByStory": "कहानी से खरीदें",
    "sec.new": "नए आगमन", "sec.trending": "अभी ट्रेंडिंग",
    "sec.campaign": "PEHNAV कैंपेन", "sec.customer": "ग्राहक कहानियाँ",
    "news.title": "कहानी में शामिल हों", "news.sub": "ड्रॉप्स, कहानियों और मेंबर ऑफर्स तक जल्दी पहुँच पाएं।",
    "news.placeholder": "अपना ईमेल दर्ज करें", "news.cta": "सब्सक्राइब करें",
    "filter.title": "फ़िल्टर", "filter.price": "मूल्य", "filter.size": "साइज़",
    "filter.color": "रंग", "filter.gender": "लिंग", "filter.availability": "केवल स्टॉक में",
    "sort.label": "क्रमबद्ध", "sort.featured": "विशेष", "sort.priceLow": "मूल्य: कम से अधिक",
    "sort.priceHigh": "मूल्य: अधिक से कम", "sort.rating": "टॉप रेटेड",
    "pdp.story": "कहानी", "pdp.desc": "विवरण", "pdp.specs": "विशेषताएँ",
    "pdp.reviews": "समीक्षाएँ", "pdp.related": "आपको यह भी पसंद आ सकता है", "pdp.size": "साइज़", "pdp.color": "रंग",
    "cart.title": "आपका कार्ट", "cart.empty": "आपका कार्ट खाली है।", "cart.subtotal": "उप-योग",
    "cart.checkout": "चेकआउट", "cart.coupon": "कूपन कोड", "cart.apply": "लागू करें",
    "cart.total": "कुल", "cart.shipping": "शिपिंग", "cart.free": "मुफ़्त",
    "wishlist.title": "आपकी विशलिस्ट", "wishlist.empty": "अभी तक कोई सहेजी गई वस्तु नहीं।",
    "common.search": "उत्पाद खोजें...", "common.results": "परिणाम",
  },
} as const;

type Key = keyof typeof dict.en;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  tl: (obj: { en: string; hi: string }) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("pehnav-lang") : null;
    if (saved === "hi" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("pehnav-lang", l);
  };

  const t = (k: Key) => dict[lang][k] ?? dict.en[k];
  const tl = (obj: { en: string; hi: string }) => obj[lang] ?? obj.en;

  return <Ctx.Provider value={{ lang, setLang, t, tl }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
