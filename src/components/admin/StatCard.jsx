import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

export default function StatCard({ icon: Icon, label, value, change, changeLabel, sparkData, color = '#3b82f6', prefix = '', suffix = '' }) {
  const animatedValue = useAnimatedCounter(typeof value === 'number' ? value : 0);
  const isPositive = change >= 0;

  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card-header">
        <div className="admin-stat-icon" style={{ background: `${color}15`, color }}>
          <Icon size={20} />
        </div>
        <div className="admin-stat-change" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{isPositive ? '+' : ''}{change}%</span>
        </div>
      </div>
      <div className="admin-stat-value">
        {prefix}{typeof value === 'number' ? animatedValue.toLocaleString() : value}{suffix}
      </div>
      <div className="admin-stat-label">{label}</div>
      {changeLabel && <div className="admin-stat-sublabel">{changeLabel}</div>}
      {sparkData && (
        <div className="admin-stat-sparkline">
          <Sparkline data={sparkData} color={color} width={100} height={32} />
        </div>
      )}
    </div>
  );
}
