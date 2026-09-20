// supabase/functions/create-razorpay-order/index.ts
// Creates a Razorpay order server-side so the secret key never hits the browser.
// Deploy: supabase functions deploy create-razorpay-order --no-verify-jwt
// The --no-verify-jwt flag is critical — guests must be able to checkout too.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("Razorpay secrets not set. Run: supabase secrets set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=...");
    return json({ error: "Payment service not configured." }, 503);
  }

  try {
    let body: { amount: number };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { amount } = body;

    if (!amount || typeof amount !== "number" || amount < 100) {
      return json({ error: "Invalid amount — must be a number in paise (min ₹1 = 100 paise)" }, 400);
    }

    const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `pehnav_${Date.now()}`,
        notes: { source: "pehnav-web" },
      }),
    });

    if (!razorpayRes.ok) {
      const errText = await razorpayRes.text().catch(() => "unknown");
      console.error("Razorpay API error:", razorpayRes.status, errText);
      return json({ error: `Payment gateway error: ${razorpayRes.status}` }, 502);
    }

    const order = await razorpayRes.json();
    return json({ id: order.id, amount: order.amount });

  } catch (err) {
    console.error("create-razorpay-order error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});