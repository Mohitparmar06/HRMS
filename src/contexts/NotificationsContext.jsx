import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import API from '../services/api';

const NotificationsContext = createContext(null);

function mapNotification(n) {
  return {
    id: n._id,
    title: n.title,
    description: n.message,
    category: getCategoryFromType(n.type),
    priority: getPriorityFromType(n.type),
    timestamp: n.createdAt,
    read: n.isRead,
    targetEmployeeId: n.recipientId,
    recipientRole: n.recipientRole,
    type: n.type,
  };
}

function getCategoryFromType(type) {
  if (!type) return 'System';
  if (type.includes('Leave')) return 'Leave';
  if (type.includes('Payroll') || type.includes('Pay')) return 'Payroll';
  if (type.includes('Attendance')) return 'Attendance';
  if (type.includes('Employee')) return 'Employee';
  if (type.includes('Profile')) return 'Profile';
  return 'System';
}

function getPriorityFromType(type) {
  if (!type) return 'Low';
  if (type.includes('Deleted') || type.includes('Rejected')) return 'High';
  if (type.includes('Added') || type.includes('Approved') || type.includes('Paid')) return 'Medium';
  return 'Low';
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(null);

  const fetchNotifications = useCallback(async (recipientRole, recipientId) => {
    setLoading(true);
    try {
      const params = {};
      if (recipientRole) params.recipientRole = recipientRole;
      if (recipientId) params.recipientId = recipientId;

      const res = await API.get('/notifications', { params });
      if (res.data.success) {
        const fetched = res.data.notifications.map(mapNotification);

        setNotifications(prev => {
          const kept = prev.filter(n => {
            if (recipientRole === 'Admin' && !recipientId) {
              return n.recipientRole !== 'Admin';
            }
            if (recipientRole === 'Employee' && recipientId) {
              if (n.recipientRole === 'Admin') return true;
              if (n.recipientRole === 'Employee' && n.targetEmployeeId !== recipientId) return true;
              return false;
            }
            return false;
          });
          const keptIds = new Set(kept.map(n => n.id));
          const newItems = fetched.filter(n => !keptIds.has(n.id));
          return [...kept, ...newItems];
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminNotifications = useCallback(() => {
    return fetchNotifications('Admin', undefined);
  }, [fetchNotifications]);

  const fetchEmployeeNotifications = useCallback((employeeId) => {
    return fetchNotifications('Employee', employeeId);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await API.put(`/notifications/${id}`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAsUnread = useCallback(async (id) => {
    try {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await API.put('/notifications/mark-all-read', null, {
        params: { recipientRole: 'Admin' },
      });
      setNotifications(prev =>
        prev.map(n => n.recipientRole === 'Admin' ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  const markAllAsReadForEmployee = useCallback(async (employeeId) => {
    try {
      await API.put('/notifications/mark-all-read', null, {
        params: { recipientRole: 'Employee', recipientId: employeeId },
      });
      setNotifications(prev =>
        prev.map(n =>
          n.targetEmployeeId === employeeId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark all as read for employee:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  const clearAll = useCallback(async (recipientRole, recipientId) => {
    try {
      const params = {};
      if (recipientRole) params.recipientRole = recipientRole;
      if (recipientId) params.recipientId = recipientId;

      await API.delete('/notifications/clear-all', { params });
      setNotifications(prev =>
        prev.filter(n => {
          if (recipientRole === 'Admin' && !recipientId) {
            return n.recipientRole !== 'Admin';
          }
          if (recipientRole === 'Employee' && recipientId) {
            if (n.recipientRole === 'Admin') return true;
            if (n.recipientRole === 'Employee' && n.targetEmployeeId !== recipientId) return true;
            return false;
          }
          return true;
        })
      );
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }, []);

  const addNotification = useCallback(async (notification) => {
    try {
      const payload = {
        title: notification.title,
        message: notification.description,
        type: notification.type || 'General',
        recipientRole: notification.targetEmployeeId ? 'Employee' : 'Admin',
        recipientId: notification.targetEmployeeId || null,
        isRead: false,
      };
      const res = await API.post('/notifications', payload);
      if (res.data.success) {
        const mapped = mapNotification(res.data.notification);
        setNotifications(prev => [mapped, ...prev]);
        return mapped.id;
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }, []);

  const getEmployeeNotifications = useCallback((employeeId) => {
    return notifications.filter(n => n.targetEmployeeId === employeeId);
  }, [notifications]);

  const getAdminNotifications = useCallback(() => {
    return notifications.filter(n => n.targetEmployeeId === null || n.targetEmployeeId === undefined);
  }, [notifications]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const getUnreadCountForEmployee = useCallback(
    (employeeId) => notifications.filter(n => !n.read && n.targetEmployeeId === employeeId).length,
    [notifications]
  );

  const highPriorityCount = useMemo(
    () => notifications.filter(n => n.priority === 'High' && !n.read).length,
    [notifications]
  );

  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchNotifications('Admin', undefined);
      fetchNotifications('Employee', undefined);
    }, 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchNotifications]);

  const contextValue = useMemo(() => ({
    notifications,
    loading,
    unreadCount,
    highPriorityCount,
    fetchNotifications,
    fetchAdminNotifications,
    fetchEmployeeNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markAllAsReadForEmployee,
    deleteNotification,
    clearAll,
    addNotification,
    getEmployeeNotifications,
    getAdminNotifications,
    getUnreadCountForEmployee,
  }), [
    notifications,
    loading,
    unreadCount,
    highPriorityCount,
    fetchNotifications,
    fetchAdminNotifications,
    fetchEmployeeNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markAllAsReadForEmployee,
    deleteNotification,
    clearAll,
    addNotification,
    getEmployeeNotifications,
    getAdminNotifications,
    getUnreadCountForEmployee,
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
