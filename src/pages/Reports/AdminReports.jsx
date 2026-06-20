import { useState, useMemo } from 'react';
import BarChart from '../../components/admin/BarChart';
import LineChart from '../../components/admin/LineChart';
import DonutChart from '../../components/admin/DonutChart';
import StatCard from '../../components/admin/StatCard';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useLeave } from '../../contexts/LeaveContext';
import { usePayroll } from '../../contexts/PayrollContext';
import { useAttendance } from '../../contexts/AttendanceContext';
import {
  employees as allEmployees,
  departments,
  employeeGrowth,
  payrollData,
  weeklyAttendance,
} from '../../services/dummyData';
import {
  Users,
  Calendar,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Target,
  Activity,
  AlertTriangle,
  Search,
} from 'lucide-react';

const REPORT_TYPES = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'employee', label: 'Employee', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'leave', label: 'Leave', icon: FileText },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'department', label: 'Department', icon: Building2 },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEARS = [2026, 2025, 2024];

export default function AdminReports() {
  const { employees: empCtx } = useEmployees();
  const { leaveRecords, getLeaveStats } = useLeave();
  const { records: payrollRecords, getPayrollStats } = usePayroll();
  const { attendanceRecords, getStats } = useAttendance();

  const [activeReport, setActiveReport] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const todaysAttendance = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0 };
    }
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
    if (todayRecords.length === 0) {
      return { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0 };
    }
    const stats = getStats(todayRecords);
    return {
      present: stats.present || 0,
      absent: stats.absent || 0,
      late: stats.late || 0,
      halfDay: stats.halfDay || 0,
      onLeave: stats.onLeave || 0,
    };
  }, [attendanceRecords, getStats]);

  const leaveStats = useMemo(() => {
    if (!getLeaveStats) return { total: 0, pending: 0, approved: 0, rejected: 0, onLeaveToday: 0 };
    return getLeaveStats() || { total: 0, pending: 0, approved: 0, rejected: 0, onLeaveToday: 0 };
  }, [getLeaveStats, leaveRecords]);

  const payrollStats = useMemo(() => {
    if (!getPayrollStats) return { totalPayroll: 0, paidCount: 0, pendingCount: 0, totalDeductions: 0, totalBonuses: 0 };
    return getPayrollStats() || { totalPayroll: 0, paidCount: 0, pendingCount: 0, totalDeductions: 0, totalBonuses: 0 };
  }, [getPayrollStats, payrollRecords]);

  const stats = useMemo(() => {
    const totalEmp = allEmployees.length;
    const activeEmp = allEmployees.filter((e) => e.status === 'active').length;
    const inactiveEmp = totalEmp - activeEmp;
    const presentToday = todaysAttendance.present || 0;
    const absentToday = todaysAttendance.absent || 0;
    const lateToday = todaysAttendance.late || 0;
    const halfDayToday = todaysAttendance.halfDay || 0;
    const attendanceRate =
      totalEmp > 0 ? Math.round(((presentToday + lateToday) / totalEmp) * 100) : 0;
    const onLeaveToday = totalEmp - presentToday - absentToday - lateToday - halfDayToday;

    const totalPayrollAmount = payrollStats.totalPayroll || 0;
    const paidCount = payrollStats.paidCount || 0;
    const pendingCount = payrollStats.pendingCount || 0;
    const totalDeductions = payrollStats.totalDeductions || 0;
    const totalBonuses = payrollStats.totalBonuses || 0;
    const avgSalary =
      activeEmp > 0 ? Math.round(totalPayrollAmount / activeEmp) : 0;

    const pendingLeaves = leaveStats.pending || 0;
    const approvedLeaves = leaveStats.approved || 0;
    const rejectedLeaves = leaveStats.rejected || 0;

    const deptCounts = {};
    allEmployees.forEach((emp) => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });

    const avgTenure = empCtx?.avgTenure || 3.2;

    return {
      totalEmp,
      activeEmp,
      inactiveEmp,
      presentToday,
      absentToday,
      lateToday,
      halfDayToday,
      attendanceRate,
      onLeaveToday,
      totalPayrollAmount,
      paidCount,
      pendingCount,
      totalDeductions,
      totalBonuses,
      avgSalary,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      deptCounts,
      avgTenure,
    };
  }, [empCtx, leaveStats, payrollStats, todaysAttendance]);

  const chartData = useMemo(() => {
    const empGrowthLabels = employeeGrowth.map((d) => d.month);
    const empGrowthValues = employeeGrowth.map((d) => d.employees);

    const attendanceLabels = weeklyAttendance.map((w) => w.week);
    const attendancePresent = weeklyAttendance.map((w) => w.present);
    const attendanceAbsent = weeklyAttendance.map((w) => w.absent);
    const attendanceLate = weeklyAttendance.map((w) => w.late);

    const leaveDistribution = [
      { label: 'Approved', value: leaveStats.approved || 0, color: '#22c55e' },
      { label: 'Pending', value: leaveStats.pending || 0, color: '#f59e0b' },
      { label: 'Rejected', value: leaveStats.rejected || 0, color: '#ef4444' },
      { label: 'On Leave Today', value: stats.onLeaveToday, color: '#6366f1' },
    ];

    const payrollLabels = payrollData.map((d) => d.month);
    const payrollValues = payrollData.map((d) => d.netPayroll);
    const payrollBonuses = payrollData.map((d) => d.bonuses);
    const payrollDeductions = payrollData.map((d) => d.deductions);

    const deptLabels = Object.keys(stats.deptCounts);
    const deptValues = Object.values(stats.deptCounts);
    const deptColors = [
      '#6366f1', '#8b5cf6', '#a78bfa', '#22c55e',
      '#f59e0b', '#ef4444', '#ec4899', '#06b6d4',
    ];

    const attendancePie = [
      { label: 'Present', value: stats.presentToday, color: '#22c55e' },
      { label: 'Absent', value: stats.absentToday, color: '#ef4444' },
      { label: 'Late', value: stats.lateToday, color: '#f59e0b' },
      { label: 'Half Day', value: stats.halfDayToday, color: '#06b6d4' },
      { label: 'On Leave', value: stats.onLeaveToday, color: '#6366f1' },
    ];

    return {
      empGrowthLabels,
      empGrowthValues,
      attendanceLabels,
      attendancePresent,
      attendanceAbsent,
      attendanceLate,
      leaveDistribution,
      payrollLabels,
      payrollValues,
      payrollBonuses,
      payrollDeductions,
      deptLabels,
      deptValues,
      deptColors,
      attendancePie,
    };
  }, [stats, leaveStats]);

  const filteredEmployees = useMemo(() => {
    let filtered = [...allEmployees];
    if (selectedDept !== 'All') {
      filtered = filtered.filter((e) => e.department === selectedDept);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q)
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    }
    return filtered;
  }, [selectedDept, searchQuery, sortConfig]);

  const filteredPayroll = useMemo(() => {
    let filtered = [...payrollRecords];
    if (selectedDept !== 'All') {
      filtered = filtered.filter((r) => {
        const emp = allEmployees.find((e) => e.id === r.employeeId);
        return emp?.department === selectedDept;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => {
        const emp = allEmployees.find((e) => e.id === r.employeeId);
        return emp?.name.toLowerCase().includes(q) || emp?.email.toLowerCase().includes(q);
      });
    }
    return filtered.slice(0, 50);
  }, [selectedDept, searchQuery, payrollRecords]);

  const filteredLeaves = useMemo(() => {
    let filtered = [...leaveRecords];
    if (selectedDept !== 'All') {
      filtered = filtered.filter((l) => {
        const emp = allEmployees.find((e) => e.id === l.employeeId);
        return emp?.department === selectedDept;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l) => l.employeeName.toLowerCase().includes(q));
    }
    return filtered.slice(0, 50);
  }, [selectedDept, searchQuery, leaveRecords]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  const exportToCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (type) => {
    setExporting(true);
    setTimeout(() => {
      let data = [];
      let filename = '';

      if (type === 'employees') {
        data = filteredEmployees.map((e) => ({
          Name: e.name,
          Email: e.email,
          Department: e.department,
          Position: e.position,
          Status: e.status,
          JoinDate: e.joinDate,
        }));
        filename = `employee-report-${MONTHS[selectedMonth]}-${selectedYear}`;
      } else if (type === 'attendance') {
        data = weeklyAttendance.map((w) => ({
          Week: w.week,
          Present: w.present,
          Absent: w.absent,
          Late: w.late,
          WFH: w.wfh,
        }));
        filename = `attendance-report-${MONTHS[selectedMonth]}-${selectedYear}`;
      } else if (type === 'leave') {
        data = filteredLeaves.map((l) => ({
          Employee: l.employeeName,
          Type: l.type,
          Start: l.startDate,
          End: l.endDate,
          Days: l.days,
          Status: l.status,
          Reason: l.reason,
        }));
        filename = `leave-report-${MONTHS[selectedMonth]}-${selectedYear}`;
      } else if (type === 'payroll') {
        data = filteredPayroll.map((r) => {
          const emp = allEmployees.find((e) => e.id === r.employeeId);
          return {
            Employee: emp?.name || '',
            Email: emp?.email || '',
            Period: r.period,
            BasePay: r.basePay,
            Bonus: r.bonus,
            Deductions: r.deductions,
            NetPay: r.netPay,
            Status: r.status,
          };
        });
        filename = `payroll-report-${MONTHS[selectedMonth]}-${selectedYear}`;
      }

      exportToCSV(data, filename);
      setExporting(false);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!allEmployees || allEmployees.length === 0) {
    return (
      <div className="admin-reports" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader-spinner" style={{ width: 40, height: 40, border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="reports-overview">
      <div className="reports-charts-grid">
        <div className="reports-chart-card">
          <h3><BarChart3 size={18} /> Monthly Employee Growth</h3>
          <BarChart
            labels={chartData.empGrowthLabels}
            datasets={[{ data: chartData.empGrowthValues, color: '#6366f1' }]}
            height={260}
          />
        </div>
        <div className="reports-chart-card">
          <h3><Activity size={18} /> Weekly Attendance Trend</h3>
          <LineChart
            labels={chartData.attendanceLabels}
            datasets={[
              { data: chartData.attendancePresent, color: '#22c55e', label: 'Present' },
              { data: chartData.attendanceAbsent, color: '#ef4444', label: 'Absent' },
              { data: chartData.attendanceLate, color: '#f59e0b', label: 'Late' },
            ]}
            height={260}
          />
        </div>
        <div className="reports-chart-card">
          <h3><PieChartIcon size={18} /> Today's Attendance</h3>
          <DonutChart
            segments={chartData.attendancePie}
            centerValue={stats.attendanceRate + '%'}
            centerLabel="Attendance Rate"
            size={240}
          />
        </div>
        <div className="reports-chart-card">
          <h3><FileText size={18} /> Leave Distribution</h3>
          <DonutChart
            segments={chartData.leaveDistribution}
            centerValue={leaveStats.total || 0}
            centerLabel="Total Requests"
            size={240}
          />
        </div>
        <div className="reports-chart-card reports-chart-wide">
          <h3><Wallet size={18} /> Monthly Payroll Expenses</h3>
          <BarChart
            labels={chartData.payrollLabels}
            datasets={[
              { data: chartData.payrollValues, color: '#6366f1', label: 'Net Payroll' },
              { data: chartData.payrollBonuses, color: '#22c55e', label: 'Bonuses' },
              { data: chartData.payrollDeductions, color: '#ef4444', label: 'Deductions' },
            ]}
            height={280}
          />
        </div>
        <div className="reports-chart-card">
          <h3><Building2 size={18} /> Department Distribution</h3>
          <BarChart
            labels={chartData.deptLabels}
            datasets={[{ data: chartData.deptValues, color: '#8b5cf6' }]}
            height={260}
          />
        </div>
      </div>

      <div className="reports-summary-cards">
        <div className="reports-summary-card">
          <div className="reports-summary-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
            <CheckCircle size={24} />
          </div>
          <div className="reports-summary-info">
            <span className="reports-summary-value">{stats.approvedLeaves}</span>
            <span className="reports-summary-label">Approved Leaves</span>
          </div>
        </div>
        <div className="reports-summary-card">
          <div className="reports-summary-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="reports-summary-info">
            <span className="reports-summary-value">{stats.pendingLeaves}</span>
            <span className="reports-summary-label">Pending Leaves</span>
          </div>
        </div>
        <div className="reports-summary-card">
          <div className="reports-summary-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            <XCircle size={24} />
          </div>
          <div className="reports-summary-info">
            <span className="reports-summary-value">{stats.rejectedLeaves}</span>
            <span className="reports-summary-label">Rejected Leaves</span>
          </div>
        </div>
        <div className="reports-summary-card">
          <div className="reports-summary-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
            <Wallet size={24} />
          </div>
          <div className="reports-summary-info">
            <span className="reports-summary-value">${(stats.avgSalary / 1000).toFixed(0)}k</span>
            <span className="reports-summary-label">Avg Monthly Salary</span>
          </div>
        </div>
        <div className="reports-summary-card">
          <div className="reports-summary-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
            <Target size={24} />
          </div>
          <div className="reports-summary-info">
            <span className="reports-summary-value">{stats.avgTenure} yrs</span>
            <span className="reports-summary-label">Avg Tenure</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeReport = () => (
    <div className="reports-table-section">
      <div className="reports-table-header">
        <h3>Employee Directory ({filteredEmployees.length} employees)</h3>
        <button className="reports-export-btn" onClick={() => handleExport('employees')} disabled={exporting}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      <div className="reports-table-wrapper">
        <table className="reports-data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}><span>Name <SortIcon column="name" /></span></th>
              <th onClick={() => handleSort('email')}><span>Email <SortIcon column="email" /></span></th>
              <th onClick={() => handleSort('department')}><span>Department <SortIcon column="department" /></span></th>
              <th onClick={() => handleSort('position')}><span>Position <SortIcon column="position" /></span></th>
              <th onClick={() => handleSort('status')}><span>Status <SortIcon column="status" /></span></th>
              <th onClick={() => handleSort('joinDate')}><span>Join Date <SortIcon column="joinDate" /></span></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td>
                  <div className="reports-emp-cell">
                    <div className="reports-emp-avatar" style={{ background: emp.avatar ? undefined : '#6366f1' }}>
                      {emp.avatar ? <img src={emp.avatar} alt={emp.name} /> : emp.name.charAt(0)}
                    </div>
                    <span>{emp.name}</span>
                  </div>
                </td>
                <td>{emp.email}</td>
                <td><span className="reports-dept-badge">{emp.department}</span></td>
                <td>{emp.position}</td>
                <td>
                  <span className={`reports-status-badge reports-status-${emp.status}`}>
                    {emp.status}
                  </span>
                </td>
                <td>{emp.joinDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="reports-table-section">
      <div className="reports-table-header">
        <h3>Weekly Attendance Report</h3>
        <button className="reports-export-btn" onClick={() => handleExport('attendance')} disabled={exporting}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      <div className="reports-table-wrapper">
        <table className="reports-data-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>WFH</th>
              <th>Attendance Rate</th>
            </tr>
          </thead>
          <tbody>
            {weeklyAttendance.map((w, i) => {
              const total = w.present + w.absent + w.late + w.wfh;
              const rate = total > 0 ? Math.round((w.present / total) * 100) : 0;
              return (
                <tr key={i}>
                  <td><strong>{w.week}</strong></td>
                  <td><span className="reports-att-present">{w.present}</span></td>
                  <td><span className="reports-att-absent">{w.absent}</span></td>
                  <td><span className="reports-att-late">{w.late}</span></td>
                  <td><span className="reports-att-wfh">{w.wfh}</span></td>
                  <td>
                    <div className="reports-progress-bar">
                      <div className="reports-progress-fill" style={{ width: `${rate}%`, background: rate >= 80 ? '#22c55e' : rate >= 60 ? '#f59e0b' : '#ef4444' }} />
                      <span>{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="reports-att-summary">
        <div className="reports-att-stat">
          <span className="reports-att-stat-value">{stats.presentToday}</span>
          <span className="reports-att-stat-label">Present Today</span>
        </div>
        <div className="reports-att-stat">
          <span className="reports-att-stat-value">{stats.absentToday}</span>
          <span className="reports-att-stat-label">Absent Today</span>
        </div>
        <div className="reports-att-stat">
          <span className="reports-att-stat-value">{stats.lateToday}</span>
          <span className="reports-att-stat-label">Late Today</span>
        </div>
        <div className="reports-att-stat">
          <span className="reports-att-stat-value">{stats.halfDayToday}</span>
          <span className="reports-att-stat-label">Half Day</span>
        </div>
        <div className="reports-att-stat">
          <span className="reports-att-stat-value">{stats.attendanceRate}%</span>
          <span className="reports-att-stat-label">Today's Rate</span>
        </div>
      </div>
    </div>
  );

  const renderLeaveReport = () => (
    <div className="reports-table-section">
      <div className="reports-table-header">
        <h3>Leave Report ({filteredLeaves.length} records)</h3>
        <button className="reports-export-btn" onClick={() => handleExport('leave')} disabled={exporting}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      <div className="reports-table-wrapper">
        <table className="reports-data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave.id}>
                <td><strong>{leave.employeeName}</strong></td>
                <td><span className="reports-leave-type">{leave.type}</span></td>
                <td>{leave.startDate}</td>
                <td>{leave.endDate}</td>
                <td>{leave.days}</td>
                <td>
                  <span className={`reports-status-badge reports-status-${leave.status}`}>
                    {leave.status}
                  </span>
                </td>
                <td className="reports-reason-cell">{leave.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="reports-leave-summary">
        <div className="reports-leave-stat">
          <span className="reports-leave-stat-value" style={{ color: '#22c55e' }}>{stats.approvedLeaves}</span>
          <span className="reports-leave-stat-label">Approved</span>
        </div>
        <div className="reports-leave-stat">
          <span className="reports-leave-stat-value" style={{ color: '#f59e0b' }}>{stats.pendingLeaves}</span>
          <span className="reports-leave-stat-label">Pending</span>
        </div>
        <div className="reports-leave-stat">
          <span className="reports-leave-stat-value" style={{ color: '#ef4444' }}>{stats.rejectedLeaves}</span>
          <span className="reports-leave-stat-label">Rejected</span>
        </div>
      </div>
    </div>
  );

  const renderPayrollReport = () => (
    <div className="reports-table-section">
      <div className="reports-table-header">
        <h3>Payroll Report ({filteredPayroll.length} records)</h3>
        <button className="reports-export-btn" onClick={() => handleExport('payroll')} disabled={exporting}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      <div className="reports-table-wrapper">
        <table className="reports-data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Period</th>
              <th>Base Pay</th>
              <th>Bonus</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayroll.map((rec) => {
              const emp = allEmployees.find((e) => e.id === rec.employeeId);
              return (
                <tr key={rec.id}>
                  <td><strong>{emp?.name || 'Unknown'}</strong></td>
                  <td>{rec.period}</td>
                  <td>${rec.basePay.toLocaleString()}</td>
                  <td className="reports-payroll-bonus">${rec.bonus.toLocaleString()}</td>
                  <td className="reports-payroll-deduction">${rec.deductions.toLocaleString()}</td>
                  <td><strong>${rec.netPay.toLocaleString()}</strong></td>
                  <td>
                    <span className={`reports-status-badge reports-status-${rec.status === 'paid' ? 'approved' : 'pending'}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="reports-payroll-summary">
        <div className="reports-payroll-stat">
          <span className="reports-payroll-stat-label">Total Payroll</span>
          <span className="reports-payroll-stat-value">${(stats.totalPayrollAmount / 1000).toFixed(0)}k</span>
        </div>
        <div className="reports-payroll-stat">
          <span className="reports-payroll-stat-label">Total Bonuses</span>
          <span className="reports-payroll-stat-value" style={{ color: '#22c55e' }}>${(stats.totalBonuses / 1000).toFixed(0)}k</span>
        </div>
        <div className="reports-payroll-stat">
          <span className="reports-payroll-stat-label">Total Deductions</span>
          <span className="reports-payroll-stat-value" style={{ color: '#ef4444' }}>${(stats.totalDeductions / 1000).toFixed(0)}k</span>
        </div>
        <div className="reports-payroll-stat">
          <span className="reports-payroll-stat-label">Paid Records</span>
          <span className="reports-payroll-stat-value">{stats.paidCount}</span>
        </div>
        <div className="reports-payroll-stat">
          <span className="reports-payroll-stat-label">Pending Records</span>
          <span className="reports-payroll-stat-value" style={{ color: '#f59e0b' }}>{stats.pendingCount}</span>
        </div>
      </div>
    </div>
  );

  const renderDepartmentReport = () => (
    <div className="reports-dept-section">
      <div className="reports-dept-grid">
        {departments.map((dept) => {
          const count = stats.deptCounts[dept.name] || 0;
          const deptEmployees = allEmployees.filter((e) => e.department === dept.name);
          const activeCount = deptEmployees.filter((e) => e.status === 'active').length;
          const inactiveCount = count - activeCount;
          const deptIcon = {
            Engineering: '💻', Design: '🎨', Marketing: '📢', Sales: '💼',
            HR: '👥', Finance: '💰', Operations: '⚙️', Support: '🎧',
          };

          return (
            <div key={dept.name} className="reports-dept-card">
              <div className="reports-dept-header">
                <span className="reports-dept-emoji">{deptIcon[dept.name] || '🏢'}</span>
                <div>
                  <h4>{dept.name}</h4>
                  <p>{count} employees</p>
                </div>
              </div>
              <div className="reports-dept-stats">
                <div className="reports-dept-stat">
                  <CheckCircle size={14} style={{ color: '#22c55e' }} />
                  <span>{activeCount} active</span>
                </div>
                {inactiveCount > 0 && (
                  <div className="reports-dept-stat">
                    <XCircle size={14} style={{ color: '#ef4444' }} />
                    <span>{inactiveCount} inactive</span>
                  </div>
                )}
              </div>
              <div className="reports-dept-bar">
                <div
                  className="reports-dept-bar-fill"
                  style={{ width: `${(count / stats.totalEmp) * 100}%`, background: dept.color || '#6366f1' }}
                />
              </div>
              <span className="reports-dept-pct">{Math.round((count / stats.totalEmp) * 100)}% of total</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderReport = () => {
    switch (activeReport) {
      case 'overview': return renderOverview();
      case 'employee': return renderEmployeeReport();
      case 'attendance': return renderAttendanceReport();
      case 'leave': return renderLeaveReport();
      case 'payroll': return renderPayrollReport();
      case 'department': return renderDepartmentReport();
      default: return renderOverview();
    }
  };

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <div className="reports-header-text">
          <h1>Reports & Analytics</h1>
          <p>Comprehensive insights across all HR modules</p>
        </div>
        <div className="reports-header-actions">
          <button className="reports-print-btn" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div className="reports-stats-row">
        <StatCard title="Total Employees" value={stats.totalEmp} icon={Users} color="#6366f1" trend="up" trendValue="+3 this month" />
        <StatCard title="Present Today" value={stats.presentToday} icon={CheckCircle} color="#22c55e" trend="up" trendValue={`${stats.attendanceRate}% rate`} />
        <StatCard title="Employees On Leave" value={stats.onLeaveToday} icon={Calendar} color="#f59e0b" />
        <StatCard title="Total Payroll" value={`$${(stats.totalPayrollAmount / 1000000).toFixed(1)}M`} icon={Wallet} color="#8b5cf6" trend="up" trendValue="+2.3%" />
        <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={Target} color="#06b6d4" trend="up" trendValue="Above target" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={AlertTriangle} color="#ef4444" />
      </div>

      <div className="reports-toolbar">
        <div className="reports-tabs">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.key}
              className={`reports-tab ${activeReport === r.key ? 'active' : ''}`}
              onClick={() => setActiveReport(r.key)}
            >
              <r.icon size={16} /> {r.label}
            </button>
          ))}
        </div>
        <div className="reports-toolbar-right">
          <button
            className="reports-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} /> Filters {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="reports-filters">
          <div className="reports-filter-group">
            <label>Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="reports-filter-group">
            <label>Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="reports-filter-group">
            <label>Department</label>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="reports-filter-group reports-search-group">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="reports-filter-reset"
            onClick={() => { setSelectedDept('All'); setSearchQuery(''); setSelectedMonth(new Date().getMonth()); setSelectedYear(2026); }}
          >
            Reset Filters
          </button>
        </div>
      )}

      <div className="reports-content">
        {renderReport()}
      </div>
    </div>
  );
}
