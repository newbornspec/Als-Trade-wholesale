import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';
import BatchCard from '../components/BatchCard';
import './StockPage.css';

/* ── Constants ────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'all',     label: 'All stock' },
  { value: 'laptops', label: 'Laptops'   },
  { value: 'phones',  label: 'Phones'    },
  { value: 'tablets', label: 'Tablets'   },
  { value: 'mixed',   label: 'Mixed'     },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first'   },
  { value: 'oldest',     label: 'Oldest first'   },
  { value: 'qty-high',   label: 'Quantity: high' },
  { value: 'qty-low',    label: 'Quantity: low'  },
  { value: 'price-high', label: 'Price: high'    },
  { value: 'price-low',  label: 'Price: low'     },
];

function sortBatches(batches, sortBy) {
  const arr = [...batches];
  switch (sortBy) {
    case 'oldest':     return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'qty-high':   return arr.sort((a, b) => b.quantity - a.quantity);
    case 'qty-low':    return arr.sort((a, b) => a.quantity - b.quantity);
    case 'price-high': return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'price-low':  return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    default:           return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

/* ── List-view single row ─────────────────────────────────────── */
function BatchRow({ batch }) {
  const { user } = useAuth();
  return (
    <div className="batch-row">
      <div className="row-thumb">
        {batch.images?.[0]
          ? <img src={getImageUrl(batch.images[0])} alt={batch.title} />
          : <div className="row-thumb-ph">📦</div>}
      </div>

      <div className="row-body">
        <p className="row-num">Batch #{batch.batchNumber}</p>
        <h3 className="row-title">{batch.title}</h3>
        {batch.specs && <p className="row-specs">{batch.specs}</p>}
        <div className="row-badges">
          <span className={`badge ${batch.tested ? 'badge-green' : 'badge-amber'}`}>
            {batch.tested ? 'Tested' : 'Untested'}
          </span>
          {!batch.hasList && <span className="badge badge-red">No list</span>}
          {batch.grade && <span className="badge badge-amber">Grade {batch.grade}</span>}
        </div>
      </div>

      <div className="row-right">
        <div className="row-stat">
          <span className="row-stat-label">Quantity</span>
          <span className="row-stat-val">{batch.quantity}</span>
        </div>
        <div className="row-stat">
          <span className="row-stat-label">Price</span>
          {user
            ? <span className="row-price">£ {batch.price?.toLocaleString('en-GB') ?? '—'}</span>
            : <Link to="/sign-in" className="price-login">Login to see →</Link>}
        </div>
        <Link
          to={`/available-stock/${batch.slug}`}
          className="btn btn-outline"
          style={{ fontSize: '13px', padding: '8px 18px', whiteSpace: 'nowrap' }}
        >
          View details
        </Link>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function StockPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [allBatches, setAllBatches] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [sortBy,     setSortBy]     = useState('newest');
  const [testedOnly, setTestedOnly] = useState(false);
  const [withList,   setWithList]   = useState(false);
  const [viewMode,   setViewMode]   = useState('grid');
  const [sidebarOpen,setSidebarOpen]= useState(false);

  const activeCategory = searchParams.get('category') || 'all';

  /* Fetch once on mount */
  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/batches')
      .then(({ data }) => setAllBatches(data))
      .catch(() => setError('Could not load stock. Please check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  /* Client-side filter + sort */
  const results = useCallback(() => {
    let list = [...allBatches];
    if (activeCategory !== 'all')    list = list.filter(b => b.category === activeCategory);
    if (search.trim())               list = list.filter(b =>
      [b.title, b.batchNumber, b.brand || ''].join(' ').toLowerCase().includes(search.toLowerCase())
    );
    if (testedOnly) list = list.filter(b => b.tested);
    if (withList)   list = list.filter(b => b.hasList);
    return sortBatches(list, sortBy);
  }, [allBatches, activeCategory, search, testedOnly, withList, sortBy])();

  const hasFilters = search || testedOnly || withList || activeCategory !== 'all';

  const clearAll = () => {
    setSearch(''); setTestedOnly(false); setWithList(false); setSearchParams({});
  };

  const setCategory = (cat) => {
    setSearchParams(cat === 'all' ? {} : { category: cat });
    setSidebarOpen(false);
  };

  /* Count per category */
  const countFor = (cat) =>
    cat === 'all' ? allBatches.length : allBatches.filter(b => b.category === cat).length;

  return (
    <main className="stock-page">

      {/* ── Hero header ─────────────────────────────────────── */}
      <header className="stock-hero">
        <div className="stock-hero-bg" />
        <div className="container stock-hero-inner">
          <div className="stock-hero-text">
            <p className="section-eyebrow">Live inventory</p>
            <h1 className="stock-hero-title">Available stock</h1>
            <p className="stock-hero-sub">
              All batches ready for purchase. New stock added weekly.
              Register free to unlock pricing on every listing.
            </p>
          </div>
          <div className="stock-hero-cta">
            <div className="stock-count-card">
              <span className="count-num">{loading ? '…' : allBatches.length}</span>
              <span className="count-label">Batches currently available</span>
            </div>
            {!user && (
            <Link to="/sign-up" className="btn btn-primary">Register to see prices →</Link>
            )}
          </div>
        </div>
      </header>

      <div className="container stock-body">

        {/* Mobile: filter toggle */}
        <button className="mobile-filter-btn" onClick={() => setSidebarOpen(o => !o)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          Filters {hasFilters && <span className="filter-dot" />}
        </button>

        <div className="stock-layout">

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className={`stock-sidebar ${sidebarOpen ? 'open' : ''}`}>

            {/* Category */}
            <div className="sb-section">
              <h3 className="sb-label">Category</h3>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`cat-btn ${activeCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setCategory(cat.value)}
                >
                  <span>{cat.label}</span>
                  <span className="cat-pill">{countFor(cat.value)}</span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="sb-section">
              <h3 className="sb-label">Condition</h3>

              <div className="toggle-row" onClick={() => setTestedOnly(o => !o)}>
                <div className="toggle-info">
                  <span className="toggle-name">Tested only</span>
                  <span className="toggle-desc">Graded &amp; verified condition</span>
                </div>
                <div className={`toggle-switch ${testedOnly ? 'on' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div className="toggle-row" onClick={() => setWithList(o => !o)}>
                <div className="toggle-info">
                  <span className="toggle-name">With item list</span>
                  <span className="toggle-desc">Per-unit breakdown available</span>
                </div>
                <div className={`toggle-switch ${withList ? 'on' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>

            {hasFilters && (
              <button className="clear-btn" onClick={clearAll}>✕ Clear all filters</button>
            )}

            {/* Sidebar promo */}
            <div className="sb-promo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              <p>Register free to see prices on every batch instantly.</p>
              {!user && (
              <Link to="/sign-up" className="btn btn-primary" style={{width:'100%',justifyContent:'center',fontSize:'12px',padding:'10px 16px'}}>
                Register free
               </Link>
              )}
            </div>

            {/* Contact strip */}
            <div className="sb-contact">
              <p>Can't find what you need?</p>
              <a href="https://wa.me/447700000000" target="_blank" rel="noreferrer" className="wa-link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp us
              </a>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────── */}
          <div className="stock-main">

            {/* Toolbar */}
            <div className="stock-toolbar">
              <div className="search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search batch number, brand, model…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-x" onClick={() => setSearch('')}>✕</button>
                )}
              </div>

              <div className="toolbar-right">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="sort-sel"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <div className="view-btns">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="0" width="6" height="6" rx="1"/>
                      <rect x="9" y="0" width="6" height="6" rx="1"/>
                      <rect x="0" y="9" width="6" height="6" rx="1"/>
                      <rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <circle cx="3" cy="6"  r="1.5" fill="currentColor" stroke="none"/>
                      <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                      <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Result bar */}
            <div className="result-bar">
              {loading ? <span>Loading…</span> : (
                <span>
                  <strong>{results.length}</strong> batch{results.length !== 1 ? 'es' : ''} found
                  {hasFilters && <span className="filtered-label"> · filtered</span>}
                </span>
              )}

              {/* Active filter chips */}
              {!loading && (
                <div className="active-chips">
                  {activeCategory !== 'all' && (
                    <span className="chip">
                      {activeCategory}
                      <button onClick={() => setSearchParams({})}>✕</button>
                    </span>
                  )}
                  {testedOnly && (
                    <span className="chip">
                      Tested only
                      <button onClick={() => setTestedOnly(false)}>✕</button>
                    </span>
                  )}
                  {withList && (
                    <span className="chip">
                      With list
                      <button onClick={() => setWithList(false)}>✕</button>
                    </span>
                  )}
                  {search && (
                    <span className="chip">
                      "{search}"
                      <button onClick={() => setSearch('')}>✕</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="stock-error">
                <p>{error}</p>
                <button className="btn btn-outline" onClick={() => window.location.reload()}>
                  Try again
                </button>
              </div>
            )}

            {/* Skeletons */}
            {loading && (
              <div className={viewMode === 'grid' ? 'batch-grid' : 'batch-list'}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={viewMode === 'grid' ? 'skeleton-card' : 'skeleton-row'} />
                ))}
              </div>
            )}

            {/* Results */}
            {!loading && !error && results.length > 0 && (
              <div className={viewMode === 'grid' ? 'batch-grid' : 'batch-list'}>
                {results.map(batch =>
                  viewMode === 'grid'
                    ? <BatchCard key={batch._id} batch={batch} />
                    : <BatchRow  key={batch._id} batch={batch} />
                )}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (
              <div className="empty-state">
                <div className="empty-ico">📦</div>
                <h3>No batches found</h3>
                <p>Try a different search term or clear your filters.</p>
                {hasFilters && (
                  <button className="btn btn-outline" onClick={clearAll}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
