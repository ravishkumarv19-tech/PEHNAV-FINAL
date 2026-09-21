// assets.ts — Every asset in /src/assets/ imported and mapped.
// Vite processes these at build time. No string paths. No broken images.

import _modernHero       from "@/assets/modern-hero.jpg";
import _modernCampaign   from "@/assets/modern-campaign.jpg";
import _hero             from "@/assets/hero.jpg";
import _campaign         from "@/assets/campaign.jpg";

// ── Fresh Modern Streetwear & Archival Flagship Products ──────────────────────
import _modernJacket     from "@/assets/modern-jacket.jpg";
import _modernHoodie     from "@/assets/modern-hoodie.jpg";
import _modernTee        from "@/assets/modern-tee.jpg";

// ── Base category images ──────────────────────────────────────────────────────
import _prodTee          from "@/assets/product-tee.jpg";
import _prodShirt        from "@/assets/product-shirt.jpg";
import _prodHoodie       from "@/assets/product-hoodie.jpg";
import _prodSweatshirt   from "@/assets/product-sweatshirt.jpg";
import _prodKnit         from "@/assets/product-knit.jpg";
import _prodJacket       from "@/assets/product-jacket.jpg";
import _prodCargo        from "@/assets/product-cargo.jpg";
import _prodJoggers      from "@/assets/product-joggers.jpg";
import _prodDenim        from "@/assets/product-denim.jpg";
import _prodSneakers     from "@/assets/product-sneakers.jpg";
import _prodCap          from "@/assets/product-cap.jpg";
import _prodBag          from "@/assets/product-bag.jpg";
import _prodSunglasses   from "@/assets/product-sunglasses.jpg";
import _prodBelt         from "@/assets/product-belt.jpg";
import _prodWatch        from "@/assets/product-watch.jpg";
import _prodBeanie       from "@/assets/product-beanie.jpg";

// ── Variant images (v- prefix) ────────────────────────────────────────────────
import _teeCrop          from "@/assets/v-tee-crop.jpg";
import _teeGraphic       from "@/assets/v-tee-graphic.jpg";
import _hoodieCrop       from "@/assets/v-hoodie-crop.jpg";
import _hoodieZip        from "@/assets/v-hoodie-zip.jpg";
import _sweatHalfzip     from "@/assets/v-sweat-halfzip.jpg";
import _knitCrew         from "@/assets/v-knit-crew.jpg";
import _knitVest         from "@/assets/v-knit-vest.jpg";
import _jacketDenim      from "@/assets/v-jacket-denim.jpg";
import _jacketPuffer     from "@/assets/v-jacket-puffer.jpg";
import _cargoParachute   from "@/assets/v-cargo-parachute.jpg";
import _cargoShorts      from "@/assets/v-cargo-shorts.jpg";
import _joggerTech       from "@/assets/v-jogger-tech.jpg";
import _denimBaggy       from "@/assets/v-denim-baggy.jpg";
import _denimWide        from "@/assets/v-denim-wide.jpg";
import _shirtOxford      from "@/assets/v-shirt-oxford.jpg";
import _shirtFlannel     from "@/assets/v-shirt-flannel.jpg";
import _sneakerCourt     from "@/assets/v-sneaker-court.jpg";
import _sneakerRunner    from "@/assets/v-sneaker-runner.jpg";
import _bucketHat        from "@/assets/v-bucket-hat.jpg";
import _bagBackpack      from "@/assets/v-bag-backpack.jpg";
import _bagCrossbody     from "@/assets/v-bag-crossbody.jpg";
import _beltReversible   from "@/assets/v-belt-reversible.jpg";
import _watchMinimal     from "@/assets/v-watch-minimal.jpg";
import _eyewearSquare    from "@/assets/v-eyewear-square.jpg";

// ── Additional distinct assets ────────────────────────────────────────────────
import _royalBoots       from "@/assets/royal-boots.jpg";
import _royalCargo       from "@/assets/royal-cargo.jpg";
import _royalHoodie      from "@/assets/royal-hoodie.jpg";
import _royalJacket      from "@/assets/royal-jacket.jpg";
import _royalTee         from "@/assets/royal-tee.jpg";
import _royalWatch       from "@/assets/royal-watch.jpg";

// ── Exports ───────────────────────────────────────────────────────────────────
export const heroImg     = _modernHero;
export const campaignImg = _modernCampaign;

export const A = {
  modernHero: _modernHero,
  modernCampaign: _modernCampaign,
  hero: _hero,
  campaign: _campaign,

  modernJacket: _modernJacket,
  modernHoodie: _modernHoodie,
  modernTee: _modernTee,

  // Base Products
  prodTee: _prodTee,
  prodShirt: _prodShirt,
  prodHoodie: _prodHoodie,
  prodSweatshirt: _prodSweatshirt,
  prodKnit: _prodKnit,
  prodJacket: _prodJacket,
  prodCargo: _prodCargo,
  prodJoggers: _prodJoggers,
  prodDenim: _prodDenim,
  prodSneakers: _prodSneakers,
  prodCap: _prodCap,
  prodBag: _prodBag,
  prodSunglasses: _prodSunglasses,
  prodBelt: _prodBelt,
  prodWatch: _prodWatch,
  prodBeanie: _prodBeanie,

  // Variants
  tee: _modernTee,
  shirt: _shirtOxford,
  hoodie: _modernHoodie,
  sweatshirt: _sweatHalfzip,
  knit: _knitCrew,
  jacket: _modernJacket,
  cargo: _cargoParachute,
  joggers: _joggerTech,
  denim: _denimBaggy,
  sneakers: _sneakerRunner,
  cap: _bucketHat,
  bag: _bagCrossbody,
  sunglasses: _eyewearSquare,
  belt: _beltReversible,
  watch: _watchMinimal,
  beanie: _prodBeanie,
  teeCrop: _teeCrop,
  teeGraphic: _teeGraphic,
  hoodieCrop: _hoodieCrop,
  hoodieZip: _hoodieZip,
  sweatHalfzip: _sweatHalfzip,
  knitCrew: _knitCrew,
  knitVest: _knitVest,
  jacketDenim: _jacketDenim,
  jacketPuffer: _jacketPuffer,
  cargoParachute: _cargoParachute,
  cargoShorts: _cargoShorts,
  joggerTech: _joggerTech,
  denimBaggy: _denimBaggy,
  denimWide: _denimWide,
  shirtOxford: _shirtOxford,
  shirtFlannel: _shirtFlannel,
  sneakerCourt: _sneakerCourt,
  sneakerRunner: _sneakerRunner,
  bucketHat: _bucketHat,
  bagBackpack: _bagBackpack,
  bagCrossbody: _bagCrossbody,
  beltReversible: _beltReversible,
  watchMinimal: _watchMinimal,
  eyewearSquare: _eyewearSquare,

  // Distinct secondary items
  royalBoots: _royalBoots,
  royalCargo: _royalCargo,
  royalHoodie: _royalHoodie,
  royalJacket: _royalJacket,
  royalTee: _royalTee,
  royalWatch: _royalWatch,
};

export const CATEGORY_IMAGES: Record<string, string> = {
  tees: _modernTee,
  shirts: _shirtOxford,
  hoodies: _modernHoodie,
  sweatshirts: _sweatHalfzip,
  knitwear: _knitCrew,
  jackets: _modernJacket,
  cargo: _cargoParachute,
  joggers: _joggerTech,
  denim: _denimBaggy,
  sneakers: _sneakerRunner,
  caps: _bucketHat,
  bags: _bagCrossbody,
  eyewear: _eyewearSquare,
  belts: _beltReversible,
  watches: _watchMinimal,
};

export const COLLECTION_IMAGES: Record<string, string> = {
  dreamers: _modernTee,
  hustlers: _cargoParachute,
  creators: _modernJacket,
  wanderers: _modernHoodie,
};

export const PRODUCT_IMAGE_BY_ID: Record<string, string> = {
  // Tees
  "ember-oversized-tee": _modernTee,
  "halo-boxy-tee": _teeCrop,
  "echo-graphic-tee": _teeGraphic,
  "aura-crop-tee": _prodTee,
  "solid-base-tee": _royalTee,
  "premium-polo": _hero,

  // Shirts
  "oxford-shirt": _shirtOxford,
  "flannel-shirt": _shirtFlannel,
  "resort-shirt": _prodShirt,
  "oversized-shirt": _campaign,

  // Hoodies
  "midnight-heavy-hoodie": _modernHoodie,
  "midnight-hoodie": _modernHoodie,
  "crop-hoodie": _hoodieCrop,
  "nova-cropped-hoodie": _hoodieCrop,
  "zip-up-hoodie": _hoodieZip,
  "forge-zip-hoodie": _hoodieZip,
  "oversized-hoodie": _prodHoodie,

  // Sweatshirts
  "half-zip-sweatshirt": _sweatHalfzip,
  "pulse-half-zip-sweat": _sweatHalfzip,
  "crew-sweatshirt": _prodSweatshirt,
  "atlas-crew-sweatshirt": _prodSweatshirt,
  "graphic-sweatshirt": _royalHoodie,

  // Knitwear
  "harbor-knit-cardigan": _prodKnit,
  "crew-knit": _knitCrew,
  "frost-crew-knit": _knitCrew,
  "knit-vest": _knitVest,
  "willow-knit-vest": _knitVest,
  "polo-knit": _modernHero,

  // Jackets
  "voyager-bomber": _modernJacket,
  "denim-jacket": _jacketDenim,
  "ranger-denim-jacket": _jacketDenim,
  "puffer-jacket": _jacketPuffer,
  "aria-puffer-jacket": _jacketPuffer,
  "track-jacket": _prodJacket,

  // Cargo
  "drift-cargo": _cargoParachute,
  "parachute-cargo": _prodCargo,
  "luna-parachute-cargo": _prodCargo,
  "cargo-shorts": _cargoShorts,
  "wide-cargo": _royalCargo,
  "nomad-wide-cargo": _royalCargo,

  // Joggers
  "tech-joggers": _joggerTech,
  "pace-tech-joggers": _joggerTech,
  "classic-joggers": _prodJoggers,
  "track-pants": _royalJacket,

  // Denim
  "baggy-denim": _denimBaggy,
  "dusk-baggy-jeans": _denimBaggy,
  "wide-leg-denim": _denimWide,
  "azure-wide-jeans": _denimWide,
  "slim-denim": _prodDenim,
  "raw-selvedge-jeans": _prodDenim,

  // Sneakers
  "cloud-low-sneakers": _sneakerRunner,
  "court-sneaker": _sneakerCourt,
  "pivot-court-sneakers": _sneakerCourt,
  "runner-sneaker": _prodSneakers,
  "mist-runner-sneakers": _prodSneakers,
  "slip-on-sneaker": _royalBoots,

  // Caps
  "grid-cap": _prodCap,
  "heritage-cap": _prodCap,
  "bucket-hat": _bucketHat,
  "dune-bucket-hat": _bucketHat,
  "beanie": _prodBeanie,

  // Bags
  "backpack": _bagBackpack,
  "atlas-backpack": _bagBackpack,
  "crossbody-bag": _bagCrossbody,
  "transit-crossbody": _bagCrossbody,
  "tote-bag": _prodBag,
  "carryall-tote": _prodBag,
  "shoulder-bag": _modernCampaign,

  // Eyewear
  "eclipse-sunglasses": _prodSunglasses,
  "square-sunglasses": _eyewearSquare,
  "vista-square-sunglasses": _eyewearSquare,

  // Belts
  "reversible-belt": _beltReversible,
  "forge-leather-belt": _beltReversible,
  "woven-belt": _prodBelt,
  "mono-reversible-belt": _prodBelt,

  // Watches
  "minimal-watch": _watchMinimal,
  "pulse-minimal-watch": _watchMinimal,
  "sport-watch": _royalWatch,
  "meridian-watch": _royalWatch,
};

/**
 * Resolves an order item's image reliably, preventing broken images
 * caused by Vite dev paths (/src/assets/...) or outdated hashes in production.
 */
export function resolveOrderItemImage(imageUrl?: string | null, productId?: string | null): string {
  // 1. If productId has an exact Vite-bundled asset mapped, use it!
  if (productId && PRODUCT_IMAGE_BY_ID[productId]) {
    return PRODUCT_IMAGE_BY_ID[productId];
  }
  // 2. If imageUrl is a full external URL, use it
  if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:") || imageUrl.startsWith("blob:"))) {
    return imageUrl;
  }
  // 3. If imageUrl is valid and NOT an unbuilt dev path (/src/...)
  if (imageUrl && !imageUrl.startsWith("/src/") && !imageUrl.includes("placeholder")) {
    return imageUrl;
  }
  // 4. Fallback to default product tee asset
  return _modernTee;
}