import { useState, useCallback, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import {
  Settings, Sun, Moon, Monitor, Bell, Globe, Shield, Lock,
  Save, RotateCcw, Eye, EyeOff, CheckCircle, AlertTriangle, X,
} from 'lucide-react';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese'];

const TIMEZONES = [
  'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00',
  'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00',
  'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00',
];

const SESSION_TIMEOUTS = [15, 30, 60, 120];

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
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border-color)' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  toast: { position: 'fixed', bottom: 24, right: 24, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success, #10b981)', fontSize: '0.85rem', fontWeight: 500, zIndex: 9999, backdropFilter: 'blur(12px)', animation: 'fadeInUp 0.3s ease', boxShadow: '0 8px 32px rgba(16,185,129,0.2)' },
  toastClose: { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 28, maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  modalIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: 16 },
  modalTitle: { color: 'white', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px 0' },
  modalMsg: { color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 24px 0', lineHeight: 1.5 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'center' },
  divider: { height: 1, background: 'var(--border-color)', margin: '16px 0' },
};

function Toast({ message, onClose }) {
  return (
    <div style={styles.toast}>
      <CheckCircle size={16} />
      <span>{message}</span>
      <button style={styles.toastClose} onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalIcon}><AlertTriangle size={28} /></div>
        <h3 style={styles.modalTitle}>{title}</h3>
        <p style={styles.modalMsg}>{message}</p>
        <div style={styles.modalActions}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Reset</button>
        </div>
      </div>
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
  const { settings, updatePreferences, updateSecurity, resetSettings } = useSettings();

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const [localPrefs, setLocalPrefs] = useState({ ...settings.preferences });
  const [localSec, setLocalSec] = useState({ ...settings.security });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });

  useEffect(() => {
    setLocalPrefs({ ...settings.preferences });
  }, [settings.preferences]);

  useEffect(() => {
    setLocalSec({ ...settings.security });
  }, [settings.security]);

  const showToast = useCallback((msg = 'Settings saved successfully!') => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const updatePref = (key, value) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      updatePreferences({ theme: value });
    }
  };
  const updateSec = (key, value) => setLocalSec(prev => ({ ...prev, [key]: value }));
  const updatePw = (key, value) => setPasswords(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updatePreferences({
      theme: localPrefs.theme,
      language: localPrefs.language,
      timezone: localPrefs.timezone,
      emailNotif: localPrefs.emailNotif,
      browserNotif: localPrefs.browserNotif,
    });
    updateSecurity({
      twoFactor: localSec.twoFactor,
      sessionTimeout: localSec.sessionTimeout,
      loginAlerts: localSec.loginAlerts,
    });
    showToast('Settings saved successfully!');
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showToast('Please fill in all password fields');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('New passwords do not match');
      return;
    }
    if (passwords.newPass.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }
    setPasswords({ current: '', newPass: '', confirm: '' });
    showToast('Password changed successfully!');
  };

  const handleReset = () => {
    setConfirmModal(true);
  };

  const confirmReset = () => {
    resetSettings();
    setPasswords({ current: '', newPass: '', confirm: '' });
    setConfirmModal(false);
    showToast('Settings reset to defaults!');
  };

  return (
    <div style={styles.page}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {confirmModal && (
        <ConfirmModal
          title="Reset to Defaults"
          message="This will reset all your settings to their default values. This action cannot be undone."
          onConfirm={confirmReset}
          onCancel={() => setConfirmModal(false)}
        />
      )}

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

      {/* Appearance */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Monitor size={18} /> Appearance</h3>
        <div style={styles.themeRow}>
          {THEME_OPTIONS.map(t => (
            <button
              key={t.key}
              type="button"
              style={styles.themeBtn(localPrefs.theme === t.key)}
              onClick={() => updatePref('theme', t.key)}
            >
              <t.icon size={20} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Bell size={18} /> Notifications</h3>
        <Toggle
          label="Email Notifications"
          description="Receive email alerts for important updates"
          checked={localPrefs.emailNotif}
          onChange={v => updatePref('emailNotif', v)}
        />
        <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
          <div style={styles.toggleInfo}>
            <span style={styles.toggleLabel}>Browser Notifications</span>
            <span style={styles.toggleDesc}>Show desktop notifications in your browser</span>
          </div>
          <button
            type="button"
            style={styles.toggleTrack(localPrefs.browserNotif)}
            onClick={() => updatePref('browserNotif', !localPrefs.browserNotif)}
            role="switch"
            aria-checked={localPrefs.browserNotif}
          >
            <span style={styles.toggleKnob(localPrefs.browserNotif)} />
          </button>
        </div>
      </div>

      {/* Language & Region */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Globe size={18} /> Language & Region</h3>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Language</label>
            <select
              style={styles.select}
              value={localPrefs.language}
              onChange={e => updatePref('language', e.target.value)}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Timezone</label>
            <select
              style={styles.select}
              value={localPrefs.timezone}
              onChange={e => updatePref('timezone', e.target.value)}
            >
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}><Shield size={18} /> Security</h3>

        {/* Change Password */}
        <h4 style={{ ...styles.sectionTitle, fontSize: '0.9rem', marginBottom: 12 }}>
          <Lock size={15} /> Change Password
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Current Password</label>
            <div style={styles.inputGroup}>
              <input
                type={showPw.current ? 'text' : 'password'}
                style={styles.input}
                value={passwords.current}
                onChange={e => updatePw('current', e.target.value)}
                placeholder="Enter current password"
              />
              <button type="button" style={styles.inputIcon} onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>New Password</label>
            <div style={styles.inputGroup}>
              <input
                type={showPw.newPass ? 'text' : 'password'}
                style={styles.input}
                value={passwords.newPass}
                onChange={e => updatePw('newPass', e.target.value)}
                placeholder="Enter new password"
              />
              <button type="button" style={styles.inputIcon} onClick={() => setShowPw(p => ({ ...p, newPass: !p.newPass }))}>
                {showPw.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Confirm New Password</label>
            <div style={styles.inputGroup}>
              <input
                type={showPw.confirm ? 'text' : 'password'}
                style={styles.input}
                value={passwords.confirm}
                onChange={e => updatePw('confirm', e.target.value)}
                placeholder="Confirm new password"
              />
              <button type="button" style={styles.inputIcon} onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handlePasswordChange} style={{ marginBottom: 8 }}>
          <Lock size={15} /> Update Password
        </button>

        <div style={styles.divider} />

        {/* 2FA */}
        <Toggle
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          checked={localSec.twoFactor}
          onChange={v => updateSec('twoFactor', v)}
        />

        {/* Session Timeout */}
        <div style={{ ...styles.toggleRow, gap: 16 }}>
          <div style={styles.toggleInfo}>
            <span style={styles.toggleLabel}>Session Timeout</span>
            <span style={styles.toggleDesc}>Auto-logout after inactivity</span>
          </div>
          <select
            style={{ ...styles.select, width: 'auto', minWidth: 100 }}
            value={localSec.sessionTimeout}
            onChange={e => updateSec('sessionTimeout', parseInt(e.target.value))}
          >
            {SESSION_TIMEOUTS.map(t => (
              <option key={t} value={t}>{t} min</option>
            ))}
          </select>
        </div>

        {/* Login Alerts */}
        <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
          <div style={styles.toggleInfo}>
            <span style={styles.toggleLabel}>Login Alerts</span>
            <span style={styles.toggleDesc}>Get notified when someone logs into your account</span>
          </div>
          <button
            type="button"
            style={styles.toggleTrack(localSec.loginAlerts)}
            onClick={() => updateSec('loginAlerts', !localSec.loginAlerts)}
            role="switch"
            aria-checked={localSec.loginAlerts}
          >
            <span style={styles.toggleKnob(localSec.loginAlerts)} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.card}>
        <div style={styles.actions}>
          <button className="btn btn-danger" onClick={handleReset}>
            <RotateCcw size={15} /> Reset to Defaults
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
