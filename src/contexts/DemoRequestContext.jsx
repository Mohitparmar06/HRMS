import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DemoRequestContext = createContext(null);

let nextId = 1;

export function DemoRequestProvider({ children }) {
  const [requests, setRequests] = useState([]);

  const addRequest = useCallback((request) => {
    const id = nextId++;
    const newRequest = {
      ...request,
      id,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      viewedAt: null,
      contactedAt: null,
    };
    setRequests(prev => [newRequest, ...prev]);
    return newRequest;
  }, []);

  const markAsViewed = useCallback((id) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'Viewed', viewedAt: new Date().toISOString() } : r
    ));
  }, []);

  const markAsContacted = useCallback((id) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'Contacted', contactedAt: new Date().toISOString() } : r
    ));
  }, []);

  const markAsScheduled = useCallback((id) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'Scheduled' } : r
    ));
  }, []);

  const deleteRequest = useCallback((id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  }, []);

  const getStats = useCallback(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const viewed = requests.filter(r => r.status === 'Viewed').length;
    const contacted = requests.filter(r => r.status === 'Contacted').length;
    const scheduled = requests.filter(r => r.status === 'Scheduled').length;
    return { total, pending, viewed, contacted, scheduled };
  }, [requests]);

  const contextValue = useMemo(() => ({
    requests,
    addRequest,
    markAsViewed,
    markAsContacted,
    markAsScheduled,
    deleteRequest,
    getStats,
  }), [requests, addRequest, markAsViewed, markAsContacted, markAsScheduled, deleteRequest, getStats]);

  return (
    <DemoRequestContext.Provider value={contextValue}>
      {children}
    </DemoRequestContext.Provider>
  );
}

export function useDemoRequests() {
  const ctx = useContext(DemoRequestContext);
  if (!ctx) throw new Error('useDemoRequests must be used within DemoRequestProvider');
  return ctx;
}
