// supabase/functions/send-order-email/index.ts
// Triggered by Supabase DB webhook on orders INSERT
// Deploy: supabase functions deploy send-order-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "orders@pehnav.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderPayload {
  order_number: string;
  email: string;
  shipping_name: string;
  shipping_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  coupon_code?: string;
  items?: Array<{
    product_name: string;
    size: string;
    color: string;
    qty: number;
    unit_price: number;
    total_price: number;
    image_url: string;
  }>;
}

function buildEmailHtml(order: OrderPayload): string {
  const formatPrice = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const itemRows = (order.items ?? [])
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0ece4;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="60">
                <img src="${item.image_url}" width="60" height="72" style="border-radius:6px;object-fit:cover;display:block;" alt="${item.product_name}" />
              </td>
              <td style="padding-left:16px;vertical-align:top;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">${item.product_name}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#888;">${item.size} · ${item.color} · ×${item.qty}</p>
              </td>
              <td style="text-align:right;vertical-align:top;font-size:14px;font-weight:600;color:#1a1a1a;white-space:nowrap;">
                ${formatPrice(item.total_price)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — PEHNAV</title>
</head>
<body style="margin:0;padding:0;background:#f7f4ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.22em;color:#ffffff;">PEHNAV</p>
              <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.1em;color:#BFA16A;">WEAR YOUR STORY</p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:36px 40px 24px;text-align:center;border-bottom:1px solid #f0ece4;">
              <div style="width:56px;height:56px;background:#f0f9f4;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:28px;">✓</span>
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;">Order Confirmed!</h1>
              <p style="margin:10px 0 0;font-size:14px;color:#888;line-height:1.6;">
                Your story is being packed. We'll notify you when it ships.
              </p>
              <p style="margin:16px 0 0;display:inline-block;background:#f7f4ef;padding:8px 20px;border-radius:6px;font-size:14px;font-weight:600;color:#1a1a1a;">
                ${order.order_number}
              </p>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#888;">Your Items</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;border-radius:8px;padding:16px 20px;">
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Subtotal</td>
                  <td style="font-size:13px;color:#888;text-align:right;">${formatPrice(order.subtotal)}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                  <td style="font-size:13px;color:#1a7a5e;padding:4px 0;">Discount ${order.coupon_code ? `(${order.coupon_code})` : ""}</td>
                  <td style="font-size:13px;color:#1a7a5e;text-align:right;">− ${formatPrice(order.discount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Shipping</td>
                  <td style="font-size:13px;color:#888;text-align:right;">${order.shipping_fee === 0 ? "Free" : formatPrice(order.shipping_fee)}</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:700;color:#1a1a1a;padding:12px 0 4px;border-top:1px solid #e0dbd2;">Total</td>
                  <td style="font-size:15px;font-weight:700;color:#1a1a1a;text-align:right;padding-top:12px;border-top:1px solid #e0dbd2;">${formatPrice(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#888;">Delivering to</p>
              <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.7;">
                ${order.shipping_name}<br/>
                ${order.shipping_line1}<br/>
                ${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://pehnav.com/track" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:6px;">
                Track Your Order
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f4ef;padding:24px 40px;text-align:center;border-top:1px solid #ece8e0;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.8;">
                Questions? Email us at <a href="mailto:support@pehnav.com" style="color:#BFA16A;text-decoration:none;">support@pehnav.com</a><br/>
                7-day returns · Free shipping on orders above ₹1,499 · Made in India
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload: OrderPayload = await req.json();

    const html = buildEmailHtml(payload);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `PEHNAV <${FROM_EMAIL}>`,
        to: [payload.email],
        subject: `Order Confirmed — ${payload.order_number} | PEHNAV`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
