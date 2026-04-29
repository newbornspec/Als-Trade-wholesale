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
  status:      'available',
};

export default function AddBatchPage() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(EMPTY);
  const [images,  setImages]  = useState([]); // File objects
  const [previews,setPreviews]= useState([]); // data URLs
  const [status,  setStatus]  = useState('idle'); // idle | saving | saved | error
  const [errMsg,  setErrMsg]  = useState('');

  const handle = e => {
    setErrMsg('');
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const submit = async e => {
    e.preventDefault();
    if (!form.batchNumber || !form.title || !form.quantity || !form.price) {
      setErrMsg('Batch number, title, quantity and price are required.');
      return;
    }

    setStatus('saving');
    setErrMsg('');

    try {
      // Use FormData so images upload alongside the fields
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));

      await api.post('/batches', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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
    setForm(EMPTY);
    setImages([]);
    setPreviews([]);
    setStatus('idle');
    setErrMsg('');
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

          {/* ── Section 1: Identity ──────────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Batch identity</h3>
            <div className="form-grid-2">
              <div className="bfield">
                <label>Batch number <span className="req">*</span></label>
                <input name="batchNumber" value={form.batchNumber} onChange={handle}
                  placeholder="e.g. RT3427" required />
                <span className="bfield-hint">Unique identifier shown on the listing</span>
              </div>
              <div className="bfield">
                <label>Title <span className="req">*</span></label>
                <input name="title" value={form.title} onChange={handle}
                  placeholder="e.g. 49x Apple iPhone & iPads Mix" required />
              </div>
              <div className="bfield">
                <label>Quantity <span className="req">*</span></label>
                <input name="quantity" type="number" min="1" value={form.quantity} onChange={handle}
                  placeholder="Number of units" required />
              </div>
              <div className="bfield">
                <label>Price (£) <span className="req">*</span></label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle}
                  placeholder="e.g. 1490" required />
                <span className="bfield-hint">Shown only to logged-in buyers</span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Classification ────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Classification</h3>
            <div className="form-grid-3">
              <div className="bfield">
                <label>Category <span className="req">*</span></label>
                <select name="category" value={form.category} onChange={handle}>
                  <option value="laptops">Laptops</option>
                  <option value="phones">Phones</option>
                  <option value="tablets">Tablets</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="bfield">
                <label>Brand</label>
                <input name="brand" value={form.brand} onChange={handle}
                  placeholder="e.g. Apple, HP, Mixed" />
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

            <div className="form-grid-3" style={{marginTop:'1rem'}}>
              <div className="bfield">
                <label>Tested?</label>
                <div className="radio-group">
                  {[['true','Yes — tested & graded'],['false','No — untested']].map(([v,l]) => (
                    <label key={v} className={`radio-opt ${form.tested === v ? 'active' : ''}`}>
                      <input type="radio" name="tested" value={v} checked={form.tested === v} onChange={handle} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bfield">
                <label>Item list available?</label>
                <div className="radio-group">
                  {[['true','Yes — list available'],['false','No — NO List!']].map(([v,l]) => (
                    <label key={v} className={`radio-opt ${form.hasList === v ? 'active' : ''}`}>
                      <input type="radio" name="hasList" value={v} checked={form.hasList === v} onChange={handle} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bfield">
                <label>Status</label>
                <div className="radio-group">
                  {[['available','For sale'],['sold','Already sold']].map(([v,l]) => (
                    <label key={v} className={`radio-opt ${form.status === v ? 'active' : ''}`}>
                      <input type="radio" name="status" value={v} checked={form.status === v} onChange={handle} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Description ───────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Description & specs</h3>
            <div className="bfield">
              <label>Specs line</label>
              <input name="specs" value={form.specs} onChange={handle}
                placeholder="e.g. Intel Core i7 8th Gen — 8GB RAM — 256GB SSD" />
              <span className="bfield-hint">Short line shown on batch cards and in the listing header</span>
            </div>
            <div className="bfield" style={{marginTop:'1rem'}}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handle}
                rows={4} placeholder="Full description of the batch — contents, condition notes, what's included…" />
            </div>
          </div>

          {/* ── Section 4: Images ───────────────────────── */}
          <div className="form-section">
            <h3 className="form-section-title">Images</h3>
            <p className="form-section-sub">Up to 10 images. JPG, PNG or WebP, max 5MB each.</p>

            {/* Previews */}
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

            {/* Upload area */}
            {images.length < 10 && (
              <label className="upload-area">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImages}
                  style={{ display: 'none' }}
                />
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

          {/* ── Actions ─────────────────────────────────── */}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={reset}>
              Reset form
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'saving'}
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              {status === 'saving' ? (
                <><span className="spinner" /> Saving…</>
              ) : (
                <>
                  Publish batch
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
