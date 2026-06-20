import React from 'react';

export default function ChartCard({ title, subtitle, children, actions }) {
  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div>
          <h3 className="admin-chart-title">{title}</h3>
          {subtitle && <p className="admin-chart-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="admin-chart-actions">{actions}</div>}
      </div>
      <div className="admin-chart-body">
        {children}
      </div>
    </div>
  );
}
