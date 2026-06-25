import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import {
  Settings, Building2, Clock, Wallet, Calendar, User, Shield, Database, Info,
  Save, Upload, Download, RefreshCw, Trash2, Eye, EyeOff, CheckCircle,
  AlertTriangle, Monitor, Lock, Smartphone, Bell, Sun, Moon, Laptop,
  HardDrive, RotateCcw, Users, X, LogOut, Key,
} from 'lucide-react';

const SECTIONS = [
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'leave', label: 'Leave', icon: Calendar },
  { key: 'preferences', label: 'Preferences', icon: User },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'data', label: 'Data Management', icon: Database },
  { key: 'about', label: 'About', icon: Info },
];

const CURRENCIES = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'INR', label: 'INR (₹)' },
  { code: 'JPY', label: 'JPY (¥)' },
  { code: 'CAD', label: 'CAD (C$)' },
  { code: 'AUD', label: 'AUD (A$)' },
];
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$' };
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' },
];
const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+05:30', 'UTC+06:00',
  'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00',
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`settings-toast ${type}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      <span>{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="settings-modal-overlay" onClick={onCancel}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className={`settings-modal-icon ${danger ? 'danger' : ''}`}>
          <AlertTriangle size={32} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="settings-modal-actions">
          <button className="settings-btn settings-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`settings-btn ${danger ? 'settings-btn-danger' : 'settings-btn-primary'}`} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="settings-section-header">
      <div className="settings-section-icon"><Icon size={20} /></div>
      <div>
        <h2 className="settings-section-title">{title}</h2>
        <p className="settings-section-desc">{description}</p>
      </div>
    </div>
  );
}

function FormGroup({ label, children, required, htmlFor }) {
  return (
    <div className="settings-form-group">
      <label htmlFor={htmlFor}>{label}{required && <span className="settings-required">*</span>}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-info">
        <span className="settings-toggle-label">{label}</span>
        {description && <span className="settings-toggle-desc">{description}</span>}
      </div>
      <button
        type="button"
        className={`settings-toggle ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="settings-toggle-knob" />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const {
    settings, loading, saving, updateCompany, updateAttendance, updatePayroll,
    updateLeave, updatePreferences, updateSecurity, changePassword,
    backupData, restoreData, resetData, fetchSettings,
  } = useSettings();

  const [activeSection, setActiveSection] = useState('company');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [localCompany, setLocalCompany] = useState(settings.company);
  const [localAttendance, setLocalAttendance] = useState(settings.attendance);
  const [localPayroll, setLocalPayroll] = useState(settings.payroll);
  const [localLeave, setLocalLeave] = useState(settings.leave);
  const [localPreferences, setLocalPreferences] = useState(settings.preferences);
  const [localSecurity, setLocalSecurity] = useState(settings.security);

  const [passwordFields, setPasswordFields] = useState({ current: '', newPass: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false, confirm: false });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      setLocalCompany(settings.company);
      setLocalAttendance(settings.attendance);
      setLocalPayroll(settings.payroll);
      setLocalLeave(settings.leave);
      setLocalPreferences(settings.preferences);
      setLocalSecurity(settings.security);
    }
  }, [loading, settings]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSaveCompany = async () => {
    const res = await updateCompany(localCompany);
    if (res.success) showToast('Company settings saved!');
    else showToast(res.message, 'error');
  };

  const handleSaveAttendance = async () => {
    const res = await updateAttendance(localAttendance);
    if (res.success) showToast('Attendance settings saved!');
    else showToast(res.message, 'error');
  };

  const handleSavePayroll = async () => {
    const res = await updatePayroll(localPayroll);
    if (res.success) showToast('Payroll settings saved!');
    else showToast(res.message, 'error');
  };

  const handleSaveLeave = async () => {
    const res = await updateLeave(localLeave);
    if (res.success) showToast('Leave settings saved!');
    else showToast(res.message, 'error');
  };

  const handleSavePreferences = async () => {
    const res = await updatePreferences(localPreferences);
    if (res.success) showToast('Preferences saved!');
    else showToast(res.message, 'error');
  };

  const handleSaveSecurity = async () => {
    const res = await updateSecurity(localSecurity);
    if (res.success) showToast('Security settings saved!');
    else showToast(res.message, 'error');
  };

  const handlePasswordChange = async () => {
    if (!passwordFields.current || !passwordFields.newPass || !passwordFields.confirm) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (passwordFields.newPass !== passwordFields.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordFields.newPass.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    const res = await changePassword(passwordFields.current, passwordFields.newPass);
    if (res.success) {
      setPasswordFields({ current: '', newPass: '', confirm: '' });
      showToast('Password changed successfully!');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleLogoUpload = (e) => {
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
      const base64 = event.target.result;
      setLocalCompany(prev => ({ ...prev, logo: base64 }));
      updateCompany({ ...localCompany, logo: base64 });
      showToast('Company logo uploaded!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setLocalCompany(prev => ({ ...prev, logo: '' }));
    updateCompany({ ...localCompany, logo: '' });
    showToast('Company logo removed');
  };

  const handleToggleDay = (day) => {
    setLocalAttendance(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleBackup = async () => {
    const res = await backupData();
    if (res.success) {
      const blob = new Blob([JSON.stringify(res.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hrms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup downloaded successfully!');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        setConfirmModal({
          title: 'Restore Backup',
          message: 'This will overwrite all current data. Are you sure?',
          danger: true,
          onConfirm: async () => {
            setConfirmModal(null);
            const res = await restoreData(backup);
            if (res.success) {
              await fetchSettings();
              showToast('Data restored successfully!');
            } else {
              showToast(res.message, 'error');
            }
          },
        });
      } catch {
        showToast('Invalid backup file', 'error');
      }
    };
    input.click();
  };

  const handleReset = () => {
    setConfirmModal({
      title: 'Reset All Data',
      message: 'This will permanently delete ALL data (employees, attendance, leaves, payroll, notifications, settings). This cannot be undone.',
      danger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        const res = await resetData();
        if (res.success) {
          showToast('All data has been reset!');
        } else {
          showToast(res.message, 'error');
        }
      },
    });
  };

  const renderCompany = () => (
    <div className="settings-section">
      <SectionHeader icon={Building2} title="Company Settings" description="Manage your company information and branding" />
      <div className="settings-card">
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleLogoUpload} style={{ display: 'none' }} />
        <div className="settings-logo-upload">
          <div className="settings-logo-preview" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            {localCompany.logo ? (
              <img src={localCompany.logo} alt="Company Logo" className="settings-logo-img" />
            ) : (
              <Building2 size={32} />
            )}
          </div>
          <div className="settings-logo-info">
            <span className="settings-logo-label">Company Logo</span>
            <span className="settings-logo-hint">Recommended: 200x200px, PNG or JPG (max 5MB)</span>
            <div className="settings-logo-actions">
              <button className="settings-btn settings-btn-secondary settings-btn-sm" onClick={handleLogoClick}>
                <Upload size={14} /> Upload Logo
              </button>
              {localCompany.logo && (
                <button className="settings-btn settings-btn-danger settings-btn-sm" onClick={handleRemoveLogo}>
                  <Trash2 size={14} /> Remove Logo
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="settings-form-grid">
          <FormGroup label="Company Name" required htmlFor="companyName">
            <input id="companyName" type="text" className="settings-input" value={localCompany.name} onChange={e => setLocalCompany(p => ({ ...p, name: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Company Email" required htmlFor="companyEmail">
            <input id="companyEmail" type="email" className="settings-input" value={localCompany.email} onChange={e => setLocalCompany(p => ({ ...p, email: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Phone Number" htmlFor="companyPhone">
            <input id="companyPhone" type="tel" className="settings-input" value={localCompany.phone} onChange={e => setLocalCompany(p => ({ ...p, phone: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Website" htmlFor="companyWebsite">
            <input id="companyWebsite" type="url" className="settings-input" value={localCompany.website} onChange={e => setLocalCompany(p => ({ ...p, website: e.target.value }))} />
          </FormGroup>
        </div>
        <FormGroup label="Address" htmlFor="companyAddress">
          <textarea id="companyAddress" className="settings-textarea" rows={3} value={localCompany.address} onChange={e => setLocalCompany(p => ({ ...p, address: e.target.value }))} />
        </FormGroup>
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSaveCompany} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="settings-section">
      <SectionHeader icon={Clock} title="Attendance Settings" description="Configure attendance rules and working hours" />
      <div className="settings-card">
        <div className="settings-form-grid">
          <FormGroup label="Office Start Time" required htmlFor="startTime">
            <input id="startTime" type="time" className="settings-input" value={localAttendance.startTime} onChange={e => setLocalAttendance(p => ({ ...p, startTime: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Office End Time" required htmlFor="endTime">
            <input id="endTime" type="time" className="settings-input" value={localAttendance.endTime} onChange={e => setLocalAttendance(p => ({ ...p, endTime: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Late Threshold (minutes)" htmlFor="lateThreshold">
            <input id="lateThreshold" type="number" className="settings-input" min={0} max={60} value={localAttendance.lateThreshold} onChange={e => setLocalAttendance(p => ({ ...p, lateThreshold: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Half Day Threshold (hours)" htmlFor="halfDayThreshold">
            <input id="halfDayThreshold" type="number" className="settings-input" min={0} max={8} step={0.5} value={localAttendance.halfDayThreshold} onChange={e => setLocalAttendance(p => ({ ...p, halfDayThreshold: parseFloat(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Working Hours" htmlFor="workingHours">
            <input id="workingHours" type="number" className="settings-input" min={1} max={12} step={0.5} value={localAttendance.workingHours} onChange={e => setLocalAttendance(p => ({ ...p, workingHours: parseFloat(e.target.value) || 8 }))} />
          </FormGroup>
          <FormGroup label="Grace Period (minutes)" htmlFor="gracePeriod">
            <input id="gracePeriod" type="number" className="settings-input" min={0} max={60} value={localAttendance.gracePeriod} onChange={e => setLocalAttendance(p => ({ ...p, gracePeriod: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
        </div>
        <FormGroup label="Working Days">
          <div className="settings-days-row">
            {DAYS.map(day => (
              <button key={day} type="button" className={`settings-day-btn ${localAttendance.workingDays?.includes(day) ? 'active' : ''}`} onClick={() => handleToggleDay(day)}>
                {day}
              </button>
            ))}
          </div>
        </FormGroup>
        <div className="settings-divider" />
        <Toggle label="Enable Overtime" description="Allow employees to log overtime hours" checked={localAttendance.overtimeEnabled} onChange={v => setLocalAttendance(p => ({ ...p, overtimeEnabled: v }))} />
        <Toggle label="Auto Mark Absent" description="Automatically mark employees absent if no check-in by end of day" checked={localAttendance.autoAbsent} onChange={v => setLocalAttendance(p => ({ ...p, autoAbsent: v }))} />
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSaveAttendance} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPayroll = () => (
    <div className="settings-section">
      <SectionHeader icon={Wallet} title="Payroll Settings" description="Configure payroll processing and compensation rules" />
      <div className="settings-card">
        <div className="settings-form-grid">
          <FormGroup label="Currency" htmlFor="currency">
            <select id="currency" className="settings-select" value={localPayroll.currency} onChange={e => {
              const code = e.target.value;
              setLocalPayroll(p => ({ ...p, currency: code, currencySymbol: CURRENCY_SYMBOLS[code] || '$' }));
            }}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Salary Cycle" htmlFor="salaryCycle">
            <select id="salaryCycle" className="settings-select" value={localPayroll.salaryCycle} onChange={e => setLocalPayroll(p => ({ ...p, salaryCycle: e.target.value }))}>
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
            </select>
          </FormGroup>
          <FormGroup label="Tax Percentage (%)" htmlFor="taxPercentage">
            <input id="taxPercentage" type="number" className="settings-input" min={0} max={50} step={0.5} value={localPayroll.taxPercentage} onChange={e => setLocalPayroll(p => ({ ...p, taxPercentage: parseFloat(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="PF Percentage (%)" htmlFor="pfPercentage">
            <input id="pfPercentage" type="number" className="settings-input" min={0} max={30} step={0.5} value={localPayroll.pfPercentage} onChange={e => setLocalPayroll(p => ({ ...p, pfPercentage: parseFloat(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Overtime Rate (x)" htmlFor="overtimeRate">
            <input id="overtimeRate" type="number" className="settings-input" min={1} max={5} step={0.25} value={localPayroll.overtimeRate} onChange={e => setLocalPayroll(p => ({ ...p, overtimeRate: parseFloat(e.target.value) || 1 }))} />
          </FormGroup>
          <FormGroup label="Bonus Percentage (%)" htmlFor="bonusPercentage">
            <input id="bonusPercentage" type="number" className="settings-input" min={0} max={50} step={0.5} value={localPayroll.bonusPercentage} onChange={e => setLocalPayroll(p => ({ ...p, bonusPercentage: parseFloat(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Generate Payroll Day" htmlFor="generateDay">
            <select id="generateDay" className="settings-select" value={localPayroll.generateDay} onChange={e => setLocalPayroll(p => ({ ...p, generateDay: parseInt(e.target.value) }))}>
              {Array.from({ length: 28 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} of each month</option>
              ))}
            </select>
          </FormGroup>
        </div>
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSavePayroll} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLeave = () => (
    <div className="settings-section">
      <SectionHeader icon={Calendar} title="Leave Settings" description="Configure leave types and approval policies" />
      <div className="settings-card">
        <div className="settings-form-grid">
          <FormGroup label="Casual Leave (days/year)" htmlFor="casualLeave">
            <input id="casualLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.casualLeave} onChange={e => setLocalLeave(p => ({ ...p, casualLeave: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Sick Leave (days/year)" htmlFor="sickLeave">
            <input id="sickLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.sickLeave} onChange={e => setLocalLeave(p => ({ ...p, sickLeave: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Earned Leave (days/year)" htmlFor="earnedLeave">
            <input id="earnedLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.earnedLeave} onChange={e => setLocalLeave(p => ({ ...p, earnedLeave: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Maternity Leave (days)" htmlFor="maternityLeave">
            <input id="maternityLeave" type="number" className="settings-input" min={0} max={180} value={localLeave.maternityLeave} onChange={e => setLocalLeave(p => ({ ...p, maternityLeave: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Paternity Leave (days)" htmlFor="paternityLeave">
            <input id="paternityLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.paternityLeave} onChange={e => setLocalLeave(p => ({ ...p, paternityLeave: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
        </div>
        <div className="settings-divider" />
        <Toggle label="Require Manager Approval" description="All leave requests must be approved by a manager before being processed" checked={localLeave.managerApproval} onChange={v => setLocalLeave(p => ({ ...p, managerApproval: v }))} />
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSaveLeave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="settings-section">
      <SectionHeader icon={User} title="User Preferences" description="Customize your account and interface settings" />
      <div className="settings-card">
        <h3 className="settings-card-title"><Key size={16} /> Change Password</h3>
        <div className="settings-form-grid">
          <FormGroup label="Current Password" htmlFor="currentPassword">
            <div className="settings-input-group">
              <input id="currentPassword" type={showPassword.current ? 'text' : 'password'} className="settings-input" value={passwordFields.current} onChange={e => setPasswordFields(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" />
              <button type="button" className="settings-input-icon" onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}>
                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormGroup>
          <FormGroup label="New Password" htmlFor="newPassword">
            <div className="settings-input-group">
              <input id="newPassword" type={showPassword.newPass ? 'text' : 'password'} className="settings-input" value={passwordFields.newPass} onChange={e => setPasswordFields(p => ({ ...p, newPass: e.target.value }))} placeholder="Enter new password" />
              <button type="button" className="settings-input-icon" onClick={() => setShowPassword(p => ({ ...p, newPass: !p.newPass }))}>
                {showPassword.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormGroup>
          <FormGroup label="Confirm New Password" htmlFor="confirmPassword">
            <div className="settings-input-group">
              <input id="confirmPassword" type={showPassword.confirm ? 'text' : 'password'} className="settings-input" value={passwordFields.confirm} onChange={e => setPasswordFields(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirm new password" />
              <button type="button" className="settings-input-icon" onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}>
                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormGroup>
        </div>
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handlePasswordChange} disabled={saving}>
            <Lock size={15} /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
        <div className="settings-divider" />
        <h3 className="settings-card-title"><Monitor size={16} /> Interface</h3>
        <FormGroup label="Theme">
          <div className="settings-theme-row">
            {[
              { key: 'dark', label: 'Dark', icon: Moon },
              { key: 'light', label: 'Light', icon: Sun },
              { key: 'system', label: 'System', icon: Laptop },
            ].map(t => (
              <button key={t.key} type="button" className={`settings-theme-btn ${localPreferences.theme === t.key ? 'active' : ''}`} onClick={() => setLocalPreferences(p => ({ ...p, theme: t.key }))}>
                <t.icon size={18} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </FormGroup>
        <div className="settings-form-grid">
          <FormGroup label="Language" htmlFor="language">
            <select id="language" className="settings-select" value={localPreferences.language} onChange={e => setLocalPreferences(p => ({ ...p, language: e.target.value }))}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Time Zone" htmlFor="timezone">
            <select id="timezone" className="settings-select" value={localPreferences.timezone} onChange={e => setLocalPreferences(p => ({ ...p, timezone: e.target.value }))}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Date Format" htmlFor="dateFormat">
            <select id="dateFormat" className="settings-select" value={localPreferences.dateFormat} onChange={e => setLocalPreferences(p => ({ ...p, dateFormat: e.target.value }))}>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            </select>
          </FormGroup>
        </div>
        <div className="settings-divider" />
        <h3 className="settings-card-title"><Bell size={16} /> Notifications</h3>
        <Toggle label="Email Notifications" description="Receive email alerts for important updates" checked={localPreferences.emailNotifications} onChange={v => setLocalPreferences(p => ({ ...p, emailNotifications: v }))} />
        <Toggle label="Browser Notifications" description="Show desktop notifications in your browser" checked={localPreferences.browserNotifications} onChange={v => setLocalPreferences(p => ({ ...p, browserNotifications: v }))} />
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSavePreferences} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="settings-section">
      <SectionHeader icon={Shield} title="Security Settings" description="Manage authentication and session security" />
      <div className="settings-card">
        <Toggle label="Two-Factor Authentication" description="Add an extra layer of security to your account" checked={localSecurity.twoFactorEnabled} onChange={v => setLocalSecurity(p => ({ ...p, twoFactorEnabled: v }))} />
        <FormGroup label="Session Timeout (minutes)" htmlFor="sessionTimeout">
          <input id="sessionTimeout" type="number" className="settings-input" min={5} max={480} value={localSecurity.sessionTimeout} onChange={e => setLocalSecurity(p => ({ ...p, sessionTimeout: parseInt(e.target.value) || 30 }))} style={{ maxWidth: 200 }} />
        </FormGroup>
        <Toggle label="Login Alerts" description="Get notified when someone logs into your account" checked={localSecurity.loginAlerts} onChange={v => setLocalSecurity(p => ({ ...p, loginAlerts: v }))} />
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSaveSecurity} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderData = () => (
    <div className="settings-section">
      <SectionHeader icon={Database} title="Data Management" description="Export, import, backup, and manage system data" />
      <div className="settings-card">
        <h3 className="settings-card-title"><Download size={16} /> Backup & Restore</h3>
        <div className="settings-data-actions">
          <button className="settings-btn settings-btn-secondary" onClick={handleBackup}>
            <HardDrive size={15} /> Backup Database
          </button>
          <button className="settings-btn settings-btn-secondary" onClick={handleRestore}>
            <RotateCcw size={15} /> Restore from Backup
          </button>
        </div>
        <div className="settings-divider" />
        <h3 className="settings-card-title"><Trash2 size={16} /> Danger Zone</h3>
        <div className="settings-danger-zone">
          <div className="settings-danger-info">
            <span className="settings-danger-label">Reset All Data</span>
            <span className="settings-danger-desc">Permanently delete all employees, attendance, leaves, payroll, notifications, and settings. This action cannot be undone.</span>
          </div>
          <button className="settings-btn settings-btn-danger" onClick={handleReset}>
            <RefreshCw size={15} /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="settings-section">
      <SectionHeader icon={Info} title="About System" description="System information and diagnostics" />
      <div className="settings-card">
        <div className="settings-about-grid">
          {[
            { label: 'Dayflow HRMS Version', value: 'v2.4.1', icon: Info },
            { label: 'React Version', value: 'v18.2.0', icon: Monitor },
            { label: 'Backend', value: 'Express + MongoDB', icon: Database },
            { label: 'Company', value: settings.company?.name || 'Dayflow Inc.', icon: Building2 },
            { label: 'Database Status', value: 'Connected', icon: CheckCircle },
          ].map((item, i) => (
            <div key={i} className="settings-about-item">
              <div className="settings-about-icon"><item.icon size={18} /></div>
              <div className="settings-about-info">
                <span className="settings-about-label">{item.label}</span>
                <span className="settings-about-value">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'company': return renderCompany();
      case 'attendance': return renderAttendance();
      case 'payroll': return renderPayroll();
      case 'leave': return renderLeave();
      case 'preferences': return renderPreferences();
      case 'security': return renderSecurity();
      case 'data': return renderData();
      case 'about': return renderAbout();
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <RefreshCw size={24} className="spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />}

      <div className="settings-header">
        <div>
          <h1 className="settings-title">
            <Settings size={24} style={{ color: 'var(--primary)' }} />
            Settings
          </h1>
          <p className="settings-subtitle">Manage your system configuration and preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {SECTIONS.map(s => (
            <button key={s.key} className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>
              <s.icon size={18} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
        <main className="settings-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
