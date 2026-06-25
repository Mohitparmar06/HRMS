import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import API from '../services/api';

const AttendanceContext = createContext(null);

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function computeHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  let hours = (outDate - inDate) / (1000 * 60 * 60);
  if (hours < 0) hours += 24;
  return Math.round(hours * 100) / 100;
}

function computeStatus(checkIn, checkOut) {
  if (!checkIn) return 'absent';
  if (!checkOut) return 'present';
  const hours = computeHours(checkIn, checkOut);
  if (hours < 4) return 'half-day';
  const hour = new Date(checkIn).getHours();
  if (hour > 10) return 'late';
  return 'present';
}

function transformRecord(record, employeeMap) {
  const emp = record.employeeId;
  const empObj = typeof emp === 'object' ? emp : null;
  const frontendId = empObj?.employeeId || '';
  const empData = employeeMap[frontendId] || {};

  const checkInDate = record.checkIn ? new Date(record.checkIn) : null;
  const status = computeStatus(record.checkIn, record.checkOut);
  const hoursWorked = computeHours(record.checkIn, record.checkOut);

  return {
    _id: record._id,
    id: record._id,
    employeeId: frontendId,
    date: checkInDate ? toLocalDateStr(checkInDate) : toLocalDateStr(new Date(record.createdAt)),
    status,
    checkIn: formatTime(record.checkIn),
    checkOut: formatTime(record.checkOut),
    hoursWorked,
    overtime: hoursWorked > 8 ? Math.round((hoursWorked - 8) * 100) / 100 : 0,
    note: '',
    firstName: empData.firstName || empObj?.fullName?.split(' ')[0] || '',
    lastName: empData.lastName || empObj?.fullName?.split(' ').slice(1).join(' ') || '',
    department: empData.department || empObj?.department || '',
    employeeName: empData.name || empObj?.fullName || '',
    designation: empData.position || empObj?.designation || '',
  };
}

export function AttendanceProvider({ children, employees = [], onCheckIn, onCheckOut }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [todayCheckOut, setTodayCheckOut] = useState(null);

  const employeeMap = useMemo(() => {
    const map = {};
    for (const emp of employees) {
      map[emp.id] = emp;
    }
    return map;
  }, [employees]);

  const employeeMongoMap = useMemo(() => {
    const map = {};
    for (const emp of employees) {
      if (emp._id) map[emp.id] = emp._id;
    }
    return map;
  }, [employees]);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await API.get('/attendance');
      const records = res.data.attendance || [];
      const transformed = records.map(r => transformRecord(r, employeeMap));
      setAttendanceRecords(transformed);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  }, [employeeMap]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendance();
    }
  }, [fetchAttendance, employees.length]);

  useEffect(() => {
    const today = toLocalDateStr(new Date());
    const todayRec = attendanceRecords.find(r => r.date === today && r.employeeId);
    if (todayRec) {
      setTodayCheckIn(todayRec.checkIn);
      setTodayCheckOut(todayRec.checkOut);
    } else {
      setTodayCheckIn(null);
      setTodayCheckOut(null);
    }
  }, [attendanceRecords]);

  const getEmployeeRecords = useCallback(
    (employeeId) => attendanceRecords.filter(r => r.employeeId === employeeId),
    [attendanceRecords]
  );

  const getDateRecords = useCallback(
    (dateStr) => attendanceRecords.filter(r => r.date === dateStr),
    [attendanceRecords]
  );

  const getRecord = useCallback(
    (employeeId, dateStr) => attendanceRecords.find(r => r.employeeId === employeeId && r.date === dateStr),
    [attendanceRecords]
  );

  const updateRecord = useCallback(async (employeeId, dateStr, updates) => {
    const record = attendanceRecords.find(r => r.employeeId === employeeId && r.date === dateStr);
    if (!record) return;

    const timeToDateTime = (dateStr, timeStr) => {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date(dateStr + 'T00:00:00');
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    };

    const payload = {};
    if (updates.status) {
      payload.status = (updates.status === 'present' || updates.status === 'late') ? 'Present' : 'Absent';
    }
    if (updates.checkIn !== undefined) {
      payload.checkIn = timeToDateTime(dateStr, updates.checkIn);
    }
    if (updates.checkOut !== undefined) {
      payload.checkOut = timeToDateTime(dateStr, updates.checkOut);
    }

    try {
      await API.put(`/attendance/${record._id}`, payload);
      await fetchAttendance();
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  }, [attendanceRecords, fetchAttendance]);

  const deleteRecord = useCallback(async (employeeId, dateStr) => {
    const record = attendanceRecords.find(r => r.employeeId === employeeId && r.date === dateStr);
    if (!record) return;

    try {
      await API.delete(`/attendance/${record._id}`);
      await fetchAttendance();
    } catch (error) {
      console.error('Failed to delete attendance:', error);
    }
  }, [attendanceRecords, fetchAttendance]);

  const markAttendance = useCallback(async (employeeId, dateStr, status, checkInTime, checkOutTime, note) => {
    const existing = attendanceRecords.find(r => r.employeeId === employeeId && r.date === dateStr);
    if (existing) {
      await updateRecord(employeeId, dateStr, { status, checkIn: checkInTime, checkOut: checkOutTime });
    }
  }, [attendanceRecords, updateRecord]);

  const checkIn = useCallback(async (employeeId) => {
    const mongoId = employeeMongoMap[employeeId];
    if (!mongoId) {
      console.error('Employee not found for ID:', employeeId);
      return;
    }

    try {
      const res = await API.post('/attendance/checkin', { employeeId: mongoId });
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setTodayCheckIn(time);
      setTodayCheckOut(null);
      await fetchAttendance();

      if (onCheckIn) {
        const emp = employeeMap[employeeId];
        onCheckIn({
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : employeeId,
          employeeId,
          time,
        });
      }
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  }, [employeeMongoMap, employeeMap, fetchAttendance, onCheckIn]);

  const checkOut = useCallback(async (employeeId) => {
    if (!todayCheckIn) return;

    const today = toLocalDateStr(new Date());
    const todayRec = attendanceRecords.find(r => r.date === today && r.employeeId === employeeId);
    if (!todayRec) return;

    try {
      await API.put(`/attendance/checkout/${todayRec._id}`);
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setTodayCheckOut(time);
      await fetchAttendance();

      if (onCheckOut) {
        const emp = employeeMap[employeeId];
        const hours = computeHours(todayRec.checkIn, time);
        onCheckOut({
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : employeeId,
          employeeId,
          time,
          hours,
        });
      }
    } catch (error) {
      console.error('Failed to check out:', error);
    }
  }, [todayCheckIn, attendanceRecords, employeeMap, fetchAttendance, onCheckOut]);

  const getAttendanceStats = useCallback((records) => {
    const total = records.length;
    if (total === 0) return { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0, total: 0, presentRate: 0, avgHours: 0 };

    const counts = { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0 };
    let totalHours = 0;
    let hoursCount = 0;

    for (const r of records) {
      switch (r.status) {
        case 'present': counts.present++; break;
        case 'absent': counts.absent++; break;
        case 'late': counts.late++; break;
        case 'half-day': counts.halfDay++; break;
        case 'on-leave': counts.onLeave++; break;
      }
      if (r.hoursWorked > 0) {
        totalHours += r.hoursWorked;
        hoursCount++;
      }
    }

    return {
      ...counts,
      total,
      presentRate: Math.round(((counts.present + counts.late + counts.halfDay) / total) * 100),
      avgHours: hoursCount > 0 ? Math.round((totalHours / hoursCount) * 100) / 100 : 0,
    };
  }, []);

  const getWeeklyTrend = useCallback((records) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped = {};

    for (const r of records) {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    }

    const sortedDates = Object.keys(grouped).sort().slice(-7);

    return sortedDates.map(dateStr => {
      const parts = dateStr.split('-').map(Number);
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayRecords = grouped[dateStr];
      const stats = getAttendanceStats(dayRecords);

      return {
        day: dayNames[date.getDay()],
        date: dateStr,
        present: stats.present + stats.late,
        absent: stats.absent,
        late: stats.late,
      };
    });
  }, [getAttendanceStats]);

  const getMonthlyAttendanceByDept = useCallback((departments) => {
    const result = {};

    for (const dept of departments) {
      const deptRecords = attendanceRecords.filter(r => r.department === dept.name);
      const stats = getAttendanceStats(deptRecords);

      result[dept.name] = {
        total: stats.total,
        presentRate: stats.presentRate,
        avgHours: stats.avgHours,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
      };
    }

    return result;
  }, [attendanceRecords, getAttendanceStats]);

  const getMonthlySummary = useCallback(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthRecords = attendanceRecords.filter(r => r.date.startsWith(monthStr));
      const stats = getAttendanceStats(monthRecords);

      months.push({
        month: monthNames[d.getMonth()],
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        presentRate: stats.presentRate,
      });
    }

    return months;
  }, [attendanceRecords, getAttendanceStats]);

  const getOvertimeSummary = useCallback(() => {
    const byEmployee = {};

    for (const r of attendanceRecords) {
      if (r.overtime > 0) {
        if (!byEmployee[r.employeeId]) byEmployee[r.employeeId] = { total: 0, days: 0 };
        byEmployee[r.employeeId].total += r.overtime;
        byEmployee[r.employeeId].days++;
      }
    }

    return Object.entries(byEmployee)
      .map(([empId, data]) => {
        const emp = employeeMap[empId];
        return {
          employeeId: empId,
          name: emp ? `${emp.firstName} ${emp.lastName}` : `Employee ${empId}`,
          department: emp ? emp.department : '',
          totalOvertime: Math.round(data.total * 100) / 100,
          days: data.days,
          avgOvertime: Math.round((data.total / data.days) * 100) / 100,
        };
      })
      .sort((a, b) => b.totalOvertime - a.totalOvertime);
  }, [attendanceRecords, employeeMap]);

  const contextValue = useMemo(() => ({
    attendanceRecords,
    todayCheckIn,
    todayCheckOut,
    getEmployeeRecords,
    getDateRecords,
    getRecord,
    updateRecord,
    deleteRecord,
    markAttendance,
    checkIn,
    checkOut,
    getStats: getAttendanceStats,
    getWeeklyTrend,
    getMonthlyAttendanceByDept,
    getMonthlySummary,
    getOvertimeSummary,
  }), [
    attendanceRecords, todayCheckIn, todayCheckOut,
    getEmployeeRecords, getDateRecords, getRecord,
    updateRecord, deleteRecord, markAttendance, checkIn, checkOut,
    getAttendanceStats, getWeeklyTrend, getMonthlyAttendanceByDept,
    getMonthlySummary, getOvertimeSummary,
  ]);

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider');
  return ctx;
}
