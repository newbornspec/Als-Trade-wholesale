import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './AdminPages.css';
import './EditDrawer.css';

/* ── Edit drawer ─────────────────────────────────────────────── */
function EditDrawer({ batch, onClose, onSaved }) {
  const [form, setForm] = useState({
    batchNumber: batch.batchNumber || '',
    title:       batch.title       || '',
    quantity:    batch.quantity    || '',
    price:       batch.price       || '',
    category:    batch.category    || 'laptops',
    brand:       batch.brand       || '',
    specs:       batch.specs       || '',
    description: batch.description || '',
    grade:       batch.grade       || '',
    tested:      String(batch.tested  ?? false),
    hasList:     String(batch.hasList ?? false),
    moq:         batch.moq         || '',
    status:      batch.status      || 'available',
  });
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [saved,  setSaved]  = useState(false);

  const handle = e => { setErrMsg(''); setForm({ ...form, [e.target.name]: e.target.value }); };

  const submit = async e => {
    e.preventDefault();
    setSaving(true); setErrMsg('');
    try {
      const { data } = await api.put(`/batches/${batch._id}`, {
        ...form,
        quantity: Number(form.quantity),
        price:    Number(form.price),
        tested:   form.tested  === 'true',
        hasList:  form.hasList === 'true',
      });
      setSaved(true);
      onSaved(data);
      setTimeout(onClose, 900);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">

        <div className="drawer-header">
          <div>
            <p className="drawer-eyebrow">Editing batch</p>
            <h2 className="drawer-title">{batch.batchNumber}</h2>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {saved && (
          <div className="drawer-saved">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Saved successfully
          </div>
        )}

        {errMsg && (
          <div className="drawer-err">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {errMsg}
          </div>
        )}

        <form className="drawer-form" onSubmit={submit}>

          <div className="drawer-section">
            <p className="ds-label">Identity</p>
            <div className="ds-row">
              <div className="df">
                <label>Batch number</label>
                <input name="batchNumber" value={form.batchNumber} onChange={handle} required />
              </div>
              <div className="df">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handle} required />
              </div>
            </div>
            <div className="ds-row">
              <div className="df">
                <label>Quantity</label>
                <input name="quantity" type="number" min="1" value={form.quantity} onChange={handle} required />
              </div>
              <div className="df">
                <label>Price (£)</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} />
              </div>
            </div>
            <div className="ds-row">
              <div className="df">
                <label>MOQ (Min. Order Qty)</label>
                <input name="moq" type="number" min="1" value={form.moq} onChange={handle} placeholder="No minimum" />
              </div>
              <div className="df" />
            </div>
          </div>

          <div className="drawer-section">
            <p className="ds-label">Classification</p>
            <div className="ds-row">
              <div className="df">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handle}>
                  <option value="laptops">Laptops</option>
                  <option value="phones">Phones</option>
                  <option value="tablets">Tablets</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="df">
                <label>Brand</label>
                <input name="brand" value={form.brand} onChange={handle} placeholder="e.g. Apple, HP, Mixed" />
              </div>
            </div>
            <div className="ds-row">
              <div className="df">
                <label>Grade</label>
                <select name="grade" value={form.grade} onChange={handle}>
                  <option value="">No grade</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div className="df">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handle}>
                  <option value="available">For sale</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
            <div className="ds-row">
              <div className="df">
                <label>Tested?</label>
                <select name="tested" value={form.tested} onChange={handle}>
                  <option value="true">Yes — tested</option>
                  <option value="false">No — untested</option>
                </select>
              </div>
              <div className="df">
                <label>Item list?</label>
                <select name="hasList" value={form.hasList} onChange={handle}>
                  <option value="true">Yes — available</option>
                  <option value="false">No — NO List!</option>
                </select>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <p className="ds-label">Description & specs</p>
            <div className="df">
              <label>Specs line</label>
              <input name="specs" value={form.specs} onChange={handle} placeholder="e.g. Intel Core i7 — 8GB RAM — 256GB SSD" />
            </div>
            <div className="df" style={{marginTop:'10px'}}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3} />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}
              style={{minWidth:'130px', justifyContent:'center'}}>
              {saving
                ? <><span className="spinner" /> Saving…</>
                : <>Save changes <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function ManageBatchesPage() {
  const [batches,  setBatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [confirm,  setConfirm]  = useState(null);
  const [working,  setWorking]  = useState(null);
  const [editing,  setEditing]  = useState(null);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/batches'), api.get('/batches/sold')])
      .then(([a, s]) => setBatches([...a.data, ...s.data]))
      .finally(() => setLoading(false));
  };

  const markSold = async id => {
    setWorking(id);
    try {
      await api.patch(`/batches/${id}/sold`);
      setBatches(prev => prev.map(b => b._id === id ? { ...b, status:'sold', soldAt:new Date() } : b));
    } catch { alert('Failed to mark as sold.'); }
    setWorking(null); setConfirm(null);
  };

  const deleteBatch = async id => {
    setWorking(id);
    try {
      await api.delete(`/batches/${id}`);
      setBatches(prev => prev.filter(b => b._id !== id));
    } catch { alert('Failed to delete batch.'); }
    setWorking(null); setConfirm(null);
  };

  const handleSaved = updated =>
    setBatches(prev => prev.map(b => b._id === updated._id ? updated : b));

  const filtered = batches
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="admin-page">

      <div className="admin-page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <h1 className="admin-page-title">Manage stock</h1>
          <p className="admin-page-sub">{batches.length} total batches</p>
        </div>
        <Link to="/admin/add-batch" className="btn btn-primary" style={{fontSize:'13px'}}>
          + Add new batch
        </Link>
      </div>

      <div className="manage-toolbar">
        <div className="filter-tabs">
          {[['all','All'],['available','For sale'],['sold','Sold']].map(([v,l]) => (
            <button key={v} className={`filter-tab ${filter===v?'active':''}`} onClick={()=>setFilter(v)}>
              {l} <span className="ft-count">{v==='all'?batches.length:batches.filter(b=>b.status===v).length}</span>
            </button>
          ))}
        </div>
        <div className="manage-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search batches…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="admin-table-skeleton" /> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Batch #</th><th>Title</th><th>Cat</th><th>Qty</th>
                <th>Price</th><th>Tested</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{textAlign:'center',color:'var(--gray-500)',padding:'2rem'}}>No batches found</td></tr>
              )}
              {filtered.map(b => (
                <tr key={b._id} className={b.status==='sold'?'row-sold':''}>
                  <td className="mono">{b.batchNumber}</td>
                  <td className="bold" style={{maxWidth:'220px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.title}</td>
                  <td><span className="cat-tag">{b.category}</span></td>
                  <td>{b.quantity}</td>
                  <td className="mono">{b.price!=null?`£${b.price.toLocaleString('en-GB')}`:'—'}</td>
                  <td><span className={`bool-tag ${b.tested?'yes':'no'}`}>{b.tested?'Yes':'No'}</span></td>
                  <td><span className={`status-tag ${b.status}`}>{b.status==='available'?'For sale':'Sold'}</span></td>
                  <td>
                    <div className="row-actions">

                      {/* View */}
                      <Link to={`/available-stock/${b.slug}`} target="_blank" className="ra-btn view" title="View on site">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </Link>

                      {/* Edit ✏️ */}
                      <button className="ra-btn edit" title="Edit batch" onClick={() => setEditing(b)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      {/* Mark sold */}
                      {b.status==='available' && (
                        <button className="ra-btn sold" title="Mark as sold" disabled={working===b._id}
                          onClick={()=>setConfirm({type:'sold',id:b._id,num:b.batchNumber})}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                      )}

                      {/* Delete */}
                      <button className="ra-btn delete" title="Delete batch" disabled={working===b._id}
                        onClick={()=>setConfirm({type:'delete',id:b._id,num:b.batchNumber})}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                        </svg>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit drawer */}
      {editing && (
        <EditDrawer
          batch={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="modal-overlay" onClick={()=>setConfirm(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h3 className="modal-title">{confirm.type==='sold'?'Mark as sold?':'Delete batch?'}</h3>
            <p className="modal-body">
              {confirm.type==='sold'
                ?`This will mark batch ${confirm.num} as sold and move it to the archive. This cannot be undone.`
                :`This will permanently delete batch ${confirm.num}. This cannot be undone.`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setConfirm(null)}>Cancel</button>
              <button
                className={`btn ${confirm.type==='delete'?'btn-danger':'btn-primary'}`}
                onClick={()=>confirm.type==='sold'?markSold(confirm.id):deleteBatch(confirm.id)}
              >
                {confirm.type==='sold'?'Mark as sold':'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
