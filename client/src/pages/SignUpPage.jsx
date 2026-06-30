import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AuthPages.css';
import './SignUpPage.css';

/* ── Password strength ───────────────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', bars: [] };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12)          score++;
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

/* ── OTP input — 6 auto-advancing boxes ─────────────────────────────────── */
function OTPInput({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.map((d, idx) => idx === i ? '' : d).join('');
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) { refs[i - 1].current?.focus(); return; }
    if (e.key === 'ArrowRight' && i < 5) { refs[i + 1].current?.focus(); return; }
  };

  const handleChange = (e, i) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const next = digits.map((d, idx) => idx === i ? char : d).join('');
    onChange(next);
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6).trimEnd());
    const focusIdx = Math.min(pasted.length, 5);
    refs[focusIdx].current?.focus();
  };

  return (
    <div className="otp-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          className={`otp-box ${d ? 'filled' : ''}`}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of 6`}
        />
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function SignUpPage() {
  const { login, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Support redirect from SignInPage when account exists but is unverified
  const locationState = location.state || {};
  const initialStep  = locationState.goToVerify ? 'verify' : 'register';
  const initialEmail = locationState.pendingEmail || '';

  // Registration form state
  const [form, setForm] = useState({
    name: '', companyName: '', email: '', phone: '', country: '', password: '', confirm: '',
  });
  const [showPw,   setShowPw]   = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [touched,  setTouched]  = useState({});
  const [agreed,   setAgreed]   = useState(false);
  const [regStatus, setRegStatus] = useState('idle'); // idle | loading | error
  const [regError,  setRegError]  = useState('');

  // OTP state
  const [step,         setStep]        = useState(initialStep);
  const [pendingEmail, setPendingEmail] = useState(initialEmail);
  const [otp,          setOtp]         = useState('');
  const [otpStatus,    setOtpStatus]   = useState('idle'); // idle | loading | error | resending
  const [otpError,     setOtpError]    = useState('');
  const [resendMsg,    setResendMsg]   = useState('');

  const strength = getStrength(form.password);
  const handle = e => { setRegError(''); setForm({ ...form, [e.target.name]: e.target.value }); };
  const blur   = e => setTouched({ ...touched, [e.target.name]: true });

  const errors = {
    name:        touched.name        && !form.name.trim()        ? 'Required' : '',
    companyName: touched.companyName && !form.companyName.trim() ? 'Required' : '',
    email:       touched.email && !/\S+@\S+\.\S+/.test(form.email) ? 'Enter a valid email' : '',
    phone:       touched.phone       && !form.phone.trim()       ? 'Required' : '',
    password:    touched.password    && form.password.length < 8 ? 'At least 8 characters' : '',
    confirm:     touched.confirm && form.confirm !== form.password ? 'Passwords do not match' : '',
  };

  const isValid = form.name && form.companyName && form.email && form.phone &&
    form.password.length >= 8 && form.password === form.confirm && agreed;

  /* ── Submit registration ─────────────────────────────────────────────── */
  const submitRegister = async e => {
    e.preventDefault();
    setTouched({ name:1, companyName:1, email:1, phone:1, password:1, confirm:1 });
    if (!isValid) { setRegError('Please fill in all required fields correctly.'); return; }
    setRegStatus('loading'); setRegError('');
    try {
      const { data } = await api.post('/users/register', {
        name: form.name, companyName: form.companyName, email: form.email,
        phone: form.phone, country: form.country, password: form.password,
      });
      setPendingEmail(data.pendingEmail);
      setStep('verify');
    } catch (err) {
      setRegStatus('error');
      setRegError(
        err.response?.status === 409
          ? 'An account with this email already exists.'
          : err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setRegStatus(s => s === 'loading' ? 'idle' : s);
    }
  };

  /* ── Submit OTP ──────────────────────────────────────────────────────── */
  const submitOTP = async e => {
    e.preventDefault();
    if (otp.length < 6) { setOtpError('Please enter the full 6-digit code.'); return; }
    setOtpStatus('loading'); setOtpError('');
    try {
      const { data } = await api.post('/users/verify-otp', { email: pendingEmail, otp });
      login({ name: data.name, companyName: data.companyName, email: data.email, role: data.role }, data.token);
      navigate('/available-stock', { replace: true });
    } catch (err) {
      setOtpStatus('error');
      setOtpError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setOtpStatus(s => s === 'loading' ? 'idle' : s);
    }
  };

  /* ── Resend OTP ──────────────────────────────────────────────────────── */
  const resendOTP = async () => {
    setOtpStatus('resending'); setResendMsg(''); setOtpError('');
    try {
      await api.post('/users/resend-otp', { email: pendingEmail });
      setOtp('');
      setResendMsg('A new code has been sent to your email.');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setOtpStatus('idle');
    }
  };

  /* ── OTP Verification screen ─────────────────────────────────────────── */
  if (step === 'verify') {
    return (
      <div className="auth-page">
        <div className="su5-card" style={{ maxWidth: 440 }}>
          <div className="su5-header">
            <div className="su5-verify-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 className="su5-title">Check your email</h1>
            <p className="su5-sub">
              We sent a 6-digit code to<br />
              <strong>{pendingEmail}</strong>
            </p>
          </div>

          <form onSubmit={submitOTP} style={{ padding: '1.5rem' }}>
            <p className="su5-group-label">Verification code</p>
            <OTPInput value={otp} onChange={setOtp} />

            {otpError && (
              <div className="auth-error" style={{ margin: '12px 0 0' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {otpError}
              </div>
            )}
            {resendMsg && (
              <p className="su5-resend-msg">{resendMsg}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={otpStatus === 'loading' || otp.length < 6}
              style={{ marginTop: '1.25rem' }}
            >
              {otpStatus === 'loading' ? 'Verifying…' : 'Verify email'}
            </button>

            <div className="su5-resend-row">
              <span>Didn't receive it?</span>
              <button
                type="button"
                className="su5-resend-btn"
                onClick={resendOTP}
                disabled={otpStatus === 'resending'}
              >
                {otpStatus === 'resending' ? 'Sending…' : 'Resend code'}
              </button>
            </div>

            <button
              type="button"
              className="su5-back-btn"
              onClick={() => { setStep('register'); setOtp(''); setOtpError(''); }}
            >
              ← Back to registration
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Registration form — Layout 5 ───────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="su5-card">

        {/* Bold header */}
        <div className="su5-header">
          <div className="su5-header-top">
            <div>
              <h1 className="su5-title">Get started</h1>
              <p className="su5-sub">Access wholesale pricing in minutes</p>
            </div>
            <div className="su5-badges">
              <span className="su5-badge su5-badge-green">Free</span>
              <span className="su5-badge su5-badge-blue">B2B only</span>
            </div>
          </div>

          <div className="su5-b2b-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            We only do business with registered companies. Private individuals cannot create an account.
          </div>

          {!user && (
            <div className="su5-login-link">
              Already registered? <Link to="/sign-in">Log in →</Link>
            </div>
          )}
        </div>

        <form onSubmit={submitRegister} noValidate style={{ padding: '0 1.5rem 1.5rem' }}>

          {/* Section: Personal details */}
          <div className="su5-section-divider">
            <span>Personal details</span>
          </div>
          <div className="form-row-2">
            <div className="form-field">
              <label>Your name *</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input name="name" value={form.name} onChange={handle} onBlur={blur} placeholder="John Smith" />
              </div>
              {errors.name && <span className="field-err">{errors.name}</span>}
            </div>
            <div className="form-field">
              <label>Email address *</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input name="email" type="email" value={form.email} onChange={handle} onBlur={blur} placeholder="you@company.com" />
              </div>
              {errors.email && <span className="field-err">{errors.email}</span>}
            </div>
          </div>

          {/* Section: Business details */}
          <div className="su5-section-divider">
            <span>Business details</span>
          </div>
          <div className="form-row-2">
            <div className="form-field">
              <label>Company name *</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                <input name="companyName" value={form.companyName} onChange={handle} onBlur={blur} placeholder="Acme Ltd" />
              </div>
              {errors.companyName && <span className="field-err">{errors.companyName}</span>}
            </div>
            <div className="form-field">
              <label>Phone number *</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
                <input name="phone" type="tel" value={form.phone} onChange={handle} onBlur={blur} placeholder="+44 7700 900000" />
              </div>
              {errors.phone && <span className="field-err">{errors.phone}</span>}
            </div>
          </div>
          <div className="form-field" style={{ marginBottom: 12 }}>
            <label>Country</label>
            <div className="input-wrap">
              <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              <select name="country" value={form.country} onChange={handle} className="auth-select">
                <option value="">Select your country…</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Section: Security */}
          <div className="su5-section-divider">
            <span>Security</span>
          </div>
          <div className="form-row-2">
            <div className="form-field">
              <label>Password *</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} onBlur={blur} placeholder="Min. 8 characters" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {form.password && (
                <div className="pw-strength">
                  <div className="pw-bars">{strength.bars.map((b, i) => <div key={i} className={`pw-bar ${b}`} />)}</div>
                  {strength.label && <span className="pw-label">{strength.label}</span>}
                </div>
              )}
              {errors.password && <span className="field-err">{errors.password}</span>}
            </div>
            <div className="form-field">
              <label>Confirm password *</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input name="confirm" type={showCon ? 'text' : 'password'} value={form.confirm} onChange={handle} onBlur={blur} placeholder="Repeat password" />
                <button type="button" className="pw-toggle" onClick={() => setShowCon(p => !p)} aria-label={showCon ? 'Hide' : 'Show'}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showCon
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {errors.confirm && <span className="field-err">{errors.confirm}</span>}
              {form.confirm && form.confirm === form.password && !errors.confirm && (
                <span className="field-ok">✓ Passwords match</span>
              )}
            </div>
          </div>

          {/* Terms */}
          <div
            className={`terms-check ${agreed ? 'checked' : ''}`}
            onClick={() => setAgreed(a => !a)}
            role="checkbox"
            aria-checked={agreed}
            style={{ marginTop: 4 }}
          >
            <div className="check-box">
              {agreed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <p>I confirm that I am registering on behalf of a registered business and agree to the <Link to="/terms" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)' }}>terms of service</Link>.</p>
          </div>

          {regError && (
            <div className="auth-error" style={{ margin: '12px 0 0' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {regError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={regStatus === 'loading'}
            style={{ marginTop: '1rem' }}
          >
            {regStatus === 'loading' ? 'Creating account…' : 'Create free account →'}
          </button>

          <p className="su5-footer-hint">
            A 6-digit verification code will be sent to your email after submitting.
          </p>
        </form>
      </div>
    </div>
  );
}
