import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';

export default function AttendanceDeleteDialog({ record, employee, onClose }) {
  const { deleteRecord } = useAttendance();

  const handleDelete = () => {
    deleteRecord(record.employeeId, record.date);
    onClose();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content attendance-delete-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="delete-icon-wrap">
              <AlertTriangle size={24} color="var(--danger)" />
            </div>
            <div>
              <h3>Delete Attendance Record</h3>
              <p className="modal-subtitle">This action cannot be undone</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="delete-confirm-info">
            <p>You are about to delete the attendance record for:</p>
            <div className="delete-record-summary">
              <div className="delete-emp-name">{employee.firstName} {employee.lastName}</div>
              <div className="delete-record-date">{formatDate(record.date)}</div>
              <div className="delete-record-status">
                Status: <strong>{record.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
              </div>
            </div>
          </div>

          <div className="edit-form-actions">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} /> Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
