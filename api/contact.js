const nodemailer = require('nodemailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEnv(name) {
  return process.env[name] || process.env[name.toLowerCase()] || '';
}

function isTrue(value) {
  return String(value).toLowerCase() === 'true';
}

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

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransport() {
  const host = sanitize(getEnv('SMTP_HOST'));
  const port = Number(getEnv('SMTP_PORT'));
  const user = sanitize(getEnv('SMTP_USER'));
  const password = sanitize(getEnv('SMTP_PASSWORD'));

  if (!host || !port || !user || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isTrue(getEnv('SMTP_SECURE')),
    auth: {
      user,
      pass: password
    }
  });
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

  const transporter = createTransport();

  if (!transporter) {
    return res.status(500).json({ ok: false, message: 'Email service is not configured yet.' });
  }

  const fromName = sanitize(getEnv('SMTP_FROM_NAME')) || 'Toro Systems';
  const fromEmail = sanitize(getEnv('SMTP_FROM_EMAIL'));
  const fallbackReplyTo = sanitize(getEnv('SMTP_REPLY_TO'));

  if (!fromEmail) {
    return res.status(500).json({ ok: false, message: 'Email sender is not configured yet.' });
  }

  const to = sanitize(process.env.CONTACT_TO_EMAIL || '') || fromEmail;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      replyTo: email || fallbackReplyTo || undefined,
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
      html: [
        '<h2>New contact form submission from torosystems.ca</h2>',
        `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
        '<p><strong>Message:</strong></p>',
        `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
      ].join('')
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      message: 'We could not send your message right now. Please try again shortly.',
      detail: error.message
    });
  }

  return res.status(200).json({ ok: true });
};