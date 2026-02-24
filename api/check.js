export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    res.status(500).json({ 
      error: 'Missing env vars',
      hasUrl: !!url,
      hasKey: !!key
    });
    return;
  }

  try {
    const result = await fetch(url + '/rest/v1/applications?select=id&limit=1', {
      headers: { 
        'apikey': key, 
        'Authorization': `Bearer ${key}` 
      }
    });
    
    const text = await result.text();
    res.status(200).json({ 
      status: result.status,
      ok: result.ok,
      response: text
    });
  } catch (e) {
    res.status(500).json({ 
      error: 'Fetch failed', 
      message: e.message,
      url: url.replace(/\/\/[^.]+\./, '//***.')
    });
  }
}
