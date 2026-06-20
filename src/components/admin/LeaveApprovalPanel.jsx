import React from 'react';
import { Check, X, Calendar } from 'lucide-react';

export default function LeaveApprovalPanel({ requests, onApprove, onReject }) {
  const pending = requests.filter(r => r.status === 'Pending').slice(0, 5);

  return (
    <div className="admin-leave-panel">
      <div className="admin-leave-panel-header">
        <h4>Pending Leave Requests</h4>
        <span className="admin-leave-count">{pending.length}</span>
      </div>
      <div className="admin-leave-list">
        {pending.map(req => (
          <div key={req.id} className="admin-leave-item">
            <div className="admin-leave-employee">
              <div className="admin-leave-avatar">{req.employeeAvatar}</div>
              <div className="admin-leave-info">
                <span className="admin-leave-name">{req.employeeName}</span>
                <span className="admin-leave-type">{req.leaveType}</span>
              </div>
            </div>
            <div className="admin-leave-dates">
              <Calendar size={12} />
              <span>{req.startDate} to {req.endDate}</span>
            </div>
            <p className="admin-leave-reason">{req.reason}</p>
            <div className="admin-leave-actions">
              <button className="admin-leave-approve" onClick={() => onApprove?.(req.id)}>
                <Check size={14} /> Approve
              </button>
              <button className="admin-leave-reject" onClick={() => onReject?.(req.id)}>
                <X size={14} /> Reject
              </button>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <div className="admin-leave-empty">No pending leave requests</div>
        )}
      </div>
    </div>
  );
}
