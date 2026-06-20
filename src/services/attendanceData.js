import { employees, departments } from './dummyData';

const STATUSES = ['present', 'absent', 'late', 'half-day', 'on-leave'];
const STATUS_WEIGHTS = [0.70, 0.10, 0.08, 0.05, 0.07];

const CHECK_IN_TIMES = {
  present: ['08:55', '08:58', '09:00', '09:01', '09:03', '09:05'],
  late: ['09:16', '09:20', '09:25', '09:30', '09:35', '09:45'],
  'half-day': ['09:00', '09:05', '09:10'],
  'on-leave': [],
  absent: [],
};

const CHECK_OUT_TIMES = {
  present: ['17:30', '17:35', '17:45', '17:55', '18:00', '18:10'],
  late: ['17:30', '18:00', '18:15', '18:30'],
  'half-day': ['13:00', '13:15', '13:30'],
  'on-leave': [],
  absent: [],
};

const LEAVE_NOTES = [
  'Annual Leave', 'Sick Leave', 'Personal Leave', 'Medical Appointment',
  'Family Emergency', 'Work From Home', 'Bereavement Leave', 'Maternity/Paternity Leave',
];

const LATE_NOTES = [
  'Traffic delay', 'Car broke down', 'Public transport delay', 'Bad weather',
  'Family emergency', 'Doctor appointment', '',
];

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seededRandom(seed) {
  let s = Math.abs(Math.floor(seed)) || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickRandom(arr, rand) {
  if (!arr || arr.length === 0) return null;
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
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const totalDays = 180;

  for (let dayOffset = totalDays - 1; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = dayOffset === 0;
    if (isWeekend && !isToday) continue;

    const dateStr = toLocalDateStr(date);
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

    let note = '';
    if (status === 'on-leave') note = pickRandom(LEAVE_NOTES, rand) || 'Annual Leave';
    else if (status === 'late') note = pickRandom(LATE_NOTES, rand) || '';

    records.push({
      id: `${emp.id}-${dateStr}`,
      employeeId: emp.id,
      date: dateStr,
      status,
      checkIn,
      checkOut,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      overtime: hoursWorked > 8 ? Math.round((hoursWorked - 8) * 100) / 100 : 0,
      note,
    });
  }

  return records;
}

let cachedRecords = null;

export function generateAllAttendance() {
  if (cachedRecords) return cachedRecords;

  cachedRecords = [];

  for (const emp of employees) {
    const numericId = parseInt(emp.id.replace('EMP-', ''), 10);
    const empRand = seededRandom(numericId * 7919 + 42);
    cachedRecords = cachedRecords.concat(generateAttendanceForEmployee(emp, empRand));
  }

  return cachedRecords;
}

export function generateMonthlySummary() {
  const allRecords = generateAllAttendance();
  const now = new Date();
  const months = [];

  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
    const year = monthDate.getFullYear();
    const monthNum = monthDate.getMonth();

    const monthRecords = allRecords.filter(r => {
      const parts = r.date.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.getFullYear() === year && d.getMonth() === monthNum;
    });

    const total = monthRecords.length;
    const present = monthRecords.filter(r => r.status === 'present').length;
    const late = monthRecords.filter(r => r.status === 'late').length;
    const absent = monthRecords.filter(r => r.status === 'absent').length;
    const halfDay = monthRecords.filter(r => r.status === 'half-day').length;
    const onLeave = monthRecords.filter(r => r.status === 'on-leave').length;

    const totalHours = monthRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const avgHours = total > 0 ? Math.round((totalHours / total) * 100) / 100 : 0;

    months.push({
      month: monthName,
      year,
      total,
      present,
      late,
      absent,
      halfDay,
      onLeave,
      avgHours,
      presentRate: total > 0 ? Math.round(((present + late + halfDay) / total) * 100) : 0,
    });
  }

  return months;
}

export function getEmployeeById(employeeId) {
  return employees.find(e => e.id === employeeId) || null;
}

export function getDepartmentEmployees(deptName) {
  return employees.filter(e => e.department === deptName);
}

export { employees, departments };
