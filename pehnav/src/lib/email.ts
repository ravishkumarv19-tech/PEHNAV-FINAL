// pehnav/src/lib/email.ts
// Luxury email generator & Resend dispatcher for PEHNAV

export interface OrderEmailItem {
  product_name: string;
  size: string;
  color: string;
  qty: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface OrderEmailPayload {
  order_number: string;
  email: string;
  customer_name: string;
  phone?: string;
  shipping_address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code?: string | null;
  payment_method?: string;
  created_at?: string;
}

function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert hex color codes to human-readable names
function formatColorName(color: string): string {
  if (!color) return "";
  const hex = color.toLowerCase().trim();
  const map: Record<string, string> = {
    "#000000": "Classic Black",
    "#000": "Classic Black",
    "#ffffff": "Pure White",
    "#fff": "Pure White",
    "#18181b": "Obsidian Black",
    "#27272a": "Charcoal Grey",
    "#71717a": "Slate Grey",
    "#1e3a8a": "Royal Navy",
    "#1e40af": "Indigo Blue",
    "#047857": "Emerald Green",
    "#b45309": "Desert Amber",
    "#991b1b": "Crimson Wine",
    "#374151": "Dark Grey",
    "#d1d5db": "Light Grey",
    "#f3f4f6": "Off-White",
    "#92400e": "Vintage Brown",
  };
  return map[hex] || color.replace(/^#/, "");
}

// Fallback high-res image mapping for popular clothing categories in email
function resolveEmailImageUrl(rawUrl?: string, productName?: string): string {
  if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
    return rawUrl;
  }
  const name = (productName || "").toLowerCase();
  if (name.includes("denim") || name.includes("jean")) {
    return "https://images.unsplash.com/photo-1542272604-780c96856592?w=400&q=80";
  }
  if (name.includes("hoodie")) {
    return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80";
  }
  if (name.includes("shirt") || name.includes("oxford")) {
    return "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80";
  }
  if (name.includes("jacket") || name.includes("bomber")) {
    return "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80";
  }
  if (name.includes("cargo") || name.includes("pant")) {
    return "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80";
  }
  if (name.includes("sneaker") || name.includes("shoe")) {
    return "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80";
  }
  // Universal stylish apparel placeholder
  return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80";
}

/**
 * Generates an ultra-luxurious, universally compatible, high-contrast HTML email for PEHNAV orders.
 */
export function generateOrderConfirmationEmailHtml(order: OrderPayload): string {
  const formatINR = (n: number) =>
    `₹${Math.round(n).toLocaleString("en-IN")}`;

  const appUrl =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : import.meta.env.VITE_APP_URL || "https://pehnav.store";

  const trackingUrl = `${appUrl}/track?q=${encodeURIComponent(order.order_number)}`;
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

  const itemRowsHtml = (order.items || [])
    .map((item) => {
      const colorLabel = formatColorName(item.color);

      return `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #E5E7EB; vertical-align: middle;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: middle;">
                <p style="margin: 0 0 5px 0; font-size: 15px; font-weight: 700; color: #111827; line-height: 1.3;">
                  ${escapeHtml(item.product_name)}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #4B5563;">
                  Size: <strong style="color: #111827;">${escapeHtml(item.size)}</strong> ${colorLabel ? `&nbsp;|&nbsp; Color: <strong style="color: #111827;">${escapeHtml(colorLabel)}</strong>` : ""}
                </p>
                <p style="margin: 0; font-size: 13px; color: #6B7280;">
                  Qty: <span style="color: #111827; font-weight: 600;">${item.qty}</span> × ${formatINR(item.unit_price)}
                </p>
              </td>
              <td style="vertical-align: middle; text-align: right; white-space: nowrap; padding-left: 12px;">
                <span style="font-size: 16px; font-weight: 700; color: #111827;">
                  ${formatINR(item.total_price)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — ${order.order_number} | PEHNAV</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Outer Wrapper Table -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F3F4F6; padding: 32px 12px;">
    <tr>
      <td align="center">

        <!-- Main Container Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          
          <!-- Top Gold Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #937338 0%, #D4AF37 50%, #937338 100%);"></td>
          </tr>

          <!-- Brand Header (Rich Obsidian) -->
          <tr>
            <td style="padding: 28px 40px 20px; text-align: center; background-color: #111111;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.28em; color: #FFFFFF; text-transform: uppercase;">
                PEHNAV
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; color: #D4AF37; text-transform: uppercase;">
                Wear Your Story
              </p>
            </td>
          </tr>

          <!-- Hero Confirmation Banner -->
          <tr>
            <td style="padding: 32px 36px 24px; text-align: center; border-bottom: 1px solid #F3F4F6; background-color: #FAFAFA;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px;">
                <tr>
                  <td align="center" valign="middle" style="width: 52px; height: 52px; border-radius: 50%; background-color: #ECFDF5; border: 2px solid #10B981; color: #059669; font-size: 24px; font-weight: 700; line-height: 52px;">
                    ✓
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                Order Confirmed!
              </h2>
              <p style="margin: 8px 0 0; font-size: 14px; color: #4B5563; line-height: 1.5;">
                Thank you for choosing PEHNAV, <strong style="color: #111827;">${escapeHtml(order.customer_name)}</strong>.<br />
                Your handcrafted piece is now being prepared by our artisans.
              </p>

              <!-- Order Number Pill -->
              <div style="margin-top: 18px;">
                <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; background-color: #111111; border-radius: 24px;">
                  <tr>
                    <td style="padding: 8px 20px; font-size: 13px; font-weight: 700; color: #D4AF37; letter-spacing: 0.05em;">
                      ORDER #${escapeHtml(order.order_number)}
                    </td>
                  </tr>
                </table>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #6B7280;">
                  Placed on ${formattedDate}
                </p>
              </div>
            </td>
          </tr>

          <!-- Items Ordered Section -->
          <tr>
            <td style="padding: 24px 36px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #854D0E;">
                    Items in Your Order (${(order.items || []).reduce((acc, curr) => acc + curr.qty, 0)})
                  </td>
                </tr>
                ${itemRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Summary & Totals Breakdown -->
          <tr>
            <td style="padding: 0 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px;">
                <tr>
                  <td style="font-size: 14px; color: #4B5563; padding: 5px 0;">Subtotal</td>
                  <td style="font-size: 14px; color: #111827; text-align: right; padding: 5px 0; font-weight: 600;">
                    ${formatINR(order.subtotal)}
                  </td>
                </tr>

                ${
                  order.discount > 0
                    ? `
                <tr>
                  <td style="font-size: 14px; color: #059669; padding: 5px 0;">
                    Discount ${order.coupon_code ? `<span style="font-size: 11px; background: #ECFDF5; color: #059669; padding: 2px 6px; border-radius: 4px; margin-left: 4px; border: 1px solid #A7F3D0;">${order.coupon_code}</span>` : ""}
                  </td>
                  <td style="font-size: 14px; color: #059669; text-align: right; padding: 5px 0; font-weight: 700;">
                    − ${formatINR(order.discount)}
                  </td>
                </tr>`
                    : ""
                }

                <tr>
                  <td style="font-size: 14px; color: #4B5563; padding: 5px 0;">Shipping</td>
                  <td style="font-size: 14px; text-align: right; padding: 5px 0; font-weight: 600;">
                    ${
                      order.shipping_fee === 0
                        ? `<span style="color: #059669; font-weight: 700;">FREE</span>`
                        : `<span style="color: #111827;">${formatINR(order.shipping_fee)}</span>`
                    }
                  </td>
                </tr>

                <tr>
                  <td colspan="2" style="padding: 8px 0 0 0; border-top: 1px solid #E5E7EB;"></td>
                </tr>

                <tr>
                  <td style="font-size: 15px; font-weight: 700; color: #111827; padding: 6px 0;">Total Paid</td>
                  <td style="font-size: 18px; font-weight: 800; color: #111827; text-align: right; padding: 6px 0;">
                    ${formatINR(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address & Delivery Timeline -->
          <tr>
            <td style="padding: 0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #854D0E;">
                      Delivery Address
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #111827; font-weight: 700;">
                      ${escapeHtml(order.customer_name)}
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #4B5563; line-height: 1.5;">
                      ${escapeHtml(order.shipping_address.line1)}<br />
                      ${order.shipping_address.line2 ? `${escapeHtml(order.shipping_address.line2)}<br />` : ""}
                      ${escapeHtml(order.shipping_address.city)}, ${escapeHtml(order.shipping_address.state)} — ${escapeHtml(order.shipping_address.pincode)}<br />
                      ${order.phone ? `Phone: ${escapeHtml(order.phone)}` : ""}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; border-left: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #854D0E;">
                      Estimated Delivery
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #111827; font-weight: 700;">
                      3 – 5 Business Days
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #4B5563; line-height: 1.4;">
                      Insured express courier delivery with live milestone updates.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 0 36px 32px; text-align: center;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #111111;">
                    <a href="${trackingUrl}" target="_blank" style="display: inline-block; padding: 15px 32px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; color: #FFFFFF; text-transform: uppercase; text-decoration: none; border-radius: 6px;">
                      Track Your Order Live →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6B7280;">
                Or track anytime at <a href="${appUrl}/track" style="color: #854D0E; font-weight: 600; text-decoration: none;">${appUrl}/track</a> using <strong>${order.order_number}</strong>
              </p>
            </td>
          </tr>

          <!-- Value Pillars -->
          <tr>
            <td style="padding: 20px 36px; background-color: #FAFAFA; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="text-align: center; vertical-align: top; padding: 0 4px;">
                    <div style="font-size: 18px; margin-bottom: 2px;">✨</div>
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #111827;">Artisanal Quality</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #6B7280;">Handcrafted in India</p>
                  </td>
                  <td width="33%" style="text-align: center; vertical-align: top; padding: 0 4px; border-left: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;">
                    <div style="font-size: 18px; margin-bottom: 2px;">🔄</div>
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #111827;">7-Day Returns</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #6B7280;">Hassle-free exchange</p>
                  </td>
                  <td width="33%" style="text-align: center; vertical-align: top; padding: 0 4px;">
                    <div style="font-size: 18px; margin-bottom: 2px;">🛡️</div>
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #111827;">Insured Transit</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #6B7280;">100% Safe delivery</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & Concierge Support -->
          <tr>
            <td style="padding: 28px 36px; text-align: center; background-color: #FFFFFF;">
              <p style="margin: 0; font-size: 13px; color: #4B5563; line-height: 1.5;">
                Need help or have questions about your order?<br />
                Reach our concierge team at <a href="mailto:orders@pehnav.store" style="color: #854D0E; text-decoration: none; font-weight: 700;">orders@pehnav.store</a>
              </p>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6;">
                <p style="margin: 0; font-size: 11px; color: #9CA3AF; letter-spacing: 0.05em;">
                  © ${new Date().getFullYear()} PEHNAV. All rights reserved. • Handcrafted with Pride in India
                </p>
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export type OrderPayload = OrderEmailPayload;

/**
 * Sends the order confirmation email via internal server endpoint, Resend proxy, or direct API.
 * Includes automatic fallback for local dev, serverless, and production environments.
 */
export async function sendOrderConfirmationEmail(
  order: OrderEmailPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey =
    import.meta.env.VITE_RESEND_API_KEY || "";

  const configuredFrom =
    import.meta.env.VITE_FROM_EMAIL || "orders@pehnav.store";

  if (!order.email || !order.email.includes("@")) {
    console.warn("[Email] Skipping email: invalid email address", order.email);
    return { success: false, error: "Invalid email" };
  }

  const html = generateOrderConfirmationEmailHtml(order);
  const subject = `Order Confirmed: #${order.order_number} | PEHNAV`;

  // ── Strategy 1: Server endpoint (/api/send-email) (Node / Vite Dev Server)
  try {
    console.log(`[Email] Attempting to dispatch email via /api/send-email to ${order.email}...`);
    const serverRes = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: order.email,
        order_number: order.order_number,
        subject,
        html,
      }),
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.id) {
        console.log(`[Email] Successfully delivered via /api/send-email! ID: ${data.id}`);
        return { success: true, id: data.id };
      }
    }
  } catch (err) {
    console.log("[Email] /api/send-email not available, trying direct proxies/endpoints...", err);
  }

  // ── Strategy 2: Supabase Edge Function (/functions/v1/send-order-email)
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      console.log(`[Email] Attempting to dispatch via Supabase Edge Function to ${order.email}...`);
      const edgeRes = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: "POST",
        headers: {
          "apikey": anonKey,
          "Authorization": `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: order.order_number,
          email: order.email,
          customer_name: order.customer_name,
          shipping_name: order.customer_name,
          shipping_line1: order.shipping_address?.line1,
          shipping_line2: order.shipping_address?.line2,
          shipping_city: order.shipping_address?.city,
          shipping_state: order.shipping_address?.state,
          shipping_pincode: order.shipping_address?.pincode,
          phone: order.phone,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping_fee: order.shipping_fee,
          total: order.total,
          coupon_code: order.coupon_code,
          items: order.items,
        }),
      });

      if (edgeRes.ok) {
        const edgeData = await edgeRes.json();
        if (edgeData.id) {
          console.log(`[Email] Delivered via Supabase Edge Function! ID: ${edgeData.id}`);
          return { success: true, id: edgeData.id };
        }
      }
    }
  } catch (edgeErr) {
    console.warn("[Email] Edge function dispatch failed:", edgeErr);
  }

  return { success: false, error: "Failed to dispatch email" };
}
