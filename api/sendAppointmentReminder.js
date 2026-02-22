/**
 * Vercel serverless: send appointment reminder SMS when a customer sets an appointment date.
 * Uses Twilio. Set in Vercel env:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (E.164, e.g. +14055551234)
 */
const TWILIO_BASE = 'https://api.twilio.com/2010-04-01';

function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits.length >= 10 ? `+${digits}` : '';
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch (_) {
    return isoDate;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio env not set; skipping appointment reminder SMS');
    res.status(200).json({ ok: true, skipped: 'no Twilio config' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (_) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const { phone, name, appointmentDate } = body;
  const to = normalizePhone(phone);
  if (!to) {
    res.status(400).json({ error: 'Missing or invalid phone number' });
    return;
  }
  if (!appointmentDate) {
    res.status(400).json({ error: 'Missing appointmentDate' });
    return;
  }

  const friendlyDate = formatDate(appointmentDate);
  const firstName = (name || 'there').trim().split(/\s+/)[0];
  const message = `Hi ${firstName}, your appointment with Heritage Housing is set for ${friendlyDate}. We'll confirm before then. Questions? Call 405-601-5650.`;

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const url = `${TWILIO_BASE}/Accounts/${accountSid}/Messages.json`;

  try {
    const params = new URLSearchParams();
    params.set('To', to);
    params.set('From', fromNumber);
    params.set('Body', message);

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Twilio error', r.status, data);
      res.status(502).json({ error: 'SMS send failed', details: data });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('sendAppointmentReminder', err);
    res.status(500).json({ error: 'Server error' });
  }
}
