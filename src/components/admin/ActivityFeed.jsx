import React from 'react';
import { CheckCircle, Clock, AlertCircle, UserPlus, Wallet, Bell as BellIcon, CalendarCheck } from 'lucide-react';

const activityConfig = {
  'employee_registered': { icon: UserPlus, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  'leave_approved': { icon: CalendarCheck, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'payroll_generated': { icon: Wallet, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  'attendance_updated': { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'leave_pending': { icon: AlertCircle, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
};

const activities = [
  { id: 1, type: 'employee_registered', title: 'New Employee Registered', desc: 'Sophia Torres has been added to Engineering', time: '5 minutes ago' },
  { id: 2, type: 'leave_approved', title: 'Leave Approved', desc: 'James Wilson\'s annual leave request approved', time: '20 minutes ago' },
  { id: 3, type: 'payroll_generated', title: 'Payroll Generated', desc: 'June 2026 payroll processed for 150 employees', time: '1 hour ago' },
  { id: 4, type: 'attendance_updated', title: 'Attendance Updated', desc: '12 employees marked as late for today', time: '2 hours ago' },
  { id: 5, type: 'leave_pending', title: 'Leave Pending Approval', desc: '3 new leave requests awaiting review', time: '3 hours ago' },
  { id: 6, type: 'employee_registered', title: 'New Employee Registered', desc: 'Liam Chen has been added to Design', time: '5 hours ago' },
  { id: 7, type: 'attendance_updated', title: 'Attendance Summary', desc: 'Daily attendance report generated', time: '8 hours ago' },
];

export default function ActivityFeed() {
  return (
    <div className="admin-activity-feed">
      <div className="admin-activity-header">
        <h4>Recent Activity</h4>
        <button className="admin-activity-view-all">View All</button>
      </div>
      <div className="admin-activity-list">
        {activities.map(act => {
          const config = activityConfig[act.type] || activityConfig['employee_registered'];
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
