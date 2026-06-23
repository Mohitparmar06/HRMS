import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, UserCheck, Calendar, Clock, CreditCard,
  Download, Check
} from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { useLeave } from '../contexts/LeaveContext';
import { usePayroll } from '../contexts/PayrollContext';
import { useAuth } from '../contexts/AuthContext';

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatCurrency(val) {
  if (val == null) return '--';
  return '$' + val.toLocaleString('en-US');
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentEmp = user;

  const { attendanceRecords, getEmployeeRecords, checkIn: doCheckIn, checkOut: doCheckOut, todayCheckIn, todayCheckOut, getStats } = useAttendance();
  const { getEmployeeLeaves, getLeaveBalance } = useLeave();
  const { getEmployeePayroll } = usePayroll();

  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const empRecords = useMemo(() => getEmployeeRecords(user.id), [user.id, getEmployeeRecords, attendanceRecords]);
  const empLeaves = useMemo(() => getEmployeeLeaves(user.id), [user.id, getEmployeeLeaves]);
  const empPayroll = useMemo(() => getEmployeePayroll(user.id), [user.id, getEmployeePayroll]);
  const leaveBalance = useMemo(() => getLeaveBalance(user.id), [user.id, getLeaveBalance]);
  const overallStats = useMemo(() => getStats(empRecords), [empRecords, getStats]);

  const todayRecord = useMemo(() => {
    const today = toLocalDateStr(new Date());
    return empRecords.find(r => r.date === today);
  }, [empRecords]);

  const isCheckedIn = !!(todayCheckIn || todayRecord?.checkIn);
  const checkInTime = todayCheckIn || todayRecord?.checkIn || null;
  const checkOutTime = todayCheckOut || todayRecord?.checkOut || null;

  const handleCheckIn = () => doCheckIn(user.id);
  const handleCheckOut = () => doCheckOut(user.id);

  const clockLogs = useMemo(() => {
    const logs = [];
    if (checkInTime) logs.push({ type: 'Check-In', time: checkInTime, date: 'Today' });
    if (checkOutTime) logs.push({ type: 'Check-Out', time: checkOutTime, date: 'Today' });
    return logs;
  }, [checkInTime, checkOutTime]);

  const weeklyHours = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const hoursByDay = {};
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = toLocalDateStr(d);
      const rec = empRecords.find(r => r.date === key);
      hoursByDay[dayLabels[i]] = rec?.hoursWorked || 0;
    }

    if (todayRecord && todayRecord.checkIn) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayName = dayNames[now.getDay()];
      if (hoursByDay[todayName] !== undefined) {
        if (todayRecord.checkOut) {
          hoursByDay[todayName] = todayRecord.hoursWorked || 0;
        } else {
          const [h, m] = todayRecord.checkIn.split(':').map(Number);
          const nowH = now.getHours() + now.getMinutes() / 60;
          const elapsed = Math.round((nowH - (h + m / 60)) * 100) / 100;
          hoursByDay[todayName] = Math.max(elapsed, 0);
        }
      }
    }

    return hoursByDay;
  }, [empRecords, todayRecord]);

  const totalWeeklyHours = useMemo(() => {
    return Math.round(Object.values(weeklyHours).reduce((s, v) => s + v, 0) * 10) / 10;
  }, [weeklyHours]);

  const hasWeeklyData = useMemo(() => Object.values(weeklyHours).some(v => v > 0), [weeklyHours]);
  const maxWeeklyHours = useMemo(() => Math.max(...Object.values(weeklyHours), 1), [weeklyHours]);

  const pendingLeaves = empLeaves.filter(r => r.status === 'Pending').length;
  const approvedLeaves = empLeaves.filter(r => r.status === 'Approved').length;
  const totalUsedDays = Object.values(leaveBalance).reduce((sum, b) => sum + b.used, 0);
  const totalRemainingDays = Object.values(leaveBalance).reduce((sum, b) => sum + b.remaining, 0);
  const totalAllocatedDays = Object.values(leaveBalance).reduce((sum, b) => sum + b.total, 0);

  const recentLeaves = [...empLeaves].sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || '')).slice(0, 3);

  const latestPayroll = useMemo(() => {
    const sorted = [...empPayroll].sort((a, b) => (b.periodKey || '').localeCompare(a.periodKey || ''));
    return sorted[0] || null;
  }, [empPayroll]);

  const presentDays = overallStats.present || 0;
  const totalWorkingDays = Math.max(presentDays + (overallStats.absent || 0) + (overallStats.late || 0), 22);

  const downloadPayslip = () => {
    if (!latestPayroll) return;
    const r = latestPayroll;
    const content = [
      'DAYFLOW HRMS - PAYSLIP',
      '='.repeat(40),
      `Period: ${r.period}`,
      `Employee: ${r.employeeName} (${r.employeeId})`,
      `Department: ${r.department}`,
      '',
      'EARNINGS:',
      `  Basic:       ${formatCurrency(r.baseSalary)}`,
      `  HRA:         ${formatCurrency(r.hra)}`,
      `  Transport:   ${formatCurrency(r.transport)}`,
      `  Medical:     ${formatCurrency(r.medical)}`,
      `  Allowance:   ${formatCurrency(r.specialAllowance)}`,
      `  Bonus:       ${formatCurrency(r.bonus)}`,
      `  Overtime:    ${formatCurrency(r.overtimePay)}`,
      `  Gross:       ${formatCurrency(r.grossSalary)}`,
      '',
      'DEDUCTIONS:',
      `  PF:          ${formatCurrency(r.pf)}`,
      `  Prof Tax:    ${formatCurrency(r.professionalTax)}`,
      `  Income Tax:  ${formatCurrency(r.incomeTax)}`,
      `  Insurance:   ${formatCurrency(r.insurance)}`,
      `  Total:       ${formatCurrency(r.totalDeductions)}`,
      '',
      `NET SALARY: ${formatCurrency(r.netSalary)}`,
      `Status: ${r.status}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${r.employeeId}-${r.periodKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'white', fontFamily: 'var(--font-display)' }}>{user.firstName}'s Workspace</h2>
          <p style={{ margin: 0 }}>Review check-in history, leave summaries, and upcoming rosters.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }} onClick={downloadPayslip}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="stats-grid animate-fade-in-up">
        <div className="stat-card" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Present Days</span>
            <span className="stat-value">{presentDays}/{totalWorkingDays}</span>
            <span className="stat-growth"><TrendingUp size={12} /> {overallStats.presentRate || 0}% Rate</span>
          </div>
          <div className="stat-icon-wrap"><UserCheck size={20} /></div>
        </div>
        <div className="stat-card" onClick={() => navigate('/leave')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Leave Balance</span>
            <span className="stat-value">{totalRemainingDays} Days</span>
            <span className="stat-growth" style={{ color: 'var(--text-dim)' }}>{approvedLeaves} Approved &bull; {pendingLeaves} Pending</span>
          </div>
          <div className="stat-icon-wrap"><Calendar size={20} style={{ color: 'var(--primary-purple)' }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Working Hours</span>
            <span className="stat-value">{Math.round(empRecords.reduce((s, r) => s + (r.hoursWorked || 0), 0) * 10) / 10} hrs</span>
            <span className="stat-growth"><TrendingUp size={12} /> This Month</span>
          </div>
          <div className="stat-icon-wrap"><Clock size={20} style={{ color: '#06b6d4' }} /></div>
        </div>
        <div className="stat-card" onClick={() => navigate('/payroll')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Monthly Salary</span>
            <span className="stat-value">{latestPayroll ? formatCurrency(latestPayroll.netSalary) : '--'}</span>
            <span className="stat-growth" style={{ color: '#10b981' }}>{latestPayroll?.status === 'Paid' ? 'Paid' : 'Pending'}</span>
          </div>
          <div className="stat-icon-wrap"><CreditCard size={20} style={{ color: '#10b981' }} /></div>
        </div>
      </div>

      <div className="dashboard-sections-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card attendance-action-card">
            <div>
              <span className="badge-title" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-dim)' }}>Today's Activity</span>
              <div className="time-display" style={{ marginTop: '12px' }}>{time}</div>
              <div className="date-display">{date}</div>
            </div>
            <div className="attendance-buttons-wrap">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCheckIn} disabled={isCheckedIn}>
                {checkInTime ? <><Check size={14} /> Checked In</> : 'Check In'}
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCheckOut} disabled={!isCheckedIn || !!checkOutTime}>
                Check Out
              </button>
            </div>
            <div style={{ width: '100%' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'white', marginBottom: '8px', textAlign: 'left', fontWeight: 600 }}>Log History</h4>
              <div className="attendance-log-list">
                {clockLogs.length === 0 && <div className="attendance-log-item"><span style={{ color: 'var(--text-dim)' }}>No activity today</span></div>}
                {clockLogs.map((log, i) => (
                  <div key={i} className="attendance-log-item">
                    <span>{log.type}</span>
                    <span>{log.date} at <strong className="attendance-log-time">{log.time}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Attendance Calendar</h3>
            <div className="calendar-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
                <div key={h} className="calendar-day-header">{h}</div>
              ))}
              {(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const startOffset = (firstDay + 6) % 7;
                const cells = [];
                for (let i = 0; i < startOffset; i++) cells.push(<div key={`empty-${i}`} className="calendar-day-cell" />);
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const rec = empRecords.find(r => r.date === dateStr);
                  let cls = '';
                  if (rec) {
                    if (rec.status === 'present') cls = 'present';
                    else if (rec.status === 'late') cls = 'late';
                    else if (rec.status === 'absent') cls = 'absent';
                    else if (rec.status === 'half-day') cls = 'half-day';
                    else if (rec.status === 'on-leave') cls = 'leave';
                  }
                  if (day === now.getDate()) cls += ' today';
                  cells.push(
                    <div key={day} className={`calendar-day-cell ${cls}`}>
                      <span>{day}</span>
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>Weekly Working Hours</h3>
              {hasWeeklyData && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                  Total: {totalWeeklyHours}h
                </span>
              )}
            </div>
            {hasWeeklyData ? (
              <div className="chart-wrapper">
                <div className="chart-bar-container">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                    const hrs = weeklyHours[day] || 0;
                    const pct = maxWeeklyHours > 0 ? (hrs / maxWeeklyHours) * 100 : 0;
                    return (
                      <div key={day} className="chart-bar-col">
                        <div className="chart-bar-fill" style={{ height: `${Math.max(pct, 2)}%` }} data-value={`${hrs.toFixed(1)} hrs`}></div>
                        <span className="chart-bar-label">{day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-legend">
                  <span><span className="legend-dot" style={{ backgroundColor: 'var(--primary-blue)' }}></span>Hours Worked</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', gap: '8px' }}>
                <Clock size={32} style={{ color: 'var(--text-dim)', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>No Working Hours Available</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', margin: 0, opacity: 0.7 }}>Check in to start tracking your weekly hours</p>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '4px' }}>Leave Distribution</h3>
            {totalUsedDays > 0 ? (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Used {totalUsedDays} / {totalAllocatedDays} annual allocation</p>
                <div className="leave-stat-bar">
                  {Object.entries(leaveBalance).map(([type, b]) => {
                    if (b.used === 0) return null;
                    const pct = totalAllocatedDays > 0 ? (b.used / totalAllocatedDays) * 100 : 0;
                    const colors = { 'Casual Leave': 'var(--primary-blue)', 'Sick Leave': 'var(--primary-purple)', 'Earned Leave': '#ec4899', 'Maternity Leave': '#10b981', 'Paternity Leave': '#f59e0b', 'Work From Home': '#06b6d4' };
                    return <div key={type} className="leave-stat-segment" style={{ width: `${pct}%`, backgroundColor: colors[type] || '#666' }} />;
                  })}
                </div>
                <div className="leave-stat-details">
                  {Object.entries(leaveBalance).map(([type, b]) => {
                    if (b.used === 0) return null;
                    const colors = { 'Casual Leave': 'var(--primary-blue)', 'Sick Leave': 'var(--primary-purple)', 'Earned Leave': '#ec4899', 'Maternity Leave': '#10b981', 'Paternity Leave': '#f59e0b', 'Work From Home': '#06b6d4' };
                    return (
                      <div key={type} className="leave-stat-item">
                        <span className="legend-dot" style={{ backgroundColor: colors[type] || '#666' }}></span>
                        <span>{type.replace(' Leave', '')} ({b.used})</span>
                      </div>
                    );
                  })}
                  <div className="leave-stat-item">
                    <span className="legend-dot" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></span>
                    <span>Remaining ({totalRemainingDays})</span>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No Data Available</p>
            )}
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Leave History</h3>
            <div className="recent-list">
              {recentLeaves.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No leave history</p>}
              {recentLeaves.map(req => (
                <div key={req.id} className="recent-item">
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '2px' }}>{req.leaveType}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{formatDate(req.startDate)} - {formatDate(req.endDate)}</span>
                  </div>
                  <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Payroll Summary</h3>
            {latestPayroll ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="payslip-item"><span>Base Earnings</span><span>{formatCurrency(latestPayroll.baseSalary)}</span></div>
                <div className="payslip-item"><span>Allowances</span><span>{formatCurrency(latestPayroll.allowances)}</span></div>
                {latestPayroll.bonus > 0 && <div className="payslip-item"><span>Bonus</span><span style={{ color: '#10b981' }}>+{formatCurrency(latestPayroll.bonus)}</span></div>}
                <div className="payslip-item"><span>Tax Deductions</span><span style={{ color: '#ef4444' }}>-{formatCurrency(latestPayroll.totalDeductions)}</span></div>
                <div className="payslip-item"><span>Net Take-home Salary</span><span style={{ color: '#10b981' }}>{formatCurrency(latestPayroll.netSalary)}</span></div>
                <button className="btn btn-secondary" style={{ width: '100%', padding: '12px', marginTop: '20px', fontSize: '0.85rem', display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={downloadPayslip}>
                  <Download size={14} /> Download Payslip
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No Data Available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
