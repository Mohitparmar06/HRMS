import { useState } from 'react';

export default function LineChart({ datasets, labels, height = 200 }) {
  const [tooltip, setTooltip] = useState(null);
  const allValues = datasets.flatMap(d => d.data);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const w = 500;
  const h = height;
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const getX = (i) => padding.left + (i / (labels.length - 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - min) / range) * chartH;

  return (
    <div className="admin-line-chart">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + chartH * (1 - pct);
          const val = Math.round(min + range * pct);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="var(--text-dim)" fontSize="9">
                {val > 999 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          );
        })}

        {labels.map((label, i) => (
          <text key={i} x={getX(i)} y={h - 8} textAnchor="middle" fill="var(--text-dim)" fontSize="9">
            {label}
          </text>
        ))}

        {datasets.map((ds, dsi) => {
          const points = ds.data.map((val, i) => `${getX(i)},${getY(val)}`).join(' ');
          const areaPoints = `${getX(0)},${padding.top + chartH} ${points} ${getX(ds.data.length - 1)},${padding.top + chartH}`;
          return (
            <g key={dsi}>
              <defs>
                <linearGradient id={`line-grad-${dsi}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ds.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={areaPoints} fill={`url(#line-grad-${dsi})`} />
              <polyline points={points} fill="none" stroke={ds.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {ds.data.map((val, i) => (
                <g key={i}>
                  <circle
                    cx={getX(i)}
                    cy={getY(val)}
                    r="8"
                    fill="transparent"
                    onMouseEnter={() => setTooltip({ x: getX(i), y: getY(val), value: val, label: labels[i] })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={getX(i)}
                    cy={getY(val)}
                    r="3.5"
                    fill={ds.color}
                    stroke="var(--bg-dark)"
                    strokeWidth="1.5"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              ))}
            </g>
          );
        })}

        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={padding.top + chartH} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
            <rect x={tooltip.x - 36} y={tooltip.y - 28} width="72" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.1)" />
            <text x={tooltip.x} y={tooltip.y - 13} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
              {tooltip.value}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
