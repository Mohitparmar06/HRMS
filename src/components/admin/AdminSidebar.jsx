import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Clock, CalendarDays, Wallet,
  BarChart3, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  Shield, Monitor
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin', exact: true },
  { name: 'Employees', icon: Users, path: '/admin/employees' },
  { name: 'Departments', icon: Building2, path: '/admin/departments' },
  { name: 'Attendance', icon: Clock, path: '/admin/attendance' },
  { name: 'Leave Management', icon: CalendarDays, path: '/admin/leave' },
  { name: 'Payroll', icon: Wallet, path: '/admin/payroll' },
  { name: 'Reports & Analytics', icon: BarChart3, path: '/admin/reports' },
  { name: 'Demo Requests', icon: Monitor, path: '/admin/demo-requests' },
  { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const currentPath = location.pathname;
  const companyName = settings.company.name.split(' ')[0] || 'Dayflow';

  const isActive = (item) => {
    if (item.exact) return currentPath === item.path;
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-inner">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-logo" onClick={() => navigate('/admin')}>
            {settings.company.logo ? (
              <img src={settings.company.logo} alt="Logo" className="sidebar-logo-img" />
            ) : (
              <div className="logo-dot"></div>
            )}
            {!collapsed && <span>{companyName}</span>}
          </div>
          <button className="admin-sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="admin-sidebar-label">
          {!collapsed && <span>MAIN MENU</span>}
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.name}
                className={`admin-sidebar-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.name}</span>}
                {active && <div className="admin-sidebar-active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-label">
          {!collapsed && <span>ACCOUNT</span>}
        </div>

        <div className="admin-sidebar-bottom">
          <button
            className="admin-sidebar-item admin-logout-btn"
            onClick={() => navigate('/login')}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>

          {!collapsed && (
            <div className="admin-sidebar-user">
              <div className="admin-sidebar-avatar">
                <Shield size={14} />
              </div>
              <div className="admin-sidebar-user-info">
                <span className="admin-sidebar-user-name">Admin User</span>
                <span className="admin-sidebar-user-role">HR Admin</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
