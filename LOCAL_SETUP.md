# PEHNAV — Local Development Setup

## Prerequisites
- Node.js 18+ (check: `node -v`)
- npm 9+ (check: `npm -v`)

---

## 1. Install Dependencies

```bash
# Main storefront
cd pehnav
npm install

# Admin panel (separate app on port 4000)
cd ../pehnav-admin
npm install
```

---

## 2. Configure Environment

```bash
# In pehnav/
cp .env.example .env
```

**Minimum required** to run locally:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

Everything else is optional for local testing:
- Razorpay: leave as placeholder → checkout runs in **simulation mode** (no real charge, toast says "Dev mode")
- Groq: style assistant works with built-in offline responses if not set
- Resend: order confirmation emails just skip silently if not set

---

## 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Run `pehnav/supabase/schema.sql` (paste entire file, click Run)
3. Run `pehnav/supabase/seed.sql` to populate sample products
4. (Optional) Run `pehnav/supabase/security-patches.sql`

---

## 4. Deploy Supabase Edge Functions (for Style Assistant & Payments)

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all edge functions
supabase functions deploy groq-chat
supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment
supabase functions deploy send-order-email

# Set secrets (never put these in .env — they're server-only)
supabase secrets set GROQ_API_KEY=gsk_your_groq_key
supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_secret
supabase secrets set RESEND_API_KEY=re_your_resend_key
```

> **Note:** The style assistant works even WITHOUT deploying edge functions.
> It falls back to built-in AI-style responses automatically.

---

## 5. Run Locally

```bash
# Terminal 1 — Main storefront (http://localhost:3000)
cd pehnav
npm run dev

# Terminal 2 — Admin panel (http://localhost:4000)
cd pehnav-admin
npm run dev
```

---

## 6. Create Admin User

1. Sign up on the storefront at `/account`
2. In Supabase → SQL Editor, run:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your@email.com';
   ```
3. The **Admin Panel** link will now appear in the footer (only for admins)
4. Access the separate admin app at `http://localhost:4000`

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `process is not defined` | Fixed in vite.config.ts — run `npm install` again |
| `vite: command not found` | Run `npm install` in the project directory |
| `routeTree.gen.ts not found` | Run `npm run dev` once — TanStack Router auto-generates it |
| `cannot find module @/lib/...` | Check `tsconfig.json` has `"paths": {"@/*": ["./src/*"]}` |
| Port 3000 already in use | Kill the process: `npx kill-port 3000` |
| Supabase errors on order | Run `schema.sql` in Supabase SQL Editor |
| Style assistant not working | Normal — it uses built-in fallback if Groq not configured |
| Payment crashes in dev | Expected — it runs in simulation mode without real Razorpay keys |
| HMR not updating on Windows | Fixed in vite.config.ts (usePolling enabled for Windows) |

---

## What Works Without Supabase

- ✅ Browsing all products (loaded from `src/lib/data.ts`)
- ✅ Add to cart / wishlist (localStorage)
- ✅ Style assistant (offline fallback responses)
- ✅ Collections, blog posts, stories pages
- ❌ User login/signup
- ❌ Checkout (needs Supabase for order storage)
- ❌ Order tracking
- ❌ Coupons (need Supabase)
