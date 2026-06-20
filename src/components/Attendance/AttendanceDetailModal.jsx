import { X, Clock, Hash, Calendar, AlertTriangle, CheckCircle, XCircle, MinusCircle, CalendarOff, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  present: { label: 'Present', icon: CheckCircle, color: 'var(--success)' },
  absent: { label: 'Absent', icon: XCircle, color: 'var(--danger)' },
  late: { label: 'Late', icon: AlertTriangle, color: 'var(--warning)' },
  'half-day': { label: 'Half Day', icon: MinusCircle, color: 'var(--info)' },
  'on-leave': { label: 'On Leave', icon: CalendarOff, color: '#a78bfa' },
};

export default function AttendanceDetailModal({ record, employee, onClose }) {
  if (!record || !employee) return null;

  const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.present;
  const StatusIcon = cfg.icon;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatHours = (h) => {
    if (!h || h === 0) return '--';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content attendance-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="emp-avatar" style={{ borderColor: cfg.color }}>
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h3>{employee.firstName} {employee.lastName}</h3>
              <p className="modal-subtitle">{employee.position} &bull; {employee.department}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="detail-status-banner" style={{ borderColor: cfg.color }}>
            <StatusIcon size={28} color={cfg.color} />
            <div>
              <span className="detail-status-label" style={{ color: cfg.color }}>{cfg.label}</span>
              <span className="detail-date">{formatDate(record.date)}</span>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <Hash size={18} className="detail-icon" />
              <div>
                <span className="detail-label">Employee ID</span>
                <span className="detail-value">{employee.id}</span>
              </div>
            </div>
            <div className="detail-item">
              <Calendar size={18} className="detail-icon" />
              <div>
                <span className="detail-label">Date</span>
                <span className="detail-value">{formatDate(record.date)}</span>
              </div>
            </div>
            <div className="detail-item">
              <Clock size={18} className="detail-icon" />
              <div>
                <span className="detail-label">Check In</span>
                <span className="detail-value">{record.checkIn || '--'}</span>
              </div>
            </div>
            <div className="detail-item">
              <Clock size={18} className="detail-icon" />
              <div>
                <span className="detail-label">Check Out</span>
                <span className="detail-value">{record.checkOut || '--'}</span>
              </div>
            </div>
            <div className="detail-item">
              <Clock size={18} className="detail-icon" />
              <div>
                <span className="detail-label">Working Hours</span>
                <span className="detail-value">{formatHours(record.hoursWorked)}</span>
              </div>
            </div>
            <div className="detail-item">
              <Clock size={18} className="detail-icon" />
              <div>
                <span className="detail-label">Overtime</span>
                <span className="detail-value">{formatHours(record.overtime)}</span>
              </div>
            </div>
          </div>

          {record.note && (
            <div className="detail-note">
              <FileText size={16} />
              <span>{record.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
