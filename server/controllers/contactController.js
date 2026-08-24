const { Resend } = require('resend');
const Enquiry    = require('../models/Enquiry');
const Batch      = require('../models/Batch');

// ── Resend HTTPS email client (Railway blocks SMTP, so we use the API) ──────
// Built on first use. The constructor throws when the key is missing, and
// doing that at require time took the whole API down instead of just this
// route — every endpoint died because contact email was misconfigured.
let resendClient = null;
const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

// Address emails are sent FROM — must be on a domain verified in Resend
const FROM_ADDRESS  = process.env.EMAIL_FROM  || 'ALS Trade <Sales@alswholesale.co.uk>';
// Address enquiry notifications are sent TO (your inbox)
const NOTIFY_TO     = process.env.EMAIL_USER  || 'Sales@alswholesale.co.uk';

// ── POST /api/contact ──────────────────────────────────────────────────────
const sendEnquiry = async (req, res) => {
  const { name, companyName, phone, email, message, batchSlug } = req.body;

  if (!name || !phone || !email || !message) {
    return res.status(400).json({ message: 'Name, phone, email and message are required' });
  }

  // ── 1. Save the enquiry. This is the step that decides the response: once
  // it lands the enquiry is a real lead, visible under Admin > Enquiries.
  let batchInfo = '';
  try {
    let batchRef = null;
    // Only look up a genuine slug. This body is unauthenticated, and without
    // the type guard an object like {"$regex":"^"} would reach Mongo as an
    // operator rather than a string — attaching the enquiry to an arbitrary
    // batch, or driving a regex scan across the collection. Slugs are always
    // slugify() output (lowercase, alphanumeric and hyphens), so anything
    // else is not a real reference and is simply ignored.
    if (typeof batchSlug === 'string' && /^[a-z0-9-]+$/.test(batchSlug)) {
      const batch = await Batch.findOne({ slug: batchSlug }).select('batchNumber title');
      if (batch) {
        batchRef  = batch._id;
        batchInfo = `<p><strong>Re batch:</strong> ${batch.batchNumber} — ${batch.title}</p>`;
      }
    }
    await Enquiry.create({ name, companyName, phone, email, message, batchRef });
  } catch (err) {
    console.error('Contact error — enquiry NOT saved:', err.message);
    return res.status(500).json({ message: 'Failed to send message. Please try again or contact us directly.' });
  }

  // ── 2. Email is a notification of something already recorded, so trouble
  // here is ours to chase, not the customer's. Telling them it failed only
  // gets the same enquiry sent again. Each send is attempted independently:
  // a failed confirmation must not suppress the notification, or vice versa.
  await sendEnquiryEmails({ name, companyName, phone, email, message, batchInfo });

  res.json({ message: 'Your message has been sent. We will contact you shortly.' });
};

// Sends the two enquiry emails, reporting failures to the log only.
const sendEnquiryEmails = async ({ name, companyName, phone, email, message, batchInfo }) => {
  const resend = getResend();
  if (!resend) {
    console.error('Contact email skipped — RESEND_API_KEY is not set. Enquiry WAS saved.');
    return;
  }

  const send = async (label, payload) => {
    try {
      const { error } = await resend.emails.send(payload);
      if (error) throw new Error(error.message || JSON.stringify(error));
    } catch (err) {
      console.error(`Contact email failed (${label}) — enquiry WAS saved:`, err.message);
    }
  };

  // Notification to A.L.S Trade
  await send('notify', {
    from:    FROM_ADDRESS,
    to:      NOTIFY_TO,
    replyTo: email,
    subject: `New enquiry — ${name}${companyName ? ` (${companyName})` : ''}`,
    html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #1a1a1a;">New enquiry via A.L.S Trade  website</h2>
          ${batchInfo}
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:8px 0; color:#666; width:130px;">Name</td><td style="padding:8px 0;"><strong>${name}</strong></td></tr>
            <tr><td style="padding:8px 0; color:#666;">Company</td><td style="padding:8px 0;">${companyName || '—'}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Phone</td><td style="padding:8px 0;">${phone}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          </table>
          <div style="margin-top:16px; padding:16px; background:#f5f5f5; border-radius:8px;">
            <p style="margin:0; color:#333;">${message.replace(/\n/g, '<br/>')}</p>
          </div>
        </div>
      `,
  });

  // Confirmation to the customer
  await send('confirm', {
    from:    FROM_ADDRESS,
    to:      email,
    subject: 'We received your message — A.L.S Trade',
    html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Thank you, ${name}!</h2>
          <p>We have received your message and will contact you as soon as possible.</p>
          <p>In the meantime you can also reach us directly:</p>
          <ul>
            <li>Phone / WhatsApp: <a href="tel:0203 747 1310">0203 747 1310</a></li>
            <li>Email: <a href="mailto:Sales@alswholesale.co.uk">Sales@alswholesale.co.uk</a></li>
          </ul>
          <p style="color:#666; font-size:13px;">A.L.S Trade  Ltd — Bizspace Business Park, Redfern Road, Birmingham B11 2AL, United Kingdom</p>
        </div>
      `,
  });
};

module.exports = { sendEnquiry };
