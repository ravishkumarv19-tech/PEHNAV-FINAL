import { useEffect, useState } from "react";
import { Star, Check, X, Loader2 } from "lucide-react";
import { supabase, type Review } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { logAudit } from "@/lib/auth";
import { toast } from "sonner";

export default function Reviews() {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const moderate = async (id: string, status: "approved" | "rejected") => {
    if (!user || !profile) return;
    await supabase.from("reviews").update({ status }).eq("id", id);
    await logAudit(user.id, profile.email, `REVIEW_${status.toUpperCase()}`, "reviews", id);
    toast.success(`Review ${status}`);
    setReviews((p) => p.filter((r) => r.id !== id));
  };

  const tabs = ["pending", "approved", "rejected"] as const;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Reviews</h1>

      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === t ? "bg-gold text-black" : "border border-[#2a2d3a] text-gray-400 hover:text-white"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      ) : reviews.length === 0 ? (
        <p className="py-12 text-center text-gray-500">No {filter} reviews.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-gold text-gold" : "text-gray-600"}`} />
                      ))}
                    </div>
                    {r.verified && <span className="badge bg-emerald-500/15 text-emerald-400 text-[10px]">Verified</span>}
                  </div>
                  {r.title && <p className="font-semibold text-white mb-1">{r.title}</p>}
                  <p className="text-sm text-gray-300 leading-relaxed">{r.body}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>{r.author_name}</span>
                    <span>·</span>
                    <span className="font-mono">{r.product_id}</span>
                    <span>·</span>
                    <span>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                {filter === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => moderate(r.id, "approved")}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button onClick={() => moderate(r.id, "rejected")}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition-colors">
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
