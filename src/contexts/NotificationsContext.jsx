import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NotificationsContext = createContext(null);

let nextId = 100;

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markAllAsReadForEmployee = useCallback((employeeId) => {
    setNotifications(prev => prev.map(n =>
      n.targetEmployeeId === employeeId ? { ...n, read: true } : n
    ));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => { setNotifications([]); }, []);

  const addNotification = useCallback((notification) => {
    const id = ++nextId;
    const newNotif = {
      ...notification,
      id,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    return id;
  }, []);

  const getEmployeeNotifications = useCallback((employeeId) => {
    return notifications.filter(n => n.targetEmployeeId === employeeId);
  }, [notifications]);

  const getAdminNotifications = useCallback(() => {
    return notifications.filter(n => n.targetEmployeeId === null);
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const getUnreadCountForEmployee = useCallback((employeeId) => {
    return notifications.filter(n => !n.read && n.targetEmployeeId === employeeId).length;
  }, [notifications]);

  const highPriorityCount = useMemo(() =>
    notifications.filter(n => n.priority === 'High' && !n.read).length,
    [notifications]
  );

  const contextValue = useMemo(() => ({
    notifications, unreadCount, highPriorityCount,
    markAsRead, markAsUnread, markAllAsRead, markAllAsReadForEmployee,
    deleteNotification, clearAll, addNotification,
    getEmployeeNotifications, getAdminNotifications, getUnreadCountForEmployee,
  }), [
    notifications, unreadCount, highPriorityCount,
    markAsRead, markAsUnread, markAllAsRead, markAllAsReadForEmployee,
    deleteNotification, clearAll, addNotification,
    getEmployeeNotifications, getAdminNotifications, getUnreadCountForEmployee,
  ]);

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
