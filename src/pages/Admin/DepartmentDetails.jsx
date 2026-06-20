import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Building2, Users, MapPin, Calendar,
  DollarSign, Mail, Phone, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useDepartments } from '../../contexts/DepartmentContext';
import { departments as deptConfig } from '../../services/dummyData';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function DepartmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getDepartment, getEmployeesByDept } = useDepartments();
  const dept = getDepartment(id);
  const [empPage, setEmpPage] = useState(1);
  const empPageSize = 8;

  if (!dept) {
    return (
      <div className="dept-not-found">
        <h2>Department Not Found</h2>
        <p>The department with ID "{id}" does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/admin/departments')}>Back to Departments</button>
      </div>
    );
  }

  const deptEmployees = getEmployeesByDept(dept.name);
  const totalSalary = deptEmployees.reduce((sum, e) => sum + e.salary, 0);
  const activeCount = deptEmployees.filter(e => e.status === 'Active').length;
  const empTotalPages = Math.ceil(deptEmployees.length / empPageSize);
  const pagedEmployees = deptEmployees.slice((empPage - 1) * empPageSize, empPage * empPageSize);

  return (
    <div className="dept-details">
      <div className="dept-details-header">
        <button className="dept-back-btn" onClick={() => navigate('/admin/departments')}>
          <ArrowLeft size={18} /> Back to Departments
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/admin/departments/${id}/edit`)}>
          <Edit size={16} /> Edit Department
        </button>
      </div>

      <div className="dept-details-hero">
        <div className="dept-details-hero-icon" style={{ background: `${dept.color}18`, color: dept.color }}>
          <Building2 size={32} />
        </div>
        <div className="dept-details-hero-info">
          <span className="dept-details-code">{dept.code}</span>
          <h1>{dept.name}</h1>
          <p>{dept.description}</p>
          <div className="dept-details-badges">
            <span className={`dept-details-status ${dept.status.toLowerCase()}`}>{dept.status}</span>
            <span className="dept-details-badge"><MapPin size={14} /> {dept.officeLocation}</span>
            <span className="dept-details-badge"><Calendar size={14} /> Created {formatDate(dept.createdDate)}</span>
          </div>
        </div>
      </div>

      <div className="dept-stats-grid">
        <div className="dept-stat-card">
          <div className="dept-stat-icon" style={{ background: `${dept.color}15`, color: dept.color }}>
            <Users size={20} />
          </div>
          <div className="dept-stat-info">
            <span className="dept-stat-value">{deptEmployees.length}</span>
            <span className="dept-stat-label">Total Employees</span>
          </div>
        </div>
        <div className="dept-stat-card">
          <div className="dept-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <Users size={20} />
          </div>
          <div className="dept-stat-info">
            <span className="dept-stat-value">{activeCount}</span>
            <span className="dept-stat-label">Active Employees</span>
          </div>
        </div>
        <div className="dept-stat-card">
          <div className="dept-stat-icon" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
            <DollarSign size={20} />
          </div>
          <div className="dept-stat-info">
            <span className="dept-stat-value">{formatCurrency(totalSalary)}</span>
            <span className="dept-stat-label">Total Salary Cost</span>
          </div>
        </div>
        <div className="dept-stat-card">
          <div className="dept-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <Building2 size={20} />
          </div>
          <div className="dept-stat-info">
            <span className="dept-stat-value">{dept.head}</span>
            <span className="dept-stat-label">Department Head</span>
          </div>
        </div>
      </div>

      <div className="dept-employees-section">
        <div className="dept-employees-header">
          <h3>Employees in {dept.name}</h3>
          <span className="dept-employees-count">{deptEmployees.length} employees</span>
        </div>

        {deptEmployees.length > 0 ? (
          <>
            <div className="dept-employees-table-wrapper">
              <table className="dept-employees-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Salary</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="dept-emp-cell">
                          <div className="dept-emp-avatar" style={{ background: `linear-gradient(135deg, ${dept.color}, ${dept.color}88)` }}>
                            {emp.avatar}
                          </div>
                          <div>
                            <span className="dept-emp-name">{emp.name}</span>
                            <span className="dept-emp-email">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{emp.position}</td>
                      <td>
                        <span className={`emp-status ${emp.status.toLowerCase().replace(' ', '-')}`}>{emp.status}</span>
                      </td>
                      <td>{formatCurrency(emp.salary)}</td>
                      <td>{formatDate(emp.joinDate)}</td>
                      <td>
                        <button className="dept-emp-action" onClick={() => navigate(`/admin/employees/${emp.id}`)}>
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {empTotalPages > 1 && (
              <div className="dept-emp-pagination">
                <span>Showing {(empPage - 1) * empPageSize + 1} to {Math.min(empPage * empPageSize, deptEmployees.length)} of {deptEmployees.length}</span>
                <div className="dept-emp-pagination-btns">
                  <button disabled={empPage === 1} onClick={() => empPage > 1 && setEmpPage(empPage - 1)}><ChevronLeft size={14} /></button>
                  {Array.from({ length: Math.min(5, empTotalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(empPage - 2, empTotalPages - 4));
                    const p = start + i;
                    if (p > empTotalPages) return null;
                    return <button key={p} className={p === empPage ? 'active' : ''} onClick={() => setEmpPage(p)}>{p}</button>;
                  })}
                  <button disabled={empPage === empTotalPages} onClick={() => empPage < empTotalPages && setEmpPage(empPage + 1)}><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="dept-employees-empty">
            <Users size={40} style={{ opacity: 0.3 }} />
            <span>No employees in this department</span>
          </div>
        )}
      </div>
    </div>
  );
}
