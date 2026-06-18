import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertCircle, KeyRound, CheckCircle, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setEmailError('Email address is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // Simulate API request dispatch delay
      setTimeout(() => {
        setIsLoading(false);
        setSubmitted(true);
      }, 1500);
    }
  };

  return (
    <div className="login-split-container">
      {/* Left Panel - Brand Showcase & Recovery Status Preview */}
      <div className="login-left-panel">
        <Link to="/" className="login-logo-section logo" style={{ textDecoration: 'none' }}>
          <div className="logo-dot"></div>
          <span>Dayflow</span>
        </Link>

        <div className="login-welcome-section animate-fade-in-up">
          <h2 style={{ color: 'white' }}>Restore your <br /><span className="gradient-text">Workspace.</span></h2>
          <p>
            Recover your account access in just a few clicks. Follow the secure instructions sent to your corporate inbox to set a new password and log back into your dashboard.
          </p>

          {/* Secure Recover illustration/mockup */}
          <div className="glass-card animate-float" style={{ padding: '24px', maxWidth: '380px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge-title" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Security Gateway
              </span>
              <span style={{ color: '#fb923c', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={12} /> Pending Action
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="badge-icon-wrap" style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}>
                  <KeyRound size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Password Reset Hook</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Requested 1 min ago</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <ShieldAlert size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                <span>Verification email will expire in 15 minutes.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-left-footer">
          © 2026 Dayflow Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Glassmorphic Form Card */}
      <div className="login-right-panel">
        <div className="login-card-wrapper">
          <div className="glass-card" style={{ padding: '40px 32px' }}>
            
            {!submitted ? (
              <>
                <div className="login-header-text">
                  <h3>Reset Password</h3>
                  <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <input
                        id="email"
                        type="text"
                        className={`form-input ${emailError ? 'error' : ''}`}
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    {emailError && (
                      <span className="validation-error-msg">
                        <AlertCircle size={14} /> {emailError}
                      </span>
                    )}
                  </div>

                  {/* Send Action Button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px' }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner"></span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        Send Reset Link <ArrowRight size={18} />
                      </span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <div className="badge-icon-wrap" style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                    <CheckCircle size={28} />
                  </div>
                </div>

                <div className="login-header-text" style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.6rem', color: 'white' }}>Link Dispatched</h3>
                  <p style={{ marginTop: '12px' }}>
                    We have sent secure reset instructions to <strong>{email}</strong>. Please check your inbox and verify the request.
                  </p>
                </div>

                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', padding: '14px' }}
                  onClick={() => setSubmitted(false)}
                >
                  Resend Verification Link
                </button>
              </div>
            )}

            {/* Back to Login Anchor */}
            <div className="login-footer-text" style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link 
                to="/login" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: 'var(--text-muted)', 
                  textDecoration: 'none', 
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
