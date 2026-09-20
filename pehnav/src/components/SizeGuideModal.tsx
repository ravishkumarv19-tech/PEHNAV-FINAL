// pehnav/src/components/SizeGuideModal.tsx
import { useState } from "react";
import { X, Ruler, HelpCircle, Check, ArrowRight } from "lucide-react";

export type SizeCategory = "tops" | "bottoms" | "denim" | "footwear" | "ethnic";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string; // Product category string e.g. "tees", "denim", "hoodies"
}

// Map product category ID to size category tab
export function mapCategoryToSizeGroup(catId?: string): SizeCategory {
  if (!catId) return "tops";
  const c = catId.toLowerCase();
  if (c.includes("denim") || c.includes("jean")) return "denim";
  if (c.includes("cargo") || c.includes("jogger") || c.includes("short") || c.includes("pant") || c.includes("bottom")) return "bottoms";
  if (c.includes("sneaker") || c.includes("footwear") || c.includes("boot") || c.includes("shoe")) return "footwear";
  if (c.includes("kurta") || c.includes("ethnic") || c.includes("sherwani") || c.includes("bandhgala")) return "ethnic";
  return "tops";
}

export default function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [activeTab, setActiveTab] = useState<SizeCategory>(mapCategoryToSizeGroup(category));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6 sm:p-8 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">PEHNAV Size & Fit Guide</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Find your flawless tailored silhouette and measurement chart</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls: Category Tabs & Unit Switcher */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5 rounded-lg bg-secondary/70 p-1 border border-border/50">
            {(
              [
                { id: "tops", label: "Tops & Hoodies" },
                { id: "denim", label: "Denim & Jeans" },
                { id: "bottoms", label: "Cargos & Joggers" },
                { id: "footwear", label: "Footwear" },
                { id: "ethnic", label: "Ethnic & Kurtas" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Units toggle */}
          <div className="flex items-center self-end sm:self-auto gap-1 rounded-lg bg-secondary/80 p-1 border border-border">
            <button
              onClick={() => setUnit("in")}
              className={`rounded px-3 py-1 text-xs font-bold transition-all ${
                unit === "in" ? "bg-gold text-black shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`rounded px-3 py-1 text-xs font-bold transition-all ${
                unit === "cm" ? "bg-gold text-black shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          {activeTab === "tops" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chest</th>
                  <th className="py-3 px-4">Length</th>
                  <th className="py-3 px-4">Shoulder</th>
                  <th className="py-3 px-4">Sleeve</th>
                  <th className="py-3 px-4">Standard Fit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "XS", chest: unit === "in" ? "36" : "91", len: unit === "in" ? "27" : "68", sh: unit === "in" ? "17.5" : "44.5", sl: unit === "in" ? "8.0" : "20.3", fit: "Slim / Fitted" },
                  { s: "S", chest: unit === "in" ? "38" : "96.5", len: unit === "in" ? "28" : "71", sh: unit === "in" ? "18.5" : "47", sl: unit === "in" ? "8.5" : "21.5", fit: "Standard Regular" },
                  { s: "M", chest: unit === "in" ? "40" : "101.5", len: unit === "in" ? "29" : "73.5", sh: unit === "in" ? "19.5" : "49.5", sl: unit === "in" ? "9.0" : "22.8", fit: "Standard Regular" },
                  { s: "L", chest: unit === "in" ? "42" : "106.5", len: unit === "in" ? "30" : "76", sh: unit === "in" ? "20.5" : "52", sl: unit === "in" ? "9.5" : "24", fit: "Relaxed Boxy" },
                  { s: "XL", chest: unit === "in" ? "44" : "112", len: unit === "in" ? "31" : "78.5", sh: unit === "in" ? "21.5" : "54.5", sl: unit === "in" ? "10.0" : "25.4", fit: "Oversized Streetwear" },
                  { s: "XXL", chest: unit === "in" ? "46" : "117", len: unit === "in" ? "32" : "81", sh: unit === "in" ? "22.5" : "57", sl: unit === "in" ? "10.5" : "26.6", fit: "Oversized Streetwear" },
                ].map((row) => (
                  <tr key={row.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gold">{row.s}</td>
                    <td className="py-3 px-4">{row.chest} {unit}</td>
                    <td className="py-3 px-4">{row.len} {unit}</td>
                    <td className="py-3 px-4">{row.sh} {unit}</td>
                    <td className="py-3 px-4">{row.sl} {unit}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "denim" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Waist Size</th>
                  <th className="py-3 px-4">Actual Waist</th>
                  <th className="py-3 px-4">Hip</th>
                  <th className="py-3 px-4">Inseam</th>
                  <th className="py-3 px-4">Thigh</th>
                  <th className="py-3 px-4">Leg Opening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "28", w: unit === "in" ? "29.5" : "75", h: unit === "in" ? "37" : "94", i: unit === "in" ? "31" : "79", t: unit === "in" ? "22" : "56", lo: unit === "in" ? "14.5" : "37" },
                  { s: "30", w: unit === "in" ? "31.5" : "80", h: unit === "in" ? "39" : "99", i: unit === "in" ? "32" : "81", t: unit === "in" ? "23" : "58.5", lo: unit === "in" ? "15.0" : "38" },
                  { s: "32", w: unit === "in" ? "33.5" : "85", h: unit === "in" ? "41" : "104", i: unit === "in" ? "32" : "81", t: unit === "in" ? "24" : "61", lo: unit === "in" ? "15.5" : "39.5" },
                  { s: "34", w: unit === "in" ? "35.5" : "90", h: unit === "in" ? "43" : "109", i: unit === "in" ? "33" : "84", t: unit === "in" ? "25" : "63.5", lo: unit === "in" ? "16.0" : "40.5" },
                  { s: "36", w: unit === "in" ? "37.5" : "95", h: unit === "in" ? "45" : "114", i: unit === "in" ? "33" : "84", t: unit === "in" ? "26" : "66", lo: unit === "in" ? "16.5" : "42" },
                  { s: "38", w: unit === "in" ? "39.5" : "100", h: unit === "in" ? "47" : "119", i: unit === "in" ? "33" : "84", t: unit === "in" ? "27" : "68.5", lo: unit === "in" ? "17.0" : "43" },
                ].map((row) => (
                  <tr key={row.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gold">{row.s}</td>
                    <td className="py-3 px-4">{row.w} {unit}</td>
                    <td className="py-3 px-4">{row.h} {unit}</td>
                    <td className="py-3 px-4">{row.i} {unit}</td>
                    <td className="py-3 px-4">{row.t} {unit}</td>
                    <td className="py-3 px-4">{row.lo} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "bottoms" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Waist (Elastic/Drawstring)</th>
                  <th className="py-3 px-4">Hip</th>
                  <th className="py-3 px-4">Length</th>
                  <th className="py-3 px-4">Best Fits Waist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "S", w: unit === "in" ? "28 – 30" : "71 – 76", h: unit === "in" ? "39" : "99", l: unit === "in" ? "39" : "99", fit: "28 – 30 in" },
                  { s: "M", w: unit === "in" ? "31 – 33" : "78 – 84", h: unit === "in" ? "41" : "104", l: unit === "in" ? "40" : "101.5", fit: "31 – 33 in" },
                  { s: "L", w: unit === "in" ? "34 – 36" : "86 – 91", h: unit === "in" ? "43" : "109", l: unit === "in" ? "41" : "104", fit: "34 – 36 in" },
                  { s: "XL", w: unit === "in" ? "37 – 39" : "94 – 99", h: unit === "in" ? "45" : "114", l: unit === "in" ? "42" : "106.5", fit: "37 – 39 in" },
                  { s: "XXL", w: unit === "in" ? "40 – 42" : "101 – 107", h: unit === "in" ? "47" : "119", l: unit === "in" ? "42.5" : "108", fit: "40 – 42 in" },
                ].map((row) => (
                  <tr key={row.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gold">{row.s}</td>
                    <td className="py-3 px-4">{row.w} {unit}</td>
                    <td className="py-3 px-4">{row.h} {unit}</td>
                    <td className="py-3 px-4">{row.l} {unit}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "footwear" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">UK / India</th>
                  <th className="py-3 px-4">US Men</th>
                  <th className="py-3 px-4">EU</th>
                  <th className="py-3 px-4">Foot Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { uk: "UK 6", us: "US 7", eu: "EU 40", len: unit === "in" ? "9.8" : "25.0" },
                  { uk: "UK 7", us: "US 8", eu: "EU 41", len: unit === "in" ? "10.2" : "26.0" },
                  { uk: "UK 8", us: "US 9", eu: "EU 42", len: unit === "in" ? "10.6" : "27.0" },
                  { uk: "UK 9", us: "US 10", eu: "EU 43", len: unit === "in" ? "11.0" : "28.0" },
                  { uk: "UK 10", us: "US 11", eu: "EU 44", len: unit === "in" ? "11.4" : "29.0" },
                  { uk: "UK 11", us: "US 12", eu: "EU 45", len: unit === "in" ? "11.8" : "30.0" },
                ].map((row) => (
                  <tr key={row.uk} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gold">{row.uk}</td>
                    <td className="py-3 px-4">{row.us}</td>
                    <td className="py-3 px-4">{row.eu}</td>
                    <td className="py-3 px-4">{row.len} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "ethnic" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Kurta Size</th>
                  <th className="py-3 px-4">Body Chest</th>
                  <th className="py-3 px-4">Garment Chest</th>
                  <th className="py-3 px-4">Kurta Length</th>
                  <th className="py-3 px-4">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "36 (S)", bc: unit === "in" ? "36" : "91.5", gc: unit === "in" ? "40" : "101.5", l: unit === "in" ? "42" : "106.5", sh: unit === "in" ? "17.5" : "44.5" },
                  { s: "38 (M)", bc: unit === "in" ? "38" : "96.5", gc: unit === "in" ? "42" : "106.5", l: unit === "in" ? "43" : "109", sh: unit === "in" ? "18.5" : "47" },
                  { s: "40 (L)", bc: unit === "in" ? "40" : "101.5", gc: unit === "in" ? "44" : "112", l: unit === "in" ? "44" : "112", sh: unit === "in" ? "19.5" : "49.5" },
                  { s: "42 (XL)", bc: unit === "in" ? "42" : "106.5", gc: unit === "in" ? "46" : "117", l: unit === "in" ? "45" : "114.5", sh: unit === "in" ? "20.5" : "52" },
                  { s: "44 (XXL)", bc: unit === "in" ? "44" : "112", gc: unit === "in" ? "48" : "122", l: unit === "in" ? "45" : "114.5", sh: unit === "in" ? "21.5" : "54.5" },
                ].map((row) => (
                  <tr key={row.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gold">{row.s}</td>
                    <td className="py-3 px-4">{row.bc} {unit}</td>
                    <td className="py-3 px-4 font-medium text-foreground">{row.gc} {unit}</td>
                    <td className="py-3 px-4">{row.l} {unit}</td>
                    <td className="py-3 px-4">{row.sh} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* How to Measure Step-by-Step Guide */}
        <div className="mt-8 rounded-xl border border-border/70 bg-secondary/30 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-4 w-4 text-gold" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              How to Measure Yourself Accurately
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
            <div className="rounded-lg bg-card/60 p-3 border border-border/40">
              <strong className="block text-foreground mb-1 text-sm font-semibold">1. Chest / Bust</strong>
              Wrap the measuring tape horizontally around the fullest part of your chest, keeping tape level under armpits.
            </div>
            <div className="rounded-lg bg-card/60 p-3 border border-border/40">
              <strong className="block text-foreground mb-1 text-sm font-semibold">2. Natural Waist</strong>
              Measure around your natural waistline, where your trousers/jeans naturally sit without pulling too tight.
            </div>
            <div className="rounded-lg bg-card/60 p-3 border border-border/40">
              <strong className="block text-foreground mb-1 text-sm font-semibold">3. Inseam / Length</strong>
              Measure from the bottom of the crotch seam straight down to the ankle bone along the inner leg.
            </div>
          </div>
        </div>

        {/* Pro Tip & Tailoring note */}
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-gold/20 bg-gold/5 p-4 text-xs text-muted-foreground">
          <span className="text-base">💡</span>
          <div>
            <strong className="text-foreground font-semibold">Fit Recommendation:</strong> If you are between two sizes, choose the smaller size for a sharper tailored fit, or the larger size for our signature relaxed streetwear drape.
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-background hover:bg-gold hover:text-black transition-colors"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
