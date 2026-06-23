import { useMemo } from 'react';
import { CheckCircle, Clock, AlertCircle, UserPlus, Wallet, Bell as BellIcon, CalendarCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';

const activityConfig = {
  'employee_registered': { icon: UserPlus, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  'leave_approved': { icon: CalendarCheck, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'payroll_generated': { icon: Wallet, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  'attendance_updated': { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'leave_pending': { icon: AlertCircle, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
};

const categoryToActivityType = {
  'Leave': 'leave_pending',
  'Attendance': 'attendance_updated',
  'Payroll': 'payroll_generated',
  'Employee': 'employee_registered',
  'System': 'attendance_updated',
};

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

export default function ActivityFeed() {
  const { notifications } = useNotifications();

  const activities = useMemo(() => {
    const adminNotifs = notifications
      .filter(n => n.targetEmployeeId === null || n.targetEmployeeId === undefined)
      .slice(0, 7);

    if (adminNotifs.length === 0) {
      return [
        { id: 1, type: 'attendance_updated', title: 'System Ready', desc: 'Dayflow HRMS is active and monitoring attendance.', time: 'Just now' },
      ];
    }

    return adminNotifs.map((n, i) => {
      const type = categoryToActivityType[n.category] || 'attendance_updated';
      return {
        id: n.id || i,
        type,
        title: n.title,
        desc: n.description.length > 80 ? n.description.slice(0, 80) + '...' : n.description,
        time: formatTimeAgo(n.timestamp),
      };
    });
  }, [notifications]);

  return (
    <div className="admin-activity-feed">
      <div className="admin-activity-header">
        <h4>Recent Activity</h4>
      </div>
      <div className="admin-activity-list">
        {activities.map(act => {
          const config = activityConfig[act.type] || activityConfig['attendance_updated'];
          const Icon = config.icon;
          return (
            <div key={act.id} className="admin-activity-item">
              <div className="admin-activity-icon" style={{ background: config.bg, color: config.color }}>
                <Icon size={16} />
              </div>
              <div className="admin-activity-content">
                <span className="admin-activity-title">{act.title}</span>
                <span className="admin-activity-desc">{act.desc}</span>
              </div>
              <span className="admin-activity-time">{act.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
