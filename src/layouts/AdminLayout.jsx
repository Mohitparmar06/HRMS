import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { EmployeeProvider } from '../contexts/EmployeeContext';
import { DepartmentProvider } from '../contexts/DepartmentContext';
import { AttendanceProvider } from '../contexts/AttendanceContext';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <EmployeeProvider>
      <DepartmentProvider>
        <AttendanceProvider>
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
        </AttendanceProvider>
      </DepartmentProvider>
    </EmployeeProvider>
  );
}
