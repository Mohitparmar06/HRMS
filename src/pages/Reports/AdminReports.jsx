import { useState, useMemo, useCallback } from 'react';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useLeave } from '../../contexts/LeaveContext';
import { usePayroll } from '../../contexts/PayrollContext';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useSettings } from '../../contexts/SettingsContext';
import {
  Users, Calendar, Wallet, CheckCircle, XCircle, Building2,
  Download, Filter, FileText, Printer, ChevronDown, ChevronUp,
  Target, Search, Eye, FileSpreadsheet, File, TrendingUp,
  Award, AlertTriangle, BarChart3, PieChart, Activity,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ChartCard from '../../components/admin/ChartCard';
import LineChart from '../../components/admin/LineChart';
import DonutChart from '../../components/admin/DonutChart';
import BarChart from '../../components/admin/BarChart';

const REPORT_TYPES = [
  { key: 'overview', label: 'Overview', icon: FileText },
  { key: 'employee', label: 'Employee', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'leave', label: 'Leave', icon: FileText },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'department', label: 'Department', icon: Building2 },
];

const REPORT_TYPE_OPTIONS = ['All', 'Employee', 'Attendance', 'Leave', 'Payroll', 'Department'];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Pending', 'Approved', 'Rejected', 'Paid', 'On Leave'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const LEAVE_COLORS = {
  'Casual Leave': '#3b82f6',
  'Sick Leave': '#a855f7',
  'Earned Leave': '#f59e0b',
  'Maternity Leave': '#ec4899',
  'Paternity Leave': '#06b6d4',
  'Work From Home': '#10b981',
};

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

export default function AdminReports() {
  const { employees: empCtx, departments } = useEmployees();
  const allEmployees = empCtx || [];
  const { leaveRecords, getLeaveStats, getLeaveByType } = useLeave();
  const { records: payrollRecords, getPayrollStats, getDepartmentPayroll } = usePayroll();
  const { attendanceRecords, getStats, getWeeklyTrend, getMonthlySummary } = useAttendance();
  const { settings } = useSettings();

  const [activeReport, setActiveReport] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedReportType, setSelectedReportType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewReportData, setViewReportData] = useState(null);
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  const employeeGrowth = useMemo(() => {
    const months = getLastNMonths(6);
    let cumulative = allEmployees.filter(e => {
      if (!e.joinDate) return false;
      return e.joinDate.substring(0, 7) < months[0].key;
    }).length;

    return months.map(m => {
      const joined = allEmployees.filter(e => e.joinDate && e.joinDate.startsWith(m.key)).length;
      cumulative += joined;
      return { month: m.label, count: cumulative };
    });
  }, [allEmployees]);

  const todaysAttendance = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0 };
    }
    const today = new Date();
    const todayStr = toLocalDateStr(today);
    let todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
    if (todayRecords.length === 0) {
      const allDates = [...new Set(attendanceRecords.map((r) => r.date))].sort().reverse();
      if (allDates.length > 0) {
        todayRecords = attendanceRecords.filter((r) => r.date === allDates[0]);
      }
    }
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
    if (!getPayrollStats) return { totalPayroll: 0, paidCount: 0, pendingCount: 0, totalDeductions: 0, totalBonuses: 0, totalNet: 0 };
    return getPayrollStats() || { totalPayroll: 0, paidCount: 0, pendingCount: 0, totalDeductions: 0, totalBonuses: 0, totalNet: 0 };
  }, [getPayrollStats, payrollRecords]);

  const stats = useMemo(() => {
    const totalEmp = allEmployees.length;
    const activeEmp = allEmployees.filter((e) => e.status === 'Active').length;
    const presentToday = todaysAttendance.present || 0;
    const absentToday = todaysAttendance.absent || 0;
    const lateToday = todaysAttendance.late || 0;
    const halfDayToday = todaysAttendance.halfDay || 0;
    const onLeaveToday = todaysAttendance.onLeave || 0;
    const attendanceRate = totalEmp > 0 ? Math.round(((presentToday + lateToday + halfDayToday) / totalEmp) * 100) : 0;

    const totalPayrollAmount = payrollStats.totalNet || 0;
    const totalBonuses = payrollStats.totalBonuses || 0;
    const totalDeductions = payrollStats.totalDeductions || 0;
    const avgSalary = activeEmp > 0 ? Math.round(totalPayrollAmount / activeEmp) : 0;

    const deptCounts = {};
    allEmployees.forEach((emp) => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });

    const deptPayroll = {};
    payrollRecords.forEach((rec) => {
      const emp = allEmployees.find((e) => e.id === rec.employeeId);
      if (emp) {
        deptPayroll[emp.department] = (deptPayroll[emp.department] || 0) + (rec.netSalary || 0);
      }
    });

    const deptLeaves = {};
    leaveRecords.forEach((l) => {
      const emp = allEmployees.find((e) => e.id === l.employeeId);
      const dept = emp?.department || l.department;
      if (dept) {
        deptLeaves[dept] = (deptLeaves[dept] || 0) + 1;
      }
    });

    const bestAttDept = Object.entries(deptCounts).reduce((best, [dept, count]) => {
      const deptEmpIds = allEmployees.filter((e) => e.department === dept).map((e) => e.id);
      const today = toLocalDateStr(new Date());
      const deptTodayRecords = attendanceRecords.filter(
        (r) => deptEmpIds.includes(r.employeeId) && r.date === today
      );
      const deptPresent = deptTodayRecords.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'half-day').length;
      const rate = count > 0 ? Math.round((deptPresent / count) * 100) : 0;
      return rate > best.rate ? { dept, rate } : best;
    }, { dept: 'N/A', rate: 0 }).dept;

    const highestPayDept = Object.entries(deptPayroll).reduce((best, [dept, total]) => {
      return total > best.total ? { dept, total } : best;
    }, { dept: 'N/A', total: 0 }).dept;

    const mostLeaveDept = Object.entries(deptLeaves).reduce((best, [dept, count]) => {
      return count > best.count ? { dept, count } : best;
    }, { dept: 'N/A', count: 0 }).dept;

    const empGrowthThisMonth = employeeGrowth && employeeGrowth.length >= 2
      ? employeeGrowth[employeeGrowth.length - 1].count - employeeGrowth[employeeGrowth.length - 2].count
      : 0;

    return {
      totalEmp, activeEmp, presentToday, absentToday, lateToday, halfDayToday,
      attendanceRate, onLeaveToday, totalPayrollAmount, totalBonuses, totalDeductions,
      avgSalary, deptCounts, bestAttDept, highestPayDept, mostLeaveDept, empGrowthThisMonth,
    };
  }, [allEmployees, todaysAttendance, payrollStats, attendanceRecords, leaveRecords, employeeGrowth]);

  const weeklyAttendanceData = useMemo(() => getWeeklyTrend(attendanceRecords), [attendanceRecords, getWeeklyTrend]);
  const monthlyAttendanceData = useMemo(() => getMonthlySummary ? getMonthlySummary() : [], [getMonthlySummary, attendanceRecords]);

  const leaveByType = useMemo(() => {
    if (!getLeaveByType) return {};
    return getLeaveByType();
  }, [getLeaveByType, leaveRecords]);

  const leaveDistribution = useMemo(() => {
    return Object.entries(leaveByType)
      .map(([type, stats]) => ({
        label: type.replace(' Leave', ''),
        value: stats.total,
        color: LEAVE_COLORS[type] || '#6b7280',
      }))
      .filter(d => d.value > 0);
  }, [leaveByType]);

  const departmentPayroll = useMemo(() => {
    if (!getDepartmentPayroll) return {};
    return getDepartmentPayroll();
  }, [getDepartmentPayroll, payrollRecords]);

  const payrollDistribution = useMemo(() => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#8b5cf6', '#f97316'];
    return Object.entries(departmentPayroll)
      .map(([dept, data], i) => ({
        label: dept,
        value: data.total,
        color: colors[i % colors.length],
      }))
      .filter(d => d.value > 0);
  }, [departmentPayroll]);

  const filteredEmployees = useMemo(() => {
    let filtered = [...allEmployees];
    if (selectedDept !== 'All') {
      filtered = filtered.filter((e) => e.department === selectedDept);
    }
    if (selectedEmployee !== 'All') {
      filtered = filtered.filter((e) => e.id === selectedEmployee);
    }
    if (selectedMonth !== null && selectedMonth !== undefined) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      filtered = filtered.filter((e) => e.joinDate && e.joinDate.includes(`-${monthStr}-`));
    }
    if (dateRangeStart) {
      filtered = filtered.filter((e) => e.joinDate && e.joinDate >= dateRangeStart);
    }
    if (dateRangeEnd) {
      filtered = filtered.filter((e) => e.joinDate && e.joinDate <= dateRangeEnd);
    }
    if (selectedStatus !== 'All' && ['Active', 'Inactive', 'On Leave'].includes(selectedStatus)) {
      filtered = filtered.filter((e) => e.status === selectedStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
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
  }, [selectedDept, selectedEmployee, selectedMonth, selectedStatus, dateRangeStart, dateRangeEnd, searchQuery, sortConfig, allEmployees]);

  const filteredAttendance = useMemo(() => {
    let filtered = [...attendanceRecords];
    if (selectedDept !== 'All') {
      const deptEmpIds = allEmployees.filter(e => e.department === selectedDept).map(e => e.id);
      filtered = filtered.filter(r => deptEmpIds.includes(r.employeeId));
    }
    if (selectedEmployee !== 'All') {
      filtered = filtered.filter(r => r.employeeId === selectedEmployee);
    }
    if (dateRangeStart) {
      filtered = filtered.filter(r => r.date >= dateRangeStart);
    }
    if (dateRangeEnd) {
      filtered = filtered.filter(r => r.date <= dateRangeEnd);
    }
    if (selectedMonth !== null && selectedMonth !== undefined) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      filtered = filtered.filter(r => r.date && r.date.includes(`-${monthStr}-`));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.employeeName || '').toLowerCase().includes(q) ||
        (r.department || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q)
      );
    }
    return filtered.slice(0, 200);
  }, [selectedDept, selectedEmployee, selectedMonth, dateRangeStart, dateRangeEnd, searchQuery, attendanceRecords, allEmployees]);

  const filteredLeaves = useMemo(() => {
    let filtered = [...leaveRecords];
    if (selectedDept !== 'All') {
      filtered = filtered.filter((l) => {
        const emp = allEmployees.find((e) => e.id === l.employeeId);
        return emp?.department === selectedDept || l.department === selectedDept;
      });
    }
    if (selectedEmployee !== 'All') {
      filtered = filtered.filter(l => l.employeeId === selectedEmployee);
    }
    if (dateRangeStart) {
      filtered = filtered.filter(l => l.startDate && l.startDate >= dateRangeStart);
    }
    if (dateRangeEnd) {
      filtered = filtered.filter(l => l.endDate && l.endDate <= dateRangeEnd);
    }
    if (selectedMonth !== null && selectedMonth !== undefined) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      filtered = filtered.filter(l => l.startDate && l.startDate.includes(`-${monthStr}-`));
    }
    if (selectedStatus !== 'All' && ['Pending', 'Approved', 'Rejected'].includes(selectedStatus)) {
      filtered = filtered.filter(l => l.status === selectedStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        (l.employeeName || '').toLowerCase().includes(q) ||
        (l.leaveType || '').toLowerCase().includes(q) ||
        (l.reason || '').toLowerCase().includes(q) ||
        (l.department || '').toLowerCase().includes(q)
      );
    }
    return filtered.slice(0, 200);
  }, [selectedDept, selectedEmployee, selectedMonth, selectedStatus, dateRangeStart, dateRangeEnd, searchQuery, leaveRecords, allEmployees]);

  const filteredPayroll = useMemo(() => {
    let filtered = [...payrollRecords];
    if (selectedDept !== 'All') {
      filtered = filtered.filter(r => r.department === selectedDept);
    }
    if (selectedEmployee !== 'All') {
      filtered = filtered.filter(r => r.employeeId === selectedEmployee);
    }
    if (selectedMonth !== null && selectedMonth !== undefined) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      filtered = filtered.filter(r => {
        if (r.period) {
          const periodDate = new Date(r.period);
          const periodKey = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;
          return periodKey.endsWith(`-${monthStr}`);
        }
        return false;
      });
    }
    if (selectedStatus !== 'All' && ['Paid', 'Pending'].includes(selectedStatus)) {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const emp = allEmployees.find((e) => e.id === r.employeeId);
        return (emp?.name || r.employeeName || '').toLowerCase().includes(q) ||
               (emp?.email || '').toLowerCase().includes(q) ||
               (r.department || '').toLowerCase().includes(q);
      });
    }
    return filtered.slice(0, 200);
  }, [selectedDept, selectedEmployee, selectedMonth, selectedStatus, searchQuery, payrollRecords, allEmployees]);

  const dynamicReports = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return [];
    const reports = [];
    let id = 1;
    const today = toLocalDateStr(new Date());

    reports.push({ id: id++, name: 'Monthly Employee Summary', category: 'Employee', department: 'All', generatedDate: today, generatedBy: 'System', status: 'Completed' });
    reports.push({ id: id++, name: 'Employee Onboarding Status', category: 'Employee', department: 'HR', generatedDate: today, generatedBy: 'System', status: 'Completed' });

    if (attendanceRecords && attendanceRecords.length > 0) {
      reports.push({ id: id++, name: 'Weekly Attendance Log', category: 'Attendance', department: 'All', generatedDate: today, generatedBy: 'System', status: 'Completed' });
      reports.push({ id: id++, name: 'Monthly Absenteeism Analysis', category: 'Attendance', department: 'All', generatedDate: today, generatedBy: 'System', status: 'Completed' });
    }

    if (payrollRecords && payrollRecords.length > 0) {
      reports.push({ id: id++, name: 'Payroll Breakdown', category: 'Payroll', department: 'Finance', generatedDate: today, generatedBy: 'System', status: 'Completed' });
      reports.push({ id: id++, name: 'Salary Revision Tracker', category: 'Payroll', department: 'HR', generatedDate: today, generatedBy: 'System', status: 'Completed' });
    }

    if (leaveRecords && leaveRecords.length > 0) {
      const pendingLeaves = leaveRecords.filter(l => l.status === 'Pending').length;
      reports.push({ id: id++, name: 'Leave Utilization Report', category: 'Leave', department: 'HR', generatedDate: today, generatedBy: 'System', status: pendingLeaves > 0 ? 'Pending' : 'Completed' });
      reports.push({ id: id++, name: 'Leave Balance Report', category: 'Leave', department: 'All', generatedDate: today, generatedBy: 'System', status: 'Completed' });
    }

    if (departments && departments.length > 0) {
      reports.push({ id: id++, name: 'Department Headcount', category: 'Department', department: 'All', generatedDate: today, generatedBy: 'System', status: 'Completed' });
      reports.push({ id: id++, name: 'Team Performance Overview', category: 'Department', department: 'All', generatedDate: today, generatedBy: 'System', status: 'Completed' });
    }

    return reports;
  }, [allEmployees, attendanceRecords, payrollRecords, leaveRecords, departments]);

  const filteredReports = useMemo(() => {
    let filtered = [...dynamicReports];
    if (selectedDept !== 'All') {
      filtered = filtered.filter((r) => r.department === selectedDept || r.department === 'All');
    }
    if (selectedReportType !== 'All') {
      filtered = filtered.filter((r) => r.category === selectedReportType);
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
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
  }, [dynamicReports, selectedDept, selectedReportType, selectedStatus, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const exportToCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data, filename) => {
    if (!data.length) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const getExportData = useCallback(() => {
    switch (activeReport) {
      case 'employee':
        return {
          data: filteredEmployees.map((e) => ({
            Name: e.name, Email: e.email, Department: e.department,
            Position: e.position, Status: e.status, 'Join Date': e.joinDate,
          })),
          filename: 'employee-report',
        };
      case 'attendance':
        return {
          data: filteredAttendance.map((r) => ({
            Employee: r.employeeName, Date: r.date, Status: r.status,
            'Check In': r.checkIn || 'N/A', 'Check Out': r.checkOut || 'N/A',
            'Hours Worked': r.hoursWorked || 0, Department: r.department,
          })),
          filename: 'attendance-report',
        };
      case 'leave':
        return {
          data: filteredLeaves.map((l) => ({
            Employee: l.employeeName, Type: l.leaveType, 'Start Date': l.startDate,
            'End Date': l.endDate, Duration: l.duration, Status: l.status, Reason: l.reason,
          })),
          filename: 'leave-report',
        };
      case 'payroll':
        return {
          data: filteredPayroll.map((r) => ({
            Employee: r.employeeName || allEmployees.find((e) => e.id === r.employeeId)?.name || 'Unknown',
            Period: r.period, Department: r.department,
            'Base Salary': r.baseSalary, Bonus: r.bonus,
            Deductions: r.totalDeductions, 'Net Salary': r.netSalary, Status: r.status,
          })),
          filename: 'payroll-report',
        };
      case 'department':
        return {
          data: departments.map((dept) => {
            const deptEmps = allEmployees.filter((e) => e.department === dept.name);
            return {
              Department: dept.name, Head: dept.head,
              'Total Employees': deptEmps.length,
              Active: deptEmps.filter((e) => e.status === 'Active').length,
              'On Leave': deptEmps.filter((e) => e.status === 'On Leave').length,
              Inactive: deptEmps.filter((e) => e.status === 'Inactive').length,
            };
          }),
          filename: 'department-report',
        };
      default:
        return {
          data: filteredReports.map((r) => ({
            'Report Name': r.name, Category: r.category,
            Department: r.department, 'Generated Date': r.generatedDate,
            Status: r.status,
          })),
          filename: 'all-reports',
        };
    }
  }, [activeReport, filteredEmployees, filteredAttendance, filteredLeaves, filteredPayroll, departments, allEmployees, filteredReports]);

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      const { data, filename } = getExportData();
      if (data.length > 0) {
        exportToCSV(data, `${filename}-${MONTHS[selectedMonth]}-${selectedYear}`);
      }
      setExporting(false);
    }, 300);
  };

  const handleExportExcel = () => {
    setExporting(true);
    setTimeout(() => {
      const { data, filename } = getExportData();
      if (data.length > 0) {
        exportToExcel(data, `${filename}-${MONTHS[selectedMonth]}-${selectedYear}`);
      }
      setExporting(false);
    }, 300);
  };

  const handleExportPDF = () => {
    const reportTitle = REPORT_TYPES.find((r) => r.key === activeReport)?.label || 'Report';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableHeaders = '';
    let tableRows = '';

    switch (activeReport) {
      case 'employee':
        tableHeaders = '<tr><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Status</th><th>Join Date</th></tr>';
        tableRows = filteredEmployees.map((e) =>
          `<tr><td>${e.name}</td><td>${e.email}</td><td>${e.department}</td><td>${e.position}</td><td>${e.status}</td><td>${e.joinDate}</td></tr>`
        ).join('');
        break;
      case 'attendance':
        tableHeaders = '<tr><th>Employee</th><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Hours</th></tr>';
        tableRows = filteredAttendance.map((r) =>
          `<tr><td>${r.employeeName}</td><td>${r.date}</td><td>${r.status}</td><td>${r.checkIn || 'N/A'}</td><td>${r.checkOut || 'N/A'}</td><td>${r.hoursWorked || 0}</td></tr>`
        ).join('');
        break;
      case 'leave':
        tableHeaders = '<tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th><th>Reason</th></tr>';
        tableRows = filteredLeaves.map((l) =>
          `<tr><td>${l.employeeName}</td><td>${l.leaveType}</td><td>${l.startDate}</td><td>${l.endDate}</td><td>${l.duration}</td><td>${l.status}</td><td>${l.reason}</td></tr>`
        ).join('');
        break;
      case 'payroll':
        tableHeaders = '<tr><th>Employee</th><th>Period</th><th>Base Pay</th><th>Bonus</th><th>Deductions</th><th>Net Pay</th><th>Status</th></tr>';
        tableRows = filteredPayroll.map((r) => {
          const empName = r.employeeName || allEmployees.find((e) => e.id === r.employeeId)?.name || 'Unknown';
          return `<tr><td>${empName}</td><td>${r.period}</td><td>$${(r.baseSalary || 0).toLocaleString()}</td><td>$${(r.bonus || 0).toLocaleString()}</td><td>$${(r.totalDeductions || 0).toLocaleString()}</td><td>$${(r.netSalary || 0).toLocaleString()}</td><td>${r.status}</td></tr>`;
        }).join('');
        break;
      case 'department':
        tableHeaders = '<tr><th>Department</th><th>Head</th><th>Total</th><th>Active</th><th>On Leave</th><th>Inactive</th></tr>';
        tableRows = departments.map((dept) => {
          const deptEmps = allEmployees.filter((e) => e.department === dept.name);
          return `<tr><td>${dept.name}</td><td>${dept.head}</td><td>${deptEmps.length}</td><td>${deptEmps.filter((e) => e.status === 'Active').length}</td><td>${deptEmps.filter((e) => e.status === 'On Leave').length}</td><td>${deptEmps.filter((e) => e.status === 'Inactive').length}</td></tr>`;
        }).join('');
        break;
      default:
        tableHeaders = '<tr><th>Report Name</th><th>Category</th><th>Department</th><th>Generated Date</th><th>Status</th></tr>';
        tableRows = filteredReports.map((r) =>
          `<tr><td>${r.name}</td><td>${r.category}</td><td>${r.department}</td><td>${r.generatedDate}</td><td>${r.status}</td></tr>`
        ).join('');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${settings.company.name} - ${reportTitle} Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; }
          h1 { font-size: 1.5rem; margin-bottom: 4px; }
          .subtitle { color: #666; font-size: 0.85rem; margin-bottom: 24px; }
          .meta { color: #888; font-size: 0.75rem; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
          th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #e2e8f0; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          tr:hover { background: #f8fafc; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${settings.company.name}</h1>
        <div class="subtitle">${reportTitle} Report</div>
        <div class="meta">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | ${MONTHS[selectedMonth]} ${selectedYear} | ${selectedDept === 'All' ? 'All Departments' : selectedDept}</div>
        <table>
          <thead>${tableHeaders}</thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handlePrint = () => window.print();

  const handleView = (report) => setViewReportData(report);

  const handleResetFilters = () => {
    setSelectedDept('All');
    setSelectedEmployee('All');
    setSelectedReportType('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  if (!allEmployees || allEmployees.length === 0) {
    return (
      <div className="admin-reports" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader-spinner" style={{ width: 40, height: 40, border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Loading reports from MongoDB...</p>
        </div>
      </div>
    );
  }

  const renderCharts = () => (
    <div className="reports-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
      <ChartCard title="Employee Growth" subtitle="Headcount over last 6 months">
        <LineChart
          labels={employeeGrowth.map(d => d.month)}
          datasets={[{ data: employeeGrowth.map(d => d.count), color: '#3b82f6', label: 'Employees' }]}
          height={180}
        />
      </ChartCard>

      <ChartCard title="Attendance Trend" subtitle="Monthly attendance summary">
        <BarChart
          labels={monthlyAttendanceData.map(d => d.month)}
          datasets={[
            { data: monthlyAttendanceData.map(d => d.present), color: '#22c55e', label: 'Present' },
            { data: monthlyAttendanceData.map(d => d.absent), color: '#ef4444', label: 'Absent' },
            { data: monthlyAttendanceData.map(d => d.late), color: '#f59e0b', label: 'Late' },
          ]}
          height={180}
        />
      </ChartCard>

      {leaveDistribution.length > 0 && (
        <ChartCard title="Leave Distribution" subtitle="Leave requests by type">
          <DonutChart data={leaveDistribution} size={160} />
        </ChartCard>
      )}

      {payrollDistribution.length > 0 && (
        <ChartCard title="Payroll Distribution" subtitle="Salary by department">
          <DonutChart data={payrollDistribution} size={160} />
        </ChartCard>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="reports-overview">
      {renderCharts()}

      <div className="reports-table-section">
        <div className="reports-table-header">
          <h3><FileText size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> All Reports ({filteredReports.length})</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="reports-export-btn" onClick={handleExportCSV} disabled={exporting}>
              <FileSpreadsheet size={14} /> CSV
            </button>
            <button className="reports-export-btn" onClick={handleExportExcel} disabled={exporting}>
              <File size={14} /> Excel
            </button>
            <button className="reports-export-btn" onClick={handleExportPDF}>
              <Download size={14} /> PDF
            </button>
          </div>
        </div>
        <div className="reports-table-wrapper">
          <table className="reports-data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}><span>Report Name <SortIcon column="name" /></span></th>
                <th onClick={() => handleSort('category')}><span>Category <SortIcon column="category" /></span></th>
                <th onClick={() => handleSort('department')}><span>Department <SortIcon column="department" /></span></th>
                <th onClick={() => handleSort('generatedDate')}><span>Generated <SortIcon column="generatedDate" /></span></th>
                <th onClick={() => handleSort('status')}><span>Status <SortIcon column="status" /></span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td><strong>{report.name}</strong></td>
                  <td><span className="reports-dept-badge">{report.category}</span></td>
                  <td>{report.department}</td>
                  <td>{report.generatedDate}</td>
                  <td>
                    <span className={`reports-status-badge reports-status-${report.status === 'Completed' ? 'approved' : report.status === 'Pending' ? 'pending' : 'active'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleView(report)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                        <Eye size={12} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="reports-dept-section">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          <Award size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Quick Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { label: 'Best Attendance Dept', value: stats.bestAttDept, icon: Award, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Highest Payroll Dept', value: stats.highestPayDept, icon: Wallet, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { label: 'Most Leave Requests', value: stats.mostLeaveDept, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Employee Growth (Month)', value: `+${stats.empGrowthThisMonth}`, icon: TrendingUp, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          ].map((insight, i) => (
            <div key={i} className="reports-summary-card">
              <div className="reports-summary-icon" style={{ background: insight.bg, color: insight.color }}>
                <insight.icon size={22} />
              </div>
              <div className="reports-summary-info">
                <span className="reports-summary-value" style={{ fontSize: '1rem' }}>{insight.value}</span>
                <span className="reports-summary-label">{insight.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-summary-cards">
        {[
          { label: 'Total Employees', value: stats.totalEmp, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Present Today', value: stats.presentToday, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'On Leave', value: stats.onLeaveToday, icon: Calendar, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Total Payroll', value: `$${(stats.totalPayrollAmount / 1000).toFixed(0)}k`, icon: Wallet, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: Target, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
        ].map((card, i) => (
          <div key={i} className="reports-summary-card">
            <div className="reports-summary-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="reports-summary-info">
              <span className="reports-summary-value">{card.value}</span>
              <span className="reports-summary-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmployeeReport = () => (
    <div className="reports-table-section">
      <div className="reports-table-header">
        <h3><Users size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Employee Directory ({filteredEmployees.length} employees)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="reports-export-btn" onClick={handleExportCSV} disabled={exporting}><FileSpreadsheet size={14} /> CSV</button>
          <button className="reports-export-btn" onClick={handleExportExcel} disabled={exporting}><File size={14} /> Excel</button>
          <button className="reports-export-btn" onClick={handleExportPDF}><Download size={14} /> PDF</button>
        </div>
      </div>

      <ChartCard title="Employee Growth" subtitle="Headcount trend over 6 months">
        <LineChart
          labels={employeeGrowth.map(d => d.month)}
          datasets={[{ data: employeeGrowth.map(d => d.count), color: '#3b82f6', label: 'Employees' }]}
          height={180}
        />
      </ChartCard>

      <div className="reports-table-wrapper" style={{ marginTop: 16 }}>
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
                <td><span className={`reports-status-badge reports-status-${emp.status}`}>{emp.status}</span></td>
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
        <h3><Calendar size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Attendance Report ({filteredAttendance.length} records)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="reports-export-btn" onClick={handleExportCSV} disabled={exporting}><FileSpreadsheet size={14} /> CSV</button>
          <button className="reports-export-btn" onClick={handleExportExcel} disabled={exporting}><File size={14} /> Excel</button>
          <button className="reports-export-btn" onClick={handleExportPDF}><Download size={14} /> PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Attendance Trend" subtitle="Monthly attendance overview">
          <BarChart
            labels={monthlyAttendanceData.map(d => d.month)}
            datasets={[
              { data: monthlyAttendanceData.map(d => d.present), color: '#22c55e', label: 'Present' },
              { data: monthlyAttendanceData.map(d => d.absent), color: '#ef4444', label: 'Absent' },
              { data: monthlyAttendanceData.map(d => d.late), color: '#f59e0b', label: 'Late' },
            ]}
            height={180}
          />
        </ChartCard>

        <ChartCard title="Weekly Breakdown" subtitle="This week's attendance">
          <BarChart
            labels={weeklyAttendanceData.map(d => d.day)}
            datasets={[
              { data: weeklyAttendanceData.map(d => d.present), color: '#22c55e', label: 'Present' },
              { data: weeklyAttendanceData.map(d => d.absent), color: '#ef4444', label: 'Absent' },
              { data: weeklyAttendanceData.map(d => d.late), color: '#f59e0b', label: 'Late' },
            ]}
            height={180}
          />
        </ChartCard>
      </div>

      <div className="reports-table-wrapper">
        <table className="reports-data-table">
          <thead>
            <tr>
              <th>Employee</th><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((r) => (
              <tr key={r.id || `${r.employeeId}-${r.date}`}>
                <td><strong>{r.employeeName}</strong></td>
                <td>{r.date}</td>
                <td><span className={`reports-status-badge reports-status-${r.status === 'present' ? 'approved' : r.status === 'late' ? 'pending' : 'rejected'}`}>{r.status}</span></td>
                <td>{r.checkIn || 'N/A'}</td>
                <td>{r.checkOut || 'N/A'}</td>
                <td>{r.hoursWorked || 0}h</td>
                <td>{r.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reports-att-summary">
        <div className="reports-att-stat"><span className="reports-att-stat-value">{stats.presentToday}</span><span className="reports-att-stat-label">Present Today</span></div>
        <div className="reports-att-stat"><span className="reports-att-stat-value">{stats.absentToday}</span><span className="reports-att-stat-label">Absent Today</span></div>
        <div className="reports-att-stat"><span className="reports-att-stat-value">{stats.lateToday}</span><span className="reports-att-stat-label">Late Today</span></div>
        <div className="reports-att-stat"><span className="reports-att-stat-value">{stats.halfDayToday}</span><span className="reports-att-stat-label">Half Day</span></div>
        <div className="reports-att-stat"><span className="reports-att-stat-value">{stats.attendanceRate}%</span><span className="reports-att-stat-label">Attendance Rate</span></div>
      </div>
    </div>
  );

  const renderLeaveReport = () => (
    <div className="reports-table-section">
      <div className="reports-table-header">
        <h3><FileText size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Leave Report ({filteredLeaves.length} records)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="reports-export-btn" onClick={handleExportCSV} disabled={exporting}><FileSpreadsheet size={14} /> CSV</button>
          <button className="reports-export-btn" onClick={handleExportExcel} disabled={exporting}><File size={14} /> Excel</button>
          <button className="reports-export-btn" onClick={handleExportPDF}><Download size={14} /> PDF</button>
        </div>
      </div>

      {leaveDistribution.length > 0 && (
        <ChartCard title="Leave Distribution" subtitle="Leave requests by type">
          <DonutChart data={leaveDistribution} size={160} />
        </ChartCard>
      )}

      <div className="reports-table-wrapper" style={{ marginTop: 16 }}>
        <table className="reports-data-table">
          <thead>
            <tr>
              <th>Employee</th><th>Type</th><th>Start Date</th><th>End Date</th><th>Days</th><th>Status</th><th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave.id}>
                <td><strong>{leave.employeeName}</strong></td>
                <td><span className="reports-leave-type">{leave.leaveType}</span></td>
                <td>{leave.startDate}</td>
                <td>{leave.endDate}</td>
                <td>{leave.duration}</td>
                <td><span className={`reports-status-badge reports-status-${leave.status}`}>{leave.status}</span></td>
                <td className="reports-reason-cell">{leave.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reports-leave-summary">
        <div className="reports-leave-stat"><span className="reports-leave-stat-value" style={{ color: '#22c55e' }}>{leaveStats.approved || 0}</span><span className="reports-leave-stat-label">Approved</span></div>
        <div className="reports-leave-stat"><span className="reports-leave-stat-value" style={{ color: '#f59e0b' }}>{leaveStats.pending || 0}</span><span className="reports-leave-stat-label">Pending</span></div>
        <div className="reports-leave-stat"><span className="reports-leave-stat-value" style={{ color: '#ef4444' }}>{leaveStats.rejected || 0}</span><span className="reports-leave-stat-label">Rejected</span></div>
      </div>
    </div>
  );

  const renderPayrollReport = () => (
    <div className="reports-table-section">
      <div className="reports-table-header">
        <h3><Wallet size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Payroll Report ({filteredPayroll.length} records)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="reports-export-btn" onClick={handleExportCSV} disabled={exporting}><FileSpreadsheet size={14} /> CSV</button>
          <button className="reports-export-btn" onClick={handleExportExcel} disabled={exporting}><File size={14} /> Excel</button>
          <button className="reports-export-btn" onClick={handleExportPDF}><Download size={14} /> PDF</button>
        </div>
      </div>

      {payrollDistribution.length > 0 && (
        <ChartCard title="Payroll Distribution" subtitle="Salary breakdown by department">
          <DonutChart data={payrollDistribution} size={160} />
        </ChartCard>
      )}

      <div className="reports-table-wrapper" style={{ marginTop: 16 }}>
        <table className="reports-data-table">
          <thead>
            <tr>
              <th>Employee</th><th>Period</th><th>Base Pay</th><th>Bonus</th><th>Deductions</th><th>Net Pay</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayroll.map((rec) => {
              const emp = allEmployees.find((e) => e.id === rec.employeeId);
              return (
                <tr key={rec.id}>
                  <td><strong>{emp?.name || rec.employeeName || 'Unknown'}</strong></td>
                  <td>{rec.period}</td>
                  <td>${(rec.baseSalary || 0).toLocaleString()}</td>
                  <td className="reports-payroll-bonus">${(rec.bonus || 0).toLocaleString()}</td>
                  <td className="reports-payroll-deduction">${(rec.totalDeductions || 0).toLocaleString()}</td>
                  <td><strong>${(rec.netSalary || 0).toLocaleString()}</strong></td>
                  <td><span className={`reports-status-badge reports-status-${rec.status === 'Paid' ? 'approved' : 'pending'}`}>{rec.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="reports-payroll-summary">
        <div className="reports-payroll-stat"><span className="reports-payroll-stat-label">Total Payroll</span><span className="reports-payroll-stat-value">${(stats.totalPayrollAmount / 1000).toFixed(0)}k</span></div>
        <div className="reports-payroll-stat"><span className="reports-payroll-stat-label">Total Bonuses</span><span className="reports-payroll-stat-value" style={{ color: '#22c55e' }}>${(stats.totalBonuses / 1000).toFixed(0)}k</span></div>
        <div className="reports-payroll-stat"><span className="reports-payroll-stat-label">Total Deductions</span><span className="reports-payroll-stat-value" style={{ color: '#ef4444' }}>${(stats.totalDeductions / 1000).toFixed(0)}k</span></div>
        <div className="reports-payroll-stat"><span className="reports-payroll-stat-label">Paid Records</span><span className="reports-payroll-stat-value">{payrollStats.paidCount || 0}</span></div>
        <div className="reports-payroll-stat"><span className="reports-payroll-stat-label">Pending Records</span><span className="reports-payroll-stat-value" style={{ color: '#f59e0b' }}>{payrollStats.pendingCount || 0}</span></div>
      </div>
    </div>
  );

  const renderDepartmentReport = () => (
    <div className="reports-dept-section">
      <div className="reports-dept-grid">
        {departments.map((dept) => {
          const count = stats.deptCounts[dept.name] || 0;
          const deptEmployees = allEmployees.filter((e) => e.department === dept.name);
          const activeCount = deptEmployees.filter((e) => e.status === 'Active').length;
          const onLeaveCount = deptEmployees.filter((e) => e.status === 'On Leave').length;
          const inactiveCount = deptEmployees.filter((e) => e.status === 'Inactive').length;
          const deptIcon = { Engineering: '💻', Design: '🎨', Marketing: '📢', Sales: '💼', HR: '👥', Finance: '💰', Operations: '⚙️', Support: '🎧' };

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
                <div className="reports-dept-stat"><CheckCircle size={14} style={{ color: '#22c55e' }} /><span>{activeCount} active</span></div>
                {onLeaveCount > 0 && <div className="reports-dept-stat"><Calendar size={14} style={{ color: '#f59e0b' }} /><span>{onLeaveCount} on leave</span></div>}
                {inactiveCount > 0 && <div className="reports-dept-stat"><XCircle size={14} style={{ color: '#ef4444' }} /><span>{inactiveCount} inactive</span></div>}
              </div>
              <div className="reports-dept-bar">
                <div className="reports-dept-bar-fill" style={{ width: `${stats.totalEmp > 0 ? (count / stats.totalEmp) * 100 : 0}%`, background: dept.color || '#6366f1' }} />
              </div>
              <span className="reports-dept-pct">{stats.totalEmp > 0 ? Math.round((count / stats.totalEmp) * 100) : 0}% of total</span>
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
          <p>Comprehensive insights across all HR modules — powered by MongoDB</p>
        </div>
        <div className="reports-header-actions">
          <button className="reports-print-btn" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div className="reports-stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Total Employees', value: stats.totalEmp, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Present Today', value: stats.presentToday, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Employees On Leave', value: stats.onLeaveToday, icon: Calendar, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Total Payroll', value: `$${(stats.totalPayrollAmount / 1000).toFixed(0)}k`, icon: Wallet, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: Target, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
        ].map((card, i) => (
          <div key={i} className="reports-summary-card">
            <div className="reports-summary-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="reports-summary-info">
              <span className="reports-summary-value">{card.value}</span>
              <span className="reports-summary-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="reports-toolbar">
        <div className="reports-tabs">
          {REPORT_TYPES.map((r) => (
            <button key={r.key} className={`reports-tab ${activeReport === r.key ? 'active' : ''}`} onClick={() => setActiveReport(r.key)}>
              <r.icon size={16} /> {r.label}
            </button>
          ))}
        </div>
        <div className="reports-toolbar-right">
          <div className="reports-search-group" style={{ position: 'relative', width: 220 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, bottom: 9, color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 500, outline: 'none' }}
            />
          </div>
          <button className="reports-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filters {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="reports-filters">
          <div className="reports-filter-group">
            <label>Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => (<option key={i} value={i}>{m}</option>))}
            </select>
          </div>
          <div className="reports-filter-group">
            <label>Department</label>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="All">All Departments</option>
              {departments.map((d) => (<option key={d.name} value={d.name}>{d.name}</option>))}
            </select>
          </div>
          <div className="reports-filter-group">
            <label>Employee</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="All">All Employees</option>
              {allEmployees.map((e) => (<option key={e.id} value={e.id}>{e.name}</option>))}
            </select>
          </div>
          <div className="reports-filter-group">
            <label>Report Type</label>
            <select value={selectedReportType} onChange={(e) => setSelectedReportType(e.target.value)}>
              {REPORT_TYPE_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt === 'All' ? 'All Types' : opt}</option>))}
            </select>
          </div>
          <div className="reports-filter-group">
            <label>Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt === 'All' ? 'All Statuses' : opt}</option>))}
            </select>
          </div>
          <div className="reports-filter-group">
            <label>Date From</label>
            <input type="date" value={dateRangeStart} onChange={(e) => setDateRangeStart(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.82rem' }} />
          </div>
          <div className="reports-filter-group">
            <label>Date To</label>
            <input type="date" value={dateRangeEnd} onChange={(e) => setDateRangeEnd(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.82rem' }} />
          </div>
          <button className="reports-filter-reset" onClick={handleResetFilters}>Reset Filters</button>
        </div>
      )}

      <div className="reports-content">
        {renderReport()}
      </div>

      {viewReportData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setViewReportData(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--glass-bg, #1e1e2e)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-color, #333)', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #fff)' }}>{viewReportData.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #999)' }}>Report Details</p>
              </div>
              <button onClick={() => setViewReportData(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #999)', cursor: 'pointer', padding: 4, fontSize: '1.2rem', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Category', value: viewReportData.category },
                { label: 'Department', value: viewReportData.department },
                { label: 'Generated Date', value: viewReportData.generatedDate },
                { label: 'Status', value: viewReportData.status },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary, #999)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
                    <span className={`reports-status-badge reports-status-${item.label === 'Status' ? (item.value === 'Completed' ? 'approved' : item.value === 'Pending' ? 'pending' : 'active') : ''}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setViewReportData(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color, #333)', background: 'var(--glass-bg, #2a2a3e)', color: 'var(--text-primary, #fff)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
