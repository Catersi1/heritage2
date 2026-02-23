/**
 * Debug endpoint to check exact env var values
 * GET /api/debugEnv
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  res.status(200).json({
    hasUrl: !!url,
    hasKey: !!key,
    urlStart: url ? url.substring(0, 30) + '...' : 'NOT SET',
    keyStart: key ? key.substring(0, 50) + '...' : 'NOT SET',
    keyLength: key ? key.length : 0,
    keyHasSpaces: key ? (key !== key.trim()) : false
  });
}
