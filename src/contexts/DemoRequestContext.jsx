import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import API from '../services/api';

const DemoRequestContext = createContext(null);

export function DemoRequestProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 });
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await API.get('/demo-requests', { params });
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch demo requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get('/demo-requests/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch demo request stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  const addRequest = useCallback(async (request) => {
    try {
      const { data } = await API.post('/demo-requests', request);
      if (data.success) {
        setRequests(prev => [data.request, ...prev]);
        await fetchStats();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to submit request' };
    }
  }, [fetchStats]);

  const updateStatus = useCallback(async (id, status, statusNote = '') => {
    try {
      const { data } = await API.put(`/demo-requests/${id}`, { status, statusNote });
      if (data.success) {
        setRequests(prev => prev.map(r => r._id === id ? data.request : r));
        await fetchStats();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update status' };
    }
  }, [fetchStats]);

  const approveRequest = useCallback((id, note) => updateStatus(id, 'Approved', note), [updateStatus]);
  const rejectRequest = useCallback((id, note) => updateStatus(id, 'Rejected', note), [updateStatus]);
  const completeRequest = useCallback((id, note) => updateStatus(id, 'Completed', note), [updateStatus]);

  const deleteRequest = useCallback(async (id) => {
    try {
      const { data } = await API.delete(`/demo-requests/${id}`);
      if (data.success) {
        setRequests(prev => prev.filter(r => r._id !== id));
        await fetchStats();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete request' };
    }
  }, [fetchStats]);

  const value = useMemo(() => ({
    requests,
    stats,
    loading,
    fetchRequests,
    fetchStats,
    addRequest,
    updateStatus,
    approveRequest,
    rejectRequest,
    completeRequest,
    deleteRequest,
  }), [requests, stats, loading, fetchRequests, fetchStats, addRequest, updateStatus, approveRequest, rejectRequest, completeRequest, deleteRequest]);

  return (
    <DemoRequestContext.Provider value={value}>
      {children}
    </DemoRequestContext.Provider>
  );
}

export function useDemoRequests() {
  const ctx = useContext(DemoRequestContext);
  if (!ctx) throw new Error('useDemoRequests must be used within DemoRequestProvider');
  return ctx;
}
