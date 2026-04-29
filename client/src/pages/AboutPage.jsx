import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './AboutPage.css';

/* ── Animated counter hook ───────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);

  return count;
}

/* ── Single animated stat ────────────────────────────────── */
function AnimatedStat({ target, suffix, label, delay = 0 }) {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(target, 1800, started);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
        { threshold: 0.3 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Format 100000 as 100K
  const display = target >= 1000
    ? Math.floor(count / 1000) + 'K'
    : count;

  return (
    <div className="number-item" ref={ref}>
      <span className="number-val">
        {display}{suffix}
      </span>
      <span className="number-label">{label}</span>
    </div>
  );
}

const VALUES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: 'Honest trading',
    body:  'What you see is what you get. Every batch listing is accurate — condition, quantity, whether a list is available. No surprises when your shipment arrives.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'B2B relationships',
    body:  'We are not a marketplace. We are a trading company. We know our buyers by name and build long-term relationships built on trust, repeat business and fair prices.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Fast execution',
    body:  'We move quickly. New stock is listed as soon as it arrives. Enquiries are answered within hours. Invoices go out the same day. Shipments leave as soon as payment clears.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
        <circle cx="12" cy="12" r="9"/>
      </svg>
    ),
    title: 'Global reach',
    body:  'We have shipped to buyers across Europe, Asia and beyond. We handle customs documentation ourselves so you do not have to deal with the complexity of cross-border logistics.',
  },
];

const NUMBERS = [
  { target: 500,   suffix: '+',  label: 'Batches sold'      },
  { target: 20,    suffix: '+',  label: 'Countries reached' },
  { target: 5,     suffix: '+',  label: 'Years active'      },
  { target: 100000,suffix: '+',  label: 'Units moved'       },
];

export default function AboutPage() {
  return (
    <main className="about-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="about-hero">
        <div className="container">
          <div className="ah-inner">

            {/* Left — eyebrow + title + tags */}
            <div className="ah-left">
              <p className="section-eyebrow">Who we are</p>
              <h1 className="ah-title">About Us</h1>
              <div className="ah-tags">
                {['B2B Wholesale','IT Hardware','UK Based','Est. 2019'].map(t => (
                  <span key={t} className="ah-tag">{t}</span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="ah-divider" />

            {/* Right — intro text + highlights */}
            <div className="ah-right">
              <p className="ah-intro">
                We are a B2B wholesale company specialising in bulk IT hardware —
                laptops, phones and tablets, sourced and resold by the batch to businesses
                worldwide. Founded on the idea that surplus technology should find a second
                life, not a landfill.
              </p>
              <div className="ah-highlights">
                {[
                  { icon: '📦', text: 'Laptops, phones & tablets' },
                  { icon: '🌍', text: 'Worldwide export' },
                  { icon: '🏢', text: 'Registered businesses only' },
                ].map((h, i) => (
                  <div key={i} className="ah-highlight">
                    <span className="ah-highlight-icon">{h.icon}</span>
                    <span>{h.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── Numbers bar ──────────────────────────────────────── */}
      <div className="numbers-bar">
        <div className="container numbers-inner">
          {NUMBERS.map((n, i) => (
            <AnimatedStat
              key={i}
              target={n.target}
              suffix={n.suffix}
              label={n.label}
              delay={i * 150}
            />
          ))}
        </div>
      </div>

      {/* ── Story section ────────────────────────────────────── */}
      <section className="story-section">
        <div className="container story-inner">

          {/* Left: text */}
          <div className="story-text">
            <p className="section-eyebrow">Our story</p>
            <h2 className="story-title">Started with one batch.<br/>Built from there.</h2>

            <p>
              Derby Wholesale was founded in the United Kingdom with a straightforward mission:
              connect businesses that have surplus IT hardware with businesses that need it,
              at fair prices, with no unnecessary complexity.
            </p>
            <p>
              We started small — buying and selling single batches, learning the market,
              building supplier relationships. Over time we grew our network, expanded to
              international buyers, and developed a reputation for honest, accurate listings
              and fast execution.
            </p>
            <p>
              Today we handle hundreds of batches a year across every major IT category.
              Our buyers range from small repair shops to large resellers and refurbishers
              in over 20 countries.
            </p>
            <p>
              We are based in Derby, United Kingdom. We are a lean team — not a faceless
              platform. When you contact us, you speak to the person who knows the stock.
            </p>
          </div>

          {/* Right: info card */}
          <div className="story-card">
            <div className="story-card-header">
              <div className="sc-logo">
                <span className="logo-dw">DW</span>
                <div>
                  <p className="sc-company">Derby Wholesale Ltd</p>
                  <p className="sc-tagline">Bulk IT Hardware</p>
                </div>
              </div>
            </div>

            <div className="sc-rows">
              {[
                { label: 'Founded',     value: 'United Kingdom' },
                { label: 'Sector',      value: 'B2B IT Hardware Wholesale' },
                { label: 'Speciality',  value: 'Laptops, phones, tablets' },
                { label: 'Coverage',    value: 'Worldwide export' },
                { label: 'Customers',   value: 'Registered businesses only' },
                { label: 'Company No',         value: '12345678' },
                { label: 'VAT',         value: 'GB123456789' },
              ].map((r, i) => (
                <div key={i} className="sc-row">
                  <span className="sc-row-label">{r.label}</span>
                  <span className="sc-row-value">{r.value}</span>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/447911123456"
              target="_blank"
              rel="noreferrer"
              className="sc-wa"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────── */}
      <section className="values-section">
        <div className="container">
          <div className="values-header">
            <p className="section-eyebrow">How we operate</p>
            <h2 className="section-title">What we stand for</h2>
          </div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-body">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we trade ────────────────────────────────────── */}
      <section className="trade-section">
        <div className="container">
          <div className="trade-header">
            <p className="section-eyebrow">Our inventory</p>
            <h2 className="section-title">What we trade</h2>
          </div>
          <div className="trade-grid">
            {[
              {
                icon: '💻',
                cat:  'Laptops',
                desc: 'Business laptops from HP, Dell, Lenovo, Apple and more. Single-brand and mixed batches, ranging from modern ultrabooks to older enterprise models.',
                brands: ['HP', 'Dell', 'Lenovo', 'Apple', 'Toshiba', 'Asus', 'Acer'],
              },
              {
                icon: '📱',
                cat:  'Phones',
                desc: 'Smartphones in bulk — Apple iPhones, Samsung Galaxy and more. Tested and untested lots, with or without item lists.',
                brands: ['Apple', 'Samsung', 'Huawei', 'Nokia', 'Mixed'],
              },
              {
                icon: '📲',
                cat:  'Tablets',
                desc: 'iPads, Android tablets and business tablets in bulk. Mixed and single-brand batches with full condition information.',
                brands: ['Apple iPad', 'Samsung Tab', 'Lenovo Tab', 'Mixed'],
              },
              {
                icon: '📦',
                cat:  'Mixed batches',
                desc: 'Multi-category batches combining laptops, phones and tablets. Best value per unit for buyers who want volume.',
                brands: ['Mixed brands', 'Various models'],
              },
            ].map((t, i) => (
              <div key={i} className="trade-card">
                <div className="trade-icon">{t.icon}</div>
                <h3 className="trade-cat">{t.cat}</h3>
                <p className="trade-desc">{t.desc}</p>
                <div className="trade-brands">
                  {t.brands.map((b, j) => (
                    <span key={j} className="brand-chip">{b}</span>
                  ))}
                </div>
                <Link
                  to={`/available-stock?category=${t.cat.toLowerCase().split(' ')[0]}`}
                  className="trade-link"
                >
                  Browse {t.cat.toLowerCase()} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ─────────────────────────────────────────── */}
      <section className="location-section">
        <div className="container location-inner">
          <div className="location-text">
            <p className="section-eyebrow">Where we are</p>
            <h2 className="section-title">Based in the United Kingdom</h2>
            <p className="location-body">
              Our warehouse and offices are located in Derby, in the East Midlands,
              United Kingdom. Centrally positioned in the UK for efficient
              shipping across the continent and beyond.
            </p>
            <p className="location-body">
              Visits are by appointment only. If you would like to inspect a batch
              in person before purchasing, contact us to arrange a suitable time.
            </p>
            <div className="location-details">
              <div className="ld-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                123 High Street, Derby DE1 1AA, United Kingdom
              </div>
              <div className="ld-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                </svg>
                +44 7911 123456
              </div>
              <div className="ld-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                info@yourdomain.com
              </div>
            </div>
            <div className="location-actions">
              <Link to="/contact" className="btn btn-outline">Contact us</Link>
              <a
                href="https://wa.me/447911123456"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{background:'#25D366', gap:'8px'}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="location-map">
            <iframe
              title="Derby Wholesale location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.5!2d6.051!3d51.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDIzJzI0LjAiTiA2wrAwMycwMy42IkU!5e0!3m2!1sen!2snl!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', minHeight: '360px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="about-cta">
        <div className="container about-cta-inner">
          <div>
            <h2 className="about-cta-title">Ready to do business?</h2>
            <p className="about-cta-sub">
              Register your company for free and start browsing live stock with full pricing.
            </p>
          </div>
          <div className="about-cta-btns">
            <Link to="/sign-up"          className="btn btn-primary">Register free</Link>
            <Link to="/available-stock"  className="btn btn-outline-dark">View stock</Link>
            <Link to="/contact"          className="btn btn-outline-dark">Contact us</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
