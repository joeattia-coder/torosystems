const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }

  return body;
}

function sanitize(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  const body = parseBody(req.body);
  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const subject = sanitize(body.subject);
  const message = sanitize(body.message);
  const company = sanitize(body.company);

  if (company) {
    return res.status(200).json({ ok: true });
  }

  if (name.length < 4) {
    return res.status(400).json({ ok: false, message: 'Please enter at least 4 characters for your name.' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
  }

  if (subject.length < 4) {
    return res.status(400).json({ ok: false, message: 'Please enter at least 4 characters for the subject.' });
  }

  if (message.length < 10) {
    return res.status(400).json({ ok: false, message: 'Please provide a little more detail in your message.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ ok: false, message: 'Email service is not configured yet.' });
  }

  const to = process.env.CONTACT_TO_EMAIL || 'joseph.attia@torosystems.ca';
  const from = process.env.CONTACT_FROM_EMAIL || 'noreply@torosystems.ca';

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Website Contact Form: ${subject}`,
      text: [
        'New contact form submission from torosystems.ca',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message
      ].join('\n'),
      html: `
        <h2>New contact form submission from torosystems.ca</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    })
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    return res.status(502).json({
      ok: false,
      message: 'We could not send your message right now. Please try again shortly.',
      detail: errorText
    });
  }

  return res.status(200).json({ ok: true });
};