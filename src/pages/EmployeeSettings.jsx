import { useState, useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings, Sun, Moon, Monitor, Bell, Globe, Shield, Lock,
  Save, Eye, EyeOff, CheckCircle, AlertTriangle, X,
  Phone, MapPin, Camera, User,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
];

const TIMEZONES = [
  'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00',
  'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00',
  'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00',
];

const THEME_OPTIONS = [
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'system', label: 'System', icon: Monitor },
];

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10 },
  title: { fontSize: '1.8rem', color: 'white', margin: 0 },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 },
  card: { background: 'var(--bg-card)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' },
  sectionTitle: { color: 'white', fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' },
  toggleInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  toggleLabel: { color: 'white', fontSize: '0.9rem', fontWeight: 500 },
  toggleDesc: { color: 'var(--text-muted)', fontSize: '0.8rem' },
  toggleTrack: (active) => ({
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.25s ease',
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
    border: 'none', padding: 0, flexShrink: 0,
  }),
  toggleKnob: (active) => ({
    position: 'absolute', top: 2, left: active ? 22 : 2,
    width: 20, height: 20, borderRadius: '50%', background: 'white',
    transition: 'left 0.25s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  }),
  input: { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: '0.9rem', fontFamily: 'var(--font-main)', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },
  select: { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: '0.9rem', fontFamily: 'var(--font-main)', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23999' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', boxSizing: 'border-box' },
  textarea: { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: '0.9rem', fontFamily: 'var(--font-main)', outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  formLabel: { color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 },
  themeRow: { display: 'flex', gap: 10, marginBottom: 16 },
  themeBtn: (active) => ({
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '14px 12px', borderRadius: 12, cursor: 'pointer', border: '1px solid',
    borderColor: active ? 'var(--primary)' : 'var(--border-color)',
    background: active ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    transition: 'all 0.2s', fontFamily: 'var(--font-main)', fontSize: '0.8rem', fontWeight: 500,
  }),
  actions: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border-color)' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  toast: (type) => ({
    position: 'fixed', bottom: 24, right: 24, display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 20px', borderRadius: 12,
    background: type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
    color: type === 'error' ? '#ef4444' : 'var(--success, #10b981)',
    fontSize: '0.85rem', fontWeight: 500, zIndex: 9999, backdropFilter: 'blur(12px)',
    animation: 'fadeInUp 0.3s ease',
    boxShadow: `0 8px 32px ${type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
  }),
  toastClose: { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 },
  divider: { height: 1, background: 'var(--border-color)', margin: '16px 0' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer' },
  avatarOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' },
};

function Toast({ message, type = 'success', onClose }) {
  return (
    <div style={styles.toast(type)}>
      {type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
      <span>{message}</span>
      <button style={styles.toastClose} onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div style={styles.toggleRow}>
      <div style={styles.toggleInfo}>
        <span style={styles.toggleLabel}>{label}</span>
        {description && <span style={styles.toggleDesc}>{description}</span>}
      </div>
      <button type="button" style={styles.toggleTrack(checked)} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
        <span style={styles.toggleKnob(checked)} />
      </button>
    </div>
  );
}

export default function EmployeeSettings() {
  const {
    userPreferences, userProfile, updateUserPreferences, updateUserProfile,
    changePassword, saving, fetchUserPreferences, fetchUserProfile,
  } = useSettings();
  const { user, updateUser } = useAuth();

  const [toast, setToast] = useState(null);

  const [localPrefs, setLocalPrefs] = useState(userPreferences);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });

  const [profile, setProfile] = useState({
    phone: '',
    address: '',
    profileImage: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setProfile({
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        profileImage: userProfile.profileImage || '',
      });
    } else if (user) {
      setProfile({
        phone: user.phone || '',
        address: user.address || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [userProfile, user]);

  useEffect(() => {
    setLocalPrefs(userPreferences);
  }, [userPreferences]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const result = await updateUserProfile({
        phone: profile.phone,
        address: profile.address,
        profileImage: profile.profileImage,
      });
      if (result.success) {
        updateUser({
          phone: profile.phone,
          address: profile.address,
          profileImage: profile.profileImage,
        });
        showToast('Profile updated successfully!');
      } else {
        showToast(result.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    const result = await updateUserPreferences(localPrefs);
    if (result.success) {
      showToast('Settings saved!');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwords.newPass.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    const result = await changePassword(passwords.current, passwords.newPass);
    if (result.success) {
      setPasswords({ current: '', newPass: '', confirm: '' });
      showToast('Password changed successfully!');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      showToast('Please select a PNG, JPG, or JPEG file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile(prev => ({ ...prev, profileImage: event.target.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getInitials = () => {
    const name = user?.fullName || user?.name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <div style={styles.titleRow}>
              <Settings size={24} style={{ color: 'var(--primary)' }} />
              Settings
            </div>
          </h1>
          <p style={styles.subtitle}>Manage your preferences and account settings</p>
        </div>
      </div>

      {/* Profile */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><User size={18} /> Profile</h3>
        <div style={styles.profileHeader}>
          <div style={styles.avatar} onClick={() => fileInputRef.current?.click()}>
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getInitials()
            )}
            <div style={styles.avatarOverlay}>
              <Camera size={20} color="white" />
            </div>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>{user?.fullName || user?.name || 'User'}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.designation || user?.position || ''}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.department || ''}</div>
          </div>
        </div>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Phone Number</label>
            <div style={styles.inputGroup}>
              <Phone size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
              <input type="tel" style={{ ...styles.input, paddingLeft: 34 }} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>
        <div style={{ ...styles.formGroup, marginTop: 12 }}>
          <label style={styles.formLabel}>Address</label>
          <div style={styles.inputGroup}>
            <MapPin size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <textarea style={{ ...styles.textarea, paddingLeft: 34 }} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Enter your address" rows={2} />
          </div>
        </div>
        <div style={{ ...styles.actions, borderTop: 'none', paddingTop: 8 }}>
          <div />
          <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
            <Save size={15} /> {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Monitor size={18} /> Appearance</h3>
        <div style={styles.themeRow}>
          {THEME_OPTIONS.map(t => (
            <button key={t.key} type="button" style={styles.themeBtn(localPrefs.theme === t.key)} onClick={() => setLocalPrefs(p => ({ ...p, theme: t.key }))}>
              <t.icon size={20} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Bell size={18} /> Notifications</h3>
        <Toggle label="Email Notifications" description="Receive email alerts for important updates" checked={localPrefs.emailNotifications} onChange={v => setLocalPrefs(p => ({ ...p, emailNotifications: v }))} />
        <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
          <div style={styles.toggleInfo}>
            <span style={styles.toggleLabel}>Browser Notifications</span>
            <span style={styles.toggleDesc}>Show desktop notifications in your browser</span>
          </div>
          <button type="button" style={styles.toggleTrack(localPrefs.browserNotifications)} onClick={() => setLocalPrefs(p => ({ ...p, browserNotifications: !p.browserNotifications }))} role="switch" aria-checked={localPrefs.browserNotifications}>
            <span style={styles.toggleKnob(localPrefs.browserNotifications)} />
          </button>
        </div>
      </div>

      {/* Language & Region */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Globe size={18} /> Language & Region</h3>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Language</label>
            <select style={styles.select} value={localPrefs.language} onChange={e => setLocalPrefs(p => ({ ...p, language: e.target.value }))}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Timezone</label>
            <select style={styles.select} value={localPrefs.timezone} onChange={e => setLocalPrefs(p => ({ ...p, timezone: e.target.value }))}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Date Format</label>
            <select style={styles.select} value={localPrefs.dateFormat} onChange={e => setLocalPrefs(p => ({ ...p, dateFormat: e.target.value }))}>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Shield size={18} /> Security</h3>
        <h4 style={{ ...styles.sectionTitle, fontSize: '0.9rem', marginBottom: 12 }}>
          <Lock size={15} /> Change Password
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Current Password</label>
            <div style={styles.inputGroup}>
              <input type={showPw.current ? 'text' : 'password'} style={styles.input} value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" />
              <button type="button" style={styles.inputIcon} onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>New Password</label>
            <div style={styles.inputGroup}>
              <input type={showPw.newPass ? 'text' : 'password'} style={styles.input} value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} placeholder="Enter new password" />
              <button type="button" style={styles.inputIcon} onClick={() => setShowPw(p => ({ ...p, newPass: !p.newPass }))}>
                {showPw.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Confirm New Password</label>
            <div style={styles.inputGroup}>
              <input type={showPw.confirm ? 'text' : 'password'} style={styles.input} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirm new password" />
              <button type="button" style={styles.inputIcon} onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handlePasswordChange} disabled={saving}>
          <Lock size={15} /> {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* Action Buttons */}
      <div style={styles.card}>
        <div style={styles.actions}>
          <div />
          <button className="btn btn-primary" onClick={handleSavePreferences} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
