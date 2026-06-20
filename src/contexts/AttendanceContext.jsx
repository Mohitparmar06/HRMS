import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  getAllAttendance,
  getEmployeeAttendance,
  getAttendanceByDate,
  getAttendanceStats,
  getWeeklyTrend,
  getMonthlyAttendanceByDept,
  getOvertimeSummary,
} from '../services/attendanceService';
import { employees } from '../services/dummyData';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [attendanceRecords, setAttendanceRecords] = useState(() => getAllAttendance());
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [todayCheckOut, setTodayCheckOut] = useState(null);

  const getEmployeeRecords = useCallback(
    (employeeId) => getEmployeeAttendance(employeeId).concat(
      attendanceRecords.filter(r => r.employeeId === employeeId)
    ),
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

  const updateRecord = useCallback((employeeId, dateStr, updates) => {
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.employeeId === employeeId && r.date === dateStr);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      }
      return prev;
    });
  }, []);

  const markAttendance = useCallback((employeeId, dateStr, status, checkIn, checkOut, note) => {
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.employeeId === employeeId && r.date === dateStr);
      const newRecord = {
        id: `${employeeId}-${dateStr}`,
        employeeId,
        date: dateStr,
        status,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        hoursWorked: checkIn && checkOut ? calculateHours(checkIn, checkOut) : 0,
        overtime: 0,
        note: note || '',
      };

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...newRecord };
        return updated;
      }
      return [...prev, newRecord];
    });
  }, []);

  const checkIn = useCallback((employeeId) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    setTodayCheckIn(time);
    setTodayCheckOut(null);
    markAttendance(employeeId, today, 'present', time, null, '');
  }, [markAttendance]);

  const checkOut = useCallback((employeeId) => {
    if (!todayCheckIn) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    setTodayCheckOut(time);
    const hours = calculateHours(todayCheckIn, time);
    const status = hours < 4 ? 'half-day' : 'present';
    markAttendance(employeeId, today, status, todayCheckIn, time, '');
  }, [todayCheckIn, markAttendance]);

  const contextValue = useMemo(() => ({
    attendanceRecords,
    todayCheckIn,
    todayCheckOut,
    getEmployeeRecords,
    getDateRecords,
    getRecord,
    updateRecord,
    markAttendance,
    checkIn,
    checkOut,
    getStats: getAttendanceStats,
    getWeeklyTrend,
    getMonthlyAttendanceByDept: (depts) => getMonthlyAttendanceByDept(attendanceRecords, depts),
    getOvertimeSummary: () => getOvertimeSummary(attendanceRecords),
  }), [
    attendanceRecords, todayCheckIn, todayCheckOut,
    getEmployeeRecords, getDateRecords, getRecord,
    updateRecord, markAttendance, checkIn, checkOut,
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

function calculateHours(checkIn, checkOut) {
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  let hours = (outH + outM / 60) - (inH + inM / 60);
  if (hours < 0) hours += 24;
  return Math.round(hours * 100) / 100;
}
