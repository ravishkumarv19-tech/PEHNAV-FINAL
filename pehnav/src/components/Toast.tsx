import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { ShoppingBag, Heart, CheckCircle, XCircle, Info, X, Trash2, Tag } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = "cart" | "wishlist" | "success" | "error" | "info" | "remove" | "coupon";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  image?: string;
  duration?: number;
}

interface ToastCtx {
  showToast: (toast: Omit<Toast, "id">) => void;
  cartToast: (productName: string, image?: string) => void;
  wishlistToast: (productName: string, added: boolean) => void;
  removeToast: (productName: string) => void;
  couponToast: (code: string, discount: string) => void;
  successToast: (title: string, message?: string) => void;
  errorToast: (title: string, message?: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Icons per type ──────────────────────────────────────────────────────────

const toastConfig: Record<ToastType, { icon: ReactNode; accent: string; bg: string }> = {
  cart:     { icon: <ShoppingBag className="h-5 w-5" />, accent: "text-gold",        bg: "border-gold/30 bg-card" },
  wishlist: { icon: <Heart className="h-5 w-5" />,       accent: "text-rose-400",    bg: "border-rose-200/30 bg-card" },
  success:  { icon: <CheckCircle className="h-5 w-5" />, accent: "text-emerald-500", bg: "border-emerald-200/30 bg-card" },
  error:    { icon: <XCircle className="h-5 w-5" />,     accent: "text-red-500",     bg: "border-red-200/30 bg-card" },
  info:     { icon: <Info className="h-5 w-5" />,        accent: "text-blue-400",    bg: "border-blue-200/30 bg-card" },
  remove:   { icon: <Trash2 className="h-5 w-5" />,      accent: "text-muted-foreground", bg: "border-border bg-card" },
  coupon:   { icon: <Tag className="h-5 w-5" />,         accent: "text-emerald-500", bg: "border-emerald-200/30 bg-card" },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast & { removing?: boolean }; onDismiss: (id: string) => void }) {
  const cfg = toastConfig[toast.type];

  return (
    <div
      className={`
        relative flex w-80 items-start gap-3 rounded-xl border p-4 shadow-2xl
        ${cfg.bg}
        ${toast.removing ? "animate-toast-out" : "animate-toast-in"}
      `}
    >
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 rounded-full bg-current opacity-30"
        style={{
          width: "100%",
          animation: `toast-progress ${toast.duration ?? 3500}ms linear forwards`,
        }}
      />

      {/* Icon */}
      <div className={`mt-0.5 shrink-0 ${cfg.accent}`}>
        {cfg.icon}
      </div>

      {/* Product image if available */}
      {toast.image && (
        <img
          src={toast.image}
          alt=""
          className="h-12 w-10 shrink-0 rounded-md object-cover border border-border"
        />
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{toast.message}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { removing?: boolean })[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Mark as removing to trigger exit animation
    setToasts((p) => p.map((t) => t.id === id ? { ...t, removing: true } : t));
    // Remove after animation
    setTimeout(() => {
      setToasts((p) => p.filter((t) => t.id !== id));
    }, 350);
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const showToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 3500;

    setToasts((p) => {
      // Max 4 toasts at once
      const next = [...p, { ...opts, id }];
      return next.slice(-4);
    });

    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  // ── Convenience helpers ──────────────────────────────────────────────────

  const cartToast = useCallback((productName: string, image?: string) => {
    showToast({
      type: "cart",
      title: "Added to Bag! 🛍️",
      message: productName,
      image,
      duration: 3000,
    });
  }, [showToast]);

  const wishlistToast = useCallback((productName: string, added: boolean) => {
    showToast({
      type: "wishlist",
      title: added ? "Saved to Wishlist ❤️" : "Removed from Wishlist",
      message: productName,
      duration: 2500,
    });
  }, [showToast]);

  const removeToast = useCallback((productName: string) => {
    showToast({
      type: "remove",
      title: "Removed from Bag",
      message: productName,
      duration: 2000,
    });
  }, [showToast]);

  const couponToast = useCallback((code: string, discount: string) => {
    showToast({
      type: "coupon",
      title: `Coupon Applied! 🎉`,
      message: `${code} — ${discount} off your order`,
      duration: 3500,
    });
  }, [showToast]);

  const successToast = useCallback((title: string, message?: string) => {
    showToast({ type: "success", title, message, duration: 3000 });
  }, [showToast]);

  const errorToast = useCallback((title: string, message?: string) => {
    showToast({ type: "error", title, message, duration: 4000 });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, cartToast, wishlistToast, removeToast, couponToast, successToast, errorToast }}>
      {children}

      {/* Toast Container — fixed top-right */}
      <div
        className="fixed right-4 top-20 z-[200] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
