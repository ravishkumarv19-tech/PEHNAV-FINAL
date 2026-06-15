import heroImg from "@/assets/hero.jpg";
import campaignImg from "@/assets/campaign.jpg";
import teeImg from "@/assets/product-tee.jpg";
import hoodieImg from "@/assets/product-hoodie.jpg";
import cargoImg from "@/assets/product-cargo.jpg";
import shirtImg from "@/assets/product-shirt.jpg";
import jacketImg from "@/assets/product-jacket.jpg";
import denimImg from "@/assets/product-denim.jpg";
import sweatshirtImg from "@/assets/product-sweatshirt.jpg";
import joggersImg from "@/assets/product-joggers.jpg";
import capImg from "@/assets/product-cap.jpg";
import bagImg from "@/assets/product-bag.jpg";
import sneakersImg from "@/assets/product-sneakers.jpg";
import sunglassesImg from "@/assets/product-sunglasses.jpg";
import beltImg from "@/assets/product-belt.jpg";
import beanieImg from "@/assets/product-beanie.jpg";
import watchImg from "@/assets/product-watch.jpg";
import knitImg from "@/assets/product-knit.jpg";
import vTeeGraphic from "@/assets/v-tee-graphic.jpg";
import vTeeCrop from "@/assets/v-tee-crop.jpg";
import vShirtFlannel from "@/assets/v-shirt-flannel.jpg";
import vShirtOxford from "@/assets/v-shirt-oxford.jpg";
import vHoodieZip from "@/assets/v-hoodie-zip.jpg";
import vHoodieCrop from "@/assets/v-hoodie-crop.jpg";
import vSweatHalfzip from "@/assets/v-sweat-halfzip.jpg";
import vKnitCrew from "@/assets/v-knit-crew.jpg";
import vKnitVest from "@/assets/v-knit-vest.jpg";
import vJacketPuffer from "@/assets/v-jacket-puffer.jpg";
import vJacketDenim from "@/assets/v-jacket-denim.jpg";
import vCargoShorts from "@/assets/v-cargo-shorts.jpg";
import vCargoParachute from "@/assets/v-cargo-parachute.jpg";
import vJoggerTech from "@/assets/v-jogger-tech.jpg";
import vDenimWide from "@/assets/v-denim-wide.jpg";
import vDenimBaggy from "@/assets/v-denim-baggy.jpg";
import vSneakerCourt from "@/assets/v-sneaker-court.jpg";
import vSneakerRunner from "@/assets/v-sneaker-runner.jpg";
import vBucketHat from "@/assets/v-bucket-hat.jpg";
import vBagCrossbody from "@/assets/v-bag-crossbody.jpg";
import vBagBackpack from "@/assets/v-bag-backpack.jpg";
import vEyewearSquare from "@/assets/v-eyewear-square.jpg";
import vBeltReversible from "@/assets/v-belt-reversible.jpg";
import vWatchMinimal from "@/assets/v-watch-minimal.jpg";

export const IMAGES = {
  heroImg, campaignImg, teeImg, hoodieImg, cargoImg, shirtImg, jacketImg,
  denimImg, sweatshirtImg, joggersImg, capImg, bagImg, sneakersImg,
  sunglassesImg, beltImg, beanieImg, watchImg, knitImg,
};

export type Gender = "men" | "women" | "unisex";

export interface Product {
  id: string;
  name: { en: string; hi: string };
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  category: string; // category id
  group: string; // group id (apparel | footwear | accessories)
  gender: Gender;
  collection?: string; // collection id
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  badge?: "new" | "bestseller" | "limited";
  inStock: boolean;
  stock?: number;
  story: { en: string; hi: string };
  description: { en: string; hi: string };
}

export interface Category {
  id: string;
  name: { en: string; hi: string };
  image: string;
  group: string;
}

export interface Collection {
  id: string;
  name: { en: string; hi: string };
  tagline: { en: string; hi: string };
  description: { en: string; hi: string };
  image: string;
}

export const groups = [
  { id: "apparel", name: { en: "Apparel", hi: "परिधान" } },
  { id: "footwear", name: { en: "Footwear", hi: "फुटवियर" } },
  { id: "accessories", name: { en: "Accessories", hi: "एक्सेसरीज़" } },
];

export const categories: Category[] = [
  { id: "tees", name: { en: "Oversized Tees", hi: "ओवरसाइज़्ड टीज़" }, image: teeImg, group: "apparel" },
  { id: "shirts", name: { en: "Shirts", hi: "शर्ट्स" }, image: shirtImg, group: "apparel" },
  { id: "hoodies", name: { en: "Hoodies", hi: "हुडीज़" }, image: hoodieImg, group: "apparel" },
  { id: "sweatshirts", name: { en: "Sweatshirts", hi: "स्वेटशर्ट्स" }, image: sweatshirtImg, group: "apparel" },
  { id: "knitwear", name: { en: "Knitwear", hi: "निटवियर" }, image: knitImg, group: "apparel" },
  { id: "jackets", name: { en: "Jackets", hi: "जैकेट्स" }, image: jacketImg, group: "apparel" },
  { id: "cargo", name: { en: "Cargo Pants", hi: "कार्गो पैंट्स" }, image: cargoImg, group: "apparel" },
  { id: "joggers", name: { en: "Joggers", hi: "जॉगर्स" }, image: joggersImg, group: "apparel" },
  { id: "denim", name: { en: "Denim", hi: "डेनिम" }, image: denimImg, group: "apparel" },
  { id: "sneakers", name: { en: "Sneakers", hi: "स्नीकर्स" }, image: sneakersImg, group: "footwear" },
  { id: "caps", name: { en: "Caps & Hats", hi: "कैप्स और हैट्स" }, image: capImg, group: "accessories" },
  { id: "bags", name: { en: "Bags", hi: "बैग्स" }, image: bagImg, group: "accessories" },
  { id: "eyewear", name: { en: "Eyewear", hi: "आईवियर" }, image: sunglassesImg, group: "accessories" },
  { id: "belts", name: { en: "Belts", hi: "बेल्ट्स" }, image: beltImg, group: "accessories" },
  { id: "watches", name: { en: "Watches", hi: "घड़ियाँ" }, image: watchImg, group: "accessories" },
];

export const collections: Collection[] = [
  {
    id: "dreamers",
    name: { en: "Dreamers", hi: "ड्रीमर्स" },
    tagline: { en: "For those who imagine more", hi: "उनके लिए जो ज़्यादा सोचते हैं" },
    description: {
      en: "Soft silhouettes and quiet confidence for the ones who chase the unseen.",
      hi: "उनके लिए कोमल सिल्हूट और शांत आत्मविश्वास जो अनदेखे का पीछा करते हैं।",
    },
    image: teeImg,
  },
  {
    id: "hustlers",
    name: { en: "Hustlers", hi: "हसलर्स" },
    tagline: { en: "Built to keep moving", hi: "चलते रहने के लिए बना" },
    description: {
      en: "Hard-wearing utility pieces for the relentless and the restless.",
      hi: "अथक और बेचैन लोगों के लिए मज़बूत यूटिलिटी कपड़े।",
    },
    image: cargoImg,
  },
  {
    id: "creators",
    name: { en: "Creators", hi: "क्रिएटर्स" },
    tagline: { en: "Make it yours", hi: "इसे अपना बनाओ" },
    description: {
      en: "Statement layers and bold textures for the makers and the breakers.",
      hi: "रचनाकारों के लिए बोल्ड बनावट और स्टेटमेंट लेयर्स।",
    },
    image: hoodieImg,
  },
  {
    id: "wanderers",
    name: { en: "Wanderers", hi: "वांडरर्स" },
    tagline: { en: "Everywhere is home", hi: "हर जगह घर है" },
    description: {
      en: "Easy, travel-ready essentials for the ones who never settle.",
      hi: "उनके लिए आरामदायक, यात्रा के लिए तैयार ज़रूरतें जो कभी नहीं रुकते।",
    },
    image: shirtImg,
  },
];

const catImage: Record<string, string> = {
  tees: teeImg, shirts: shirtImg, hoodies: hoodieImg, sweatshirts: sweatshirtImg,
  knitwear: knitImg, jackets: jacketImg, cargo: cargoImg, joggers: joggersImg,
  denim: denimImg, sneakers: sneakersImg, caps: capImg, bags: bagImg,
  eyewear: sunglassesImg, belts: beltImg, watches: watchImg,
};
const catGroup: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.id, c.group])
);

type Seed = [
  id: string,
  en: string,
  hi: string,
  price: number,
  compareAt: number | 0,
  category: string,
  gender: Gender,
  collection: string,
  badge: "new" | "bestseller" | "limited" | "",
  storyEn: string,
  descEn: string,
  imageOverride?: string
];

const apparelSizes = ["S", "M", "L", "XL", "XXL"];
const womenSizes = ["XS", "S", "M", "L"];
const pantSizes = ["28", "30", "32", "34", "36"];
const shoeSizes = ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"];
const oneSize = ["One Size"];

const sizeFor = (cat: string, gender: Gender) => {
  if (cat === "sneakers") return shoeSizes;
  if (["caps", "bags", "eyewear", "watches"].includes(cat)) return oneSize;
  if (cat === "belts") return ["30", "32", "34", "36", "38"];
  if (["cargo", "joggers", "denim"].includes(cat)) return pantSizes;
  return gender === "women" ? womenSizes : apparelSizes;
};

const palette = ["#000000", "#D8C3A5", "#F5F5F5", "#BFA16A"];

const seeds: Seed[] = [
  // Tees
  ["ember-oversized-tee", "Ember Oversized Tee", "एम्बर ओवरसाइज़्ड टी", 999, 1499, "tees", "unisex", "dreamers", "bestseller", "Cut for stillness and motion alike — Ember moves the way a dream does.", "240 GSM heavyweight combed cotton with a relaxed drop-shoulder fit and tonal embroidery."],
  ["halo-boxy-tee", "Halo Boxy Tee", "हेलो बॉक्सी टी", 899, 0, "tees", "women", "dreamers", "new", "The everyday hero with a softer halo.", "Lightweight 180 GSM cotton with a cropped boxy fit."],
  ["echo-graphic-tee", "Echo Graphic Tee", "इको ग्राफिक टी", 1099, 1399, "tees", "unisex", "creators", "", "A quiet statement that speaks for itself.", "230 GSM cotton with a hand-drawn back print and ribbed collar."],
  ["solstice-tee", "Solstice Pocket Tee", "सोलस्टिस पॉकेट टी", 949, 0, "tees", "men", "wanderers", "", "Built for long days and longer roads.", "Breathable slub cotton with a chest pocket and side vents."],
  ["aura-crop-tee", "Aura Crop Tee", "ऑरा क्रॉप टी", 849, 1199, "tees", "women", "dreamers", "bestseller", "Light as a thought, bold as a move.", "Soft modal-cotton blend with a cropped relaxed cut."],
  ["mono-essential-tee", "Mono Essential Tee", "मोनो एसेंशियल टी", 799, 0, "tees", "unisex", "wanderers", "", "The blank page of your wardrobe.", "200 GSM organic cotton, pre-shrunk for a lasting fit."],

  // Shirts
  ["atelier-linen-shirt", "Atelier Linen Shirt", "एटेलियर लिनेन शर्ट", 1299, 1799, "shirts", "women", "wanderers", "limited", "Breathable, effortless — packs light, lives everywhere.", "100% washed linen with a boxy unisex cut and mother-of-pearl buttons."],
  ["monolith-overshirt", "Monolith Overshirt", "मोनोलिथ ओवरशर्ट", 1499, 0, "shirts", "men", "creators", "", "One piece, infinite layers.", "Structured cotton-twill overshirt that layers over everything."],
  ["mirage-camp-shirt", "Mirage Camp Shirt", "मिराज कैंप शर्ट", 1199, 1599, "shirts", "unisex", "wanderers", "new", "Holiday energy, all year round.", "Viscose camp-collar shirt with a relaxed resort silhouette."],
  ["forge-flannel-shirt", "Forge Flannel Shirt", "फोर्ज फ्लैनेल शर्ट", 1399, 0, "shirts", "men", "hustlers", "", "Warmth with an edge.", "Brushed cotton flannel with a tonal check and double chest pockets."],
  ["lumen-oxford-shirt", "Lumen Oxford Shirt", "ल्यूमेन ऑक्सफ़ोर्ड शर्ट", 1349, 1699, "shirts", "women", "dreamers", "", "Polished without trying.", "Crisp cotton oxford with a slightly cropped relaxed fit."],

  // Hoodies
  ["midnight-hoodie", "Midnight Heavy Hoodie", "मिडनाइट हेवी हुडी", 1799, 2499, "hoodies", "men", "creators", "new", "Built for late-night ideas and early-morning wins.", "Brushed fleece interior, double-lined hood and a clean minimal silhouette."],
  ["forge-zip-hoodie", "Forge Zip Hoodie", "फोर्ज ज़िप हुडी", 1999, 2799, "hoodies", "unisex", "hustlers", "bestseller", "Forged for those who build their own path.", "Premium full-zip with YKK hardware and an oversized hood."],
  ["drift-pullover-hoodie", "Drift Pullover Hoodie", "ड्रिफ्ट पुलओवर हुडी", 1699, 0, "hoodies", "women", "dreamers", "", "Soft enough to live in.", "320 GSM loop-back cotton with a relaxed boxy fit."],
  ["nova-cropped-hoodie", "Nova Cropped Hoodie", "नोवा क्रॉप्ड हुडी", 1599, 1999, "hoodies", "women", "creators", "new", "Bold lines, soft heart.", "Cropped fleece hoodie with a ribbed hem and kangaroo pocket."],

  // Sweatshirts
  ["atlas-crew-sweatshirt", "Atlas Crew Sweatshirt", "एटलस क्रू स्वेटशर्ट", 1499, 0, "sweatshirts", "unisex", "creators", "bestseller", "Carry your world, comfortably.", "Heavyweight french-terry crewneck with dropped shoulders."],
  ["dawn-oversized-sweat", "Dawn Oversized Sweat", "डॉन ओवरसाइज़्ड स्वेट", 1399, 1799, "sweatshirts", "women", "dreamers", "", "Made for slow mornings.", "Brushed cotton-blend sweatshirt with a relaxed drop-shoulder."],
  ["pulse-half-zip-sweat", "Pulse Half-Zip Sweat", "पल्स हाफ-ज़िप स्वेट", 1699, 2199, "sweatshirts", "men", "hustlers", "new", "Keep the momentum.", "Mid-weight half-zip with a funnel neck and ribbed cuffs."],

  // Knitwear
  ["harbor-knit-cardigan", "Harbor Knit Cardigan", "हार्बर निट कार्डिगन", 2199, 2799, "knitwear", "unisex", "wanderers", "limited", "Wrap yourself in calm.", "Ribbed cotton-wool blend cardigan with corozo buttons."],
  ["frost-crew-knit", "Frost Crew Knit", "फ्रॉस्ट क्रू निट", 1899, 0, "knitwear", "men", "creators", "", "Texture you can feel.", "Chunky ribbed crewneck knit in a relaxed silhouette."],
  ["willow-knit-vest", "Willow Knit Vest", "विलो निट वेस्ट", 1599, 1999, "knitwear", "women", "dreamers", "new", "Layer light, look sharp.", "Fine-gauge sleeveless knit vest with a V-neckline."],

  // Jackets
  ["voyager-bomber", "Voyager Bomber Jacket", "वोयाजर बॉम्बर जैकेट", 3299, 3999, "jackets", "men", "hustlers", "bestseller", "For takeoffs and turnarounds.", "Water-repellent nylon bomber with ribbed trims and zip pockets."],
  ["terra-coach-jacket", "Terra Coach Jacket", "टेरा कोच जैकेट", 2799, 0, "jackets", "unisex", "wanderers", "new", "Throw it on, head out.", "Cotton-twill coach jacket with snap buttons and a relaxed fit."],
  ["aria-puffer-jacket", "Aria Cropped Puffer", "एरिया क्रॉप्ड पफर", 3499, 4299, "jackets", "women", "creators", "limited", "Lightweight warmth, heavyweight presence.", "Recycled-fill cropped puffer with a stand collar."],
  ["ranger-denim-jacket", "Ranger Denim Jacket", "रेंजर डेनिम जैकेट", 2599, 0, "jackets", "men", "creators", "", "An icon, reimagined.", "Rigid denim trucker jacket with tonal stitching."],

  // Cargo
  ["drift-cargo", "Drift Cargo Pants", "ड्रिफ्ट कार्गो पैंट्स", 1599, 0, "cargo", "men", "hustlers", "bestseller", "Six pockets, zero compromise — for the ones always on the move.", "Durable ripstop cotton with tapered ankles and utility cargo pockets."],
  ["nomad-wide-cargo", "Nomad Wide Cargo", "नोमैड वाइड कार्गो", 1699, 0, "cargo", "unisex", "wanderers", "new", "Wide-leg freedom for the open road.", "Relaxed wide-leg cargo with adjustable hem drawcords."],
  ["scout-cargo-shorts", "Scout Cargo Shorts", "स्काउट कार्गो शॉर्ट्स", 1199, 1499, "cargo", "men", "hustlers", "", "Summer-ready utility.", "Knee-length ripstop cargo shorts with flap pockets."],
  ["luna-parachute-cargo", "Luna Parachute Cargo", "लूना पैराशूट कार्गो", 1799, 2199, "cargo", "women", "creators", "new", "Float through the day.", "Lightweight parachute cargo with elastic ankle toggles."],

  // Joggers
  ["pace-tech-joggers", "Pace Tech Joggers", "पेस टेक जॉगर्स", 1499, 0, "joggers", "men", "hustlers", "bestseller", "Move first, think later.", "Four-way stretch tech-knit joggers with zip pockets."],
  ["calm-fleece-joggers", "Calm Fleece Joggers", "काम फ्लीस जॉगर्स", 1399, 1799, "joggers", "women", "dreamers", "", "Comfort, refined.", "Brushed fleece joggers with a tapered leg and ribbed cuffs."],
  ["stride-relaxed-joggers", "Stride Relaxed Joggers", "स्ट्राइड रिलैक्स्ड जॉगर्स", 1349, 0, "joggers", "unisex", "wanderers", "new", "Everyday ease, elevated.", "Organic cotton joggers with a relaxed straight leg."],

  // Denim
  ["raw-selvedge-jeans", "Raw Selvedge Jeans", "रॉ सेल्वेज जीन्स", 2499, 0, "denim", "men", "creators", "bestseller", "They get better with every wear.", "14oz raw selvedge denim with a straight tapered leg."],
  ["azure-wide-jeans", "Azure Wide-Leg Jeans", "एज़ूर वाइड-लेग जीन्स", 2299, 2899, "denim", "women", "dreamers", "new", "Room to breathe, room to move.", "Rigid wide-leg denim with a high-rise waist."],
  ["fade-tapered-jeans", "Fade Tapered Jeans", "फेड टेपर्ड जीन्स", 2199, 0, "denim", "men", "hustlers", "", "Worn-in from day one.", "Stretch denim with a faded wash and tapered fit."],
  ["dusk-baggy-jeans", "Dusk Baggy Jeans", "डस्क बैगी जीन्स", 2399, 2999, "denim", "unisex", "creators", "limited", "Oversized, on purpose.", "Heavyweight baggy denim with a relaxed drop crotch."],

  // Sneakers
  ["cloud-low-sneakers", "Cloud Low Sneakers", "क्लाउड लो स्नीकर्स", 2999, 3799, "sneakers", "unisex", "wanderers", "bestseller", "Walk on clouds, leave a mark.", "Premium leather low-tops with a cushioned EVA midsole."],
  ["pivot-court-sneakers", "Pivot Court Sneakers", "पिवट कोर्ट स्नीकर्स", 2799, 0, "sneakers", "men", "hustlers", "new", "Built for the everyday game.", "Minimal court sneakers with a grippy rubber outsole."],
  ["mist-runner-sneakers", "Mist Runner Sneakers", "मिस्ट रनर स्नीकर्स", 3199, 3899, "sneakers", "women", "dreamers", "", "Light steps, long days.", "Knit-upper runners with a breathable mesh lining."],

  // Caps & Hats
  ["heritage-cap", "Heritage Two-Tone Cap", "हेरिटेज टू-टोन कैप", 699, 0, "caps", "unisex", "wanderers", "bestseller", "Top off your story.", "Cotton-twill six-panel cap with an adjustable strap."],
  ["dune-bucket-hat", "Dune Bucket Hat", "ड्यून बकेट हैट", 799, 999, "caps", "unisex", "creators", "new", "Shade, your way.", "Reversible cotton bucket hat with a structured brim."],
  ["loft-knit-beanie", "Loft Knit Beanie", "लॉफ्ट निट बीनी", 599, 0, "caps", "unisex", "dreamers", "", "Cozy meets clean.", "Ribbed knit beanie with a folded cuff.", beanieImg],

  // Bags
  ["carryall-tote", "Carryall Canvas Tote", "कैरीऑल कैनवस टोट", 1499, 0, "bags", "unisex", "wanderers", "bestseller", "Everything you need, nothing you don't.", "Heavy canvas tote with leather trims and a detachable strap."],
  ["transit-crossbody", "Transit Crossbody Bag", "ट्रांज़िट क्रॉसबॉडी बैग", 1299, 1699, "bags", "unisex", "hustlers", "new", "Hands free, mind clear.", "Water-resistant crossbody with multiple zip compartments."],
  ["atlas-backpack", "Atlas Daypack", "एटलस डेपैक", 2199, 2799, "bags", "unisex", "wanderers", "limited", "Carry your world.", "Padded laptop daypack with a 22L capacity and roll-top."],

  // Eyewear
  ["eclipse-sunglasses", "Eclipse Round Sunglasses", "इक्लिप्स राउंड सनग्लासेस", 1199, 0, "eyewear", "unisex", "creators", "bestseller", "See the world, your way.", "Matte acetate round frames with UV400 polarized lenses."],
  ["vista-square-sunglasses", "Vista Square Sunglasses", "विस्टा स्क्वायर सनग्लासेस", 1299, 1699, "eyewear", "unisex", "wanderers", "new", "A sharper point of view.", "Lightweight square frames with gradient polarized lenses."],

  // Belts
  ["forge-leather-belt", "Forge Leather Belt", "फोर्ज लेदर बेल्ट", 999, 0, "belts", "men", "hustlers", "", "Hold it all together.", "Full-grain leather belt with a brushed-gold plate buckle."],
  ["mono-reversible-belt", "Mono Reversible Belt", "मोनो रिवर्सिबल बेल्ट", 1099, 1399, "belts", "unisex", "creators", "new", "Two looks, one belt.", "Reversible black-and-tan leather belt with a rotating buckle."],

  // Watches
  ["meridian-watch", "Meridian Leather Watch", "मेरिडियन लेदर वॉच", 3499, 4299, "watches", "unisex", "creators", "limited", "Time, beautifully kept.", "Gold-tone case with a tan leather strap and sapphire crystal."],
  ["pulse-minimal-watch", "Pulse Minimal Watch", "पल्स मिनिमल वॉच", 2999, 0, "watches", "unisex", "dreamers", "new", "Every second, considered.", "Slim minimalist watch with a clean dial and quartz movement."],
];

const imageMap: Record<string, string> = {
  // tees
  "ember-oversized-tee": teeImg,
  "halo-boxy-tee": vTeeCrop,
  "echo-graphic-tee": vTeeGraphic,
  "solstice-tee": teeImg,
  "aura-crop-tee": vTeeCrop,
  "mono-essential-tee": vTeeGraphic,
  // shirts
  "atelier-linen-shirt": shirtImg,
  "monolith-overshirt": vShirtOxford,
  "mirage-camp-shirt": shirtImg,
  "forge-flannel-shirt": vShirtFlannel,
  "lumen-oxford-shirt": vShirtOxford,
  // hoodies
  "midnight-hoodie": hoodieImg,
  "forge-zip-hoodie": vHoodieZip,
  "drift-pullover-hoodie": hoodieImg,
  "nova-cropped-hoodie": vHoodieCrop,
  // sweatshirts
  "atlas-crew-sweatshirt": sweatshirtImg,
  "dawn-oversized-sweat": sweatshirtImg,
  "pulse-half-zip-sweat": vSweatHalfzip,
  // knitwear
  "harbor-knit-cardigan": knitImg,
  "frost-crew-knit": vKnitCrew,
  "willow-knit-vest": vKnitVest,
  // jackets
  "voyager-bomber": jacketImg,
  "terra-coach-jacket": jacketImg,
  "aria-puffer-jacket": vJacketPuffer,
  "ranger-denim-jacket": vJacketDenim,
  // cargo
  "drift-cargo": cargoImg,
  "nomad-wide-cargo": cargoImg,
  "scout-cargo-shorts": vCargoShorts,
  "luna-parachute-cargo": vCargoParachute,
  // joggers
  "pace-tech-joggers": vJoggerTech,
  "calm-fleece-joggers": joggersImg,
  "stride-relaxed-joggers": joggersImg,
  // denim
  "raw-selvedge-jeans": denimImg,
  "azure-wide-jeans": vDenimWide,
  "fade-tapered-jeans": denimImg,
  "dusk-baggy-jeans": vDenimBaggy,
  // sneakers
  "cloud-low-sneakers": sneakersImg,
  "pivot-court-sneakers": vSneakerCourt,
  "mist-runner-sneakers": vSneakerRunner,
  // caps
  "heritage-cap": capImg,
  "dune-bucket-hat": vBucketHat,
  "loft-knit-beanie": beanieImg,
  // bags
  "carryall-tote": bagImg,
  "transit-crossbody": vBagCrossbody,
  "atlas-backpack": vBagBackpack,
  // eyewear
  "eclipse-sunglasses": sunglassesImg,
  "vista-square-sunglasses": vEyewearSquare,
  // belts
  "forge-leather-belt": beltImg,
  "mono-reversible-belt": vBeltReversible,
  // watches
  "meridian-watch": watchImg,
  "pulse-minimal-watch": vWatchMinimal,
};

export const products: Product[] = seeds.map(
  ([id, en, hi, price, compareAt, category, gender, collection, badge, storyEn, descEn], i) => {
    const img = imageMap[id] || catImage[category];
    const gallery = [img, catImage[category], campaignImg];
    return {
      id,
      name: { en, hi },
      price,
      ...(compareAt ? { compareAt } : {}),
      image: img,
      gallery,
      category,
      group: catGroup[category],
      gender,
      collection,
      colors: palette.slice(0, 2 + (i % 3)),
      sizes: sizeFor(category, gender),
      rating: Math.round((4.4 + ((i * 7) % 6) / 10) * 10) / 10,
      reviews: 60 + ((i * 37) % 380),
      ...(badge ? { badge: badge as Product["badge"] } : {}),
      inStock: true,
      story: { en: storyEn, hi: storyEn },
      description: { en: descEn, hi: descEn },
    };
  }
);

export interface BlogPost {
  id: string;
  title: { en: string; hi: string };
  category: string;
  excerpt: { en: string; hi: string };
  image: string;
  date: string;
}

export const blogPosts: BlogPost[] = [
  { id: "build-a-capsule-wardrobe", title: { en: "Build a Capsule Wardrobe", hi: "कैप्सूल वॉर्डरोब बनाएं" }, category: "Style Guides", excerpt: { en: "Ten pieces. Endless stories. Here's how to start.", hi: "दस टुकड़े। अनंत कहानियाँ। यहाँ से शुरू करें।" }, image: teeImg, date: "2026-05-20" },
  { id: "the-art-of-layering", title: { en: "The Art of Layering", hi: "लेयरिंग की कला" }, category: "Fashion", excerpt: { en: "Master texture, proportion and contrast like an editor.", hi: "एक संपादक की तरह बनावट और कंट्रास्ट में महारत हासिल करें।" }, image: hoodieImg, date: "2026-05-12" },
  { id: "meet-the-creators", title: { en: "Meet the Creators", hi: "क्रिएटर्स से मिलें" }, category: "Stories", excerpt: { en: "The voices shaping PEHNAV's next collection.", hi: "PEHNAV के अगले कलेक्शन को आकार देने वाली आवाज़ें।" }, image: campaignImg, date: "2026-04-30" },
];

export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[Number(m) - 1]} ${y}`;
};

export const getProduct = (id: string) => products.find((p) => p.id === id);
