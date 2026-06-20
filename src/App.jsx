import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import EmployeeList from './pages/Admin/EmployeeList';
import AddEmployee from './pages/Admin/AddEmployee';
import EmployeeProfile from './pages/Admin/EmployeeProfile';
import EditEmployee from './pages/Admin/EditEmployee';
import DepartmentList from './pages/Admin/DepartmentList';
import AddDepartment from './pages/Admin/AddDepartment';
import EditDepartment from './pages/Admin/EditDepartment';
import DepartmentDetails from './pages/Admin/DepartmentDetails';
import AdminAttendance from './pages/Attendance/AdminAttendance';
import EmployeeAttendance from './pages/Attendance/EmployeeAttendance';

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
      </main>
      <Footer />
    </>
  );
}

function AdminPlaceholder({ title }) {
  return (
    <div className="admin-placeholder">
      <h2>{title}</h2>
      <p>This section is coming soon. The full implementation will be available in the next release.</p>
      <button className="btn btn-primary" onClick={() => window.history.back()}>Go Back</button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<EmployeeAttendance />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="employees/:id/edit" element={<EditEmployee />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="departments/add" element={<AddDepartment />} />
          <Route path="departments/:id" element={<DepartmentDetails />} />
          <Route path="departments/:id/edit" element={<EditDepartment />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="leave" element={<AdminPlaceholder title="Leave Management" />} />
          <Route path="payroll" element={<AdminPlaceholder title="Payroll Processing" />} />
          <Route path="reports" element={<AdminPlaceholder title="Reports & Analytics" />} />
          <Route path="notifications" element={<AdminPlaceholder title="Notifications Center" />} />
          <Route path="settings" element={<AdminPlaceholder title="System Settings" />} />
        </Route>
      </Routes>
    </Router>
  );
}
