/**
 * Send application via email using Resend
 * POST /api/sendApplicationEmail
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mizaelpena@hardysprouts.com';
  
  if (!RESEND_API_KEY) {
    res.status(500).json({ error: 'Resend API key not configured' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (_) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const { application, documents } = body;
  
  if (!application) {
    res.status(400).json({ error: 'Missing application data' });
    return;
  }

  // Build email content
  const subject = `New Heritage Housing Application - ${application.applicant?.name || 'Unknown'}`;
  
  let htmlContent = `
    <h1>New Heritage Housing Application</h1>
    <p><strong>Application ID:</strong> ${application.id}</p>
    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    <hr/>
    <h2>Applicant Information</h2>
  `;

  // Add applicant data
  if (application.applicant) {
    const a = application.applicant;
    htmlContent += `
      <p><strong>Name:</strong> ${a.name || 'N/A'}</p>
      <p><strong>Email:</strong> ${a.email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${a.phone || 'N/A'}</p>
      <p><strong>Monthly Income:</strong> $${a.monthlyIncome || 'N/A'}</p>
      <p><strong>Employment Status:</strong> ${a.employmentStatus || 'N/A'}</p>
    `;
  }

  // Add documents info
  if (documents && documents.length > 0) {
    htmlContent += `
      <hr/>
      <h2>Documents Attached</h2>
      <ul>
    `;
    documents.forEach(doc => {
      htmlContent += `<li>${doc.type}: ${doc.name} (${Math.round(doc.size / 1024)}KB)</li>`;
    });
    htmlContent += `</ul>`;
  }

  try {
    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Heritage Housing <onboarding@resend.dev>',
        to: ADMIN_EMAIL,
        subject: subject,
        html: htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      res.status(502).json({ error: 'Failed to send email', details: error });
      return;
    }

    const result = await response.json();
    res.status(200).json({ 
      success: true, 
      messageId: result.id 
    });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email', message: err.message });
  }
}
