import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import BatchCard from '../components/BatchCard';
import './HomePage.css';

/* ── Animated counter ────────────────────────────────────────── */
function CountUp({ target, suffix = '+', duration = 1600 }) {
  const [count, setCount]   = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || target === 0) return;
    let startTime = null;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Static data for sections that don't need the backend ─── */
const USPs = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: 'Verified B2B only',
    body: 'We exclusively trade with registered companies. Every account is manually verified before access is granted.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    title: 'Fast turnaround',
    body: 'Stock moves quickly. New batches listed weekly. Enquire the same day to avoid missing out.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
        <circle cx="12" cy="12" r="9"/>
      </svg>
    ),
    title: 'Worldwide shipping',
    body: 'We export to buyers across Europe, Asia and beyond. Full customs documentation provided.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    ),
    title: 'Transparent listings',
    body: 'Every batch shows exact quantity, condition grade, tested/untested status, and item lists where available.',
  },
];

const HOW_IT_WORKS = [
  { num: '01', title: 'Register free',    body: 'Create your company account in 2 minutes. No fees, no obligations.' },
  { num: '02', title: 'Browse stock',     body: 'View all available batches with full specs, condition grades and pricing.' },
  { num: '03', title: 'Enquire directly', body: 'Contact us via WhatsApp or the contact form for the batch you want.' },
  { num: '04', title: 'Deal closed',      body: 'We arrange logistics, invoicing and shipping. Simple and fast.' },
];

export default function HomePage() {
  const [latestBatches, setLatestBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [stats, setStats] = useState({ available: 0, sold: 0, countries: '20+' });

  useEffect(() => {
    /* Fetch the 3 most recent available batches for the preview */
    api.get('/batches?limit=3')
      .then(({ data }) => {
        setLatestBatches(data.slice(0, 3));
        setStats(s => ({ ...s, available: data.length }));
      })
      .catch(() => {})
      .finally(() => setLoadingBatches(false));
  }, []);

  return (
    <main className="home">

      {/* ═══════════ HERO ═══════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
        </div>

        <div className="container hero-content">

          <h1 className="hero-title fade-up delay-1">
            Bulk IT stock<br/>
            <span className="hero-accent">at trade prices.</span>
          </h1>

          <p className="hero-sub fade-up delay-2">
            Laptops, phones and tablets — by the batch.<br/>
            Sourced, graded and sold to businesses worldwide.
          </p>

          <div className="hero-actions fade-up delay-3">
            <Link to="/available-stock" className="btn btn-primary hero-btn">
              View available stock
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/sign-up" className="btn btn-outline hero-btn">
              Register free
            </Link>
          </div>

          {/* Hero stats — Batches sold first, then available, then countries */}
          <div className="hero-stats fade-up delay-4">
            <div className="hero-stat">
              <span className="stat-value"><CountUp target={500} /></span>
              <span className="stat-label">Batches sold</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-value"><CountUp target={stats.available || 0} /></span>
              <span className="stat-label">Batches available</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-value"><CountUp target={20} /></span>
              <span className="stat-label">Countries served</span>
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ═══════════ CATEGORIES STRIP ═══════════════════════════ */}
      <section className="categories-strip">
        <div className="container cat-inner">
          {[
            { label: 'Laptops',  icon: '💻', slug: 'laptops'  },
            { label: 'Phones',   icon: '📱', slug: 'phones'   },
            { label: 'Tablets',  icon: '📲', slug: 'tablets'  },
            { label: 'Mixed',    icon: '📦', slug: 'mixed'    },
          ].map(cat => (
            <Link
              key={cat.slug}
              to={`/available-stock?category=${cat.slug}`}
              className="cat-chip"
            >
              <span className="cat-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ LATEST STOCK ═══════════════════════════════ */}
      <section className="section latest-stock">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Fresh listings</p>
              <h2 className="section-title">Latest available stock</h2>
            </div>
            <Link to="/available-stock" className="btn btn-outline">
              View all stock →
            </Link>
          </div>

          {loadingBatches ? (
            <div className="cards-skeleton">
              {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : latestBatches.length > 0 ? (
            <div className="cards-grid">
              {latestBatches.map(batch => (
                <BatchCard key={batch._id} batch={batch} />
              ))}
            </div>
          ) : (
            <p className="no-stock">No stock available right now. Check back soon.</p>
          )}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════════════════════════ */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header centered">
            <p className="section-eyebrow">Simple process</p>
            <h2 className="section-title">How it works</h2>
            <p className="section-sub" style={{textAlign:'center', margin:'0 auto'}}>
              From sign-up to receiving your batch — four simple steps.
            </p>
          </div>

          <div className="steps-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="step-card">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="step-connector" />
                )}
                {/* Number badge */}
                <div className="step-num-wrap">
                  <span className="step-num">{step.num}</span>
                </div>
                {/* Content */}
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-body">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ USPs ════════════════════════════════════════ */}
      <section className="section usps">
        <div className="container">
          <div className="section-header centered">
            <p className="section-eyebrow">Why us</p>
            <h2 className="section-title">Why trade with A.L.S Trade </h2>
          </div>

          <div className="usp-grid">
            {USPs.map((usp, i) => (
              <div key={i} className="usp-card">
                <div className="usp-icon">{usp.icon}</div>
                <h3 className="usp-title">{usp.title}</h3>
                <p className="usp-body">{usp.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA BAND ════════════════════════════════════ */}
      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2 className="cta-title">Ready to buy your first batch?</h2>
            <p className="cta-sub">Register free and get instant access to all stock and pricing.</p>
          </div>
          <div className="cta-actions">
            <Link to="/sign-up" className="btn btn-primary">Register free</Link>
            <Link to="/contact" className="btn btn-outline-dark">Contact us</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
