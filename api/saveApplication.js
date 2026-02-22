/**
 * Upserts one application (encrypted payload) into Supabase.
 * POST body: { id, encrypted, submitted_at }
 * Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (_) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const { id, encrypted, submitted_at } = body;
  if (!id || !encrypted || !submitted_at) {
    res.status(400).json({ error: 'Missing id, encrypted, or submitted_at' });
    return;
  }

  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/applications?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: String(id),
        encrypted: String(encrypted),
        submitted_at: new Date(submitted_at).toISOString()
      })
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('Supabase saveApplication', r.status, t);
      res.status(502).json({ error: 'Failed to save application' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('saveApplication', err);
    res.status(500).json({ error: 'Server error' });
  }
}
