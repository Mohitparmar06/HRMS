import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit, Trash2, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Filter, X, Users
} from 'lucide-react';
import { useEmployees } from '../../contexts/EmployeeContext';
import { departments } from '../../services/dummyData';
import { formatDate } from '../../utils/formatters';
import DeleteConfirmation from '../../components/admin/DeleteConfirmation';

export default function EmployeeList() {
  const navigate = useNavigate();
  const { employees, deleteEmployee } = useEmployees();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pageSize = 12;

  const filtered = useMemo(() => {
    let result = [...employees];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
      );
    }

    if (deptFilter) {
      result = result.filter(e => e.department === deptFilter);
    }

    if (statusFilter) {
      result = result.filter(e => e.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal, bVal;
      if (sortCol === 'name') { aVal = a.name; bVal = b.name; }
      else if (sortCol === 'joinDate') { aVal = a.joinDate; bVal = b.joinDate; }
      else if (sortCol === 'department') { aVal = a.department; bVal = b.department; }
      else if (sortCol === 'status') { aVal = a.status; bVal = b.status; }
      else { aVal = a[sortCol] || ''; bVal = b[sortCol] || ''; }

      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [employees, search, deptFilter, statusFilter, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const activeFilters = (deptFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  return (
    <div className="emp-list">
      <div className="emp-list-header">
        <div>
          <h1 className="emp-list-title">Employees</h1>
          <p className="emp-list-subtitle">{filtered.length} employees found</p>
        </div>
        <button className="btn btn-primary emp-add-btn" onClick={() => navigate('/admin/employees/add')}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="emp-list-toolbar">
        <div className="emp-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, ID, email, department..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="emp-search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className={`emp-filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          Filters
          {activeFilters > 0 && <span className="emp-filter-badge">{activeFilters}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="emp-filters">
          <div className="emp-filter-group">
            <label>Department</label>
            <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="emp-filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          {activeFilters > 0 && (
            <button className="emp-filter-clear" onClick={() => { setDeptFilter(''); setStatusFilter(''); setPage(1); }}>
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      )}

      <div className="emp-table-wrapper">
        <table className="emp-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                <div className="emp-th-inner">ID <SortIcon col="id" /></div>
              </th>
              <th>Employee</th>
              <th onClick={() => handleSort('department')} className="sortable">
                <div className="emp-th-inner">Department <SortIcon col="department" /></div>
              </th>
              <th onClick={() => handleSort('position')} className="sortable">
                <div className="emp-th-inner">Designation <SortIcon col="position" /></div>
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                <div className="emp-th-inner">Status <SortIcon col="status" /></div>
              </th>
              <th onClick={() => handleSort('joinDate')} className="sortable">
                <div className="emp-th-inner">Joining Date <SortIcon col="joinDate" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(emp => {
              const deptColor = departments.find(d => d.name === emp.department)?.color || '#3b82f6';
              return (
                <tr key={emp.id}>
                  <td className="emp-id">{emp.id}</td>
                  <td>
                    <div className="emp-cell-profile">
                      <div className="emp-cell-avatar" style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}88)` }}>
                        {emp.avatar}
                      </div>
                      <div>
                        <span className="emp-cell-name">{emp.name}</span>
                        <span className="emp-cell-email">{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="emp-dept-badge" style={{ background: `${deptColor}15`, color: deptColor }}>
                      {emp.department}
                    </span>
                  </td>
                  <td className="emp-position">{emp.position}</td>
                  <td>
                    <span className={`emp-status ${emp.status.toLowerCase().replace(' ', '-')}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="emp-date">{formatDate(emp.joinDate)}</td>
                  <td>
                    <div className="emp-actions">
                      <button className="emp-action-btn" title="View" onClick={() => navigate(`/admin/employees/${emp.id}`)}>
                        <Eye size={15} />
                      </button>
                      <button className="emp-action-btn" title="Edit" onClick={() => navigate(`/admin/employees/${emp.id}/edit`)}>
                        <Edit size={15} />
                      </button>
                      <button className="emp-action-btn emp-action-danger" title="Delete" onClick={() => setDeleteTarget(emp)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="emp-empty">
                  <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <span>No employees found</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="emp-pagination">
          <span className="emp-pagination-info">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="emp-pagination-btns">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      <DeleteConfirmation
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteEmployee(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Employee"
        itemName={deleteTarget?.name}
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone and all associated data will be permanently removed.`}
      />
    </div>
  );
}
