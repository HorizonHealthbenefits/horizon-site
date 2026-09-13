// Horizon Health Benefits — "Request a Call" form handler.
// Vercel Node serverless function (no external dependencies — plain
// fetch is available in Vercel's Node runtime, so no package.json/
// npm install is needed, matching horizon-crm's no-build-step style).
//
// Mirrors horizon-crm's supabase/functions/lead-notify pattern:
// same env var names (RESEND_API_KEY, OWNER_EMAIL), same Resend
// sandbox sender. Reusing those names is deliberate — if this site
// and the CRM end up sharing a Resend account, no need for a second
// set of secrets.
//
// Required Vercel env vars (Project Settings → Environment Variables):
//   RESEND_API_KEY, OWNER_EMAIL
//
// NOTE: Resend's shared sandbox sender (onboarding@resend.dev) can
// only deliver to ONE verified recipient address until a custom
// sending domain is verified on the Resend account. OWNER_EMAIL must
// match that verified address or delivery will silently fail on
// Resend's side (the API call itself will still return an error in
// that case, which this function surfaces as a 502).
//
// No database — this is intentionally just email-and-forget. The
// owner follows up manually with available times.

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const MAX_LEN = { name: 120, phone: 40, email: 200, reason: 2000 };

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!resendApiKey || !ownerEmail) {
    res.status(500).json({ error: "Server not configured" });
    return;
  }

  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!name || !phone || !email || !reason) {
    res.status(400).json({ error: "Missing required field" });
    return;
  }
  if (
    name.length > MAX_LEN.name ||
    phone.length > MAX_LEN.phone ||
    email.length > MAX_LEN.email ||
    reason.length > MAX_LEN.reason
  ) {
    res.status(400).json({ error: "Field too long" });
    return;
  }
  // Loose sanity check, not full RFC validation — just catches typos/garbage.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  const html =
    "<p><strong>New \"Request a Call\" submission — Horizon Health Benefits site</strong></p>" +
    "<p>Name: " + escapeHtml(name) + "<br>" +
    "Phone: " + escapeHtml(phone) + "<br>" +
    "Email: " + escapeHtml(email) + "</p>" +
    "<p>Reason:<br>" + escapeHtml(reason).replace(/\n/g, "<br>") + "</p>";

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resendApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: ownerEmail,
        reply_to: email,
        subject: "Request a Call: " + name,
        html: html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      res.status(502).json({ error: "Email send failed: " + errText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: "Email send failed: " + String(err) });
  }
};
