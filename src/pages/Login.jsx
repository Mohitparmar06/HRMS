import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle, Clock, Users, ArrowUpRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      // Simulate API loading state before redirecting
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="login-split-container">
      {/* Left Panel - Brand Showcase & Live Dashboard Mockup */}
      <div className="login-left-panel">
        <Link to="/" className="login-logo-section logo" style={{ textDecoration: 'none' }}>
          <div className="logo-dot"></div>
          <span>Dayflow</span>
        </Link>

        <div className="login-welcome-section animate-fade-in-up">
          <h2 style={{ color: 'white' }}>Every Workday,<br /><span className="gradient-text">Perfectly Aligned.</span></h2>
          <p>
            Experience the new standard of workforce coordination. Keep track of attendance, verify leaves, automate payroll distributions, and align your scaling team instantly.
          </p>

          {/* HR Illustration / Mini Dashboard Preview */}
          <div className="glass-card animate-float" style={{ padding: '24px', maxWidth: '380px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge-title" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Department Status
              </span>
              <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={12} /> Live
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="badge-icon-wrap" style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-blue)' }}>
                    <Users size={14} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Engineering Dept</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>98.2% Checked In</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="badge-icon-wrap" style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: 'var(--primary-purple)' }}>
                    <Clock size={14} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>On-Leave Requests</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>3 Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-left-footer">
          © 2026 Dayflow Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Glassmorphism Login Card */}
      <div className="login-right-panel">
        <div className="login-card-wrapper">
          <div className="glass-card" style={{ padding: '40px 32px' }}>
            <div className="login-header-text">
              <h3>Welcome Back</h3>
              <p>Enter your credentials to access your Dayflow portal.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="text"
                    className={`form-input ${emailError ? 'error' : ''}`}
                    placeholder="name@company.com"
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

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${passwordError ? 'error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <span className="validation-error-msg">
                    <AlertCircle size={14} /> {passwordError}
                  </span>
                )}
              </div>

              {/* Options (Remember me & Forgot Password) */}
              <div className="form-options">
                <label className="remember-me-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Action Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', position: 'relative' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Sign In <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>Or</span>
            </div>

            {/* Google OAuth Placeholder Button */}
            <button
              type="button"
              className="btn-google"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  navigate('/dashboard');
                }, 1200);
              }}
              disabled={isLoading}
            >
              {/* Google G logo SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Footer signup prompt */}
            <div className="login-footer-text">
              Don't have an account? <Link to="/register">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
