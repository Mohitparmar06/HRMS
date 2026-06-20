import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function BarChart({ data, labelKey, valueKey, color = '#3b82f6', height = 200 }) {
  const max = Math.max(...data.map(d => d[valueKey]));

  return (
    <div className="admin-bar-chart" style={{ height }}>
      <div className="admin-bar-chart-bars">
        {data.map((d, i) => {
          const pct = (d[valueKey] / max) * 100;
          return (
            <div key={i} className="admin-bar-col">
              <div className="admin-bar-tooltip">{typeof d[valueKey] === 'number' && d[valueKey] > 999 ? `${(d[valueKey] / 1000).toFixed(1)}k` : d[valueKey]}</div>
              <div
                className="admin-bar-fill"
                style={{
                  height: `${pct}%`,
                  background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
              <span className="admin-bar-label">{d[labelKey]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
