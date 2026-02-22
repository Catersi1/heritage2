/**
 * Returns all applications from Supabase (encrypted payloads).
 * Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/applications?select=id,encrypted,submitted_at&order=submitted_at.desc`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('Supabase getApplications', r.status, t);
      res.status(502).json({ error: 'Failed to load applications' });
      return;
    }
    const data = await r.json();
    res.status(200).json(data || []);
  } catch (err) {
    console.error('getApplications', err);
    res.status(500).json({ error: 'Server error' });
  }
}
