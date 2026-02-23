/**
 * Debug endpoint to check if Supabase is configured
 * GET /api/debugConfig
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  res.status(200).json({
    supabaseUrl: url ? 'SET (hidden)' : 'NOT SET',
    supabaseKey: key ? 'SET (hidden)' : 'NOT SET',
    urlLength: url ? url.length : 0,
    keyLength: key ? key.length : 0
  });
}
