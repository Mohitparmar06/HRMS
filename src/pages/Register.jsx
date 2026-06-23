import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ClipboardCheck, ArrowUpRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Employee');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation & Loading States
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number (8-15 digits)';
    }

    if (!department) {
      newErrors.department = 'Department is required';
    }

    if (!role) {
      newErrors.role = 'Role is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      // Simulate API registration lag before success routing
      setTimeout(() => {
        setIsLoading(false);
        navigate('/login');
      }, 1500);
    }
  };

  return (
    <div className="login-split-container">
      {/* Left Panel - Brand Showcase & Onboarding Status */}
      <div className="login-left-panel">
        <Link to="/" className="login-logo-section logo" style={{ textDecoration: 'none' }}>
          <div className="logo-dot"></div>
          <span>Dayflow</span>
        </Link>

        <div className="login-welcome-section animate-fade-in-up">
          <h2 style={{ color: 'white' }}>Join the <br /><span className="gradient-text">Dayflow Workspace.</span></h2>
          <p>
            Set up your professional identity, align your department rosters, log work hours, and access automated self-service payroll configurations.
          </p>

          {/* Setup / Onboarding Status Card Mockup */}
          <div className="glass-card animate-float" style={{ padding: '24px', maxWidth: '380px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge-title" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Workspace setup status
              </span>
              <span style={{ color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={12} /> 75%
              </span>
            </div>

            {/* Simulated progress indicator */}
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '100px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: '75%', height: '100%', background: 'var(--gradient-primary)', borderRadius: '100px' }}></div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'white' }}>
                <CheckCircle size={14} style={{ color: '#22c55e' }} />
                <span>Configure corporate settings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'white' }}>
                <CheckCircle size={14} style={{ color: '#22c55e' }} />
                <span>Upload department lists</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', display: 'inline-block' }}></span>
                <span>Invite employees to onboard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-left-footer">
          © 2026 Dayflow Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Glassmorphism Form Card */}
      <div className="login-right-panel" style={{ padding: '60px 40px' }}>
        <div className="login-card-wrapper" style={{ maxWidth: '620px' }}>
          <div className="glass-card" style={{ padding: '40px 32px' }}>
            <div className="login-header-text">
              <h3>Create Your Account</h3>
              <p>Fill in the details to establish your employee profile.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    disabled={isLoading}
                  />
                  {errors.fullName && (
                    <span className="validation-error-msg">
                      <AlertCircle size={14} /> {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Employee ID */}
                <div className="form-group">
                  <label htmlFor="employeeId" className="form-label">Employee ID</label>
                  <input
                    id="employeeId"
                    type="text"
                    className={`form-input ${errors.employeeId ? 'error' : ''}`}
                    placeholder="e.g. DF-9082"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      if (errors.employeeId) setErrors(prev => ({ ...prev, employeeId: '' }));
                    }}
                    disabled={isLoading}
                  />
                  {errors.employeeId && (
                    <span className="validation-error-msg">
                      <AlertCircle size={14} /> {errors.employeeId}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="text"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="david@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="validation-error-msg">
                      <AlertCircle size={14} /> {errors.email}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <span className="validation-error-msg">
                      <AlertCircle size={14} /> {errors.phone}
                    </span>
                  )}
                </div>

                {/* Department Dropdown */}
                <div className="form-group">
                  <label htmlFor="department" className="form-label">Department</label>
                  <select
                    id="department"
                    className={`form-input ${errors.department ? 'error' : ''}`}
                    style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)', color: department ? 'white' : 'var(--text-dim)' }}
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errors.department) setErrors(prev => ({ ...prev, department: '' }));
                    }}
                    disabled={isLoading}
                  >
                    <option value="" style={{ background: '#0d0e25' }}>Select Department</option>
                    <option value="Engineering" style={{ background: '#0d0e25' }}>Engineering</option>
                    <option value="Human Resources" style={{ background: '#0d0e25' }}>Human Resources</option>
                    <option value="Finance" style={{ background: '#0d0e25' }}>Finance</option>
                    <option value="Sales & Marketing" style={{ background: '#0d0e25' }}>Sales & Marketing</option>
                    <option value="Product Management" style={{ background: '#0d0e25' }}>Product Management</option>
                  </select>
                  {errors.department && (
                    <span className="validation-error-msg">
                      <AlertCircle size={14} /> {errors.department}
                    </span>
                  )}
                </div>

                {/* Role Dropdown */}
                <div className="form-group">
                  <label htmlFor="role" className="form-label">System Role</label>
                  <select
                    id="role"
                    className="form-input"
                    style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)' }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Employee" style={{ background: '#0d0e25' }}>Employee</option>
                    <option value="HR Manager" style={{ background: '#0d0e25' }}>HR Manager</option>
                  </select>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={togglePassword}
                      disabled={isLoading}
                      aria-label="Toggle password"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="validation-error-msg">
                      <AlertCircle size={14} /> {errors.password}
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={toggleConfirmPassword}
                      disabled={isLoading}
                      aria-label="Toggle password"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="validation-error-msg">
                      <AlertCircle size={14} /> {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '24px' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Complete Onboarding <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>

            {/* Footer signup prompt */}
            <div className="login-footer-text" style={{ marginTop: '24px' }}>
              Already have an account? <Link to="/login">Log In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
