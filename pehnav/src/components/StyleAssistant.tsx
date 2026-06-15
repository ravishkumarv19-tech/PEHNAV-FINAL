import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, ChevronDown } from "lucide-react";
import { markdownToSafeHtml } from "@/lib/sanitize";
import type { Product } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface StyleAssistantProps {
  product?: Product; // if on a product page, pre-context the product
  trigger?: "fab" | "inline"; // floating action button or inline
}

const SUGGESTIONS = [
  "Complete this look",
  "What occasions suit this?",
  "How to style this for work?",
  "Suggest similar items",
  "What should I pair with this?",
];

const GLOBAL_SUGGESTIONS = [
  "Build me a capsule wardrobe",
  "What to wear to a wedding?",
  "Best outfit for a job interview",
  "Streetwear looks under ₹3000",
  "Monsoon-friendly styles",
];

export default function StyleAssistant({ product, trigger = "fab" }: StyleAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tl } = useI18n();
  const { cart } = useStore();

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = product
        ? `Hey! I'm your PEHNAV style assistant 👋\n\nI see you're looking at the **${tl(product.name)}**. I can help you style it, find what to pair it with, or suggest outfits for any occasion. What would you like to know?`
        : "Hey! I'm your PEHNAV style assistant 👋\n\nI know our entire catalog — 52 pieces across tees, hoodies, cargos, knitwear, accessories and more. Ask me anything about styling, outfits, or what to wear for any occasion.";

      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [open]);

  const buildSystemPrompt = () => {
    const catalogSummary = `
You are PEHNAV's AI style assistant — warm, knowledgeable, and deeply invested in helping users find their story through fashion.

PEHNAV is a premium Indian fashion brand with the tagline "Wear Your Story." The aesthetic is clean, editorial, slightly streetwear-influenced, rooted in storytelling.

CATALOG OVERVIEW (52 products):
Categories: Oversized Tees, Shirts, Hoodies, Sweatshirts, Knitwear, Jackets, Cargo Pants, Joggers, Denim, Sneakers, Caps, Bags, Eyewear, Belts, Watches.
Collections: Dreamers (soft, quiet confidence), Hustlers (utility, always moving), Creators (bold, textured), Wanderers (travel-ready, free).
Price range: ₹699 – ₹3,499.
Gender: Men, Women, Unisex options across all categories.

KEY PRODUCTS:
- Ember Oversized Tee (₹999) — bestseller, 240GSM, unisex
- Midnight Heavy Hoodie (₹1,799) — brushed fleece, men
- Drift Cargo Pants (₹1,599) — ripstop, bestseller, men
- Harbor Knit Cardigan (₹2,199) — limited, unisex
- Voyager Bomber (₹3,299) — water-repellent, men
- Aria Cropped Puffer (₹3,499) — limited, women
- Cloud Low Sneakers (₹2,999) — leather, unisex bestseller
- Eclipse Sunglasses (₹1,199) — polarized, bestseller

FREE SHIPPING on orders above ₹1,499.

STYLE PHILOSOPHY:
- Outfit-first thinking. Always suggest complete looks.
- India-aware: consider weather (Mumbai monsoon, Delhi winter, Bangalore all-year), occasions (festivals, weddings, office, college), and price sensitivity.
- Reference the product "stories" — every item has a narrative. Lean into that.
- Never be generic. Every suggestion should feel personal and considered.

${product ? `CURRENT PRODUCT CONTEXT: The user is viewing the ${tl(product.name)} (₹${product.price}, ${product.category}, ${product.gender}). Story: "${tl(product.story)}". Description: "${tl(product.description)}".` : ""}

${cart.length > 0 ? `USER'S CART: ${cart.map(i => `${tl(i.product.name)} (${i.size})`).join(", ")}. Factor this in if relevant to avoid redundant suggestions.` : ""}

TONE: Conversational, warm, confident. Short paragraphs. Use markdown (bold for product names, bullet lists for outfit breakdowns). Never sound robotic.
`;
    return catalogSummary;
  };

  const send = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // SECURITY: API key never touches the browser.
      // All AI requests go through the Supabase edge function proxy (groq-chat).
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) throw new Error("Supabase not configured");

      // Get auth token — anonymous users get a limited fallback message
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session?.access_token
        ? `Bearer ${session.access_token}`
        : "";

      const response = await fetch(
        `${supabaseUrl}/functions/v1/groq-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({
            system: buildSystemPrompt(),
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        }
      );

      if (response.status === 401) {
        setMessages([...newMessages, {
          role: "assistant",
          content: "Sign in to use the style assistant — it's free! [Sign in →](/account)",
        }]);
        return;
      }

      if (response.status === 429) {
        setMessages([...newMessages, {
          role: "assistant",
          content: "You've reached the style assistant limit for this hour. Come back soon!",
        }]);
        return;
      }

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const reply = data.reply ?? "I couldn't process that. Try again!";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = product ? SUGGESTIONS : GLOBAL_SUGGESTIONS;

  // ─── Floating Action Button trigger ──────────────────────────────────────────
  if (trigger === "fab") {
    return (
      <>
        {/* FAB */}
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open style assistant"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          Style Help
        </button>

        {open && <ChatModal onClose={() => setOpen(false)} messages={messages} loading={loading}
          input={input} setInput={setInput} send={send} suggestions={suggestions}
          inputRef={inputRef} bottomRef={bottomRef} />}
      </>
    );
  }

  // ─── Inline trigger (on product page) ────────────────────────────────────────
  return (
    <div className="rounded-md border border-gold/30 bg-gold/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          Style this with AI
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-gold/20 px-5 pb-5">
          <ChatBody messages={messages} loading={loading} input={input} setInput={setInput}
            send={send} suggestions={suggestions} inputRef={inputRef} bottomRef={bottomRef}
            compact />
        </div>
      )}
    </div>
  );
}

// ─── Shared Chat Components ───────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground px-4 py-2.5 text-sm text-background">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold/15">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
      </div>
      <div
        className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(msg.content) }}
      />
    </div>
  );
}

interface ChatBodyProps {
  messages: Message[];
  loading: boolean;
  input: string;
  setInput: (v: string) => void;
  send: (text?: string) => void;
  suggestions: string[];
  inputRef: React.RefObject<HTMLInputElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  compact?: boolean;
}

function ChatBody({ messages, loading, input, setInput, send, suggestions, inputRef, bottomRef, compact }: ChatBodyProps) {
  return (
    <div>
      <div className={`overflow-y-auto space-y-4 py-3 ${compact ? "max-h-72" : "max-h-96"}`}>
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        {loading && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold/15">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 py-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-gold hover:text-gold transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything about styling…"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ChatModal({ onClose, messages, loading, input, setInput, send, suggestions, inputRef, bottomRef }: ChatBodyProps & { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl border-b border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold">Style Assistant</p>
              <p className="text-[10px] text-muted-foreground">Powered by PEHNAV AI</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <ChatBody messages={messages} loading={loading} input={input} setInput={setInput}
            send={send} suggestions={suggestions} inputRef={inputRef} bottomRef={bottomRef} />
        </div>
      </div>
    </div>
  );
}
