// supabase/functions/send-order-email/index.ts
// Luxury order confirmation email generator & Resend dispatcher for PEHNAV
// Deploy: supabase functions deploy send-order-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "orders@pehnav.store";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderPayload {
  order_number: string;
  email: string;
  shipping_name: string;
  shipping_line1: string;
  shipping_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  phone?: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  coupon_code?: string;
  created_at?: string;
  items?: Array<{
    product_name: string;
    size: string;
    color: string;
    qty: number;
    unit_price: number;
    total_price: number;
    image_url?: string;
  }>;
}

function buildEmailHtml(order: OrderPayload): string {
  const formatINR = (n: number) =>
    `₹${Math.round(n).toLocaleString("en-IN")}`;

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const trackingUrl = `https://pehnav.store/track?q=${encodeURIComponent(order.order_number)}`;

  const itemRowsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #27272A; vertical-align: middle;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: middle;">
                <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #FFFFFF; line-height: 1.3;">
                  ${item.product_name}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #A1A1AA;">
                  Size: <strong style="color: #E4E4E7;">${item.size}</strong> &nbsp;|&nbsp; Color: <strong style="color: #E4E4E7;">${item.color}</strong>
                </p>
                <p style="margin: 0; font-size: 13px; color: #A1A1AA;">
                  Qty: <span style="color: #E4E4E7;">${item.qty}</span> × ${formatINR(item.unit_price)}
                </p>
              </td>
              <td style="vertical-align: middle; text-align: right; white-space: nowrap; padding-left: 12px;">
                <span style="font-size: 15px; font-weight: 700; color: #D4AF37;">
                  ${formatINR(item.total_price)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — ${order.order_number} | PEHNAV</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090B; color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090B; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #121215; border-radius: 16px; border: 1px solid #27272A; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Gold Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #937338 0%, #D4AF37 50%, #937338 100%);"></td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center; background-color: #18181B; border-bottom: 1px solid #27272A;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.28em; color: #FFFFFF; text-transform: uppercase;">PEHNAV</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.25em; color: #D4AF37; text-transform: uppercase;">Wear Your Story</p>
            </td>
          </tr>

          <!-- Hero Status -->
          <tr>
            <td style="padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #27272A; background: radial-gradient(circle at top, rgba(212, 175, 55, 0.08) 0%, rgba(18, 18, 21, 0) 70%);">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 18px;">
                <tr>
                  <td align="center" valign="middle" style="width: 60px; height: 60px; border-radius: 50%; background-color: #064E3B; border: 2px solid #10B981; color: #FFFFFF; font-size: 26px; line-height: 60px;">✓</td>
                </tr>
              </table>
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF;">Order Confirmed!</h2>
              <p style="margin: 10px 0 0; font-size: 15px; color: #A1A1AA; line-height: 1.6;">
                Thank you for choosing PEHNAV, <strong style="color: #FFFFFF;">${order.shipping_name}</strong>.<br />
                Your handcrafted garment is being prepared with utmost care.
              </p>
              <div style="margin-top: 24px;">
                <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; background-color: #27272A; border-radius: 30px; border: 1px solid #3F3F46;">
                  <tr>
                    <td style="padding: 10px 22px; font-size: 14px; font-weight: 600; color: #D4AF37; letter-spacing: 0.05em;">
                      ORDER #${order.order_number}
                    </td>
                  </tr>
                </table>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #71717A;">Placed on ${formattedDate}</p>
              </div>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 28px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37;">
                    Items in Your Order (${(order.items || []).reduce((acc, curr) => acc + curr.qty, 0)})
                  </td>
                </tr>
                ${itemRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals Breakdown -->
          <tr>
            <td style="padding: 0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 20px;">
                <tr>
                  <td style="font-size: 14px; color: #A1A1AA; padding: 6px 0;">Subtotal</td>
                  <td style="font-size: 14px; color: #FFFFFF; text-align: right; padding: 6px 0; font-weight: 500;">${formatINR(order.subtotal)}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                  <td style="font-size: 14px; color: #10B981; padding: 6px 0;">Discount ${order.coupon_code ? `(${order.coupon_code})` : ""}</td>
                  <td style="font-size: 14px; color: #10B981; text-align: right; padding: 6px 0; font-weight: 600;">− ${formatINR(order.discount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size: 14px; color: #A1A1AA; padding: 6px 0;">Shipping</td>
                  <td style="font-size: 14px; text-align: right; padding: 6px 0; font-weight: 500;">
                    ${order.shipping_fee === 0 ? `<span style="color: #10B981; font-weight: 600;">FREE</span>` : `<span style="color: #FFFFFF;">${formatINR(order.shipping_fee)}</span>`}
                  </td>
                </tr>
                <tr><td colspan="2" style="padding: 10px 0 0 0; border-top: 1px solid #27272A;"></td></tr>
                <tr>
                  <td style="font-size: 16px; font-weight: 700; color: #FFFFFF; padding: 6px 0;">Total Paid</td>
                  <td style="font-size: 20px; font-weight: 800; color: #D4AF37; text-align: right; padding: 6px 0;">${formatINR(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #D4AF37;">Delivery Address</p>
                    <p style="margin: 0; font-size: 14px; color: #FFFFFF; font-weight: 600;">${order.shipping_name}</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #A1A1AA; line-height: 1.6;">
                      ${order.shipping_line1}<br />
                      ${order.shipping_line2 ? `${order.shipping_line2}<br />` : ""}
                      ${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; border-left: 1px solid #27272A;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #D4AF37;">Estimated Delivery</p>
                    <p style="margin: 0; font-size: 14px; color: #FFFFFF; font-weight: 600;">3 – 5 Business Days</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #A1A1AA; line-height: 1.5;">Insured express delivery with live milestone tracking.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 36px; text-align: center;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #D4AF37 0%, #AA8329 100%); box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);">
                    <a href="${trackingUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; color: #09090B; text-transform: uppercase; text-decoration: none; border-radius: 8px;">
                      Track Your Order Live →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #0F0F11;">
              <p style="margin: 0; font-size: 13px; color: #A1A1AA;">
                Questions? Contact our concierge at <a href="mailto:orders@pehnav.store" style="color: #D4AF37; text-decoration: none; font-weight: 600;">orders@pehnav.store</a>
              </p>
              <p style="margin: 16px 0 0 0; font-size: 11px; color: #52525B;">
                © ${new Date().getFullYear()} PEHNAV. All rights reserved. • Handcrafted in India
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

    const senders = [
      `PEHNAV <${FROM_EMAIL}>`,
      `PEHNAV <orders@pehnav.store>`,
      `PEHNAV <onboarding@resend.dev>`,
    ];

    let lastError = "";
    let emailId = null;

    for (const sender of senders) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: sender,
            to: [payload.email],
            reply_to: "orders@pehnav.store",
            subject: `Order Confirmed: #${payload.order_number} | PEHNAV`,
            html,
          }),
        });

        const data = await res.json();
        if (res.ok && data.id) {
          emailId = data.id;
          break;
        } else {
          lastError = data?.message || data?.error || "Resend error";
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (!emailId) {
      throw new Error(`Failed to send email via Resend: ${lastError}`);
    }

    return new Response(JSON.stringify({ success: true, id: emailId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
