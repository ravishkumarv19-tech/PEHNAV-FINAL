import { supabase } from "./supabase";
import {
  products as seedProducts,
  categories,
  IMAGES,
  CATEGORY_IMAGES,
  type Product,
  type Highlight,
  type Spec,
  type CustomColor,
  type ColorImage,
} from "./data";
import { PRODUCT_IMAGE_BY_ID } from "./assets";

const LEGACY_SEED_IDS = new Set([
  "midnight-hoodie", "forge-zip-hoodie", "nova-cropped-hoodie",
  "atlas-crew-sweatshirt", "pulse-half-zip-sweat", "frost-crew-knit",
  "willow-knit-vest", "aria-puffer-jacket", "ranger-denim-jacket",
  "nomad-wide-cargo", "luna-parachute-cargo", "pace-tech-joggers",
  "raw-selvedge-jeans", "azure-wide-jeans", "dusk-baggy-jeans",
  "pivot-court-sneakers", "mist-runner-sneakers", "heritage-cap",
  "dune-bucket-hat", "carryall-tote", "transit-crossbody",
  "atlas-backpack", "vista-square-sunglasses", "forge-leather-belt",
  "mono-reversible-belt", "meridian-watch", "pulse-minimal-watch"
]);

function safeImg(url: string | null | undefined, fallback?: string): string {
  if (!url || typeof url !== "string" || url.trim() === "" || url === "null" || url === "undefined") {
    return fallback || IMAGES.placeholder;
  }
  return url;
}

function dbRowToProduct(row: any, seed?: Product): Product {
  const cat = categories.find((c) => c.id === row.category);
  const distinctImage = seed?.image || PRODUCT_IMAGE_BY_ID[row.id] || (CATEGORY_IMAGES[row.category] ?? IMAGES.placeholder);

  // Use DB image only if it's a real custom user upload (Supabase storage URL, data URI, blob)
  // Otherwise, use our curated unique distinct image asset
  const isCustomUpload = row.image_url && (
    row.image_url.startsWith("http://") ||
    row.image_url.startsWith("https://") ||
    row.image_url.startsWith("blob:") ||
    row.image_url.startsWith("data:")
  ) && !row.image_url.includes("placeholder") && !row.image_url.includes("unsplash");

  const mainImage = isCustomUpload ? safeImg(row.image_url, distinctImage) : distinctImage;

  // Gallery: DB gallery (if custom uploads) → seed gallery → [mainImage]
  let gallery: string[] = [];
  if (Array.isArray(row.gallery) && row.gallery.length > 0) {
    gallery = row.gallery
      .map((u: string) => safeImg(u, distinctImage))
      .filter((u: string) => u && u !== IMAGES.placeholder);
  }
  if (gallery.length === 0 && seed?.gallery?.length) {
    gallery = seed.gallery.filter((u) => u !== IMAGES.placeholder);
  }
  if (gallery.length === 0) gallery = [mainImage];

  // Colors: DB custom_colors → DB colors → seed colors
  const customColors: CustomColor[] = Array.isArray(row.custom_colors) && row.custom_colors.length > 0
    ? row.custom_colors
    : (seed?.customColors ?? []);

  const colors: string[] = customColors.length > 0
    ? customColors.map((c: CustomColor) => c.hex)
    : (Array.isArray(row.colors) && row.colors.length > 0 ? row.colors : (seed?.colors ?? []));

  // Highlights/specs: DB → seed
  const highlights: Highlight[] = Array.isArray(row.highlights) && row.highlights.length > 0
    ? row.highlights : (seed?.highlights ?? []);

  const specs: Spec[] = Array.isArray(row.specs) && row.specs.length > 0
    ? row.specs : (seed?.specs ?? []);

  return {
    id: row.id,
    name: { en: row.name_en ?? seed?.name.en ?? "", hi: row.name_hi ?? row.name_en ?? seed?.name.hi ?? "" },
    price: row.price ?? seed?.price ?? 999,
    compareAt: row.compare_at ?? seed?.compareAt,
    image: mainImage,
    gallery,
    category: row.category ?? seed?.category ?? "tees",
    group: cat?.group ?? row.product_group ?? seed?.group ?? "apparel",
    gender: row.gender ?? seed?.gender ?? "unisex",
    collection: row.collection ?? seed?.collection,
    colors,
    customColors,
    colorImages: Array.isArray(row.color_images) ? row.color_images : (seed?.colorImages ?? []),
    sizes: Array.isArray(row.sizes) && row.sizes.length > 0 ? row.sizes : (seed?.sizes ?? []),
    rating: row.rating ?? seed?.rating ?? 4.5,
    reviews: row.review_count ?? seed?.reviews ?? 0,
    badge: row.badge ?? seed?.badge,
    inStock: row.in_stock ?? seed?.inStock ?? true,
    stock: row.stock ?? seed?.stock ?? 10,
    story: {
      en: row.story_en?.trim() || seed?.story.en || "",
      hi: row.story_hi?.trim() || row.story_en?.trim() || seed?.story.hi || "",
    },
    description: {
      en: row.description_en?.trim() || seed?.description.en || "",
      hi: row.description_hi?.trim() || row.description_en?.trim() || seed?.description.hi || "",
    },
    highlights,
    specs,
  };
}

let cache: { data: Product[]; fetchedAt: number } | null = null;
const TTL = 60_000;

export async function fetchAllProducts(): Promise<Product[]> {
  if (cache && Date.now() - cache.fetchedAt < TTL) return cache.data;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase products error:", error.message, "— using seeds");
      return seedProducts;
    }

    if (!data || data.length === 0) return seedProducts;

    // Build seed lookup for fallback images/data
    const seedMap = new Map<string, Product>(seedProducts.map((p) => [p.id, p]));

    // Filter out legacy stale seed duplicate IDs from previous SQL seed runs
    const validDbRows = data.filter((row: any) => !LEGACY_SEED_IDS.has(row.id));

    // DB products win over seeds, inherit seed images when DB has none
    const dbMap = new Map<string, Product>(
      validDbRows.map((row: any) => [row.id, dbRowToProduct(row, seedMap.get(row.id))])
    );

    // Merge: seeds first (as base catalog with unique images), then DB overrides/additions
    const merged = Array.from(new Map([...seedMap, ...dbMap]).values());
    cache = { data: merged, fetchedAt: Date.now() };
    return merged;
  } catch (err) {
    console.warn("fetchAllProducts error — using seeds:", err);
    return seedProducts;
  }
}

export function invalidateProductCache() {
  cache = null;
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  const all = await fetchAllProducts();
  return all.find((p) => p.id === id);
}