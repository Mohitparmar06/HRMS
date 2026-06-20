import { X, Download, Printer, Building } from 'lucide-react';

function formatCurrency(val) {
  if (val == null) return '--';
  return '$' + val.toLocaleString('en-US');
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PayslipModal({ record, onClose }) {
  if (!record) return null;

  const handleDownload = () => {
    const content = `
DAYFLOW HRMS - PAYSLIP
======================
Period: ${record.period}
Employee: ${record.employeeName} (${record.employeeId})
Department: ${record.department}
Position: ${record.position}

EARNINGS:
  Basic Salary:       ${formatCurrency(record.baseSalary)}
  HRA:                ${formatCurrency(record.hra)}
  Transport:          ${formatCurrency(record.transport)}
  Medical:            ${formatCurrency(record.medical)}
  Special Allowance:  ${formatCurrency(record.specialAllowance)}
  Bonus:              ${formatCurrency(record.bonus)}
  Overtime:           ${formatCurrency(record.overtimePay)}
  Gross Salary:       ${formatCurrency(record.grossSalary)}

DEDUCTIONS:
  PF:                 ${formatCurrency(record.pf)}
  Professional Tax:   ${formatCurrency(record.professionalTax)}
  Income Tax:         ${formatCurrency(record.incomeTax)}
  Insurance:          ${formatCurrency(record.insurance)}
  Other Deductions:   ${formatCurrency(record.otherDeductions)}
  Total Deductions:   ${formatCurrency(record.totalDeductions)}

NET SALARY: ${formatCurrency(record.netSalary)}

Status: ${record.status}
${record.paymentDate ? `Payment Date: ${formatDate(record.paymentDate)}` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${record.employeeId}-${record.periodKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payslip-modal" onClick={e => e.stopPropagation()}>
        <div className="payslip-paper">
          <div className="payslip-header">
            <div className="payslip-company">
              <div className="payslip-logo">
                <Building size={28} color="white" />
              </div>
              <div>
                <h2 className="payslip-company-name">Dayflow Inc.</h2>
                <p className="payslip-company-address">123 Business Avenue, San Francisco, CA 94102</p>
              </div>
            </div>
            <div className="payslip-title-section">
              <h1 className="payslip-title">PAYSLIP</h1>
              <span className="payslip-period">{record.period}</span>
            </div>
          </div>

          <div className="payslip-employee-info">
            <div className="payslip-info-row">
              <div className="payslip-info-item">
                <span className="payslip-info-label">Employee Name</span>
                <span className="payslip-info-value">{record.employeeName}</span>
              </div>
              <div className="payslip-info-item">
                <span className="payslip-info-label">Employee ID</span>
                <span className="payslip-info-value">{record.employeeId}</span>
              </div>
              <div className="payslip-info-item">
                <span className="payslip-info-label">Department</span>
                <span className="payslip-info-value">{record.department}</span>
              </div>
            </div>
            <div className="payslip-info-row">
              <div className="payslip-info-item">
                <span className="payslip-info-label">Position</span>
                <span className="payslip-info-value">{record.position}</span>
              </div>
              <div className="payslip-info-item">
                <span className="payslip-info-label">Pay Period</span>
                <span className="payslip-info-value">{record.period}</span>
              </div>
              <div className="payslip-info-item">
                <span className="payslip-info-label">Payment Date</span>
                <span className="payslip-info-value">{record.paymentDate ? formatDate(record.paymentDate) : 'Pending'}</span>
              </div>
            </div>
          </div>

          <div className="payslip-tables">
            <div className="payslip-table-section">
              <h4 className="payslip-table-title earning">Earnings</h4>
              <table className="payslip-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Basic Salary</td><td>{formatCurrency(record.baseSalary)}</td></tr>
                  <tr><td>HRA</td><td>{formatCurrency(record.hra)}</td></tr>
                  <tr><td>Transport Allowance</td><td>{formatCurrency(record.transport)}</td></tr>
                  <tr><td>Medical Allowance</td><td>{formatCurrency(record.medical)}</td></tr>
                  <tr><td>Special Allowance</td><td>{formatCurrency(record.specialAllowance)}</td></tr>
                  {record.bonus > 0 && <tr><td>Bonus</td><td>{formatCurrency(record.bonus)}</td></tr>}
                  {record.overtimePay > 0 && <tr><td>Overtime Pay</td><td>{formatCurrency(record.overtimePay)}</td></tr>}
                  <tr className="payslip-total"><td>Gross Salary</td><td>{formatCurrency(record.grossSalary)}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="payslip-table-section">
              <h4 className="payslip-table-title deduction">Deductions</h4>
              <table className="payslip-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>PF</td><td>{formatCurrency(record.pf)}</td></tr>
                  <tr><td>Professional Tax</td><td>{formatCurrency(record.professionalTax)}</td></tr>
                  <tr><td>Income Tax</td><td>{formatCurrency(record.incomeTax)}</td></tr>
                  <tr><td>Insurance</td><td>{formatCurrency(record.insurance)}</td></tr>
                  {record.otherDeductions > 0 && <tr><td>Other Deductions</td><td>{formatCurrency(record.otherDeductions)}</td></tr>}
                  <tr className="payslip-total deduction"><td>Total Deductions</td><td>{formatCurrency(record.totalDeductions)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="payslip-net-section">
            <div className="payslip-net-row">
              <span className="payslip-net-label">NET SALARY</span>
              <span className="payslip-net-value">{formatCurrency(record.netSalary)}</span>
            </div>
          </div>

          <div className="payslip-footer">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>Dayflow Inc. &bull; {record.period}</p>
          </div>
        </div>

        <div className="payslip-actions">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
