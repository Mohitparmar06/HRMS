import React from 'react';
import { Wallet, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function PayrollWidget({ payrollData }) {
  const latest = payrollData[payrollData.length - 1];

  return (
    <div className="admin-payroll-widget">
      <div className="admin-payroll-widget-header">
        <h4>Payroll Overview</h4>
        <span className="admin-payroll-month">{latest.month} 2026</span>
      </div>

      <div className="admin-payroll-total">
        <div className="admin-payroll-total-icon">
          <Wallet size={20} />
        </div>
        <div>
          <span className="admin-payroll-total-label">Total Payroll</span>
          <span className="admin-payroll-total-value">{formatCurrency(latest.netPayroll)}</span>
        </div>
      </div>

      <div className="admin-payroll-details">
        <div className="admin-payroll-detail">
          <span className="admin-payroll-detail-label">Base Pay</span>
          <span className="admin-payroll-detail-value">{formatCurrency(latest.basePayroll)}</span>
        </div>
        <div className="admin-payroll-detail">
          <span className="admin-payroll-detail-label">Bonuses</span>
          <span className="admin-payroll-detail-value" style={{ color: '#10b981' }}>+{formatCurrency(latest.bonuses)}</span>
        </div>
        <div className="admin-payroll-detail">
          <span className="admin-payroll-detail-label">Overtime</span>
          <span className="admin-payroll-detail-value" style={{ color: '#10b981' }}>+{formatCurrency(latest.overtime)}</span>
        </div>
        <div className="admin-payroll-detail">
          <span className="admin-payroll-detail-label">Deductions</span>
          <span className="admin-payroll-detail-value" style={{ color: '#ef4444' }}>-{formatCurrency(latest.deductions)}</span>
        </div>
      </div>

      <div className="admin-payroll-footer">
        <div className="admin-payroll-next">
          <Calendar size={14} />
          <span>Next salary date: July 1, 2026</span>
        </div>
        <div className="admin-payroll-pending">
          <AlertTriangle size={14} />
          <span>2 pending updates</span>
        </div>
      </div>
    </div>
  );
}
