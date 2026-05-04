import QRCode from 'qrcode';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, qrData } = req.body;
  const resendKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!resendKey) {
    return res.status(500).json({ error: 'Missing Resend API Key' });
  }

  try {
    let finalHtml = html;
    let attachments = [];

    // If QR data is provided, generate a high-quality QR code
    if (qrData) {
      // 2026 Gold Standard: High-density PNG with Error Correction Level H
      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 4,
        scale: 10,
        width: 400,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Add to attachments for CID referencing
      attachments.push({
        filename: 'ticket-qr.png',
        content: qrCodeBuffer.toString('base64'),
        content_type: 'image/png',
        disposition: 'inline',
        content_id: 'ticket-qr'
      });

      // Replace placeholder in HTML if it exists
      finalHtml = html.replace('{{QR_CODE_DATA_URL}}', 'cid:ticket-qr');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: 'Digital Luxe Wedding <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: finalHtml,
        attachments: attachments
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
