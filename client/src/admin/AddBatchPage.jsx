import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './AdminPages.css';

const EMPTY = {
  batchNumber: '',
  title:       '',
  quantity:    '',
  category:    'laptops',
  brand:       '',
  description: '',
  specs:       '',
  grade:       '',
  tested:      'false',
  hasList:     'false',
  price:       '',
  moq:         '',
  status:      'available',
};

/* Reusable Design-H radio option */
function RadioOpt({ checked, onClick, title, desc, tag, tagColor }) {
  const borderColor = checked
    ? tagColor === 'green' ? '#16a34a' : '#c9922b'
    : 'transparent';
  const bg = checked
    ? tagColor === 'green' ? '#f0fdf4' : 'rgba(201,146,43,.07)'
    : 'var(--gray-200)';
  const circleColor = checked
    ? tagColor === 'green' ? '#16a34a' : '#c9922b'
    : 'transparent';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        background: bg,
        border: `1.5px solid ${checked ? borderColor : 'var(--gray-300)'}`,
        borderLeft: checked ? `3px solid ${borderColor}` : '1.5px solid var(--gray-300)',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all .15s',
        userSelect: 'none',
      }}
    >
      {/* Circle */}
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `1.5px solid ${checked ? borderColor : 'var(--gray-400)'}`,
        background: checked ? circleColor : 'transparent',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{desc}</div>
      </div>

      {/* Tag */}
      <span style={{
        fontSize: 10, fontWeight: 600,
        padding: '2px 9px', borderRadius: 20,
        background: tagColor === 'green'
          ? (checked ? '#dcfce7' : 'var(--gray-300)')
          : (checked ? 'rgba(201,146,43,.18)' : 'var(--gray-300)'),
        color: tagColor === 'green'
          ? (checked ? '#15803d' : 'var(--gray-500)')
          : (checked ? '#c9922b' : 'var(--gray-500)'),
        border: `1px solid ${tagColor === 'green'
          ? (checked ? '#86efac' : 'var(--gray-300)')
          : (checked ? 'rgba(201,146,43,.3)' : 'var(--gray-300)')}`,
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {tag}
      </span>
    </div>
  );
}

export default function AddBatchPage() {
  const navigate = useNavigate();
  const [form,     setForm]     = useState(EMPTY);
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [pdfFile,  setPdfFile]  = useState(null);
  const [pdfName,  setPdfName]  = useState('');
  const [status,   setStatus]   = useState('idle');
  const [errMsg,   setErrMsg]   = useState('');

  const handle = e => {
    setErrMsg('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const set = (field, value) => {
    setErrMsg('');
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleImages = e => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = i => {
    setImages(prev  => prev.filter((_,idx)  => idx !== i));
    setPreviews(prev => prev.filter((_,idx) => idx !== i));
  };

  const handlePdf = e => {
    const file = e.target.files[0];
    if (file) { setPdfFile(file); setPdfName(file.name); }
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.batchNumber || !form.title || !form.quantity || !form.price) {
      setErrMsg('Batch number, title, quantity and price are required.');
      return;
    }
    setStatus('saving'); setErrMsg('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      if (pdfFile) fd.append('images', pdfFile);
      await api.post('/batches', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('saved');
      setTimeout(() => navigate('/admin/batches'), 1200);
    } catch (err) {
      setStatus('error');
      setErrMsg(
        err.response?.status === 409
          ? 'A batch with this number already exists.'
          : err.response?.data?.message || 'Failed to create batch. Please try again.'
      );
    }
  };

  const reset = () => {
    setForm(EMPTY); setImages([]); setPreviews([]);
    setPdfFile(null); setPdfName(''); setStatus('idle'); setErrMsg('');
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Add new batch</h1>
        <p className="admin-page-sub">Fill in the details below to list a new batch for sale.</p>
      </div>

      {status === 'saved' ? (
        <div className="save-success">
          <div className="ss-icon">✓</div>
          <h2>Batch created!</h2>
          <p>Redirecting to manage stock…</p>
        </div>
      ) : (
        <form className="batch-form" onSubmit={submit}>

          {errMsg && (
            <div className="form-err-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errMsg}
            </div>
          )}

          {/* ── Section 1: Identity ─────────────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Batch identity</h3>
            <div className="form-grid-2">
              <div className="bfield">
                <label>Batch number <span className="req">*</span></label>
                <input name="batchNumber" value={form.batchNumber} onChange={handle} placeholder="e.g. ALS3427" required />
                <span className="bfield-hint">Unique identifier shown on the listing</span>
              </div>
              <div className="bfield">
                <label>Title <span className="req">*</span></label>
                <input name="title" value={form.title} onChange={handle} placeholder="e.g. 49x Apple iPhone & iPads Mix" required />
              </div>
              <div className="bfield">
                <label>Quantity <span className="req">*</span></label>
                <input name="quantity" type="number" min="1" value={form.quantity} onChange={handle} placeholder="Number of units" required />
              </div>
              <div className="bfield">
                <label>Price (£) <span className="req">*</span></label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} placeholder="e.g. 1490" required />
                <span className="bfield-hint">Shown only to logged-in buyers</span>
              </div>
              <div className="bfield">
                <label>MOQ (Min. Order Qty)</label>
                <input name="moq" type="number" min="1" value={form.moq} onChange={handle} placeholder="e.g. 10" />
                <span className="bfield-hint">Leave blank if no minimum</span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Classification ───────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Classification</h3>
            <div className="form-grid-3" style={{ marginBottom: '1.25rem' }}>
              <div className="bfield">
                <label>Category <span className="req">*</span></label>
                <select name="category" value={form.category} onChange={handle}>
                  <option value="laptops">Laptops</option>
                  <option value="computers">Computers</option>
                  <option value="monitors">Monitors</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="bfield">
                <label>Brand</label>
                <input name="brand" value={form.brand} onChange={handle} placeholder="e.g. Apple, HP, Mixed" />
              </div>
              <div className="bfield">
                <label>Grade</label>
                <select name="grade" value={form.grade} onChange={handle}>
                  <option value="">Select grade…</option>
                  <option value="A">Grade A — near perfect</option>
                  <option value="B">Grade B — light wear</option>
                  <option value="C">Grade C — heavy wear</option>
                  <option value="mixed">Mixed grades</option>
                </select>
              </div>
            </div>

            {/* ── Design H radio buttons ── */}
            <div className="form-grid-3">

              {/* TESTED */}
              <div className="bfield">
                <label>Tested?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <RadioOpt
                    checked={form.tested === 'true'}
                    onClick={() => set('tested', 'true')}
                    title="Yes — tested"
                    desc="Graded & checked"
                    tag="Tested"
                    tagColor="gold"
                  />
                  <RadioOpt
                    checked={form.tested === 'false'}
                    onClick={() => set('tested', 'false')}
                    title="No — untested"
                    desc="As received"
                    tag="Untested"
                    tagColor="gray"
                  />
                </div>
              </div>

              {/* ITEM LIST */}
              <div className="bfield">
                <label>Item list available?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <RadioOpt
                    checked={form.hasList === 'true'}
                    onClick={() => set('hasList', 'true')}
                    title="List available"
                    desc="Buyers can request it"
                    tag="Available"
                    tagColor="gold"
                  />
                  <RadioOpt
                    checked={form.hasList === 'false'}
                    onClick={() => set('hasList', 'false')}
                    title="No list"
                    desc="Not available"
                    tag="None"
                    tagColor="gray"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div className="bfield">
                <label>Status</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <RadioOpt
                    checked={form.status === 'available'}
                    onClick={() => set('status', 'available')}
                    title="For sale"
                    desc="Visible to all buyers"
                    tag="Live"
                    tagColor="green"
                  />
                  <RadioOpt
                    checked={form.status === 'sold'}
                    onClick={() => set('status', 'sold')}
                    title="Sold"
                    desc="Move to archive"
                    tag="Archive"
                    tagColor="gray"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ── Section 3: Description ──────────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Description & specs</h3>
            <div className="bfield">
              <label>Specs line</label>
              <input name="specs" value={form.specs} onChange={handle} placeholder="e.g. Intel Core i7 8th Gen — 8GB RAM — 256GB SSD" />
              <span className="bfield-hint">Short line shown on batch cards and in the listing header</span>
            </div>
            <div className="bfield" style={{ marginTop: '1rem' }}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={4} placeholder="Full description of the batch — contents, condition notes, what's included…" />
            </div>
          </div>

          {/* ── Section 4: Images ───────────────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Images</h3>
            <p className="form-section-sub">Up to 10 images. JPG, PNG or WebP, max 5MB each.</p>
            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((src, i) => (
                  <div key={i} className="img-preview">
                    <img src={src} alt={`Preview ${i + 1}`} />
                    <button type="button" className="img-remove" onClick={() => removeImage(i)}>✕</button>
                    {i === 0 && <span className="img-main-tag">Main</span>}
                  </div>
                ))}
              </div>
            )}
            {images.length < 10 && (
              <label className="upload-area">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} style={{ display: 'none' }} />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                </svg>
                <p>Click to upload images</p>
                <span>or drag and drop</span>
              </label>
            )}
          </div>

          {/* ── Section 5: Product list file ────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Product list file</h3>
            <p className="form-section-sub">Upload a product list file. Buyers can download it from the listing.</p>
            {pdfName ? (
              <div className="pdf-preview">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{pdfName}</span>
                <button type="button" className="pdf-remove" onClick={() => { setPdfFile(null); setPdfName(''); }}>Remove</button>
              </div>
            ) : (
              <label className="upload-area">
                <input type="file" accept="*/*" onChange={handlePdf} style={{ display: 'none' }} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <p>Click to upload file</p>
                <span>Max 10MB</span>
              </label>
            )}
          </div>

          {/* ── Actions ─────────────────────────────────────── */}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={reset}>Reset form</button>
            <button type="submit" className="btn btn-primary" disabled={status === 'saving'} style={{ minWidth: 160, justifyContent: 'center' }}>
              {status === 'saving' ? (
                <><span className="spinner" /> Saving…</>
              ) : (
                <>Publish batch <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
