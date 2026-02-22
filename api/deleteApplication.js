/**
 * Deletes one application from Supabase by id.
 * GET or DELETE with query ?id=APP-123 (or body for DELETE).
 * Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  const id = req.query?.id || (req.method === 'DELETE' && typeof req.body === 'object' && req.body?.id) || '';
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('Supabase deleteApplication', r.status, t);
      res.status(502).json({ error: 'Failed to delete application' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('deleteApplication', err);
    res.status(500).json({ error: 'Server error' });
  }
}
