// pehnav/src/routes/size-guide.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Ruler, Sparkles, Check, HelpCircle, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size Guide & Fit Manual — PEHNAV" },
      { name: "description", content: "Comprehensive size guide and measurement chart for PEHNAV luxury apparel, streetwear, denim, and footwear." },
    ],
  }),
  component: SizeGuidePage,
});

type CategoryKey = "tops" | "denim" | "bottoms" | "footwear" | "ethnic";

function SizeGuidePage() {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [activeCat, setActiveCat] = useState<CategoryKey>("tops");

  // Interactive Size Calculator State
  const [calcChest, setCalcChest] = useState<string>("");
  const [calcWaist, setCalcWaist] = useState<string>("");
  const [calcResult, setCalcResult] = useState<{ top: string; bottom: string } | null>(null);

  const calculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const chestNum = parseFloat(calcChest);
    const waistNum = parseFloat(calcWaist);

    let topSize = "M";
    let bottomSize = "32";

    // Convert to inches if input was in cm
    const cIn = unit === "cm" ? chestNum / 2.54 : chestNum;
    const wIn = unit === "cm" ? waistNum / 2.54 : waistNum;

    if (!isNaN(cIn)) {
      if (cIn < 37) topSize = "XS";
      else if (cIn <= 39) topSize = "S";
      else if (cIn <= 41) topSize = "M";
      else if (cIn <= 43) topSize = "L";
      else if (cIn <= 45) topSize = "XL";
      else topSize = "XXL";
    }

    if (!isNaN(wIn)) {
      if (wIn < 29) bottomSize = "28";
      else if (wIn <= 31) bottomSize = "30";
      else if (wIn <= 33) bottomSize = "32";
      else if (wIn <= 35) bottomSize = "34";
      else if (wIn <= 37) bottomSize = "36";
      else bottomSize = "38";
    }

    setCalcResult({ top: topSize, bottom: bottomSize });
  };

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold mb-4">
          <Ruler className="h-3.5 w-3.5" /> Tailored Precision
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
          Size & Fit Guide
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          At PEHNAV, every silhouette is precision-cut to flatter Indian body profiles with world-class contemporary tailoring. Use our interactive guide to discover your perfect fit.
        </p>
      </div>

      {/* Interactive Fit Finder Tool */}
      <section className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-6 sm:p-10 shadow-lg">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" /> Instant Recommendation
            </div>
            <h2 className="font-display text-2xl font-bold">Find Your Size Calculator</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Enter your natural body measurements to receive an instant tailored recommendation for PEHNAV tops, shirts, denim, and bottoms.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs">✓</span>
              Precision calibrated for modern Indian streetwear cuts
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-border/80 bg-background/80 backdrop-blur p-6 sm:p-7 shadow-sm">
            <form onSubmit={calculateSize} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Unit:</span>
                <div className="flex gap-1 bg-secondary rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setUnit("in")}
                    className={`rounded px-3 py-1 text-xs font-bold transition-all ${
                      unit === "in" ? "bg-gold text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Inches (in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit("cm")}
                    className={`rounded px-3 py-1 text-xs font-bold transition-all ${
                      unit === "cm" ? "bg-gold text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Chest / Bust ({unit}):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={unit === "in" ? "e.g. 40" : "e.g. 102"}
                    value={calcChest}
                    onChange={(e) => setCalcChest(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Natural Waist ({unit}):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={unit === "in" ? "e.g. 32" : "e.g. 81"}
                    value={calcWaist}
                    onChange={(e) => setCalcWaist(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-foreground py-3 text-xs font-bold uppercase tracking-wider text-background hover:bg-gold hover:text-black transition-all active:scale-[0.99]"
              >
                Calculate Recommended Fit
              </button>
            </form>

            {calcResult && (
              <div className="mt-5 rounded-lg border border-gold/30 bg-gold/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-semibold text-gold uppercase tracking-wider">Your Recommended PEHNAV Sizes:</p>
                <div className="mt-2 flex items-center justify-around text-center">
                  <div>
                    <span className="text-xs text-muted-foreground block">Tops & Hoodies</span>
                    <span className="font-display text-2xl font-extrabold text-foreground">{calcResult.top}</span>
                  </div>
                  <div className="h-8 w-px bg-border"></div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Denim & Trousers</span>
                    <span className="font-display text-2xl font-extrabold text-foreground">{calcResult.bottom}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comprehensive Size Tables */}
      <section className="mt-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "tops", label: "Tops & Hoodies" },
                { id: "denim", label: "Denim & Jeans" },
                { id: "bottoms", label: "Cargos & Joggers" },
                { id: "footwear", label: "Footwear" },
                { id: "ethnic", label: "Ethnic & Kurtas" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition-all ${
                  activeCat === cat.id
                    ? "bg-foreground text-background shadow"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto bg-secondary rounded-lg p-1 border border-border">
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

        {/* Dynamic Table Content */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          {activeCat === "tops" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 px-6">Size</th>
                  <th className="py-4 px-6">Chest ({unit})</th>
                  <th className="py-4 px-6">Garment Length ({unit})</th>
                  <th className="py-4 px-6">Shoulder Width ({unit})</th>
                  <th className="py-4 px-6">Sleeve Length ({unit})</th>
                  <th className="py-4 px-6">Fit Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "XS", chest: unit === "in" ? "36" : "91.5", len: unit === "in" ? "27" : "68.5", sh: unit === "in" ? "17.5" : "44.5", sl: unit === "in" ? "8.0" : "20.3", fit: "Slim / Form Fitting" },
                  { s: "S", chest: unit === "in" ? "38" : "96.5", len: unit === "in" ? "28" : "71.0", sh: unit === "in" ? "18.5" : "47.0", sl: unit === "in" ? "8.5" : "21.5", fit: "Standard Regular" },
                  { s: "M", chest: unit === "in" ? "40" : "101.5", len: unit === "in" ? "29" : "73.5", sh: unit === "in" ? "19.5" : "49.5", sl: unit === "in" ? "9.0" : "22.8", fit: "Standard Regular" },
                  { s: "L", chest: unit === "in" ? "42" : "106.5", len: unit === "in" ? "30" : "76.0", sh: unit === "in" ? "20.5" : "52.0", sl: unit === "in" ? "9.5" : "24.0", fit: "Relaxed Boxy" },
                  { s: "XL", chest: unit === "in" ? "44" : "112.0", len: unit === "in" ? "31" : "78.5", sh: unit === "in" ? "21.5" : "54.5", sl: unit === "in" ? "10.0" : "25.4", fit: "Oversized Streetwear" },
                  { s: "XXL", chest: unit === "in" ? "46" : "117.0", len: unit === "in" ? "32" : "81.0", sh: unit === "in" ? "22.5" : "57.0", sl: unit === "in" ? "10.5" : "26.6", fit: "Oversized Streetwear" },
                ].map((r) => (
                  <tr key={r.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gold text-base">{r.s}</td>
                    <td className="py-4 px-6">{r.chest} {unit}</td>
                    <td className="py-4 px-6">{r.len} {unit}</td>
                    <td className="py-4 px-6">{r.sh} {unit}</td>
                    <td className="py-4 px-6">{r.sl} {unit}</td>
                    <td className="py-4 px-6 text-xs font-medium text-muted-foreground">{r.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeCat === "denim" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 px-6">Waist Size</th>
                  <th className="py-4 px-6">Actual Waist ({unit})</th>
                  <th className="py-4 px-6">Hip ({unit})</th>
                  <th className="py-4 px-6">Inseam ({unit})</th>
                  <th className="py-4 px-6">Thigh ({unit})</th>
                  <th className="py-4 px-6">Leg Opening ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "28", w: unit === "in" ? "29.5" : "75.0", h: unit === "in" ? "37.0" : "94.0", i: unit === "in" ? "31.0" : "78.5", t: unit === "in" ? "22.0" : "56.0", lo: unit === "in" ? "14.5" : "37.0" },
                  { s: "30", w: unit === "in" ? "31.5" : "80.0", h: unit === "in" ? "39.0" : "99.0", i: unit === "in" ? "32.0" : "81.0", t: unit === "in" ? "23.0" : "58.5", lo: unit === "in" ? "15.0" : "38.0" },
                  { s: "32", w: unit === "in" ? "33.5" : "85.0", h: unit === "in" ? "41.0" : "104.0", i: unit === "in" ? "32.0" : "81.0", t: unit === "in" ? "24.0" : "61.0", lo: unit === "in" ? "15.5" : "39.5" },
                  { s: "34", w: unit === "in" ? "35.5" : "90.0", h: unit === "in" ? "43.0" : "109.0", i: unit === "in" ? "33.0" : "84.0", t: unit === "in" ? "25.0" : "63.5", lo: unit === "in" ? "16.0" : "40.5" },
                  { s: "36", w: unit === "in" ? "37.5" : "95.0", h: unit === "in" ? "45.0" : "114.0", i: unit === "in" ? "33.0" : "84.0", t: unit === "in" ? "26.0" : "66.0", lo: unit === "in" ? "16.5" : "42.0" },
                  { s: "38", w: unit === "in" ? "39.5" : "100.0", h: unit === "in" ? "47.0" : "119.0", i: unit === "in" ? "33.0" : "84.0", t: unit === "in" ? "27.0" : "68.5", lo: unit === "in" ? "17.0" : "43.0" },
                ].map((r) => (
                  <tr key={r.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gold text-base">{r.s}</td>
                    <td className="py-4 px-6">{r.w} {unit}</td>
                    <td className="py-4 px-6">{r.h} {unit}</td>
                    <td className="py-4 px-6">{r.i} {unit}</td>
                    <td className="py-4 px-6">{r.t} {unit}</td>
                    <td className="py-4 px-6">{r.lo} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeCat === "bottoms" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 px-6">Size</th>
                  <th className="py-4 px-6">Waist Range ({unit})</th>
                  <th className="py-4 px-6">Hip ({unit})</th>
                  <th className="py-4 px-6">Outseam Length ({unit})</th>
                  <th className="py-4 px-6">Recommended Natural Waist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "S", w: unit === "in" ? "28 – 30" : "71 – 76", h: unit === "in" ? "39" : "99", l: unit === "in" ? "39" : "99", fit: "28 – 30 inches" },
                  { s: "M", w: unit === "in" ? "31 – 33" : "78 – 84", h: unit === "in" ? "41" : "104", l: unit === "in" ? "40" : "101.5", fit: "31 – 33 inches" },
                  { s: "L", w: unit === "in" ? "34 – 36" : "86 – 91", h: unit === "in" ? "43" : "109", l: unit === "in" ? "41" : "104", fit: "34 – 36 inches" },
                  { s: "XL", w: unit === "in" ? "37 – 39" : "94 – 99", h: unit === "in" ? "45" : "114", l: unit === "in" ? "42" : "106.5", fit: "37 – 39 inches" },
                  { s: "XXL", w: unit === "in" ? "40 – 42" : "101 – 107", h: unit === "in" ? "47" : "119", l: unit === "in" ? "42.5" : "108", fit: "40 – 42 inches" },
                ].map((r) => (
                  <tr key={r.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gold text-base">{r.s}</td>
                    <td className="py-4 px-6">{r.w} {unit}</td>
                    <td className="py-4 px-6">{r.h} {unit}</td>
                    <td className="py-4 px-6">{r.l} {unit}</td>
                    <td className="py-4 px-6 text-xs text-muted-foreground">{r.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeCat === "footwear" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 px-6">UK / India Size</th>
                  <th className="py-4 px-6">US Men</th>
                  <th className="py-4 px-6">EU Standard</th>
                  <th className="py-4 px-6">Foot Length ({unit})</th>
                  <th className="py-4 px-6">Fit Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { uk: "UK 6", us: "US 7", eu: "EU 40", len: unit === "in" ? "9.8" : "25.0", fit: "True to Size" },
                  { uk: "UK 7", us: "US 8", eu: "EU 41", len: unit === "in" ? "10.2" : "26.0", fit: "True to Size" },
                  { uk: "UK 8", us: "US 9", eu: "EU 42", len: unit === "in" ? "10.6" : "27.0", fit: "True to Size" },
                  { uk: "UK 9", us: "US 10", eu: "EU 43", len: unit === "in" ? "11.0" : "28.0", fit: "True to Size" },
                  { uk: "UK 10", us: "US 11", eu: "EU 44", len: unit === "in" ? "11.4" : "29.0", fit: "True to Size" },
                  { uk: "UK 11", us: "US 12", eu: "EU 45", len: unit === "in" ? "11.8" : "30.0", fit: "True to Size" },
                ].map((r) => (
                  <tr key={r.uk} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gold text-base">{r.uk}</td>
                    <td className="py-4 px-6">{r.us}</td>
                    <td className="py-4 px-6">{r.eu}</td>
                    <td className="py-4 px-6">{r.len} {unit}</td>
                    <td className="py-4 px-6 text-xs text-muted-foreground">{r.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeCat === "ethnic" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 px-6">Kurta Size</th>
                  <th className="py-4 px-6">Body Chest ({unit})</th>
                  <th className="py-4 px-6">Garment Chest ({unit})</th>
                  <th className="py-4 px-6">Kurta Length ({unit})</th>
                  <th className="py-4 px-6">Shoulder ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { s: "36 (S)", bc: unit === "in" ? "36" : "91.5", gc: unit === "in" ? "40" : "101.5", l: unit === "in" ? "42" : "106.5", sh: unit === "in" ? "17.5" : "44.5" },
                  { s: "38 (M)", bc: unit === "in" ? "38" : "96.5", gc: unit === "in" ? "42" : "106.5", l: unit === "in" ? "43" : "109.0", sh: unit === "in" ? "18.5" : "47.0" },
                  { s: "40 (L)", bc: unit === "in" ? "40" : "101.5", gc: unit === "in" ? "44" : "112.0", l: unit === "in" ? "44" : "112.0", sh: unit === "in" ? "19.5" : "49.5" },
                  { s: "42 (XL)", bc: unit === "in" ? "42" : "106.5", gc: unit === "in" ? "46" : "117.0", l: unit === "in" ? "45" : "114.5", sh: unit === "in" ? "20.5" : "52.0" },
                  { s: "44 (XXL)", bc: unit === "in" ? "44" : "112.0", gc: unit === "in" ? "48" : "122.0", l: unit === "in" ? "45" : "114.5", sh: unit === "in" ? "21.5" : "54.5" },
                ].map((r) => (
                  <tr key={r.s} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gold text-base">{r.s}</td>
                    <td className="py-4 px-6">{r.bc} {unit}</td>
                    <td className="py-4 px-6 font-bold text-foreground">{r.gc} {unit}</td>
                    <td className="py-4 px-6">{r.l} {unit}</td>
                    <td className="py-4 px-6">{r.sh} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* How to measure guide */}
      <section className="mt-16 rounded-2xl border border-border bg-card p-6 sm:p-10">
        <h2 className="font-display text-2xl font-bold">How to Measure Your Body</h2>
        <p className="mt-1 text-sm text-muted-foreground">Follow these guidelines using a flexible cloth measuring tape for guaranteed accuracy.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-secondary/30 p-5">
            <span className="text-xl">👕</span>
            <h3 className="mt-2 text-base font-bold">1. Chest / Bust</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Wrap the measuring tape horizontally around the fullest part of your chest, keeping the tape snug but not tight under your armpits.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/30 p-5">
            <span className="text-xl">👖</span>
            <h3 className="mt-2 text-base font-bold">2. Natural Waist</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Measure around your natural waistline (just above your hipbone and belly button), keeping one finger between your body and tape.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/30 p-5">
            <span className="text-xl">📏</span>
            <h3 className="mt-2 text-base font-bold">3. Hip / Seat</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Stand with your feet together and measure around the widest point of your hips and glutes.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/30 p-5">
            <span className="text-xl">👟</span>
            <h3 className="mt-2 text-base font-bold">4. Inseam Length</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Measure from the bottom of your crotch seam along the inside of your leg down to your ankle bone.
            </p>
          </div>
        </div>
      </section>

      {/* Assurance and Fit Guarantee */}
      <div className="mt-12 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-card to-gold/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold text-2xl">
            🛡️
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">100% Fit Guarantee & 7-Day Free Exchange</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              If your garment doesn't fit exactly the way you love, we'll exchange it for another size with doorstep pickup at zero extra cost.
            </p>
          </div>
        </div>

        <Link
          to="/shop"
          className="flex-shrink-0 rounded-md bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider text-background hover:bg-gold hover:text-black transition-colors"
        >
          Explore Collection →
        </Link>
      </div>
    </div>
  );
}
