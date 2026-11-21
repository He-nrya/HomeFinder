// Thin wrapper around Brevo's transactional email REST API (POST /v3/smtp/email).
// Uses Node's built-in fetch, so no extra package is needed.
const ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const isProd = () => process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// The sender is configurable: change EMAIL_FROM_ADDRESS / EMAIL_FROM_NAME in .env (no code change).
const sender = () => ({ email: process.env.EMAIL_FROM_ADDRESS, name: process.env.EMAIL_FROM_NAME || 'HomeFinder' });

async function postToBrevo(payload, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || `Brevo responded with HTTP ${res.status}`);
      err.status = res.status;
      err.brevoCode = data.code;
      throw err;
    }
    return data; // { messageId }
  } finally {
    clearTimeout(timer);
  }
}

async function sendEmail({ to, subject, html, text, tags }) {
  if (!to || !to.email) throw new Error('sendEmail: recipient email is required');
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    if (isProd()) throw new Error('BREVO_API_KEY is not set');
    // Local development without a key: print the email so links can still be tested.
    console.log(`\n[email:dev] BREVO_API_KEY not set - email not sent.\n  To: ${to.email}\n  Subject: ${subject}\n\n${text}\n`);
    return { skipped: true };
  }

  const from = sender();
  if (!from.email) throw new Error('EMAIL_FROM_ADDRESS is not set');

  const payload = { sender: from, to: [{ email: to.email, name: to.name || undefined }], subject, htmlContent: html, textContent: text };
  if (process.env.EMAIL_REPLY_TO) payload.replyTo = { email: process.env.EMAIL_REPLY_TO };
  if (tags && tags.length) payload.tags = tags;

  // One retry for temporary problems (network error, timeout, 429, 5xx). Never retry 4xx - those are our mistakes.
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await postToBrevo(payload, apiKey);
    } catch (e) {
      const temporary = e.name === 'AbortError' || !e.status || e.status === 429 || e.status >= 500;
      if (attempt >= 2 || !temporary) throw e;
      await new Promise((r) => setTimeout(r, 800));
    }
  }
}

module.exports = { sendEmail };
