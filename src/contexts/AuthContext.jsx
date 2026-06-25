import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);
const AUTH_KEY = 'dayflow-auth';
const TOKEN_KEY = 'dayflow-token';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => { saveAuth(user); }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        const authUser = {
          id: data.user._id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.fullName,
          fullName: data.user.fullName,
          department: data.user.department,
          designation: data.user.designation,
          phone: data.user.phone,
          profileImage: data.user.profileImage,
          joinDate: data.user.joiningDate,
          status: data.user.status,
          employeeId: data.user.employeeId,
        };
        setUser(authUser);
        return authUser;
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  }), [user, login, logout, updateUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
