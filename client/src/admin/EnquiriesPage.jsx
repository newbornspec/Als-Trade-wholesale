import { useEffect, useState } from 'react';
import api from '../api/axios';
import './AdminPages.css';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all'); // all | unread
  const [open,      setOpen]      = useState(null);  // expanded enquiry id

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.get('/admin/enquiries')
      .then(({ data }) => setEnquiries(data))
      .finally(() => setLoading(false));
  };

  const markRead = async id => {
    await api.patch(`/admin/enquiries/${id}/read`);
    setEnquiries(prev => prev.map(e => e._id === id ? { ...e, isRead: true } : e));
  };

  const toggle = id => {
    setOpen(o => o === id ? null : id);
    const eq = enquiries.find(e => e._id === id);
    if (eq && !eq.isRead) markRead(id);
  };

  const visible = enquiries.filter(e => filter === 'unread' ? !e.isRead : true);
  const unreadCount = enquiries.filter(e => !e.isRead).length;

  const fmt = d => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Enquiries</h1>
        <p className="admin-page-sub">
          {unreadCount > 0
            ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
            : 'All messages read'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{marginBottom:'1.5rem'}}>
        {[['all','All',enquiries.length],['unread','Unread',unreadCount]].map(([v,l,c]) => (
          <button
            key={v}
            className={`filter-tab ${filter === v ? 'active' : ''}`}
            onClick={() => setFilter(v)}
          >
            {l} <span className="ft-count">{c}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-table-skeleton" />
      ) : visible.length === 0 ? (
        <div className="enq-empty">
          <p>No {filter === 'unread' ? 'unread' : ''} enquiries.</p>
        </div>
      ) : (
        <div className="enq-list">
          {visible.map(eq => (
            <div
              key={eq._id}
              className={`enq-item ${!eq.isRead ? 'unread' : ''} ${open === eq._id ? 'expanded' : ''}`}
            >
              <div className="enq-header" onClick={() => toggle(eq._id)}>
                <div className="enq-left">
                  {!eq.isRead && <div className="enq-dot" />}
                  <div className="enq-avatar">
                    {eq.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="enq-name">
                      {eq.name}
                      {eq.companyName && <span className="enq-company"> — {eq.companyName}</span>}
                    </p>
                    <p className="enq-preview">
                      {eq.message?.slice(0, 80)}{eq.message?.length > 80 ? '…' : ''}
                    </p>
                  </div>
                </div>
                <div className="enq-right">
                  <span className="enq-date">{fmt(eq.createdAt)}</span>
                  <svg
                    className={`enq-chevron ${open === eq._id ? 'open' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {open === eq._id && (
                <div className="enq-body">
                  <div className="enq-details">
                    <div className="enq-detail-row">
                      <span className="edl">Email</span>
                      <a href={`mailto:${eq.email}`} className="edv link">{eq.email}</a>
                    </div>
                    <div className="enq-detail-row">
                      <span className="edl">Phone</span>
                      <a href={`tel:${eq.phone}`} className="edv link">{eq.phone}</a>
                    </div>
                    {eq.batchRef && (
                      <div className="enq-detail-row">
                        <span className="edl">Batch</span>
                        <span className="edv">{eq.batchRef.batchNumber} — {eq.batchRef.title}</span>
                      </div>
                    )}
                    <div className="enq-detail-row">
                      <span className="edl">Received</span>
                      <span className="edv">{fmt(eq.createdAt)}</span>
                    </div>
                  </div>

                  <div className="enq-message">{eq.message}</div>

                  <div className="enq-actions">
                    <a href={`mailto:${eq.email}?subject=Re: Your enquiry`} className="btn btn-primary" style={{fontSize:'13px'}}>
                      Reply by email
                    </a>
                    <a
                      href={`https://wa.me/${eq.phone?.replace(/\D/g,'')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn wa-enq-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
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
