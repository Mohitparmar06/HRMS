import React from 'react';
import { UserPlus, CalendarCheck, FileText, BarChart3, Building2 } from 'lucide-react';

const actions = [
  { icon: UserPlus, label: 'Add Employee', desc: 'Onboard a new team member', color: '#3b82f6' },
  { icon: CalendarCheck, label: 'Approve Leave', desc: 'Review pending requests', color: '#10b981' },
  { icon: FileText, label: 'Generate Payslip', desc: 'Create monthly payslips', color: '#a855f7' },
  { icon: BarChart3, label: 'View Reports', desc: 'Analytics & insights', color: '#f59e0b' },
  { icon: Building2, label: 'Add Department', desc: 'Create new department', color: '#06b6d4' },
];

export default function QuickActions() {
  return (
    <div className="admin-quick-actions">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <button key={i} className="admin-quick-action-card">
            <div className="admin-quick-action-icon" style={{ background: `${action.color}15`, color: action.color }}>
              <Icon size={22} />
            </div>
            <span className="admin-quick-action-label">{action.label}</span>
            <span className="admin-quick-action-desc">{action.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
