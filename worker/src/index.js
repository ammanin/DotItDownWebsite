import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

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

    const from = env.SENDER_EMAIL || "noreply@example.com";
    const to = env.DESTINATION_EMAIL;

    if (!to || to === "you@example.com") {
      return json({ ok: false, error: "Server misconfiguration: set DESTINATION_EMAIL" }, 500);
    }

    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Category: ${category}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const msg = createMimeMessage();
    msg.setSender({ name: "Dot It Down Contact", addr: from });
    msg.setRecipient(to);
    msg.setSubject(`Dot It Down – Contact (${category})`);
    msg.addMessage({
      contentType: "text/plain",
      data: text,
    });

    const emailMessage = new EmailMessage(from, to, msg.asRaw());

    try {
      await env.CONTACT.send(emailMessage);
    } catch (e) {
      console.error("Send email error:", e);
      return json({ ok: false, error: "Failed to send email" }, 500);
    }

    return json({ ok: true });
  },
};
