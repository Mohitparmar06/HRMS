import { useState, useMemo } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, MinusCircle, CalendarOff,
  TrendingUp, Calendar, Clock, Award, Flame
} from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';
import { employees } from '../../services/dummyData';
import AttendanceCalendar from '../../components/Attendance/AttendanceCalendar';
import CheckInOutCard from '../../components/Attendance/CheckInOutCard';
import AttendanceDetailModal from '../../components/Attendance/AttendanceDetailModal';

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STATUS_ICONS = {
  present: CheckCircle,
  absent: XCircle,
  late: AlertTriangle,
  'half-day': MinusCircle,
  'on-leave': CalendarOff,
};

const STATUS_COLORS = {
  present: 'var(--success)',
  absent: 'var(--danger)',
  late: 'var(--warning)',
  'half-day': 'var(--info)',
  'on-leave': '#a78bfa',
};

export default function EmployeeAttendance() {
  const { attendanceRecords, getStats, getEmployeeRecords, checkIn: doCheckIn, checkOut: doCheckOut, todayCheckIn, todayCheckOut } = useAttendance();

  const currentEmp = employees.find(e => e.email === 'employee@dayflow.com') || employees[0];
  const empRecords = useMemo(() => getEmployeeRecords(currentEmp.id), [currentEmp.id, getEmployeeRecords, attendanceRecords]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const overallStats = useMemo(() => getStats(empRecords), [empRecords]);
  const recentRecords = useMemo(() => {
    return [...empRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  }, [empRecords]);

  const streak = useMemo(() => {
    const sorted = [...empRecords].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    for (const r of sorted) {
      if (r.status === 'present' || r.status === 'late') count++;
      else break;
    }
    return count;
  }, [empRecords]);

  const weeklyHours = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = toLocalDateStr(weekAgo);
    return empRecords
      .filter(r => r.date >= weekStr)
      .reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  }, [empRecords]);

  const todayRecord = useMemo(() => {
    const today = toLocalDateStr(new Date());
    return empRecords.find(r => r.date === today);
  }, [empRecords]);

  const isCheckedIn = todayCheckIn || todayRecord?.checkIn;
  const checkInTime = todayCheckIn || todayRecord?.checkIn;
  const checkOutTime = todayCheckOut || todayRecord?.checkOut;

  const handleCheckIn = () => doCheckIn(currentEmp.id);
  const handleCheckOut = () => doCheckOut(currentEmp.id);

  return (
    <div className="employee-attendance">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Welcome back, {currentEmp.firstName}. Here's your attendance overview.</p>
        </div>
      </div>

      <div className="emp-att-top">
        <CheckInOutCard
          employeeId={currentEmp.id}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          isCheckedIn={!!isCheckedIn}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
        />

        <div className="emp-att-streaks">
          <div className="emp-att-streak-card">
            <Flame size={24} className="streak-icon" />
            <div>
              <span className="streak-value">{streak}</span>
              <span className="streak-label">Day Streak</span>
            </div>
          </div>
          <div className="emp-att-streak-card">
            <Clock size={24} className="streak-icon hours" />
            <div>
              <span className="streak-value">{Math.round(weeklyHours)}h</span>
              <span className="streak-label">This Week</span>
            </div>
          </div>
          <div className="emp-att-streak-card">
            <Award size={24} className="streak-icon award" />
            <div>
              <span className="streak-value">{overallStats.presentRate}%</span>
              <span className="streak-label">Attendance Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="emp-att-tabs">
        <button className={`att-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <TrendingUp size={16} /> Overview
        </button>
        <button className={`att-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Clock size={16} /> History
        </button>
        <button className={`att-tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <Calendar size={16} /> Calendar
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="emp-att-overview">
          <div className="emp-att-stats-row">
            <div className="emp-att-mini-stat">
              <CheckCircle size={20} color="var(--success)" />
              <div>
                <span className="emp-stat-val">{overallStats.present}</span>
                <span className="emp-stat-lbl">Present</span>
              </div>
            </div>
            <div className="emp-att-mini-stat">
              <XCircle size={20} color="var(--danger)" />
              <div>
                <span className="emp-stat-val">{overallStats.absent}</span>
                <span className="emp-stat-lbl">Absent</span>
              </div>
            </div>
            <div className="emp-att-mini-stat">
              <AlertTriangle size={20} color="var(--warning)" />
              <div>
                <span className="emp-stat-val">{overallStats.late}</span>
                <span className="emp-stat-lbl">Late</span>
              </div>
            </div>
            <div className="emp-att-mini-stat">
              <CalendarOff size={20} color="#a78bfa" />
              <div>
                <span className="emp-stat-val">{overallStats.onLeave}</span>
                <span className="emp-stat-lbl">On Leave</span>
              </div>
            </div>
          </div>

          <div className="emp-att-chart-card">
            <h3>Weekly Breakdown</h3>
            <div className="emp-att-weekly-bars">
              {recentRecords.slice(0, 5).reverse().map((r, i) => {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const d = new Date(r.date + 'T00:00:00');
                return (
                  <div key={r.id} className="emp-weekly-bar-group">
                    <div className="emp-weekly-bar-wrap">
                      <div
                        className={`emp-weekly-bar ${r.status}`}
                        style={{ height: `${Math.min((r.hoursWorked / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="emp-weekly-day">{dayNames[d.getDay()]}</span>
                    <span className="emp-weekly-hours">{r.hoursWorked}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="emp-att-history">
          <div className="emp-history-list">
            {recentRecords.map(record => {
              const StatusIcon = STATUS_ICONS[record.status];
              return (
                <div key={record.id} className="emp-history-item" onClick={() => setDetailRecord(record)}>
                  <div className="emp-history-left">
                    <div className="emp-history-date">
                      <span className="emp-history-day">{new Date(record.date + 'T00:00:00').getDate()}</span>
                      <span className="emp-history-month">{new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className="emp-history-info">
                      <span className="emp-history-status" style={{ color: STATUS_COLORS[record.status] }}>
                        <StatusIcon size={14} />
                        {record.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <span className="emp-history-times">
                        {record.checkIn || 'N/A'} → {record.checkOut || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <span className="emp-history-hours">{record.hoursWorked > 0 ? `${record.hoursWorked}h` : '--'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="emp-att-calendar-view">
          <AttendanceCalendar
            records={empRecords}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          {selectedDate && (
            <div className="emp-cal-day-detail">
              <h4>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
              {empRecords.filter(r => r.date === selectedDate).map(record => {
                const StatusIcon = STATUS_ICONS[record.status];
                return (
                  <div key={record.id} className="emp-cal-record">
                    <StatusIcon size={20} color={STATUS_COLORS[record.status]} />
                    <div>
                      <span style={{ color: STATUS_COLORS[record.status] }}>{record.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <span className="emp-cal-times">{record.checkIn || 'N/A'} → {record.checkOut || 'N/A'} • {record.hoursWorked}h</span>
                    </div>
                  </div>
                );
              })}
              {empRecords.filter(r => r.date === selectedDate).length === 0 && (
                <p className="att-no-records">No records for this date</p>
              )}
            </div>
          )}
        </div>
      )}

      {detailRecord && (
        <AttendanceDetailModal
          record={detailRecord}
          employee={currentEmp}
          onClose={() => setDetailRecord(null)}
        />
      )}
    </div>
  );
}
