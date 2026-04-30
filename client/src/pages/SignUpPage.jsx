import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AuthPages.css';

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', bars: [] };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  if (pw.length >= 12)           score++;
  const levels = [
    { label: '',       bars: ['','','',''] },
    { label: 'Weak',   bars: ['filled-weak','','',''] },
    { label: 'Fair',   bars: ['filled-fair','filled-fair','',''] },
    { label: 'Good',   bars: ['filled-strong','filled-strong','filled-strong',''] },
    { label: 'Strong', bars: ['filled-strong','filled-strong','filled-strong','filled-strong'] },
    { label: 'Strong', bars: ['filled-strong','filled-strong','filled-strong','filled-strong'] },
  ];
  return { score, ...levels[Math.min(score, 4)] };
}

const COUNTRIES = [
  'United Kingdom','Netherlands','Germany','France','Belgium','Spain',
  'Italy','Poland','Sweden','Denmark','Norway','Finland','Austria',
  'Switzerland','Portugal','Czech Republic','Hungary','Romania',
  'United States','Canada','Australia','China','Japan','South Korea',
  'United Arab Emirates','South Africa','India','Singapore','Other',
];

export default function SignUpPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    name:'', companyName:'', email:'', phone:'', country:'', password:'', confirm:'',
  });
  const [showPw,  setShowPw]  = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [touched, setTouched] = useState({});
  const [status,  setStatus]  = useState('idle');
  const [errMsg,  setErrMsg]  = useState('');
  const [agreed,  setAgreed]  = useState(false);

  const strength = getStrength(form.password);
  const handle = e => { setErrMsg(''); setForm({ ...form, [e.target.name]: e.target.value }); };
  const blur   = e => setTouched({ ...touched, [e.target.name]: true });

  const errors = {
    name:        touched.name        && !form.name.trim()        ? 'Required' : '',
    companyName: touched.companyName && !form.companyName.trim() ? 'Required' : '',
    email:       touched.email && !/\S+@\S+\.\S+/.test(form.email) ? 'Enter a valid email' : '',
    phone:       touched.phone       && !form.phone.trim()       ? 'Required' : '',
    password:    touched.password    && form.password.length < 8 ? 'At least 8 characters' : '',
    confirm:     touched.confirm     && form.confirm !== form.password ? 'Passwords do not match' : '',
  };

  const isValid = form.name && form.companyName && form.email && form.phone &&
    form.password.length >= 8 && form.password === form.confirm && agreed;

  const submit = async e => {
    e.preventDefault();
    setTouched({ name:1, companyName:1, email:1, phone:1, password:1, confirm:1 });
    if (!isValid) { setErrMsg('Please fill in all required fields correctly.'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const { data } = await api.post('/users/register', {
        name: form.name, companyName: form.companyName, email: form.email,
        phone: form.phone, country: form.country, password: form.password,
      });
      login({ name: data.name, companyName: data.companyName, email: data.email, role: data.role }, data.token);
      navigate('/available-stock', { replace: true });
    } catch (err) {
      setStatus('error');
      setErrMsg(
        err.response?.status === 409
          ? 'An account with this email already exists.'
          : err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-bg" />
        <div className="auth-brand-inner">

          <Link to="/" className="auth-logo">
            <span className="logo-dw">DW</span>
            <span className="logo-text">Derby<br/>Wholesale</span>
          </Link>

          <div className="auth-brand-copy">
            <h2 className="auth-brand-title">Join hundreds of<br/><span style={{color:'var(--accent)'}}>B2B buyers.</span></h2>
            <p className="auth-brand-sub">Register your company for free and get instant access to live pricing on all available batches.</p>
          </div>

          <div className="register-benefits">
            {[
              { icon: '💰', text: 'See prices on every batch instantly' },
              { icon: '📦', text: 'Browse laptops, phones, tablets & mixed lots' },
              { icon: '✉️', text: 'Enquire directly from any listing' },
              { icon: '🌍', text: 'Worldwide shipping arranged for you' },
              { icon: '🔄', text: 'Buy as many batches as you like' },
            ].map((b, i) => (
              <div key={i} className="reg-benefit">
                <span className="rb-icon">{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          <div className="auth-brand-stats">
            <div className="abs-stat">
              <span className="abs-num">Free</span>
              <span className="abs-lbl">To register</span>
            </div>
            <div className="abs-divider" />
            <div className="abs-stat">
              <span className="abs-num">2 min</span>
              <span className="abs-lbl">To sign up</span>
            </div>
            <div className="abs-divider" />
            <div className="abs-stat">
              <span className="abs-num">0</span>
              <span className="abs-lbl">Hidden fees</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner" style={{ maxWidth: '480px' }}>

          <div className="auth-top-link">
            <span>Already have an account?</span>
            <Link to="/sign-in">Log in →</Link>
          </div>

          <div className="auth-card">
            <div className="auth-card-head">
              <h1 className="auth-title">Create account</h1>
              <p className="auth-sub">Register your company — it's free, no obligations</p>
            </div>

            <div className="b2b-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              We only do business with registered companies. Private individuals cannot create an account.
            </div>

            {errMsg && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errMsg}
              </div>
            )}

            <form className="auth-form register-form" onSubmit={submit} noValidate>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Your name <span style={{color:'var(--accent)'}}>*</span></label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input name="name" value={form.name} onChange={handle} onBlur={blur} placeholder="John Smith" autoComplete="name" />
                  </div>
                  {errors.name && <span className="field-err">{errors.name}</span>}
                </div>
                <div className="form-field">
                  <label>Company name <span style={{color:'var(--accent)'}}>*</span></label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                    </svg>
                    <input name="companyName" value={form.companyName} onChange={handle} onBlur={blur} placeholder="Acme Ltd" autoComplete="organization" />
                  </div>
                  {errors.companyName && <span className="field-err">{errors.companyName}</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Email address <span style={{color:'var(--accent)'}}>*</span></label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input name="email" type="email" value={form.email} onChange={handle} onBlur={blur} placeholder="you@company.com" autoComplete="email" />
                  </div>
                  {errors.email && <span className="field-err">{errors.email}</span>}
                </div>
                <div className="form-field">
                  <label>Phone number <span style={{color:'var(--accent)'}}>*</span></label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"/>
                    </svg>
                    <input name="phone" type="tel" value={form.phone} onChange={handle} onBlur={blur} placeholder="+44 7700 900000" autoComplete="tel" />
                  </div>
                  {errors.phone && <span className="field-err">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-field">
                <label>Country</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                  </svg>
                  <select name="country" value={form.country} onChange={handle} className="auth-select">
                    <option value="">Select your country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Password <span style={{color:'var(--accent)'}}>*</span></label>
                <div className="input-wrap">
                  <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} onBlur={blur} placeholder="Min. 8 characters" autoComplete="new-password" />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                    {showPw
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {form.password && (
                  <div className="pw-strength">
                    <div className="pw-bars">
                      {strength.bars.map((cls, i) => <div key={i} className={`pw-bar ${cls}`} />)}
                    </div>
                    <span className="pw-label" style={{ color: strength.score <= 1 ? 'var(--red)' : strength.score <= 2 ? 'var(--accent)' : 'var(--green)' }}>{strength.label}</span>
                  </div>
                )}
                {errors.password && <span className="field-err">{errors.password}</span>}
              </div>

              <div className="form-field">
                <label>Confirm password <span style={{color:'var(--accent)'}}>*</span></label>
                <div className="input-wrap">
                  <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <input name="confirm" type={showCon ? 'text' : 'password'} value={form.confirm} onChange={handle} onBlur={blur} placeholder="Repeat password" autoComplete="new-password" />
                  <button type="button" className="pw-toggle" onClick={() => setShowCon(s => !s)} tabIndex={-1}>
                    {showCon
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {errors.confirm && <span className="field-err">{errors.confirm}</span>}
                {form.confirm && form.confirm === form.password && (
                  <span className="field-ok">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Passwords match
                  </span>
                )}
              </div>

              <div className={`terms-check ${agreed ? 'checked' : ''}`} onClick={() => setAgreed(a => !a)} role="checkbox" aria-checked={agreed} tabIndex={0} onKeyDown={e => e.key === ' ' && setAgreed(a => !a)}>
                <div className="check-box">
                  {agreed && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p>I confirm that I am registering on behalf of a registered business and agree to the <Link to="/contact" onClick={e => e.stopPropagation()} style={{color:'var(--accent)'}}>terms of service</Link>.</p>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={status === 'loading'}>
                {status === 'loading'
                  ? <><span className="spinner" /> Creating account…</>
                  : <>Create free account <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                }
              </button>

            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/sign-in">Log in here →</Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
