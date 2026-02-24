export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  res.status(200).json({
    hasUrl: !!url,
    hasKey: !!key,
    url: url || 'NOT SET',
    keyFirst20: key ? key.substring(0, 20) : 'NOT SET'
  });
}
