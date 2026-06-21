import React, { useMemo } from 'react';

export default function BarChart({
  labels,
  datasets,
  data,
  labelKey,
  valueKey,
  color = '#3b82f6',
  height = 200,
}) {
  const hasNewAPI = Array.isArray(labels) && Array.isArray(datasets);
  const hasOldAPI = Array.isArray(data) && data.length > 0 && labelKey && valueKey;

  const normalized = useMemo(() => {
    if (hasNewAPI) {
      return {
        labels: labels.filter(Boolean),
        datasets: datasets
          .filter(ds => ds && Array.isArray(ds.data))
          .map(ds => ({
            data: ds.data.map(v => Number(v) || 0),
            color: ds.color || color,
            label: ds.label || '',
          })),
      };
    }

    if (hasOldAPI) {
      return {
        labels: data.map(d => d[labelKey]),
        datasets: [
          {
            data: data.map(d => Number(d[valueKey]) || 0),
            color,
            label: '',
          },
        ],
      };
    }

    return { labels: [], datasets: [] };
  }, [labels, datasets, data, labelKey, valueKey, color, hasNewAPI, hasOldAPI]);

  if (normalized.labels.length === 0 || normalized.datasets.length === 0) {
    return (
      <div
        className="admin-bar-chart"
        style={{
          height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#888',
        }}
      >
        No Data Available
      </div>
    );
  }

  const allValues = normalized.datasets.flatMap(ds => ds.data);
  const max = Math.max(...allValues, 1);
  const barCount = normalized.labels.length;
  const datasetCount = normalized.datasets.length;

  return (
    <div className="admin-bar-chart" style={{ height }}>
      <div className="admin-bar-chart-bars">
        {normalized.labels.map((label, i) => (
          <div key={i} className="admin-bar-col" style={{ flex: 1 }}>
            <div className="admin-bar-tooltip">
              {normalized.datasets.map((ds, di) => {
                const v = ds.data[i] || 0;
                return (
                  <div key={di} style={{ color: ds.color }}>
                    {v > 999 ? `${(v / 1000).toFixed(1)}k` : v}
                    {ds.label ? ` ${ds.label}` : ''}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: datasetCount > 1 ? '2px' : 0,
                height: '100%',
              }}
            >
              {normalized.datasets.map((ds, di) => {
                const value = ds.data[i] || 0;
                const pct = (value / max) * 100;

                return (
                  <div
                    key={di}
                    className="admin-bar-fill"
                    style={{
                      width: datasetCount > 1 ? `${100 / datasetCount - 2}%` : '60%',
                      maxWidth: '40px',
                      height: `${pct}%`,
                      background: `linear-gradient(180deg, ${ds.color} 0%, ${ds.color}88 100%)`,
                      animationDelay: `${i * 0.1 + di * 0.05}s`,
                    }}
                  />
                );
              })}
            </div>

            <span className="admin-bar-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
