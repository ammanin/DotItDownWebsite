import { EmailMessage } from "cloudflare:email";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...headers },
  });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST" || new URL(request.url).pathname !== "/api/contact") {
      return json({ ok: false, error: "Not found" }, 404);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, 400);
    }

    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const category = (data.category || "").trim();
    const message = (data.message || "").trim();

    if (!name || !email || !category || !message) {
      return json({ ok: false, error: "Missing required fields" }, 400);
    }

    const from = env.SENDER_EMAIL || "noreply@dotitdown.app";
    // Default to the public contact address configured in wrangler.toml
    const to = env.DESTINATION_EMAIL || "contact@dotitdown.app";

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Category: ${category}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const subject = `Dot It Down – Contact (${category})`;
    const rawMime = [
      `From: "Dot It Down Contact" <${from}>`,
      `To: <${to}>`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body,
    ].join("\r\n");

    const emailMessage = new EmailMessage(from, to, rawMime);

    try {
      await env.CONTACT.send(emailMessage);
    } catch (e) {
      console.error("Send email error:", e);
      return json({ ok: false, error: "Failed to send email" }, 500);
    }

    return json({ ok: true });
  },
};
