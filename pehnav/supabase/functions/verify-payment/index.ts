// supabase/functions/verify-payment/index.ts
// CRITICAL SECURITY FUNCTION
// Verifies Razorpay HMAC signature server-side BEFORE marking any order as paid.
// The client NEVER sets payment_status=paid. Only this function does, after HMAC proof.
// Supports both authenticated users and guests (guest orders have null user_id).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  const body = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // Constant-time length check first, then value comparison
  if (computed.length !== signature.length) return false;
  return computed === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Try to identify the user — guests are allowed (their orders have user_id = null)
    const authHeader = req.headers.get("Authorization");
    let authenticatedUserId: string | null = null;

    if (authHeader) {
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user) authenticatedUserId = user.id;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Cryptographic HMAC verification — gate everything on this
    const isValid = await verifyRazorpaySignature(
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
    );

    if (!isValid) {
      console.error(`SECURITY: Invalid Razorpay signature. order_id=${order_id}, user=${authenticatedUserId ?? "guest"}`);
      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Service role for DB writes — bypasses RLS safely post-verification
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 3: Fetch order and validate ownership
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, payment_status, total, razorpay_order_id")
      .eq("id", order_id)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Security: if order has a user_id, it must match the authenticated user
    // Guest orders (user_id = null) are allowed from anyone who has the Razorpay HMAC
    if (order.user_id && authenticatedUserId && order.user_id !== authenticatedUserId) {
      console.error(`SECURITY: User ${authenticatedUserId} tried to verify order owned by ${order.user_id}`);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Security: razorpay_order_id on the order must match what was sent
    if (order.razorpay_order_id && order.razorpay_order_id !== razorpay_order_id) {
      console.error(`SECURITY: Razorpay order ID mismatch for order ${order_id}`);
      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency — handle network retries safely
    if (order.payment_status === "paid") {
      return new Response(JSON.stringify({ success: true, already_paid: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 4: Mark as paid — ONLY reachable after HMAC verification passes
    await supabase.from("orders").update({
      payment_status: "paid",
      status: "processing",
      razorpay_order_id,
      razorpay_payment_id,
      updated_at: new Date().toISOString(),
    }).eq("id", order_id);

    await supabase.from("order_status_history").insert({
      order_id,
      status: "processing",
      note: `Payment verified via HMAC. Razorpay payment: ${razorpay_payment_id}`,
    });

    // Trigger email notification (fire-and-forget, don't fail the response)
    supabase.functions.invoke("send-order-email", {
      body: { order_id, type: "confirmation" },
    }).catch(console.error);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("verify-payment error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
