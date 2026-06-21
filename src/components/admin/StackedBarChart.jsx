import { useState, useMemo } from 'react';

const CATEGORIES = [
  { key: 'present', label: 'Present', color: '#10b981' },
  { key: 'late', label: 'Late', color: '#f59e0b' },
  { key: 'halfDay', label: 'Half Day', color: '#3b82f6' },
  { key: 'absent', label: 'Absent', color: '#ef4444' },
];

export default function StackedBarChart({ data, height = 300 }) {
  const [hovered, setHovered] = useState(null);

  const { max, ticks } = useMemo(() => {
    const m = Math.max(...data.flatMap(d => CATEGORIES.map(c => d[c.key] || 0)));
    const ceiling = Math.ceil(m / 10) * 10 + 10;
    const t = [];
    for (let i = 0; i <= ceiling; i += Math.ceil(ceiling / 5)) t.push(i);
    if (t[t.length - 1] !== ceiling) t.push(ceiling);
    return { max: ceiling, ticks: t };
  }, [data]);

  const barArea = height - 32;
  const pxPerUnit = barArea / max;

  return (
    <div className="abc-wrap" style={{ height }}>
      <div className="abc-body">
        <div className="abc-y" style={{ height: barArea }}>
          {[...ticks].reverse().map(v => (
            <span
              key={v}
              className="abc-y-tick"
              style={{ bottom: v * pxPerUnit }}
            >
              {v}
            </span>
          ))}
        </div>

        <div className="abc-plot">
          <div className="abc-grid" style={{ height: barArea }}>
            {ticks.map(v => (
              <div
                key={v}
                className="abc-gridline"
                style={{ bottom: v * pxPerUnit }}
              />
            ))}
          </div>

          <div className="abc-cols" style={{ height: barArea }}>
            {data.map((d, di) => (
              <div key={di} className="abc-col">
                <div className="abc-col-bars">
                  {CATEGORIES.map((cat, ci) => {
                    const val = d[cat.key] || 0;
                    const h = val * pxPerUnit;
                    const on = hovered?.d === di && hovered?.c === ci;
                    return (
                      <div
                        key={cat.key}
                        className="abc-bar-wrap"
                        onMouseEnter={() => setHovered({ d: di, c: ci })}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <div
                          className="abc-bar"
                          style={{
                            height: h,
                            background: `linear-gradient(180deg, ${cat.color} 0%, ${cat.color}cc 100%)`,
                            boxShadow: on
                              ? `0 2px 16px ${cat.color}55, inset 0 1px 0 rgba(255,255,255,0.25)`
                              : 'inset 0 1px 0 rgba(255,255,255,0.1)',
                            filter: on ? 'brightness(1.2)' : 'none',
                          }}
                        />
                        {on && (
                          <div className="abc-tip" style={{ bottom: h + 8 }}>
                            <span className="abc-tip-cat" style={{ color: cat.color }}>{cat.label}</span>
                            <span className="abc-tip-val">{val}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="abc-x-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="abc-legend">
        {CATEGORIES.map(c => (
          <span key={c.key} className="abc-legend-item">
            <span className="abc-legend-dot" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
