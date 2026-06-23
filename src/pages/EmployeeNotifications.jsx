import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import {
  Bell, BellRing, BellOff, Trash2,
  Clock, Wallet, Calendar, CheckCircle, AlertTriangle, ChevronDown,
  UserCheck, FileText, MessageCircle, Lock, Megaphone, Gift,
} from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All', icon: Bell },
  { key: 'unread', label: 'Unread', icon: BellRing },
  { key: 'Leave', label: 'Leave', icon: Calendar },
  { key: 'Payroll', label: 'Payroll', icon: Wallet },
  { key: 'System', label: 'System', icon: Megaphone },
];

const CATEGORY_ICONS = {
  Leave: Calendar,
  Payroll: Wallet,
  Attendance: Clock,
  System: Megaphone,
  Profile: UserCheck,
};

const CATEGORY_COLORS = {
  Leave: { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
  Payroll: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  Attendance: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  System: { bg: 'rgba(99,110,115,0.12)', color: '#6b7280' },
  Profile: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
};

const PRIORITY_COLORS = {
  Low: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  Medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  High: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

function formatTimestamp(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmployeeNotifications() {
  const { user } = useAuth();
  const {
    getEmployeeNotifications, getUnreadCountForEmployee,
    markAsRead, markAsUnread, markAllAsReadForEmployee, deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const empNotifications = useMemo(() => getEmployeeNotifications(user?.id), [user?.id, getEmployeeNotifications]);
  const empUnreadCount = useMemo(() => getUnreadCountForEmployee(user?.id), [user?.id, getUnreadCountForEmployee]);

  const filtered = useMemo(() => {
    let result = [...empNotifications];
    if (activeTab === 'unread') result = result.filter(n => !n.read);
    else if (['Leave', 'Payroll', 'System'].includes(activeTab)) {
      result = result.filter(n => n.category === activeTab);
    }
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return result;
  }, [empNotifications, activeTab]);

  const getTabCount = (key) => {
    if (key === 'all') return empNotifications.length;
    if (key === 'unread') return empUnreadCount;
    return empNotifications.filter(n => n.category === key).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={26} style={{ color: 'var(--primary)' }} />
            Notifications
          </h1>
          <p className="page-subtitle">Stay updated with your alerts and activities</p>
        </div>
        <button className="btn btn-primary" onClick={() => markAllAsReadForEmployee(user?.id)}>
          <CheckCircle size={15} /> Mark All as Read
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default' }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{empNotifications.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total</div>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellRing size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{empUnreadCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Unread</div>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default' }}>
          <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellOff size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{empNotifications.length - empUnreadCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Read</div>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default' }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{empNotifications.filter(n => n.priority === 'High' && !n.read).length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>High Priority</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={activeTab === t.key ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab(t.key)}
          >
            <t.icon size={14} /> {t.label}
            <span style={{
              background: activeTab === t.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '1px 7px',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}>
              {getTabCount(t.key)}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
          <BellOff size={48} style={{ color: 'var(--text-dim)' }} />
          <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>No notifications found</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
            {activeTab === 'unread'
              ? "You're all caught up! No unread notifications."
              : activeTab !== 'all'
                ? `No ${activeTab.toLowerCase()} notifications yet.`
                : 'No notifications to display.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(n => {
            const CatIcon = CATEGORY_ICONS[n.category] || Bell;
            const catColor = CATEGORY_COLORS[n.category] || { bg: 'rgba(99,110,115,0.12)', color: '#6b7280' };
            const priColor = PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.Low;
            const isExpanded = expandedId === n.id;

            return (
              <div
                key={n.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  position: 'relative',
                  transition: 'var(--transition-fast)',
                  opacity: n.read ? 0.7 : 1,
                }}
              >
                {!n.read && (
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    left: '18px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary-blue)',
                  }} />
                )}

                <div style={{
                  background: catColor.bg,
                  color: catColor.color,
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CatIcon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h4 style={{
                      fontSize: '0.95rem',
                      fontWeight: n.read ? 500 : 700,
                      color: 'white',
                      margin: 0,
                    }}>
                      {n.title}
                    </h4>
                    <span style={{
                      background: catColor.bg,
                      color: catColor.color,
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}>
                      {n.category}
                    </span>
                    <span style={{
                      background: priColor.bg,
                      color: priColor.color,
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}>
                      {n.priority}
                    </span>
                    {!n.read && (
                      <span style={{
                        background: 'rgba(59,130,246,0.12)',
                        color: '#3b82f6',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}>
                        New
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    margin: '4px 0 8px',
                    lineHeight: 1.5,
                  }}>
                    {n.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <Clock size={12} /> {formatTimestamp(n.timestamp)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, position: 'relative' }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : n.id)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {isExpanded && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '6px',
                      minWidth: '160px',
                      zIndex: 20,
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                    }}>
                      <button
                        onClick={() => { n.read ? markAsUnread(n.id) : markAsRead(n.id); setExpandedId(null); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
                        {n.read ? <BellRing size={14} /> : <BellOff size={14} />}
                        {n.read ? 'Mark as Unread' : 'Mark as Read'}
                      </button>
                      <button
                        onClick={() => { deleteNotification(n.id); setExpandedId(null); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
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
  );
}
