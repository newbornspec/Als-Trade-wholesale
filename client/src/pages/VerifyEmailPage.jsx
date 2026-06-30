import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AuthPages.css';
import './VerifyEmailPage.css';

export default function VerifyEmailPage() {
  const [searchParams]  = useSearchParams();
  const { login }       = useAuth();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  const [status,   setStatus]   = useState('verifying'); // verifying | success | invalid | expired
  const [email,    setEmail]    = useState('');
  const [resent,   setResent]   = useState(false);
  const [resending, setResending] = useState(false);
  const [resendErr, setResendErr] = useState('');

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }

    api.get(`/users/verify-email?token=${token}`)
      .then(({ data }) => {
        login(
          { name: data.name, companyName: data.companyName, email: data.email, role: data.role },
          data.token
        );
        setStatus('success');
        // Brief pause so the user sees the success screen, then redirect
        setTimeout(() => navigate('/available-stock', { replace: true }), 2500);
      })
      .catch(err => {
        const resp = err.response?.data;
        if (resp?.expired) {
          setEmail(resp.email || '');
          setStatus('expired');
        } else {
          setStatus('invalid');
        }
      });
  }, [token]);

  const resendLink = async () => {
    if (!email) return;
    setResending(true); setResendErr('');
    try {
      await api.post('/users/resend-verification', { email });
      setResent(true);
    } catch (err) {
      setResendErr(err.response?.data?.message || 'Could not resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  /* ── Verifying ── */
  if (status === 'verifying') {
    return (
      <div className="auth-page">
        <div className="vep-card">
          <div className="vep-icon vep-icon-spin">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
          <h1 className="vep-title">Verifying your email…</h1>
          <p className="vep-sub">Just a moment while we activate your account.</p>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="vep-card">
          <div className="vep-icon vep-icon-success">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="vep-title">Email verified!</h1>
          <p className="vep-sub">
            Your account is active. You're being signed in now…
          </p>
          <div className="vep-progress">
            <div className="vep-progress-bar" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Expired ── */
  if (status === 'expired') {
    return (
      <div className="auth-page">
        <div className="vep-card">
          <div className="vep-icon vep-icon-warn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="vep-title">Link has expired</h1>
          <p className="vep-sub">
            Verification links are valid for 24 hours. This one has expired — we can send you a fresh one.
          </p>

          {!resent ? (
            <>
              {resendErr && <p className="vep-error">{resendErr}</p>}
              <button
                className="btn btn-primary vep-btn"
                onClick={resendLink}
                disabled={resending || !email}
              >
                {resending ? 'Sending…' : 'Resend verification email'}
              </button>
            </>
          ) : (
            <div className="vep-resent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              A new link has been sent to <strong>{email}</strong>. Check your inbox.
            </div>
          )}

          <Link to="/sign-in" className="vep-back">← Back to log in</Link>
        </div>
      </div>
    );
  }

  /* ── Invalid ── */
  return (
    <div className="auth-page">
      <div className="vep-card">
        <div className="vep-icon vep-icon-error">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 className="vep-title">Invalid link</h1>
        <p className="vep-sub">
          This verification link is invalid or has already been used. If you already verified your account, you can log in below.
        </p>
        <Link to="/sign-in" className="btn btn-primary vep-btn">Go to log in</Link>
        <Link to="/sign-up" className="vep-back">Register a new account</Link>
      </div>
    </div>
  );
}
