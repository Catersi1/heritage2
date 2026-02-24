export default async function handler(req, res) {
  try {
    // Test a simple fetch to Supabase health endpoint
    const testUrl = 'https://pxxcvjunczrzpbjszerz.supabase.co/health';
    const result = await fetch(testUrl);
    res.status(200).json({
      success: true,
      status: result.status,
      testUrl: testUrl
    });
  } catch (e) {
    res.status(500).json({
      error: 'Fetch failed',
      message: e.message,
      name: e.name,
      stack: e.stack?.split('\n')[0]
    });
  }
}
