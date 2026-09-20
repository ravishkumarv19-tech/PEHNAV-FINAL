# PEHNAV — Local Setup Guide

## The Problem (Why the Original Couldn't Run)
The Lovable-generated zip uses `@lovable.dev/vite-tanstack-config` — a **private Lovable package** 
that doesn't exist on public npm. It also uses TanStack Start (SSR framework) which requires Vite 7+.
This version is a clean SPA conversion: same UI, same data, real auth, no private dependencies.

---

## Quick Start (3 steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase (for auth)
1. Go to https://supabase.com → New project → copy your URL and anon key
2. In your Supabase dashboard → Authentication → Providers → Enable **Google** OAuth
3. Create a `.env` file (copy from `.env.example`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Without Supabase:** The site works fully — auth just shows a form that won't connect. 
> Cart, wishlist, shop, products all work without Supabase.

### 3. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## Auth Features
- **Email + Password** sign in / sign up
- **Google OAuth** (one click, requires Supabase Google provider setup)  
- **Magic Link / OTP** — passwordless email login
- Protected account page with user profile
- Checkout pre-fills name/email when signed in
- Persistent sessions (Supabase handles JWT refresh)

## Security
- All auth tokens managed by Supabase (industry standard)
- No passwords stored locally ever
- HTTPS enforced in production
- RLS (Row Level Security) policies should be enabled in Supabase for production

---

## Build for Production
```bash
npm run build
```
Output goes to `dist/`. Deploy to Vercel, Netlify, or any static host.

For Vercel:
```bash
npm i -g vercel && vercel
```

For Netlify: drag `dist/` folder into netlify.com/drop

---

## What Changed vs Lovable Version
| Before | After |
|--------|-------|
| `@lovable.dev/vite-tanstack-config` (private) | Standard `@vitejs/plugin-react` |
| TanStack Start (SSR) | TanStack Router (SPA) |
| Vite 8 (breaks locally) | Vite 6 (stable) |
| Fake auth (useState only) | Real Supabase auth |
| No login persistence | JWT sessions persist |
| `npm install` errors | ✅ Works |
