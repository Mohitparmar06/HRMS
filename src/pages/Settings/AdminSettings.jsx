import { useState, useCallback, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useNotifications } from '../../contexts/NotificationsContext';
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

const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'JPY (¥)', 'CAD (C$)', 'AUD (A$)'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Hindi', 'Japanese'];
const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+05:30', 'UTC+06:00',
  'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00',
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Toast({ message, onClose }) {
  return (
    <div className="settings-toast">
      <CheckCircle size={16} />
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
    settings, updateCompany, updateAttendance, updatePayroll, updateLeave,
    updatePreferences, updateSecurity, resetSettings,
  } = useSettings();
  const { addNotification } = useNotifications();

  const [activeSection, setActiveSection] = useState('company');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [localCompany, setLocalCompany] = useState({ ...settings.company });
  const [localAttendance, setLocalAttendance] = useState({ ...settings.attendance });
  const [localPayroll, setLocalPayroll] = useState({ ...settings.payroll });
  const [localLeave, setLocalLeave] = useState({ ...settings.leave });
  const [localPreferences, setLocalPreferences] = useState({
    ...settings.preferences,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [localSecurity, setLocalSecurity] = useState({ ...settings.security });
  const [devices] = useState([
    { id: 1, name: 'Chrome on Windows', ip: '192.168.1.105', lastActive: '2 min ago', current: true },
    { id: 2, name: 'Safari on iPhone', ip: '10.0.0.42', lastActive: '3 hours ago', current: false },
    { id: 3, name: 'Firefox on MacOS', ip: '172.16.0.88', lastActive: '1 day ago', current: false },
  ]);

  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const fileInputRef = useRef(null);

  const showToast = useCallback((msg = 'Settings saved successfully!') => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addSettingsNotification = useCallback((title, description) => {
    if (addNotification) {
      addNotification({
        id: Date.now(),
        title,
        description,
        timestamp: new Date().toISOString(),
        category: 'System',
        priority: 'Medium',
        read: false,
        targetEmployeeId: null,
      });
    }
  }, [addNotification]);

  const handleSaveCompany = () => {
    updateCompany(localCompany);
    addSettingsNotification('Company settings updated', `Company name changed to "${localCompany.name}"`);
    showToast('Company settings saved!');
  };

  const handleSaveAttendance = () => {
    updateAttendance(localAttendance);
    addSettingsNotification('Attendance settings updated', `Office hours set to ${localAttendance.startTime} - ${localAttendance.endTime}`);
    showToast('Attendance settings saved!');
  };

  const handleSavePayroll = () => {
    updatePayroll(localPayroll);
    addSettingsNotification('Payroll settings updated', `Currency set to ${localPayroll.currency}, tax rate: ${localPayroll.taxPercent}%`);
    showToast('Payroll settings saved!');
  };

  const handleSaveLeave = () => {
    updateLeave(localLeave);
    addSettingsNotification('Leave settings updated', `Leave limits updated - Casual: ${localLeave.casual}, Sick: ${localLeave.sick}`);
    showToast('Leave settings saved!');
  };

  const handleSavePreferences = () => {
    updatePreferences({
      theme: localPreferences.theme,
      language: localPreferences.language,
      timezone: localPreferences.timezone,
      emailNotif: localPreferences.emailNotif,
      browserNotif: localPreferences.browserNotif,
    });
    showToast('Preferences saved!');
  };

  const handleSaveSecurity = () => {
    updateSecurity(localSecurity);
    addSettingsNotification('Security settings updated', `2FA: ${localSecurity.twoFactor ? 'Enabled' : 'Disabled'}`);
    showToast('Security settings saved!');
  };

  const handlePasswordChange = () => {
    if (!localPreferences.currentPassword || !localPreferences.newPassword || !localPreferences.confirmPassword) {
      showToast('Please fill in all password fields');
      return;
    }
    if (localPreferences.newPassword !== localPreferences.confirmPassword) {
      showToast('New passwords do not match');
      return;
    }
    if (localPreferences.newPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }
    setLocalPreferences(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    showToast('Password changed successfully!');
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a PNG, JPG, or JPEG file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setLocalCompany(prev => ({ ...prev, logo: base64 }));
      updateCompany({ logo: base64 });
      showToast('Company logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setLocalCompany(prev => ({ ...prev, logo: null }));
    updateCompany({ logo: null });
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

  const handleLogoutAll = () => {
    setConfirmModal({
      title: 'Logout All Devices',
      message: 'This will sign you out from all other devices. You will need to sign in again on those devices.',
      danger: false,
      onConfirm: () => {
        setConfirmModal(null);
        showToast('Logged out from all other devices!');
      },
    });
  };

  const handleResetDemo = () => {
    setConfirmModal({
      title: 'Reset Demo Data',
      message: 'This will reset all settings to default values. This action cannot be undone.',
      danger: true,
      onConfirm: () => {
        resetSettings();
        setLocalCompany({ ...settings.company });
        setLocalAttendance({ ...settings.attendance });
        setLocalPayroll({ ...settings.payroll });
        setLocalLeave({ ...settings.leave });
        setLocalPreferences({ ...settings.preferences, currentPassword: '', newPassword: '', confirmPassword: '' });
        setLocalSecurity({ ...settings.security });
        setConfirmModal(null);
        showToast('Settings have been reset to defaults!');
      },
    });
  };

  const handleExport = (type) => {
    showToast(`${type} data exported successfully!`);
  };

  const handleImport = () => {
    showToast('Employee data imported successfully!');
  };

  const handleBackup = () => {
    showToast('Database backup created successfully!');
  };

  const handleRestore = () => {
    setConfirmModal({
      title: 'Restore Backup',
      message: 'This will restore the database to the last backup. Current data will be overwritten.',
      danger: true,
      onConfirm: () => {
        setConfirmModal(null);
        showToast('Database restored successfully!');
      },
    });
  };

  const renderCompany = () => (
    <div className="settings-section">
      <SectionHeader icon={Building2} title="Company Settings" description="Manage your company information and branding" />
      <div className="settings-card">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleLogoUpload}
          style={{ display: 'none' }}
        />
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
          <button className="settings-btn settings-btn-primary" onClick={handleSaveCompany}>
            <Save size={15} /> Save Changes
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
          <FormGroup label="Grace Period (minutes)" htmlFor="gracePeriod">
            <input id="gracePeriod" type="number" className="settings-input" min={0} max={60} value={localAttendance.gracePeriod} onChange={e => setLocalAttendance(p => ({ ...p, gracePeriod: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
        </div>
        <FormGroup label="Working Days">
          <div className="settings-days-row">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                className={`settings-day-btn ${localAttendance.workingDays.includes(day) ? 'active' : ''}`}
                onClick={() => handleToggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </FormGroup>
        <div className="settings-divider" />
        <Toggle
          label="Enable Overtime"
          description="Allow employees to log overtime hours"
          checked={localAttendance.overtime}
          onChange={v => setLocalAttendance(p => ({ ...p, overtime: v }))}
        />
        <Toggle
          label="Auto Mark Absent"
          description="Automatically mark employees absent if no check-in by end of day"
          checked={localAttendance.autoAbsent}
          onChange={v => setLocalAttendance(p => ({ ...p, autoAbsent: v }))}
        />
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSaveAttendance}>
            <Save size={15} /> Save Settings
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
            <select id="currency" className="settings-select" value={localPayroll.currency} onChange={e => setLocalPayroll(p => ({ ...p, currency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Salary Cycle" htmlFor="salaryCycle">
            <select id="salaryCycle" className="settings-select" value={localPayroll.cycle} onChange={e => setLocalPayroll(p => ({ ...p, cycle: e.target.value }))}>
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </FormGroup>
          <FormGroup label="Tax Percentage (%)" htmlFor="taxPercent">
            <input id="taxPercent" type="number" className="settings-input" min={0} max={50} step={0.5} value={localPayroll.taxPercent} onChange={e => setLocalPayroll(p => ({ ...p, taxPercent: parseFloat(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Overtime Rate (x)" htmlFor="overtimeRate">
            <input id="overtimeRate" type="number" className="settings-input" min={1} max={5} step={0.25} value={localPayroll.overtimeRate} onChange={e => setLocalPayroll(p => ({ ...p, overtimeRate: parseFloat(e.target.value) || 1 }))} />
          </FormGroup>
          <FormGroup label="Bonus Percentage (%)" htmlFor="bonusPercent">
            <input id="bonusPercent" type="number" className="settings-input" min={0} max={50} step={0.5} value={localPayroll.bonusPercent} onChange={e => setLocalPayroll(p => ({ ...p, bonusPercent: parseFloat(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Generate Payroll Date" htmlFor="generateDate">
            <select id="generateDate" className="settings-select" value={localPayroll.generateDate} onChange={e => setLocalPayroll(p => ({ ...p, generateDate: e.target.value }))}>
              {Array.from({ length: 28 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} of each month</option>
              ))}
            </select>
          </FormGroup>
        </div>
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSavePayroll}>
            <Save size={15} /> Save Settings
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
            <input id="casualLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.casual} onChange={e => setLocalLeave(p => ({ ...p, casual: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Sick Leave (days/year)" htmlFor="sickLeave">
            <input id="sickLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.sick} onChange={e => setLocalLeave(p => ({ ...p, sick: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Earned Leave (days/year)" htmlFor="earnedLeave">
            <input id="earnedLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.earned} onChange={e => setLocalLeave(p => ({ ...p, earned: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Maternity Leave (days)" htmlFor="maternityLeave">
            <input id="maternityLeave" type="number" className="settings-input" min={0} max={180} value={localLeave.maternity} onChange={e => setLocalLeave(p => ({ ...p, maternity: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
          <FormGroup label="Paternity Leave (days)" htmlFor="paternityLeave">
            <input id="paternityLeave" type="number" className="settings-input" min={0} max={30} value={localLeave.paternity} onChange={e => setLocalLeave(p => ({ ...p, paternity: parseInt(e.target.value) || 0 }))} />
          </FormGroup>
        </div>
        <div className="settings-divider" />
        <Toggle
          label="Require Manager Approval"
          description="All leave requests must be approved by a manager before being processed"
          checked={localLeave.managerApproval}
          onChange={v => setLocalLeave(p => ({ ...p, managerApproval: v }))}
        />
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSaveLeave}>
            <Save size={15} /> Save Settings
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
              <input id="currentPassword" type={showPassword.current ? 'text' : 'password'} className="settings-input" value={localPreferences.currentPassword} onChange={e => setLocalPreferences(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" />
              <button type="button" className="settings-input-icon" onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}>
                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormGroup>
          <FormGroup label="New Password" htmlFor="newPassword">
            <div className="settings-input-group">
              <input id="newPassword" type={showPassword.new ? 'text' : 'password'} className="settings-input" value={localPreferences.newPassword} onChange={e => setLocalPreferences(p => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password" />
              <button type="button" className="settings-input-icon" onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}>
                {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormGroup>
          <FormGroup label="Confirm New Password" htmlFor="confirmPassword">
            <div className="settings-input-group">
              <input id="confirmPassword" type={showPassword.confirm ? 'text' : 'password'} className="settings-input" value={localPreferences.confirmPassword} onChange={e => setLocalPreferences(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
              <button type="button" className="settings-input-icon" onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}>
                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormGroup>
        </div>
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handlePasswordChange}>
            <Lock size={15} /> Update Password
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
              <button
                key={t.key}
                type="button"
                className={`settings-theme-btn ${localPreferences.theme === t.key ? 'active' : ''}`}
                onClick={() => setLocalPreferences(p => ({ ...p, theme: t.key }))}
              >
                <t.icon size={18} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </FormGroup>
        <div className="settings-form-grid">
          <FormGroup label="Language" htmlFor="language">
            <select id="language" className="settings-select" value={localPreferences.language} onChange={e => setLocalPreferences(p => ({ ...p, language: e.target.value }))}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Time Zone" htmlFor="timezone">
            <select id="timezone" className="settings-select" value={localPreferences.timezone} onChange={e => setLocalPreferences(p => ({ ...p, timezone: e.target.value }))}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormGroup>
        </div>
        <div className="settings-divider" />
        <h3 className="settings-card-title"><Bell size={16} /> Notifications</h3>
        <Toggle
          label="Email Notifications"
          description="Receive email alerts for important updates"
          checked={localPreferences.emailNotif}
          onChange={v => setLocalPreferences(p => ({ ...p, emailNotif: v }))}
        />
        <Toggle
          label="Browser Notifications"
          description="Show desktop notifications in your browser"
          checked={localPreferences.browserNotif}
          onChange={v => setLocalPreferences(p => ({ ...p, browserNotif: v }))}
        />
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSavePreferences}>
            <Save size={15} /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="settings-section">
      <SectionHeader icon={Shield} title="Security Settings" description="Manage authentication and session security" />
      <div className="settings-card">
        <Toggle
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          checked={localSecurity.twoFactor}
          onChange={v => setLocalSecurity(p => ({ ...p, twoFactor: v }))}
        />
        <FormGroup label="Session Timeout (minutes)" htmlFor="sessionTimeout">
          <input id="sessionTimeout" type="number" className="settings-input" min={5} max={480} value={localSecurity.sessionTimeout} onChange={e => setLocalSecurity(p => ({ ...p, sessionTimeout: parseInt(e.target.value) || 30 }))} style={{ maxWidth: 200 }} />
        </FormGroup>
        <Toggle
          label="Login Alerts"
          description="Get notified when someone logs into your account"
          checked={localSecurity.loginAlerts}
          onChange={v => setLocalSecurity(p => ({ ...p, loginAlerts: v }))}
        />
        <div className="settings-divider" />
        <div className="settings-devices-header">
          <h3 className="settings-card-title"><Smartphone size={16} /> Active Devices</h3>
          <button className="settings-btn settings-btn-danger settings-btn-sm" onClick={handleLogoutAll}>
            <LogOut size={14} /> Logout All Devices
          </button>
        </div>
        <div className="settings-devices-table">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>IP Address</th>
                <th>Last Active</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td><code>{d.ip}</code></td>
                  <td>{d.lastActive}</td>
                  <td>
                    {d.current ? (
                      <span className="settings-device-current"><CheckCircle size={13} /> Current</span>
                    ) : (
                      <span className="settings-device-other">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="settings-actions">
          <button className="settings-btn settings-btn-primary" onClick={handleSaveSecurity}>
            <Save size={15} /> Save Security Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderData = () => (
    <div className="settings-section">
      <SectionHeader icon={Database} title="Data Management" description="Export, import, and manage system data" />
      <div className="settings-card">
        <h3 className="settings-card-title"><Download size={16} /> Export Data</h3>
        <div className="settings-export-grid">
          {[
            { label: 'Export Employees', icon: Users, type: 'Employees', color: '#6366f1' },
            { label: 'Export Payroll', icon: Wallet, type: 'Payroll', color: '#10b981' },
            { label: 'Export Attendance', icon: Clock, type: 'Attendance', color: '#f59e0b' },
          ].map(e => (
            <button key={e.type} className="settings-export-btn" onClick={() => handleExport(e.type)}>
              <div className="settings-export-icon" style={{ background: `${e.color}15`, color: e.color }}>
                <e.icon size={20} />
              </div>
              <span>{e.label}</span>
              <Download size={14} />
            </button>
          ))}
        </div>
        <div className="settings-divider" />
        <h3 className="settings-card-title"><Upload size={16} /> Import & Backup</h3>
        <div className="settings-data-actions">
          <button className="settings-btn settings-btn-secondary" onClick={handleImport}>
            <Upload size={15} /> Import Employees
          </button>
          <button className="settings-btn settings-btn-secondary" onClick={handleBackup}>
            <HardDrive size={15} /> Backup Database
          </button>
          <button className="settings-btn settings-btn-secondary" onClick={handleRestore}>
            <RotateCcw size={15} /> Restore Backup
          </button>
        </div>
        <div className="settings-divider" />
        <h3 className="settings-card-title"><Trash2 size={16} /> Danger Zone</h3>
        <div className="settings-danger-zone">
          <div className="settings-danger-info">
            <span className="settings-danger-label">Reset Demo Data</span>
            <span className="settings-danger-desc">This will reset all settings to default values. This action cannot be undone.</span>
          </div>
          <button className="settings-btn settings-btn-danger" onClick={handleResetDemo}>
            <RefreshCw size={15} /> Reset Demo Data
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
            { label: 'Vite Version', value: 'v5.4.0', icon: Laptop },
            { label: 'Last Backup', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' 03:00 AM', icon: HardDrive },
            { label: 'Total Employees', value: '148', icon: Users },
            { label: 'Total Departments', value: '12', icon: Building2 },
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

  return (
    <div className="settings-page">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

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
            <button
              key={s.key}
              className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`}
              onClick={() => setActiveSection(s.key)}
            >
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
