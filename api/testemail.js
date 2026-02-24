export default async function handler(req, res) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  
  console.log('Test email endpoint called');
  console.log('API Key present:', !!RESEND_API_KEY);
  console.log('Admin email:', ADMIN_EMAIL);
  
  if (!RESEND_API_KEY) {
    res.status(500).json({ error: 'No API key' });
    return;
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ADMIN_EMAIL,
        subject: 'Test Email from Heritage Housing',
        html: '<h1>Test Email</h1><p>If you see this, email is working!</p>'
      })
    });
    
    const result = await response.json();
    console.log('Resend response:', response.status, result);
    
    if (!response.ok) {
      res.status(502).json({ error: 'Resend failed', status: response.status, result });
      return;
    }
    
    res.status(200).json({ success: true, messageId: result.id });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
}
