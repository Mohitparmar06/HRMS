import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import API from '../services/api';

const PayrollContext = createContext(null);

const PAY_PERIODS = [
  { key: '2026-01', label: 'January 2026' },
  { key: '2026-02', label: 'February 2026' },
  { key: '2026-03', label: 'March 2026' },
  { key: '2026-04', label: 'April 2026' },
  { key: '2026-05', label: 'May 2026' },
  { key: '2026-06', label: 'June 2026' },
  { key: '2026-07', label: 'July 2026' },
  { key: '2026-08', label: 'August 2026' },
  { key: '2026-09', label: 'September 2026' },
  { key: '2026-10', label: 'October 2026' },
  { key: '2026-11', label: 'November 2026' },
  { key: '2026-12', label: 'December 2026' },
];

function toLocalDateStr(d) {
  if (!d) return null;
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function PayrollProvider({ children }) {
  const [records, setRecords] = useState([]);

  const fetchPayrolls = useCallback(async () => {
    const token = localStorage.getItem("dayflow-token");
    if (!token) return;
    try {
      const res = await API.get('/payrolls');
      setRecords(res.data.payrolls || []);
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
    }
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const addRecord = useCallback(async (record) => {
    try {
      const res = await API.post('/payrolls', record);
      if (res.data.success) {
        setRecords(prev => [res.data.payroll, ...prev]);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create payroll';
      console.error('Failed to create payroll:', msg);
      return { success: false, message: msg };
    }
  }, []);

  const updateRecord = useCallback(async (id, updates) => {
    try {
      const res = await API.put(`/payrolls/${id}`, updates);
      if (res.data.success) {
        setRecords(prev => prev.map(r => r.id === id ? res.data.payroll : r));
      }
    } catch (error) {
      console.error('Failed to update payroll:', error);
    }
  }, []);

  const deleteRecord = useCallback(async (id) => {
    try {
      await API.delete(`/payrolls/${id}`);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete payroll:', error);
    }
  }, []);

  const markAsPaid = useCallback(async (id) => {
    const todayStr = toLocalDateStr(new Date());
    try {
      const res = await API.put(`/payrolls/${id}`, { status: 'Paid', paymentDate: todayStr });
      if (res.data.success) {
        setRecords(prev => prev.map(r => r.id === id ? res.data.payroll : r));
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  }, []);

  const markMultipleAsPaid = useCallback(async (ids) => {
    const todayStr = toLocalDateStr(new Date());
    try {
      await Promise.all(
        ids.map(id => API.put(`/payrolls/${id}`, { status: 'Paid', paymentDate: todayStr }))
      );
      await fetchPayrolls();
    } catch (error) {
      console.error('Failed to mark multiple as paid:', error);
    }
  }, [fetchPayrolls]);

  const getEmployeePayroll = useCallback((employeeId) => {
    return records.filter(r => r.employeeId === employeeId);
  }, [records]);

  const getPayrollStats = useCallback(() => {
    const totalPayroll = records.reduce((sum, r) => sum + (r.grossSalary || 0), 0);
    const totalNet = records.reduce((sum, r) => sum + (r.netSalary || 0), 0);
    const totalDeductions = records.reduce((sum, r) => sum + (r.totalDeductions || 0), 0);
    const totalBonuses = records.reduce((sum, r) => sum + (r.bonus || 0), 0);
    const totalOvertime = records.reduce((sum, r) => sum + (r.overtimePay || 0), 0);
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
      byDept[r.department].total += r.netSalary || 0;
      byDept[r.department].count++;
      if (r.status === 'Paid') byDept[r.department].paid++;
      else byDept[r.department].pending++;
    });
    return byDept;
  }, [records]);

  const contextValue = useMemo(() => ({
    records,
    periods: PAY_PERIODS,
    addRecord,
    updateRecord,
    deleteRecord,
    markAsPaid,
    markMultipleAsPaid,
    getEmployeePayroll,
    getPayrollStats,
    getDepartmentPayroll,
    fetchPayrolls,
  }), [
    records, addRecord, updateRecord, deleteRecord, markAsPaid, markMultipleAsPaid,
    getEmployeePayroll, getPayrollStats, getDepartmentPayroll, fetchPayrolls,
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
