const https = require('https');

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    res.status(500).json({ error: 'Missing env vars' });
    return;
  }

  const options = {
    hostname: url.replace('https://', '').replace(/\/$/, ''),
    path: '/rest/v1/applications?select=id&limit=1',
    method: 'GET',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => data += chunk);
    response.on('end', () => {
      res.status(200).json({
        status: response.statusCode,
        data: data
      });
    });
  });

  request.on('error', (e) => {
    res.status(500).json({
      error: 'Request failed',
      message: e.message,
      code: e.code
    });
  });

  request.end();
}
