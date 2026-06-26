import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, forceChangePassword, isFirstLogin } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await forceChangePassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        if (user?.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-split-container">
        <div className="login-left-panel">
          <div className="login-logo-section logo" style={{ textDecoration: 'none' }}>
            <div className="logo-dot"></div>
            <span>Dayflow</span>
          </div>
        </div>
        <div className="login-right-panel">
          <div className="login-card-wrapper">
            <div className="glass-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#22c55e" />
              </div>
              <h3>Password Changed Successfully</h3>
              <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-split-container">
      <div className="login-left-panel">
        <div className="login-logo-section logo" style={{ textDecoration: 'none' }}>
          <div className="logo-dot"></div>
          <span>Dayflow</span>
        </div>
        <div className="login-welcome-section animate-fade-in-up">
          <h2 style={{ color: 'white' }}>Welcome,<br /><span className="gradient-text">{user?.name || 'Employee'}!</span></h2>
          <p>
            This is your first time logging in. For security, please change your temporary password before continuing.
          </p>
        </div>
        <div className="login-left-footer">
          &copy; 2026 Dayflow Technologies Inc. All rights reserved.
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-card-wrapper">
          <div className="glass-card" style={{ padding: '40px 32px' }}>
            <div className="login-header-text">
              <h3>Change Your Password</h3>
              <p>Enter a new secure password to continue.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <div className="input-wrapper">
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-dim)' }} />
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNew(!showNew)}
                    disabled={isLoading}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                <div className="input-wrapper">
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-dim)' }} />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={isLoading}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error-banner">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

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
                    Change Password & Continue <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
