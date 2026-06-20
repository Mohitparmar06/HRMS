import React from 'react';

export default function StackedBarChart({ data, height = 200 }) {
  const max = Math.max(...data.map(d => d.present + d.absent + d.late + d.halfDay));

  return (
    <div className="admin-stacked-bar-chart" style={{ height }}>
      <div className="admin-stacked-bars">
        {data.map((d, i) => {
          const total = d.present + d.absent + d.late + d.halfDay;
          const pctPresent = (d.present / max) * 100;
          const pctAbsent = (d.absent / max) * 100;
          const pctLate = (d.late / max) * 100;
          const pctHalf = (d.halfDay / max) * 100;

          return (
            <div key={i} className="admin-stacked-col">
              <div className="admin-stacked-tooltip">
                P:{d.present} A:{d.absent} L:{d.late} H:{d.halfDay}
              </div>
              <div className="admin-stacked-bar-wrapper">
                <div className="admin-stacked-segment" style={{ height: `${pctPresent}%`, background: '#10b981' }} />
                <div className="admin-stacked-segment" style={{ height: `${pctLate}%`, background: '#f59e0b' }} />
                <div className="admin-stacked-segment" style={{ height: `${pctHalf}%`, background: '#06b6d4' }} />
                <div className="admin-stacked-segment" style={{ height: `${pctAbsent}%`, background: '#ef4444' }} />
              </div>
              <span className="admin-stacked-label">{d.day}</span>
            </div>
          );
        })}
      </div>
      <div className="admin-stacked-legend">
        <span><span style={{ background: '#10b981' }} className="admin-legend-dot" /> Present</span>
        <span><span style={{ background: '#f59e0b' }} className="admin-legend-dot" /> Late</span>
        <span><span style={{ background: '#06b6d4' }} className="admin-legend-dot" /> Half Day</span>
        <span><span style={{ background: '#ef4444' }} className="admin-legend-dot" /> Absent</span>
      </div>
    </div>
  );
}
