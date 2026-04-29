import { Link } from 'react-router-dom';
import './HowItWorksPage.css';

const STEPS = [
  {
    num:   '01',
    title: 'Register for free',
    body:  'Create your company account in under two minutes. Fill in your name, company details and contact information. No credit card, no subscription fee — registration is completely free.',
    detail: [
      'Valid company registration required',
      'Instant access after sign-up',
      'No hidden fees or obligations',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
    cta: { label: 'Register now', to: '/sign-up' },
  },
  {
    num:   '02',
    title: 'Browse available stock',
    body:  'Once logged in, browse our full catalogue of available batches with live pricing on every listing. Filter by category, condition grade and whether an item list is available.',
    detail: [
      'Laptops, phones, tablets and mixed batches',
      'Live pricing visible after login',
      'Filter by tested / untested, grade, category',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    cta: { label: 'View stock', to: '/available-stock' },
  },
  {
    num:   '03',
    title: 'Enquire about a batch',
    body:  'Found something you want? Send an enquiry directly from the batch listing page or message us on WhatsApp. We respond fast — usually within a few hours on business days.',
    detail: [
      'Enquiry form on every listing',
      'WhatsApp for fast communication',
      'Response within a few hours',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    cta: { label: 'Contact us', to: '/contact' },
  },
  {
    num:   '04',
    title: 'We agree and invoice',
    body:  'Once we confirm availability and you agree to the price, we issue a formal invoice. We only accept payment from registered businesses. Payment is by bank transfer (SEPA or SWIFT).',
    detail: [
      'Formal invoice issued per order',
      'Bank transfer only (SEPA / SWIFT)',
      'VAT invoice provided',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="12" y2="17"/>
      </svg>
    ),
  },
  {
    num:   '05',
    title: 'Shipment & logistics',
    body:  'After payment is confirmed, we arrange shipment. We ship worldwide and handle all customs documentation. You receive tracking details as soon as the batch leaves our warehouse.',
    detail: [
      'Worldwide export',
      'Full customs documentation',
      'Tracking provided on dispatch',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    num:   '06',
    title: 'Deal done',
    body:  'You receive your batch. Job done. Many of our buyers return regularly for new stock. Register once, buy as many times as you like.',
    detail: [
      'No repeat registration needed',
      'Return buyers welcomed',
      'New batches added every week',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    cta: { label: 'View available stock', to: '/available-stock' },
  },
];

const FAQS = [
  {
    q: 'How long does shipping take?',
    a: 'Transit times depend on destination. European buyers typically receive within 3–7 business days. International shipments vary by location and customs clearance.',
  },
  {
    q: 'Can I inspect the batch before buying?',
    a: 'Visiting our warehouse is possible by prior appointment. We are located in Derby, United Kingdom. Contact us to arrange a visit.',
  },
  {
    q: 'What does "No List" mean?',
    a: 'Some batches do not come with a per-unit item list. This means we cannot provide a detailed breakdown of every individual unit. The overall batch description and quantity are always provided.',
  },
  {
    q: 'What does Grade A / B / C mean?',
    a: 'Grade A: cosmetically near-perfect, fully functional. Grade B: light wear, fully functional. Grade C: heavy wear or cosmetic damage, may have functional issues. Untested batches have not been graded.',
  },
  {
    q: 'Do you offer partial batches?',
    a: 'No. We sell batches as a whole. We do not split batches or sell individual units.',
  },
  {
    q: 'What happens if items in the batch are faulty?',
    a: 'Untested and Grade C batches are sold as-is with no guarantee on working condition. Tested batches include a condition grade. Any known issues are stated in the batch description.',
  },
];

import { useState } from 'react';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`hiw-faq-item ${open ? 'open' : ''}`}>
      <button className="hiw-faq-q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <svg className="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <p className="hiw-faq-a">{a}</p>}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="hiw-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="hiw-hero">
        <div className="hiw-hero-bg" />
        <div className="container hiw-hero-inner">
          <div className="hiw-hero-text">
            <p className="section-eyebrow">Simple process</p>
            <h1 className="hiw-hero-title">How it works</h1>
            <p className="hiw-hero-sub">
              From registration to receiving your batch — six straightforward
              steps. No complexity, no surprises.
            </p>
            <div className="hiw-hero-actions">
              <Link to="/sign-up" className="btn btn-primary">
                Register free
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/available-stock" className="btn btn-outline">
                View stock
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* ── Steps ────────────────────────────────────────────── */}
      <section className="hiw-steps-section">
        <div className="container">
          <div className="steps-list">
            {STEPS.map((step, i) => (
              <div key={i} className={`step-row ${i % 2 === 1 ? 'reverse' : ''}`}>

                {/* Number + connector */}
                <div className="step-spine">
                  <div className="step-circle">
                    <span className="step-circle-num">{step.num}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="step-line" />}
                </div>

                {/* Content card */}
                <div className="step-card">
                  <div className="step-card-icon">{step.icon}</div>
                  <div className="step-card-body">
                    <h3 className="step-card-title">{step.title}</h3>
                    <p className="step-card-desc">{step.body}</p>
                    <ul className="step-card-details">
                      {step.detail.map((d, j) => (
                        <li key={j}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {d}
                        </li>
                      ))}
                    </ul>
                    {step.cta && (
                      <Link to={step.cta.to} className="step-cta">
                        {step.cta.label} →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div className="step-spacer" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Condition grades explainer ───────────────────────── */}
      <section className="grades-section">
        <div className="container">
          <div className="section-header centered">
            <p className="section-eyebrow">Condition guide</p>
            <h2 className="section-title">Understanding batch grades</h2>
          </div>
          <div className="grades-grid">
            {[
              {
                grade: 'A',
                label: 'Grade A',
                color: 'green',
                desc:  'Cosmetically near-perfect. Minor signs of use at most. Fully functional. Best condition available.',
                eg:    'Light cosmetic marks only',
              },
              {
                grade: 'B',
                label: 'Grade B',
                color: 'amber',
                desc:  'Visible signs of use — scratches, scuffs or light wear. Fully functional. Good value.',
                eg:    'Scratches, normal wear',
              },
              {
                grade: 'C',
                label: 'Grade C',
                color: 'red',
                desc:  'Heavy cosmetic damage. May have functional issues. Sold as-is at the lowest price point.',
                eg:    'Cracks, heavy damage',
              },
              {
                grade: '?',
                label: 'Untested',
                color: 'gray',
                desc:  'Batch has not been individually tested or graded. Condition unknown per unit. Buyer assumes risk.',
                eg:    'No individual testing',
              },
            ].map(g => (
              <div key={g.grade} className={`grade-card grade-${g.color}`}>
                <div className="grade-badge">{g.grade}</div>
                <h3 className="grade-label">{g.label}</h3>
                <p className="grade-desc">{g.desc}</p>
                <p className="grade-eg">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {g.eg}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="hiw-faq-section">
        <div className="container hiw-faq-inner">
          <div className="hiw-faq-left">
            <p className="section-eyebrow">Common questions</p>
            <h2 className="section-title">FAQ</h2>
            <p className="hiw-faq-intro">
              Still have questions? Reach out directly and we'll answer fast.
            </p>
            <Link to="/contact" className="btn btn-outline" style={{marginTop:'1rem'}}>
              Ask us anything →
            </Link>
          </div>
          <div className="hiw-faq-list">
            {FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="hiw-cta">
        <div className="container hiw-cta-inner">
          <div>
            <h2 className="hiw-cta-title">Ready to start?</h2>
            <p className="hiw-cta-sub">
              Create your free company account and start browsing stock in minutes.
            </p>
          </div>
          <div className="hiw-cta-btns">
            <Link to="/sign-up" className="btn btn-primary">Register free</Link>
            <Link to="/available-stock" className="btn btn-outline-dark">Browse stock first</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
