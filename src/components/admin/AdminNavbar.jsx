import React, { useState } from 'react';
import { Search, Bell, MessageSquare, Plus, Menu, X } from 'lucide-react';

export default function AdminNavbar({ onMobileToggle, isMobileOpen }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New employee registered', desc: 'Sophia Torres joined the Engineering department', time: '5 min ago', unread: true },
    { id: 2, title: 'Leave approved', desc: 'James Wilson\'s annual leave request has been approved', time: '20 min ago', unread: true },
    { id: 3, title: 'Payroll generated', desc: 'June 2026 payroll has been processed successfully', time: '1 hour ago', unread: false },
    { id: 4, title: 'Attendance alert', desc: '12 employees marked as late today', time: '2 hours ago', unread: false },
    { id: 5, title: 'Department update', desc: 'Design team budget has been revised', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button className="admin-mobile-toggle" onClick={onMobileToggle} aria-label="Toggle menu">
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`admin-search ${searchFocused ? 'focused' : ''}`}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search employees, reports, settings..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd>⌘K</kbd>
        </div>
      </div>

      <div className="admin-topbar-right">
        <button className="admin-topbar-action">
          <Plus size={18} />
          <span className="admin-topbar-action-label">Quick Add</span>
        </button>

        <div className="admin-topbar-icon-btn">
          <MessageSquare size={18} />
          <span className="admin-topbar-badge">3</span>
        </div>

        <div className="admin-notification-wrapper">
          <button
            className="admin-topbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="admin-topbar-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <h4>Notifications</h4>
                <button className="admin-notification-mark-read">Mark all read</button>
              </div>
              <div className="admin-notification-list">
                {notifications.map(n => (
                  <div key={n.id} className={`admin-notification-item ${n.unread ? 'unread' : ''}`}>
                    <div className={`admin-notification-dot ${n.unread ? 'unread' : ''}`} />
                    <div className="admin-notification-content">
                      <span className="admin-notification-title">{n.title}</span>
                      <span className="admin-notification-desc">{n.desc}</span>
                      <span className="admin-notification-time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="admin-notification-footer">View all notifications</button>
            </div>
          )}
        </div>

        <div className="admin-topbar-profile">
          <div className="admin-topbar-avatar">AD</div>
          <div className="admin-topbar-profile-info">
            <span className="admin-topbar-name">Alex Morgan</span>
            <span className="admin-topbar-role">HR Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
