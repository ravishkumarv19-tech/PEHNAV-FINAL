// pehnav/api/send-email.ts
// Vercel Serverless Function to dispatch luxury confirmation emails via Resend

export default async function handler(req: any, res: any) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { email, order_number, subject, html } = body || {};

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid recipient email is required" });
    }

    const apiKey =
      process.env.RESEND_API_KEY ||
      process.env.VITE_RESEND_API_KEY ||
      "";

    const fromEmail =
      process.env.FROM_EMAIL ||
      process.env.VITE_FROM_EMAIL ||
      "orders@pehnav.store";

    const finalSubject = subject || `Order Confirmed: #${order_number} | PEHNAV`;

    console.log(`[Vercel API] Dispatching order email to ${email} for #${order_number}...`);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `PEHNAV <${fromEmail}>`,
        to: [email],
        reply_to: "orders@pehnav.store",
        subject: finalSubject,
        html: html || `<p>Your order #${order_number} has been confirmed. Thank you for shopping with PEHNAV!</p>`,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      console.error("[Vercel API] Resend returned error:", data);
      return res.status(resendRes.status).json(data);
    }

    console.log("[Vercel API] Email dispatched successfully! Resend ID:", data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error: any) {
    console.error("[Vercel API Error]:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
}
