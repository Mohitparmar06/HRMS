import React, { useState, useMemo } from 'react';
import {
  Users, UserCheck, UserX, CalendarDays, UserPlus, Wallet,
  Eye, Edit, Trash2, MoreHorizontal, ArrowRight, Download
} from 'lucide-react';
import { employees, departments, attendanceData, leaveRequests, payrollData, weeklyAttendance, employeeGrowth } from '../../services/dummyData';
import { formatCurrency, formatTime } from '../../utils/formatters';
import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import DataTable from '../../components/admin/DataTable';
import LeaveApprovalPanel from '../../components/admin/LeaveApprovalPanel';
import AttendanceWidget from '../../components/admin/AttendanceWidget';
import PayrollWidget from '../../components/admin/PayrollWidget';
import QuickActions from '../../components/admin/QuickActions';
import ActivityFeed from '../../components/admin/ActivityFeed';
import BarChart from '../../components/admin/BarChart';
import DonutChart from '../../components/admin/DonutChart';
import LineChart from '../../components/admin/LineChart';
import StackedBarChart from '../../components/admin/StackedBarChart';

const sparkData1 = [32, 38, 35, 42, 40, 48, 52, 55];
const sparkData2 = [120, 128, 115, 132, 140, 138, 145, 150];
const sparkData3 = [8, 12, 10, 6, 14, 9, 11, 7];
const sparkData4 = [5, 8, 6, 4, 9, 7, 6, 5];
const sparkData5 = [18, 22, 20, 25, 28, 30, 32, 35];
const sparkData6 = [820, 845, 860, 875, 890, 910, 925, 950];

export default function AdminDashboard() {
  const [leaveData, setLeaveData] = useState(leaveRequests);

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

  const recentEmployees = employees.slice(0, 50);

  const employeeColumns = [
    {
      header: 'Employee',
      accessor: (r) => r.name,
      render: (r) => (
        <div className="admin-table-employee">
          <div className="admin-table-avatar" style={{
            background: `linear-gradient(135deg, ${departments.find(d => d.name === r.department)?.color || '#3b82f6'}, ${departments.find(d => d.name === r.department)?.color || '#3b82f6'}88)`
          }}>
            {r.avatar}
          </div>
          <div>
            <span className="admin-table-name">{r.name}</span>
            <span className="admin-table-email">{r.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (r) => r.department,
      render: (r) => (
        <span className="admin-table-dept" style={{
          background: `${departments.find(d => d.name === r.department)?.color || '#3b82f6'}15`,
          color: departments.find(d => d.name === r.department)?.color || '#3b82f6',
        }}>
          {r.department}
        </span>
      ),
    },
    { header: 'Position', accessor: (r) => r.position },
    {
      header: 'Status',
      accessor: (r) => r.status,
      render: (r) => (
        <span className={`admin-status-badge ${r.status.toLowerCase().replace(' ', '-')}`}>
          {r.status}
        </span>
      ),
    },
    {
      header: 'Last Check-In',
      accessor: (r) => r.lastCheckIn || '--',
      render: (r) => (
        <span className="admin-table-checkin">
          {r.lastCheckIn ? formatTime(r.lastCheckIn) : '--'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: () => '',
      sortable: false,
      render: () => (
        <div className="admin-table-actions">
          <button className="admin-table-action" title="View"><Eye size={14} /></button>
          <button className="admin-table-action" title="Edit"><Edit size={14} /></button>
          <button className="admin-table-action admin-table-action-danger" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  const handleApproveLeave = (id) => {
    setLeaveData(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const handleRejectLeave = (id) => {
    setLeaveData(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Admin Dashboard</h1>
          <p className="admin-dashboard-subtitle">Welcome back, Alex. Here's your organization overview.</p>
        </div>
        <div className="admin-dashboard-header-actions">
          <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard icon={Users} label="Total Employees" value={totalEmployees} change={8.2} changeLabel="vs last month" sparkData={sparkData1} color="#3b82f6" />
        <StatCard icon={UserCheck} label="Present Today" value={presentToday} change={3.1} changeLabel={`${Math.round(presentToday / totalEmployees * 100)}% attendance rate`} sparkData={sparkData2} color="#10b981" />
        <StatCard icon={UserX} label="Absent Today" value={absentToday} change={-12.5} changeLabel="fewer than yesterday" sparkData={sparkData3} color="#ef4444" />
        <StatCard icon={CalendarDays} label="On Leave" value={onLeave} change={-5.3} changeLabel="of total workforce" sparkData={sparkData4} color="#f59e0b" />
        <StatCard icon={UserPlus} label="New This Month" value={newThisMonth} change={15.0} changeLabel="joined this month" sparkData={sparkData5} color="#a855f7" />
        <StatCard icon={Wallet} label="Monthly Payroll" value={monthlyPayroll} change={4.8} changeLabel="vs last month" sparkData={sparkData6} color="#06b6d4" prefix="$" />
      </div>

      <QuickActions />

      <div className="admin-charts-grid">
        <ChartCard title="Employee Growth" subtitle="Headcount over the last 6 months">
          <LineChart
            labels={employeeGrowth.map(d => d.month)}
            datasets={[{ data: employeeGrowth.map(d => d.count), color: '#3b82f6', label: 'Employees' }]}
            height={220}
          />
        </ChartCard>

        <ChartCard title="Weekly Attendance" subtitle="This week's attendance breakdown">
          <StackedBarChart data={weeklyAttendance} height={220} />
        </ChartCard>
      </div>

      <div className="admin-charts-grid-3">
        <ChartCard title="Department Distribution" subtitle="Employees per department">
          <DonutChart data={deptDistribution} size={160} />
        </ChartCard>

        <ChartCard title="Leave Statistics" subtitle="Leave type breakdown">
          <DonutChart data={leaveStats} size={160} />
        </ChartCard>

        <ChartCard title="Payroll Expense Trend" subtitle="Monthly payroll costs">
          <BarChart
            data={payrollData.map(p => ({ label: p.month.slice(0, 3), value: p.netPayroll }))}
            labelKey="label"
            valueKey="value"
            color="#a855f7"
            height={200}
          />
        </ChartCard>
      </div>

      <div className="admin-main-grid">
        <div className="admin-main-left">
          <ChartCard title="Recent Employees" subtitle={`Showing ${recentEmployees.length} of ${totalEmployees} employees`}>
            <DataTable
              columns={employeeColumns}
              data={recentEmployees}
              pageSize={8}
            />
          </ChartCard>
        </div>

        <div className="admin-main-right">
          <LeaveApprovalPanel
            requests={leaveData}
            onApprove={handleApproveLeave}
            onReject={handleRejectLeave}
          />

          <AttendanceWidget data={attendanceData} />

          <PayrollWidget payrollData={payrollData} />

          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
