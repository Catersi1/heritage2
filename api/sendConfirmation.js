/**
 * Vercel serverless: send confirmation email to applicant after submission.
 * Set RESEND_API_KEY in Vercel env. Optional: RESEND_FROM (e.g. "Heritage Housing <noreply@yourdomain.com>").
 */
const RESEND_URL = 'https://api.resend.com/emails';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('RESEND_API_KEY not set; skipping confirmation email');
    res.status(200).json({ ok: true, skipped: 'no API key' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (_) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const { email, name } = body;
  if (!email || !name) {
    res.status(400).json({ error: 'Missing email or name' });
    return;
  }

  const from = process.env.RESEND_FROM || 'Heritage Housing <onboarding@resend.dev>';
  const subject = 'Application received – Heritage Housing';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Application Received</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b;">
  <p style="font-size: 16px;">Hi ${escapeHtml(name)},</p>
  <p style="font-size: 16px;">Thank you for submitting your application to Heritage Housing. We have received your information and documents.</p>
  <p style="font-size: 16px;">A team member will contact you within 24 hours. If you have questions, call us at 405-601-5650.</p>
  <p style="font-size: 16px;">Best regards,<br><strong>Heritage Housing</strong><br>6220 S. Shields Blvd., Oklahoma City, OK 73149</p>
</body>
</html>`;

  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to: email, subject, html })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Resend error', r.status, data);
      res.status(502).json({ error: 'Email send failed', details: data });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('sendConfirmation', err);
    res.status(500).json({ error: 'Server error' });
  }
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
