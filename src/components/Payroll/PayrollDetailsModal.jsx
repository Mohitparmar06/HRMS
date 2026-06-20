import { X, DollarSign, Calendar, CheckCircle, Clock, User, Briefcase, Mail, Wallet, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  Paid: { color: 'var(--success)', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' },
  Pending: { color: 'var(--warning)', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' },
};

function formatCurrency(val) {
  if (val == null) return '--';
  return '$' + val.toLocaleString('en-US');
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PayrollDetailsModal({ record, onClose }) {
  if (!record) return null;

  const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payroll-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="payroll-detail-avatar">
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
          <div className="payroll-detail-status" style={{ borderColor: cfg.color, background: cfg.bg }}>
            <StatusIcon size={24} color={cfg.color} />
            <div>
              <span style={{ color: cfg.color, fontWeight: 700, fontSize: '0.9rem' }}>{record.status}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{record.period}</span>
            </div>
            {record.paymentDate && (
              <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                Paid on {formatDate(record.paymentDate)}
              </span>
            )}
          </div>

          <div className="payroll-detail-section">
            <h4 className="payroll-detail-section-title">
              <User size={16} /> Employee Information
            </h4>
            <div className="payroll-detail-info-grid">
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Name</span>
                <span className="payroll-detail-value">{record.employeeName}</span>
              </div>
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Employee ID</span>
                <span className="payroll-detail-value">{record.employeeId}</span>
              </div>
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Department</span>
                <span className="payroll-detail-value">{record.department}</span>
              </div>
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Position</span>
                <span className="payroll-detail-value">{record.position}</span>
              </div>
            </div>
          </div>

          <div className="payroll-detail-section">
            <h4 className="payroll-detail-section-title">
              <DollarSign size={16} /> Salary Breakdown
            </h4>
            <div className="payroll-detail-breakdown">
              <div className="payroll-detail-breakdown-group">
                <h5 className="payroll-detail-group-title">Earnings</h5>
                <div className="payroll-detail-rows">
                  <div className="payroll-detail-row">
                    <span>Basic Salary</span>
                    <span>{formatCurrency(record.baseSalary)}</span>
                  </div>
                  <div className="payroll-detail-row">
                    <span>HRA</span>
                    <span>{formatCurrency(record.hra)}</span>
                  </div>
                  <div className="payroll-detail-row">
                    <span>Transport Allowance</span>
                    <span>{formatCurrency(record.transport)}</span>
                  </div>
                  <div className="payroll-detail-row">
                    <span>Medical Allowance</span>
                    <span>{formatCurrency(record.medical)}</span>
                  </div>
                  <div className="payroll-detail-row">
                    <span>Special Allowance</span>
                    <span>{formatCurrency(record.specialAllowance)}</span>
                  </div>
                  {record.bonus > 0 && (
                    <div className="payroll-detail-row bonus">
                      <span>Bonus</span>
                      <span>+{formatCurrency(record.bonus)}</span>
                    </div>
                  )}
                  {record.overtimePay > 0 && (
                    <div className="payroll-detail-row bonus">
                      <span>Overtime Pay</span>
                      <span>+{formatCurrency(record.overtimePay)}</span>
                    </div>
                  )}
                  <div className="payroll-detail-row total">
                    <span>Gross Salary</span>
                    <span>{formatCurrency(record.grossSalary)}</span>
                  </div>
                </div>
              </div>
              <div className="payroll-detail-breakdown-group">
                <h5 className="payroll-detail-group-title deduction">Deductions</h5>
                <div className="payroll-detail-rows">
                  <div className="payroll-detail-row">
                    <span>PF</span>
                    <span className="deduction">-{formatCurrency(record.pf)}</span>
                  </div>
                  <div className="payroll-detail-row">
                    <span>Professional Tax</span>
                    <span className="deduction">-{formatCurrency(record.professionalTax)}</span>
                  </div>
                  <div className="payroll-detail-row">
                    <span>Income Tax</span>
                    <span className="deduction">-{formatCurrency(record.incomeTax)}</span>
                  </div>
                  <div className="payroll-detail-row">
                    <span>Insurance</span>
                    <span className="deduction">-{formatCurrency(record.insurance)}</span>
                  </div>
                  {record.otherDeductions > 0 && (
                    <div className="payroll-detail-row">
                      <span>Other Deductions</span>
                      <span className="deduction">-{formatCurrency(record.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="payroll-detail-row total deduction">
                    <span>Total Deductions</span>
                    <span className="deduction">-{formatCurrency(record.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="payroll-detail-net">
              <span>Net Salary</span>
              <span className="payroll-detail-net-value">{formatCurrency(record.netSalary)}</span>
            </div>
          </div>

          <div className="payroll-detail-section">
            <h4 className="payroll-detail-section-title">
              <Calendar size={16} /> Payment Status
            </h4>
            <div className="payroll-detail-info-grid">
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Status</span>
                <span className="leave-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                  <StatusIcon size={14} /> {record.status}
                </span>
              </div>
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Payment Date</span>
                <span className="payroll-detail-value">{formatDate(record.paymentDate)}</span>
              </div>
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Pay Period</span>
                <span className="payroll-detail-value">{record.period}</span>
              </div>
              <div className="payroll-detail-info-item">
                <span className="payroll-detail-label">Record ID</span>
                <span className="payroll-detail-value" style={{ fontFamily: 'monospace' }}>{record.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
