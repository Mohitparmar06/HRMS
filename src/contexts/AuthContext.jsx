import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { employees as initialEmployees } from '../services/dummyData';

const AuthContext = createContext(null);
const AUTH_KEY = 'dayflow-auth';

function loadAuth() {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function saveAuth(user) {
  try {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_KEY);
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadAuth);

  useEffect(() => { saveAuth(user); }, [user]);

  const login = useCallback((email, role) => {
    const emp = initialEmployees.find(e => e.email === email);
    const authUser = {
      id: emp?.id || 'EMP-0001',
      email,
      role,
      firstName: emp?.firstName || 'User',
      lastName: emp?.lastName || '',
      name: emp ? `${emp.firstName} ${emp.lastName}` : 'User',
      department: emp?.department || '',
      departmentId: emp?.departmentId || '',
      position: emp?.position || '',
      avatar: emp?.avatar || null,
      profilePicture: null,
      phone: emp?.phone || '',
      joinDate: emp?.joinDate || '',
      status: emp?.status || 'Active',
      salary: emp?.salary || 0,
      gender: null,
      dob: '',
      address: '',
      emergencyName: '',
      emergencyContact: '',
    };
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const value = useMemo(() => ({ user, login, logout, updateUser, isAuthenticated: !!user }), [user, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
