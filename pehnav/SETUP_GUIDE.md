# PEHNAV — Step-by-Step Setup Guide
## Every step explained clearly. Zero assumed knowledge.

---

## What You'll Set Up

| Service | What it does | Cost |
|---------|-------------|------|
| Supabase | Database + Login system | Free |
| Razorpay | Accept payments (UPI, cards, wallets) | Free to start |
| Resend | Send order confirmation emails | Free (3,000/month) |
| Google Gemini | AI Style Assistant | Free (1,500/day) |
| Vercel | Host your website online | Free |

**Total cost to get started: ₹0**

---

## BEFORE YOU START — Run the app locally

First, make sure the app runs on your computer.

### Prerequisites
Make sure you have these installed. Open Terminal (Mac/Linux) or Command Prompt (Windows) and run each check:

```bash
node --version     # Should show v18 or higher
npm --version      # Should show 9 or higher
git --version      # Should show any version
```

If any of these fail, install them:
- **Node.js**: Download from nodejs.org → choose the "LTS" version
- **Git**: Download from git-scm.com

### Install and run the project

```bash
# 1. Go into the project folder (adjust path to where you unzipped it)
cd pehnav

# 2. Install all dependencies (takes 1-2 minutes first time)
npm install

# 3. Create your environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:3000/
```

Open your browser and go to **http://localhost:3000** — you should see the PEHNAV homepage. The app runs but login, payments, and AI won't work yet until you add the keys below.

---

## STEP 1 — Supabase (Database + Login)
**Time: ~15 minutes**

Supabase is your database. It stores all your products, orders, users, and handles login.

### 1.1 — Create your Supabase account and project

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub or email
3. Once logged in, click **"New project"**
4. Fill in:
   - **Organization**: Create new org or use existing
   - **Name**: `pehnav`
   - **Database Password**: Type a strong password — **SAVE THIS SOMEWHERE**, you'll need it
   - **Region**: Select **Southeast Asia (Singapore)** — closest to India, fastest for your users
5. Click **"Create new project"**
6. Wait 2–3 minutes. You'll see a loading screen. Don't close it.

### 1.2 — Run the database schema (creates all tables)

This creates all the tables your app needs (products, orders, users, etc.)

1. In your Supabase dashboard, look at the left sidebar
2. Click **"SQL Editor"** (looks like a code icon `</>`)
3. Click **"New query"** (top left)
4. Open the file `supabase/schema.sql` from your project folder in any text editor (Notepad, VS Code, etc.)
5. Select all the text (Ctrl+A / Cmd+A), copy it
6. Paste it into the Supabase SQL Editor
7. Click the green **"Run"** button (or press Ctrl+Enter)
8. You should see: **"Success. No rows returned"** at the bottom ✅

### 1.3 — Run the seed data (adds all 52 products)

1. Still in SQL Editor, click **"New query"** again
2. Open the file `supabase/seed.sql` from your project folder
3. Copy all of it → paste into SQL Editor → click **"Run"**
4. You should see: **"Success. No rows returned"** ✅

### 1.4 — Get your API keys

1. In left sidebar, click **"Settings"** (gear icon at the very bottom)
2. Click **"API"** in the settings menu
3. You'll see two things you need:

```
Project URL:      https://abcdefghijklm.supabase.co
anon public key:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....(very long)
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....(very long, different one)
```

4. Open your `.env` file in a text editor and fill these in:

```env
VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci....(the anon public key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci....(the service_role key)
```

### 1.5 — Enable Email Login

1. In left sidebar → **"Authentication"**
2. Click **"Providers"**
3. **"Email"** should already be enabled (green toggle) ✅
4. Scroll down to **"Email Confirmations"** — you can turn this OFF for now to make testing easier

### 1.6 — Make yourself admin (do this after you sign up on your app)

After you create an account on your own website:
1. Go to Supabase → **SQL Editor** → New query
2. Run this (replace with your actual email):
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'youremail@gmail.com';
```
3. Now you can access the `/admin` page on your site

---

## STEP 2 — Razorpay (Payments)
**Time: ~10 minutes**

Razorpay lets your customers pay via UPI, credit/debit cards, net banking, and wallets.

### 2.1 — Create account

1. Go to **https://dashboard.razorpay.com**
2. Click **"Sign Up"**
3. Fill in your details — use your business name or personal name
4. Verify your email → log in

### 2.2 — Get API Keys (Test Mode first — no real money)

1. In left sidebar, click **"Settings"**
2. Click **"API Keys"**
3. Click **"Generate Test Key"**
4. A popup shows two keys:
   - **Key ID**: starts with `rzp_test_...`
   - **Key Secret**: shown only once — **COPY IT NOW**

5. Add to your `.env` file:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### 2.3 — Test payment cards (use these when testing checkout)

| Type | Number | CVV | Expiry |
|------|--------|-----|--------|
| Visa | `4111 1111 1111 1111` | Any 3 digits | Any future date |
| UPI | Enter `success@razorpay` in UPI field | — | — |

### 2.4 — Go live (when ready for real money)

When you're ready to accept real payments:
1. Complete KYC in Razorpay dashboard (upload business docs)
2. Generate a **Live Key** instead of Test Key
3. Update `VITE_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with the live keys

---

## STEP 3 — Resend (Order Confirmation Emails)
**Time: ~5 minutes**

### 3.1 — Create account

1. Go to **https://resend.com**
2. Click **"Sign Up"** — use your email
3. Verify your email → log in

### 3.2 — Get API Key

1. In left sidebar → **"API Keys"**
2. Click **"Create API Key"**
3. Name it `pehnav-production`
4. Copy the key (starts with `re_`)

5. Add to `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```

> **Note**: Use `onboarding@resend.dev` as the FROM_EMAIL for testing — this works without a domain. When you have your own domain (pehnav.com), you'll add it to Resend and use `orders@pehnav.com` instead.

---

## STEP 4 — Google Gemini (AI Style Assistant — FREE)
**Time: ~3 minutes**

This powers the "Style Help" chat button on your site. **Completely free, no credit card needed.**

### 4.1 — Get your free API key

1. Go to **https://aistudio.google.com**
2. Sign in with your Google account
3. Click **"Get API Key"** (top left or center of screen)
4. Click **"Create API key"**
5. Select **"Create API key in new project"**
6. Copy the key (starts with `AIza`)

### 4.2 — Add to .env

```env
VITE_GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4.3 — Verify it's working

After you restart the dev server, go to any product page on your site and click **"Style this with AI"** — you should see the chat open and respond.

---

## STEP 5 — Fill in your .env file completely

Open the `.env` file in your project root. It should now look like this (with your actual values):

```env
# ── Supabase ──────────────────────────────────────────
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Razorpay ──────────────────────────────────────────
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# ── Resend ────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev

# ── Google Gemini (Free AI) ───────────────────────────
VITE_GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── App URL ───────────────────────────────────────────
VITE_APP_URL=http://localhost:3000
```

### Restart the dev server after editing .env:
```bash
# Stop the server (Ctrl+C), then:
npm run dev
```

---

## STEP 6 — Test everything locally

Work through this checklist before deploying:

```
□ Homepage loads at http://localhost:3000
□ Click "My Account" → see the sign in page
□ Sign up with your email → you're logged in
□ Go to any product → click "Style this with AI" → chat works
□ Press "/" on keyboard → search bar opens → type "tee" → results appear
□ Add a product to cart → go to checkout → fill the form → pay with test card
  → See "Order Confirmed" screen
□ Go to http://localhost:3000/track → enter the order number → tracking shows
□ Check your Supabase dashboard → Table Editor → orders → your order is there
□ Go to http://localhost:3000/admin → (you need to be admin — see Step 1.6)
```

If any of these fail, tell me exactly what you see and I'll fix it.

---

## STEP 7 — Deploy online (Vercel — Free)
**Time: ~10 minutes**

### 7.1 — Push your code to GitHub

```bash
# Inside your pehnav folder:
git init
git add .
git commit -m "initial commit"
```

Then:
1. Go to **https://github.com** → sign in → click **"New repository"**
2. Name it `pehnav`, make it **Private**, click **"Create repository"**
3. GitHub will show you commands — run the ones under "push an existing repository":
```bash
git remote add origin https://github.com/YOURUSERNAME/pehnav.git
git branch -M main
git push -u origin main
```

### 7.2 — Deploy on Vercel

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"New Project"**
3. Find your `pehnav` repo → click **"Import"**
4. Vercel auto-detects it's a Vite project ✅
5. Click **"Environment Variables"** — add ALL your `.env` variables here one by one:
   - `VITE_SUPABASE_URL` → your value
   - `VITE_SUPABASE_ANON_KEY` → your value
   - `SUPABASE_SERVICE_ROLE_KEY` → your value
   - `VITE_RAZORPAY_KEY_ID` → your value
   - `RAZORPAY_KEY_SECRET` → your value
   - `RESEND_API_KEY` → your value
   - `FROM_EMAIL` → your value
   - `VITE_GEMINI_API_KEY` → your value
   - `VITE_APP_URL` → `https://pehnav.vercel.app` (your Vercel URL)
6. Click **"Deploy"** → wait ~2 minutes
7. You'll get a URL like `https://pehnav-xyz.vercel.app` — your site is live 🚀

### 7.3 — Update Supabase to allow your live URL

1. Supabase dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: change to `https://pehnav-xyz.vercel.app`
3. **Redirect URLs**: add `https://pehnav-xyz.vercel.app/account`
4. Click **Save**

### 7.4 — Update your live .env on Vercel

Go back to Vercel → your project → **Settings** → **Environment Variables**:
- Change `VITE_APP_URL` from `http://localhost:3000` to `https://pehnav-xyz.vercel.app`
- Click **"Redeploy"** for it to take effect

---

## Common Issues & Fixes

### "Module not found" or build errors
```bash
rm -rf node_modules
npm install
npm run dev
```

### Supabase "Invalid API key" error
- Double-check you copied the full anon key (it's very long, ~200 chars)
- Make sure there are no spaces before/after the key in your `.env`
- Make sure the `.env` file is in the root `pehnav/` folder (same level as `package.json`)

### Login not working
- Check Supabase → Authentication → Providers → Email is enabled
- Try turning OFF email confirmations in Supabase Auth settings for local testing

### Payments not working
- Make sure you're using the Test Key (`rzp_test_...`), not a Live key
- Use the test card number exactly: `4111 1111 1111 1111`

### AI chat not responding
- Verify your `VITE_GEMINI_API_KEY` is in `.env` and starts with `AIza`
- Go to aistudio.google.com and confirm the key is active
- Restart dev server after adding the key

### Orders not saving
- Check Supabase → Table Editor → orders table exists (schema ran successfully)
- Check browser console (F12 → Console) for the exact error message

---

## What to tell me when something breaks

To get the fastest fix, share:
1. **Which step** you were on
2. **Exact error message** (copy-paste it — don't paraphrase)
3. **Screenshot** of what you see in the browser or terminal
4. Whether it's failing on **localhost** or on **Vercel**
