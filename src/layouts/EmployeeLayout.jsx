import { useState, useMemo, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Clock, Calendar, CreditCard, Bell, Settings, LogOut,
  Search, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { EmployeeProvider, useEmployees } from '../contexts/EmployeeContext';
import { AttendanceProvider } from '../contexts/AttendanceContext';
import { LeaveProvider } from '../contexts/LeaveContext';
import { PayrollProvider } from '../contexts/PayrollContext';
import { SettingsProvider } from '../contexts/SettingsContext';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Profile', icon: User, path: '/profile' },
  { name: 'Attendance', icon: Clock, path: '/attendance' },
  { name: 'Leave Requests', icon: Calendar, path: '/leave' },
  { name: 'Payroll', icon: CreditCard, path: '/payroll' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

function EmployeeNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getUnreadCountForEmployee, fetchEmployeeNotifications } = useNotifications();
  const unreadCount = getUnreadCountForEmployee(user?.employeeId);

  useEffect(() => {
    if (user?.employeeId) {
      fetchEmployeeNotifications(user.employeeId);
    }
  }, [user?.employeeId, fetchEmployeeNotifications]);

  const initials = useMemo(() => {
    if (!user) return 'U';
    const f = user.firstName?.[0] || '';
    const l = user.lastName?.[0] || '';
    return (f + l).toUpperCase() || 'U';
  }, [user]);

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <Search size={18} color="var(--text-dim)" />
          <input type="text" placeholder="Search logs, policies, payroll..." className="topbar-search-input" />
        </div>
      </div>
      <div className="topbar-actions">
        <div className="bell-icon-wrap" onClick={() => navigate('/notifications')} style={{ position: 'relative' }}>
          <Bell size={18} />
          {unreadCount > 0 && <span className="bell-badge"></span>}
        </div>
        <div className="user-profile-widget" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          {user?.profilePicture ? (
            <div className="dashboard-avatar" style={{ overflow: 'hidden' }}>
              <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div className="dashboard-avatar">{initials}</div>
          )}
          <div style={{ textAlign: 'left' }}>
            <div className="dashboard-username">{user?.name || 'User'}</div>
            <div className="dashboard-role">{user?.position || user?.role || 'Employee'}</div>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#ef4444', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
}

function AttendanceWithNotifications({ children }) {
  const { employees } = useEmployees();

  return (
    <AttendanceProvider employees={employees}>
      {children}
    </AttendanceProvider>
  );
}

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = location.pathname;

  const initials = useMemo(() => {
    if (!user) return 'U';
    const f = user.firstName?.[0] || '';
    const l = user.lastName?.[0] || '';
    return (f + l).toUpperCase() || 'U';
  }, [user]);

  return (
    <SettingsProvider>
      <EmployeeProvider>
        <AttendanceWithNotifications>
          <LeaveProvider>
            <PayrollProvider>
              <div className="dashboard-layout">
                <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                  <div>
                    <div className="logo sidebar-logo">
                      <div className="logo-dot"></div>
                      <span>Dayflow</span>
                    </div>
                    <ul className="sidebar-menu">
                      {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;
                        return (
                          <li
                            key={item.name}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                          >
                            <Icon size={18} />
                            <span>{item.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="sidebar-item"
                      style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </aside>

                {sidebarOpen && <div className="admin-mobile-overlay" onClick={() => setSidebarOpen(false)} />}

                <div className="dashboard-main">
                  <EmployeeNavbar />
                  <div className="dashboard-content">
                    <Outlet />
                  </div>
                </div>
              </div>
            </PayrollProvider>
          </LeaveProvider>
        </AttendanceWithNotifications>
      </EmployeeProvider>
    </SettingsProvider>
  );
}
