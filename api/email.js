export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html } = req.body;
  const resendKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!resendKey) {
    return res.status(500).json({ error: 'Missing Resend API Key' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: 'Wedding Invitation <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
