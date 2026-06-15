# PEHNAV — The Complete Deployment Bible
## Every single step. Every click. Every field. Nothing left out.

---

## READ THIS FIRST

This guide takes you from a zip file on your desktop to a fully live,
paying fashion store — with real login, real payments, real emails, and
an AI style assistant. Follow every step in order. Do not skip anything.

**Time required:** 45–60 minutes total
**Cost:** ₹0 to get started (everything has a free tier)
**What you need before starting:**
- A computer (Windows, Mac, or Linux)
- An internet connection
- An email address you can check right now
- The pehnav project folder unzipped somewhere on your computer

---

## PART 0 — Install the tools you need on your computer

Before anything else, you need Node.js and Git installed.

### 0.1 — Check if you already have them

Open Terminal (Mac/Linux) or Command Prompt (Windows — press Windows key, type "cmd", press Enter).

Type each of these commands one at a time and press Enter:

```
node --version
```
If you see something like `v20.11.0` — ✅ Node is installed. Skip to 0.3.
If you see `'node' is not recognized` or `command not found` — go to step 0.2.

```
npm --version
```
If you see something like `10.2.4` — ✅ npm is installed.

```
git --version
```
If you see something like `git version 2.43.0` — ✅ Git is installed. Skip to 0.4.
If you see an error — go to step 0.4.

### 0.2 — Install Node.js (if you don't have it)

1. Open your browser and go to: **https://nodejs.org**
2. You'll see two big green buttons. Click the one that says **"LTS"** (not "Current")
3. This downloads an installer file (.msi on Windows, .pkg on Mac)
4. Open the downloaded file and click through the installer:
   - Windows: Click Next → Next → Next → Install → Finish
   - Mac: Click Continue → Continue → Agree → Install
5. Close and reopen your Terminal/Command Prompt
6. Type `node --version` again — you should now see a version number ✅

### 0.3 — Install Git (if you don't have it)

1. Go to: **https://git-scm.com/downloads**
2. Click your operating system (Windows / Mac / Linux)
3. Download and install it with all default settings
4. Close and reopen your Terminal/Command Prompt
5. Type `git --version` — you should see a version number ✅

### 0.4 — Open the project folder in Terminal

You need your Terminal to be "inside" the pehnav folder.

**On Windows:**
1. Open File Explorer
2. Navigate to where you unzipped the pehnav folder
3. Hold Shift and right-click inside the folder
4. Click "Open PowerShell window here" or "Open Command Prompt here"

**On Mac:**
1. Open Terminal (press Cmd+Space, type "terminal", press Enter)
2. Type `cd ` (with a space after cd)
3. Drag the pehnav folder from Finder into the Terminal window
4. Press Enter

**Verify you're in the right place:**
```
ls
```
You should see files like `package.json`, `src`, `vite.config.ts` listed.
If you see those — you're in the right place ✅
If not — you're in the wrong folder. Try again.

### 0.5 — Install project dependencies

In your Terminal (inside the pehnav folder), run:
```
npm install
```

This downloads all the code libraries the project needs.
It will take 1–3 minutes. You'll see a lot of text scrolling.
When it's done, you'll see your cursor again with no error.

If you see `npm error` in red — paste the exact error message and send it to me.

### 0.6 — Create your environment file

This is the file that holds all your secret keys. Run:
```
cp .env.example .env
```

On Windows Command Prompt, use this instead:
```
copy .env.example .env
```

Now open the `.env` file in a text editor.
- Windows: Right-click the `.env` file → Open with → Notepad
- Mac: Right-click → Open With → TextEdit

You'll see placeholder values. You'll replace them one by one as you go through this guide.

### 0.7 — Start the app for the first time

Run:
```
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:3000/
```

Open your browser and go to **http://localhost:3000**

You should see the PEHNAV homepage load. The site will work visually but
login, payments, and AI won't work yet — that's what the rest of this guide sets up.

Keep this terminal window open and running the whole time.

---

## PART 1 — Supabase Setup
### Your database and login system
**Estimated time: 15 minutes**

Supabase stores everything: your products, orders, user accounts, addresses,
wishlists, coupons, and reviews. It also handles user login.

---

### Step 1.1 — Create a Supabase account

1. Open a new browser tab
2. Go to: **https://supabase.com**
3. Click the **"Start your project"** button (it's in the center or top right)
4. You'll see two options to sign up:
   - **"Continue with GitHub"** — easiest if you have GitHub
   - **"Sign Up"** — use your email if you don't have GitHub
5. Complete the signup and verify your email if asked
6. You'll land on the Supabase dashboard

---

### Step 1.2 — Create a new Supabase project

1. On the dashboard, click the green **"New project"** button
2. If it asks you to create an Organization first:
   - Click "New organization"
   - Name it anything (e.g. "Pehnav" or your name)
   - Select the free plan
   - Click "Create organization"
3. Now fill in the project details:

   **Name:** `pehnav`
   (just type pehnav in the name field)

   **Database Password:** Create a strong password
   - Use something like: `Pehnav@2024SecureDB`
   - **WRITE THIS DOWN OR SAVE IT SOMEWHERE** — you'll need it if you ever connect directly to the database
   - Do NOT use a simple password

   **Region:** Select **"Southeast Asia (Singapore)"**
   - This is the closest server to India — your users will get the fastest response times

4. Click **"Create new project"**
5. You'll see a loading screen that says "Setting up your project"
6. **Wait 2–3 full minutes.** Do not refresh or close this tab.
7. When it's done, you'll see your project dashboard ✅

---

### Step 1.3 — Run the database schema

This step creates all the tables in your database (products, orders, users, etc.)

1. Look at the left sidebar in Supabase
2. Find and click **"SQL Editor"**
   - It looks like this icon: `</>`
   - It's roughly in the middle of the sidebar

3. You'll see a code editor area. Click **"New query"** at the top left

4. Now open your project files on your computer:
   - Navigate to the `pehnav` folder → `supabase` folder → open `schema.sql`
   - Open it in any text editor (Notepad, TextEdit, VS Code)

5. Select ALL the text in that file:
   - Press `Ctrl+A` on Windows
   - Press `Cmd+A` on Mac

6. Copy it: `Ctrl+C` (Windows) or `Cmd+C` (Mac)

7. Go back to the Supabase SQL Editor tab in your browser

8. Click anywhere inside the code editor area

9. Paste: `Ctrl+V` (Windows) or `Cmd+V` (Mac)
   You should see a LOT of SQL code appear

10. Click the green **"Run"** button (top right of the editor)
    OR press `Ctrl+Enter`

11. At the bottom of the page, you should see:
    **"Success. No rows returned"**

    ✅ If you see that — the schema ran successfully. Move on.
    ❌ If you see a red error — copy the exact error text and send it to me.

---

### Step 1.4 — Run the seed data

This adds all 52 products, categories, and collections to your database.

1. Click **"New query"** again in the SQL Editor (don't reuse the previous one)

2. On your computer, open: `pehnav` → `supabase` → `seed.sql`

3. Select all → Copy → Paste into the new SQL Editor query

4. Click **"Run"** (or Ctrl+Enter)

5. You should see: **"Success. No rows returned"** ✅

---

### Step 1.5 — Get your Supabase API keys

This is where people get confused — follow this exactly.

1. In the Supabase left sidebar, scroll all the way to the **bottom**
2. Click the **"Settings"** option (it has a gear/cog icon ⚙️)
3. A new menu appears. In this new menu, click **"API"**
   - You should now see a page titled "Project API keys"

4. You'll see the following on this page:

   **Project URL** — looks like:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   This is YOUR project URL. The `abcdefghijklmnop` part will be different for you.

   **Project API keys** section — you'll see two keys:

   First key labeled **"anon" "public"**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```
   (Very long — around 200 characters)

   Second key labeled **"service_role" "secret"**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```
   (Also very long, different from the first)

5. For each key, click the **copy icon** (two overlapping squares) next to it.
   Do NOT try to manually select and copy — the text may get cut off.

6. Open your `.env` file and replace the placeholder values:

```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni....(your full anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni....(your full service_role key)
```

   **Important:** No spaces around the `=` sign. No quotes around the values.
   The keys are long — they should each be around 200 characters.

7. Save the `.env` file

---

### Step 1.6 — Verify the tables were created

1. In Supabase left sidebar, click **"Table Editor"**
   (looks like a grid/spreadsheet icon)
2. You should see a list of tables on the left:
   - profiles
   - products
   - orders
   - order_items
   - cart_items
   - wishlists
   - reviews
   - addresses
   - coupons
   - ... and more

   If you see these tables — ✅ the schema ran correctly.

3. Click on **"products"** — you should see all 52 products listed with names, prices, etc.
   If the products table is empty, re-run the `seed.sql` from Step 1.4.

---

### Step 1.7 — Restart the dev server and test login

1. Go to your Terminal where `npm run dev` is running
2. Press `Ctrl+C` to stop it
3. Type `npm run dev` and press Enter to restart it
4. Go to **http://localhost:3000/account** in your browser
5. You should see a "Welcome back / Sign in" screen instead of the fake account page
6. Try signing up with your email — you should successfully create an account ✅

---

### Step 1.8 — Make yourself an admin

After you sign up on your site:

1. Go to Supabase → SQL Editor → New query
2. Paste this SQL (replace with YOUR email):
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```
3. Click Run
4. You should see: **"Success. 1 row affected"** ✅
5. Now go to **http://localhost:3000/admin** — you should see the admin dashboard

---

## PART 2 — Razorpay Setup
### Accept real payments
**Estimated time: 10 minutes**

---

### Step 2.1 — Create a Razorpay account

1. Go to: **https://dashboard.razorpay.com**
2. Click **"Sign Up"**
3. Fill in:
   - Business name (can be "Pehnav" or your actual business name)
   - Your email
   - Your mobile number
   - A password
4. You'll receive an OTP on your phone — enter it
5. Verify your email too if asked
6. You'll land on the Razorpay dashboard

---

### Step 2.2 — Get test API keys

You'll start with test mode — no real money moves, you just test everything works.

1. In the Razorpay dashboard left sidebar, click **"Settings"**
2. In the Settings menu, click **"API Keys"**
3. You'll see a section called **"Test Mode API Keys"**
4. Click the button **"Generate Test Key"**
5. A popup will appear showing two values:

   **Key ID:**
   ```
   rzp_test_AbCdEfGhIjKlMn
   ```
   (Starts with `rzp_test_`)

   **Key Secret:**
   ```
   aBcDeFgHiJkLmNoPqRsTuVwX
   ```
   (Random characters — shown only this once)

6. **Copy the Key Secret RIGHT NOW** — Razorpay will never show it again.
   If you miss it, you'll have to generate new keys.

7. Open your `.env` file and add:
```
VITE_RAZORPAY_KEY_ID=rzp_test_AbCdEfGhIjKlMn
RAZORPAY_KEY_SECRET=aBcDeFgHiJkLmNoPqRsTuVwX
```

---

### Step 2.3 — Test that payments work

1. Restart your dev server (`Ctrl+C` then `npm run dev`)
2. Go to your site → add a product to cart → go to checkout
3. Fill in any test address (use your real address or make one up)
4. On the payment screen, click "Pay Securely"
5. The Razorpay payment popup will appear
6. Use these test details:

   **Test Credit Card:**
   - Card Number: `4111 1111 1111 1111`
   - Expiry: `12/25` (any future date)
   - CVV: `123` (any 3 digits)
   - Name: Anything

   **Test UPI:**
   - UPI ID: `success@razorpay`

7. Complete the payment — you should see the "Order Confirmed" screen ✅
8. Go to Supabase → Table Editor → orders → your test order is there ✅

---

### Step 2.4 — Go live (when you're ready for real money)

When you're ready to accept actual payments from customers:
1. Complete KYC on Razorpay (upload business registration docs, PAN, bank details)
2. This takes 1–3 business days
3. Once approved, go to Settings → API Keys → switch to **Live Mode**
4. Generate Live API Keys
5. Replace your `.env` values with the live keys (start with `rzp_live_`)

---

## PART 3 — Resend Setup
### Order confirmation emails
**Estimated time: 5 minutes**

---

### Step 3.1 — Create a Resend account

1. Go to: **https://resend.com**
2. Click **"Sign Up"**
3. Enter your email → Set a password → Sign up
4. Check your email for a verification link → click it
5. You'll land on the Resend dashboard

---

### Step 3.2 — Get your API key

1. In the Resend left sidebar, click **"API Keys"**
2. Click the **"Create API Key"** button
3. A popup appears:
   - **Name:** Type `pehnav`
   - **Permission:** Leave as "Full access"
   - **Domain:** Leave as "All Domains"
4. Click **"Add"**
5. Your key appears — it looks like:
   ```
   re_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
   ```
6. Click the copy icon next to it
7. **This key is only shown once** — save it immediately

8. Open your `.env` file and add:
```
RESEND_API_KEY=re_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
FROM_EMAIL=onboarding@resend.dev
```

Note: Use `onboarding@resend.dev` as the FROM_EMAIL for now — this is Resend's
test email address that works without needing your own domain.
When you have your own domain (pehnav.com), you'll add it to Resend later
and change this to `orders@pehnav.com`.

---

## PART 4 — Groq Setup
### Free AI style assistant — fastest inference in the world
**Estimated time: 2 minutes**

Groq runs **LLaMA 3.3 70B** — a model smarter than GPT-4o on most tasks —
at blazing speed. Completely free. No credit card. 14,400 requests per day.

---

### Step 4.1 — Create a Groq account

1. Go to: **https://console.groq.com**
2. Click **"Sign Up"**
3. Sign up with your Google account or email
4. Verify your email if asked → log in

---

### Step 4.2 — Get your free API key

1. Once you're in the Groq console, look at the left sidebar
2. Click **"API Keys"**
3. Click the **"Create API Key"** button
4. Give it a name: `pehnav`
5. Click **"Submit"**
6. Your key appears — it looks like:
   ```
   gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnop
   ```
   (Starts with `gsk_`)
7. Click the copy icon — **this key is only shown once**

---

### Step 4.3 — Add to your .env file

```
VITE_GROQ_API_KEY=gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnop
```

---

### Step 4.4 — Test the AI assistant

1. Restart dev server (`Ctrl+C` then `npm run dev`)
2. Go to any product page on your site
3. Click **"Style this with AI"**
4. Type: "what should I pair this with?"
5. You should get a fast, detailed styling response ✅

The AI knows your entire catalog — all 52 products, all collections, all prices —
and gives India-aware advice (occasions, weather, budget). It's context-aware:
on a product page it knows exactly which item you're looking at.

---

## PART 5 — Your complete .env file

After completing Parts 1–4, your `.env` file should look exactly like this
(with YOUR actual values instead of the examples):

```
# ─── Supabase ─────────────────────────────────────────────────────────────────
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpcyI6InN...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpcyI6...

# ─── Razorpay ─────────────────────────────────────────────────────────────────
VITE_RAZORPAY_KEY_ID=rzp_test_AbCdEfGhIjKlMn
RAZORPAY_KEY_SECRET=aBcDeFgHiJkLmNoPqRsTuVwX

# ─── Resend ───────────────────────────────────────────────────────────────────
RESEND_API_KEY=re_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
FROM_EMAIL=onboarding@resend.dev

# ─── Groq (Free AI — LLaMA 3.3 70B) ─────────────────────────────────────────
VITE_GROQ_API_KEY=gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnop

# ─── App URL ──────────────────────────────────────────────────────────────────
VITE_APP_URL=http://localhost:3000
```

Rules for the .env file:
- NO spaces around the `=` sign
- NO quotes around values
- NO extra spaces at the end of lines
- Each key on its own line
- The file is named exactly `.env` (with the dot at the start, no .txt extension)

After editing the .env file, always restart your dev server:
```
(press Ctrl+C to stop)
npm run dev
```

---

## PART 6 — Local testing checklist

Before you deploy online, verify everything works on your computer.
Go through each item:

```
□ 1. Homepage loads at http://localhost:3000 with products showing

□ 2. Login works:
      → Go to http://localhost:3000/account
      → Click "Create account"
      → Enter your email and a password
      → You should be logged in and see your profile page

□ 3. AI Style Assistant works:
      → Go to any product page
      → Scroll down to "Style this with AI"
      → Click it → type "what should I pair this with?"
      → You should get a response from Gemini

□ 4. Search works:
      → Press the "/" key on your keyboard from any page
      → A search bar should pop open
      → Type "tee" → you should see product results appear

□ 5. Cart works:
      → On a product page, select a size and color
      → Click "Add to Cart"
      → The cart icon in the navbar should show a count

□ 6. Checkout + Payment works:
      → Go to cart → click "Checkout"
      → Fill in the shipping form (any valid-looking address)
      → Click "Continue to Payment"
      → Click "Pay Securely"
      → Use test card: 4111 1111 1111 1111 / 12/25 / 123
      → You should see "Order Confirmed!" screen with an order number

□ 7. Order saved in database:
      → Go to Supabase → Table Editor → orders
      → Your order should be visible there with status "processing"

□ 8. Order tracking works:
      → Go to http://localhost:3000/track
      → Enter the order number (e.g. PHN-10000)
      → You should see the tracking timeline for that order

□ 9. Account order history works:
      → Go to http://localhost:3000/account
      → Click "Orders" in the sidebar
      → Your test order should appear there

□ 10. Admin panel works:
       → Go to http://localhost:3000/admin
       → You should see the admin dashboard with real data
       → (You must have completed Step 1.8 — making yourself admin)
```

If any item has an ❌ — describe exactly what you see and I'll fix it.

---

## PART 7 — Deploy to Vercel (put it online)
**Estimated time: 15 minutes**

---

### Step 7.1 — Create a GitHub account (if you don't have one)

1. Go to: **https://github.com**
2. Click **"Sign up"**
3. Enter email → password → username
4. Verify your email
5. Sign in to GitHub

---

### Step 7.2 — Upload your code to GitHub

In your Terminal (inside the pehnav folder), run these commands one by one.
Press Enter after each one and wait for it to finish:

```
git init
```
You should see: "Initialized empty Git repository"

```
git add .
```
No output is normal.

```
git commit -m "pehnav complete build"
```
You should see a list of files being committed.

Now create a repository on GitHub:
1. Go to **https://github.com/new**
2. **Repository name:** `pehnav`
3. **Visibility:** Private (so your code stays yours)
4. Do NOT check "Add a README file"
5. Click **"Create repository"**
6. GitHub shows you a page with commands. Copy and run the ones under
   **"…or push an existing repository from the command line"**:

```
git remote add origin https://github.com/YOURUSERNAME/pehnav.git
git branch -M main
git push -u origin main
```

When you run the push command, it may ask for your GitHub username and password.
For the password, GitHub now uses **Personal Access Tokens** instead:
1. Go to github.com → click your avatar top right → Settings
2. Scroll to bottom → click **"Developer settings"**
3. Click **"Personal access tokens"** → **"Tokens (classic)"**
4. Click **"Generate new token (classic)"**
5. Note: `pehnav deploy`, Expiration: 90 days, check **"repo"** scope
6. Click **"Generate token"** → copy the token
7. Use this token as your password when git asks

---

### Step 7.3 — Create a Vercel account

1. Go to: **https://vercel.com**
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"** — this links Vercel to your GitHub
4. Authorize Vercel to access your GitHub
5. You'll land on the Vercel dashboard

---

### Step 7.4 — Deploy your project

1. On the Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repos listed
3. Find **"pehnav"** and click **"Import"** next to it
4. Vercel detects it's a Vite/React project automatically ✅
5. **Before clicking Deploy**, click **"Environment Variables"** to expand that section
6. You need to add ALL your env variables here. Add them one by one:

   Click "Add" for each one:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key |
   | `VITE_RAZORPAY_KEY_ID` | Your Razorpay test key ID |
   | `RAZORPAY_KEY_SECRET` | Your Razorpay key secret |
   | `RESEND_API_KEY` | Your Resend API key |
   | `FROM_EMAIL` | `onboarding@resend.dev` |
   | `VITE_GROQ_API_KEY` | Your Groq API key |
   | `VITE_APP_URL` | `https://pehnav.vercel.app` (update after you get the URL) |

7. After adding all variables, click **"Deploy"**
8. Watch the build log — it takes 2–3 minutes
9. When it's done, you'll see confetti 🎉 and a URL like:
   `https://pehnav-xyz123.vercel.app`

10. Click "Visit" to open your live site ✅

---

### Step 7.5 — Update Supabase to allow your live URL

Supabase blocks login from unknown URLs by default. You need to add your Vercel URL.

1. Go to your Supabase dashboard
2. Left sidebar → **"Authentication"**
3. Click **"URL Configuration"**
4. Find **"Site URL"** and change it from `http://localhost:3000` to:
   ```
   https://pehnav-xyz123.vercel.app
   ```
   (Use your actual Vercel URL)
5. Find **"Redirect URLs"** — click "Add URL" and add:
   ```
   https://pehnav-xyz123.vercel.app/account
   ```
6. Click **"Save"**

---

### Step 7.6 — Update VITE_APP_URL on Vercel

1. Go to your Vercel dashboard → click your pehnav project
2. Click **"Settings"** tab at the top
3. Click **"Environment Variables"** in the left menu
4. Find `VITE_APP_URL` → click the edit (pencil) icon
5. Change the value to your actual Vercel URL:
   ```
   https://pehnav-xyz123.vercel.app
   ```
6. Click **"Save"**
7. Go back to the main project page → click **"Redeploy"** → **"Redeploy"** again
8. Wait 2 minutes for the redeploy to finish

---

### Step 7.7 — Test your live site

Open your Vercel URL in an incognito/private browser window and run through
the same checklist from Part 6. Everything should work exactly the same as
on localhost — but now anyone in the world can access it.

---

## PART 8 — When you get your own domain (e.g. pehnav.com)

If you buy a domain from GoDaddy, Namecheap, or Google Domains:

### Step 8.1 — Add domain to Vercel
1. Vercel → your project → Settings → Domains
2. Type your domain (e.g. `pehnav.com`) → click "Add"
3. Vercel shows you DNS records to add

### Step 8.2 — Add DNS records to your domain registrar
1. Log into wherever you bought your domain
2. Go to DNS settings
3. Add the records Vercel shows you (usually a CNAME or A record)
4. DNS changes take 15 minutes to 48 hours to propagate

### Step 8.3 — Update everything to your new domain
- Vercel env var: `VITE_APP_URL` → `https://pehnav.com`
- Supabase: Site URL → `https://pehnav.com`
- Supabase: Redirect URL → `https://pehnav.com/account`
- Resend: Add your domain → verify it → change `FROM_EMAIL` to `orders@pehnav.com`
- Redeploy on Vercel

---

## Troubleshooting — Exact fixes for common problems

### "Cannot find module" or "Module not found" error
```
rm -rf node_modules
npm install
npm run dev
```

### ".env file not working / keys not loading"
- Make sure the file is named `.env` not `.env.txt` or `env`
- On Windows, check: View → Show hidden items is ON, so you can see the dot
- Verify there are no spaces around the = sign
- Restart the dev server after every .env change

### "Supabase: Invalid API key"
- You copied the wrong key — make sure "anon public" goes to `VITE_SUPABASE_ANON_KEY`
- Make sure you copied the full key — it's ~200 characters long
- Try copying again from Supabase Settings → API using the copy icon (not selecting text)

### "Login creates account but then nothing happens"
- Go to Supabase → Authentication → Email → turn OFF "Confirm email" for local testing

### "Admin page says 'Admin access required'"
- You haven't run the SQL to make yourself admin (Step 1.8)
- Make sure you're logged in with the exact email you used in that SQL query

### "Razorpay popup opens but payment fails"
- You must use the exact test card: `4111 1111 1111 1111`
- Make sure `VITE_RAZORPAY_KEY_ID` starts with `rzp_test_`
- Check browser console (press F12 → Console tab) for the error

### "AI chat opens but gives no response"
- Your `VITE_GROQ_API_KEY` is missing or wrong in `.env`
- The key must start with `gsk_`
- Restart the dev server after adding it
- Go to console.groq.com → API Keys → verify the key exists and is active
- Check browser console (F12 → Console) for the exact error

### "Deployed to Vercel but login doesn't work"
- You haven't updated Supabase Site URL and Redirect URLs (Step 7.5)
- The exact URL must match including https:// and no trailing slash

### "I get errors in the Terminal I don't understand"
- Copy the EXACT error text (all of it)
- Tell me which step you were on
- I'll fix it immediately

---

## Summary — Your 8 key files and what they do

| File | What it does |
|------|-------------|
| `.env` | All your secret keys — never share this file |
| `supabase/schema.sql` | Creates all database tables — run once in Supabase |
| `supabase/seed.sql` | Adds all 52 products — run once in Supabase |
| `src/lib/supabase.ts` | Connects the app to your Supabase database |
| `src/lib/auth.tsx` | Handles all login/logout/signup |
| `src/components/StyleAssistant.tsx` | The AI chat (powered by Gemini) |
| `src/routes/checkout.tsx` | The checkout flow with Razorpay |
| `DEPLOYMENT.md` | This guide |

---

## PART 9 — Admin Panel Setup
### Separate app. Separate URL. Zero connection to your store.

The admin panel is a completely independent application in the `pehnav-admin/`
folder. It has its own deploy URL, its own build, its own login system.
Your customers never touch it. Its code never ships with your store.

**Security layers built in:**
- Email allowlist — only emails you explicitly list can ever log in
- Supabase role check — even if someone gets a token, they need `role=admin` in DB
- 5-attempt lockout — locked for 15 minutes after 5 wrong passwords
- 2-hour inactivity timeout — auto signs out idle sessions
- Immutable audit log — every action recorded, nothing can be deleted
- `noindex` meta tag — never appears in Google
- Blank favicon — doesn't advertise the admin URL
- Strict CSP headers — only allows connections to Supabase

---

### Step 9.1 — Create your admin .env file

Inside the `pehnav-admin/` folder, create a `.env` file:

```
cp .env.example .env
```

Open it and fill in:

```env
# Same Supabase project as the store
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ONLY these emails can ever log into admin. Comma-separated.
# Even if someone guesses the URL, they cannot log in unless listed here.
VITE_ALLOWED_ADMIN_EMAILS=you@gmail.com

# Your store's live URL (for the "View Store" link in admin sidebar)
VITE_STORE_URL=https://pehnav.vercel.app
```

---

### Step 9.2 — Make yourself admin in Supabase

You must do this ONCE after signing up on the store:

1. Go to Supabase → SQL Editor → New query
2. Run this (your exact email):
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'you@gmail.com';
```
3. Click Run → you should see "Success. 1 rows affected"

---

### Step 9.3 — Run admin locally

```bash
# Open a NEW terminal window — keep the store running in the other one

cd pehnav-admin
npm install
npm run dev
```

Admin runs at: **http://localhost:4000**

Try logging in with your admin email and password.
You should see the dashboard with live data from Supabase.

---

### Step 9.4 — Deploy admin to Vercel (separate project)

The admin must be on a **different Vercel project** from the store.
Ideally a different subdomain: `admin.pehnav.com` or `pehnav-admin.vercel.app`

1. Go to **vercel.com** → click **"Add New..." → "Project"**
2. Import the **same GitHub repo** — but this time set the **Root Directory** to `pehnav-admin`
   - Click "Edit" next to Root Directory
   - Type: `pehnav-admin`
   - Click "Continue"
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Same as store |
   | `VITE_SUPABASE_ANON_KEY` | Same as store |
   | `VITE_ALLOWED_ADMIN_EMAILS` | `you@gmail.com` |
   | `VITE_STORE_URL` | `https://pehnav.vercel.app` |

7. Click Deploy → wait 2 minutes
8. Your admin is live at something like: `https://pehnav-admin-xyz.vercel.app`

---

### Step 9.5 — Add admin URL to Supabase auth

1. Supabase → Authentication → URL Configuration
2. Under Redirect URLs, add:
   ```
   https://pehnav-admin-xyz.vercel.app
   ```
3. Save

---

### Step 9.6 — (Recommended) Use a private subdomain

For maximum security, deploy admin on a subdomain that isn't publicly
guessable. Instead of `pehnav-admin.vercel.app`, use something like:

- `ops.pehnav.com`
- `portal.pehnav.com`
- `cms.pehnav.com`

Never use `admin.pehnav.com` — that's the first thing attackers guess.

To add a custom domain: Vercel → your admin project → Settings → Domains.

---

### Admin security test checklist

```
□ Go to admin URL → see login page (not the store)
□ Try wrong email → get "Invalid credentials" (not "email not found")
□ Try wrong password 5 times → get locked out for 15 minutes
□ Log in with correct admin credentials → see dashboard
□ Dashboard shows real orders, revenue charts, recent activity
□ Go to Orders → click an order → change status → check Supabase orders table
□ Go to Products → create a test product → it appears on the store
□ Go to Reviews → see pending reviews → approve one → appears on product page
□ Go to Audit Log → every action you just did is listed there
□ Leave admin open for 5 minutes of inactivity → auto signed out
□ Try accessing admin URL in incognito → see login page only, no data
```
