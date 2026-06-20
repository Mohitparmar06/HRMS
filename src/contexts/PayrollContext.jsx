import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { employeePayrollRecords as initialRecords, payPeriods as initialPeriods, employees } from '../services/dummyData';

const PayrollContext = createContext(null);

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildPayrollRecord(emp, periodKey, periodLabel, rand) {
  const baseSalary = emp.salary;
  const hra = Math.round(baseSalary * (0.20 + rand() * 0.10));
  const transport = Math.round(800 + rand() * 1200);
  const medical = Math.round(500 + rand() * 1000);
  const specialAllowance = Math.round(baseSalary * (0.05 + rand() * 0.08));
  const allowances = hra + transport + medical + specialAllowance;

  const bonus = rand() > 0.6 ? Math.round(baseSalary * (0.02 + rand() * 0.08)) : 0;
  const overtimePay = rand() > 0.7 ? Math.round(baseSalary * (0.01 + rand() * 0.05)) : 0;

  const pf = Math.round(baseSalary * 0.12);
  const professionalTax = 200;
  const incomeTax = Math.round(baseSalary * (0.10 + rand() * 0.10));
  const insurance = Math.round(500 + rand() * 800);
  const otherDeductions = rand() > 0.8 ? Math.round(200 + rand() * 500) : 0;
  const totalDeductions = pf + professionalTax + incomeTax + insurance + otherDeductions;

  const grossSalary = baseSalary + allowances + bonus + overtimePay;
  const netSalary = grossSalary - totalDeductions;

  return {
    employeeId: emp.id,
    employeeName: emp.name,
    employeeAvatar: emp.avatar,
    department: emp.department,
    position: emp.position,
    period: periodLabel,
    periodKey,
    baseSalary,
    allowances,
    hra,
    transport,
    medical,
    specialAllowance,
    bonus,
    overtimePay,
    grossSalary,
    pf,
    professionalTax,
    incomeTax,
    insurance,
    otherDeductions,
    totalDeductions,
    netSalary,
    status: 'Pending',
    paymentDate: null,
  };
}

function simpleRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function PayrollProvider({ children }) {
  const [records, setRecords] = useState(() => [...initialRecords]);
  const [periods] = useState(() => [...initialPeriods]);

  const updateRecord = useCallback((id, updates) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const markAsPaid = useCallback((id) => {
    const todayStr = toLocalDateStr(new Date());
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'Paid', paymentDate: todayStr } : r));
  }, []);

  const markMultipleAsPaid = useCallback((ids) => {
    const todayStr = toLocalDateStr(new Date());
    setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: 'Paid', paymentDate: todayStr } : r));
  }, []);

  const generatePayroll = useCallback((periodKey) => {
    const todayStr = toLocalDateStr(new Date());
    setRecords(prev => prev.map(r => {
      if (r.periodKey === periodKey && r.status === 'Pending') {
        return { ...r, status: 'Paid', paymentDate: todayStr };
      }
      return r;
    }));
  }, []);

  const generatePayrollForPeriod = useCallback((periodKey, periodLabel) => {
    setRecords(prev => {
      const existingIds = new Set(
        prev.filter(r => r.periodKey === periodKey).map(r => r.employeeId)
      );
      const activeEmployees = employees.filter(e => e.status !== 'Inactive' && !existingIds.has(e.id));
      const seed = periodKey.split('-').reduce((acc, v) => acc * 100 + Number(v), 0);
      const rand = simpleRand(seed);

      const newRecords = activeEmployees.map((emp, idx) => ({
        id: `PR-GEN-${periodKey.replace('-', '')}-${String(idx + 1).padStart(4, '0')}`,
        ...buildPayrollRecord(emp, periodKey, periodLabel, rand),
      }));

      return [...prev, ...newRecords];
    });
  }, []);

  const getEmployeePayroll = useCallback((employeeId) => {
    return records.filter(r => r.employeeId === employeeId);
  }, [records]);

  const getPayrollByPeriod = useCallback((periodKey) => {
    return records.filter(r => r.periodKey === periodKey);
  }, [records]);

  const getPayrollStats = useCallback(() => {
    const totalPayroll = records.reduce((sum, r) => sum + r.grossSalary, 0);
    const totalNet = records.reduce((sum, r) => sum + r.netSalary, 0);
    const totalDeductions = records.reduce((sum, r) => sum + r.totalDeductions, 0);
    const totalBonuses = records.reduce((sum, r) => sum + r.bonus, 0);
    const totalOvertime = records.reduce((sum, r) => sum + r.overtimePay, 0);
    const paidCount = records.filter(r => r.status === 'Paid').length;
    const pendingCount = records.filter(r => r.status === 'Pending').length;
    const employeeCount = new Set(records.map(r => r.employeeId)).size;
    return { totalPayroll, totalNet, totalDeductions, totalBonuses, totalOvertime, paidCount, pendingCount, employeeCount };
  }, [records]);

  const getDepartmentPayroll = useCallback(() => {
    const byDept = {};
    records.forEach(r => {
      if (!byDept[r.department]) {
        byDept[r.department] = { total: 0, count: 0, paid: 0, pending: 0 };
      }
      byDept[r.department].total += r.netSalary;
      byDept[r.department].count++;
      if (r.status === 'Paid') byDept[r.department].paid++;
      else byDept[r.department].pending++;
    });
    return byDept;
  }, [records]);

  const contextValue = useMemo(() => ({
    records,
    periods,
    updateRecord,
    markAsPaid,
    markMultipleAsPaid,
    generatePayroll,
    generatePayrollForPeriod,
    getEmployeePayroll,
    getPayrollByPeriod,
    getPayrollStats,
    getDepartmentPayroll,
  }), [
    records, periods, updateRecord, markAsPaid, markMultipleAsPaid,
    generatePayroll, generatePayrollForPeriod, getEmployeePayroll, getPayrollByPeriod,
    getPayrollStats, getDepartmentPayroll,
  ]);

  return (
    <PayrollContext.Provider value={contextValue}>
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayroll() {
  const ctx = useContext(PayrollContext);
  if (!ctx) throw new Error('usePayroll must be used within PayrollProvider');
  return ctx;
}
