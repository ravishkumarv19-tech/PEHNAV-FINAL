// data.ts — Seed products, types, helpers.
// 52 products covering all 15 categories, all using real assets from /src/assets/

import { A, heroImg, campaignImg, CATEGORY_IMAGES, COLLECTION_IMAGES } from "./assets";

export { CATEGORY_IMAGES, COLLECTION_IMAGES };

export const IMAGES = {
  placeholder: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f0ede8'/%3E%3Ctext x='200' y='260' font-family='sans-serif' font-size='14' fill='%23bbb' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E",
  heroImg,
  campaignImg,
};

export type Gender = "men" | "women" | "unisex";

export interface Highlight { label: string; value: string; }
export interface Spec      { label: string; value: string; }
export interface CustomColor { hex: string; name: string; }
export interface ColorImage  { hex: string; name: string; images: string[]; }

export interface Product {
  id: string;
  name: { en: string; hi: string };
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  category: string;
  group: string;
  gender: Gender;
  collection?: string;
  colors: string[];
  customColors?: CustomColor[];
  colorImages?: ColorImage[];
  sizes: string[];
  rating: number;
  reviews?: number;
  badge?: "new" | "bestseller" | "limited";
  inStock: boolean;
  stock?: number;
  story: { en: string; hi: string };
  description: { en: string; hi: string };
  highlights?: Highlight[];
  specs?: Spec[];
}

export interface Category  { id: string; name: { en: string; hi: string }; image: string; group: string; }
export interface Collection { id: string; name: { en: string; hi: string }; tagline: { en: string; hi: string }; description: { en: string; hi: string }; image: string; }

export const groups = [
  { id: "apparel",     name: { en: "Apparel",     hi: "परिधान"    } },
  { id: "footwear",    name: { en: "Footwear",    hi: "फुटवियर"   } },
  { id: "accessories", name: { en: "Accessories", hi: "एक्सेसरीज़" } },
];

export const categories: Category[] = [
  { id: "tees",        name: { en: "T-Shirts",    hi: "टी-शर्ट"    }, image: A.tee,        group: "apparel"     },
  { id: "shirts",      name: { en: "Shirts",      hi: "शर्ट"       }, image: A.shirt,      group: "apparel"     },
  { id: "hoodies",     name: { en: "Hoodies",     hi: "हुडी"       }, image: A.hoodie,     group: "apparel"     },
  { id: "sweatshirts", name: { en: "Sweatshirts", hi: "स्वेटशर्ट"  }, image: A.sweatshirt, group: "apparel"     },
  { id: "knitwear",    name: { en: "Knitwear",    hi: "निटवेयर"    }, image: A.knit,       group: "apparel"     },
  { id: "jackets",     name: { en: "Jackets",     hi: "जैकेट"      }, image: A.jacket,     group: "apparel"     },
  { id: "cargo",       name: { en: "Cargo Pants", hi: "कार्गो"     }, image: A.cargo,      group: "apparel"     },
  { id: "joggers",     name: { en: "Joggers",     hi: "जॉगर्स"     }, image: A.joggers,    group: "apparel"     },
  { id: "denim",       name: { en: "Denim",       hi: "डेनिम"      }, image: A.denim,      group: "apparel"     },
  { id: "sneakers",    name: { en: "Sneakers",    hi: "स्नीकर्स"   }, image: A.sneakers,   group: "footwear"    },
  { id: "caps",        name: { en: "Caps & Hats", hi: "कैप्स"      }, image: A.cap,        group: "accessories" },
  { id: "bags",        name: { en: "Bags",        hi: "बैग"        }, image: A.bag,        group: "accessories" },
  { id: "eyewear",     name: { en: "Eyewear",     hi: "आईवियर"     }, image: A.sunglasses, group: "accessories" },
  { id: "belts",       name: { en: "Belts",       hi: "बेल्ट"      }, image: A.belt,       group: "accessories" },
  { id: "watches",     name: { en: "Watches",     hi: "घड़ियाँ"    }, image: A.watch,      group: "accessories" },
];

export const collections: Collection[] = [
  { id: "dreamers",  name: { en: "Dreamers",  hi: "ड्रीमर्स"  }, tagline: { en: "Soft. Quiet. Confident.", hi: "सौम्य। शांत। आत्मविश्वासी।" }, description: { en: "For those who build worlds in their minds.", hi: "उनके लिए जो मन में दुनिया बनाते हैं।" }, image: A.teeCrop },
  { id: "hustlers",  name: { en: "Hustlers",  hi: "हसलर्स"    }, tagline: { en: "Utility meets ambition.", hi: "उपयोगिता और महत्वाकांक्षा का मिलन।" }, description: { en: "Built for those always in motion.", hi: "हमेशा गतिमान लोगों के लिए।" }, image: A.cargo },
  { id: "creators",  name: { en: "Creators",  hi: "क्रिएटर्स" }, tagline: { en: "Bold. Textured. Alive.", hi: "साहसी। बनावटी। जीवंत।" }, description: { en: "Wear your creative energy.", hi: "अपनी रचनात्मक ऊर्जा पहनें।" }, image: A.teeGraphic },
  { id: "wanderers", name: { en: "Wanderers", hi: "वंडरर्स"   }, tagline: { en: "Travel-ready. Always free.", hi: "यात्रा के लिए तैयार। सदा मुक्त।" }, description: { en: "Made for the ones who keep moving.", hi: "चलते रहने वालों के लिए।" }, image: A.jacket },
];

// ── Helper types for seed array ───────────────────────────────────────────────
type SeedColors = { h: string; n: string }[]; // [{h: hex, n: name}]
type SeedKV     = { l: string; v: string };    // {l: label, v: value}

interface Seed {
  id: string; en: string; hi: string;
  price: number; cmp?: number;
  cat: string; gender: Gender; col: string; badge?: "new"|"bestseller"|"limited";
  story: string; desc: string;
  colors: SeedColors; sizes: string[];
  hi_: SeedKV[]; specs: SeedKV[];
  img: string; gallery: string[];
}

const S = (
  id: string, en: string, hi: string,
  price: number, cmp: number,
  cat: string, gender: Gender, col: string, badge: string,
  story: string, desc: string,
  colors: [string, string][], sizes: string[],
  highlights: [string, string][], specs: [string, string][],
  img: string, gallery: string[]
): Seed => ({
  id, en, hi, price, cmp: cmp || undefined,
  cat, gender, col, badge: (badge as any) || undefined,
  story, desc,
  colors: colors.map(([h, n]) => ({ h, n })),
  sizes,
  hi_: highlights.map(([l, v]) => ({ l, v })),
  specs: specs.map(([l, v]) => ({ l, v })),
  img, gallery: gallery.length ? gallery : [img],
});

const seeds: Seed[] = [
  // ── TEES (6) ──────────────────────────────────────────────────────────────
  S("ember-oversized-tee","Raw Boxy Heavyweight Tee [280 GSM]","रॉ बॉक्सी हेवीवेट टी",1299,1899,
    "tees","unisex","dreamers","bestseller",
    "Engineered in 280 GSM heavyweight vintage-washed combed cotton. Features a boxy drop-shoulder cut, raw distressed hems, and subtle tonal studio branding.",
    "280 GSM high-density combed compact cotton. Pre-shrunk silicone enzyme wash. Minimalist architectural silhouette.",
    [["#000000","Washed Vintage Black"],["#D8C3A5","Raw Sand"]],
    ["XS","S","M","L","XL","XXL"],
    [["Fabric","280 GSM Vintage Cotton"],["Finish","Silicone Enzyme Washed"],["Fit","Boxy Drop-Shoulder"],["Origin","PEHNAV Studio Lab"]],
    [["Material","100% Combed Compact Cotton"],["Fit","Boxy Drop-Shoulder"],["Care","Machine wash cold, inside out"],["Origin","Made in India"]],
    A.modernTee,[A.modernTee]),

  S("halo-boxy-tee","Halo Boxy Tee","हेलो बॉक्सी टी",899,1199,
    "tees","women","dreamers","new",
    "The everyday hero with a softer halo. Built for those who move quietly but always get noticed.",
    "180 GSM lightweight combed cotton. Boxy fit with cropped length.",
    [["#000000","Black"],["#D8C3A5","Beige"]],
    ["XS","S","M","L"],
    [["Fabric","180 GSM Cotton"],["Fit","Boxy / Cropped"],["Occasion","Casual / College"],["Neck","Round Neck"]],
    [["Material","Combed Cotton"],["Fit","Boxy Cropped"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.teeCrop,[A.teeCrop]),

  S("echo-graphic-tee","Echo Graphic Tee","इको ग्राफिक टी",1099,1499,
    "tees","unisex","creators","new",
    "Every graphic tells a story. The Echo wears yours on its chest.",
    "240 GSM cotton with premium water-based screen print. Oversized fit.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","240 GSM Cotton"],["Fit","Oversized"],["Print","Water-based Screen Print"],["Occasion","Casual / Street"]],
    [["Material","100% Cotton"],["Print","Screen Print"],["Care","Wash inside out, cold"],["Origin","Made in India"]],
    A.teeGraphic,[A.teeGraphic]),

  S("aura-crop-tee","Aura Crop Tee","ऑरा क्रॉप टी",849,1199,
    "tees","women","dreamers","new",
    "Short in length. Long in statement. The Aura is confidence in 180 GSM.",
    "180 GSM cotton. Cropped length. Relaxed boxy fit.",
    [["#000000","Black"],["#D8C3A5","Beige"],["#BFA16A","Gold"]],
    ["XS","S","M","L"],
    [["Fabric","180 GSM Cotton"],["Fit","Cropped Boxy"],["Occasion","Street / Casual"],["Length","Cropped"]],
    [["Material","Cotton"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodTee,[A.prodTee]),

  S("solid-base-tee","Solid Base Tee","सॉलिड बेस टी",799,999,
    "tees","unisex","hustlers","bestseller",
    "The tee that does all the work so the rest of your outfit doesn't have to.",
    "200 GSM combed cotton. Crew neck. Regular fit.",
    [["#000000","Black"],["#F5F5F5","Off White"],["#34495E","Navy"],["#C0392B","Red"]],
    ["XS","S","M","L","XL","XXL"],
    [["Fabric","200 GSM Cotton"],["Fit","Regular"],["Neck","Crew Neck"],["Occasion","Everyday"]],
    [["Material","Combed Cotton"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.royalTee,[A.royalTee]),

  S("premium-polo","Premium Polo","प्रीमियम पोलो",1199,1499,
    "tees","men","hustlers","new",
    "The polo reimagined. Cleaner. Heavier. More intentional.",
    "240 GSM pique cotton. Polo collar. Slim fit.",
    [["#000000","Black"],["#F5F5F5","Off White"],["#34495E","Navy"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","240 GSM Pique"],["Fit","Slim"],["Collar","Polo"],["Occasion","Smart Casual"]],
    [["Material","Pique Cotton"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.hero,[A.hero]),

  // ── SHIRTS (4) ────────────────────────────────────────────────────────────
  S("oxford-shirt","Oxford Shirt","ऑक्सफोर्ड शर्ट",1299,1699,
    "shirts","men","hustlers","bestseller",
    "The shirt that goes anywhere. Oxford weave, built to last.",
    "100% cotton Oxford weave. Spread collar. Chest pocket. Regular fit.",
    [["#F5F5F5","Off White"],["#D8C3A5","Beige"],["#34495E","Navy"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","Cotton Oxford"],["Fit","Regular"],["Collar","Spread"],["Pattern","Solid"],["Occasion","Casual / Smart Casual"]],
    [["Material","100% Cotton"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.shirtOxford,[A.shirtOxford]),

  S("flannel-shirt","Flannel Shirt","फ्लैनल शर्ट",1499,1999,
    "shirts","men","wanderers","new",
    "Warm, textured, and completely at ease. The Flannel is for those who take the scenic route.",
    "Soft brushed flannel. Classic plaid. Relaxed fit.",
    [["#C0392B","Red"],["#34495E","Navy"]],
    ["S","M","L","XL"],
    [["Fabric","Brushed Flannel"],["Fit","Relaxed"],["Pattern","Plaid"],["Occasion","Casual / Outdoors"]],
    [["Material","Cotton Flannel"],["Care","Machine wash warm"],["Origin","Made in India"]],
    A.shirtFlannel,[A.shirtFlannel]),

  S("linen-shirt","Linen Shirt","लिनन शर्ट",1399,1799,
    "shirts","unisex","wanderers","new",
    "Light enough for the heat. Sharp enough for the moment.",
    "Cotton-linen blend. Relaxed fit. Camp collar.",
    [["#D8C3A5","Beige"],["#F5F5F5","Off White"],["#27AE60","Green"]],
    ["S","M","L","XL"],
    [["Fabric","Cotton-Linen Blend"],["Fit","Relaxed"],["Collar","Camp"],["Occasion","Casual / Summer"]],
    [["Material","Cotton Linen"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodShirt,[A.prodShirt]),

  S("oversized-shirt","Oversized Shirt","ओवरसाइज़्ड शर्ट",1599,0,
    "shirts","unisex","creators","new",
    "The shirt that becomes a statement when you stop trying to make one.",
    "Cotton poplin. Oversized boxy fit. Drop shoulders.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["S","M","L","XL"],
    [["Fabric","Cotton Poplin"],["Fit","Oversized Boxy"],["Occasion","Street / Casual"]],
    [["Material","Cotton Poplin"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.campaign,[A.campaign]),

  // ── HOODIES (4) ──────────────────────────────────────────────────────────
  S("midnight-heavy-hoodie","Archival Heavy Fleece Hoodie [450 GSM]","आर्काइवल हेवी फ्लीस हुडी",2499,3299,
    "hoodies","men","hustlers","bestseller",
    "450 GSM custom-milled high-density French Terry fleece. Double-layered hood, custom matte metal hardware, and ergonomic boxy drape.",
    "450 GSM heavy French Terry. Double-stitched seams. Minimalist tonal embroidery. Heavyweight ribbing at hem and cuffs.",
    [["#000000","Obsidian Black"],["#34495E","Washed Charcoal"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","450 GSM French Terry"],["Hardware","Matte Steel Aglets"],["Hood","Double Layered"],["Occasion","Streetwear / Archive"]],
    [["Material","450 GSM Custom Heavy Fleece"],["Care","Machine wash cold, air dry"],["Fit","Structured Oversized"],["Origin","PEHNAV Studio Lab"]],
    A.modernHoodie,[A.modernHoodie]),

  S("crop-hoodie","Crop Hoodie","क्रॉप हुडी",1599,1999,
    "hoodies","women","creators","new",
    "Cut short, worn loud. The Crop Hoodie is for those who take up space.",
    "280 GSM cotton fleece. Cropped silhouette with kangaroo pocket.",
    [["#E91E63","Pink"],["#000000","Black"],["#F5F5F5","Off White"]],
    ["XS","S","M","L"],
    [["Fabric","280 GSM Fleece"],["Fit","Cropped / Relaxed"],["Pockets","Kangaroo"],["Occasion","Street / Casual"]],
    [["Material","Cotton Fleece"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.hoodieCrop,[A.hoodieCrop]),

  S("zip-up-hoodie","Zip-Up Hoodie","ज़िप हुडी",1999,2499,
    "hoodies","unisex","hustlers","new",
    "All the warmth. None of the commitment. Zip up or leave open.",
    "300 GSM fleece. Full zip. Two side pockets.",
    [["#000000","Black"],["#95A5A6","Grey"],["#34495E","Navy"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","300 GSM Fleece"],["Fit","Regular"],["Closure","Full Zip"],["Pockets","2 Side Pockets"],["Occasion","Casual / Athleisure"]],
    [["Material","Fleece"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.hoodieZip,[A.hoodieZip]),

  S("oversized-hoodie","Oversized Hoodie","ओवरसाइज़्ड हुडी",1899,2299,
    "hoodies","unisex","dreamers","bestseller",
    "Big enough to disappear into. Soft enough to stay in all day.",
    "320 GSM oversized fleece. Deep kangaroo pocket.",
    [["#D8C3A5","Beige"],["#000000","Black"],["#95A5A6","Grey"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","320 GSM Fleece"],["Fit","Oversized"],["Pockets","Deep Kangaroo"],["Occasion","Casual / Loungewear"]],
    [["Material","Heavy Fleece"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodHoodie,[A.prodHoodie]),

  // ── SWEATSHIRTS (3) ──────────────────────────────────────────────────────
  S("half-zip-sweatshirt","Half-Zip Sweatshirt","हाफ-ज़िप स्वेटशर्ट",1399,1799,
    "sweatshirts","unisex","hustlers","bestseller",
    "Half zipped, fully ready. The HZ moves as fast as you do.",
    "300 GSM cotton fleece. Half-zip with metal zipper. Ribbed cuffs.",
    [["#000000","Black"],["#95A5A6","Grey"],["#F5F5F5","Off White"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","300 GSM Fleece"],["Fit","Regular"],["Closure","Half Zip"],["Occasion","Casual / Athleisure"]],
    [["Material","Cotton Fleece"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.sweatHalfzip,[A.sweatHalfzip]),

  S("crew-sweatshirt","Crew Sweatshirt","क्रू स्वेटशर्ट",1299,1599,
    "sweatshirts","unisex","dreamers","new",
    "Clean. Simple. Reliable. The crew that never lets you down.",
    "280 GSM cotton fleece. Crew neck. Ribbed cuffs and hem.",
    [["#000000","Black"],["#D8C3A5","Beige"],["#34495E","Navy"]],
    ["XS","S","M","L","XL","XXL"],
    [["Fabric","280 GSM Fleece"],["Fit","Regular"],["Neck","Crew Neck"],["Occasion","Casual"]],
    [["Material","Cotton Fleece"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodSweatshirt,[A.prodSweatshirt]),

  S("graphic-sweatshirt","Graphic Sweatshirt","ग्राफिक स्वेटशर्ट",1499,1899,
    "sweatshirts","unisex","creators","new",
    "The statement piece that doesn't need an occasion.",
    "280 GSM fleece. Crew neck. Front graphic print.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","280 GSM Fleece"],["Fit","Relaxed"],["Print","Front Graphic"],["Occasion","Street / Casual"]],
    [["Material","Cotton Fleece"],["Care","Wash inside out, cold"],["Origin","Made in India"]],
    A.royalHoodie,[A.royalHoodie]),

  // ── KNITWEAR (4) ─────────────────────────────────────────────────────────
  S("harbor-knit-cardigan","Harbor Knit Cardigan","हार्बर निट कार्डिगन",2199,2999,
    "knitwear","unisex","dreamers","limited",
    "The layer that makes everything look intentional.",
    "Premium cotton-acrylic blend. Open-front. Dropped shoulders. Ribbed details.",
    [["#D8C3A5","Beige"],["#95A5A6","Grey"],["#000000","Black"]],
    ["S","M","L","XL"],
    [["Fabric","Cotton-Acrylic Blend"],["Fit","Relaxed / Oversized"],["Closure","Open Front"],["Occasion","Casual / Smart Casual"]],
    [["Material","Cotton-Acrylic Blend"],["Care","Hand wash cold"],["Fit","Relaxed"],["Origin","Made in India"]],
    A.prodKnit,[A.prodKnit]),

  S("crew-knit","Crew Knit Sweater","क्रू निट स्वेटर",1799,2199,
    "knitwear","unisex","dreamers","new",
    "The crew you come back to every winter. Simple. Solid. Unshakeable.",
    "Heavyweight knit with ribbed crew neck, cuffs, and hem.",
    [["#34495E","Navy"],["#D8C3A5","Beige"],["#000000","Black"]],
    ["S","M","L","XL"],
    [["Fabric","Heavyweight Knit"],["Fit","Regular"],["Neck","Crew Neck"],["Occasion","Smart Casual / Winter"]],
    [["Material","Wool Blend"],["Care","Hand wash cold"],["Origin","Made in India"]],
    A.knitCrew,[A.knitCrew]),

  S("knit-vest","Knit Vest","निट वेस्ट",1499,1799,
    "knitwear","unisex","creators","new",
    "Layer it over a tee, under a jacket, or wear it alone. The Knit Vest doesn't have rules.",
    "Ribbed cotton-wool blend vest. Relaxed fit.",
    [["#D8C3A5","Beige"],["#000000","Black"],["#F5F5F5","Off White"]],
    ["S","M","L","XL"],
    [["Fabric","Cotton-Wool Blend"],["Fit","Relaxed"],["Style","Sleeveless"],["Occasion","Casual / Layering"]],
    [["Material","Cotton-Wool Blend"],["Care","Hand wash cold"],["Origin","Made in India"]],
    A.knitVest,[A.knitVest]),

  S("polo-knit","Polo Knit","पोलो निट",1999,2499,
    "knitwear","men","hustlers","new",
    "The polo, upgraded. Knit construction for texture and depth.",
    "Cotton-polyester knit polo. Slim fit.",
    [["#000000","Black"],["#F5F5F5","Off White"],["#34495E","Navy"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","Knit Cotton-Polyester"],["Fit","Slim"],["Collar","Polo"],["Occasion","Smart Casual"]],
    [["Material","Cotton-Polyester Knit"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.modernHero,[A.modernHero]),

  // ── JACKETS (4) ──────────────────────────────────────────────────────────
  S("voyager-bomber","Matte Cropped Down Puffer Jacket","मैट क्रॉप्ड डाउन पफर जैकेट",3499,4999,
    "jackets","unisex","wanderers","limited",
    "Thermal duck-down insulation encased in water-repellent matte Japanese ripstop nylon. Cropped boxy fit with adjustable bungee toggles at hem.",
    "Matte water-resistant nylon shell. 700-fill power down equivalent insulation. YKK two-way matte zipper. Dual fleece-lined hand pockets.",
    [["#D8C3A5","Matte Sand / Off-White"],["#000000","Matte Obsidian"]],
    ["S","M","L","XL"],
    [["Fabric","Matte Ripstop Nylon"],["Insulation","Thermal Down Tech"],["Hardware","YKK Matte Double Zip"],["Fit","Cropped Boxy"]],
    [["Material","Japanese Nylon + Thermal Fill"],["Care","Machine wash cold / tumble dry low"],["Origin","PEHNAV Studio Lab"]],
    A.modernJacket,[A.modernJacket]),

  S("denim-jacket","Denim Jacket","डेनिम जैकेट",2499,2999,
    "jackets","unisex","creators","new",
    "The jacket that gets better with every wear.",
    "14oz rigid denim. Chest pockets. Metal snap buttons.",
    [["#2980B9","Blue"],["#000000","Black"]],
    ["S","M","L","XL"],
    [["Fabric","14oz Rigid Denim"],["Fit","Regular"],["Closure","Metal Snap"],["Occasion","Casual / Street"]],
    [["Material","100% Cotton Denim"],["Care","Machine wash cold, inside out"],["Origin","Made in India"]],
    A.jacketDenim,[A.jacketDenim]),

  S("puffer-jacket","Puffer Jacket","पफर जैकेट",3499,3999,
    "jackets","unisex","wanderers","new",
    "When the temperature drops, the Puffer steps up.",
    "Lightweight puffer. Quilted construction. Packable.",
    [["#000000","Black"],["#34495E","Navy"],["#8B4513","Brown"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","Nylon Shell / Polyester Fill"],["Fit","Regular"],["Feature","Packable"],["Occasion","Winter / Outdoors"]],
    [["Material","Nylon + Polyester Fill"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.jacketPuffer,[A.jacketPuffer]),

  S("track-jacket","Track Jacket","ट्रैक जैकेट",1999,2499,
    "jackets","unisex","hustlers","new",
    "Sport-inspired. Street-ready. The Track Jacket blurs the line.",
    "Polyester track jacket. Zip front. Contrast side panels.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","Polyester Track"],["Fit","Regular"],["Closure","Full Zip"],["Occasion","Sport / Street"]],
    [["Material","Polyester"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodJacket,[A.prodJacket]),

  // ── CARGO (4) ────────────────────────────────────────────────────────────
  S("drift-cargo","Tactical Parachute Wide Cargo Pants","टैक्टिकल पैराशूट वाइड कार्गो",2299,2999,
    "cargo","unisex","hustlers","bestseller",
    "Engineered with 8 compartmentalized utility pockets, matte waterproof zippers, and adjustable elastic bungee cords at cuffs.",
    "High-density parachute nylon ripstop. Reinforced knee darts. Magnetic flap closures. Relaxed fluid drape.",
    [["#000000","Stealth Black"],["#95A5A6","Cement Grey"]],
    ["28","30","32","34","36","38"],
    [["Fabric","Parachute Ripstop"],["Pockets","8 Modular Compartments"],["Ankles","Bungee Cinch Cords"],["Occasion","Street / Hyper-Utility"]],
    [["Material","100% Ripstop Nylon"],["Fit","Wide Leg Parachute"],["Care","Machine wash cold"],["Origin","PEHNAV Studio Lab"]],
    A.cargoParachute,[A.cargoParachute]),

  S("parachute-cargo","Parachute Cargo","पैराशूट कार्गो",1799,2299,
    "cargo","unisex","wanderers","new",
    "Lightweight and ready for anything.",
    "Lightweight parachute nylon. Zippered cargo pockets. Tapered ankle.",
    [["#000000","Black"],["#95A5A6","Slate Grey"]],
    ["S","M","L","XL"],
    [["Fabric","Parachute Nylon"],["Fit","Tapered"],["Pockets","Zip Cargo Pockets"],["Occasion","Street / Travel"]],
    [["Material","Parachute Nylon"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodCargo,[A.prodCargo]),

  S("cargo-shorts","Cargo Shorts","कार्गो शॉर्ट्स",1199,1499,
    "cargo","men","hustlers","new",
    "All the utility. Half the fabric.",
    "Ripstop cotton shorts. 4 cargo pockets. Elasticated waist.",
    [["#000000","Black"],["#D8C3A5","Beige"],["#34495E","Navy"]],
    ["28","30","32","34","36"],
    [["Fabric","Ripstop Cotton"],["Fit","Relaxed"],["Pockets","4 Cargo Pockets"],["Length","Above Knee"],["Occasion","Casual / Summer"]],
    [["Material","Ripstop Cotton"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.cargoShorts,[A.cargoShorts]),

  S("wide-cargo","Wide Leg Cargo","वाइड लेग कार्गो",1899,2299,
    "cargo","unisex","creators","new",
    "The silhouette speaks before you do.",
    "Wide leg cargo trousers. 6 pockets. High waist.",
    [["#000000","Black"],["#8B4513","Brown"]],
    ["28","30","32","34","36"],
    [["Fabric","Cotton Twill"],["Fit","Wide Leg"],["Pockets","6 Pockets"],["Waist","High Waist"],["Occasion","Street / Editorial"]],
    [["Material","Cotton Twill"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.royalCargo,[A.royalCargo]),

  // ── JOGGERS (3) ──────────────────────────────────────────────────────────
  S("tech-joggers","Tech Joggers","टेक जॉगर्स",1599,1999,
    "joggers","men","hustlers","bestseller",
    "Engineered for motion. The Tech Jogger moves as fast as you do.",
    "4-way stretch French terry. Zippered pockets. Tapered ankle.",
    [["#000000","Black"],["#34495E","Navy"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","4-Way Stretch French Terry"],["Fit","Tapered"],["Pockets","Zip Pockets"],["Waist","Elasticated"],["Occasion","Athleisure / Casual"]],
    [["Material","Stretch French Terry"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.joggerTech,[A.joggerTech]),

  S("classic-joggers","Classic Joggers","क्लासिक जॉगर्स",1299,1599,
    "joggers","unisex","dreamers","new",
    "The ones you reach for on a slow Sunday. The Classic doesn't rush.",
    "300 GSM fleece joggers. Relaxed fit. Ribbed cuffs.",
    [["#000000","Black"],["#95A5A6","Grey"],["#D8C3A5","Beige"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","300 GSM Fleece"],["Fit","Relaxed"],["Cuffs","Ribbed"],["Occasion","Casual / Loungewear"]],
    [["Material","Cotton Fleece"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodJoggers,[A.prodJoggers]),

  S("track-pants","Track Pants","ट्रैक पैंट्स",1399,1699,
    "joggers","unisex","hustlers","new",
    "Sport heritage, street present.",
    "Polyester track pants. Side stripes. Snap buttons at ankle.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["S","M","L","XL","XXL"],
    [["Fabric","Polyester"],["Fit","Regular"],["Detail","Side Stripe"],["Closure","Snap Ankle"],["Occasion","Sport / Street"]],
    [["Material","Polyester"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.royalJacket,[A.royalJacket]),

  // ── DENIM (3) ────────────────────────────────────────────────────────────
  S("baggy-denim","Baggy Denim Jeans","बैगी डेनिम",1599,1999,
    "denim","unisex","creators","new",
    "Worn loose, lived in. Dressed on your own terms.",
    "Medium wash 12oz denim. Relaxed baggy fit. Five-pocket styling.",
    [["#2980B9","Blue"]],
    ["28","30","32","34","36"],
    [["Fabric","12oz Denim"],["Fit","Baggy / Relaxed"],["Wash","Medium Wash"],["Pockets","5 Pocket"],["Occasion","Casual / Street"]],
    [["Material","100% Cotton Denim"],["Care","Machine wash cold, inside out"],["Origin","Made in India"]],
    A.denimBaggy,[A.denimBaggy]),

  S("wide-leg-denim","Wide Leg Denim","वाइड लेग डेनिम",1799,2199,
    "denim","women","creators","new",
    "Floor-length confidence. The Wide Leg is for those who know how to fill a room.",
    "12oz stretch denim. Wide-leg silhouette. High waist.",
    [["#000000","Black"],["#2980B9","Blue"]],
    ["26","28","30","32","34"],
    [["Fabric","Stretch Denim"],["Fit","Wide Leg / High Waist"],["Wash","Dark Wash"],["Occasion","Casual / Street"]],
    [["Material","Stretch Cotton Denim"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.denimWide,[A.denimWide]),

  S("slim-denim","Slim Fit Denim","स्लिम डेनिम",1499,1899,
    "denim","men","hustlers","bestseller",
    "Clean. Fitted. Always ready.",
    "Dark wash 12oz denim. Slim tapered fit.",
    [["#000000","Black"],["#34495E","Dark Indigo"]],
    ["28","30","32","34","36"],
    [["Fabric","12oz Denim"],["Fit","Slim Tapered"],["Wash","Dark Wash"],["Pockets","5 Pocket"],["Occasion","Casual / Smart Casual"]],
    [["Material","Cotton Denim"],["Care","Machine wash cold, inside out"],["Origin","Made in India"]],
    A.prodDenim,[A.prodDenim]),

  // ── SNEAKERS (4) ─────────────────────────────────────────────────────────
  S("cloud-low-sneakers","Cyber Runner Platform Sneakers","साइबर रनर प्लेटफॉर्म स्नीकर्स",3999,5499,
    "sneakers","unisex","dreamers","bestseller",
    "Chunky ergonomic platform runner with multi-panel breathable tech mesh, 3M reflective accents, and shock-absorbing molded EVA outsole.",
    "Engineered technical mesh and vegan microfiber overlays. 3M reflective trims. Sculpted chunky platform EVA sole.",
    [["#000000","Stealth Cyber Black"],["#F5F5F5","Ice White / Silver"]],
    ["UK6","UK7","UK8","UK9","UK10","UK11"],
    [["Upper","Breathable Tech Mesh + Microfiber"],["Sole","Sculpted Platform EVA"],["Reflective","3M Luminescent Accents"],["Origin","PEHNAV Footwear Lab"]],
    [["Outer Material","Tech Mesh + Vegan Suede"],["Sole","Shock-Absorbing EVA + Rubber Tread"],["Care","Spot clean with damp cloth"],["Origin","Made in India"]],
    A.sneakerRunner,[A.sneakerRunner]),

  S("court-sneaker","Court Sneaker","कोर्ट स्नीकर",2499,2999,
    "sneakers","unisex","creators","new",
    "Court-inspired. Street-ready. The clean kick for every outfit.",
    "Canvas upper with leather toe cap. Vulcanized rubber sole.",
    [["#F5F5F5","Off White"],["#000000","Black"],["#2980B9","Blue"]],
    ["UK5","UK6","UK7","UK8","UK9","UK10","UK11"],
    [["Upper","Canvas + Leather Toe Cap"],["Sole","Vulcanized Rubber"],["Type","Court"],["Occasion","Casual / Street"]],
    [["Outer Material","Canvas"],["Sole","Rubber"],["Care","Spot clean"],["Origin","Made in India"]],
    A.sneakerCourt,[A.sneakerCourt]),

  S("runner-sneaker","Runner Sneaker","रनर स्नीकर",2499,2999,
    "sneakers","men","hustlers","new",
    "Made for pace. The Runner keeps up without trying.",
    "Mesh and synthetic upper. Lightweight rubber sole.",
    [["#000000","Black"],["#E67E22","Orange"]],
    ["UK6","UK7","UK8","UK9","UK10"],
    [["Upper","Mesh + Synthetic"],["Sole","Lightweight Rubber"],["Type","Runner"],["Occasion","Sport / Casual"]],
    [["Outer Material","Mesh + Synthetic"],["Sole","Rubber"],["Care","Wipe clean"],["Origin","Made in India"]],
    A.prodSneakers,[A.prodSneakers]),

  S("slip-on-sneaker","Slip-On Sneaker","स्लिप-ऑन",1999,2499,
    "sneakers","unisex","wanderers","new",
    "On in two seconds. Ready in one look.",
    "Canvas slip-on with elastic gusset. Rubber sole.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["UK5","UK6","UK7","UK8","UK9","UK10","UK11"],
    [["Upper","Canvas"],["Sole","Rubber"],["Closure","Slip-On"],["Occasion","Casual / Travel"]],
    [["Outer Material","Canvas"],["Sole","Rubber"],["Care","Spot clean"],["Origin","Made in India"]],
    A.royalBoots,[A.royalBoots]),

  // ── CAPS (3) ──────────────────────────────────────────────────────────────
  S("grid-cap","Grid Cap","ग्रिड कैप",699,899,
    "caps","unisex","hustlers","new",
    "The finishing touch. Always.",
    "6-panel. Structured front. Snapback closure.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["One Size"],
    [["Material","Cotton Twill"],["Panels","6-Panel"],["Closure","Snapback"],["Style","Structured"]],
    [["Material","Cotton Twill"],["Care","Spot clean only"],["Origin","Made in India"]],
    A.prodCap,[A.prodCap]),

  S("bucket-hat","Bucket Hat","बकेट हैट",799,999,
    "caps","unisex","wanderers","new",
    "Sun above. Shade around. The Bucket keeps you covered.",
    "Washed cotton. All-round brim. Packable.",
    [["#D8C3A5","Beige"],["#000000","Black"]],
    ["One Size"],
    [["Material","Washed Cotton"],["Brim","All-round"],["Feature","Packable / Foldable"],["Occasion","Outdoor / Casual"]],
    [["Material","Cotton"],["Care","Hand wash cold"],["Origin","Made in India"]],
    A.bucketHat,[A.bucketHat]),

  S("beanie","PEHNAV Beanie","पेहनव बीनी",599,799,
    "caps","unisex","dreamers","new",
    "Soft. Warm. Always the right call.",
    "Ribbed knit beanie. Slouchy fit.",
    [["#000000","Black"],["#D8C3A5","Beige"],["#34495E","Navy"]],
    ["One Size"],
    [["Material","Ribbed Knit"],["Fit","Slouchy"],["Occasion","Winter / Casual"]],
    [["Material","Acrylic Knit"],["Care","Hand wash cold"],["Origin","Made in India"]],
    A.prodBeanie,[A.prodBeanie]),

  // ── BAGS (4) ──────────────────────────────────────────────────────────────
  S("backpack","The PEHNAV Backpack","पेहनव बैकपैक",2499,2999,
    "bags","unisex","hustlers","bestseller",
    "Built for the daily hustle. Carries everything you need to build your story.",
    "Water-resistant 600D polyester. Padded laptop sleeve (up to 15 inch). Multiple compartments.",
    [["#000000","Black"],["#34495E","Navy"]],
    ["One Size"],
    [["Material","600D Polyester"],["Capacity","25L"],["Laptop","Up to 15 inch sleeve"],["Feature","Water-Resistant"]],
    [["Material","600D Polyester"],["Closure","Zip"],["Care","Wipe clean"],["Origin","Made in India"]],
    A.bagBackpack,[A.bagBackpack]),

  S("crossbody-bag","Crossbody Bag","क्रॉसबॉडी बैग",1499,1799,
    "bags","unisex","wanderers","new",
    "Everything you need, nothing you don't. The Crossbody travels light.",
    "Waxed canvas body. Adjustable strap. Interior organiser pockets.",
    [["#8B4513","Brown"],["#000000","Black"]],
    ["One Size"],
    [["Material","Waxed Canvas"],["Capacity","8L"],["Strap","Adjustable Crossbody"],["Pockets","3 Compartments"]],
    [["Material","Waxed Canvas"],["Closure","Zip"],["Care","Wipe with damp cloth"],["Origin","Made in India"]],
    A.bagCrossbody,[A.bagCrossbody]),

  S("tote-bag","Canvas Tote","कैनवास टोट",899,1199,
    "bags","unisex","creators","new",
    "Carry your world in your hands.",
    "Heavy duty canvas tote. Internal zip pocket. Reinforced handles.",
    [["#D8C3A5","Beige"],["#000000","Black"]],
    ["One Size"],
    [["Material","Heavy Canvas"],["Handles","Reinforced"],["Pocket","Internal Zip"],["Occasion","Daily / Market / Beach"]],
    [["Material","Cotton Canvas"],["Care","Machine wash cold"],["Origin","Made in India"]],
    A.prodBag,[A.prodBag]),

  S("shoulder-bag","Shoulder Bag","शोल्डर बैग",1999,2499,
    "bags","unisex","dreamers","new",
    "Minimal. Intentional. Always with you.",
    "Pebbled faux leather. Single compartment. Adjustable strap.",
    [["#000000","Black"],["#D8C3A5","Beige"]],
    ["One Size"],
    [["Material","Faux Leather"],["Strap","Adjustable"],["Style","Single Compartment"],["Occasion","Casual / Evening"]],
    [["Material","Faux Leather"],["Closure","Magnetic Snap"],["Care","Wipe clean"],["Origin","Made in India"]],
    A.modernCampaign,[A.modernCampaign]),

  // ── EYEWEAR (2) ───────────────────────────────────────────────────────────
  S("eclipse-sunglasses","Eclipse Sunglasses","एक्लिप्स सनग्लासेस",1199,1499,
    "eyewear","unisex","wanderers","bestseller",
    "See the world through a darker lens. The Eclipse is for those who move in silence.",
    "Polycarbonate frame. Polarized UV400 lenses. Lightweight.",
    [["#000000","Black"],["#8B4513","Brown"]],
    ["One Size"],
    [["Frame Material","Polycarbonate"],["Lens","Polarized UV400"],["Features","UV Protection | Lightweight"],["Face Type","Oval | Round | Square"],["Type","Wayfarer"]],
    [["Frame","Polycarbonate"],["Lens Color","Black"],["UV Protection","UV400"],["Weight","Lightweight"],["Care","Clean with microfiber cloth"]],
    A.prodSunglasses,[A.prodSunglasses]),

  S("square-sunglasses","Square Sunglasses","स्क्वेयर सनग्लासेस",1099,1399,
    "eyewear","unisex","creators","new",
    "Angular. Bold. Unbothered.",
    "Metal frame. Square lens. UV400 protection.",
    [["#000000","Black"],["#BFA16A","Gold"]],
    ["One Size"],
    [["Frame Material","Metal"],["Lens Shape","Square"],["Features","UV400 Protection"],["Face Type","Round | Oval"],["Type","Retro Square"]],
    [["Frame","Metal"],["Lens Color","Grey"],["UV Protection","UV400"],["Care","Clean with microfiber cloth"]],
    A.eyewearSquare,[A.eyewearSquare]),

  // ── BELTS (2) ─────────────────────────────────────────────────────────────
  S("reversible-belt","Reversible Belt","रिवर्सिबल बेल्ट",899,1199,
    "belts","unisex","hustlers","bestseller",
    "Two looks. One belt. Built for those who don't like to repeat themselves.",
    "Full grain leather. Reversible black/brown. Solid brass buckle.",
    [["#000000","Black"],["#8B4513","Brown"]],
    ["One Size"],
    [["Material","Full Grain Leather"],["Feature","Reversible Black/Brown"],["Buckle","Solid Brass"],["Width","35mm"]],
    [["Material","Full Grain Leather"],["Care","Leather conditioner recommended"],["Origin","Made in India"]],
    A.beltReversible,[A.beltReversible]),

  S("woven-belt","Woven Belt","वोवन बेल्ट",699,899,
    "belts","unisex","wanderers","new",
    "Textured. Casual. Different from every belt in the room.",
    "Cotton woven belt. Pin buckle. Adjustable.",
    [["#D8C3A5","Beige"],["#000000","Black"]],
    ["One Size"],
    [["Material","Cotton Weave"],["Buckle","Pin Buckle"],["Width","30mm"],["Occasion","Casual"]],
    [["Material","Cotton Weave"],["Care","Spot clean"],["Origin","Made in India"]],
    A.prodBelt,[A.prodBelt]),

  // ── WATCHES (2) ───────────────────────────────────────────────────────────
  S("minimal-watch","Monochrome Matte Stealth Timepiece","मोनोक्रोम मैट स्टेल्थ टाइमपीस",4499,6499,
    "watches","unisex","dreamers","bestseller",
    "Sleek matte sandblasted titanium finish with stealth monochromatic dial, sapphire crystal glass, and quick-release silicone link strap.",
    "Sandblasted titanium-coated alloy case. Minimalist dot indices. Scratch-resistant sapphire crystal. Japanese quartz movement.",
    [["#000000","Matte Obsidian"],["#95A5A6","Titanium Silver"]],
    ["One Size"],
    [["Case","Sandblasted Matte Titanium Alloy"],["Glass","Scratch-Resistant Sapphire Crystal"],["Movement","Japanese Quartz Calibre"],["Strap","High-Grade Stealth Silicone"]],
    [["Material","Titanium Alloy + Sapphire Glass"],["Water Resistance","5 ATM (50m)"],["Care","Wipe with microfiber cloth"],["Origin","PEHNAV Studio Lab"]],
    A.watchMinimal,[A.watchMinimal]),

  S("sport-watch","Sport Watch","स्पोर्ट वॉच",2499,2999,
    "watches","men","hustlers","new",
    "Built for those who measure everything.",
    "Stainless steel case. Silicone strap. Chronograph. 10 ATM water resistance.",
    [["#000000","Black"],["#F5F5F5","Off White"]],
    ["One Size"],
    [["Case","Stainless Steel"],["Strap","Silicone"],["Movement","Chronograph"],["Water Resistance","10 ATM"]],
    [["Material","Stainless Steel + Silicone"],["Water Resistance","10 ATM"],["Care","Rinse after contact with salt water"],["Origin","Made in India"]],
    A.royalWatch,[A.royalWatch]),
];

// ── Map seeds to Product objects ──────────────────────────────────────────────
export const products: Product[] = seeds.map((s) => ({
  id: s.id,
  name: { en: s.en, hi: s.hi },
  price: s.price,
  compareAt: s.cmp,
  image: s.img,
  gallery: s.gallery,
  category: s.cat,
  group: categories.find((c) => c.id === s.cat)?.group ?? "apparel",
  gender: s.gender,
  collection: s.col || undefined,
  badge: s.badge,
  story: { en: s.story, hi: s.story },
  description: { en: s.desc, hi: s.desc },
  colors: s.colors.map((c: { h: string }) => c.h),
  customColors: s.colors.map((c: { h: string; n: string }) => ({ hex: c.h, name: c.n })),
  sizes: s.sizes,
  highlights: s.hi_.map((h: { l: string; v: string }) => ({ label: h.l, value: h.v })),
  specs: s.specs.map((sp: { l: string; v: string }) => ({ label: sp.l, value: sp.v })),
  rating: 4.5,
  reviews: 0,
  inStock: true,
  stock: 100,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const formatDate  = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
export const getProduct  = (id: string) => products.find((p) => p.id === id);