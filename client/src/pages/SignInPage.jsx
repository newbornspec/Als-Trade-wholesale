import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AuthPages.css';

export default function SignInPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from = location.state?.from || '/available-stock';

  const [form,   setForm]   = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const handle = e => { setErrMsg(''); setForm({ ...form, [e.target.name]: e.target.value }); };

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setErrMsg('Please enter your email and password.'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const { data } = await api.post('/users/login', form);
      login({ name: data.name, companyName: data.companyName, email: data.email, role: data.role }, data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setStatus('error');
      setErrMsg(
        err.response?.status === 401
          ? 'Incorrect email or password. Please try again.'
          : err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-form-inner">

          <div className="auth-top-link">
            <span>Don't have an account?</span>
            <Link to="/sign-up">Register free →</Link>
          </div>

          <div className="auth-card">
            <div className="auth-card-head">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-sub">Log in to your Derby Wholesale account</p>
            </div>

            {errMsg && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errMsg}
              </div>
            )}

            <form className="auth-form" onSubmit={submit} noValidate>

              <div className="form-field">
                <label>Email address</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@company.com" autoComplete="email" required />
                </div>
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label>Password</label>
                  <Link to="/contact" className="forgot-link">Forgot password?</Link>
                </div>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="Your password" autoComplete="current-password" required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                    {showPw
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={status === 'loading'}>
                {status === 'loading'
                  ? <><span className="spinner" /> Signing in…</>
                  : <>Sign in <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                }
              </button>

            </form>

            <div className="auth-divider"><span>or reach us directly</span></div>

            <a href="https://wa.me/447911123456" target="_blank" rel="noreferrer" className="wa-alt">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact us on WhatsApp
            </a>

            <p className="auth-switch">
              No account yet?{' '}
              <Link to="/sign-up">Register your company for free →</Link>
            </p>
          </div>

      </div>

    </div>
  );
}
