import { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, MinusCircle, CalendarOff,
  Search, Filter, Download, BarChart2, Calendar, Users, Clock,
  ChevronDown, ChevronUp, Eye, Edit3, Trash2, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useDepartments } from '../../contexts/DepartmentContext';
import AttendanceCalendar from '../../components/Attendance/AttendanceCalendar';
import AttendanceDetailModal from '../../components/Attendance/AttendanceDetailModal';
import AttendanceEditModal from '../../components/Attendance/AttendanceEditModal';
import AttendanceDeleteDialog from '../../components/Attendance/AttendanceDeleteDialog';
import AttendanceStatCard from '../../components/Attendance/AttendanceStatCard';

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

const DEPT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminAttendance() {
  const { attendanceRecords, getStats, getWeeklyTrend, getMonthlyAttendanceByDept, getMonthlySummary } = useAttendance();
  const { employees } = useEmployees();
  const { departments } = useDepartments();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateStr(new Date()));
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showCalendar, setShowCalendar] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const today = toLocalDateStr(new Date());

  const filteredRecords = useMemo(() => {
    let recs = [...attendanceRecords];

    if (search) {
      const q = search.toLowerCase();
      recs = recs.filter(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        if (!emp) return false;
        return `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
               emp.department?.toLowerCase().includes(q) ||
               emp.employeeId?.toLowerCase().includes(q);
      });
    }

    if (statusFilter !== 'all') {
      recs = recs.filter(r => r.status === statusFilter);
    }

    if (deptFilter !== 'all') {
      const deptEmpIds = employees.filter(e => e.department === deptFilter).map(e => e.id);
      recs = recs.filter(r => deptEmpIds.includes(r.employeeId));
    }

    recs.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortField === 'employee') {
        const empA = employees.find(e => e.id === a.employeeId);
        const empB = employees.find(e => e.id === b.employeeId);
        cmp = `${empA?.firstName} ${empA?.lastName}`.localeCompare(`${empB?.firstName} ${empB?.lastName}`);
      }
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'hours') cmp = a.hoursWorked - b.hoursWorked;
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return recs;
  }, [attendanceRecords, search, statusFilter, deptFilter, sortField, sortDir]);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, page]);

  const totalPages = Math.ceil(filteredRecords.length / perPage);

  const overallStats = useMemo(() => getStats(attendanceRecords), [attendanceRecords, getStats]);
  const todayStats = useMemo(() => {
    const todayRecs = attendanceRecords.filter(r => r.date === today);
    return getStats(todayRecs);
  }, [attendanceRecords, today, getStats]);

  const weeklyTrend = useMemo(() => getWeeklyTrend(attendanceRecords), [attendanceRecords]);
  const deptAttendance = useMemo(() => getMonthlyAttendanceByDept(departments), [departments, getMonthlyAttendanceByDept]);
  const monthlySummary = useMemo(() => getMonthlySummary(), [getMonthlySummary]);

  const dateRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  const dateStats = useMemo(() => getStats(dateRecords), [dateRecords]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  const openDetail = (record) => {
    const emp = employees.find(e => e.id === record.employeeId);
    setDetailRecord(record);
    setDetailEmployee(emp);
  };

  const openEdit = (record) => {
    const emp = employees.find(e => e.id === record.employeeId);
    setEditRecord(record);
    setEditEmployee(emp);
  };

  const openDelete = (record) => {
    const emp = employees.find(e => e.id === record.employeeId);
    setDeleteRecord(record);
    setDeleteEmployee(emp);
  };

  const handleExport = () => {
    const headers = ['Date', 'Employee', 'Department', 'Status', 'Check In', 'Check Out', 'Hours', 'Overtime'];
    const rows = filteredRecords.map(r => {
      const emp = employees.find(e => e.id === r.employeeId);
      return [r.date, `${emp?.firstName} ${emp?.lastName}`, emp?.department, r.status, r.checkIn || '', r.checkOut || '', r.hoursWorked, r.overtime];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxPresent = Math.max(...Object.values(deptAttendance).map(d => d.present), 1);

  return (
    <div className="admin-attendance">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track and manage employee attendance across the organization</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="att-stats-grid">
        <AttendanceStatCard
          label="Today's Attendance"
          value={todayStats.present + todayStats.halfDay}
          icon={CheckCircle}
          color="var(--success)"
        />
        <AttendanceStatCard
          label="Absent Today"
          value={todayStats.absent}
          icon={XCircle}
          color="var(--danger)"
        />
        <AttendanceStatCard
          label="Late Today"
          value={todayStats.late}
          icon={AlertTriangle}
          color="var(--warning)"
        />
        <AttendanceStatCard
          label="Present Rate"
          value={`${overallStats.presentRate}%`}
          icon={TrendingUp}
          color="var(--info)"
        />
        <AttendanceStatCard
          label="Avg Working Hours"
          value={`${overallStats.avgHours}h`}
          icon={Clock}
          color="var(--primary)"
        />
      </div>

      <div className="att-tabs">
        <button className={`att-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <BarChart2 size={16} /> Overview
        </button>
        <button className={`att-tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
          <FileText size={16} /> Records
        </button>
        <button className={`att-tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <Calendar size={16} /> Calendar
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="att-overview-grid">
          <div className="att-chart-card">
            <h3 className="att-chart-title">Weekly Attendance Trend</h3>
            <div className="att-bar-chart">
              {weeklyTrend.map((day, i) => {
                const total = day.present + day.absent + day.late;
                const maxH = Math.max(total, 1);
                return (
                  <div key={i} className="att-bar-group">
                    <div className="att-bar-stack">
                      <div className="att-bar present" style={{ height: `${(day.present / maxH) * 100}%` }} title={`Present: ${day.present}`} />
                      <div className="att-bar late" style={{ height: `${(day.late / maxH) * 100}%` }} title={`Late: ${day.late}`} />
                      <div className="att-bar absent" style={{ height: `${(day.absent / maxH) * 100}%` }} title={`Absent: ${day.absent}`} />
                    </div>
                    <span className="att-bar-label">{day.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="att-bar-legend">
              <span><span className="legend-dot present" /> Present</span>
              <span><span className="legend-dot late" /> Late</span>
              <span><span className="legend-dot absent" /> Absent</span>
            </div>
          </div>

          <div className="att-chart-card">
            <h3 className="att-chart-title">Department Attendance Rate</h3>
            <div className="att-dept-bars">
              {Object.entries(deptAttendance).map(([name, data], i) => (
                <div key={name} className="att-dept-row">
                  <span className="att-dept-name">{name}</span>
                  <div className="att-dept-bar-wrap">
                    <div
                      className="att-dept-bar"
                      style={{
                        width: `${data.presentRate}%`,
                        background: DEPT_COLORS[i % DEPT_COLORS.length],
                      }}
                    />
                    <span className="att-dept-pct">{data.presentRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="att-chart-card">
            <h3 className="att-chart-title">Today's Status Breakdown</h3>
            <div className="att-donut-chart">
              {[
                { label: 'Present', value: todayStats.present, color: 'var(--success)' },
                { label: 'Late', value: todayStats.late, color: 'var(--warning)' },
                { label: 'Half Day', value: todayStats.halfDay, color: 'var(--info)' },
                { label: 'On Leave', value: todayStats.onLeave, color: '#a78bfa' },
                { label: 'Absent', value: todayStats.absent, color: 'var(--danger)' },
              ].map((item) => (
                <div key={item.label} className="att-donut-row">
                  <span className="att-donut-dot" style={{ background: item.color }} />
                  <span className="att-donut-label">{item.label}</span>
                  <span className="att-donut-value">{item.value}</span>
                  <div className="att-donut-bar-wrap">
                    <div className="att-donut-bar" style={{ width: `${todayStats.total > 0 ? (item.value / todayStats.total) * 100 : 0}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="att-chart-card att-chart-card-full">
            <h3 className="att-chart-title">Monthly Attendance Overview</h3>
            <div className="att-monthly-chart">
              {monthlySummary.map((m, i) => {
                const maxPresent = Math.max(...monthlySummary.map(x => x.present), 1);
                return (
                  <div key={i} className="att-monthly-col">
                    <div className="att-monthly-bars">
                      <div
                        className="att-monthly-bar present"
                        style={{ height: `${(m.present / maxPresent) * 100}%` }}
                        title={`Present: ${m.present}`}
                      />
                      <div
                        className="att-monthly-bar late"
                        style={{ height: `${(m.late / maxPresent) * 100}%` }}
                        title={`Late: ${m.late}`}
                      />
                      <div
                        className="att-monthly-bar absent"
                        style={{ height: `${(m.absent / maxPresent) * 100}%` }}
                        title={`Absent: ${m.absent}`}
                      />
                    </div>
                    <span className="att-monthly-label">{m.month}</span>
                    <span className="att-monthly-rate">{m.presentRate}%</span>
                  </div>
                );
              })}
            </div>
            <div className="att-bar-legend">
              <span><span className="legend-dot present" /> Present</span>
              <span><span className="legend-dot late" /> Late</span>
              <span><span className="legend-dot absent" /> Absent</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'table' && (
        <div className="att-table-section">
          <div className="att-filters">
            <div className="att-search-wrap">
              <Search size={18} className="att-search-icon" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="att-search"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="att-filter-select"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="on-leave">On Leave</option>
            </select>
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
              className="att-filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="att-table-wrap">
            <table className="att-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('employee')} className="sortable">
                    Employee <SortIcon field="employee" />
                  </th>
                  <th>Department</th>
                  <th onClick={() => toggleSort('date')} className="sortable">
                    Date <SortIcon field="date" />
                  </th>
                  <th onClick={() => toggleSort('status')} className="sortable">
                    Status <SortIcon field="status" />
                  </th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th onClick={() => toggleSort('hours')} className="sortable">
                    Hours <SortIcon field="hours" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map(record => {
                  const emp = employees.find(e => e.id === record.employeeId);
                  if (!emp) return null;
                  const StatusIcon = STATUS_ICONS[record.status];
                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="att-emp-cell">
                          <div className="att-emp-avatar" style={{ background: DEPT_COLORS[parseInt(emp.id.replace('EMP-', ''), 10) % DEPT_COLORS.length] }}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <span className="att-emp-name">{emp.firstName} {emp.lastName}</span>
                            <span className="att-emp-id">{emp.employeeId}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="att-dept-badge">{emp.department}</span></td>
                      <td>{new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>
                        <span className="att-status-badge" style={{ color: STATUS_COLORS[record.status], background: `${STATUS_COLORS[record.status]}15` }}>
                          <StatusIcon size={14} />
                          {record.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                      <td><span className="att-time">{record.checkIn || '--'}</span></td>
                      <td><span className="att-time">{record.checkOut || '--'}</span></td>
                      <td><span className="att-hours">{record.hoursWorked > 0 ? `${record.hoursWorked}h` : '--'}</span></td>
                      <td>
                        <div className="att-action-btns">
                          <button className="att-action-btn" title="View" onClick={() => openDetail(record)}>
                            <Eye size={16} />
                          </button>
                          <button className="att-action-btn edit" title="Edit" onClick={() => openEdit(record)}>
                            <Edit3 size={16} />
                          </button>
                          <button className="att-action-btn delete" title="Delete" onClick={() => openDelete(record)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="att-pagination">
            <span className="att-page-info">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredRecords.length)} of {filteredRecords.length}
            </span>
            <div className="att-page-buttons">
              <button className="att-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} className={`att-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                );
              })}
              <button className="att-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="att-calendar-section">
          <div className="att-calendar-layout">
            <div className="att-calendar-left">
              <AttendanceCalendar
                records={attendanceRecords}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>
            <div className="att-calendar-right">
              <div className="att-date-info">
                <h3>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                <div className="att-date-stats">
                  <span className="att-date-stat present"><CheckCircle size={14} /> {dateStats.present} Present</span>
                  <span className="att-date-stat absent"><XCircle size={14} /> {dateStats.absent} Absent</span>
                  <span className="att-date-stat late"><AlertTriangle size={14} /> {dateStats.late} Late</span>
                  <span className="att-date-stat leave"><CalendarOff size={14} /> {dateStats.onLeave} Leave</span>
                </div>
              </div>
              <div className="att-date-list">
                {dateRecords.length === 0 && (
                  <p className="att-no-records">No attendance records for this date</p>
                )}
                {dateRecords.slice(0, 10).map(record => {
                  const emp = employees.find(e => e.id === record.employeeId);
                  if (!emp) return null;
                  const StatusIcon = STATUS_ICONS[record.status];
                  return (
                    <div key={record.id} className="att-date-record" onClick={() => openDetail(record)}>
                      <div className="att-date-record-left">
                        <div className="att-emp-avatar small" style={{ background: DEPT_COLORS[parseInt(emp.id.replace('EMP-', ''), 10) % DEPT_COLORS.length] }}>
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <span className="att-emp-name">{emp.firstName} {emp.lastName}</span>
                          <span className="att-emp-dept">{emp.department}</span>
                        </div>
                      </div>
                      <span className="att-status-badge small" style={{ color: STATUS_COLORS[record.status] }}>
                        <StatusIcon size={12} />
                        {record.checkIn || 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {detailRecord && (
        <AttendanceDetailModal
          record={detailRecord}
          employee={detailEmployee}
          onClose={() => { setDetailRecord(null); setDetailEmployee(null); }}
        />
      )}

      {editRecord && (
        <AttendanceEditModal
          record={editRecord}
          employee={editEmployee}
          onClose={() => { setEditRecord(null); setEditEmployee(null); }}
        />
      )}

      {deleteRecord && (
        <AttendanceDeleteDialog
          record={deleteRecord}
          employee={deleteEmployee}
          onClose={() => { setDeleteRecord(null); setDeleteEmployee(null); }}
        />
      )}
    </div>
  );
}
