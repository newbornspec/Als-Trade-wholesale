import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';
import './SoldStockPage.css';

const CATEGORIES = [
  { value: 'all',     label: 'All'     },
  { value: 'laptops', label: 'Laptops' },
  { value: 'phones',  label: 'Phones'  },
  { value: 'tablets', label: 'Tablets' },
  { value: 'mixed',   label: 'Mixed'   },
];

const CAT_ICON = { laptops: '💻', phones: '📱', tablets: '📲', mixed: '📦', other: '📦' };

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months= Math.floor(days / 30);
  if (days   < 1)  return 'Today';
  if (days   < 7)  return `${days}d ago`;
  if (weeks  < 5)  return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/* ── Single sold-batch card ────────────────────────────────────── */
function SoldCard({ batch, index }) {
  return (
    <div className="sold-card" style={{ animationDelay: `${index * 40}ms` }}>
      {/* Thumbnail */}
      <div className="sc-thumb">
        {batch.images?.[0]
          ? <img src={getImageUrl(batch.images[0])} alt={batch.title} />
          : <span className="sc-thumb-icon">{CAT_ICON[batch.category] || '📦'}</span>
        }
        <span className="sc-sold-tag">Sold</span>
      </div>

      {/* Body */}
      <div className="sc-body">
        <div className="sc-top">
          <span className="sc-num">#{batch.batchNumber}</span>
          {batch.soldAt && (
            <span className="sc-date">{timeAgo(batch.soldAt)}</span>
          )}
        </div>

        <h3 className="sc-title">{batch.title}</h3>

        {batch.specs && <p className="sc-specs">{batch.specs}</p>}

        <div className="sc-badges">
          <span className="badge badge-amber">{batch.quantity} units</span>
          {batch.grade && <span className="badge badge-amber">Grade {batch.grade}</span>}
          {batch.tested
            ? <span className="badge badge-green">Tested</span>
            : <span className="badge badge-amber">Untested</span>}
          {batch.brand && <span className="badge badge-amber">{batch.brand}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function SoldStockPage() {
  const { user } = useAuth();
  const [allBatches,  setAllBatches]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [category,    setCategory]    = useState('all');
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState('newest');

  useEffect(() => {
    setLoading(true);
    api.get('/batches/sold')
      .then(({ data }) => setAllBatches(data))
      .catch(() => setError('Could not load sold stock.'))
      .finally(() => setLoading(false));
  }, []);

  const results = useCallback(() => {
    let list = [...allBatches];
    if (category !== 'all') list = list.filter(b => b.category === category);
    if (search.trim())      list = list.filter(b =>
      [b.title, b.batchNumber, b.brand || ''].join(' ')
        .toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'oldest') list.sort((a,b) => new Date(a.soldAt) - new Date(b.soldAt));
    else                     list.sort((a,b) => new Date(b.soldAt) - new Date(a.soldAt));
    return list;
  }, [allBatches, category, search, sortBy])();

  const countFor = cat =>
    cat === 'all' ? allBatches.length
                  : allBatches.filter(b => b.category === cat).length;

  const totalUnits = allBatches.reduce((sum, b) => sum + (b.quantity || 0), 0);

  return (
    <main className="sold-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="sold-hero">
        <div className="sh-bg" />
        <div className="container sh-inner">
          <div className="sh-text">
            <p className="section-eyebrow">Track record</p>
            <h1 className="sh-title">Sold stock</h1>
            <p className="sh-sub">
              Every batch we've successfully sold. This is our track record —
              real deals, real buyers, real volume.
            </p>
          </div>

          {/* Stats row */}
          <div className="sh-stats">
            <div className="sh-stat">
              <span className="sh-stat-num">
                {loading ? '…' : allBatches.length}
              </span>
              <span className="sh-stat-label">Batches sold</span>
            </div>
            <div className="sh-stat-divider" />
            <div className="sh-stat">
              <span className="sh-stat-num">
                {loading ? '…' : totalUnits.toLocaleString()}
              </span>
              <span className="sh-stat-label">Units moved</span>
            </div>
            <div className="sh-stat-divider" />
            <div className="sh-stat">
              <span className="sh-stat-num">20+</span>
              <span className="sh-stat-label">Countries</span>
            </div>
          </div>
        </div>
      </header>

    {/* ── Notice banner ────────────────────────────────────── */}
    {!user && (
        <div className="notice-bar">
          <div className="container notice-inner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Prices are not shown on sold stock. Want to see prices on available batches?
            <Link to="/sign-up" className="notice-link">Register free →</Link>
          </div>
        </div>
      )}

      <div className="container sold-body">

        {/* ── Toolbar ──────────────────────────────────────────── */}
        <div className="sold-toolbar">

          {/* Category tabs */}
          <div className="cat-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`cat-tab ${category === cat.value ? 'active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
                <span className="ct-count">{countFor(cat.value)}</span>
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="sold-controls">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search sold batches…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-x" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            <select
              className="sort-sel"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Sold: newest first</option>
              <option value="oldest">Sold: oldest first</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <div className="sold-meta">
          {!loading && (
            <span>
              <strong>{results.length}</strong> sold batch{results.length !== 1 ? 'es' : ''}
              {(search || category !== 'all') && ' — filtered'}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="sold-error">
            <p>{error}</p>
            <button className="btn btn-outline" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="sold-grid">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="skeleton-sold" />
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && results.length > 0 && (
          <div className="sold-grid">
            {results.map((batch, i) => (
              <SoldCard key={batch._id} batch={batch} index={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && results.length === 0 && (
          <div className="sold-empty">
            <span className="empty-ico">🏷️</span>
            <h3>No sold batches found</h3>
            <p>Try adjusting your search or category filter.</p>
            {(search || category !== 'all') && (
              <button
                className="btn btn-outline"
                onClick={() => { setSearch(''); setCategory('all'); }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── CTA at the bottom ──────────────────────────────── */}
        {!loading && allBatches.length > 0 && (
          <div className="sold-cta">
            <div className="sold-cta-inner">
              <div>
                <h2 className="sold-cta-title">Looking for available stock?</h2>
                <p className="sold-cta-sub">
                  New batches are added weekly. Register free to see live pricing.
                </p>
              </div>
              <div className="sold-cta-btns">
                <Link to="/available-stock" className="btn btn-primary">
                  View available stock →
                </Link>
                <Link to="/contact" className="btn btn-outline-dark">
                  Request specific stock
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
