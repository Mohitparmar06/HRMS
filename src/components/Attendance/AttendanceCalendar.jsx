import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
  present: 'var(--success)',
  absent: 'var(--danger)',
  late: 'var(--warning)',
  'half-day': 'var(--info)',
  'on-leave': '#a78bfa',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AttendanceCalendar({ records = [], selectedDate, onSelectDate, showLegend = true, compact = false }) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });

  const recordsByDate = useMemo(() => {
    const map = {};
    for (const r of records) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [records]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getStatusCounts = (dateStr) => {
    const recs = recordsByDate[dateStr] || [];
    const counts = {};
    for (const r of recs) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return counts;
  };

  return (
    <div className={`attendance-calendar ${compact ? 'compact' : ''}`}>
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <span className="cal-title">{MONTH_NAMES[month]} {year}</span>
        <button className="cal-nav" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      <div className="cal-grid">
        {DAY_LABELS.map(d => (
          <div key={d} className="cal-day-label">{d}</div>
        ))}

        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="cal-day empty" />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const counts = getStatusCounts(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;

          return (
            <button
              key={day}
              className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`}
              onClick={() => onSelectDate?.(dateStr)}
            >
              <span className="cal-day-num">{day}</span>
              {!compact && (
                <div className="cal-day-dots">
                  {counts.present > 0 && <span className="dot present" title={`${counts.present} present`} />}
                  {counts.absent > 0 && <span className="dot absent" title={`${counts.absent} absent`} />}
                  {counts.late > 0 && <span className="dot late" title={`${counts.late} late`} />}
                  {counts['on-leave'] > 0 && <span className="dot on-leave" title={`${counts['on-leave']} on leave`} />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showLegend && (
        <div className="cal-legend">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: color }} />
              <span>{status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
