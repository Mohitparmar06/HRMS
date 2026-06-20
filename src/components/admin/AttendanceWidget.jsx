import React from 'react';
import { Users, UserX, Clock, Timer } from 'lucide-react';

export default function AttendanceWidget({ data }) {
  const today = data[0] || { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0 };
  const total = today.present + today.absent + today.late + today.halfDay + today.onLeave;
  const presentPct = total > 0 ? Math.round((today.present / total) * 100) : 0;

  const stats = [
    { label: 'Present', value: today.present, color: '#10b981', icon: Users },
    { label: 'Absent', value: today.absent, color: '#ef4444', icon: UserX },
    { label: 'Late', value: today.late, color: '#f59e0b', icon: Clock },
    { label: 'Half Day', value: today.halfDay, color: '#06b6d4', icon: Timer },
  ];

  return (
    <div className="admin-attendance-widget">
      <div className="admin-attendance-widget-header">
        <h4>Today's Attendance</h4>
        <span className="admin-attendance-pct">{presentPct}% present</span>
      </div>

      <div className="admin-attendance-ring">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="url(#attendance-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(presentPct / 100) * 314} 314`}
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="attendance-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <text x="60" y="56" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="var(--font-display)">
            {today.present}
          </text>
          <text x="60" y="72" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontWeight="500">
            present
          </text>
        </svg>
      </div>

      <div className="admin-attendance-stats">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="admin-attendance-stat">
              <div className="admin-attendance-stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                <Icon size={14} />
              </div>
              <div className="admin-attendance-stat-info">
                <span className="admin-attendance-stat-value">{s.value}</span>
                <span className="admin-attendance-stat-label">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
