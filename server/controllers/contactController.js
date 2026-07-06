const { Resend } = require('resend');
const Enquiry    = require('../models/Enquiry');
const Batch      = require('../models/Batch');

// ── Resend HTTPS email client (Railway blocks SMTP, so we use the API) ──────
const resend = new Resend(process.env.RESEND_API_KEY);

// Address emails are sent FROM — must be on a domain verified in Resend
const FROM_ADDRESS  = process.env.EMAIL_FROM  || 'ALS Trade <Sales@alswholesale.co.uk>';
// Address enquiry notifications are sent TO (your inbox)
const NOTIFY_TO     = process.env.EMAIL_USER  || 'Sales@alswholesale.co.uk';

// ── POST /api/contact ──────────────────────────────────────────────────────
const sendEnquiry = async (req, res) => {
  try {
    const { name, companyName, phone, email, message, batchSlug } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ message: 'Name, phone, email and message are required' });
    }

    // Optionally resolve batch reference
    let batchRef  = null;
    let batchInfo = '';
    if (batchSlug) {
      const batch = await Batch.findOne({ slug: batchSlug }).select('batchNumber title');
      if (batch) {
        batchRef  = batch._id;
        batchInfo = `<p><strong>Re batch:</strong> ${batch.batchNumber} — ${batch.title}</p>`;
      }
    }

    // 1. Save enquiry to database
    await Enquiry.create({ name, companyName, phone, email, message, batchRef });

    // 2. Send email notification to A.L.S Trade
    const notify = await resend.emails.send({
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
    if (notify.error) throw new Error(`Resend (notify): ${notify.error.message || JSON.stringify(notify.error)}`);

    // 3. Send confirmation email to the customer
    const confirm = await resend.emails.send({
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
    if (confirm.error) throw new Error(`Resend (confirm): ${confirm.error.message || JSON.stringify(confirm.error)}`);

    res.json({ message: 'Your message has been sent. We will contact you shortly.' });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ message: 'Failed to send message. Please try again or contact us directly.' });
  }
};

module.exports = { sendEnquiry };
