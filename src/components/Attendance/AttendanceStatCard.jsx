import { CheckCircle, XCircle, AlertTriangle, MinusCircle, CalendarOff, TrendingUp, TrendingDown, Users } from 'lucide-react';

export default function AttendanceStatCard({ label, value, change, icon: Icon, color, trend }) {
  return (
    <div className="att-stat-card" style={{ '--accent': color }}>
      <div className="att-stat-icon" style={{ background: `${color}20`, color }}>
        <Icon size={22} />
      </div>
      <div className="att-stat-info">
        <span className="att-stat-label">{label}</span>
        <span className="att-stat-value">{value}</span>
      </div>
      {change !== undefined && (
        <div className={`att-stat-change ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : ''}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : null}
          <span>{change}%</span>
        </div>
      )}
    </div>
  );
}
