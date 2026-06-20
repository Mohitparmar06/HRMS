import { useState, useMemo } from 'react';
import {
  Search, Filter, CheckCircle, XCircle, Clock, CalendarDays,
  ChevronDown, ChevronUp, Eye, Check, X, TrendingUp, AlertTriangle,
  ChevronLeft, ChevronRight, FileText, Users, Briefcase, BarChart3,
  UserCheck, UserX, CalendarOff
} from 'lucide-react';
import { useLeave } from '../../contexts/LeaveContext';
import { employees } from '../../services/dummyData';
import { useDepartments } from '../../contexts/DepartmentContext';
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

const LEAVE_TYPES = [
  'Casual Leave', 'Sick Leave', 'Earned Leave',
  'Maternity Leave', 'Paternity Leave', 'Work From Home',
];

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminLeave() {
  const { leaveRecords, approveLeave, rejectLeave, getLeaveStats, getLeaveByType, getEmployeeLeaves, getLeaveBalance } = useLeave();
  const { departments } = useDepartments();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('appliedDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [detailRecord, setDetailRecord] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const perPage = 10;

  const stats = useMemo(() => getLeaveStats(), [leaveRecords]);
  const byType = useMemo(() => getLeaveByType(), [leaveRecords]);

  const pendingRequests = useMemo(
    () => leaveRecords.filter(r => r.status === 'Pending'),
    [leaveRecords]
  );

  const filteredRecords = useMemo(() => {
    let recs = [...leaveRecords];

    if (activeTab !== 'all') {
      recs = recs.filter(r => r.status === activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    }

    if (search) {
      const q = search.toLowerCase();
      recs = recs.filter(r =>
        r.employeeName?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') recs = recs.filter(r => r.status === statusFilter);
    if (deptFilter !== 'all') recs = recs.filter(r => r.department === deptFilter);
    if (typeFilter !== 'all') recs = recs.filter(r => r.leaveType === typeFilter);

    recs.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'employeeName') cmp = (a.employeeName || '').localeCompare(b.employeeName || '');
      else if (sortField === 'startDate') cmp = (a.startDate || '').localeCompare(b.startDate || '');
      else if (sortField === 'appliedDate') cmp = (a.appliedDate || '').localeCompare(b.appliedDate || '');
      else if (sortField === 'duration') cmp = (a.duration || 0) - (b.duration || 0);
      else if (sortField === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return recs;
  }, [leaveRecords, search, statusFilter, deptFilter, typeFilter, sortField, sortDir, activeTab]);

  const totalPages = Math.ceil(filteredRecords.length / perPage);
  const paginatedRecords = filteredRecords.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  const handleApprove = (id) => {
    approveLeave(id, 'Admin');
  };

  const handleRejectClick = (record) => {
    setRejectDialog(record);
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    rejectLeave(rejectDialog.id, rejectReason.trim(), 'Admin');
    setRejectDialog(null);
    setRejectReason('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tabCounts = useMemo(() => ({
    all: leaveRecords.length,
    pending: leaveRecords.filter(r => r.status === 'Pending').length,
    approved: leaveRecords.filter(r => r.status === 'Approved').length,
    rejected: leaveRecords.filter(r => r.status === 'Rejected').length,
  }), [leaveRecords]);

  return (
    <div className="leave-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Manage employee leave requests and approvals</p>
        </div>
      </div>

      <div className="leave-dashboard-cards">
        <div className="leave-dashboard-card">
          <div className="leave-dashboard-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div className="leave-dashboard-info">
            <span className="leave-dashboard-value">{stats.pending}</span>
            <span className="leave-dashboard-label">Pending Requests</span>
          </div>
        </div>
        <div className="leave-dashboard-card">
          <div className="leave-dashboard-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="leave-dashboard-info">
            <span className="leave-dashboard-value">{stats.approvedToday}</span>
            <span className="leave-dashboard-label">Approved Today</span>
          </div>
        </div>
        <div className="leave-dashboard-card">
          <div className="leave-dashboard-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <XCircle size={22} />
          </div>
          <div className="leave-dashboard-info">
            <span className="leave-dashboard-value">{stats.rejectedToday}</span>
            <span className="leave-dashboard-label">Rejected Today</span>
          </div>
        </div>
        <div className="leave-dashboard-card">
          <div className="leave-dashboard-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <CalendarOff size={22} />
          </div>
          <div className="leave-dashboard-info">
            <span className="leave-dashboard-value">{stats.onLeaveToday}</span>
            <span className="leave-dashboard-label">On Leave Today</span>
          </div>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="leave-pending-section">
          <div className="leave-pending-header">
            <div className="leave-pending-header-left">
              <AlertTriangle size={20} color="var(--warning)" />
              <h2 className="leave-pending-title">Pending Leave Requests</h2>
              <span className="leave-pending-count">{pendingRequests.length}</span>
            </div>
          </div>
          <div className="leave-pending-grid">
            {pendingRequests.map(record => {
              const emp = employees.find(e => e.id === record.employeeId);
              const typeColor = LEAVE_TYPE_COLORS[record.leaveType] || '#6366f1';
              return (
                <div key={record.id} className="leave-pending-card">
                  <div className="leave-pending-card-header">
                    <div className="leave-pending-card-employee">
                      <div className="leave-pending-card-avatar" style={{ background: typeColor }}>
                        {record.employeeAvatar}
                      </div>
                      <div className="leave-pending-card-emp-info">
                        <span className="leave-pending-card-name">{record.employeeName}</span>
                        <span className="leave-pending-card-id">{record.employeeId}</span>
                      </div>
                    </div>
                    <span className="leave-pending-card-status">
                      <Clock size={12} /> Pending
                    </span>
                  </div>
                  <div className="leave-pending-card-details">
                    <div className="leave-pending-card-row">
                      <span className="leave-pending-card-label">Department</span>
                      <span className="leave-pending-card-value">{record.department}</span>
                    </div>
                    <div className="leave-pending-card-row">
                      <span className="leave-pending-card-label">Leave Type</span>
                      <span className="leave-pending-card-value" style={{ color: typeColor }}>{record.leaveType}</span>
                    </div>
                    <div className="leave-pending-card-row">
                      <span className="leave-pending-card-label">Duration</span>
                      <span className="leave-pending-card-value">{formatDate(record.startDate)} - {formatDate(record.endDate)}</span>
                    </div>
                    <div className="leave-pending-card-row">
                      <span className="leave-pending-card-label">Total Days</span>
                      <span className="leave-pending-card-value">{record.duration} day{record.duration > 1 ? 's' : ''}</span>
                    </div>
                    <div className="leave-pending-card-row">
                      <span className="leave-pending-card-label">Reason</span>
                      <span className="leave-pending-card-value leave-pending-card-reason">{record.reason}</span>
                    </div>
                    <div className="leave-pending-card-row">
                      <span className="leave-pending-card-label">Applied</span>
                      <span className="leave-pending-card-value">{formatDate(record.appliedDate)}</span>
                    </div>
                  </div>
                  <div className="leave-pending-card-actions">
                    <button className="leave-pending-btn approve" onClick={() => handleApprove(record.id)}>
                      <Check size={14} /> Approve
                    </button>
                    <button className="leave-pending-btn reject" onClick={() => handleRejectClick(record)}>
                      <X size={14} /> Reject
                    </button>
                    <button className="leave-pending-btn view" onClick={() => setDetailRecord(record)}>
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="leave-tabs-section">
        <div className="leave-emp-tabs">
          <button className={`leave-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabChange('all')}>
            <BarChart3 size={16} /> All Requests <span className="leave-tab-count">{tabCounts.all}</span>
          </button>
          <button className={`leave-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => handleTabChange('pending')}>
            <Clock size={16} /> Pending <span className="leave-tab-count">{tabCounts.pending}</span>
          </button>
          <button className={`leave-tab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => handleTabChange('approved')}>
            <CheckCircle size={16} /> Approved <span className="leave-tab-count">{tabCounts.approved}</span>
          </button>
          <button className={`leave-tab ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => handleTabChange('rejected')}>
            <XCircle size={16} /> Rejected <span className="leave-tab-count">{tabCounts.rejected}</span>
          </button>
        </div>
      </div>

      <div className="leave-table-section">
        <div className="leave-filters">
          <div className="leave-search-wrap">
            <Search size={18} className="leave-search-icon" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="leave-search"
            />
          </div>
          <select
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            className="leave-filter-select"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="leave-filter-select"
          >
            <option value="all">All Leave Types</option>
            {LEAVE_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="leave-table-wrap">
          <table className="leave-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('employeeName')} className="sortable">
                  Employee <SortIcon field="employeeName" />
                </th>
                <th>Department</th>
                <th>Leave Type</th>
                <th onClick={() => toggleSort('startDate')} className="sortable">
                  Start Date <SortIcon field="startDate" />
                </th>
                <th>End Date</th>
                <th onClick={() => toggleSort('duration')} className="sortable">
                  Days <SortIcon field="duration" />
                </th>
                <th>Reason</th>
                <th onClick={() => toggleSort('appliedDate')} className="sortable">
                  Applied <SortIcon field="appliedDate" />
                </th>
                <th onClick={() => toggleSort('status')} className="sortable">
                  Status <SortIcon field="status" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map(record => {
                const StatusIcon = STATUS_ICONS[record.status];
                const statusColor = STATUS_COLORS[record.status];
                const typeColor = LEAVE_TYPE_COLORS[record.leaveType];
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="leave-emp-cell">
                        <div className="leave-emp-avatar" style={{ background: typeColor || '#6366f1' }}>
                          {record.employeeAvatar}
                        </div>
                        <div>
                          <span className="leave-emp-name">{record.employeeName}</span>
                          <span className="leave-emp-id">{record.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="leave-dept-badge">{record.department}</span></td>
                    <td>
                      <span className="leave-type-badge" style={{ color: typeColor, background: `${typeColor}15` }}>
                        {record.leaveType}
                      </span>
                    </td>
                    <td><span className="leave-date">{formatDate(record.startDate)}</span></td>
                    <td><span className="leave-date">{formatDate(record.endDate)}</span></td>
                    <td><span className="leave-duration">{record.duration}d</span></td>
                    <td><span className="leave-cell-reason" title={record.reason}>{record.reason}</span></td>
                    <td><span className="leave-date">{formatDate(record.appliedDate)}</span></td>
                    <td>
                      <span className="leave-status-badge" style={{ color: statusColor, background: `${statusColor}15` }}>
                        <StatusIcon size={14} />
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="leave-action-btns">
                        <button className="leave-action-btn" title="View Details" onClick={() => setDetailRecord(record)}>
                          <Eye size={16} />
                        </button>
                        {record.status === 'Pending' && (
                          <>
                            <button className="leave-action-btn approve" title="Approve" onClick={() => handleApprove(record.id)}>
                              <Check size={16} />
                            </button>
                            <button className="leave-action-btn reject" title="Reject" onClick={() => handleRejectClick(record)}>
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan="10" className="leave-datatable-empty">No leave requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="leave-pagination">
          <span className="leave-page-info">
            Showing {filteredRecords.length > 0 ? (page - 1) * perPage + 1 : 0} to {Math.min(page * perPage, filteredRecords.length)} of {filteredRecords.length}
          </span>
          <div className="leave-page-buttons">
            <button className="leave-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} className={`leave-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
            <button className="leave-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {detailRecord && (
        <LeaveDetailsModal
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
          employeeLeaves={getEmployeeLeaves(detailRecord.employeeId)}
          leaveBalance={getLeaveBalance(detailRecord.employeeId)}
          allEmployees={employees}
        />
      )}

      {rejectDialog && (
        <div className="modal-overlay" onClick={() => setRejectDialog(null)}>
          <div className="modal-content leave-reject-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="leave-reject-icon-wrap">
                  <AlertTriangle size={24} color="var(--danger)" />
                </div>
                <div>
                  <h3>Reject Leave Request</h3>
                  <p className="modal-subtitle">{rejectDialog.employeeName} &bull; {rejectDialog.leaveType}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setRejectDialog(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="leave-form-group">
                <label className="leave-form-label">
                  <FileText size={14} /> Rejection Reason
                </label>
                <textarea
                  className="leave-form-textarea"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                />
              </div>
              <div className="leave-form-actions">
                <button className="btn btn-outline" onClick={() => setRejectDialog(null)}>Cancel</button>
                <button
                  className="btn btn-danger"
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim()}
                >
                  <X size={16} /> Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
