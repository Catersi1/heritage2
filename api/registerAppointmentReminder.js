/**
 * Registers an appointment for 1-day and 2-day reminder SMS.
 * Stores in Upstash Redis. Set in Vercel env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */
const KEY = 'hh:appt_reminders';

async function redisGet(url, token) {
  const r = await fetch(`${url}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

async function redisSet(url, token, value) {
  const body = JSON.stringify(['SET', KEY, value]);
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    res.status(200).json({ ok: true, skipped: 'no Redis config' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (_) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const { phone, name, appointmentDate, applicationId } = body;
  if (!phone || !appointmentDate || !applicationId) {
    res.status(400).json({ error: 'Missing phone, appointmentDate, or applicationId' });
    return;
  }

  const item = {
    id: applicationId,
    phone: String(phone).trim(),
    name: String(name || '').trim(),
    appointmentDate: String(appointmentDate).trim(),
    sent2Day: false,
    sent1Day: false
  };

  try {
    const raw = await redisGet(url, token);
    const list = raw ? JSON.parse(raw) : [];
    const existing = list.findIndex((x) => x.id === applicationId);
    if (existing >= 0) list[existing] = item;
    else list.push(item);
    await redisSet(url, token, JSON.stringify(list));
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('registerAppointmentReminder', err);
    res.status(500).json({ error: 'Server error' });
  }
}
