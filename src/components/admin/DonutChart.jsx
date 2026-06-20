import React from 'react';

export default function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 60;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="admin-donut-chart">
      <svg width={size} height={size} viewBox="0 0 160 160">
        {data.map((d, i) => {
          const pct = d.value / total;
          const dashLen = pct * circumference;
          const dashOff = -cumulative * circumference;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx="80" cy="80" r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOff}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="var(--font-display)">
          {total}
        </text>
        <text x="80" y="94" textAnchor="middle" fill="var(--text-dim)" fontSize="10">
          Total
        </text>
      </svg>
      <div className="admin-donut-legend">
        {data.map((d, i) => (
          <div key={i} className="admin-donut-legend-item">
            <span className="admin-donut-legend-dot" style={{ background: d.color }} />
            <span className="admin-donut-legend-label">{d.label}</span>
            <span className="admin-donut-legend-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
