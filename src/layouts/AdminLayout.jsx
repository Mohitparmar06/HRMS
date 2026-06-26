import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { EmployeeProvider, useEmployees } from '../contexts/EmployeeContext';
import { DepartmentProvider } from '../contexts/DepartmentContext';
import { AttendanceProvider } from '../contexts/AttendanceContext';
import { LeaveProvider } from '../contexts/LeaveContext';
import { PayrollProvider } from '../contexts/PayrollContext';
import { SettingsProvider } from '../contexts/SettingsContext';

function AdminDepartmentWrapper({ children }) {
  const { employees } = useEmployees();
  return (
    <DepartmentProvider employees={employees}>
      {children}
    </DepartmentProvider>
  );
}

function AdminAttendanceWrapper({ children }) {
  const { employees } = useEmployees();
  return (
    <AttendanceProvider employees={employees}>
      {children}
    </AttendanceProvider>
  );
}

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SettingsProvider>
      <EmployeeProvider>
        <AdminDepartmentWrapper>
          <AdminAttendanceWrapper>
            <LeaveProvider>
              <PayrollProvider>
                <div className="admin-layout">
                  <AdminSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                  />
                  {mobileOpen && <div className="admin-mobile-overlay" onClick={() => setMobileOpen(false)} />}
                  <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    <AdminNavbar
                      onMobileToggle={() => setMobileOpen(!mobileOpen)}
                      isMobileOpen={mobileOpen}
                    />
                    <main className="admin-content">
                      <Outlet />
                    </main>
                  </div>
                </div>
              </PayrollProvider>
            </LeaveProvider>
          </AdminAttendanceWrapper>
        </AdminDepartmentWrapper>
      </EmployeeProvider>
    </SettingsProvider>
  );
}
