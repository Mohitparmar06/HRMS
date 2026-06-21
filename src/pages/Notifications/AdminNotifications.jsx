import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationsContext';
import {
  Bell, BellOff, BellRing, Eye, EyeOff, Trash2, Search, Filter,
  ChevronDown, ChevronUp, X, AlertTriangle, Clock, User, Wallet,
  Settings, CheckCircle, Calendar,
  ArrowUpDown, RotateCcw, Info, ExternalLink,
} from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All', icon: Bell },
  { key: 'unread', label: 'Unread', icon: BellRing },
  { key: 'read', label: 'Read', icon: BellOff },
  { key: 'System', label: 'System', icon: Settings },
  { key: 'Employee', label: 'Employee', icon: User },
  { key: 'Payroll', label: 'Payroll', icon: Wallet },
  { key: 'Leave', label: 'Leave', icon: Calendar },
];

const CATEGORIES = ['All', 'Attendance', 'Employee', 'Leave', 'Payroll', 'System'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

const CATEGORY_ICONS = {
  Attendance: Clock,
  Employee: User,
  Payroll: Wallet,
  Leave: Calendar,
  System: Settings,
};

const CATEGORY_COLORS = {
  Attendance: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Employee: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  Payroll: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  Leave: { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
  System: { bg: 'rgba(99,110,115,0.12)', color: '#6b7280' },
};

const PRIORITY_COLORS = {
  Low: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  Medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  High: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

const CATEGORY_ROUTES = {
  Attendance: '/admin/attendance',
  Employee: '/admin/employees',
  Payroll: '/admin/payroll',
  Leave: '/admin/leave',
  System: '/admin/settings',
};

function formatTimestamp(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const {
    notifications, unreadCount, highPriorityCount,
    markAsRead, markAsUnread, markAllAsRead, deleteNotification, clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [expandedActions, setExpandedActions] = useState(null);

  const readCount = notifications.length - unreadCount;

  const filtered = useMemo(() => {
    let result = [...notifications];

    if (activeTab === 'unread') result = result.filter(n => !n.read);
    else if (activeTab === 'read') result = result.filter(n => n.read);
    else if (['System', 'Employee', 'Payroll', 'Leave'].includes(activeTab)) {
      result = result.filter(n => n.category === activeTab);
    }

    if (filterCategory !== 'All') result = result.filter(n => n.category === filterCategory);
    if (filterPriority !== 'All') result = result.filter(n => n.priority === filterPriority);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        (n.employeeName || '').toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const cmp = new Date(a.timestamp) - new Date(b.timestamp);
      return sortBy === 'newest' ? -cmp : cmp;
    });

    return result;
  }, [notifications, activeTab, filterCategory, filterPriority, searchQuery, sortBy]);

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  const getTabCount = (key) => {
    if (key === 'all') return notifications.length;
    if (key === 'unread') return unreadCount;
    if (key === 'read') return readCount;
    return notifications.filter(n => n.category === key).length;
  };

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h1 className="notif-title">
            <Bell size={24} style={{ color: 'var(--primary)' }} />
            Notifications
          </h1>
          <p className="notif-subtitle">Stay updated with real-time system alerts and team activities</p>
        </div>
        <div className="notif-header-actions">
          <button className="notif-btn notif-btn-secondary" onClick={markAllAsRead}>
            <CheckCircle size={15} /> Mark All Read
          </button>
          <button className="notif-btn notif-btn-danger" onClick={() => setShowClearConfirm(true)}>
            <Trash2 size={15} /> Clear All
          </button>
        </div>
      </div>

      <div className="notif-stats">
        {[
          { label: 'Total', value: notifications.length, icon: Bell, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Unread', value: unreadCount, icon: BellRing, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Read', value: readCount, icon: BellOff, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'High Priority', value: highPriorityCount, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map((s, i) => (
          <div key={i} className="notif-stat-card">
            <div className="notif-stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="notif-stat-info">
              <span className="notif-stat-value">{s.value}</span>
              <span className="notif-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="notif-toolbar">
        <div className="notif-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`notif-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <t.icon size={14} /> {t.label}
              <span className="notif-tab-count">{getTabCount(t.key)}</span>
            </button>
          ))}
        </div>
        <div className="notif-toolbar-right">
          <div className="notif-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="notif-search-clear" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="notif-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={15} /> Filters {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            className="notif-sort-btn"
            onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
          >
            <ArrowUpDown size={15} /> {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="notif-filters-panel">
          <div className="notif-filter-group">
            <label>Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="notif-filter-group">
            <label>Priority</label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button
            className="notif-filter-reset"
            onClick={() => { setFilterCategory('All'); setFilterPriority('All'); setSearchQuery(''); }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      )}

      <div className="notif-list-container">
        {filtered.length === 0 ? (
          <div className="notif-empty">
            <BellOff size={48} />
            <h3>No notifications found</h3>
            <p>{searchQuery || filterCategory !== 'All' || filterPriority !== 'All'
              ? 'Try adjusting your search or filters'
              : 'You\'re all caught up! New notifications will appear here.'
            }</p>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map(n => {
              const CatIcon = CATEGORY_ICONS[n.category] || Bell;
              const catColor = CATEGORY_COLORS[n.category] || { bg: 'rgba(99,110,115,0.12)', color: '#6b7280' };
              const priColor = PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.Low;
              const isExpanded = expandedActions === n.id;

              return (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className={`notif-item-dot ${!n.read ? 'unread' : ''}`} />
                  <div className="notif-item-icon" style={{ background: catColor.bg, color: catColor.color }}>
                    <CatIcon size={16} />
                  </div>
                  <div className="notif-item-body">
                    <div className="notif-item-top">
                      <span className="notif-item-title">{n.title}</span>
                      <div className="notif-item-badges">
                        <span className="notif-badge notif-badge-category" style={{ background: catColor.bg, color: catColor.color }}>
                          {n.category}
                        </span>
                        <span className="notif-badge notif-badge-priority" style={{ background: priColor.bg, color: priColor.color }}>
                          {n.priority}
                        </span>
                      </div>
                    </div>
                    <p className="notif-item-desc">{n.description}</p>
                    <div className="notif-item-bottom">
                      <span className="notif-item-time">
                        <Clock size={12} /> {formatTimestamp(n.timestamp)}
                      </span>
                      {n.employeeName && (
                        <span className="notif-item-employee">
                          <User size={12} /> {n.employeeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="notif-item-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="notif-item-action-btn"
                      onClick={() => setExpandedActions(isExpanded ? null : n.id)}
                      title="Actions"
                    >
                      <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {isExpanded && (
                      <div className="notif-actions-dropdown">
                        <button onClick={() => { n.read ? markAsUnread(n.id) : markAsRead(n.id); setExpandedActions(null); }}>
                          {n.read ? <BellRing size={14} /> : <BellOff size={14} />}
                          {n.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button onClick={() => { handleNotificationClick(n); setExpandedActions(null); }}>
                          <Eye size={14} /> View Details
                        </button>
                        <button className="notif-action-delete" onClick={() => { deleteNotification(n.id); setExpandedActions(null); }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedNotification && (
        <div className="notif-modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="notif-modal" onClick={e => e.stopPropagation()}>
            <div className="notif-modal-header">
              <div className="notif-modal-title-row">
                {(() => {
                  const CatIcon = CATEGORY_ICONS[selectedNotification.category] || Bell;
                  const catColor = CATEGORY_COLORS[selectedNotification.category] || { bg: 'rgba(99,110,115,0.12)', color: '#6b7280' };
                  return (
                    <div className="notif-modal-icon" style={{ background: catColor.bg, color: catColor.color }}>
                      <CatIcon size={20} />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="notif-modal-title">{selectedNotification.title}</h2>
                  <div className="notif-modal-meta">
                    <span className="notif-badge" style={{ background: CATEGORY_COLORS[selectedNotification.category]?.bg, color: CATEGORY_COLORS[selectedNotification.category]?.color }}>
                      {selectedNotification.category}
                    </span>
                    <span className="notif-badge" style={{ background: PRIORITY_COLORS[selectedNotification.priority]?.bg, color: PRIORITY_COLORS[selectedNotification.priority]?.color }}>
                      {selectedNotification.priority} Priority
                    </span>
                    {!selectedNotification.read && (
                      <span className="notif-badge" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>Unread</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="notif-modal-close" onClick={() => setSelectedNotification(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="notif-modal-body">
              <div className="notif-modal-detail">
                <span className="notif-modal-detail-label">Description</span>
                <p className="notif-modal-detail-value">{selectedNotification.description}</p>
              </div>
              <div className="notif-modal-detail-grid">
                <div className="notif-modal-detail">
                  <span className="notif-modal-detail-label">Timestamp</span>
                  <span className="notif-modal-detail-value notif-modal-detail-flex">
                    <Clock size={14} /> {formatFullDate(selectedNotification.timestamp)}
                  </span>
                </div>
                <div className="notif-modal-detail">
                  <span className="notif-modal-detail-label">Status</span>
                  <span className="notif-modal-detail-value notif-modal-detail-flex">
                    {selectedNotification.read
                      ? <><Eye size={14} style={{ color: '#22c55e' }} /> Read</>
                      : <><EyeOff size={14} style={{ color: '#f59e0b' }} /> Unread</>
                    }
                  </span>
                </div>
                {selectedNotification.employeeName && (
                  <div className="notif-modal-detail">
                    <span className="notif-modal-detail-label">Employee</span>
                    <span className="notif-modal-detail-value notif-modal-detail-flex">
                      <User size={14} /> {selectedNotification.employeeName}
                    </span>
                  </div>
                )}
                {selectedNotification.employeeId && (
                  <div className="notif-modal-detail">
                    <span className="notif-modal-detail-label">Employee ID</span>
                    <span className="notif-modal-detail-value notif-modal-detail-flex">
                      <Info size={14} /> {selectedNotification.employeeId}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="notif-modal-footer">
              <button className="notif-btn notif-btn-secondary" onClick={() => {
                selectedNotification.read ? markAsUnread(selectedNotification.id) : markAsRead(selectedNotification.id);
                setSelectedNotification(prev => prev ? { ...prev, read: !prev.read } : null);
              }}>
                {selectedNotification.read ? <BellRing size={14} /> : <BellOff size={14} />}
                {selectedNotification.read ? 'Mark Unread' : 'Mark Read'}
              </button>
              {CATEGORY_ROUTES[selectedNotification.category] && (
                <button className="notif-btn notif-btn-primary" onClick={() => {
                  navigate(CATEGORY_ROUTES[selectedNotification.category]);
                  setSelectedNotification(null);
                }}>
                  <ExternalLink size={14} /> Open {selectedNotification.category}
                </button>
              )}
              <button className="notif-btn notif-btn-danger" onClick={() => {
                deleteNotification(selectedNotification.id);
                setSelectedNotification(null);
              }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="notif-modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="notif-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="notif-confirm-icon">
              <AlertTriangle size={32} />
            </div>
            <h3>Clear All Notifications</h3>
            <p>Are you sure you want to clear all notifications? This action cannot be undone.</p>
            <div className="notif-confirm-actions">
              <button className="notif-btn notif-btn-secondary" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </button>
              <button className="notif-btn notif-btn-danger" onClick={handleClearAll}>
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
