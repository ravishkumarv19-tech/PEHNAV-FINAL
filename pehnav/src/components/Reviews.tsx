import { useState, useEffect } from "react";
import { Star, Loader2, Camera, X } from "lucide-react";
import { supabase, type DBReview } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface ReviewsProps {
  productId: string;
}

function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readonly ? "button" : "button"}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hover || value)
                ? "fill-gold text-gold"
                : "fill-none text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-4 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-4 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

export default function Reviews({ productId }: ReviewsProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setReviews((data as DBReview[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [productId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    label: String(r),
    count: reviews.filter((x) => x.rating === r).length,
  }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user?.id ?? null,
      author_name: profile?.full_name ?? "Anonymous",
      rating,
      title: title.trim() || null,
      body: body.trim(),
      status: "pending", // admin approves
    });

    setSubmitting(false);
    if (error) { toast.error("Couldn't submit review"); return; }
    toast.success("Review submitted! It'll appear after moderation.");
    setShowForm(false);
    setTitle("");
    setBody("");
    setRating(5);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-wrap gap-8 items-start mb-8">
        <div className="text-center">
          <p className="text-5xl font-bold font-display">{avgRating.toFixed(1)}</p>
          <StarRating value={Math.round(avgRating)} readonly />
          <p className="mt-1 text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 min-w-48 space-y-1.5">
          {ratingCounts.map((r) => (
            <RatingBar key={r.label} label={r.label} count={r.count} total={reviews.length} />
          ))}
        </div>
        <div>
          <button
            onClick={() => { if (!user) { toast.error("Sign in to write a review"); return; } setShowForm(!showForm); }}
            className="rounded-md border border-border px-5 py-2.5 text-sm hover:bg-secondary transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={submit} className="mb-8 rounded-md border border-gold/30 bg-gold/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Your Review</h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title (optional)"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience with this product…"
            required
            rows={4}
            className="w-full resize-none rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
          />

          <button
            disabled={submitting || !body.trim()}
            className="flex items-center gap-2 rounded-md bg-foreground px-6 py-2.5 text-sm text-background disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Review
          </button>
        </form>
      )}

      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="text-center py-8 text-sm text-muted-foreground">
          No reviews yet. Be the first to share your story with this piece.
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} readonly />
                    {r.verified && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {r.title && <p className="mt-1.5 font-semibold text-sm">{r.title}</p>}
                </div>
                <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                  <p>{r.author_name}</p>
                  <p>{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
