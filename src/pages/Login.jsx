import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle, Clock, Users, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (validateForm()) {
      setIsLoading(true);
      try {
        const authUser = await login(email.toLowerCase().trim(), password);
        if (authUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setLoginError(err.message || 'Invalid email or password');
      } finally {
        setIsLoading(false);
      }
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
                      if (loginError) setLoginError('');
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
                      if (loginError) setLoginError('');
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

              {loginError && (
                <div className="login-error-banner">
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

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

            <div className="login-footer-text">
              Don't have an account? <Link to="/register">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
