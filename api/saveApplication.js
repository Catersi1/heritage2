/**
 * Upserts one application (encrypted payload) into Supabase.
 * Uses Node https module instead of fetch
 */
import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('saveApplication called');
  console.log('URL present:', !!url);
  console.log('Key present:', !!key);
  
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
  console.log('Request body:', { id: id?.substring(0, 10), hasEncrypted: !!encrypted, submitted_at });
  
  if (!id || !encrypted || !submitted_at) {
    res.status(400).json({ error: 'Missing id, encrypted, or submitted_at' });
    return;
  }

  const postData = JSON.stringify({
    id: String(id),
    encrypted: String(encrypted),
    submitted_at: new Date(submitted_at).toISOString()
  });

  const hostname = url.replace('https://', '').replace(/\/$/, '');
  console.log('Connecting to:', hostname);
  
  const options = {
    hostname: hostname,
    port: 443,
    path: '/rest/v1/applications?on_conflict=id',
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => data += chunk);
    response.on('end', () => {
      console.log('Supabase response:', response.statusCode, data);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        res.status(200).json({ ok: true });
      } else {
        res.status(502).json({ 
          error: 'Failed to save application', 
          status: response.statusCode,
          details: data 
        });
      }
    });
  });

  request.on('error', (err) => {
    console.error('Request error:', err);
    res.status(500).json({ error: 'Request failed', message: err.message });
  });

  request.write(postData);
  request.end();
}
