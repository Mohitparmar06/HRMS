import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit, Trash2, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Filter, X, Building2
} from 'lucide-react';
import { useDepartments } from '../../contexts/DepartmentContext';
import { useEmployees } from '../../contexts/EmployeeContext';
import { formatDate } from '../../utils/formatters';
import DeleteConfirmation from '../../components/admin/DeleteConfirmation';

export default function DepartmentList() {
  const navigate = useNavigate();
  const { departments, deleteDepartment } = useDepartments();
  const { employees } = useEmployees();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let result = [...departments];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.head.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(d => d.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortCol] || '';
      let bVal = b[sortCol] || '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [departments, search, statusFilter, sortCol, sortDir]);

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

  return (
    <div className="dept-list">
      <div className="dept-list-header">
        <div>
          <h1 className="dept-list-title">Departments</h1>
          <p className="dept-list-subtitle">{filtered.length} departments total</p>
        </div>
        <button className="btn btn-primary dept-add-btn" onClick={() => navigate('/admin/departments/add')}>
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="dept-list-toolbar">
        <div className="dept-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, code, head..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="dept-search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dept-status-filter">
          <button
            className={`dept-status-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => { setStatusFilter(''); setPage(1); }}
          >All</button>
          <button
            className={`dept-status-btn ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('Active'); setPage(1); }}
          >Active</button>
          <button
            className={`dept-status-btn ${statusFilter === 'Inactive' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('Inactive'); setPage(1); }}
          >Inactive</button>
        </div>
      </div>

      <div className="dept-cards-grid">
        {paged.map(dept => {
          const empCount = employees.filter(e => e.department === dept.name).length;
          return (
            <div key={dept.id} className="dept-card">
              <div className="dept-card-header">
                <div className="dept-card-icon" style={{ background: `${dept.color}18`, color: dept.color }}>
                  <Building2 size={22} />
                </div>
                <span className={`dept-card-status ${dept.status.toLowerCase()}`}>{dept.status}</span>
              </div>

              <div className="dept-card-body">
                <span className="dept-card-code">{dept.code}</span>
                <h3 className="dept-card-name">{dept.name}</h3>
                <p className="dept-card-desc">{dept.description}</p>
              </div>

              <div className="dept-card-meta">
                <div className="dept-card-meta-item">
                  <span className="dept-card-meta-label">Head</span>
                  <span className="dept-card-meta-value">{dept.head}</span>
                </div>
                <div className="dept-card-meta-item">
                  <span className="dept-card-meta-label">Employees</span>
                  <span className="dept-card-meta-value" style={{ color: dept.color }}>{empCount}</span>
                </div>
                <div className="dept-card-meta-item">
                  <span className="dept-card-meta-label">Location</span>
                  <span className="dept-card-meta-value">{dept.officeLocation}</span>
                </div>
                <div className="dept-card-meta-item">
                  <span className="dept-card-meta-label">Created</span>
                  <span className="dept-card-meta-value">{formatDate(dept.createdDate)}</span>
                </div>
              </div>

              <div className="dept-card-actions">
                <button className="dept-card-action" title="View Details" onClick={() => navigate(`/admin/departments/${dept.id}`)}>
                  <Eye size={15} />
                </button>
                <button className="dept-card-action" title="Edit" onClick={() => navigate(`/admin/departments/${dept.id}/edit`)}>
                  <Edit size={15} />
                </button>
                <button className="dept-card-action dept-card-action-danger" title="Delete" onClick={() => setDeleteTarget(dept)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {paged.length === 0 && (
          <div className="dept-empty">
            <Building2 size={48} style={{ opacity: 0.3 }} />
            <span>No departments found</span>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="dept-pagination">
          <span className="dept-pagination-info">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="dept-pagination-btns">
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
        onConfirm={() => { deleteDepartment(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Department"
        itemName={deleteTarget?.name}
        message={`Are you sure you want to delete the ${deleteTarget?.name} department? This action cannot be undone and all associated data will be permanently removed.`}
      />
    </div>
  );
}
