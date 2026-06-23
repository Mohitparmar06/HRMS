import { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, Clock, CheckCircle, Download,
  Eye, Wallet, Calendar
} from 'lucide-react';
import { usePayroll } from '../../contexts/PayrollContext';
import { useAuth } from '../../contexts/AuthContext';
import PayslipModal from '../../components/Payroll/PayslipModal';
import PayrollDetailsModal from '../../components/Payroll/PayrollDetailsModal';

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

function downloadPayslip(record) {
  const content = [
    'DAYFLOW HRMS - PAYSLIP',
    '=' .repeat(40),
    `Period: ${record.period}`,
    `Employee: ${record.employeeName} (${record.employeeId})`,
    `Department: ${record.department}`,
    `Position: ${record.position}`,
    '',
    'EARNINGS:',
    `  Basic Salary:       ${formatCurrency(record.baseSalary)}`,
    `  HRA:                ${formatCurrency(record.hra)}`,
    `  Transport:          ${formatCurrency(record.transport)}`,
    `  Medical:            ${formatCurrency(record.medical)}`,
    `  Special Allowance:  ${formatCurrency(record.specialAllowance)}`,
    `  Bonus:              ${formatCurrency(record.bonus)}`,
    `  Overtime:           ${formatCurrency(record.overtimePay)}`,
    `  Gross Salary:       ${formatCurrency(record.grossSalary)}`,
    '',
    'DEDUCTIONS:',
    `  PF:                 ${formatCurrency(record.pf)}`,
    `  Professional Tax:   ${formatCurrency(record.professionalTax)}`,
    `  Income Tax:         ${formatCurrency(record.incomeTax)}`,
    `  Insurance:          ${formatCurrency(record.insurance)}`,
    `  Other Deductions:   ${formatCurrency(record.otherDeductions)}`,
    `  Total Deductions:   ${formatCurrency(record.totalDeductions)}`,
    '',
    `NET SALARY: ${formatCurrency(record.netSalary)}`,
    '',
    `Status: ${record.status}`,
    record.paymentDate ? `Payment Date: ${formatDate(record.paymentDate)}` : '',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payslip-${record.employeeId}-${record.periodKey}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function EmployeePayroll() {
  const { getEmployeePayroll } = usePayroll();
  const { user } = useAuth();

  const currentEmp = user;
  const empRecords = useMemo(() => getEmployeePayroll(user.id), [user.id, getEmployeePayroll]);

  const [activeTab, setActiveTab] = useState('overview');
  const [payslipRecord, setPayslipRecord] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);

  const sortedRecords = useMemo(
    () => [...empRecords].sort((a, b) => (b.periodKey || '').localeCompare(a.periodKey || '')),
    [empRecords]
  );

  const currentMonth = sortedRecords[0];

  const totalReceived = empRecords.filter(r => r.status === 'Paid').reduce((s, r) => s + r.netSalary, 0);
  const totalDeductions = empRecords.reduce((s, r) => s + r.totalDeductions, 0);

  return (
    <div className="payroll-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Salary</h1>
          <p className="page-subtitle">Welcome back, {currentEmp.firstName}. View your salary details and payslips.</p>
        </div>
      </div>

      <div className="payroll-dashboard-cards">
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <DollarSign size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{currentMonth ? formatCurrency(currentMonth.netSalary) : '--'}</span>
            <span className="payroll-stat-label">This Month's Pay</span>
          </div>
        </div>
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{formatCurrency(totalReceived)}</span>
            <span className="payroll-stat-label">Total Received</span>
          </div>
        </div>
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <Wallet size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{formatCurrency(totalDeductions)}</span>
            <span className="payroll-stat-label">Total Deductions</span>
          </div>
        </div>
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{empRecords.filter(r => r.status === 'Paid').length}/{empRecords.length}</span>
            <span className="payroll-stat-label">Payments Received</span>
          </div>
        </div>
      </div>

      <div className="leave-emp-tabs">
        <button className={`leave-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <TrendingUp size={16} /> Current Salary
        </button>
        <button className={`leave-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Clock size={16} /> Salary History
        </button>
      </div>

      {activeTab === 'overview' && currentMonth && (
        <div className="payroll-overview">
          <div className="payroll-overview-card">
            <div className="payroll-overview-header">
              <h3 className="payroll-overview-title">
                <Calendar size={18} /> {currentMonth.period}
              </h3>
              <span className="leave-status-badge" style={{ color: STATUS_CONFIG[currentMonth.status]?.color, background: STATUS_CONFIG[currentMonth.status]?.bg }}>
                {currentMonth.status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                {currentMonth.status}
              </span>
            </div>

            <div className="payroll-salary-breakdown">
              <div className="payroll-breakdown-section">
                <h4 className="payroll-breakdown-title">
                  <DollarSign size={16} /> Earnings
                </h4>
                <div className="payroll-breakdown-list">
                  <div className="payroll-breakdown-row">
                    <span>Basic Salary</span>
                    <span className="payroll-breakdown-value">{formatCurrency(currentMonth.baseSalary)}</span>
                  </div>
                  <div className="payroll-breakdown-row">
                    <span>HRA</span>
                    <span className="payroll-breakdown-value">{formatCurrency(currentMonth.hra)}</span>
                  </div>
                  <div className="payroll-breakdown-row">
                    <span>Transport Allowance</span>
                    <span className="payroll-breakdown-value">{formatCurrency(currentMonth.transport)}</span>
                  </div>
                  <div className="payroll-breakdown-row">
                    <span>Medical Allowance</span>
                    <span className="payroll-breakdown-value">{formatCurrency(currentMonth.medical)}</span>
                  </div>
                  <div className="payroll-breakdown-row">
                    <span>Special Allowance</span>
                    <span className="payroll-breakdown-value">{formatCurrency(currentMonth.specialAllowance)}</span>
                  </div>
                  {currentMonth.bonus > 0 && (
                    <div className="payroll-breakdown-row bonus">
                      <span>Bonus</span>
                      <span className="payroll-breakdown-value">+{formatCurrency(currentMonth.bonus)}</span>
                    </div>
                  )}
                  {currentMonth.overtimePay > 0 && (
                    <div className="payroll-breakdown-row bonus">
                      <span>Overtime Pay</span>
                      <span className="payroll-breakdown-value">+{formatCurrency(currentMonth.overtimePay)}</span>
                    </div>
                  )}
                  <div className="payroll-breakdown-row total">
                    <span>Gross Salary</span>
                    <span className="payroll-breakdown-value">{formatCurrency(currentMonth.grossSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="payroll-breakdown-section">
                <h4 className="payroll-breakdown-title deduction">
                  <Wallet size={16} /> Deductions
                </h4>
                <div className="payroll-breakdown-list">
                  <div className="payroll-breakdown-row">
                    <span>PF</span>
                    <span className="payroll-breakdown-value deduction">-{formatCurrency(currentMonth.pf)}</span>
                  </div>
                  <div className="payroll-breakdown-row">
                    <span>Professional Tax</span>
                    <span className="payroll-breakdown-value deduction">-{formatCurrency(currentMonth.professionalTax)}</span>
                  </div>
                  <div className="payroll-breakdown-row">
                    <span>Income Tax</span>
                    <span className="payroll-breakdown-value deduction">-{formatCurrency(currentMonth.incomeTax)}</span>
                  </div>
                  <div className="payroll-breakdown-row">
                    <span>Insurance</span>
                    <span className="payroll-breakdown-value deduction">-{formatCurrency(currentMonth.insurance)}</span>
                  </div>
                  {currentMonth.otherDeductions > 0 && (
                    <div className="payroll-breakdown-row">
                      <span>Other Deductions</span>
                      <span className="payroll-breakdown-value deduction">-{formatCurrency(currentMonth.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="payroll-breakdown-row total deduction">
                    <span>Total Deductions</span>
                    <span className="payroll-breakdown-value deduction">-{formatCurrency(currentMonth.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              <div className="payroll-net-salary">
                <span className="payroll-net-label">Net Salary</span>
                <span className="payroll-net-value">{formatCurrency(currentMonth.netSalary)}</span>
              </div>
            </div>

            <div className="payroll-overview-actions">
              <button className="btn btn-primary" onClick={() => setPayslipRecord(currentMonth)}>
                <Download size={16} /> Download Payslip
              </button>
              <button className="btn btn-outline" onClick={() => setDetailRecord(currentMonth)}>
                <Eye size={16} /> View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && !currentMonth && (
        <div className="leave-empty-state">No payroll records found for your account.</div>
      )}

      {activeTab === 'history' && (
        <div className="payroll-history">
          {sortedRecords.length === 0 ? (
            <div className="leave-empty-state">No salary history found.</div>
          ) : (
            <div className="payroll-history-list">
              {sortedRecords.map(record => {
                const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={record.id} className="payroll-history-item">
                    <div className="payroll-history-left">
                      <div className="payroll-history-period">
                        <span className="payroll-history-month">{record.period.split(' ')[0]}</span>
                        <span className="payroll-history-year">{record.period.split(' ')[1]}</span>
                      </div>
                      <div className="payroll-history-info">
                        <span className="payroll-history-net">{formatCurrency(record.netSalary)}</span>
                        <span className="payroll-history-details">
                          Gross: {formatCurrency(record.grossSalary)} &bull; Deductions: {formatCurrency(record.totalDeductions)}
                        </span>
                        {record.paymentDate && (
                          <span className="payroll-history-details">Paid on {formatDate(record.paymentDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="payroll-history-right">
                      <span className="leave-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                        <StatusIcon size={12} /> {record.status}
                      </span>
                      <div className="payroll-history-actions">
                        <button className="leave-action-btn" title="View Details" onClick={() => setDetailRecord(record)}>
                          <Eye size={16} />
                        </button>
                        <button className="leave-action-btn" title="Download Payslip" onClick={() => downloadPayslip(record)}>
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {payslipRecord && (
        <PayslipModal record={payslipRecord} onClose={() => setPayslipRecord(null)} />
      )}

      {detailRecord && (
        <PayrollDetailsModal record={detailRecord} onClose={() => setDetailRecord(null)} />
      )}
    </div>
  );
}
