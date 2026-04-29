import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import api from '../api/axios';
import './BatchDetailPage.css';

/* ── Enquiry form (embedded in the page) ─────────────────────── */
function EnquiryForm({ batch }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name:        user?.name        || '',
    companyName: user?.companyName || '',
    phone:       '',
    email:       user?.email       || '',
    message:     `Hi, I'm interested in batch ${batch.batchNumber} — ${batch.title}. Please contact me with more details.`,
  });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/contact', { ...form, batchSlug: batch.slug });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') return (
    <div className="form-success">
      <div className="success-icon">✓</div>
      <h3>Enquiry sent!</h3>
      <p>We'll contact you as soon as possible about batch {batch.batchNumber}.</p>
    </div>
  );

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <div className="form-row">
        <div className="form-field">
          <label>Your name *</label>
          <input name="name" value={form.name} onChange={handle} required placeholder="John Smith" />
        </div>
        <div className="form-field">
          <label>Company *</label>
          <input name="companyName" value={form.companyName} onChange={handle} required placeholder="Acme Ltd" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Email *</label>
          <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@company.com" />
        </div>
        <div className="form-field">
          <label>Phone *</label>
          <input name="phone" type="tel" value={form.phone} onChange={handle} required placeholder="+44 7700 900000" />
        </div>
      </div>
      <div className="form-field">
        <label>Message *</label>
        <textarea name="message" value={form.message} onChange={handle} required rows={4} />
      </div>

      {status === 'error' && (
        <p className="form-error">Failed to send. Try again or WhatsApp us directly.</p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
        <a
          href={`https://wa.me/447911123456?text=${encodeURIComponent(`Hi, I'm interested in batch ${batch.batchNumber} — ${batch.title}`)}`}
          target="_blank"
          rel="noreferrer"
          className="wa-btn"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp us
        </a>
      </div>
    </form>
  );
}

/* ── Image gallery ───────────────────────────────────────────── */
function Gallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="gallery-empty">
        <span>📦</span>
        <p>No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery">
        {/* Main image */}
        <div className="gallery-main" onClick={() => setLightbox(true)}>
          <img src={getImageUrl(images[active])} alt={`${title} — image ${active + 1}`} />
          <div className="gallery-zoom-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            Click to enlarge
          </div>
          {images.length > 1 && (
            <div className="gallery-counter">{active + 1} / {images.length}</div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`thumb ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
              >
                <img src={getImageUrl(img)} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lb-close">✕</button>
          <img src={getImageUrl(images[active])} alt={title} onClick={e => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button
                className="lb-prev"
                onClick={e => { e.stopPropagation(); setActive(i => (i - 1 + images.length) % images.length); }}
              >‹</button>
              <button
                className="lb-next"
                onClick={e => { e.stopPropagation(); setActive(i => (i + 1) % images.length); }}
              >›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

/* ── Spec row helper ─────────────────────────────────────────── */
function SpecRow({ label, value, highlight }) {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div className={`spec-row ${highlight ? 'highlight' : ''}`}>
      <span className="spec-label">{label}</span>
      <span className="spec-value">{value}</span>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function BatchDetailPage() {
  const { slug } = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [batch,   setBatch]   = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    window.scrollTo(0, 0);

    api.get(`/batches/${slug}`)
      .then(({ data }) => {
        setBatch(data);
        // Fetch related batches (same category)
        return api.get(`/batches?category=${data.category}`);
      })
      .then(({ data }) => {
        setRelated(data.filter(b => b.slug !== slug).slice(0, 3));
      })
      .catch(err => {
        if (err.response?.status === 404) setError('404');
        else setError('Could not load this batch. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (loading) return (
    <main className="detail-page">
      <div className="container detail-skeleton">
        <div className="sk sk-gallery" />
        <div className="sk-body">
          <div className="sk sk-line w60" />
          <div className="sk sk-line w40" />
          <div className="sk sk-line w80" />
          <div className="sk sk-line w50" />
        </div>
      </div>
    </main>
  );

  /* ── 404 ───────────────────────────────────────────────────── */
  if (error === '404') return (
    <main className="detail-page">
      <div className="container not-found">
        <h1>Batch not found</h1>
        <p>This batch may have been sold or removed.</p>
        <Link to="/available-stock" className="btn btn-primary">← Back to stock</Link>
      </div>
    </main>
  );

  /* ── Error ─────────────────────────────────────────────────── */
  if (error) return (
    <main className="detail-page">
      <div className="container not-found">
        <p>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go back</button>
      </div>
    </main>
  );

  if (!batch) return null;

  const isSold      = batch.status === 'sold';
  const categoryMap = { laptops: 'Laptops', phones: 'Phones', tablets: 'Tablets', mixed: 'Mixed', other: 'Other' };

  return (
    <main className="detail-page">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="breadcrumb-bar">
        <div className="container breadcrumb-inner">
          <Link to="/">Home</Link>
          <span className="bc-sep">›</span>
          <Link to="/available-stock">Available stock</Link>
          <span className="bc-sep">›</span>
          <span>{batch.batchNumber}</span>
        </div>
      </div>

      <div className="container detail-layout">

        {/* ══ LEFT COLUMN ══════════════════════════════════════ */}
        <div className="detail-left">

          {/* Gallery */}
          <Gallery images={batch.images} title={batch.title} />

          {/* Specs table */}
          <div className="specs-card">
            <h2 className="card-heading">Batch specifications</h2>
            <div className="specs-table">
              <SpecRow label="Batch number" value={batch.batchNumber} highlight />
              <SpecRow label="Category"     value={categoryMap[batch.category]} />
              <SpecRow label="Brand"        value={batch.brand} />
              <SpecRow label="Quantity"     value={`${batch.quantity} units`} highlight />
              {batch.moq && (
                <SpecRow label="Min. order (MOQ)" value={`${batch.moq} units`} highlight />
              )}
              <SpecRow label="Grade"        value={batch.grade ? `Grade ${batch.grade}` : null} />
              <SpecRow
                label="Condition"
                value={batch.tested ? 'Tested & graded' : 'Untested'}
                highlight
              />
              <SpecRow
                label="Product list"
                value={
                  batch.productListFile
                    ? 'List available! Login to see the PDF file'
                    : batch.hasList
                    ? 'Available on request'
                    : 'Not available (NO List!)'
                }
              />
              {/* PDF download — only shown to logged-in users */}
              {batch.productListFile && user && (
                <div className="spec-row">
                  <span className="spec-label">Product list file</span>
                  <a
                    href={batch.productListFile}
                    target="_blank"
                    rel="noreferrer"
                    className="pdf-download-link"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    Download file
                  </a>
                </div>
              )}
              <SpecRow label="Status" value={isSold ? 'Sold' : 'Available for purchase'} highlight />
            </div>
          </div>

          {/* Specs string — now first */}
          {batch.specs && (
            <div className="desc-card">
              <h2 className="card-heading">Specifications</h2>
              <p className="desc-text specs-mono">{batch.specs}</p>
            </div>
          )}

          {/* Description — now below */}
          {batch.description && (
            <div className="desc-card">
              <h2 className="card-heading">Description</h2>
              <p className="desc-text">{batch.description}</p>
            </div>
          )}
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════ */}
        <div className="detail-right">

          {/* Sticky info card */}
          <div className="info-card">

            {/* Status badge */}
            <div className="info-status">
              <span className={`status-badge ${isSold ? 'sold' : 'available'}`}>
                <span className="status-dot" />
                {isSold ? 'Sold' : 'For sale'}
              </span>
              <span className="batch-num-tag">#{batch.batchNumber}</span>
            </div>

            <h1 className="detail-title">{batch.title}</h1>

            {/* Meta badges */}
            <div className="detail-badges">
              {batch.tested
                ? <span className="badge badge-green">Tested</span>
                : <span className="badge badge-amber">Untested</span>
              }
              {!batch.hasList && <span className="badge badge-red">No list</span>}
              {batch.grade && <span className="badge badge-amber">Grade {batch.grade}</span>}
              {batch.brand && <span className="badge badge-amber">{batch.brand}</span>}
            </div>

            {/* Quantity */}
            <div className="qty-block">
              <span className="qty-label">Quantity</span>
              <span className="qty-value">{batch.quantity} <span className="qty-unit">units</span></span>
            </div>

            {/* Price */}
            <div className="price-block">
              <span className="price-label-txt">Price</span>
              {user ? (
                batch.price != null ? (
                  <div className="price-display">
                    <span className="price-currency">£</span>
                    <span className="price-amount">{batch.price.toLocaleString('en-GB')}</span>
                    <span className="price-note">excl. VAT + shipping</span>
                  </div>
                ) : (
                  <p className="price-on-req">Price on request</p>
                )
              ) : (
                <div className="price-locked">
                  <div className="lock-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="lock-msg">Login to see the price</p>
                    <div className="lock-actions">
                      <Link to="/sign-in" className="btn btn-primary btn-sm">Log in</Link>
                      <Link to="/sign-up" className="btn btn-outline btn-sm">Register free</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specs summary */}
            {batch.specs && (
              <div className="specs-summary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                {batch.specs}
              </div>
            )}

            {/* Divider */}
            <div className="info-divider" />

            {/* CTA */}
            {!isSold ? (
              <>
                <p className="enquiry-intro">
                  Interested in this batch? Send us an enquiry or reach out directly on WhatsApp.
                </p>
                <EnquiryForm batch={batch} />
              </>
            ) : (
              <div className="sold-notice">
                <p>This batch has been sold.</p>
                <Link to="/available-stock" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>
                  View available stock →
                </Link>
              </div>
            )}

            {/* Trust row */}
            <div className="trust-row">
              <div className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                B2B verified
              </div>
              <div className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Fast response
              </div>
              <div className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
                Worldwide shipping
              </div>
            </div>
          </div>

          {/* Contact strip */}
          <div className="contact-strip">
            <div className="cs-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
              <a href="tel:+44 7911 123456">+44 7911 123456</a>
            </div>
            <div className="cs-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href="mailto:info@derbywholesale.co.uk">info@derbywholesale.co.uk</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related batches ─────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="container">
            <div className="related-header">
              <h2 className="related-title">More {categoryMap[batch.category]?.toLowerCase()} batches</h2>
              <Link to={`/available-stock?category=${batch.category}`} className="btn btn-outline" style={{fontSize:'13px'}}>
                View all →
              </Link>
            </div>
            <div className="related-grid">
              {related.map(b => (
                <Link key={b._id} to={`/available-stock/${b.slug}`} className="related-card">
                  <div className="rc-thumb">
                    {b.images?.[0]
                      ? <img src={getImageUrl(b.images[0])} alt={b.title} />
                      : <span>📦</span>}
                  </div>
                  <div className="rc-body">
                    <p className="rc-num">#{b.batchNumber}</p>
                    <p className="rc-title">{b.title}</p>
                    <p className="rc-qty">{b.quantity} units</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
