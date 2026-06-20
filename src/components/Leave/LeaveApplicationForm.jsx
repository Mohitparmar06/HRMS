import { useState } from 'react';
import { X, Send, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useLeave } from '../../contexts/LeaveContext';

const LEAVE_TYPES = [
  'Casual Leave', 'Sick Leave', 'Earned Leave',
  'Maternity Leave', 'Paternity Leave', 'Work From Home',
];

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calcDuration(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

export default function LeaveApplicationForm({ employee, onClose }) {
  const { addLeaveRequest, getLeaveBalance } = useLeave();
  const balance = getLeaveBalance(employee.id);

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const duration = calcDuration(startDate, endDate);
  const today = toLocalDateStr(new Date());

  const validate = () => {
    const errs = {};
    if (!leaveType) errs.leaveType = 'Select a leave type';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = 'End date must be after start date';
    }
    if (startDate && new Date(startDate) < new Date(today)) {
      errs.startDate = 'Cannot apply for past dates';
    }
    if (!reason.trim()) errs.reason = 'Reason is required';
    if (leaveType && duration > 0 && balance[leaveType] && duration > balance[leaveType].remaining) {
      errs.duration = `Insufficient balance. Available: ${balance[leaveType].remaining} days`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    addLeaveRequest({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeAvatar: employee.avatar,
      department: employee.department,
      leaveType,
      startDate,
      endDate,
      duration,
      reason: reason.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content leave-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="emp-avatar" style={{ borderColor: 'var(--success)' }}>
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h3>Apply for Leave</h3>
              <p className="modal-subtitle">{employee.department} &bull; {employee.position}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="leave-form-grid">
              <div className="leave-form-group">
                <label className="leave-form-label">
                  <AlertCircle size={14} /> Leave Type
                </label>
                <select
                  className={`leave-form-select ${errors.leaveType ? 'error' : ''}`}
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                >
                  <option value="">Select leave type</option>
                  {LEAVE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.leaveType && <span className="leave-form-error">{errors.leaveType}</span>}
              </div>

              {leaveType && balance[leaveType] && (
                <div className="leave-balance-badge">
                  <span className="leave-balance-remaining">{balance[leaveType].remaining}</span>
                  <span className="leave-balance-label">days remaining</span>
                </div>
              )}
            </div>

            <div className="leave-form-grid">
              <div className="leave-form-group">
                <label className="leave-form-label">
                  <Calendar size={14} /> Start Date
                </label>
                <input
                  type="date"
                  className={`leave-form-input ${errors.startDate ? 'error' : ''}`}
                  value={startDate}
                  min={today}
                  onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(''); }}
                />
                {errors.startDate && <span className="leave-form-error">{errors.startDate}</span>}
              </div>

              <div className="leave-form-group">
                <label className="leave-form-label">
                  <Calendar size={14} /> End Date
                </label>
                <input
                  type="date"
                  className={`leave-form-input ${errors.endDate ? 'error' : ''}`}
                  value={endDate}
                  min={startDate || today}
                  onChange={e => setEndDate(e.target.value)}
                />
                {errors.endDate && <span className="leave-form-error">{errors.endDate}</span>}
              </div>
            </div>

            {duration > 0 && (
              <div className="leave-duration-info">
                <span>{duration} day{duration > 1 ? 's' : ''}</span>
                {errors.duration && <span className="leave-form-error">{errors.duration}</span>}
              </div>
            )}

            <div className="leave-form-group">
              <label className="leave-form-label">
                <FileText size={14} /> Reason
              </label>
              <textarea
                className={`leave-form-textarea ${errors.reason ? 'error' : ''}`}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Provide a reason for your leave request..."
                rows={4}
              />
              {errors.reason && <span className="leave-form-error">{errors.reason}</span>}
            </div>

            <div className="leave-form-actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <Send size={16} /> Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
