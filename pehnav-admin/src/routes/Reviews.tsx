import { useEffect, useState } from "react";
import { Star, Check, X, Trash2, Loader2, Search, Filter } from "lucide-react";
import { supabase, type Review } from "@/lib/supabase";
import { useAuth, logAudit } from "@/lib/auth";
import { toast } from "sonner";

type Tab = "pending" | "approved" | "rejected" | "all";

export default function Reviews() {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<Tab, number>>({ pending: 0, approved: 0, rejected: 0, all: 0 });

  const load = async () => {
    setLoading(true);
    try {
      // Load all product names for reference
      const { data: prods } = await supabase.from("products").select("id,name_en");
      const prodMap: Record<string, string> = {};
      (prods ?? []).forEach((p: any) => { prodMap[p.id] = p.name_en; });
      setProducts(prodMap);

      // Count by status
      const [pending, approved, rejected, all] = await Promise.all([
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);
      setCounts({
        pending: pending.count ?? 0,
        approved: approved.count ?? 0,
        rejected: rejected.count ?? 0,
        all: all.count ?? 0,
      });

      // Load reviews
      let q = supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(100);
      if (tab !== "all") q = q.eq("status", tab);
      if (search.trim()) q = q.ilike("author_name", `%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      setReviews((data as Review[]) ?? []);
    } catch (err: any) {
      toast.error("Failed to load reviews: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab, search]);

  const moderate = async (review: Review, newStatus: "approved" | "rejected") => {
    if (!user || !profile) return;
    const { error } = await supabase.from("reviews").update({ status: newStatus }).eq("id", review.id);
    if (error) { toast.error("Failed: " + error.message); return; }

    // If approved, update product rating
    if (newStatus === "approved") {
      const { data: approved } = await supabase
        .from("reviews").select("rating").eq("product_id", review.product_id).eq("status", "approved");
      if (approved && approved.length > 0) {
        const avg = approved.reduce((s: number, r: any) => s + r.rating, 0) / approved.length;
        await supabase.from("products").update({
          rating: Math.round(avg * 10) / 10,
          review_count: approved.length,
        }).eq("id", review.product_id);
      }
    }

    await logAudit(user.id, profile.email, `${newStatus.toUpperCase()}_REVIEW`, "reviews",
      review.id, { status: review.status }, { status: newStatus });
    toast.success(`Review ${newStatus}`);
    setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, status: newStatus } : r));
    setCounts((prev) => ({
      ...prev,
      [review.status]: Math.max(0, prev[review.status as Tab] - 1),
      [newStatus]: prev[newStatus as Tab] + 1,
    }));
  };

  const del = async (review: Review) => {
    if (!confirm("Delete this review permanently?")) return;
    if (!user || !profile) return;
    const { error } = await supabase.from("reviews").delete().eq("id", review.id);
    if (error) { toast.error("Failed: " + error.message); return; }
    await logAudit(user.id, profile.email, "DELETE_REVIEW", "reviews", review.id, review, null);
    toast.success("Review deleted");
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
  };

  const TABS: { key: Tab; label: string; color: string }[] = [
    { key: "pending", label: "Pending", color: "text-amber-400" },
    { key: "approved", label: "Approved", color: "text-emerald-400" },
    { key: "rejected", label: "Rejected", color: "text-red-400" },
    { key: "all", label: "All", color: "text-gray-400" },
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reviewer name…" className="input pl-9 w-56" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-[#0f1117] p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${tab === t.key ? "bg-[#2a2d3a] text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === t.key ? t.color : "text-gray-600"}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="panel p-12 text-center text-gray-600">
          {tab === "pending" ? "🎉 No pending reviews — all caught up!" : "No reviews in this category."}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`panel p-4 border-l-4 ${r.status === "approved" ? "border-l-emerald-500" : r.status === "rejected" ? "border-l-red-500" : "border-l-amber-500"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{r.author_name}</span>
                    {r.verified && <span className="badge bg-emerald-500/15 text-emerald-400 text-[10px]">✓ Verified Purchase</span>}
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-gold text-gold" : "text-gray-700"}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-600">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Product: <span className="text-gray-400">{products[r.product_id] ?? r.product_id}</span>
                  </p>

                  {r.title && <p className="mt-1.5 text-sm font-medium text-gray-200">"{r.title}"</p>}
                  <p className="mt-1 text-sm text-gray-400 leading-relaxed">{r.body}</p>
                </div>

                <div className="flex flex-shrink-0 flex-col gap-1.5">
                  {r.status !== "approved" && (
                    <button onClick={() => moderate(r, "approved")}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => moderate(r, "rejected")}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/25 transition-colors">
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                  <button onClick={() => del(r)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-[#2a2d3a] hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
