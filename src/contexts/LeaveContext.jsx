import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import API from '../services/api';

const LeaveContext = createContext(null);

const LEAVE_BALANCE = {
  'Casual Leave': 12,
  'Sick Leave': 10,
  'Earned Leave': 15,
  'Maternity Leave': 26,
  'Paternity Leave': 10,
  'Work From Home': 20,
};

function toLocalDateStr(d) {
  if (!d) return null;
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function LeaveProvider({ children }) {
  const [leaveRecords, setLeaveRecords] = useState([]);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await API.get('/leaves');
      setLeaveRecords(res.data.leaves || []);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const addLeaveRequest = useCallback(async (request) => {
    try {
      const payload = {
        employeeId: request.mongoId,
        leaveType: request.leaveType,
        startDate: request.startDate,
        endDate: request.endDate,
        duration: request.duration,
        reason: request.reason,
      };
      const res = await API.post('/leaves', payload);
      if (res.data.success) {
        setLeaveRecords(prev => [res.data.leave, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add leave request:', error);
    }
  }, []);

  const updateLeaveRequest = useCallback((id, updates) => {
    setLeaveRecords(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }, []);

  const approveLeave = useCallback(async (id, approvedBy) => {
    try {
      const res = await API.put(`/leaves/approve/${id}`, { approvedBy: approvedBy || 'Admin' });
      if (res.data.success) {
        setLeaveRecords(prev =>
          prev.map(r => r.id === id ? res.data.leave : r)
        );
      }
    } catch (error) {
      console.error('Failed to approve leave:', error);
    }
  }, []);

  const rejectLeave = useCallback(async (id, rejectionReason, rejectedBy) => {
    try {
      const res = await API.put(`/leaves/reject/${id}`, {
        rejectionReason: rejectionReason || '',
        rejectedBy: rejectedBy || 'Admin',
      });
      if (res.data.success) {
        setLeaveRecords(prev =>
          prev.map(r => r.id === id ? res.data.leave : r)
        );
      }
    } catch (error) {
      console.error('Failed to reject leave:', error);
    }
  }, []);

  const cancelLeave = useCallback(async (id) => {
    try {
      const res = await API.put(`/leaves/cancel/${id}`);
      if (res.data.success) {
        setLeaveRecords(prev =>
          prev.map(r => r.id === id ? res.data.leave : r)
        );
      }
    } catch (error) {
      console.error('Failed to cancel leave:', error);
    }
  }, []);

  const deleteLeaveRequest = useCallback(async (id) => {
    try {
      await API.delete(`/leaves/${id}`);
      setLeaveRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete leave:', error);
    }
  }, []);

  const getEmployeeLeaves = useCallback((employeeId) => {
    return leaveRecords.filter(r => r.employeeId === employeeId);
  }, [leaveRecords]);

  const getLeaveBalance = useCallback((employeeId) => {
    const empLeaves = leaveRecords.filter(
      r => r.employeeId === employeeId && (r.status === 'Approved' || r.status === 'Pending')
    );
    const balance = {};
    for (const [type, total] of Object.entries(LEAVE_BALANCE)) {
      const used = empLeaves
        .filter(r => r.leaveType === type)
        .reduce((sum, r) => sum + (r.duration || 0), 0);
      balance[type] = { total, used, remaining: Math.max(total - used, 0) };
    }
    return balance;
  }, [leaveRecords]);

  const getLeaveStats = useCallback(() => {
    const today = new Date();
    const todayStr = toLocalDateStr(today);
    const total = leaveRecords.length;
    const pending = leaveRecords.filter(r => r.status === 'Pending').length;
    const approved = leaveRecords.filter(r => r.status === 'Approved').length;
    const rejected = leaveRecords.filter(r => r.status === 'Rejected').length;
    const cancelled = leaveRecords.filter(r => r.status === 'Cancelled').length;
    const totalDays = leaveRecords
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + (r.duration || 0), 0);
    const approvedToday = leaveRecords.filter(
      r => r.status === 'Approved' && r.approvedDate === todayStr
    ).length;
    const rejectedToday = leaveRecords.filter(
      r => r.status === 'Rejected' && r.approvedDate === todayStr
    ).length;
    const onLeaveToday = leaveRecords.filter(r => {
      if (r.status !== 'Approved') return false;
      return r.startDate <= todayStr && r.endDate >= todayStr;
    }).length;
    return { total, pending, approved, rejected, cancelled, totalDays, approvedToday, rejectedToday, onLeaveToday };
  }, [leaveRecords]);

  const getLeaveByType = useCallback(() => {
    const byType = {};
    for (const type of Object.keys(LEAVE_BALANCE)) {
      const typeRecords = leaveRecords.filter(r => r.leaveType === type);
      byType[type] = {
        total: typeRecords.length,
        pending: typeRecords.filter(r => r.status === 'Pending').length,
        approved: typeRecords.filter(r => r.status === 'Approved').length,
        rejected: typeRecords.filter(r => r.status === 'Rejected').length,
      };
    }
    return byType;
  }, [leaveRecords]);

  const contextValue = useMemo(() => ({
    leaveRecords,
    leaveBalanceConfig: LEAVE_BALANCE,
    addLeaveRequest,
    updateLeaveRequest,
    approveLeave,
    rejectLeave,
    cancelLeave,
    deleteLeaveRequest,
    getEmployeeLeaves,
    getLeaveBalance,
    getLeaveStats,
    getLeaveByType,
    fetchLeaves,
  }), [
    leaveRecords,
    addLeaveRequest, updateLeaveRequest, approveLeave, rejectLeave,
    cancelLeave, deleteLeaveRequest, getEmployeeLeaves, getLeaveBalance,
    getLeaveStats, getLeaveByType, fetchLeaves,
  ]);

  return (
    <LeaveContext.Provider value={contextValue}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error('useLeave must be used within LeaveProvider');
  return ctx;
}
