import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NotificationsContext = createContext(null);

const now = new Date();
const ago = (mins) => new Date(now.getTime() - mins * 60000).toISOString();

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Employee checked in late', description: 'Sophia Martinez clocked in at 09:42 AM, 42 minutes past the scheduled start time. This marks her third late arrival this month.', timestamp: ago(5), category: 'Attendance', priority: 'Medium', read: false, employeeId: 'EMP-0012', employeeName: 'Sophia Martinez' },
  { id: 2, title: 'New employee added', description: 'A new employee, Daniel Kim, has been added to the Engineering department as a Senior Software Engineer. Onboarding checklist is pending.', timestamp: ago(18), category: 'Employee', priority: 'Low', read: false, employeeId: 'EMP-0151', employeeName: 'Daniel Kim' },
  { id: 3, title: 'Leave request submitted', description: 'Rachel Green has submitted a casual leave request for June 28–30, 2026 (3 days). Reason: Family vacation.', timestamp: ago(35), category: 'Leave', priority: 'Medium', read: false, employeeId: 'EMP-0045', employeeName: 'Rachel Green' },
  { id: 4, title: 'Leave approved', description: 'James Wilson\'s annual leave request for July 1–5, 2026 has been approved by HR Manager Sarah Mitchell.', timestamp: ago(52), category: 'Leave', priority: 'Low', read: false, employeeId: 'EMP-0023', employeeName: 'James Wilson' },
  { id: 5, title: 'Payroll generated', description: 'June 2026 payroll has been processed for 148 employees. Total disbursement: $1,247,850. All direct deposits are scheduled for June 30.', timestamp: ago(75), category: 'Payroll', priority: 'High', read: false, employeeId: null, employeeName: null },
  { id: 6, title: 'Attendance anomaly detected', description: '12 employees have been flagged for leaving before 3:00 PM on June 20. This is 40% above the normal early-departure rate.', timestamp: ago(95), category: 'Attendance', priority: 'High', read: true, employeeId: null, employeeName: null },
  { id: 7, title: 'Department budget updated', description: 'The Engineering department\'s Q3 budget has been revised from $720,000 to $850,000 following the headcount expansion approval.', timestamp: ago(120), category: 'System', priority: 'Low', read: true, employeeId: null, employeeName: null },
  { id: 8, title: 'Password reset requested', description: 'Marcus Webb from the HR department requested a password reset. The reset link was sent to m.webb@dayflow.com.', timestamp: ago(140), category: 'System', priority: 'Medium', read: true, employeeId: 'EMP-0008', employeeName: 'Marcus Webb' },
  { id: 9, title: 'Birthday reminder', description: 'Priya Sharma from the Finance department has a birthday on June 25, 2026. Consider sending a greeting card.', timestamp: ago(160), category: 'Employee', priority: 'Low', read: true, employeeId: 'EMP-0031', employeeName: 'Priya Sharma' },
  { id: 10, title: 'Leave rejected', description: 'Tom Anderson\'s sick leave request for June 22–23 was rejected due to insufficient medical documentation. He has been notified.', timestamp: ago(185), category: 'Leave', priority: 'Medium', read: true, employeeId: 'EMP-0056', employeeName: 'Tom Anderson' },
  { id: 11, title: 'Employee profile updated', description: 'Lisa Chen updated her emergency contact information and bank account details in her employee profile.', timestamp: ago(210), category: 'Employee', priority: 'Low', read: true, employeeId: 'EMP-0034', employeeName: 'Lisa Chen' },
  { id: 12, title: 'Overtime hours reported', description: 'Engineering team logged 87 overtime hours this week, exceeding the department threshold of 60 hours. Review required.', timestamp: ago(240), category: 'Attendance', priority: 'High', read: true, employeeId: null, employeeName: null },
  { id: 13, title: 'System maintenance scheduled', description: 'The HRMS system will undergo maintenance on June 28, 2026 from 2:00 AM to 4:00 AM EST. All services will be temporarily unavailable.', timestamp: ago(270), category: 'System', priority: 'Medium', read: true, employeeId: null, employeeName: null },
  { id: 14, title: 'New department created', description: 'The Data Analytics department has been created under the leadership of Fatima Al-Rashid with an initial budget of $980,000.', timestamp: ago(300), category: 'System', priority: 'Low', read: true, employeeId: null, employeeName: null },
  { id: 15, title: 'Employee checked in late', description: 'Kevin Brooks arrived at 09:31 AM, 31 minutes late. His last 5 check-in times show a pattern of tardiness.', timestamp: ago(330), category: 'Attendance', priority: 'Medium', read: true, employeeId: 'EMP-0067', employeeName: 'Kevin Brooks' },
  { id: 16, title: 'Payroll discrepancy flagged', description: 'A $2,400 discrepancy was detected in the payroll record for EMP-0089 (Nathan Patel). Overtime hours appear to be duplicated.', timestamp: ago(360), category: 'Payroll', priority: 'High', read: false, employeeId: 'EMP-0089', employeeName: 'Nathan Patel' },
  { id: 17, title: 'Leave balance warning', description: 'Emily Davis has only 2 casual leave days remaining for the year. She has submitted a 5-day leave request that may need adjustment.', timestamp: ago(390), category: 'Leave', priority: 'Medium', read: false, employeeId: 'EMP-0029', employeeName: 'Emily Davis' },
  { id: 18, title: 'Performance review due', description: 'Quarterly performance reviews for the Sales department are due by June 30, 2026. 8 reviews are still pending.', timestamp: ago(420), category: 'Employee', priority: 'High', read: false, employeeId: null, employeeName: null },
  { id: 19, title: 'System backup completed', description: 'The daily system backup completed successfully at 3:00 AM. All 148 employee records and 12,450 attendance entries were backed up.', timestamp: ago(450), category: 'System', priority: 'Low', read: true, employeeId: null, employeeName: null },
  { id: 20, title: 'New leave request submitted', description: 'Carlos Rivera has submitted a paternity leave request for July 10–24, 2026 (15 days). Supporting documents attached.', timestamp: ago(480), category: 'Leave', priority: 'Medium', read: true, employeeId: 'EMP-0078', employeeName: 'Carlos Rivera' },
  { id: 21, title: 'Birthday reminder', description: 'Lucas Moreau from the Design department has a birthday on June 27, 2026. Consider sending a greeting card.', timestamp: ago(510), category: 'Employee', priority: 'Low', read: true, employeeId: 'EMP-0041', employeeName: 'Lucas Moreau' },
  { id: 22, title: 'Employee checked in late', description: 'Amy Foster clocked in at 09:55 AM, 55 minutes late. This is her fifth late arrival this month.', timestamp: ago(540), category: 'Attendance', priority: 'High', read: true, employeeId: 'EMP-0093', employeeName: 'Amy Foster' },
  { id: 23, title: 'Payroll bonus approved', description: 'Performance bonuses totaling $45,200 have been approved for 18 top-performing employees in the Engineering department.', timestamp: ago(570), category: 'Payroll', priority: 'Low', read: true, employeeId: null, employeeName: null },
  { id: 24, title: 'Employee resignation received', description: 'Kevin Brooks from Customer Support has submitted his resignation, effective July 15, 2026. Exit process initiated.', timestamp: ago(600), category: 'Employee', priority: 'High', read: true, employeeId: 'EMP-0067', employeeName: 'Kevin Brooks' },
  { id: 25, title: 'Leave approved', description: 'Sophia Martinez\'s work-from-home request for June 25 has been approved by her manager Lucas Moreau.', timestamp: ago(630), category: 'Leave', priority: 'Low', read: true, employeeId: 'EMP-0012', employeeName: 'Sophia Martinez' },
  { id: 26, title: 'Security alert', description: 'Three failed login attempts were detected for the admin account from an unrecognized IP address (192.168.45.102).', timestamp: ago(660), category: 'System', priority: 'High', read: false, employeeId: null, employeeName: null },
  { id: 27, title: 'Employee checked in late', description: 'Michael Brown clocked in at 09:18 AM, 18 minutes late. He reported a traffic delay on the freeway.', timestamp: ago(690), category: 'Attendance', priority: 'Low', read: true, employeeId: 'EMP-0015', employeeName: 'Michael Brown' },
  { id: 28, title: 'Leave request submitted', description: 'David Park has submitted an earned leave request for August 5–9, 2026 (5 days). Reason: Attending a wedding.', timestamp: ago(720), category: 'Leave', priority: 'Low', read: true, employeeId: 'EMP-0052', employeeName: 'David Park' },
  { id: 29, title: 'Payroll tax filing reminder', description: 'Q2 tax filing deadline is July 15, 2026. All payroll tax documents need to be reviewed and submitted before the deadline.', timestamp: ago(750), category: 'Payroll', priority: 'High', read: false, employeeId: null, employeeName: null },
  { id: 30, title: 'Employee promoted', description: 'Anika Patel has been promoted from Product Manager to Senior Product Manager effective July 1, 2026. Salary adjustment pending.', timestamp: ago(780), category: 'Employee', priority: 'Medium', read: true, employeeId: 'EMP-0043', employeeName: 'Anika Patel' },
  { id: 31, title: 'System update available', description: 'HRMS v3.2.1 is now available with improved reporting features and bug fixes. Update recommended within the next 7 days.', timestamp: ago(810), category: 'System', priority: 'Medium', read: true, employeeId: null, employeeName: null },
  { id: 32, title: 'Attendance correction needed', description: 'HR-0023 has a missing clock-out record for June 19, 2026. Manual correction is required by the end of the day.', timestamp: ago(840), category: 'Attendance', priority: 'Medium', read: false, employeeId: 'EMP-0023', employeeName: 'James Wilson' },
  { id: 33, title: 'Birthday reminder', description: 'Sarah Chen from Engineering has a birthday on June 30, 2026. Consider organizing a team celebration.', timestamp: ago(870), category: 'Employee', priority: 'Low', read: true, employeeId: 'EMP-0003', employeeName: 'Sarah Chen' },
  { id: 34, title: 'Leave rejected', description: 'Lisa Anderson\'s casual leave request for June 20 was rejected due to a critical project deadline on that date.', timestamp: ago(900), category: 'Leave', priority: 'Medium', read: true, employeeId: 'EMP-0058', employeeName: 'Lisa Anderson' },
  { id: 35, title: 'Payroll processed', description: 'May 2026 payroll has been finalized. 3 pending payments have been processed and confirmation emails sent.', timestamp: ago(930), category: 'Payroll', priority: 'Low', read: true, employeeId: null, employeeName: null },
  { id: 36, title: 'Contract renewal due', description: 'Three employee contracts are expiring in the next 30 days: Emma Wilson, Robert Taylor, and Jennifer Lee. Initiate renewal process.', timestamp: ago(960), category: 'Employee', priority: 'High', read: false, employeeId: null, employeeName: null },
  { id: 37, title: 'Employee profile updated', description: 'Marcus Webb updated his address from 123 Oak Street to 456 Pine Avenue in his employee profile.', timestamp: ago(990), category: 'Employee', priority: 'Low', read: true, employeeId: 'EMP-0008', employeeName: 'Marcus Webb' },
  { id: 38, title: 'System backup warning', description: 'The system backup storage is at 82% capacity. Consider archiving old records or upgrading storage.', timestamp: ago(1020), category: 'System', priority: 'Medium', read: true, employeeId: null, employeeName: null },
];

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => [...INITIAL_NOTIFICATIONS]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: false } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  const highPriorityCount = useMemo(() =>
    notifications.filter(n => n.priority === 'High' && !n.read).length,
    [notifications]
  );

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    highPriorityCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  }), [notifications, unreadCount, highPriorityCount, markAsRead, markAsUnread, markAllAsRead, deleteNotification, clearAll, addNotification]);

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
