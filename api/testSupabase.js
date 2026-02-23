/**
 * Simple test endpoint to verify Supabase connection
 * GET /api/testSupabase
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Check if env vars are set
  if (!url || !key) {
    res.status(500).json({ 
      error: 'Environment variables not set',
      hasUrl: !!url,
      hasKey: !!key
    });
    return;
  }

  // Try to query the table
  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/applications?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!r.ok) {
      const text = await r.text();
      res.status(502).json({
        error: 'Supabase query failed',
        status: r.status,
        response: text
      });
      return;
    }
    
    const data = await r.json();
    res.status(200).json({
      success: true,
      message: 'Supabase connection working',
      tableExists: true,
      rowCount: data.length
    });
  } catch (err) {
    res.status(500).json({
      error: 'Exception occurred',
      message: err.message
    });
  }
}
