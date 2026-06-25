import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import API from '../services/api';

const SettingsContext = createContext(null);

const DEFAULTS = {
  company: {
    name: "Dayflow Inc.",
    email: "info@dayflow.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
    website: "https://dayflow.com",
    logo: "",
  },
  attendance: {
    startTime: "09:00",
    endTime: "18:00",
    lateThreshold: 15,
    halfDayThreshold: 4,
    workingHours: 8,
    gracePeriod: 15,
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    overtimeEnabled: true,
    autoAbsent: false,
  },
  payroll: {
    currency: "USD",
    currencySymbol: "$",
    salaryCycle: "Monthly",
    taxPercentage: 18,
    pfPercentage: 12,
    overtimeRate: 1.5,
    bonusPercentage: 5,
    generateDay: 28,
  },
  leave: {
    casualLeave: 12,
    sickLeave: 10,
    earnedLeave: 15,
    maternityLeave: 90,
    paternityLeave: 15,
    managerApproval: true,
  },
  preferences: {
    theme: "dark",
    language: "en",
    timezone: "UTC+00:00",
    dateFormat: "YYYY-MM-DD",
    emailNotifications: true,
    browserNotifications: false,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
  },
};

const CURRENCY_MAP = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  CAD: { symbol: "CA$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/settings');
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const theme = settings.preferences?.theme || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.remove('light-theme');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('light-theme', !prefersDark);
    }
  }, [settings.preferences?.theme]);

  const updateSection = useCallback(async (section, data) => {
    try {
      setSaving(true);
      const { data: res } = await API.put(`/settings/${section}`, data);
      if (res.success) {
        setSettings(prev => ({ ...prev, [section]: res.data }));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update settings';
      return { success: false, message: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const updateCompany = useCallback((data) => updateSection('company', data), [updateSection]);
  const updateAttendance = useCallback((data) => updateSection('attendance', data), [updateSection]);
  const updatePayroll = useCallback((data) => updateSection('payroll', data), [updateSection]);
  const updateLeave = useCallback((data) => updateSection('leave', data), [updateSection]);
  const updatePreferences = useCallback((data) => updateSection('preferences', data), [updateSection]);
  const updateSecurity = useCallback((data) => updateSection('security', data), [updateSection]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setSaving(true);
      const { data } = await API.post('/settings/change-password', { currentPassword, newPassword });
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to change password' };
    } finally {
      setSaving(false);
    }
  }, []);

  const backupData = useCallback(async () => {
    try {
      const { data } = await API.post('/settings/backup');
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Backup failed' };
    }
  }, []);

  const restoreData = useCallback(async (backup) => {
    try {
      setSaving(true);
      const { data } = await API.post('/settings/restore', { backup });
      if (data.success) {
        await fetchSettings();
      }
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Restore failed' };
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  const resetData = useCallback(async () => {
    try {
      setSaving(true);
      const { data } = await API.post('/settings/reset', { confirm: true });
      if (data.success) {
        setSettings(DEFAULTS);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Reset failed' };
    } finally {
      setSaving(false);
    }
  }, []);

  const formatCurrency = useCallback((amount) => {
    const symbol = settings.payroll?.currencySymbol || '$';
    return `${symbol}${Number(amount || 0).toLocaleString()}`;
  }, [settings.payroll?.currencySymbol]);

  const getCurrencySymbol = useCallback(() => {
    return settings.payroll?.currencySymbol || '$';
  }, [settings.payroll?.currencySymbol]);

  const value = useMemo(() => ({
    settings,
    loading,
    saving,
    defaults: DEFAULTS,
    currencyMap: CURRENCY_MAP,
    updateSection,
    updateCompany,
    updateAttendance,
    updatePayroll,
    updateLeave,
    updatePreferences,
    updateSecurity,
    changePassword,
    backupData,
    restoreData,
    resetData,
    formatCurrency,
    getCurrencySymbol,
    fetchSettings,
  }), [
    settings, loading, saving, updateSection,
    updateCompany, updateAttendance, updatePayroll, updateLeave,
    updatePreferences, updateSecurity, changePassword,
    backupData, restoreData, resetData, formatCurrency, getCurrencySymbol, fetchSettings,
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
