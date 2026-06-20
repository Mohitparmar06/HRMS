import { generateAllAttendance, generateMonthlySummary, employees, departments } from './attendanceData';

let cachedRecords = null;
let cachedMonthly = null;

export function getAllAttendance() {
  if (cachedRecords) return cachedRecords;
  cachedRecords = generateAllAttendance();
  return cachedRecords;
}

export function getEmployeeAttendance(employeeId) {
  return getAllAttendance().filter(r => r.employeeId === employeeId);
}

export function getAttendanceByDate(dateStr) {
  return getAllAttendance().filter(r => r.date === dateStr);
}

export function getAttendanceStats(records) {
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
}

export function getWeeklyTrend(records) {
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
}

export function getMonthlyAttendanceByDept(records, allDepartments) {
  const result = {};

  for (const dept of allDepartments) {
    const deptEmpIds = employees.filter(e => e.department === dept.name).map(e => e.id);
    const deptRecords = records.filter(r => deptEmpIds.includes(r.employeeId));
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
}

export function getMonthlySummary() {
  if (cachedMonthly) return cachedMonthly;
  cachedMonthly = generateMonthlySummary();
  return cachedMonthly;
}

export function getOvertimeSummary(records) {
  const byEmployee = {};

  for (const r of records) {
    if (r.overtime > 0) {
      if (!byEmployee[r.employeeId]) byEmployee[r.employeeId] = { total: 0, days: 0 };
      byEmployee[r.employeeId].total += r.overtime;
      byEmployee[r.employeeId].days++;
    }
  }

  return Object.entries(byEmployee)
    .map(([empId, data]) => {
      const emp = employees.find(e => e.id === empId);
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
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
