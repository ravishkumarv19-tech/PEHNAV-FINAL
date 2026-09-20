import { useEffect, useState, useRef } from "react";
import {
  Plus, Search, Pencil, Trash2, Loader2, X, Upload,
  Image as ImageIcon, Check, GripVertical, Zap, List,
} from "lucide-react";
import { supabase, type Product } from "@/lib/supabase";
import { useAuth, logAudit } from "@/lib/auth";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["tees","shirts","hoodies","sweatshirts","knitwear","jackets","cargo","joggers","denim","sneakers","caps","bags","eyewear","belts","watches"];
const BADGES = ["","new","bestseller","limited"];
const GENDERS = ["men","women","unisex"];
const COLLECTIONS = ["","dreamers","hustlers","creators","wanderers"];
const GROUPS = ["apparel","footwear","accessories"];

const COLOR_PALETTE = [
  { hex: "#000000", name: "Black" },
  { hex: "#1a1a1a", name: "Charcoal" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#F5F5F5", name: "Off White" },
  { hex: "#ECF0F1", name: "Ivory" },
  { hex: "#95A5A6", name: "Grey" },
  { hex: "#D8C3A5", name: "Beige" },
  { hex: "#BFA16A", name: "Gold" },
  { hex: "#8B4513", name: "Brown" },
  { hex: "#34495E", name: "Navy" },
  { hex: "#2980B9", name: "Blue" },
  { hex: "#27AE60", name: "Green" },
  { hex: "#C0392B", name: "Red" },
  { hex: "#E67E22", name: "Orange" },
  { hex: "#9B59B6", name: "Purple" },
  { hex: "#E91E63", name: "Pink" },
  { hex: "#00BCD4", name: "Teal" },
  { hex: "#F39C12", name: "Amber" },
];

const SIZE_GROUPS: Record<string, string[]> = {
  "Apparel": ["XS","S","M","L","XL","XXL","3XL"],
  "Women's": ["XS","S","M","L","XL"],
  "Bottoms": ["28","30","32","34","36","38"],
  "Footwear": ["UK5","UK6","UK7","UK8","UK9","UK10","UK11","UK12"],
  "One Size": ["One Size"],
};

const HIGHLIGHT_TEMPLATES: Record<string, { label: string; value: string }[]> = {
  tees: [
    { label: "Fabric", value: "240 GSM Cotton" },
    { label: "Fit", value: "Oversized" },
    { label: "Occasion", value: "Casual / Everyday" },
    { label: "Neck", value: "Round Neck" },
  ],
  shirts: [
    { label: "Fabric", value: "Cotton Linen" },
    { label: "Fit", value: "Slim" },
    { label: "Pattern", value: "Solid" },
    { label: "Occasion", value: "Casual" },
    { label: "Collar", value: "Spread" },
  ],
  hoodies: [
    { label: "Fabric", value: "320 GSM Fleece" },
    { label: "Fit", value: "Relaxed" },
    { label: "Closure", value: "Pullover" },
    { label: "Pockets", value: "Kangaroo Pocket" },
  ],
  sweatshirts: [
    { label: "Fabric", value: "280 GSM Cotton" },
    { label: "Fit", value: "Relaxed" },
    { label: "Occasion", value: "Casual" },
  ],
  jackets: [
    { label: "Fabric", value: "Ripstop Nylon" },
    { label: "Fit", value: "Regular" },
    { label: "Closure", value: "Zip" },
    { label: "Feature", value: "Water-Repellent" },
  ],
  cargo: [
    { label: "Fabric", value: "Ripstop Cotton" },
    { label: "Fit", value: "Relaxed Tapered" },
    { label: "Pockets", value: "6 Pockets" },
    { label: "Closure", value: "Zip Fly" },
  ],
  joggers: [
    { label: "Fabric", value: "French Terry" },
    { label: "Fit", value: "Tapered" },
    { label: "Waistband", value: "Elasticated" },
  ],
  denim: [
    { label: "Fabric", value: "Stretch Denim" },
    { label: "Fit", value: "Tapered" },
    { label: "Wash", value: "Medium Wash" },
    { label: "Closure", value: "Zip Fly" },
  ],
  sneakers: [
    { label: "Outer Material", value: "Leather" },
    { label: "Sole", value: "Rubber" },
    { label: "Type", value: "Casual" },
    { label: "Occasion", value: "Everyday" },
  ],
  eyewear: [
    { label: "Frame Material", value: "Polycarbonate" },
    { label: "Lens Color", value: "Black" },
    { label: "Features", value: "UV Protection" },
    { label: "Face Type", value: "Oval | Round | Square" },
    { label: "Type", value: "Wayfarer" },
  ],
  caps: [
    { label: "Material", value: "Cotton Twill" },
    { label: "Closure", value: "Snapback" },
    { label: "Style", value: "6-Panel" },
  ],
  bags: [
    { label: "Material", value: "Canvas" },
    { label: "Capacity", value: "20L" },
    { label: "Pockets", value: "3 Compartments" },
  ],
  knitwear: [
    { label: "Fabric", value: "Merino Wool Blend" },
    { label: "Fit", value: "Regular" },
    { label: "Style", value: "Cardigan" },
  ],
  default: [
    { label: "Material", value: "" },
    { label: "Fit", value: "" },
  ],
};

const DEFAULT_SPECS = [
  { label: "Material", value: "Premium Cotton" },
  { label: "Fit", value: "Regular" },
  { label: "Care", value: "Machine wash cold" },
  { label: "Origin", value: "Made in India" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomColor { hex: string; name: string; }
interface ColorImage { hex: string; name: string; images: string[]; }
interface KV { label: string; value: string; }

// ─── Single Image Uploader ────────────────────────────────────────────────────
function SingleUploader({ value, onChange, label, compact }: {
  value: string; onChange: (url: string) => void; label?: string; compact?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Images only"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
      if (error) {
        const reader = new FileReader();
        reader.onload = (e) => onChange(e.target?.result as string);
        reader.readAsDataURL(file);
        toast.warning("Storage bucket not set up — using local preview. Run supabase_patch.sql first.");
        return;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Uploaded!");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className={`flex gap-2 ${compact ? "flex-col" : ""}`}>
        <div className={`flex-shrink-0 overflow-hidden rounded-lg border border-[#2a2d3a] bg-[#0f1117] flex items-center justify-center ${compact ? "h-20 w-full" : "h-20 w-16"}`}>
          {value
            ? <img src={value} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
            : <ImageIcon className="h-5 w-5 text-gray-600" />}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <button type="button" onClick={() => ref.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#2a2d3a] py-2.5 text-xs text-gray-500 hover:border-gold hover:text-gold transition-colors">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          <input ref={ref} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} className="hidden" />
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste URL" className="input text-xs" />
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Uploader ─────────────────────────────────────────────────────────
function GalleryUploader({ value, onChange }: { value: string[]; onChange: (g: string[]) => void }) {
  const addImg = (url: string) => { if (url && !value.includes(url)) onChange([...value, url]); };
  const removeImg = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    const g = [...value]; [g[i - 1], g[i]] = [g[i], g[i - 1]]; onChange(g);
  };

  return (
    <div>
      <label className="label">Gallery Images (up to 6 — customers browse these)</label>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {value.map((img, i) => (
          <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-[#2a2d3a] bg-[#0f1117]">
            <img src={img} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {i > 0 && <button type="button" onClick={() => moveUp(i)} className="text-[9px] text-white bg-white/20 rounded px-2 py-1">↑ Move up</button>}
              <button type="button" onClick={() => removeImg(i)} className="text-[9px] text-red-400 bg-red-500/20 rounded px-2 py-1">✕ Remove</button>
            </div>
            {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-gold text-black text-[9px] px-1.5 py-0.5 font-bold">Main</span>}
          </div>
        ))}
        {value.length < 6 && <SingleUploader value="" onChange={addImg} compact />}
      </div>
      <p className="text-[10px] text-gray-600">First image = main product photo. Hover to reorder or remove.</p>
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: CustomColor[]; onChange: (c: CustomColor[]) => void }) {
  const [customHex, setCustomHex] = useState("#");
  const [customName, setCustomName] = useState("");

  const isSelected = (hex: string) => !!value.find((c) => c.hex.toUpperCase() === hex.toUpperCase());

  const toggle = (hex: string, name: string) => {
    if (isSelected(hex)) onChange(value.filter((c) => c.hex.toUpperCase() !== hex.toUpperCase()));
    else onChange([...value, { hex, name }]);
  };

  const addCustom = () => {
    const h = customHex.trim();
    const n = customName.trim() || h;
    if (!/^#[0-9A-Fa-f]{6}$/.test(h)) { toast.error("Enter valid hex e.g. #A1B2C3"); return; }
    toggle(h, n);
    setCustomHex("#");
    setCustomName("");
  };

  return (
    <div>
      <label className="label">
        Colors
        {value.length > 0 && <span className="ml-2 font-normal text-gray-500">({value.map((c) => c.name).join(", ")})</span>}
      </label>

      {/* Palette swatches */}
      <div className="flex flex-wrap gap-2 mb-3">
        {COLOR_PALETTE.map((c) => {
          const sel = isSelected(c.hex);
          const dark = ["#000000","#1a1a1a","#34495E","#2980B9","#27AE60","#C0392B","#9B59B6","#E91E63"].includes(c.hex);
          return (
            <button key={c.hex} type="button" title={c.name} onClick={() => toggle(c.hex, c.name)}
              style={{ backgroundColor: c.hex }}
              className={`relative h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${sel ? "border-gold scale-110" : "border-[#2a2d3a]"}`}>
              {sel && <Check className={`absolute inset-0 m-auto h-3.5 w-3.5 ${dark ? "text-white" : "text-black"}`} />}
            </button>
          );
        })}
      </div>

      {/* Custom hex input */}
      <div className="flex gap-2 items-end mb-2">
        <input type="color" value={customHex === "#" ? "#000000" : customHex}
          onChange={(e) => setCustomHex(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded border border-[#2a2d3a] bg-transparent p-0.5 flex-shrink-0" />
        <input value={customHex} onChange={(e) => setCustomHex(e.target.value)}
          placeholder="#RRGGBB" className="input w-24 text-xs font-mono" />
        <input value={customName} onChange={(e) => setCustomName(e.target.value)}
          placeholder="Color name (e.g. Olive Green)"
          className="input flex-1 text-xs"
          onKeyDown={(e) => e.key === "Enter" && addCustom()} />
        <button type="button" onClick={addCustom} className="btn-ghost text-xs px-3 py-2 flex-shrink-0">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((c) => (
            <span key={c.hex} className="flex items-center gap-1.5 rounded-full bg-[#2a2d3a] px-2.5 py-1 text-xs text-gray-300">
              <span className="h-3 w-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c.hex }} />
              {c.name}
              <button type="button" onClick={() => toggle(c.hex, c.name)} className="text-gray-500 hover:text-red-400 ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Per-Color Image Manager (Flipkart style) ─────────────────────────────────
function ColorImageManager({ colors, colorImages, onChange }: {
  colors: CustomColor[];
  colorImages: ColorImage[];
  onChange: (ci: ColorImage[]) => void;
}) {
  const [activeColor, setActiveColor] = useState<string | null>(colors[0]?.hex ?? null);

  if (colors.length === 0) {
    return <p className="text-xs text-gray-600 italic">Add colors first, then assign images per color.</p>;
  }

  const getEntry = (hex: string): ColorImage => {
    const existing = colorImages.find((ci) => ci.hex.toUpperCase() === hex.toUpperCase());
    if (existing) return existing;
    const color = colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
    return { hex, name: color?.name ?? hex, images: [] };
  };

  const updateEntry = (hex: string, images: string[]) => {
    const color = colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
    const entry: ColorImage = { hex, name: color?.name ?? hex, images };
    const rest = colorImages.filter((ci) => ci.hex.toUpperCase() !== hex.toUpperCase());
    onChange([...rest, entry]);
  };

  const addImage = (hex: string, url: string) => {
    if (!url) return;
    const entry = getEntry(hex);
    if (!entry.images.includes(url)) updateEntry(hex, [...entry.images, url]);
  };

  const removeImage = (hex: string, i: number) => {
    const entry = getEntry(hex);
    updateEntry(hex, entry.images.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5 text-gold" />
        Per-Color Images
        <span className="text-[10px] text-gray-600 normal-case font-normal">(customers see these when they select a color)</span>
      </label>

      {/* Color tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {colors.map((c) => {
          const entry = getEntry(c.hex);
          const hasImages = entry.images.length > 0;
          return (
            <button key={c.hex} type="button"
              onClick={() => setActiveColor(c.hex)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${activeColor === c.hex ? "border-gold bg-gold/15 text-gold" : "border-[#2a2d3a] text-gray-400 hover:border-gray-500"}`}>
              <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }} />
              {c.name}
              {hasImages && <span className="text-[9px] text-emerald-400">✓{entry.images.length}</span>}
            </button>
          );
        })}
      </div>

      {/* Active color image editor */}
      {activeColor && (() => {
        const entry = getEntry(activeColor);
        return (
          <div className="rounded-lg border border-[#2a2d3a] bg-[#0f1117] p-3">
            <p className="text-[11px] text-gray-500 mb-2 flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activeColor }} />
              Images for <strong className="text-gray-300">{entry.name}</strong>
              <span className="text-gray-600">— first image shown when customer selects this color</span>
            </p>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {entry.images.map((img, i) => (
                <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-md border border-[#2a2d3a] bg-[#161920]">
                  <img src={img} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                  <button type="button" onClick={() => removeImage(activeColor, i)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500/80 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] bg-gold text-black rounded px-1 font-bold">Main</span>}
                </div>
              ))}
              {entry.images.length < 5 && (
                <SingleUploader value="" onChange={(url) => addImage(activeColor, url)} compact />
              )}
            </div>

            {entry.images.length === 0 && (
              <p className="text-[10px] text-gray-600 italic">No images yet for this color. Upload above or paste a URL.</p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Size Picker ──────────────────────────────────────────────────────────────
function SizePicker({ value, onChange, category }: { value: string[]; onChange: (s: string[]) => void; category: string }) {
  const suggested = ["sneakers"].includes(category) ? "Footwear"
    : ["cargo","joggers","denim"].includes(category) ? "Bottoms"
    : ["caps","bags","eyewear","belts","watches"].includes(category) ? "One Size"
    : "Apparel";

  const toggle = (s: string) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  const selectGroup = (gs: string[]) => {
    const all = gs.every((s) => value.includes(s));
    onChange(all ? value.filter((s) => !gs.includes(s)) : [...new Set([...value, ...gs])]);
  };

  return (
    <div>
      <label className="label">Sizes {value.length > 0 && <span className="text-gray-500">({value.join(", ")})</span>}</label>
      {Object.entries(SIZE_GROUPS).map(([g, sizes]) => (
        <div key={g} className="mb-3">
          <div className="mb-1 flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${g === suggested ? "text-gold" : "text-gray-600"}`}>
              {g}{g === suggested ? " ✦" : ""}
            </span>
            <button type="button" onClick={() => selectGroup(sizes)} className="text-[10px] text-gray-600 hover:text-gray-400 underline">
              {sizes.every((s) => value.includes(s)) ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button key={s} type="button" onClick={() => toggle(s)}
                className={`min-w-10 rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${value.includes(s) ? "border-gold bg-gold/15 text-gold" : "border-[#2a2d3a] text-gray-400 hover:border-gray-500"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Highlights Builder ───────────────────────────────────────────────────────
function HighlightsBuilder({ value, onChange, category }: {
  value: KV[]; onChange: (h: KV[]) => void; category: string;
}) {
  const applyTemplate = () => {
    const tmpl = HIGHLIGHT_TEMPLATES[category] ?? HIGHLIGHT_TEMPLATES.default;
    onChange(tmpl.map((h) => ({ ...h })));
    toast.success(`Applied ${category} template`);
  };

  const update = (i: number, field: keyof KV, val: string) =>
    onChange(value.map((h, idx) => idx === i ? { ...h, [field]: val } : h));
  const add = () => onChange([...value, { label: "", value: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-gold" />
          Key Highlights
          <span className="text-[10px] text-gray-600 normal-case font-normal">(Flipkart-style on product page)</span>
        </label>
        <button type="button" onClick={applyTemplate} className="text-[10px] text-gold hover:underline flex-shrink-0">
          Apply {category} template
        </button>
      </div>

      <div className="space-y-2">
        {value.map((h, i) => (
          <div key={i} className="flex gap-2 items-center">
            <GripVertical className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
            <input
              value={h.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label (e.g. Fabric)"
              className="input text-xs flex-shrink-0"
              style={{ width: "120px" }}
            />
            <input
              value={h.value}
              onChange={(e) => update(i, "value", e.target.value)}
              placeholder="Value (e.g. 240 GSM Cotton)"
              className="input text-xs flex-1"
            />
            <button type="button" onClick={() => remove(i)} className="text-gray-600 hover:text-red-400 flex-shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-[11px] text-gray-500 hover:text-gold flex items-center gap-1">
        <Plus className="h-3 w-3" /> Add highlight row
      </button>
    </div>
  );
}

// ─── Specs Builder ────────────────────────────────────────────────────────────
function SpecsBuilder({ value, onChange }: { value: KV[]; onChange: (s: KV[]) => void }) {
  const update = (i: number, field: keyof KV, val: string) =>
    onChange(value.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const add = () => onChange([...value, { label: "", value: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="label mb-2 flex items-center gap-1.5">
        <List className="h-3.5 w-3.5 text-gold" />
        Specifications
        <span className="text-[10px] text-gray-600 normal-case font-normal">(shown in Specifications tab)</span>
      </label>
      <div className="space-y-2">
        {value.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={s.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label (e.g. Material)"
              className="input text-xs flex-shrink-0"
              style={{ width: "120px" }}
            />
            <input
              value={s.value}
              onChange={(e) => update(i, "value", e.target.value)}
              placeholder="Value (e.g. Premium Cotton)"
              className="input text-xs flex-1"
            />
            <button type="button" onClick={() => remove(i)} className="text-gray-600 hover:text-red-400 flex-shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-[11px] text-gray-500 hover:text-gold flex items-center gap-1">
        <Plus className="h-3 w-3" /> Add spec row
      </button>
    </div>
  );
}

// ─── Main Products Component ──────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  id: "", name_en: "", name_hi: "", price: 999, compare_at: undefined as number | undefined,
  image_url: "", gallery: [] as string[], category: "tees", product_group: "apparel",
  gender: "unisex", collection: "", custom_colors: [] as CustomColor[],
  color_images: [] as ColorImage[], colors: [] as string[], sizes: [] as string[],
  highlights: [] as KV[], specs: [...DEFAULT_SPECS] as KV[],
  badge: null as string | null, in_stock: true, stock: 100,
  story_en: "", description_en: "",
};

export default function Products() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<typeof EMPTY_PRODUCT | null>(null);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (catFilter !== "all") q = q.eq("category", catFilter);
    const { data, error } = await q;
    if (error) toast.error("Load failed: " + error.message);
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [catFilter]);

  const filtered = products.filter((p) =>
    !search || p.name_en.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing({
      ...EMPTY_PRODUCT,
      highlights: (HIGHLIGHT_TEMPLATES["tees"] ?? HIGHLIGHT_TEMPLATES.default).map((h) => ({ ...h })),
      specs: [...DEFAULT_SPECS],
    });
    setIsNew(true);
  };

  const openEdit = (p: Product) => {
    const customColors: CustomColor[] = Array.isArray((p as any).custom_colors) ? (p as any).custom_colors : [];
    const colorImages: ColorImage[] = Array.isArray((p as any).color_images) ? (p as any).color_images : [];
    const highlights: KV[] = Array.isArray((p as any).highlights) ? (p as any).highlights : [];
    const specs: KV[] = Array.isArray((p as any).specs) && (p as any).specs.length > 0 ? (p as any).specs : [...DEFAULT_SPECS];
    const gallery: string[] = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : p.image_url ? [p.image_url] : [];

    // If no custom_colors but has legacy colors array, migrate them
    const migratedColors = customColors.length > 0
      ? customColors
      : (Array.isArray(p.colors) ? p.colors : []).map((hex: string) => {
          const named = COLOR_PALETTE.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
          return { hex, name: named?.name ?? hex };
        });

    setEditing({
      ...EMPTY_PRODUCT,
      id: p.id,
      name_en: p.name_en,
      name_hi: p.name_hi ?? "",
      price: p.price,
      compare_at: p.compare_at ?? undefined,
      image_url: p.image_url ?? "",
      gallery,
      category: p.category ?? "tees",
      product_group: p.product_group ?? "apparel",
      gender: (p.gender as any) ?? "unisex",
      collection: p.collection ?? "",
      custom_colors: migratedColors,
      color_images: colorImages,
      colors: migratedColors.map((c) => c.hex),
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      highlights,
      specs,
      badge: p.badge ?? null,
      in_stock: p.in_stock ?? true,
      stock: p.stock ?? 100,
      story_en: (p as any).story_en ?? "",
      description_en: (p as any).description_en ?? "",
    });
    setIsNew(false);
  };

  const save = async () => {
    if (!editing || !user || !profile) return;
    if (!editing.id?.trim()) { toast.error("Product ID is required"); return; }
    if (!editing.name_en?.trim()) { toast.error("English name is required"); return; }
    if (!editing.price || editing.price <= 0) { toast.error("Valid price required"); return; }
    if (editing.gallery.length === 0 && !editing.image_url?.trim()) {
      toast.error("At least one product image is required"); return;
    }
    if (editing.custom_colors.length === 0) { toast.error("Select at least one color"); return; }
    if (editing.sizes.length === 0) { toast.error("Select at least one size"); return; }

    setSaving(true);

    const gallery = editing.gallery.filter(Boolean);
    const mainImage = gallery[0] ?? editing.image_url ?? "";

    const payload: Record<string, any> = {
      id: editing.id.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      name_en: editing.name_en.trim(),
      name_hi: editing.name_hi?.trim() || editing.name_en.trim(),
      price: Number(editing.price),
      compare_at: editing.compare_at ? Number(editing.compare_at) : null,
      image_url: mainImage,
      gallery,
      category: editing.category,
      product_group: editing.product_group,
      gender: editing.gender,
      collection: editing.collection || null,
      colors: editing.custom_colors.map((c) => c.hex),
      custom_colors: editing.custom_colors,
      color_images: editing.color_images,
      sizes: editing.sizes,
      highlights: editing.highlights.filter((h) => h.label.trim()),
      specs: editing.specs.filter((s) => s.label.trim()),
      badge: editing.badge || null,
      in_stock: editing.in_stock,
      stock: Number(editing.stock),
      story_en: editing.story_en?.trim() ?? "",
      story_hi: editing.story_en?.trim() ?? "",
      description_en: editing.description_en?.trim() ?? "",
      description_hi: editing.description_en?.trim() ?? "",
    };

    if (isNew) {
      const { data: ex } = await supabase.from("products").select("id").eq("id", payload.id).single();
      if (ex) { toast.error(`ID "${payload.id}" already exists`); setSaving(false); return; }
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Create failed: " + error.message); setSaving(false); return; }
      await logAudit(user.id, profile.email, "CREATE_PRODUCT", "products", payload.id, null, { name: payload.name_en });
      toast.success(`✓ "${payload.name_en}" created — now live in the store!`);
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast.error("Update failed: " + error.message); setSaving(false); return; }
      await logAudit(user.id, profile.email, "UPDATE_PRODUCT", "products", editing.id, { name: editing.name_en }, { name: payload.name_en });
      toast.success(`✓ "${payload.name_en}" updated!`);
    }

    setSaving(false);
    setEditing(null);
    load();
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name_en}"?`)) return;
    if (!user || !profile) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error("Delete failed: " + error.message); return; }
    await logAudit(user.id, profile.email, "DELETE_PRODUCT", "products", p.id, { name: p.name_en }, null);
    toast.success("Deleted");
    load();
  };

  const onCategoryChange = (cat: string) => {
    const tmpl = HIGHLIGHT_TEMPLATES[cat] ?? HIGHLIGHT_TEMPLATES.default;
    setEditing((p) => p ? { ...p, category: cat, highlights: tmpl.map((h) => ({ ...h })) } : p);
  };

  return (
    <div className={`flex gap-4 ${editing ? "items-start" : "flex-col"} pb-12`}>
      {/* ── List ── */}
      <div className={`flex flex-col transition-all ${editing ? "w-full lg:w-[45%]" : "w-full"}`}>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <span className="badge bg-[#2a2d3a] text-gray-400">{filtered.length}</span>
          <div className="ml-auto flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="input pl-9 w-48" />
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="select w-auto capitalize">
              <option value="all">All</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={openNew} className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
          </div>
        </div>

        <div className={`panel overflow-x-auto ${editing ? "max-h-[calc(100vh-140px)] overflow-y-auto" : ""}`}>
          {loading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#161920]">
                <tr className="border-b border-[#2a2d3a]">
                  {["Product","Cat","Price","Colors","Stock",""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-600">No products yet.</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} className={`table-row ${editing?.id === p.id ? "bg-gold/5" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name_en}
                          className="h-10 w-8 rounded-md object-cover border border-[#2a2d3a] flex-shrink-0 bg-[#0f1117]"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-[120px]">{p.name_en}</p>
                          <p className="font-mono text-[10px] text-gray-600">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 capitalize">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">₹{p.price?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(p.colors ?? []).slice(0, 5).map((c: string) => (
                          <span key={c} className="h-3.5 w-3.5 rounded-full border border-[#3a3d4a]" style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.in_stock ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {p.in_stock ? p.stock : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-gray-500 hover:bg-[#2a2d3a] hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => del(p)} className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/15 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Edit Panel ── */}
      {editing && (
        <div className="w-full lg:w-[55%] sticky top-0 max-h-[calc(100vh-48px)] overflow-y-auto pb-10">
          <div className="panel">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2a2d3a] bg-[#161920] px-5 py-4">
              <p className="font-semibold text-white">{isNew ? "✦ New Product" : `Edit: ${editing.name_en}`}</p>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 hover:bg-[#2a2d3a]">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* ID */}
              <div>
                <label className="label">Product ID (slug) *</label>
                <input value={editing.id} onChange={(e) => setEditing((p) => p ? { ...p, id: e.target.value } : p)}
                  placeholder="halo-boxy-tee" disabled={!isNew}
                  className={`input ${!isNew ? "opacity-40 cursor-not-allowed" : ""}`} />
                {isNew && <p className="mt-1 text-[10px] text-gray-600">Lowercase + hyphens only. Cannot be changed later.</p>}
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name (English) *</label>
                  <input value={editing.name_en} onChange={(e) => setEditing((p) => p ? { ...p, name_en: e.target.value } : p)}
                    placeholder="Halo Boxy Tee" className="input" />
                </div>
                <div>
                  <label className="label">Name (Hindi)</label>
                  <input value={editing.name_hi} onChange={(e) => setEditing((p) => p ? { ...p, name_hi: e.target.value } : p)}
                    placeholder="हेलो बॉक्सी टी" className="input" />
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Price (₹) *</label>
                  <input type="number" min={1} value={editing.price}
                    onChange={(e) => setEditing((p) => p ? { ...p, price: Number(e.target.value) } : p)} className="input" />
                </div>
                <div>
                  <label className="label">Compare-at (₹)</label>
                  <input type="number" min={1} value={editing.compare_at ?? ""}
                    onChange={(e) => setEditing((p) => p ? { ...p, compare_at: e.target.value ? Number(e.target.value) : undefined } : p)}
                    placeholder="Strike-through price" className="input" />
                </div>
              </div>

              {/* Category / Gender / Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Category *</label>
                  <select value={editing.category} onChange={(e) => onCategoryChange(e.target.value)} className="select capitalize">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select value={editing.gender} onChange={(e) => setEditing((p) => p ? { ...p, gender: e.target.value } : p)} className="select">
                    {GENDERS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Badge</label>
                  <select value={editing.badge ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, badge: e.target.value || null } : p)} className="select">
                    {BADGES.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                  </select>
                </div>
              </div>

              {/* Collection / Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Collection</label>
                  <select value={editing.collection} onChange={(e) => setEditing((p) => p ? { ...p, collection: e.target.value } : p)} className="select capitalize">
                    {COLLECTIONS.map((c) => <option key={c} value={c}>{c || "None"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Product Group</label>
                  <select value={editing.product_group} onChange={(e) => setEditing((p) => p ? { ...p, product_group: e.target.value } : p)} className="select capitalize">
                    {GROUPS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <hr className="border-[#2a2d3a]" />

              {/* Gallery */}
              <GalleryUploader
                value={editing.gallery}
                onChange={(g) => setEditing((p) => p ? { ...p, gallery: g, image_url: g[0] ?? "" } : p)}
              />

              <hr className="border-[#2a2d3a]" />

              {/* Colors */}
              <ColorPicker
                value={editing.custom_colors}
                onChange={(c) => setEditing((p) => p ? { ...p, custom_colors: c, colors: c.map((x) => x.hex) } : p)}
              />

              <hr className="border-[#2a2d3a]" />

              {/* Per-color images */}
              <ColorImageManager
                colors={editing.custom_colors}
                colorImages={editing.color_images}
                onChange={(ci) => setEditing((p) => p ? { ...p, color_images: ci } : p)}
              />

              <hr className="border-[#2a2d3a]" />

              {/* Sizes */}
              <SizePicker
                value={editing.sizes}
                onChange={(s) => setEditing((p) => p ? { ...p, sizes: s } : p)}
                category={editing.category}
              />

              <hr className="border-[#2a2d3a]" />

              {/* Highlights */}
              <HighlightsBuilder
                value={editing.highlights}
                onChange={(h) => setEditing((p) => p ? { ...p, highlights: h } : p)}
                category={editing.category}
              />

              <hr className="border-[#2a2d3a]" />

              {/* Specs */}
              <SpecsBuilder
                value={editing.specs}
                onChange={(s) => setEditing((p) => p ? { ...p, specs: s } : p)}
              />

              <hr className="border-[#2a2d3a]" />

              {/* Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Stock Count</label>
                  <input type="number" min={0} value={editing.stock}
                    onChange={(e) => setEditing((p) => p ? { ...p, stock: Number(e.target.value) } : p)} className="input" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={editing.in_stock}
                      onChange={(e) => setEditing((p) => p ? { ...p, in_stock: e.target.checked } : p)}
                      className="h-4 w-4 accent-gold" />
                    <span className="text-sm text-gray-300">In Stock</span>
                  </label>
                </div>
              </div>

              {/* Story */}
              <div>
                <label className="label">Story (English)</label>
                <textarea value={editing.story_en}
                  onChange={(e) => setEditing((p) => p ? { ...p, story_en: e.target.value } : p)}
                  rows={2} className="input resize-none" placeholder="Built for dreamers who move with purpose…" />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description (English)</label>
                <textarea value={editing.description_en}
                  onChange={(e) => setEditing((p) => p ? { ...p, description_en: e.target.value } : p)}
                  rows={3} className="input resize-none" placeholder="240 GSM heavyweight combed cotton…" />
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 flex gap-3 bg-[#161920] pt-3 pb-2">
                <button onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    : isNew ? "✦ Create Product" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}