/**
 * Test with explicit error details
 * GET /api/testSupabase2
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
    const queryUrl = url.replace(/\/$/, '') + '/rest/v1/applications?select=id&limit=1';
    
    const result = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    const text = await result.text();
    
    res.status(200).json({
      success: result.ok,
      status: result.status,
      statusText: result.statusText,
      response: text
    });
  } catch (err) {
    res.status(500).json({
      error: 'Exception',
      name: err.name,
      message: err.message
    });
  }
}
