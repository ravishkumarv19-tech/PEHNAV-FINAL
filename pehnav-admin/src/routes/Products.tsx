import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, X, Package } from "lucide-react";
import { supabase, type Product } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { logAudit } from "@/lib/auth";
import { toast } from "sonner";

const CATEGORIES = ["tees","shirts","hoodies","sweatshirts","knitwear","jackets","cargo","joggers","denim","sneakers","caps","bags","eyewear","belts","watches"];
const BADGES = ["", "new", "bestseller", "limited"];
const GENDERS = ["men", "women", "unisex"];

const EMPTY: Partial<Product> = {
  id: "", name_en: "", name_hi: "", price: 999, compare_at: undefined,
  image_url: "", category: "tees", product_group: "apparel", gender: "unisex",
  collection: "", colors: [], sizes: [], badge: null, in_stock: true, stock: 100,
  story_en: "", description_en: "",
};

export default function Products() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const load = async () => {
    let q = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (catFilter !== "all") q = q.eq("category", catFilter);
    const { data } = await q;
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [catFilter]);

  const filtered = products.filter((p) =>
    !search ||
    p.name_en.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); };
  const openEdit = (p: Product) => { setEditing({ ...p }); setIsNew(false); };
  const closeEdit = () => { setEditing(null); setIsNew(false); };

  const save = async () => {
    if (!editing || !user || !profile) return;
    if (!editing.id || !editing.name_en || !editing.price) {
      toast.error("ID, English name, and price are required"); return;
    }
    setSaving(true);

    const payload = {
      id: editing.id!.toLowerCase().replace(/\s+/g, "-"),
      name_en: editing.name_en,
      name_hi: editing.name_hi ?? editing.name_en,
      price: Number(editing.price),
      compare_at: editing.compare_at ? Number(editing.compare_at) : null,
      image_url: editing.image_url ?? "",
      gallery: editing.gallery ?? [],
      category: editing.category ?? "tees",
      product_group: editing.product_group ?? "apparel",
      gender: editing.gender ?? "unisex",
      collection: editing.collection ?? null,
      colors: editing.colors ?? [],
      sizes: editing.sizes ?? [],
      badge: (editing.badge as any) || null,
      in_stock: editing.in_stock ?? true,
      stock: Number(editing.stock ?? 100),
      story_en: editing.story_en ?? "",
      story_hi: editing.story_hi ?? editing.story_en ?? "",
      description_en: editing.description_en ?? "",
      description_hi: editing.description_hi ?? editing.description_en ?? "",
    };

    if (isNew) {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAudit(user.id, profile.email, "CREATE_PRODUCT", "products", payload.id, null, payload);
      toast.success("Product created");
    } else {
      const old = products.find((p) => p.id === editing.id);
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id!);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAudit(user.id, profile.email, "UPDATE_PRODUCT", "products", editing.id!, old, payload);
      toast.success("Product updated");
    }

    setSaving(false);
    closeEdit();
    load();
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name_en}"? This cannot be undone.`)) return;
    if (!user || !profile) return;
    await supabase.from("products").delete().eq("id", p.id);
    await logAudit(user.id, profile.email, "DELETE_PRODUCT", "products", p.id, p, null);
    toast.success("Product deleted");
    load();
  };

  const setArr = (field: "colors" | "sizes", val: string) => {
    const arr = val.split(",").map((s) => s.trim()).filter(Boolean);
    setEditing((p) => p ? { ...p, [field]: arr } : p);
  };

  const inputCls = "input";

  return (
    <div className="flex h-full gap-0">
      {/* List */}
      <div className={`flex flex-col ${editing ? "w-[55%]" : "w-full"} transition-all`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <span className="rounded-full bg-[#2a2d3a] px-2.5 py-0.5 text-xs text-gray-400">{filtered.length}</span>
          </div>
          <button onClick={openNew} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>

        <div className="mb-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…" className="input pl-9" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="select w-auto">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2d3a]">
                  {["Product", "Category", "Price", "Stock", "Badge", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} className={`table-row ${editing?.id === p.id ? "bg-gold/5" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name_en}
                          className="h-10 w-8 rounded-md object-cover border border-[#2a2d3a] flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                        <div>
                          <p className="font-medium text-white">{p.name_en}</p>
                          <p className="text-xs font-mono text-gray-600">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 capitalize">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      ₹{p.price.toLocaleString("en-IN")}
                      {p.compare_at && <span className="ml-1.5 text-xs text-gray-600 line-through">₹{p.compare_at.toLocaleString("en-IN")}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.in_stock ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {p.in_stock ? `${p.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.badge && <span className="badge bg-gold/15 text-gold capitalize">{p.badge}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-gray-500 hover:bg-[#2a2d3a] hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => del(p)} className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/15 hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="ml-4 w-[45%] overflow-y-auto">
          <div className="panel">
            <div className="flex items-center justify-between border-b border-[#2a2d3a] px-5 py-4">
              <p className="font-semibold text-white">{isNew ? "New Product" : `Edit: ${editing.name_en}`}</p>
              <button onClick={closeEdit} className="rounded-lg p-1.5 hover:bg-[#2a2d3a]">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs text-gray-400">Product ID (slug) *</label>
                <input value={editing.id ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, id: e.target.value } : p)}
                  placeholder="ember-oversized-tee" disabled={!isNew}
                  className={`${inputCls} ${!isNew ? "opacity-50 cursor-not-allowed" : ""}`} />
                {isNew && <p className="mt-1 text-[10px] text-gray-600">Lowercase, hyphens only. Cannot be changed later.</p>}
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Name (English) *</label>
                  <input value={editing.name_en ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, name_en: e.target.value } : p)}
                    placeholder="Ember Oversized Tee" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Name (Hindi)</label>
                  <input value={editing.name_hi ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, name_hi: e.target.value } : p)}
                    placeholder="एम्बर ओवरसाइज़्ड टी" className={inputCls} />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Price (₹) *</label>
                  <input type="number" value={editing.price ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, price: Number(e.target.value) } : p)}
                    placeholder="999" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Compare-at Price (₹)</label>
                  <input type="number" value={editing.compare_at ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, compare_at: e.target.value ? Number(e.target.value) : undefined } : p)}
                    placeholder="1499" className={inputCls} />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Category</label>
                  <select value={editing.category ?? "tees"} onChange={(e) => setEditing((p) => p ? { ...p, category: e.target.value } : p)} className="select">
                    {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Gender</label>
                  <select value={editing.gender ?? "unisex"} onChange={(e) => setEditing((p) => p ? { ...p, gender: e.target.value as any } : p)} className="select">
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Badge</label>
                  <select value={editing.badge ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, badge: (e.target.value as any) || null } : p)} className="select">
                    {BADGES.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-400">Image URL</label>
                <input value={editing.image_url ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, image_url: e.target.value } : p)}
                  placeholder="/assets/product-tee.jpg" className={inputCls} />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Colors (comma-separated hex)</label>
                  <input value={(editing.colors ?? []).join(", ")} onChange={(e) => setArr("colors", e.target.value)}
                    placeholder="#000000, #D8C3A5" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Sizes (comma-separated)</label>
                  <input value={(editing.sizes ?? []).join(", ")} onChange={(e) => setArr("sizes", e.target.value)}
                    placeholder="S, M, L, XL, XXL" className={inputCls} />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-400">Stock Count</label>
                  <input type="number" value={editing.stock ?? 100} onChange={(e) => setEditing((p) => p ? { ...p, stock: Number(e.target.value) } : p)}
                    className={inputCls} />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.in_stock ?? true}
                      onChange={(e) => setEditing((p) => p ? { ...p, in_stock: e.target.checked } : p)}
                      className="h-4 w-4 rounded accent-gold" />
                    <span className="text-sm text-gray-300">In Stock</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-400">Story (English)</label>
                <textarea value={editing.story_en ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, story_en: e.target.value } : p)}
                  rows={2} placeholder="Built for late-night ideas…" className="input resize-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-400">Description (English)</label>
                <textarea value={editing.description_en ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, description_en: e.target.value } : p)}
                  rows={3} placeholder="240 GSM heavyweight combed cotton…" className="input resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={closeEdit} className="btn-ghost flex-1">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : isNew ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
