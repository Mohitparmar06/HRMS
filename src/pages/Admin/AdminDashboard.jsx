import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, UserX, CalendarDays, UserPlus, Wallet,
  Download, X
} from 'lucide-react';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useLeave } from '../../contexts/LeaveContext';
import { usePayroll } from '../../contexts/PayrollContext';
import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import DonutChart from '../../components/admin/DonutChart';
import LineChart from '../../components/admin/LineChart';
import StackedBarChart from '../../components/admin/StackedBarChart';

const LEAVE_TYPE_COLORS = {
  'Casual Leave': '#3b82f6',
  'Sick Leave': '#a855f7',
  'Earned Leave': '#f59e0b',
  'Maternity Leave': '#ec4899',
  'Paternity Leave': '#06b6d4',
  'Work From Home': '#10b981',
};

function Toast({ message, onClose }) {
  return (
    <div className="settings-toast">
      <span>{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function LeaveStatsLegend({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  return (
    <div className="dashboard-leave-legend">
      {data.map((item, i) => (
        <div key={i} className="dashboard-legend-item">
          <div className="dashboard-legend-dot" style={{ background: item.color }} />
          <span className="dashboard-legend-label">{item.label}</span>
          <span className="dashboard-legend-value">{item.value}</span>
          <span className="dashboard-legend-pct">{Math.round(item.value / total * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toLocalDateStr(d));
  }
  return days;
}

function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short' }),
    });
  }
  return months;
}

function computeChangePercent(current, history) {
  if (!history || history.length < 2) return 0;
  const previous = history[history.length - 2];
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const { employees, departments } = useEmployees();
  const { attendanceRecords, getStats, getWeeklyTrend } = useAttendance();
  const { leaveRecords, getLeaveByType } = useLeave();
  const { records: payrollRecords, getPayrollStats } = usePayroll();

  const today = toLocalDateStr(new Date());
  const todayRecords = useMemo(() => attendanceRecords.filter(r => r.date === today), [attendanceRecords, today]);
  const todayStats = useMemo(() => getStats(todayRecords.length > 0 ? todayRecords : []), [todayRecords, getStats]);
  const weeklyTrend = useMemo(() => getWeeklyTrend(attendanceRecords), [attendanceRecords, getWeeklyTrend]);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const inactiveEmployees = employees.filter(e => e.status === 'Inactive' || e.status === 'Offboarded').length;
  const presentToday = todayStats.present || 0;
  const absentToday = todayStats.absent || 0;
  const onLeave = todayStats.onLeave || 0;
  const lateToday = todayStats.late || 0;
  const halfDayToday = todayStats.halfDay || 0;
  const attendanceRate = totalEmployees > 0 ? Math.round(((presentToday + lateToday + halfDayToday) / totalEmployees) * 100) : 0;

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const newThisMonth = employees.filter(e => e.joinDate && e.joinDate.startsWith(currentMonthKey)).length;
  const newLastMonth = employees.filter(e => e.joinDate && e.joinDate.startsWith(prevMonthKey)).length;

  const payrollStats = useMemo(() => getPayrollStats(), [getPayrollStats]);
  const monthlyPayroll = payrollStats.totalNet || 0;
  const totalPaid = payrollStats.totalPayroll || 0;
  const totalDeductions = payrollStats.totalDeductions || 0;
  const paidCount = payrollStats.paidCount || 0;
  const pendingCount = payrollStats.pendingCount || 0;

  const leaveStats = useMemo(() => {
    if (!leaveRecords || leaveRecords.length === 0) {
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
    const pending = leaveRecords.filter(r => r.status === 'Pending').length;
    const approved = leaveRecords.filter(r => r.status === 'Approved').length;
    const rejected = leaveRecords.filter(r => r.status === 'Rejected').length;
    return { pending, approved, rejected, total: leaveRecords.length };
  }, [leaveRecords]);

  const deptDistribution = departments.map(d => ({
    label: d.name,
    value: employees.filter(e => e.department === d.name).length,
    color: d.color,
  })).filter(d => d.value > 0);

  const leaveByType = useMemo(() => getLeaveByType(), [getLeaveByType]);
  const leaveStatsChart = useMemo(() => {
    return Object.entries(leaveByType)
      .map(([type, stats]) => ({
        label: type.replace(' Leave', ''),
        value: stats.total,
        color: LEAVE_TYPE_COLORS[type] || '#6b7280',
      }))
      .filter(d => d.value > 0);
  }, [leaveByType]);

  const employeeGrowth = useMemo(() => {
    const months = getLastNMonths(6);
    let cumulative = employees.filter(e => {
      if (!e.joinDate) return false;
      const joinMonthKey = e.joinDate.substring(0, 7);
      return joinMonthKey < months[0].key;
    }).length;

    return months.map(m => {
      const joined = employees.filter(e => e.joinDate && e.joinDate.startsWith(m.key)).length;
      cumulative += joined;
      return { month: m.label, count: cumulative };
    });
  }, [employees]);

  const empGrowthHistory = useMemo(() => employeeGrowth.map(d => d.count), [employeeGrowth]);
  const employeeChange = useMemo(() => computeChangePercent(totalEmployees, empGrowthHistory), [totalEmployees, empGrowthHistory]);

  const presentHistory = useMemo(() => {
    const days = getLastNDays(8);
    return days.map(d => {
      const dayRecords = attendanceRecords.filter(r => r.date === d);
      const stats = getStats(dayRecords.length > 0 ? dayRecords : []);
      return stats.present || 0;
    });
  }, [attendanceRecords, getStats]);
  const presentChange = useMemo(() => computeChangePercent(presentToday, presentHistory), [presentToday, presentHistory]);

  const absentHistory = useMemo(() => {
    const days = getLastNDays(8);
    return days.map(d => {
      const dayRecords = attendanceRecords.filter(r => r.date === d);
      const stats = getStats(dayRecords.length > 0 ? dayRecords : []);
      return stats.absent || 0;
    });
  }, [attendanceRecords, getStats]);
  const absentChange = useMemo(() => computeChangePercent(absentToday, absentHistory), [absentToday, absentHistory]);

  const onLeaveHistory = useMemo(() => {
    const days = getLastNDays(8);
    return days.map(d => {
      const dayRecords = attendanceRecords.filter(r => r.date === d);
      const stats = getStats(dayRecords.length > 0 ? dayRecords : []);
      return stats.onLeave || 0;
    });
  }, [attendanceRecords, getStats]);
  const onLeaveChange = useMemo(() => computeChangePercent(onLeave, onLeaveHistory), [onLeave, onLeaveHistory]);

  const newMonthHistory = useMemo(() => {
    const months = getLastNMonths(8);
    return months.map(m => employees.filter(e => e.joinDate && e.joinDate.startsWith(m.key)).length);
  }, [employees]);
  const newMonthChange = useMemo(() => computeChangePercent(newThisMonth, newMonthHistory), [newThisMonth, newMonthHistory]);

  const payrollHistory = useMemo(() => {
    const months = getLastNMonths(8);
    return months.map(m => {
      const monthRecords = payrollRecords.filter(r => {
        if (!r.period) return false;
        const periodDate = new Date(r.period);
        return `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}` === m.key;
      });
      return monthRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
    });
  }, [payrollRecords]);
  const payrollChange = useMemo(() => computeChangePercent(monthlyPayroll, payrollHistory), [monthlyPayroll, payrollHistory]);

  const sparkData1 = useMemo(() => {
    const months = getLastNMonths(8);
    let running = employees.filter(e => {
      if (!e.joinDate) return false;
      return e.joinDate.substring(0, 7) < months[0].key;
    }).length;
    return months.map(m => {
      const count = employees.filter(e => e.joinDate && e.joinDate.startsWith(m.key)).length;
      running += count;
      return running;
    });
  }, [employees]);

  const sparkData2 = useMemo(() => {
    const days = getLastNDays(8);
    return days.map(d => {
      const dayRecords = attendanceRecords.filter(r => r.date === d);
      const stats = getStats(dayRecords.length > 0 ? dayRecords : []);
      return stats.present || 0;
    });
  }, [attendanceRecords, getStats]);

  const sparkData3 = useMemo(() => {
    const days = getLastNDays(8);
    return days.map(d => {
      const dayRecords = attendanceRecords.filter(r => r.date === d);
      const stats = getStats(dayRecords.length > 0 ? dayRecords : []);
      return stats.absent || 0;
    });
  }, [attendanceRecords, getStats]);

  const sparkData4 = useMemo(() => {
    return departments.map(d => employees.filter(e => e.department === d.name).length);
  }, [employees, departments]);

  const sparkData5 = useMemo(() => {
    const days = getLastNDays(8);
    return days.map(d => {
      const dayRecords = attendanceRecords.filter(r => r.date === d);
      const withHours = dayRecords.filter(r => r.checkIn && r.checkOut);
      if (withHours.length === 0) return 0;
      const totalHours = withHours.reduce((sum, r) => {
        const h = (new Date(r.checkOut) - new Date(r.checkIn)) / 3600000;
        return sum + h;
      }, 0);
      return Math.round((totalHours / withHours.length) * 10) / 10;
    });
  }, [attendanceRecords]);

  const sparkData6 = useMemo(() => {
    return payrollHistory.length > 0 ? payrollHistory : [0, 0, 0, 0, 0, 0, 0, 0];
  }, [payrollHistory]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportCSV = () => {
    const data = [
      { Metric: 'Total Employees', Value: totalEmployees },
      { Metric: 'Active Employees', Value: activeEmployees },
      { Metric: 'Inactive Employees', Value: inactiveEmployees },
      { Metric: 'Present Today', Value: presentToday },
      { Metric: 'Absent Today', Value: absentToday },
      { Metric: 'On Leave', Value: onLeave },
      { Metric: 'Late Today', Value: lateToday },
      { Metric: 'Half Day', Value: halfDayToday },
      { Metric: 'Attendance Rate', Value: `${attendanceRate}%` },
      { Metric: 'New This Month', Value: newThisMonth },
      { Metric: 'Monthly Payroll', Value: monthlyPayroll },
      { Metric: 'Paid Payroll', Value: paidCount },
      { Metric: 'Pending Payroll', Value: pendingCount },
      { Metric: 'Total Salary Paid', Value: totalPaid },
      { Metric: 'Total Deductions', Value: totalDeductions },
      { Metric: 'Pending Leaves', Value: leaveStats.pending },
      { Metric: 'Approved Leaves', Value: leaveStats.approved },
      { Metric: 'Rejected Leaves', Value: leaveStats.rejected },
    ];
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(r => headers.map(h => r[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Dashboard report exported!');
  };

  return (
    <div className="admin-dashboard">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Admin Dashboard</h1>
          <p className="admin-dashboard-subtitle">Welcome back, Admin. Here's your organization overview.</p>
        </div>
        <div className="admin-dashboard-header-actions">
          <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }} onClick={handleExportCSV}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div onClick={() => navigate('/admin/employees')} style={{ cursor: 'pointer' }}>
          <StatCard icon={Users} label="Total Employees" value={totalEmployees} change={employeeChange} changeLabel={`${activeEmployees} active, ${inactiveEmployees} inactive`} sparkData={sparkData1} color="#3b82f6" />
        </div>
        <div onClick={() => navigate('/admin/attendance')} style={{ cursor: 'pointer' }}>
          <StatCard icon={UserCheck} label="Present Today" value={presentToday} change={presentChange} changeLabel={`${attendanceRate}% attendance rate`} sparkData={sparkData2} color="#10b981" />
        </div>
        <div onClick={() => navigate('/admin/attendance')} style={{ cursor: 'pointer' }}>
          <StatCard icon={UserX} label="Absent Today" value={absentToday} change={absentChange} changeLabel={`${lateToday} late, ${halfDayToday} half-day`} sparkData={sparkData3} color="#ef4444" />
        </div>
        <div onClick={() => navigate('/admin/leave')} style={{ cursor: 'pointer' }}>
          <StatCard icon={CalendarDays} label="On Leave" value={onLeave} change={onLeaveChange} changeLabel={`${leaveStats.pending} pending requests`} sparkData={sparkData4} color="#f59e0b" />
        </div>
        <div onClick={() => navigate('/admin/employees')} style={{ cursor: 'pointer' }}>
          <StatCard icon={UserPlus} label="New This Month" value={newThisMonth} change={newMonthChange} changeLabel={`vs ${newLastMonth} last month`} sparkData={sparkData5} color="#a855f7" />
        </div>
        <div onClick={() => navigate('/admin/payroll')} style={{ cursor: 'pointer' }}>
          <StatCard icon={Wallet} label="Monthly Payroll" value={monthlyPayroll} change={payrollChange} changeLabel={`${paidCount} paid, ${pendingCount} pending`} sparkData={sparkData6} color="#06b6d4" prefix="$" />
        </div>
      </div>

      <div className="admin-quick-actions">
        {[
          { icon: Users, label: 'Add Employee', desc: 'Onboard a new team member', color: '#3b82f6', route: '/admin/employees/add' },
          { icon: CalendarDays, label: 'Approve Leave', desc: 'Review pending requests', color: '#10b981', route: '/admin/leave' },
          { icon: Wallet, label: 'Generate Payroll', desc: 'Create monthly payslips', color: '#a855f7', route: '/admin/payroll' },
          { icon: Download, label: 'View Reports', desc: 'Analytics & insights', color: '#f59e0b', route: '/admin/reports' },
        ].map((action, i) => (
          <button key={i} className="admin-quick-action-card" onClick={() => navigate(action.route)}>
            <div className="admin-quick-action-icon" style={{ background: `${action.color}15`, color: action.color }}>
              <action.icon size={22} />
            </div>
            <span className="admin-quick-action-label">{action.label}</span>
            <span className="admin-quick-action-desc">{action.desc}</span>
          </button>
        ))}
      </div>

      <div className="admin-charts-grid">
        <ChartCard title="Employee Growth" subtitle="Headcount over the last 6 months" onClick={() => navigate('/admin/reports')}>
          <LineChart
            labels={employeeGrowth.map(d => d.month)}
            datasets={[{ data: employeeGrowth.map(d => d.count), color: '#3b82f6', label: 'Employees' }]}
            height={200}
          />
        </ChartCard>

        <ChartCard title="Weekly Attendance" subtitle="This week's attendance breakdown" onClick={() => navigate('/admin/attendance')}>
          <StackedBarChart data={weeklyTrend} height={280} />
        </ChartCard>
      </div>

      <div className="admin-charts-grid-2">
        <ChartCard title="Department Distribution" subtitle="Employees per department" onClick={() => navigate('/admin/departments')}>
          <DonutChart data={deptDistribution} size={190} />
        </ChartCard>

        <ChartCard title="Leave Statistics" subtitle="Leave type breakdown" onClick={() => navigate('/admin/leave')}>
          <div className="dashboard-leave-chart">
            <DonutChart data={leaveStatsChart} size={190} />
            <LeaveStatsLegend data={leaveStatsChart} />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
