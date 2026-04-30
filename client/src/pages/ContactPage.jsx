import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ContactPage.css';

const FAQ = [
  {
    q: 'Do you sell to private individuals?',
    a: 'No. We exclusively trade with registered businesses. All buyers must have a valid company registration.',
  },
  {
    q: 'How do I see the prices on listings?',
    a: 'Create a free company account and log in. Prices are shown instantly on every available batch.',
  },
  {
    q: 'Do you ship worldwide?',
    a: 'Yes. We export to buyers across Europe, Asia, North America and beyond. We handle all customs documentation.',
  },
  {
    q: 'Can I request a specific type of stock?',
    a: 'Absolutely. Send us a message with what you are looking for and we will let you know as soon as matching stock arrives.',
  },
  {
    q: 'Are item lists available for every batch?',
    a: 'Not always. Batches marked "NO List" do not have a per-unit breakdown. This is clearly shown on each listing.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept bank transfer (SEPA and SWIFT). Payment terms are confirmed per order.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <svg
          className="faq-arrow"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

export default function ContactPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name:        user?.name        || '',
    companyName: user?.companyName || '',
    phone:       '',
    email:       user?.email       || '',
    subject:     '',
    message:     '',
  });
  const [status, setStatus]   = useState('idle'); // idle | sending | sent | error
  const [errMsg, setErrMsg]   = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setStatus('sending');
    setErrMsg('');
    try {
      await api.post('/contact', form);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="contact-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="contact-hero">
        <div className="ch-bg" />
        <div className="container ch-inner">
          <div>
            <p className="section-eyebrow">Get in touch</p>
            <h1 className="ch-title">Contact us</h1>
            <p className="ch-sub">
              Questions about a batch? Looking for specific stock?<br />
              We respond fast — usually within a few hours.
            </p>
          </div>

          {/* Quick contact pills */}
          <div className="quick-contact">
            <a href="tel:0203 747 1310" className="qc-pill">
              <div className="qc-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
                </svg>
              </div>
              <div>
                <span className="qc-label">Call us</span>
                <span className="qc-value">0203 747 1310</span>
              </div>
            </a>

            <a href="mailto:info@alservices.org.uk" className="qc-pill">
              <div className="qc-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <span className="qc-label">Email us</span>
                <span className="qc-value">info@alservices.org.uk</span>
              </div>
            </a>

            <a
              href="https://wa.me/447911123456"
              target="_blank"
              rel="noreferrer"
              className="qc-pill qc-wa"
            >
              <div className="qc-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <span className="qc-label">WhatsApp</span>
                <span className="qc-value">Chat directly</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="container contact-body">

        {/* ══ LEFT: form + FAQ ═══════════════════════════════ */}
        <div className="contact-left">

          {/* ── Contact form ─────────────────────────────── */}
          <div className="form-card">
            <h2 className="form-card-title">Send us a message</h2>
            <p className="form-card-sub">
              We'll get back to you as soon as possible, usually within a few hours during business days.
            </p>

            {status === 'sent' ? (
              <div className="form-success">
                <div className="success-icon">✓</div>
                <h3>Message sent!</h3>
                <p>
                  Thank you for reaching out. We'll contact you at <strong>{form.email}</strong> as soon
                  as possible.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit} noValidate>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name">Your name <span className="req">*</span></label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handle}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="companyName">Company name <span className="req">*</span></label>
                    <input
                      id="companyName"
                      name="companyName"
                      value={form.companyName}
                      onChange={handle}
                      placeholder="Acme Ltd"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="email">Email address <span className="req">*</span></label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handle}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="phone">Phone number <span className="req">*</span></label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handle}
                      placeholder="+44 7700 900000"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handle}
                  >
                    <option value="">Select a subject…</option>
                    <option value="batch-enquiry">Enquiry about a specific batch</option>
                    <option value="stock-request">Stock request</option>
                    <option value="pricing">Pricing question</option>
                    <option value="shipping">Shipping &amp; logistics</option>
                    <option value="account">Account / registration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="message">Message <span className="req">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handle}
                    placeholder="Tell us what you're looking for or ask us anything…"
                    rows={5}
                    required
                  />
                </div>

                {status === 'error' && (
                  <div className="form-error-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errMsg}
                  </div>
                )}

                <div className="form-footer">
                  <p className="form-note">
                    <span className="req">*</span> Required fields.
                    We only do business with registered companies.
                  </p>
                  <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <>
                        <span className="spinner" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

          {/* ── FAQ ──────────────────────────────────────── */}
          <div className="faq-card">
            <h2 className="faq-title">Frequently asked questions</h2>
            <div className="faq-list">
              {FAQ.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>

        </div>

        {/* ══ RIGHT: details + map ════════════════════════ */}
        <aside className="contact-right">

          {/* Info card */}
          <div className="info-card">
            <h3 className="info-card-title">Contact details</h3>

            <div className="info-rows">
              <div className="info-row">
                <div className="info-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
                  </svg>
                </div>
                <div>
                  <span className="info-row-label">Phone / WhatsApp</span>
                  <a href="tel:0203 747 1310" className="info-row-value">
                    0203 747 1310
                  </a>
                </div>
              </div>

              <div className="info-row">
                <div className="info-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <span className="info-row-label">Email</span>
                  <a href="mailto:info@alservices.org.uk" className="info-row-value">
                    info@alservices.org.uk
                  </a>
                </div>
              </div>

              <div className="info-row">
                <div className="info-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <span className="info-row-label">Address</span>
                  <span className="info-row-value">
                    Unit 11a Waterhall Farm<br />
                    Hertford SG138LE<br />
                    United Kingdom
                  </span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <span className="info-row-label">Visiting hours</span>
                  <span className="info-row-value">By appointment only</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                </div>
                <div>
                  <span className="info-row-label">Company</span>
                  <span className="info-row-value">
                    A.L.S Trade  Ltd<br />
                    Company No: 12345678<br />
                    VAT: GB123456789
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/447911123456"
              target="_blank"
              rel="noreferrer"
              className="wa-cta"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Map embed */}
          <div className="map-card">
            <div className="map-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Unit 11a Waterhall Farm, Hertford SG138LE, United Kingdom
            </div>
            <iframe
              title="A.L.S Trade  location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.5!2d6.051!3d51.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDIzJzI0LjAiTiA2wrAwMycwMy42IkU!5e0!3m2!1sen!2snl!4v1700000000000"
              width="100%"
              height="260"
              style={{ border: 0, borderRadius: '0 0 6px 6px', display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Response time card */}
          <div className="response-card">
            <div className="rc-row">
              <div className="rc-dot green" />
              <div>
                <p className="rc-heading">Typical response time</p>
                <p className="rc-body">Within a few hours on business days</p>
              </div>
            </div>
            <div className="rc-row">
              <div className="rc-dot amber" />
              <div>
                <p className="rc-heading">WhatsApp</p>
                <p className="rc-body">Fastest way to reach us for urgent enquiries</p>
              </div>
            </div>
            <div className="rc-row">
              <div className="rc-dot blue" />
              <div>
                <p className="rc-heading">New stock notifications</p>
                <p className="rc-body">Register free and we'll alert you when new batches arrive</p>
              </div>
            </div>
          </div>

        </aside>
      </div>

    </main>
  );
}
