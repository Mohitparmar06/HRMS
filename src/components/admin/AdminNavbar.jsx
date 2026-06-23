import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, Plus, Menu, X, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';

const CATEGORY_ICONS = {
  Attendance: '🕐',
  Employee: '👤',
  Leave: '🏖️',
  Payroll: '💰',
  System: '⚙️',
};

const QUICK_ADD_OPTIONS = [
  { label: 'Add Employee', path: '/admin/employees/add', icon: '👤' },
  { label: 'Add Department', path: '/admin/departments/add', icon: '🏢' },
  { label: 'Approve Leave', path: '/admin/leave', icon: '🏖️' },
  { label: 'Generate Payroll', path: '/admin/payroll', icon: '💰' },
  { label: 'Send Notification', path: '/admin/notifications', icon: '🔔' },
];

const DUMMY_MESSAGES = [
  {
    id: 1,
    sender: 'System',
    avatar: 'SY',
    preview: 'Welcome to Dayflow HRMS admin panel.',
    time: '1 min ago',
    unread: true,
  },
];

function formatTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminNavbar({ onMobileToggle, isMobileOpen }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState(DUMMY_MESSAGES);

  const notificationsRef = useRef(null);
  const quickAddRef = useRef(null);
  const messagesRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const adminNotifications = notifications.filter(n => n.targetEmployeeId === null || n.targetEmployeeId === undefined);
  const latestFive = adminNotifications.slice(0, 5);
  const adminUnreadCount = adminNotifications.filter(n => !n.read).length;
  const unreadMessageCount = messages.filter(m => m.unread).length;

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleMarkNotificationRead = () => {
    navigate('/admin/notifications');
    setShowNotifications(false);
  };

  const handleMessageRead = (id) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, unread: false } : m))
    );
  };

  const handleQuickAddClick = (path) => {
    navigate(path);
    setShowQuickAdd(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        notificationsRef.current && !notificationsRef.current.contains(e.target) &&
        quickAddRef.current && !quickAddRef.current.contains(e.target) &&
        messagesRef.current && !messagesRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
        setShowQuickAdd(false);
        setShowMessages(false);
      }
    }

    if (showNotifications || showQuickAdd || showMessages) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications, showQuickAdd, showMessages]);

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
        {/* Quick Add Dropdown */}
        <div className="admin-topbar-action-wrapper" ref={quickAddRef}>
          <button
            className="admin-topbar-action"
            onClick={() => {
              setShowQuickAdd(!showQuickAdd);
              setShowMessages(false);
              setShowNotifications(false);
            }}
          >
            <Plus size={18} />
            <span className="admin-topbar-action-label">Quick Add</span>
          </button>

          {showQuickAdd && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <h4>Quick Actions</h4>
              </div>
              <div className="admin-notification-list">
                {QUICK_ADD_OPTIONS.map((option) => (
                  <div
                    key={option.path}
                    className="admin-notification-item admin-notification-item-clickable"
                    onClick={() => handleQuickAddClick(option.path)}
                  >
                    <span className="admin-notification-icon">{option.icon}</span>
                    <div className="admin-notification-content">
                      <span className="admin-notification-title">{option.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages Dropdown */}
        <div className="admin-topbar-icon-btn-wrapper" ref={messagesRef}>
          <button
            className="admin-topbar-icon-btn"
            onClick={() => {
              setShowMessages(!showMessages);
              setShowQuickAdd(false);
              setShowNotifications(false);
            }}
          >
            <MessageSquare size={18} />
            {unreadMessageCount > 0 && (
              <span className="admin-topbar-badge">{unreadMessageCount}</span>
            )}
          </button>

          {showMessages && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <h4>Messages</h4>
                <span className="admin-notification-count">{unreadMessageCount} unread</span>
              </div>
              <div className="admin-notification-list">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`admin-notification-item admin-notification-item-clickable ${msg.unread ? 'unread' : ''}`}
                    onClick={() => handleMessageRead(msg.id)}
                  >
                    <div className="admin-message-avatar">{msg.avatar}</div>
                    <div className="admin-notification-content">
                      <span className="admin-notification-title">
                        {msg.sender}
                      </span>
                      <span className="admin-notification-desc">{msg.preview}</span>
                      <span className="admin-notification-time">
                        <Clock size={12} /> {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="admin-notification-footer"
                onClick={() => { setShowMessages(false); }}
              >
                View all messages
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="admin-notification-wrapper" ref={notificationsRef}>
          <button
            className="admin-topbar-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowQuickAdd(false);
              setShowMessages(false);
            }}
          >
            <Bell size={18} />
            {adminUnreadCount > 0 && <span className="admin-topbar-badge">{adminUnreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <h4>Notifications</h4>
                <button
                  className="admin-notification-mark-read"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              </div>
              <div className="admin-notification-list">
                {latestFive.map((n) => (
                  <div
                    key={n.id}
                    className={`admin-notification-item admin-notification-item-clickable ${!n.read ? 'unread' : ''}`}
                    onClick={() => handleMarkNotificationRead(n.id)}
                  >
                    <div className={`admin-notification-dot ${!n.read ? 'unread' : ''}`} />
                    <div className="admin-notification-content">
                      <span className="admin-notification-title">
                        {CATEGORY_ICONS[n.category] || '📌'} {n.title}
                      </span>
                      <span className="admin-notification-desc">
                        {n.description.length > 60
                          ? n.description.slice(0, 60) + '…'
                          : n.description}
                      </span>
                      <span className="admin-notification-time">
                        {formatTimeAgo(n.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                {latestFive.length === 0 && (
                  <div className="admin-notification-empty">No notifications</div>
                )}
              </div>
              <button
                className="admin-notification-footer"
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/admin/notifications');
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="admin-topbar-profile">
          <div className="admin-topbar-avatar">AD</div>
          <div className="admin-topbar-profile-info">
            <span className="admin-topbar-name">Admin</span>
            <span className="admin-topbar-role">HR Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
