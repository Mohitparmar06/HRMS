import { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, Building2,
  Shield, Heart, Edit, Save, X, Camera, Lock, Eye, EyeOff,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { useEmployees } from '../contexts/EmployeeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { departments } from '../services/dummyData';

const inputStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-color)',
  color: 'white',
  borderRadius: '10px',
  padding: '10px 14px',
  width: '100%',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.03) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.4)\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 12px center',
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmployeeProfile() {
  const { updateEmployee, getEmployee } = useEmployees();
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const latestEmployee = getEmployee(user.id);
  const currentEmp = latestEmployee || user;

  const [formData, setFormData] = useState({
    firstName: currentEmp.firstName,
    lastName: currentEmp.lastName,
    email: currentEmp.email,
    phone: currentEmp.phone || '',
    department: currentEmp.department,
    position: currentEmp.position,
    joinDate: currentEmp.joinDate || '',
    gender: currentEmp.gender || '',
    dob: currentEmp.dob || '',
    address: currentEmp.address || '',
    emergencyName: currentEmp.emergencyName || '',
    emergencyContact: currentEmp.emergencyContact || '',
    profilePicture: currentEmp.profilePicture || null,
  });

  useEffect(() => {
    if (!isEditing) {
      const latest = getEmployee(user.id) || user;
      setFormData({
        firstName: latest.firstName,
        lastName: latest.lastName,
        email: latest.email,
        phone: latest.phone || '',
        department: latest.department,
        position: latest.position,
        joinDate: latest.joinDate || '',
        gender: latest.gender || '',
        dob: latest.dob || '',
        address: latest.address || '',
        emergencyName: latest.emergencyName || '',
        emergencyContact: latest.emergencyContact || '',
        profilePicture: latest.profilePicture || null,
      });
    }
  }, [user, isEditing, getEmployee]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const deptColor = departments.find(d => d.name === formData.department)?.color || '#3b82f6';

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSaveProfile() {
    const updates = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      joinDate: formData.joinDate,
      gender: formData.gender,
      dob: formData.dob,
      address: formData.address,
      emergencyName: formData.emergencyName,
      emergencyContact: formData.emergencyContact,
      profilePicture: formData.profilePicture,
    };
    updateEmployee(currentEmp.id, updates);
    updateUser(updates);
    addNotification({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
      timestamp: new Date().toISOString(),
      category: 'System',
      priority: 'Low',
      read: false,
      targetEmployeeId: user.id,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      handleChange('profilePicture', dataUrl);
      updateEmployee(currentEmp.id, { profilePicture: dataUrl });
      updateUser({ profilePicture: dataUrl });
      setShowPhotoUpload(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    handleChange('profilePicture', null);
    updateEmployee(currentEmp.id, { profilePicture: null });
    updateUser({ profilePicture: null });
  }

  function validatePassword() {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handlePasswordChange() {
    if (!validatePassword()) return;
    setPasswordSuccess(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
    }, 2000);
  }

  function FieldDisplay({ label, value, icon: Icon }) {
    return (
      <div className="emp-profile-field">
        <span className="emp-profile-label">{label}</span>
        <span className="emp-profile-value">
          {Icon && <Icon size={14} />}
          {value || 'Not specified'}
        </span>
      </div>
    );
  }

  function FieldEdit({ label, field, type = 'text', options = null }) {
    return (
      <div className="emp-profile-field">
        <span className="emp-profile-label">{label}</span>
        {options ? (
          <select
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            style={selectStyle}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        )}
      </div>
    );
  }

  return (
    <div className="emp-profile">
      <div className="emp-profile-header">
        <div />
        <div className="emp-profile-actions">
          {saveSuccess && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--success)',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginRight: '12px',
            }}>
              <CheckCircle size={16} /> Profile saved successfully
            </span>
          )}
          {!isEditing ? (
            <>
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                <Lock size={16} /> Change Password
              </button>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <Edit size={16} /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                <X size={16} /> Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveProfile}>
                <Save size={16} /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="emp-profile-hero">
        <div
          className="emp-profile-avatar-lg"
          style={{
            background: `linear-gradient(135deg, ${deptColor}, ${deptColor}88)`,
            position: 'relative',
            cursor: isEditing ? 'pointer' : 'default',
          }}
          onClick={() => isEditing && setShowPhotoUpload(true)}
        >
          {formData.profilePicture ? (
            <img src={formData.profilePicture} alt={`${formData.firstName} ${formData.lastName}`} />
          ) : (
            <span>{currentEmp.avatar}</span>
          )}
          {isEditing && (
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Camera size={14} color="white" />
            </div>
          )}
        </div>
        <div className="emp-profile-hero-info">
          <h1>{formData.firstName} {formData.lastName}</h1>
          <p>{formData.position}</p>
          <div className="emp-profile-badges">
            <span
              className="emp-dept-badge-lg"
              style={{
                background: `${deptColor}15`,
                color: deptColor,
                borderColor: `${deptColor}30`,
              }}
            >
              <Building2 size={14} /> {formData.department}
            </span>
            <span className={`emp-status-lg ${currentEmp.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
              {currentEmp.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div className="emp-profile-grid">
        <div className="emp-profile-card">
          <h3><User size={16} /> Personal Information</h3>
          <div className="emp-profile-fields">
            <FieldDisplay label="Employee ID" value={currentEmp.id} />
            {isEditing ? (
              <>
                <FieldEdit label="First Name" field="firstName" />
                <FieldEdit label="Last Name" field="lastName" />
                <FieldEdit label="Email" field="email" type="email" />
                <FieldEdit label="Phone" field="phone" type="tel" />
                <FieldEdit label="Gender" field="gender" options={['Male', 'Female', 'Non-binary']} />
                <FieldEdit label="Date of Birth" field="dob" type="date" />
                <FieldEdit label="Address" field="address" />
              </>
            ) : (
              <>
                <FieldDisplay label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
                <FieldDisplay label="Email" value={formData.email} icon={Mail} />
                <FieldDisplay label="Phone" value={formData.phone} icon={Phone} />
                <FieldDisplay label="Gender" value={formData.gender} />
                <FieldDisplay label="Date of Birth" value={formData.dob ? formatDate(formData.dob) : 'Not specified'} icon={Calendar} />
                <FieldDisplay label="Address" value={formData.address} icon={MapPin} />
              </>
            )}
          </div>
        </div>

        <div className="emp-profile-card">
          <h3><Briefcase size={16} /> Employment Details</h3>
          <div className="emp-profile-fields">
            {isEditing ? (
              <>
                <FieldEdit
                  label="Department"
                  field="department"
                  options={departments.map(d => d.name)}
                />
                <FieldEdit label="Position" field="position" />
                <FieldEdit label="Join Date" field="joinDate" type="date" />
              </>
            ) : (
              <>
                <div className="emp-profile-field">
                  <span className="emp-profile-label">Department</span>
                  <span className="emp-profile-value" style={{ color: deptColor }}>
                    {formData.department}
                  </span>
                </div>
                <FieldDisplay label="Designation" value={formData.position} />
                <FieldDisplay label="Joining Date" value={formatDate(formData.joinDate)} icon={Calendar} />
              </>
            )}
            <div className="emp-profile-field">
              <span className="emp-profile-label">Status</span>
              <span className={`emp-status-inline ${currentEmp.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                {currentEmp.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="emp-profile-card">
          <h3><Shield size={16} /> Emergency Contact</h3>
          <div className="emp-profile-fields">
            {isEditing ? (
              <>
                <FieldEdit label="Contact Name" field="emergencyName" />
                <FieldEdit label="Contact Phone" field="emergencyContact" />
              </>
            ) : (
              <>
                <FieldDisplay label="Contact Name" value={formData.emergencyName} icon={Heart} />
                <FieldDisplay label="Contact Phone" value={formData.emergencyContact} icon={Phone} />
              </>
            )}
          </div>
        </div>

        <div className="emp-profile-card">
          <h3><User size={16} /> Profile Photo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${deptColor}, ${deptColor}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white',
                fontWeight: 700,
                overflow: 'hidden',
              }}
            >
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                currentEmp.avatar
              )}
            </div>
            <button
              className="btn btn-outline"
              onClick={() => setShowPhotoUpload(true)}
            >
              <Camera size={16} /> {formData.profilePicture ? 'Change Photo' : 'Upload Photo'}
            </button>
            {formData.profilePicture && (
              <button
                className="btn btn-outline"
                onClick={handleRemovePhoto}
                style={{ color: 'var(--danger)' }}
              >
                <X size={16} /> Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {showPhotoUpload && (
        <div className="modal-overlay" onClick={() => setShowPhotoUpload(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3><Camera size={18} /> Upload Profile Photo</h3>
              <button className="modal-close" onClick={() => setShowPhotoUpload(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${deptColor}, ${deptColor}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '2.4rem',
                  color: 'white',
                  fontWeight: 700,
                  overflow: 'hidden',
                }}
              >
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  currentEmp.avatar
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Choose a photo from your device. JPG, PNG or GIF. Max 5MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setShowPhotoUpload(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={16} /> Choose File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3><Lock size={18} /> Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {passwordSuccess ? (
                <div style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CheckCircle size={28} color="var(--success)" />
                  </div>
                  <p style={{ color: 'var(--success)', fontWeight: 600 }}>Password changed successfully!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        style={{
                          ...inputStyle,
                          paddingRight: '40px',
                          borderColor: passwordErrors.currentPassword ? 'var(--danger)' : 'var(--border-color)',
                        }}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                        {passwordErrors.currentPassword}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        style={{
                          ...inputStyle,
                          paddingRight: '40px',
                          borderColor: passwordErrors.newPassword ? 'var(--danger)' : 'var(--border-color)',
                        }}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                        {passwordErrors.newPassword}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        style={{
                          ...inputStyle,
                          paddingRight: '40px',
                          borderColor: passwordErrors.confirmPassword ? 'var(--danger)' : 'var(--border-color)',
                        }}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                        {passwordErrors.confirmPassword}
                      </span>
                    )}
                  </div>

                  {passwordData.newPassword && passwordData.newPassword.length < 6 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderRadius: '10px',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                    }}>
                      <AlertTriangle size={14} color="var(--warning)" />
                      <span style={{ color: 'var(--warning)', fontSize: '0.82rem' }}>
                        Password must be at least 6 characters
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handlePasswordChange}>
                      <Lock size={16} /> Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
