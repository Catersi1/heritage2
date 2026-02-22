/**
 * Cron: send 1-day and 2-day appointment reminder SMS.
 * Call daily (e.g. 9 AM CT). Needs: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, Twilio env.
 * Optional: CRON_SECRET to protect the endpoint (Authorization: Bearer CRON_SECRET).
 */
const KEY = 'hh:appt_reminders';
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
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch (_) {
    return isoDate;
  }
}

/** YYYY-MM-DD for a date in America/Chicago (Oklahoma). */
function todayCT() {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
}

/** Send one SMS via Twilio. */
async function sendSms(accountSid, authToken, fromNumber, to, body) {
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams();
  params.set('To', to);
  params.set('From', fromNumber);
  params.set('Body', body);
  const r = await fetch(`${TWILIO_BASE}/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Twilio error');
  return data;
}

async function redisGet(url, token) {
  const r = await fetch(`${url}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

async function redisSet(url, token, value) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', KEY, value])
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!url || !token) {
    res.status(200).json({ ok: true, skipped: 'no Redis config' });
    return;
  }
  if (!accountSid || !authToken || !fromNumber) {
    res.status(200).json({ ok: true, skipped: 'no Twilio config' });
    return;
  }

  const today = todayCT(); // YYYY-MM-DD
  const tomorrow = (() => {
    const d = new Date(today + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
  })();
  const inTwoDays = (() => {
    const d = new Date(today + 'T12:00:00');
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
  })();

  try {
    const raw = await redisGet(url, token);
    const list = raw ? JSON.parse(raw) : [];
    let updated = false;
    const stillValid = [];

    for (const item of list) {
      const apptDate = item.appointmentDate.slice(0, 10);
      if (apptDate < today) continue;
      stillValid.push(item);

      const to = normalizePhone(item.phone);
      if (!to) continue;

      const friendlyDate = formatDate(item.appointmentDate);
      const firstName = (item.name || 'there').trim().split(/\s+/)[0];

      if (apptDate === inTwoDays && !item.sent2Day) {
        const body = `Reminder: Your Heritage Housing appointment is in 2 days (${friendlyDate}). Questions? Call 405-601-5650.`;
        try {
          await sendSms(accountSid, authToken, fromNumber, to, body);
          item.sent2Day = true;
          updated = true;
        } catch (e) {
          console.error('2-day SMS failed', item.id, e);
        }
      }
      if (apptDate === tomorrow && !item.sent1Day) {
        const body = `Reminder: Your Heritage Housing appointment is tomorrow (${friendlyDate}). We look forward to seeing you. Call 405-601-5650 with any questions.`;
        try {
          await sendSms(accountSid, authToken, fromNumber, to, body);
          item.sent1Day = true;
          updated = true;
        } catch (e) {
          console.error('1-day SMS failed', item.id, e);
        }
      }
    }

    if (updated) {
      await redisSet(url, token, JSON.stringify(stillValid));
    } else if (stillValid.length !== list.length) {
      await redisSet(url, token, JSON.stringify(stillValid));
    }

    res.status(200).json({ ok: true, checked: list.length, sent: updated });
  } catch (err) {
    console.error('sendUpcomingReminders', err);
    res.status(500).json({ error: 'Server error' });
  }
}
