import { useState } from 'react';
import { X, Save, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'on-leave', label: 'On Leave' },
];

function calculateHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  let hours = (outH + outM / 60) - (inH + inM / 60);
  if (hours < 0) hours += 24;
  return Math.round(hours * 100) / 100;
}

export default function AttendanceEditModal({ record, employee, onClose }) {
  const { updateRecord } = useAttendance();

  const [status, setStatus] = useState(record.status);
  const [checkIn, setCheckIn] = useState(record.checkIn || '');
  const [checkOut, setCheckOut] = useState(record.checkOut || '');
  const [note, setNote] = useState(record.note || '');

  const hoursWorked = calculateHours(checkIn, checkOut);
  const overtime = hoursWorked > 8 ? Math.round((hoursWorked - 8) * 100) / 100 : 0;

  const handleSave = () => {
    updateRecord(record.employeeId, record.date, {
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      hoursWorked,
      overtime,
      note,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content attendance-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="emp-avatar" style={{ borderColor: 'var(--primary-blue)' }}>
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h3>Edit Attendance</h3>
              <p className="modal-subtitle">{employee.firstName} {employee.lastName} &bull; {record.date}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="edit-form-grid">
            <div className="edit-form-group">
              <label className="edit-form-label">
                <AlertTriangle size={14} /> Attendance Status
              </label>
              <select
                className="edit-form-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="edit-form-group">
              <label className="edit-form-label">
                <Clock size={14} /> Check In
              </label>
              <input
                type="time"
                className="edit-form-input"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                disabled={status === 'absent' || status === 'on-leave'}
              />
            </div>

            <div className="edit-form-group">
              <label className="edit-form-label">
                <Clock size={14} /> Check Out
              </label>
              <input
                type="time"
                className="edit-form-input"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                disabled={status === 'absent' || status === 'on-leave'}
              />
            </div>

            <div className="edit-form-group">
              <label className="edit-form-label">
                <Clock size={14} /> Working Hours
              </label>
              <div className="edit-form-readonly">
                {hoursWorked > 0 ? `${Math.floor(hoursWorked)}h ${Math.round((hoursWorked % 1) * 60)}m` : '--'}
              </div>
            </div>
          </div>

          <div className="edit-form-group full-width">
            <label className="edit-form-label">
              <FileText size={14} /> Notes
            </label>
            <textarea
              className="edit-form-textarea"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          <div className="edit-form-actions">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
