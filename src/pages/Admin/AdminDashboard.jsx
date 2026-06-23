import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, UserX, CalendarDays, UserPlus, Wallet,
  Download, X
} from 'lucide-react';
import { employees, departments, attendanceData, payrollData, weeklyAttendance, employeeGrowth } from '../../services/dummyData';
import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import DonutChart from '../../components/admin/DonutChart';
import LineChart from '../../components/admin/LineChart';
import StackedBarChart from '../../components/admin/StackedBarChart';

const sparkData1 = [32, 38, 35, 42, 40, 48, 52, 55];
const sparkData2 = [120, 128, 115, 132, 140, 138, 145, 150];
const sparkData3 = [8, 12, 10, 6, 14, 9, 11, 7];
const sparkData4 = [5, 8, 6, 4, 9, 7, 6, 5];
const sparkData5 = [18, 22, 20, 25, 28, 30, 32, 35];
const sparkData6 = [820, 845, 860, 875, 890, 910, 925, 950];

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const todayAttendance = attendanceData[0];
  const totalEmployees = employees.length;
  const presentToday = todayAttendance.present;
  const absentToday = todayAttendance.absent;
  const onLeave = todayAttendance.onLeave;
  const newThisMonth = employees.filter(e => e.joinDate.startsWith('2026-06')).length;
  const monthlyPayroll = payrollData[payrollData.length - 1].netPayroll;

  const deptDistribution = departments.map(d => ({
    label: d.name,
    value: d.employeeCount,
    color: d.color,
  }));

  const leaveStats = [
    { label: 'Annual', value: 45, color: '#3b82f6' },
    { label: 'Sick', value: 22, color: '#a855f7' },
    { label: 'Personal', value: 15, color: '#f59e0b' },
    { label: 'Other', value: 8, color: '#06b6d4' },
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportCSV = () => {
    const data = [
      { Metric: 'Total Employees', Value: totalEmployees },
      { Metric: 'Present Today', Value: presentToday },
      { Metric: 'Absent Today', Value: absentToday },
      { Metric: 'On Leave', Value: onLeave },
      { Metric: 'New This Month', Value: newThisMonth },
      { Metric: 'Monthly Payroll', Value: monthlyPayroll },
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
          <StatCard icon={Users} label="Total Employees" value={totalEmployees} change={8.2} changeLabel="vs last month" sparkData={sparkData1} color="#3b82f6" />
        </div>
        <div onClick={() => navigate('/admin/attendance')} style={{ cursor: 'pointer' }}>
          <StatCard icon={UserCheck} label="Present Today" value={presentToday} change={3.1} changeLabel={`${Math.round(presentToday / totalEmployees * 100)}% attendance rate`} sparkData={sparkData2} color="#10b981" />
        </div>
        <div onClick={() => navigate('/admin/attendance')} style={{ cursor: 'pointer' }}>
          <StatCard icon={UserX} label="Absent Today" value={absentToday} change={-12.5} changeLabel="fewer than yesterday" sparkData={sparkData3} color="#ef4444" />
        </div>
        <div onClick={() => navigate('/admin/leave')} style={{ cursor: 'pointer' }}>
          <StatCard icon={CalendarDays} label="On Leave" value={onLeave} change={-5.3} changeLabel="of total workforce" sparkData={sparkData4} color="#f59e0b" />
        </div>
        <div onClick={() => navigate('/admin/employees')} style={{ cursor: 'pointer' }}>
          <StatCard icon={UserPlus} label="New This Month" value={newThisMonth} change={15.0} changeLabel="joined this month" sparkData={sparkData5} color="#a855f7" />
        </div>
        <div onClick={() => navigate('/admin/payroll')} style={{ cursor: 'pointer' }}>
          <StatCard icon={Wallet} label="Monthly Payroll" value={monthlyPayroll} change={4.8} changeLabel="vs last month" sparkData={sparkData6} color="#06b6d4" prefix="$" />
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
          <StackedBarChart data={weeklyAttendance} height={280} />
        </ChartCard>
      </div>

      <div className="admin-charts-grid-2">
        <ChartCard title="Department Distribution" subtitle="Employees per department" onClick={() => navigate('/admin/departments')}>
          <DonutChart data={deptDistribution} size={190} />
        </ChartCard>

        <ChartCard title="Leave Statistics" subtitle="Leave type breakdown" onClick={() => navigate('/admin/leave')}>
          <div className="dashboard-leave-chart">
            <DonutChart data={leaveStats} size={190} />
            <LeaveStatsLegend data={leaveStats} />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
