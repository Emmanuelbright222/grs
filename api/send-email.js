// api/send-email.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send to forwarding email address
    await resend.emails.send({
      from: 'Grace Rhythm Sounds <info@gracerhythmsounds.com>',
      to: 'miztabrightstar@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Message from ${name}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    // Confirmation email to user
    await resend.emails.send({
      from: 'Grace Rhythm Sounds <info@gracerhythmsounds.com>',
      to: email,
      subject: 'We Received Your Message 🎶',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to Grace Rhythm Sounds. We’ve received your message and will get back to you soon.</p>
        <p>Stay inspired,<br>Grace Rhythm Sounds Team</p>
      `,
    });

    return res.status(200).json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error });
  }
}
