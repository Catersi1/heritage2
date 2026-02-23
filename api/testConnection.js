/**
 * Simple ping test to Supabase
 * GET /api/testConnection
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    res.status(500).json({ error: 'Missing env vars' });
    return;
  }

  try {
    // Try to query the table
    const queryUrl = url.replace(/\/$/, '') + '/rest/v1/applications?select=id&limit=1';
    const result = await fetch(queryUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    
    const text = await result.text();
    
    res.status(200).json({
      status: result.status,
      response: text,
      url: url
    });
  } catch (err) {
    res.status(500).json({
      error: 'Fetch failed',
      message: err.message
    });
  }
}
