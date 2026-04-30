import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './AdminPages.css';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/batches'),
    ]).then(([s, b]) => {
      setStats(s.data);
      setRecent(b.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const StatCard = ({ label, value, sub, accent }) => (
    <div className={`stat-card ${accent ? 'accent' : ''}`}>
      <span className="sc-value">{loading ? '…' : value}</span>
      <span className="sc-label">{label}</span>
      {sub && <span className="sc-sub">{sub}</span>}
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">Overview of your A.L.S Trade  inventory</p>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard accent label="Available batches" value={stats?.availableBatches ?? '…'} sub="Currently for sale" />
        <StatCard label="Sold batches"      value={stats?.soldBatches     ?? '…'} sub="All time" />
        <StatCard label="Registered buyers" value={stats?.totalUsers      ?? '…'} sub="Company accounts" />
        <StatCard label="Unread enquiries"  value={stats?.unreadEnquiries ?? '…'} sub="Need a reply" />
      </div>

      {/* Quick actions */}
      <div className="admin-section">
        <h2 className="admin-section-title">Quick actions</h2>
        <div className="quick-actions">
          <Link to="/admin/add-batch" className="qa-btn primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add new batch
          </Link>
          <Link to="/admin/batches" className="qa-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            Manage stock
          </Link>
          <Link to="/admin/enquiries" className="qa-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            View enquiries
            {stats?.unreadEnquiries > 0 && (
              <span className="qa-badge">{stats.unreadEnquiries}</span>
            )}
          </Link>
          <Link to="/available-stock" target="_blank" className="qa-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View live site
          </Link>
        </div>
      </div>

      {/* Recent batches */}
      <div className="admin-section">
        <div className="section-row">
          <h2 className="admin-section-title">Recent batches</h2>
          <Link to="/admin/batches" className="section-link">View all →</Link>
        </div>
        {loading ? (
          <div className="admin-table-skeleton" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Batch #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b._id}>
                    <td className="mono">{b.batchNumber}</td>
                    <td className="bold">{b.title}</td>
                    <td><span className="cat-tag">{b.category}</span></td>
                    <td>{b.quantity}</td>
                    <td>
                      <span className={`status-tag ${b.status}`}>
                        {b.status === 'available' ? 'For sale' : 'Sold'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/batches`} className="table-action">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
