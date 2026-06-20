import { X, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, FileText, User, Mail, Phone, Briefcase, MapPin, History, Wallet } from 'lucide-react';

const STATUS_CONFIG = {
  Pending: { color: 'var(--warning)', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' },
  Approved: { color: 'var(--success)', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' },
  Rejected: { color: 'var(--danger)', icon: XCircle, bg: 'rgba(239, 68, 68, 0.1)' },
  Cancelled: { color: 'var(--text-dim)', icon: XCircle, bg: 'rgba(107, 114, 128, 0.1)' },
};

const LEAVE_TYPE_COLORS = {
  'Casual Leave': '#3b82f6',
  'Sick Leave': '#ef4444',
  'Earned Leave': '#10b981',
  'Maternity Leave': '#ec4899',
  'Paternity Leave': '#8b5cf6',
  'Work From Home': '#06b6d4',
};

const LEAVE_BALANCE_LIMITS = {
  'Casual Leave': 12,
  'Sick Leave': 10,
  'Earned Leave': 15,
  'Maternity Leave': 26,
  'Paternity Leave': 10,
  'Work From Home': 20,
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LeaveDetailsModal({ record, onClose, employeeLeaves = [], leaveBalance = {}, allEmployees = [] }) {
  if (!record) return null;

  const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Pending;
  const StatusIcon = cfg.icon;
  const typeColor = LEAVE_TYPE_COLORS[record.leaveType] || 'var(--primary-blue)';

  const emp = allEmployees.find(e => e.id === record.employeeId);

  const previousLeaves = employeeLeaves.filter(l => l.id !== record.id);
  const previousApproved = previousLeaves.filter(l => l.status === 'Approved');
  const previousRejected = previousLeaves.filter(l => l.status === 'Rejected');
  const previousPending = previousLeaves.filter(l => l.status === 'Pending');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content leave-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="emp-avatar" style={{ borderColor: typeColor }}>
              {record.employeeAvatar}
            </div>
            <div>
              <h3>{record.employeeName}</h3>
              <p className="modal-subtitle">{record.employeeId} &bull; {record.department}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="leave-detail-status" style={{ borderColor: cfg.color, background: cfg.bg }}>
            <StatusIcon size={28} color={cfg.color} />
            <div>
              <span className="leave-detail-status-label" style={{ color: cfg.color }}>{record.status}</span>
              <span className="leave-detail-leave-type" style={{ color: typeColor }}>{record.leaveType}</span>
            </div>
          </div>

          {emp && (
            <div className="leave-detail-section">
              <h4 className="leave-detail-section-title">
                <User size={16} /> Employee Profile
              </h4>
              <div className="leave-emp-profile">
                <div className="leave-emp-profile-avatar" style={{ background: typeColor }}>
                  {emp.avatar}
                </div>
                <div className="leave-emp-profile-info">
                  <span className="leave-emp-profile-name">{emp.name}</span>
                  <span className="leave-emp-profile-position">{emp.position}</span>
                  <div className="leave-emp-profile-meta">
                    <span><Mail size={12} /> {emp.email}</span>
                    <span><Phone size={12} /> {emp.phone}</span>
                    <span><Briefcase size={12} /> {emp.department}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="leave-detail-section">
            <h4 className="leave-detail-section-title">
              <FileText size={16} /> Current Request Details
            </h4>
            <div className="leave-detail-grid">
              <div className="leave-detail-item">
                <Calendar size={18} className="leave-detail-icon" />
                <div>
                  <span className="leave-detail-label">Start Date</span>
                  <span className="leave-detail-value">{formatDate(record.startDate)}</span>
                </div>
              </div>
              <div className="leave-detail-item">
                <Calendar size={18} className="leave-detail-icon" />
                <div>
                  <span className="leave-detail-label">End Date</span>
                  <span className="leave-detail-value">{formatDate(record.endDate)}</span>
                </div>
              </div>
              <div className="leave-detail-item">
                <Clock size={18} className="leave-detail-icon" />
                <div>
                  <span className="leave-detail-label">Duration</span>
                  <span className="leave-detail-value">{record.duration} day{record.duration > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="leave-detail-item">
                <FileText size={18} className="leave-detail-icon" />
                <div>
                  <span className="leave-detail-label">Applied On</span>
                  <span className="leave-detail-value">{formatDate(record.appliedDate)}</span>
                </div>
              </div>
            </div>
            {record.reason && (
              <div className="leave-detail-reason">
                <FileText size={16} />
                <div>
                  <span className="leave-detail-label">Reason</span>
                  <span>{record.reason}</span>
                </div>
              </div>
            )}
            {record.status === 'Approved' && record.approvedDate && (
              <div className="leave-detail-approved">
                <CheckCircle size={16} color="var(--success)" />
                <span>Approved on {formatDate(record.approvedDate)}{record.approvedBy ? ` by ${record.approvedBy}` : ''}</span>
              </div>
            )}
            {record.status === 'Rejected' && (
              <div className="leave-detail-rejected">
                <XCircle size={16} color="var(--danger)" />
                <div>
                  <span>Rejected on {formatDate(record.approvedDate)}{record.rejectedBy ? ` by ${record.rejectedBy}` : ''}</span>
                  {record.rejectionReason && (
                    <span className="leave-detail-rejection-reason">{record.rejectionReason}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="leave-detail-section">
            <h4 className="leave-detail-section-title">
              <Wallet size={16} /> Leave Balance
            </h4>
            <div className="leave-balance-grid-modal">
              {Object.entries(leaveBalance).map(([type, bal]) => {
                const color = LEAVE_TYPE_COLORS[type] || '#6366f1';
                const pct = bal.total > 0 ? (bal.used / bal.total) * 100 : 0;
                return (
                  <div key={type} className="leave-balance-item-modal">
                    <div className="leave-balance-item-header">
                      <span className="leave-balance-item-dot" style={{ background: color }} />
                      <span className="leave-balance-item-type">{type}</span>
                    </div>
                    <div className="leave-balance-bar-wrap">
                      <div className="leave-balance-bar">
                        <div className="leave-balance-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="leave-balance-count">{bal.used}/{bal.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {previousLeaves.length > 0 && (
            <div className="leave-detail-section">
              <h4 className="leave-detail-section-title">
                <History size={16} /> Leave History
              </h4>
              <div className="leave-history-list-modal">
                {previousLeaves.slice(0, 5).map(prev => {
                  const prevCfg = STATUS_CONFIG[prev.status] || STATUS_CONFIG.Pending;
                  const PrevIcon = prevCfg.icon;
                  const prevTypeColor = LEAVE_TYPE_COLORS[prev.leaveType] || '#6366f1';
                  return (
                    <div key={prev.id} className="leave-history-item-modal">
                      <div className="leave-history-item-left">
                        <span className="leave-history-item-type" style={{ color: prevTypeColor }}>{prev.leaveType}</span>
                        <span className="leave-history-item-dates">{formatDate(prev.startDate)} - {formatDate(prev.endDate)}</span>
                      </div>
                      <span className="leave-history-item-status" style={{ color: prevCfg.color }}>
                        <PrevIcon size={14} /> {prev.status}
                      </span>
                    </div>
                  );
                })}
              </div>
              {previousApproved.length > 0 && (
                <div className="leave-history-summary">
                  <span className="leave-history-summary-item approved">
                    <CheckCircle size={14} /> {previousApproved.length} Approved
                  </span>
                  {previousRejected.length > 0 && (
                    <span className="leave-history-summary-item rejected">
                      <XCircle size={14} /> {previousRejected.length} Rejected
                    </span>
                  )}
                  {previousPending.length > 0 && (
                    <span className="leave-history-summary-item pending">
                      <Clock size={14} /> {previousPending.length} Pending
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
