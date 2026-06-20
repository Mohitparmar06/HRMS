import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Briefcase,
  DollarSign, Clock, User, Shield, Heart, Building2, Award
} from 'lucide-react';
import { useEmployees } from '../../contexts/EmployeeContext';
import { departments } from '../../services/dummyData';
import { formatDate, formatCurrency, formatTime } from '../../utils/formatters';

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getEmployee } = useEmployees();
  const emp = getEmployee(id);

  if (!emp) {
    return (
      <div className="emp-not-found">
        <h2>Employee Not Found</h2>
        <p>The employee with ID "{id}" does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/admin/employees')}>Back to Employees</button>
      </div>
    );
  }

  const deptColor = departments.find(d => d.name === emp.department)?.color || '#3b82f6';

  return (
    <div className="emp-profile">
      <div className="emp-profile-header">
        <button className="emp-back-btn" onClick={() => navigate('/admin/employees')}>
          <ArrowLeft size={18} /> Back to Employees
        </button>
        <div className="emp-profile-actions">
          <button className="btn btn-secondary" onClick={() => navigate(`/admin/employees/${emp.id}/edit`)}>
            <Edit size={16} /> Edit Employee
          </button>
        </div>
      </div>

      <div className="emp-profile-hero">
        <div className="emp-profile-avatar-lg" style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}88)` }}>
          {emp.profilePicture ? (
            <img src={emp.profilePicture} alt={emp.name} />
          ) : (
            <span>{emp.avatar}</span>
          )}
        </div>
        <div className="emp-profile-hero-info">
          <h1>{emp.name}</h1>
          <p>{emp.position}</p>
          <div className="emp-profile-badges">
            <span className="emp-dept-badge-lg" style={{ background: `${deptColor}15`, color: deptColor, borderColor: `${deptColor}30` }}>
              <Building2 size={14} /> {emp.department}
            </span>
            <span className={`emp-status-lg ${emp.status.toLowerCase().replace(' ', '-')}`}>
              {emp.status}
            </span>
          </div>
        </div>
      </div>

      <div className="emp-profile-grid">
        <div className="emp-profile-card">
          <h3><User size={16} /> Personal Information</h3>
          <div className="emp-profile-fields">
            <div className="emp-profile-field">
              <span className="emp-profile-label">Employee ID</span>
              <span className="emp-profile-value">{emp.id}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Full Name</span>
              <span className="emp-profile-value">{emp.name}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Email</span>
              <span className="emp-profile-value"><Mail size={14} /> {emp.email}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Phone</span>
              <span className="emp-profile-value"><Phone size={14} /> {emp.phone}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Gender</span>
              <span className="emp-profile-value">{emp.gender || 'Not specified'}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Date of Birth</span>
              <span className="emp-profile-value"><Calendar size={14} /> {emp.dob ? formatDate(emp.dob) : 'Not specified'}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Address</span>
              <span className="emp-profile-value"><MapPin size={14} /> {emp.address || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <div className="emp-profile-card">
          <h3><Briefcase size={16} /> Employment Details</h3>
          <div className="emp-profile-fields">
            <div className="emp-profile-field">
              <span className="emp-profile-label">Department</span>
              <span className="emp-profile-value" style={{ color: deptColor }}>{emp.department}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Designation</span>
              <span className="emp-profile-value">{emp.position}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Joining Date</span>
              <span className="emp-profile-value"><Calendar size={14} /> {formatDate(emp.joinDate)}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Annual Salary</span>
              <span className="emp-profile-value"><DollarSign size={14} /> {formatCurrency(emp.salary)}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Status</span>
              <span className={`emp-status-inline ${emp.status.toLowerCase().replace(' ', '-')}`}>{emp.status}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Last Check-In</span>
              <span className="emp-profile-value"><Clock size={14} /> {emp.lastCheckIn ? formatTime(emp.lastCheckIn) : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="emp-profile-card">
          <h3><Shield size={16} /> Emergency Contact</h3>
          <div className="emp-profile-fields">
            <div className="emp-profile-field">
              <span className="emp-profile-label">Contact Name</span>
              <span className="emp-profile-value">{emp.emergencyName || 'Not specified'}</span>
            </div>
            <div className="emp-profile-field">
              <span className="emp-profile-label">Contact Phone</span>
              <span className="emp-profile-value"><Phone size={14} /> {emp.emergencyContact || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <div className="emp-profile-card">
          <h3><Award size={16} /> Performance Summary</h3>
          <div className="emp-profile-stats">
            <div className="emp-profile-stat">
              <span className="emp-profile-stat-value">{emp.performance}%</span>
              <span className="emp-profile-stat-label">Performance</span>
              <div className="emp-profile-stat-bar">
                <div className="emp-profile-stat-fill" style={{ width: `${emp.performance}%`, background: deptColor }} />
              </div>
            </div>
            <div className="emp-profile-stat">
              <span className="emp-profile-stat-value">{emp.projectsCompleted}</span>
              <span className="emp-profile-stat-label">Projects Done</span>
            </div>
            <div className="emp-profile-stat">
              <span className="emp-profile-stat-value">{emp.hoursWorked}h</span>
              <span className="emp-profile-stat-label">Hours This Month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
