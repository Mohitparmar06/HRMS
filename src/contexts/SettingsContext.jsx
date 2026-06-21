import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'dayflow-settings';

const DEFAULT_SETTINGS = {
  company: {
    logo: null,
    name: 'Dayflow Inc.',
    email: 'hr@dayflow.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, San Francisco, CA 94102',
    website: 'https://dayflow.com',
  },
  attendance: {
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    overtime: true,
    autoAbsent: false,
  },
  payroll: {
    currency: 'USD ($)',
    currencySymbol: '$',
    cycle: 'Monthly',
    taxPercent: 18,
    overtimeRate: 1.5,
    bonusPercent: 5,
    generateDate: '28',
  },
  leave: {
    casual: 12,
    sick: 8,
    earned: 15,
    maternity: 90,
    paternity: 15,
    managerApproval: true,
  },
  preferences: {
    theme: 'dark',
    language: 'English',
    timezone: 'UTC+00:00',
    emailNotif: true,
    browserNotif: false,
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    loginAlerts: true,
  },
};

const CURRENCY_MAP = {
  'USD ($)': { symbol: '$', code: 'USD' },
  'EUR (€)': { symbol: '€', code: 'EUR' },
  'GBP (£)': { symbol: '£', code: 'GBP' },
  'INR (₹)': { symbol: '₹', code: 'INR' },
  'JPY (¥)': { symbol: '¥', code: 'JPY' },
  'CAD (C$)': { symbol: 'C$', code: 'CAD' },
  'AUD (A$)': { symbol: 'A$', code: 'AUD' },
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        company: { ...DEFAULT_SETTINGS.company, ...parsed.company },
        attendance: { ...DEFAULT_SETTINGS.attendance, ...parsed.attendance },
        payroll: { ...DEFAULT_SETTINGS.payroll, ...parsed.payroll },
        leave: { ...DEFAULT_SETTINGS.leave, ...parsed.leave },
        preferences: { ...DEFAULT_SETTINGS.preferences, ...parsed.preferences },
        security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
      };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.preferences.theme === 'dark') {
      root.classList.remove('light-theme');
    } else if (settings.preferences.theme === 'light') {
      root.classList.add('light-theme');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('light-theme', !prefersDark);
    }
  }, [settings.preferences.theme]);

  const updateCompany = useCallback((updates) => {
    setSettings(prev => ({
      ...prev,
      company: { ...prev.company, ...updates },
    }));
  }, []);

  const updateAttendance = useCallback((updates) => {
    setSettings(prev => ({
      ...prev,
      attendance: { ...prev.attendance, ...updates },
    }));
  }, []);

  const updatePayroll = useCallback((updates) => {
    setSettings(prev => {
      const newPayroll = { ...prev.payroll, ...updates };
      if (updates.currency && CURRENCY_MAP[updates.currency]) {
        newPayroll.currencySymbol = CURRENCY_MAP[updates.currency].symbol;
      }
      return { ...prev, payroll: newPayroll };
    });
  }, []);

  const updateLeave = useCallback((updates) => {
    setSettings(prev => ({
      ...prev,
      leave: { ...prev.leave, ...updates },
    }));
  }, []);

  const updatePreferences = useCallback((updates) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  }, []);

  const updateSecurity = useCallback((updates) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...updates },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (amount == null) return '--';
    const { currency } = settings.payroll;
    const currencyInfo = CURRENCY_MAP[currency] || CURRENCY_MAP['USD ($)'];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [settings.payroll.currency]);

  const getCurrencySymbol = useCallback(() => {
    const { currency } = settings.payroll;
    return (CURRENCY_MAP[currency] || CURRENCY_MAP['USD ($)']).symbol;
  }, [settings.payroll.currency]);

  const isWorkingDay = useCallback((dayName) => {
    return settings.attendance.workingDays.includes(dayName);
  }, [settings.attendance.workingDays]);

  const isLateArrival = useCallback((checkInTime) => {
    if (!checkInTime) return false;
    const [startH, startM] = settings.attendance.startTime.split(':').map(Number);
    const [h, m] = checkInTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM + settings.attendance.gracePeriod;
    const checkInMinutes = h * 60 + m;
    return checkInMinutes > startMinutes;
  }, [settings.attendance.startTime, settings.attendance.gracePeriod]);

  const getLeaveBalance = useCallback(() => {
    return {
      'Casual Leave': settings.leave.casual,
      'Sick Leave': settings.leave.sick,
      'Earned Leave': settings.leave.earned,
      'Maternity Leave': settings.leave.maternity,
      'Paternity Leave': settings.leave.paternity,
    };
  }, [settings.leave]);

  const contextValue = useMemo(() => ({
    settings,
    updateCompany,
    updateAttendance,
    updatePayroll,
    updateLeave,
    updatePreferences,
    updateSecurity,
    resetSettings,
    formatCurrency,
    getCurrencySymbol,
    isWorkingDay,
    isLateArrival,
    getLeaveBalance,
  }), [
    settings,
    updateCompany, updateAttendance, updatePayroll, updateLeave,
    updatePreferences, updateSecurity, resetSettings,
    formatCurrency, getCurrencySymbol, isWorkingDay, isLateArrival,
    getLeaveBalance,
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
