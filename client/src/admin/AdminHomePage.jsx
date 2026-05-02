import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';
import './AdminHome.css';

function timeAgo(d) {
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 2)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

const QUICK_LINKS = [
  {
    to:    '/admin/add-batch',
    label: 'Add new batch',
    desc:  'List a new batch for sale',
    color: 'accent',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5"  y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    to:    '/admin/batches',
    label: 'Manage stock',
    desc:  'Edit, mark sold or delete',
    color: 'blue',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
  },
  {
    to:    '/admin/enquiries',
    label: 'Enquiries',
    desc:  'View buyer messages',
    color: 'purple',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    to:    '/available-stock',
    label: 'View live site',
    desc:  'See how buyers see it',
    color: 'gray',
    external: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    ),
  },
];

export default function AdminHomePage() {
  const { user }  = useAuth();
  const [stats,   setStats]   = useState(null);
  const [batches, setBatches] = useState([]);
  const [enquiries,setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
                'Good evening';

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/batches'),
      api.get('/admin/enquiries'),
    ]).then(([s, b, e]) => {
      setStats(s.data);
      setBatches(b.data.slice(0, 4));
      setEnquiries(e.data.slice(0, 4));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="ah-page">

      {/* ── Welcome banner ───────────────────────────────── */}
      <div className="ah-banner">
        <div className="ah-banner-bg" />
        <div className="ah-banner-content">
          <div>
            <p className="ah-greeting">{greeting},</p>
            <h1 className="ah-name">{user?.name || 'Admin'}</h1>
            <p className="ah-tagline">
              Here's what's happening with A.L.S Trade  today.
            </p>
          </div>
          <div className="ah-banner-meta">
            <div className="ah-date-card">
              <span className="ah-date-day">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
              </span>
              <span className="ah-date-full">
                {new Date().toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ah-body">

        {/* ── Stats row ─────────────────────────────────── */}
        <div className="ah-stats">
          {[
            { label: 'For sale',       val: stats?.availableBatches, accent: true  },
            { label: 'Sold',           val: stats?.soldBatches,      accent: false },
            { label: 'Buyers',         val: stats?.totalUsers,       accent: false },
            { label: 'Unread',         val: stats?.unreadEnquiries,  accent: false, alert: stats?.unreadEnquiries > 0 },
          ].map((s, i) => (
            <div key={i} className={`ah-stat ${s.accent ? 'primary' : ''} ${s.alert ? 'alert' : ''}`}>
              <span className="ahs-val">{loading ? '…' : (s.val ?? 0)}</span>
              <span className="ahs-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Quick links ───────────────────────────────── */}
        <div className="ah-section">
          <h2 className="ah-section-title">Quick actions</h2>
          <div className="ah-quick-grid">
            {QUICK_LINKS.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noreferrer' : undefined}
                className={`ah-ql ah-ql-${l.color}`}
              >
                <div className="ah-ql-icon">{l.icon}</div>
                <div>
                  <p className="ah-ql-label">{l.label}</p>
                  <p className="ah-ql-desc">{l.desc}</p>
                </div>
                <svg className="ah-ql-arrow" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Two-column: recent batches + enquiries ──── */}
        <div className="ah-two-col">

          {/* Recent batches */}
          <div className="ah-card">
            <div className="ah-card-head">
              <h2 className="ah-card-title">Recent stock</h2>
              <Link to="/admin/batches" className="ah-card-link">View all →</Link>
            </div>

            {loading ? (
              <div className="ah-skeleton" />
            ) : batches.length === 0 ? (
              <div className="ah-empty">
                <p>No batches yet.</p>
                <Link to="/admin/add-batch" className="btn btn-primary" style={{fontSize:'12px',padding:'8px 16px'}}>
                  Add first batch
                </Link>
              </div>
            ) : (
              <div className="ah-batch-list">
                {batches.map(b => (
                  <div key={b._id} className="ah-batch-row">
                    <div className="ah-batch-thumb">
                      {b.images?.[0]
                        ? <img src={getImageUrl(b.images[0])} alt={b.title} />
                        : <span>📦</span>}
                    </div>
                    <div className="ah-batch-info">
                      <p className="ah-batch-num">#{b.batchNumber}</p>
                      <p className="ah-batch-title">{b.title}</p>
                      <p className="ah-batch-meta">{b.quantity} units · {b.category}</p>
                    </div>
                    <div className="ah-batch-right">
                      <span className={`ah-status ${b.status}`}>
                        {b.status === 'available' ? 'For sale' : 'Sold'}
                      </span>
                      {b.price != null && (
                        <span className="ah-price">£{b.price.toLocaleString('en-GB')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent enquiries */}
          <div className="ah-card">
            <div className="ah-card-head">
              <h2 className="ah-card-title">
                Recent enquiries
                {stats?.unreadEnquiries > 0 && (
                  <span className="ah-unread-badge">{stats.unreadEnquiries} new</span>
                )}
              </h2>
              <Link to="/admin/enquiries" className="ah-card-link">View all →</Link>
            </div>

            {loading ? (
              <div className="ah-skeleton" />
            ) : enquiries.length === 0 ? (
              <div className="ah-empty"><p>No enquiries yet.</p></div>
            ) : (
              <div className="ah-enq-list">
                {enquiries.map(e => (
                  <Link key={e._id} to="/admin/enquiries" className="ah-enq-row">
                    <div className="ah-enq-avatar">
                      {!e.isRead && <div className="ah-enq-dot" />}
                      {e.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="ah-enq-info">
                      <p className="ah-enq-name">
                        {e.name}
                        {e.companyName && <span> · {e.companyName}</span>}
                      </p>
                      <p className="ah-enq-msg">
                        {e.message?.slice(0, 60)}{e.message?.length > 60 ? '…' : ''}
                      </p>
                    </div>
                    <span className="ah-enq-time">{timeAgo(e.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Platform status strip ─────────────────────── */}
        <div className="ah-status-strip">
          <div className="ah-ss-item">
            <div className="ah-ss-dot green" />
            <span>Frontend live at localhost:5173</span>
          </div>
          <div className="ah-ss-item">
            <div className="ah-ss-dot green" />
            <span>API live at https://als-trade-wholesale-production.up.railway.app</span>
          </div>
          <div className="ah-ss-item">
            <div className="ah-ss-dot green" />
            <span>MongoDB connected</span>
          </div>
          <div className="ah-ss-item" style={{marginLeft:'auto'}}>
            <span style={{color:'var(--gray-500)',fontSize:'12px'}}>
              Logged in as <strong style={{color:'var(--white)'}}>{user?.companyName}</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
