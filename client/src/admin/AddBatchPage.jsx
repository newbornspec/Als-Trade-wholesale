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

const radioStyle = (checked, color) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 14px',
  background: checked
    ? color === 'green' ? '#f0fdf4' : 'rgba(201,146,43,.07)'
    : 'var(--gray-50)',
  border: `1.5px solid ${checked
    ? color === 'green' ? '#16a34a' : '#c9922b'
    : 'var(--gray-200)'}`,
  borderLeft: checked
    ? `3px solid ${color === 'green' ? '#16a34a' : '#c9922b'}`
    : '1.5px solid var(--gray-200)',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all .15s',
  userSelect: 'none',
  marginBottom: 6,
});

const dotStyle = (checked, color) => ({
  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
  border: `1.5px solid ${checked ? (color === 'green' ? '#16a34a' : '#c9922b') : 'var(--gray-400)'}`,
  background: checked ? (color === 'green' ? '#16a34a' : '#c9922b') : 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

const tagStyle = (checked, color) => ({
  fontSize: 10, fontWeight: 600,
  padding: '2px 9px', borderRadius: 20,
  background: checked
    ? color === 'green' ? '#dcfce7' : 'rgba(201,146,43,.18)'
    : 'var(--gray-100)',
  color: checked
    ? color === 'green' ? '#15803d' : '#c9922b'
    : 'var(--gray-400)',
  border: `1px solid ${checked
    ? color === 'green' ? '#86efac' : 'rgba(201,146,43,.3)'
    : 'var(--gray-200)'}`,
  whiteSpace: 'nowrap', flexShrink: 0,
});

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
    setImages(prev  => prev.filter((_,idx) => idx !== i));
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
            <div className="form-err-banner">{errMsg}</div>
          )}

          {/* Section 1 */}
          <div className="form-section">
            <h3 className="form-section-title">Batch identity</h3>
            <div className="form-grid-2">
              <div className="bfield">
                <label>Batch number <span className="req">*</span></label>
                <input name="batchNumber" value={form.batchNumber} onChange={handle} placeholder="e.g. ALS3427" required />
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
              </div>
              <div className="bfield">
                <label>MOQ (Min. Order Qty)</label>
                <input name="moq" type="number" min="1" value={form.moq} onChange={handle} placeholder="e.g. 10" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
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

            {/* Radio buttons — inlined, no sub-component */}
            <div className="form-grid-3">

              {/* TESTED */}
              <div className="bfield">
                <label>Tested?</label>
                <div>
                  <div style={radioStyle(form.tested==='true','gold')} onClick={() => set('tested','true')}>
                    <div style={dotStyle(form.tested==='true','gold')}>
                      {form.tested==='true' && <div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--gray-700)'}}>Yes — tested</div>
                      <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>Graded &amp; checked</div>
                    </div>
                    <span style={tagStyle(form.tested==='true','gold')}>Tested</span>
                  </div>
                  <div style={radioStyle(form.tested==='false','gray')} onClick={() => set('tested','false')}>
                    <div style={dotStyle(form.tested==='false','gray')}>
                      {form.tested==='false' && <div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--gray-700)'}}>No — untested</div>
                      <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>As received</div>
                    </div>
                    <span style={tagStyle(form.tested==='false','gray')}>Untested</span>
                  </div>
                </div>
              </div>

              {/* ITEM LIST */}
              <div className="bfield">
                <label>Item list available?</label>
                <div>
                  <div style={radioStyle(form.hasList==='true','gold')} onClick={() => set('hasList','true')}>
                    <div style={dotStyle(form.hasList==='true','gold')}>
                      {form.hasList==='true' && <div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--gray-700)'}}>List available</div>
                      <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>Buyers can request it</div>
                    </div>
                    <span style={tagStyle(form.hasList==='true','gold')}>Available</span>
                  </div>
                  <div style={radioStyle(form.hasList==='false','gray')} onClick={() => set('hasList','false')}>
                    <div style={dotStyle(form.hasList==='false','gray')}>
                      {form.hasList==='false' && <div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--gray-700)'}}>No list</div>
                      <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>Not available</div>
                    </div>
                    <span style={tagStyle(form.hasList==='false','gray')}>None</span>
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="bfield">
                <label>Status</label>
                <div>
                  <div style={radioStyle(form.status==='available','green')} onClick={() => set('status','available')}>
                    <div style={dotStyle(form.status==='available','green')}>
                      {form.status==='available' && <div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--gray-700)'}}>For sale</div>
                      <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>Visible to all buyers</div>
                    </div>
                    <span style={tagStyle(form.status==='available','green')}>Live</span>
                  </div>
                  <div style={radioStyle(form.status==='sold','gray')} onClick={() => set('status','sold')}>
                    <div style={dotStyle(form.status==='sold','gray')}>
                      {form.status==='sold' && <div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--gray-700)'}}>Sold</div>
                      <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>Move to archive</div>
                    </div>
                    <span style={tagStyle(form.status==='sold','gray')}>Archive</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3 */}
          <div className="form-section">
            <h3 className="form-section-title">Description &amp; specs</h3>
            <div className="bfield">
              <label>Specs line</label>
              <input name="specs" value={form.specs} onChange={handle} placeholder="e.g. Intel Core i7 8th Gen — 8GB RAM — 256GB SSD" />
            </div>
            <div className="bfield" style={{ marginTop: '1rem' }}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={4} placeholder="Full description of the batch…" />
            </div>
          </div>

          {/* Section 4 — Images */}
          <div className="form-section">
            <h3 className="form-section-title">Images</h3>
            <p className="form-section-sub">Up to 10 images. JPG, PNG or WebP.</p>
            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((src, i) => (
                  <div key={i} className="img-preview">
                    <img src={src} alt={`Preview ${i+1}`} />
                    <button type="button" className="img-remove" onClick={() => removeImage(i)}>✕</button>
                    {i === 0 && <span className="img-main-tag">Main</span>}
                  </div>
                ))}
              </div>
            )}
            {images.length < 10 && (
              <label className="upload-area">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} style={{ display: 'none' }} />
                <p>Click to upload images</p>
                <span>or drag and drop</span>
              </label>
            )}
          </div>

          {/* Section 5 — Product list */}
          <div className="form-section">
            <h3 className="form-section-title">Product list file</h3>
            <p className="form-section-sub">Upload a product list file. Buyers can download it from the listing.</p>
            {pdfName ? (
              <div className="pdf-preview">
                <span>{pdfName}</span>
                <button type="button" className="pdf-remove" onClick={() => { setPdfFile(null); setPdfName(''); }}>Remove</button>
              </div>
            ) : (
              <label className="upload-area">
                <input type="file" accept="*/*" onChange={handlePdf} style={{ display: 'none' }} />
                <p>Click to upload file</p>
                <span>Max 10MB</span>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={reset}>Reset form</button>
            <button type="submit" className="btn btn-primary" disabled={status === 'saving'} style={{ minWidth: 160, justifyContent: 'center' }}>
              {status === 'saving' ? 'Saving…' : 'Publish batch →'}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
