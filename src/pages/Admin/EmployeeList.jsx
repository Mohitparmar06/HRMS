import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit, Trash2, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Filter, X, Users, Key, Copy, RefreshCw, CheckCircle
} from 'lucide-react';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';
import DeleteConfirmation from '../../components/admin/DeleteConfirmation';

export default function EmployeeList() {
  const navigate = useNavigate();
  const { employees, deleteEmployee, departments } = useEmployees();
  const { adminRegenerateTempPassword } = useAuth();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [credTarget, setCredTarget] = useState(null);
  const [regenResult, setRegenResult] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
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

    if (positionFilter) {
      result = result.filter(e => e.position === positionFilter);
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
  }, [employees, search, deptFilter, statusFilter, positionFilter, sortCol, sortDir]);

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

  const handleRegeneratePassword = async () => {
    if (!credTarget) return;
    setIsRegenerating(true);
    try {
      const result = await adminRegenerateTempPassword(credTarget.id);
      setRegenResult({
        name: credTarget.name,
        email: result.email,
        tempPassword: result.tempPassword,
        role: result.role,
        status: result.status,
      });
      setCredTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to regenerate password');
    } finally {
      setIsRegenerating(false);
    }
  };

  const activeFilters = (deptFilter ? 1 : 0) + (statusFilter ? 1 : 0) + (positionFilter ? 1 : 0);

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
          <div className="emp-filter-group">
            <label>Designation</label>
            <select value={positionFilter} onChange={e => { setPositionFilter(e.target.value); setPage(1); }}>
              <option value="">All Designations</option>
              {[...new Set(employees.map(e => e.position).filter(Boolean))].sort().map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          {activeFilters > 0 && (
            <button className="emp-filter-clear" onClick={() => { setDeptFilter(''); setStatusFilter(''); setPositionFilter(''); setPage(1); }}>
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
                      <button className="emp-action-btn" title="Login Credentials" onClick={() => setCredTarget(emp)} style={{ color: '#f59e0b' }}>
                        <Key size={15} />
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

      {credTarget && (
        <div className="emp-modal-overlay" onClick={() => !isRegenerating && setCredTarget(null)}>
          <div className="emp-modal" onClick={e => e.stopPropagation()} style={{ padding: '32px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={20} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Login Credentials</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{credTarget.name}</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>{credTarget.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Employee</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                <span className={`emp-status ${credTarget.status.toLowerCase().replace(' ', '-')}`}>{credTarget.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handleRegeneratePassword} disabled={isRegenerating}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RefreshCw size={14} /> {isRegenerating ? 'Regenerating...' : 'Regenerate Temporary Password'}
              </button>
              <button className="btn btn-secondary" onClick={() => setCredTarget(null)} style={{ width: '100%' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {regenResult && !credTarget && (
        <div className="emp-modal-overlay" onClick={() => setRegenResult(null)}>
          <div className="emp-modal" onClick={e => e.stopPropagation()} style={{ padding: '32px', maxWidth: '480px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle size={28} color="#22c55e" />
              </div>
              <h3 style={{ margin: 0 }}>Password Regenerated</h3>
              <p style={{ color: 'var(--text-dim)', marginTop: '6px', fontSize: '0.85rem' }}>
                New temporary password for <strong>{regenResult.name}</strong>
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', marginBottom: '18px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600 }}>{regenResult.email}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Temporary Password</span>
                <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '1px' }}>{regenResult.tempPassword}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{regenResult.role}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Status</span>
                <span className={`emp-status ${regenResult.status.toLowerCase().replace(' ', '-')}`}>{regenResult.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => { navigator.clipboard.writeText(regenResult.email); setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}
              >
                <Copy size={13} /> {copiedEmail ? 'Copied!' : 'Copy Email'}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(regenResult.tempPassword); setCopiedPassword(true); setTimeout(() => setCopiedPassword(false), 2000); }}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}
              >
                <Copy size={13} /> {copiedPassword ? 'Copied!' : 'Copy Password'}
              </button>
            </div>

            <button
              onClick={() => {
                const text = `Name: ${regenResult.name}\nEmail: ${regenResult.email}\nPassword: ${regenResult.tempPassword}\nRole: ${regenResult.role}`;
                navigator.clipboard.writeText(text);
                setCopiedAll(true);
                setTimeout(() => setCopiedAll(false), 2000);
              }}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Copy size={14} /> {copiedAll ? 'Copied!' : 'Copy All Credentials'}
            </button>
            <button className="btn btn-secondary" onClick={() => setRegenResult(null)} style={{ width: '100%' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
