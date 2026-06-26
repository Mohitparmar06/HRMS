import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { DemoRequestProvider } from './contexts/DemoRequestContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProtectedRoute, AdminRoute, EmployeeRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import DemoCTA from './components/DemoCTA';
import Footer from './components/Footer';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';

import EmployeeLayout from './layouts/EmployeeLayout';
import Dashboard from './pages/Dashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeAttendance from './pages/Attendance/EmployeeAttendance';
import EmployeeLeave from './pages/Leave/EmployeeLeave';
import EmployeePayroll from './pages/Payroll/EmployeePayroll';
import EmployeeNotifications from './pages/EmployeeNotifications';
import EmployeeSettings from './pages/EmployeeSettings';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import EmployeeList from './pages/Admin/EmployeeList';
import AddEmployee from './pages/Admin/AddEmployee';
import AdminEmployeeProfile from './pages/Admin/EmployeeProfile';
import EditEmployee from './pages/Admin/EditEmployee';
import DepartmentList from './pages/Admin/DepartmentList';
import AddDepartment from './pages/Admin/AddDepartment';
import EditDepartment from './pages/Admin/EditDepartment';
import DepartmentDetails from './pages/Admin/DepartmentDetails';
import AdminAttendance from './pages/Attendance/AdminAttendance';
import AdminLeave from './pages/Leave/AdminLeave';
import AdminPayroll from './pages/Payroll/AdminPayroll';
import AdminReports from './pages/Reports/AdminReports';
import AdminNotifications from './pages/Notifications/AdminNotifications';
import AdminSettings from './pages/Settings/AdminSettings';
import AdminDemoRequests from './pages/Admin/AdminDemoRequests';

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <DemoCTA />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationsProvider>
          <DemoRequestProvider>
            <SettingsProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

                <Route element={<ProtectedRoute><EmployeeRoute><EmployeeLayout /></EmployeeRoute></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<EmployeeProfile />} />
                  <Route path="/attendance" element={<EmployeeAttendance />} />
                  <Route path="/leave" element={<EmployeeLeave />} />
                  <Route path="/payroll" element={<EmployeePayroll />} />
                  <Route path="/notifications" element={<EmployeeNotifications />} />
                  <Route path="/settings" element={<EmployeeSettings />} />
                </Route>

                <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="employees" element={<EmployeeList />} />
                  <Route path="employees/add" element={<AddEmployee />} />
                  <Route path="employees/:id" element={<AdminEmployeeProfile />} />
                  <Route path="employees/:id/edit" element={<EditEmployee />} />
                  <Route path="departments" element={<DepartmentList />} />
                  <Route path="departments/add" element={<AddDepartment />} />
                  <Route path="departments/:id" element={<DepartmentDetails />} />
                  <Route path="departments/:id/edit" element={<EditDepartment />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="leave" element={<AdminLeave />} />
                  <Route path="payroll" element={<AdminPayroll />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="demo-requests" element={<AdminDemoRequests />} />
                </Route>
              </Routes>
            </SettingsProvider>
          </DemoRequestProvider>
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
}
