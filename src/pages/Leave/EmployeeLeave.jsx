import { useState, useMemo } from 'react';
import {
  CheckCircle, XCircle, Clock, CalendarDays, TrendingUp,
  Plus, X, AlertTriangle, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLeave } from '../../contexts/LeaveContext';
import LeaveApplicationForm from '../../components/Leave/LeaveApplicationForm';
import LeaveDetailsModal from '../../components/Leave/LeaveDetailsModal';

const STATUS_ICONS = {
  Pending: Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
  Cancelled: XCircle,
};

const STATUS_COLORS = {
  Pending: 'var(--warning)',
  Approved: 'var(--success)',
  Rejected: 'var(--danger)',
  Cancelled: 'var(--text-dim)',
};

const LEAVE_TYPE_COLORS = {
  'Casual Leave': '#3b82f6',
  'Sick Leave': '#ef4444',
  'Earned Leave': '#10b981',
  'Maternity Leave': '#ec4899',
  'Paternity Leave': '#8b5cf6',
  'Work From Home': '#06b6d4',
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmployeeLeave() {
  const { user } = useAuth();
  const { getEmployeeLeaves, getLeaveBalance, cancelLeave, leaveBalanceConfig } = useLeave();

  const currentEmp = user;
  const empLeaves = useMemo(() => getEmployeeLeaves(currentEmp.id), [currentEmp.id, getEmployeeLeaves]);
  const balance = useMemo(() => getLeaveBalance(currentEmp.id), [currentEmp.id, getLeaveBalance]);

  const [activeTab, setActiveTab] = useState('overview');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const pendingRequests = empLeaves.filter(r => r.status === 'Pending');
  const recentLeaves = [...empLeaves].sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || '')).slice(0, 10);

  const totalUsed = Object.values(balance).reduce((sum, b) => sum + b.used, 0);
  const totalRemaining = Object.values(balance).reduce((sum, b) => sum + b.remaining, 0);

  return (
    <div className="leave-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Leave</h1>
          <p className="page-subtitle">Welcome back, {currentEmp.firstName}. Manage your leave requests.</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowApplyForm(true)}>
            <Plus size={16} /> Apply Leave
          </button>
        </div>
      </div>

      <div className="leave-stats-grid">
        <div className="leave-stat-card">
          <div className="leave-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{pendingRequests.length}</span>
            <span className="leave-stat-label">Pending</span>
          </div>
        </div>
        <div className="leave-stat-card">
          <div className="leave-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{empLeaves.filter(r => r.status === 'Approved').length}</span>
            <span className="leave-stat-label">Approved</span>
          </div>
        </div>
        <div className="leave-stat-card">
          <div className="leave-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <CalendarDays size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{totalUsed}</span>
            <span className="leave-stat-label">Days Used</span>
          </div>
        </div>
        <div className="leave-stat-card">
          <div className="leave-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--info)' }}>
            <Award size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{totalRemaining}</span>
            <span className="leave-stat-label">Remaining</span>
          </div>
        </div>
      </div>

      <div className="leave-emp-tabs">
        <button className={`leave-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <TrendingUp size={16} /> Overview
        </button>
        <button className={`leave-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Clock size={16} /> History
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="leave-overview">
          <div className="leave-balance-section">
            <h3 className="leave-section-title">Leave Balance</h3>
            <div className="leave-balance-grid">
              {Object.entries(leaveBalanceConfig).map(([type, total]) => {
                const b = balance[type];
                const pct = total > 0 ? (b.used / total) * 100 : 0;
                const color = LEAVE_TYPE_COLORS[type];
                return (
                  <div key={type} className="leave-balance-card">
                    <div className="leave-balance-header">
                      <span className="leave-balance-type-dot" style={{ background: color }} />
                      <span className="leave-balance-type">{type}</span>
                    </div>
                    <div className="leave-balance-bar-wrap">
                      <div className="leave-balance-bar">
                        <div className="leave-balance-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="leave-balance-count">{b.used}/{total}</span>
                    </div>
                    <span className="leave-balance-remaining-text">{b.remaining} remaining</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="leave-pending-section">
            <h3 className="leave-section-title">Pending Requests</h3>
            {pendingRequests.length === 0 ? (
              <div className="leave-empty-state">No pending leave requests</div>
            ) : (
              <div className="leave-pending-list">
                {pendingRequests.map(req => (
                  <div key={req.id} className="leave-pending-item">
                    <div className="leave-pending-left">
                      <div className="leave-pending-dot" style={{ background: LEAVE_TYPE_COLORS[req.leaveType] }} />
                      <div>
                        <span className="leave-pending-type">{req.leaveType}</span>
                        <span className="leave-pending-dates">
                          {formatDate(req.startDate)} - {formatDate(req.endDate)} ({req.duration}d)
                        </span>
                      </div>
                    </div>
                    <div className="leave-pending-actions">
                      <span className="leave-status-badge" style={{ color: STATUS_COLORS.Pending, background: `${STATUS_COLORS.Pending}15` }}>
                        <Clock size={12} /> Pending
                      </span>
                      <button className="leave-cancel-btn" onClick={() => setCancelConfirm(req)}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="leave-history">
          <div className="leave-history-list">
            {recentLeaves.length === 0 ? (
              <div className="leave-empty-state">No leave history</div>
            ) : (
              recentLeaves.map(record => {
                const StatusIcon = STATUS_ICONS[record.status];
                const typeColor = LEAVE_TYPE_COLORS[record.leaveType];
                return (
                  <div key={record.id} className="leave-history-item" onClick={() => setDetailRecord(record)}>
                    <div className="leave-history-left">
                      <div className="leave-history-date">
                        <span className="leave-history-day">{formatDate(record.startDate).split(' ')[1]}</span>
                        <span className="leave-history-month">{formatDate(record.startDate).split(' ')[0]}</span>
                      </div>
                      <div className="leave-history-info">
                        <span className="leave-history-type" style={{ color: typeColor }}>
                          {record.leaveType}
                        </span>
                        <span className="leave-history-dates">
                          {formatDate(record.startDate)} - {formatDate(record.endDate)} &bull; {record.duration}d
                        </span>
                      </div>
                    </div>
                    <span className="leave-status-badge" style={{ color: STATUS_COLORS[record.status], background: `${STATUS_COLORS[record.status]}15` }}>
                      <StatusIcon size={12} /> {record.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {showApplyForm && (
        <LeaveApplicationForm employee={currentEmp} onClose={() => setShowApplyForm(false)} />
      )}

      {detailRecord && (
        <LeaveDetailsModal record={detailRecord} onClose={() => setDetailRecord(null)} />
      )}

      {cancelConfirm && (
        <div className="modal-overlay" onClick={() => setCancelConfirm(null)}>
          <div className="modal-content leave-reject-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="leave-reject-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'var(--warning)' }}>
                  <AlertTriangle size={24} color="var(--warning)" />
                </div>
                <div>
                  <h3>Cancel Leave Request</h3>
                  <p className="modal-subtitle">{cancelConfirm.leaveType} &bull; {formatDate(cancelConfirm.startDate)}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setCancelConfirm(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Are you sure you want to cancel this pending leave request? This action cannot be undone.
              </p>
              <div className="leave-form-actions">
                <button className="btn btn-outline" onClick={() => setCancelConfirm(null)}>Keep Request</button>
                <button className="btn btn-danger" onClick={async () => {
                  await cancelLeave(cancelConfirm.id);
                  setCancelConfirm(null);
                }}>
                  <X size={16} /> Cancel Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
