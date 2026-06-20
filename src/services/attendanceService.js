import { employees } from './dummyData';

const STATUSES = ['present', 'absent', 'late', 'half-day', 'on-leave'];
const STATUS_WEIGHTS = [0.7, 0.1, 0.08, 0.05, 0.07];
const CHECK_IN_TIMES = {
  present: ['09:00', '09:01', '08:58', '09:05', '08:55'],
  late: ['09:15', '09:20', '09:25', '09:30', '09:45'],
  'half-day': ['09:00', '09:05', '09:10'],
  'on-leave': [],
  absent: [],
};
const CHECK_OUT_TIMES = {
  present: ['17:30', '17:35', '17:45', '18:00', '17:55'],
  late: ['17:30', '18:00', '18:15', '18:30'],
  'half-day': ['13:00', '13:15', '13:30'],
  'on-leave': [],
  absent: [],
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickRandom(arr, rand) {
  return arr[Math.floor(rand() * arr.length)];
}

function weightedPick(items, weights, rand) {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function generateAttendanceForEmployee(emp, rand) {
  const records = [];
  const today = new Date(2026, 5, 19);

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];
    const status = weightedPick(STATUSES, STATUS_WEIGHTS, rand);
    const checkIn = pickRandom(CHECK_IN_TIMES[status], rand);
    const checkOut = status !== 'absent' ? pickRandom(CHECK_OUT_TIMES[status], rand) : null;
    let hoursWorked = 0;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      hoursWorked = (outH + outM / 60) - (inH + inM / 60);
      if (hoursWorked < 0) hoursWorked += 24;
    }

    records.push({
      id: `${emp.id}-${dateStr}`,
      employeeId: emp.id,
      date: dateStr,
      status,
      checkIn,
      checkOut,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      overtime: hoursWorked > 8 ? Math.round((hoursWorked - 8) * 100) / 100 : 0,
      note: status === 'on-leave' ? 'Annual Leave' : status === 'late' ? 'Traffic delay' : '',
    });
  }

  return records;
}

let cachedRecords = null;

export function getAllAttendance() {
  if (cachedRecords) return cachedRecords;

  const rand = seededRandom(42);
  cachedRecords = [];

  for (const emp of employees) {
    const empRand = seededRandom(emp.id);
    cachedRecords = cachedRecords.concat(generateAttendanceForEmployee(emp, empRand));
  }

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
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const grouped = {};
  for (const r of records) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  }

  const sortedDates = Object.keys(grouped).sort().slice(-7);

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    const dayRecords = grouped[dateStr];
    const stats = getAttendanceStats(dayRecords);

    days.push({
      day: dayNames[date.getDay()],
      date: dateStr,
      present: stats.present + stats.late,
      absent: stats.absent,
      late: stats.late,
    });
  }

  return days;
}

export function getMonthlyAttendanceByDept(records, allDepartments) {
  const result = {};

  for (const dept of allDepartments) {
    const deptEmployees = employees.filter(e => e.department === dept.name);
    const deptEmpIds = deptEmployees.map(e => e.id);
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
      const emp = employees.find(e => e.id === parseInt(empId));
      return {
        employeeId: parseInt(empId),
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
