/**
 * Send application via email using Resend with PDF attachment
 * POST /api/sendApplicationEmail
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'catersi1@gmail.com';
  
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

  const { application, customSubject, pdfBase64 } = body;
  
  if (!application) {
    res.status(400).json({ error: 'Missing application data' });
    return;
  }

  const a = application.applicant;
  const subject = customSubject || `Heritage Housing Credit Application - ${a?.firstName || ''} ${a?.lastName || ''}`;
  
  // Build email content
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
        <h1>Heritage Housing</h1>
        <p>Credit Application</p>
      </div>
      
      <div style="padding: 20px;">
        <p><strong>Application ID:</strong> ${application.id}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        
        <h2>Applicant Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.firstName || ''} ${a?.lastName || ''}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.email || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.phone || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date of Birth:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.dateOfBirth || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>SSN:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.ssn || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Address:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.address || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>City/State/ZIP:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.city || ''}, ${a?.state || ''} ${a?.zipCode || ''}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Monthly Income:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${a?.monthlyIncome || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Employment:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.employmentStatus || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Employer:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.employer || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Land Status:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.landStatus || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Bedrooms Needed:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.bedrooms || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Credit Estimate:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${a?.creditEstimate || 'N/A'}</td></tr>
        </table>
        
        ${application.appointmentDate ? `
        <hr/>
        <h2>Appointment Scheduled</h2>
        <p><strong>Date:</strong> ${new Date(application.appointmentDate).toLocaleString()}</p>
        ` : ''}
        
        ${application.documents?.length > 0 ? `
        <hr/>
        <h2>Documents Uploaded: ${application.documents.length}</h2>
        ` : ''}
      </div>
      
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>Heritage Housing Application System</p>
      </div>
    </div>
  `;

  try {
    console.log('Sending email via Resend...');
    
    const emailData = {
      from: 'onboarding@resend.dev',
      to: ADMIN_EMAIL,
      subject: subject,
      html: htmlContent
    };
    
    // Add PDF attachment if provided
    if (pdfBase64) {
      emailData.attachments = [{
        filename: `application-${application.id}.pdf`,
        content: pdfBase64
      }];
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    console.log('Resend response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      res.status(502).json({ error: 'Failed to send email', details: error });
      return;
    }

    const result = await response.json();
    console.log('Resend success:', result);
    res.status(200).json({ 
      success: true, 
      messageId: result.id 
    });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email', message: err.message });
  }
}
