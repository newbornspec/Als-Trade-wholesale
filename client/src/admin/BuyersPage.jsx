import { useEffect, useState } from 'react';
import api from '../api/axios';
import './AdminPages.css';
import './BuyersPage.css';

const fmt = d =>
  new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function BuyersPage() {
  const [buyers,   setBuyers]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(({ data }) => setBuyers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Remove "${name}" from the buyers list? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setBuyers(prev => prev.filter(b => b._id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      alert('Failed to remove buyer. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const toggle = id => setExpanded(o => o === id ? null : id);

  const visible = buyers.filter(b => {
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.companyName?.toLowerCase().includes(q) ||
      b.phone?.includes(q)
    );
  });

  return (
    <div className="admin-page">

      {/* ── Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Buyers</h1>
          <p className="admin-page-sub">
            {loading ? 'Loading…' : `${buyers.length} registered buyer${buyers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* ── Total count card ── */}
      <div className="buyers-count-row">
        <div className="buyers-count-card">
          <span className="buyers-count-num">{loading ? '—' : buyers.length}</span>
          <span className="buyers-count-lbl">Total registered buyers</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="manage-toolbar">
        <div className="manage-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, company or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            {visible.length} result{visible.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="admin-table-skeleton" />
      ) : visible.length === 0 ? (
        <div className="enq-empty">
          <p>{search ? 'No buyers match your search.' : 'No registered buyers yet.'}</p>
        </div>
      ) : (
        <div className="buyers-list">
          {visible.map(b => (
            <div
              key={b._id}
              className={`buyer-card ${expanded === b._id ? 'expanded' : ''}`}
            >
              {/* ── Card header (always visible) ── */}
              <div className="buyer-card-header" onClick={() => toggle(b._id)}>
                <div className="buyer-avatar">
                  {b.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="buyer-summary">
                  <p className="buyer-name">{b.name}</p>
                  <p className="buyer-company">{b.companyName || '—'}</p>
                </div>
                <div className="buyer-email">{b.email}</div>
                <div className="buyer-joined">{fmt(b.createdAt)}</div>
                <div className="buyer-actions">
                  <button
                    className="ra-btn delete"
                    onClick={e => handleDelete(e, b._id, b.name)}
                    disabled={deleting === b._id}
                    title="Remove buyer"
                  >
                    {deleting === b._id ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    )}
                  </button>
                  <svg
                    className={`buyer-chevron ${expanded === b._id ? 'open' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {/* ── Expanded detail ── */}
              {expanded === b._id && (
                <div className="buyer-detail">
                  <div className="buyer-detail-grid">
                    <div className="bd-row">
                      <span className="bd-label">Full name</span>
                      <span className="bd-value">{b.name}</span>
                    </div>
                    <div className="bd-row">
                      <span className="bd-label">Company</span>
                      <span className="bd-value">{b.companyName || '—'}</span>
                    </div>
                    <div className="bd-row">
                      <span className="bd-label">Email</span>
                      <a href={`mailto:${b.email}`} className="bd-value bd-link">{b.email}</a>
                    </div>
                    <div className="bd-row">
                      <span className="bd-label">Phone</span>
                      <a href={`tel:${b.phone}`} className="bd-value bd-link">{b.phone || '—'}</a>
                    </div>
                    <div className="bd-row">
                      <span className="bd-label">Country</span>
                      <span className="bd-value">{b.country || '—'}</span>
                    </div>
                    <div className="bd-row">
                      <span className="bd-label">Password</span>
                      <span className="bd-value bd-encrypted">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                        Encrypted — not visible
                      </span>
                    </div>
                    <div className="bd-row">
                      <span className="bd-label">Registered</span>
                      <span className="bd-value">{fmt(b.createdAt)}</span>
                    </div>
                    <div className="bd-row">
                      <span className="bd-label">Last login</span>
                      <span className="bd-value">{b.lastLogin ? fmt(b.lastLogin) : 'Never'}</span>
                    </div>
                  </div>
                  <div className="buyer-detail-footer">
                    <a href={`mailto:${b.email}`} className="btn btn-primary" style={{ fontSize: 13 }}>
                      Email buyer
                    </a>
                    <button
                      className="btn"
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, cursor: 'pointer' }}
                      onClick={e => handleDelete(e, b._id, b.name)}
                      disabled={deleting === b._id}
                    >
                      {deleting === b._id ? 'Removing…' : '🗑 Remove buyer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
