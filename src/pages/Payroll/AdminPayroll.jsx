import { useState, useMemo, useCallback } from 'react';
import {
  Search, CheckCircle, Clock, DollarSign,
  ChevronDown, ChevronUp, Eye, Check, X, FileText,
  ChevronLeft, ChevronRight, Users, TrendingUp, Wallet,
  Download, Edit3, CreditCard, BadgeCheck, Trash2,
  ArrowLeft, User
} from 'lucide-react';
import { usePayroll } from '../../contexts/PayrollContext';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useDepartments } from '../../contexts/DepartmentContext';
import { useSettings } from '../../contexts/SettingsContext';
import PayrollDetailsModal from '../../components/Payroll/PayrollDetailsModal';
import PayslipModal from '../../components/Payroll/PayslipModal';

const STATUS_CONFIG = {
  Paid: { color: 'var(--success)', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' },
  Pending: { color: 'var(--warning)', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' },
};

const EMPTY_FORM = {
  baseSalary: '', hra: '', transport: '', medical: '',
  specialAllowance: '', bonus: '', overtimePay: '',
  pf: '', incomeTax: '', insurance: '', otherDeductions: '',
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function computeSalary(form) {
  const base = Number(form.baseSalary) || 0;
  const hra = Number(form.hra) || 0;
  const transport = Number(form.transport) || 0;
  const medical = Number(form.medical) || 0;
  const special = Number(form.specialAllowance) || 0;
  const bonus = Number(form.bonus) || 0;
  const overtime = Number(form.overtimePay) || 0;
  const pf = Number(form.pf) || 0;
  const tax = Number(form.incomeTax) || 0;
  const insurance = Number(form.insurance) || 0;
  const other = Number(form.otherDeductions) || 0;

  const allowances = hra + transport + medical + special;
  const totalDeductions = pf + tax + insurance + other;
  const grossSalary = base + allowances + bonus + overtime;
  const netSalary = grossSalary - totalDeductions;

  return { allowances, totalDeductions, grossSalary, netSalary };
}

export default function AdminPayroll() {
  const { records, periods, addRecord, updateRecord, markAsPaid, markMultipleAsPaid, deleteRecord, getPayrollStats } = usePayroll();
  const { employees } = useEmployees();
  const { departments } = useDepartments();
  const { formatCurrency } = useSettings();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortField, setSortField] = useState('employeeName');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [detailRecord, setDetailRecord] = useState(null);
  const [payslipRecord, setPayslipRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [generateModal, setGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ employeeId: '', periodKey: '', ...EMPTY_FORM });
  const [genError, setGenError] = useState('');
  const [historyEmployee, setHistoryEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const perPage = 12;

  const stats = useMemo(() => getPayrollStats(), [records]);

  const genPreview = useMemo(() => computeSalary(genForm), [genForm]);

  const filteredRecords = useMemo(() => {
    let recs = [...records];

    if (historyEmployee) {
      recs = recs.filter(r => r.employeeId === historyEmployee);
    }

    if (activeTab !== 'all') {
      recs = recs.filter(r => r.status === activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    }

    if (search) {
      const q = search.toLowerCase();
      recs = recs.filter(r =>
        r.employeeName?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.employeeId?.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== 'all') recs = recs.filter(r => r.department === deptFilter);
    if (statusFilter !== 'all') recs = recs.filter(r => r.status === statusFilter);
    if (periodFilter !== 'all') recs = recs.filter(r => r.periodKey === periodFilter);

    recs.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'employeeName') cmp = (a.employeeName || '').localeCompare(b.employeeName || '');
      else if (sortField === 'department') cmp = (a.department || '').localeCompare(b.department || '');
      else if (sortField === 'baseSalary') cmp = (a.baseSalary || 0) - (b.baseSalary || 0);
      else if (sortField === 'netSalary') cmp = (a.netSalary || 0) - (b.netSalary || 0);
      else if (sortField === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      else if (sortField === 'period') cmp = (a.periodKey || '').localeCompare(b.periodKey || '');
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return recs;
  }, [records, search, deptFilter, statusFilter, periodFilter, sortField, sortDir, activeTab, historyEmployee]);

  const totalPages = Math.ceil(filteredRecords.length / perPage);
  const paginatedRecords = filteredRecords.slice((page - 1) * perPage, page * perPage);

  const historyEmpName = useMemo(() => {
    if (!historyEmployee) return '';
    return records.find(r => r.employeeId === historyEmployee)?.employeeName || historyEmployee;
  }, [historyEmployee, records]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds([]);
  };

  const tabCounts = useMemo(() => {
    const base = historyEmployee ? records.filter(r => r.employeeId === historyEmployee) : records;
    return {
      all: base.length,
      paid: base.filter(r => r.status === 'Paid').length,
      pending: base.filter(r => r.status === 'Pending').length,
    };
  }, [records, historyEmployee]);

  const handleMarkAsPaid = async (id) => {
    await markAsPaid(id);
  };

  const handleEditClick = (record) => {
    setEditRecord(record);
    setEditForm({
      baseSalary: record.baseSalary,
      bonus: record.bonus,
      overtimePay: record.overtimePay,
      hra: record.hra,
      transport: record.transport,
      medical: record.medical,
      specialAllowance: record.specialAllowance,
      incomeTax: record.incomeTax,
      pf: record.pf,
      insurance: record.insurance,
      otherDeductions: record.otherDeductions,
    });
  };

  const editPreview = useMemo(() => computeSalary(editForm), [editForm]);

  const handleEditSave = async () => {
    if (!editRecord) return;
    const { allowances, totalDeductions, grossSalary, netSalary } = editPreview;

    await updateRecord(editRecord.id, {
      baseSalary: Number(editForm.baseSalary) || 0,
      bonus: Number(editForm.bonus) || 0,
      overtimePay: Number(editForm.overtimePay) || 0,
      hra: Number(editForm.hra) || 0,
      transport: Number(editForm.transport) || 0,
      medical: Number(editForm.medical) || 0,
      specialAllowance: Number(editForm.specialAllowance) || 0,
      incomeTax: Number(editForm.incomeTax) || 0,
      pf: Number(editForm.pf) || 0,
      insurance: Number(editForm.insurance) || 0,
      otherDeductions: Number(editForm.otherDeductions) || 0,
      allowances,
      totalDeductions,
      grossSalary,
      netSalary,
    });
    setEditRecord(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRecords.filter(r => r.status === 'Pending').map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkPay = async () => {
    if (selectedIds.length === 0) return;
    await markMultipleAsPaid(selectedIds);
    setSelectedIds([]);
  };

  const handleGenChange = (field, value) => {
    setGenForm(f => ({ ...f, [field]: value }));
    setGenError('');
  };

  const handleGenerateSubmit = async () => {
    setGenError('');
    const { allowances, totalDeductions, grossSalary, netSalary } = genPreview;
    const selectedPeriod = periods.find(p => p.key === genForm.periodKey);

    if (!genForm.employeeId) { setGenError('Please select an employee'); return; }
    if (!genForm.periodKey) { setGenError('Please select a pay period'); return; }
    if (!genForm.baseSalary || Number(genForm.baseSalary) <= 0) { setGenError('Base salary must be greater than 0'); return; }
    if (netSalary < 0) { setGenError('Net salary cannot be negative. Check deductions.'); return; }

    const result = await addRecord({
      employeeId: genForm.employeeId,
      periodKey: genForm.periodKey,
      period: selectedPeriod?.label || genForm.periodKey,
      baseSalary: Number(genForm.baseSalary) || 0,
      hra: Number(genForm.hra) || 0,
      transport: Number(genForm.transport) || 0,
      medical: Number(genForm.medical) || 0,
      specialAllowance: Number(genForm.specialAllowance) || 0,
      bonus: Number(genForm.bonus) || 0,
      overtimePay: Number(genForm.overtimePay) || 0,
      pf: Number(genForm.pf) || 0,
      incomeTax: Number(genForm.incomeTax) || 0,
      insurance: Number(genForm.insurance) || 0,
      otherDeductions: Number(genForm.otherDeductions) || 0,
      allowances,
      totalDeductions,
      grossSalary,
      netSalary,
    });

    if (result.success) {
      setGenerateModal(false);
      setGenForm({ employeeId: '', periodKey: '', ...EMPTY_FORM });
    } else {
      setGenError(result.message || 'Failed to create payroll');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    await deleteRecord(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="payroll-page">
      <div className="page-header">
        <div className="page-header-left">
          {historyEmployee ? (
            <>
              <button className="btn btn-outline" style={{ marginRight: 12, padding: '6px 12px' }} onClick={() => { setHistoryEmployee(null); setPage(1); }}>
                <ArrowLeft size={16} />
              </button>
              <h1 className="page-title">{historyEmpName}</h1>
            </>
          ) : (
            <h1 className="page-title">Payroll Management</h1>
          )}
          <p className="page-subtitle">
            {historyEmployee ? 'Payroll history for this employee' : 'Process salaries, generate payslips, and manage payments'}
          </p>
        </div>
        <div className="page-header-right">
          {!historyEmployee && (
            <button className="btn btn-primary" onClick={() => { setGenerateModal(true); setGenError(''); }}>
              <Wallet size={16} /> Generate Payroll
            </button>
          )}
        </div>
      </div>

      <div className="payroll-dashboard-cards">
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <DollarSign size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{formatCurrency(stats.totalPayroll)}</span>
            <span className="payroll-stat-label">Total Payroll</span>
          </div>
        </div>
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Users size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{stats.paidCount}</span>
            <span className="payroll-stat-label">Employees Paid</span>
          </div>
        </div>
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{stats.pendingCount}</span>
            <span className="payroll-stat-label">Pending Payments</span>
          </div>
        </div>
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{formatCurrency(stats.totalDeductions)}</span>
            <span className="payroll-stat-label">Total Deductions</span>
          </div>
        </div>
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <BadgeCheck size={22} />
          </div>
          <div className="payroll-stat-info">
            <span className="payroll-stat-value">{formatCurrency(stats.totalBonuses)}</span>
            <span className="payroll-stat-label">Total Bonuses</span>
          </div>
        </div>
      </div>

      <div className="payroll-tabs-section">
        <div className="leave-emp-tabs">
          <button className={`leave-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabChange('all')}>
            <FileText size={16} /> All Records <span className="leave-tab-count">{tabCounts.all}</span>
          </button>
          <button className={`leave-tab ${activeTab === 'paid' ? 'active' : ''}`} onClick={() => handleTabChange('paid')}>
            <CheckCircle size={16} /> Paid <span className="leave-tab-count">{tabCounts.paid}</span>
          </button>
          <button className={`leave-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => handleTabChange('pending')}>
            <Clock size={16} /> Pending <span className="leave-tab-count">{tabCounts.pending}</span>
          </button>
        </div>
        {selectedIds.length > 0 && (
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={handleBulkPay}>
            <CreditCard size={14} /> Mark {selectedIds.length} as Paid
          </button>
        )}
      </div>

      <div className="leave-table-section">
        <div className="leave-filters">
          <div className="leave-search-wrap">
            <Search size={18} className="leave-search-icon" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="leave-search"
            />
          </div>
          {!historyEmployee && (
            <select
              value={periodFilter}
              onChange={e => { setPeriodFilter(e.target.value); setPage(1); }}
              className="leave-filter-select"
            >
              <option value="all">All Periods</option>
              {periods.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          )}
          <select
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            className="leave-filter-select"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="leave-filter-select"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="leave-table-wrap">
          <table className="leave-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === paginatedRecords.filter(r => r.status === 'Pending').length} />
                </th>
                <th onClick={() => toggleSort('employeeName')} className="sortable">
                  Employee <SortIcon field="employeeName" />
                </th>
                <th onClick={() => toggleSort('department')} className="sortable">
                  Department <SortIcon field="department" />
                </th>
                <th onClick={() => toggleSort('period')} className="sortable">
                  Period <SortIcon field="period" />
                </th>
                <th onClick={() => toggleSort('baseSalary')} className="sortable">
                  Basic Salary <SortIcon field="baseSalary" />
                </th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th onClick={() => toggleSort('netSalary')} className="sortable">
                  Net Salary <SortIcon field="netSalary" />
                </th>
                <th onClick={() => toggleSort('status')} className="sortable">
                  Status <SortIcon field="status" />
                </th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map(record => {
                const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Pending;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={record.id}>
                    <td>
                      {record.status === 'Pending' && (
                        <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => handleSelectOne(record.id)} />
                      )}
                    </td>
                    <td>
                      <div className="leave-emp-cell">
                        <div className="leave-emp-avatar" style={{ background: 'var(--primary)' }}>
                          {record.employeeAvatar}
                        </div>
                        <div>
                          <span className="leave-emp-name" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setHistoryEmployee(record.employeeId); setPage(1); setActiveTab('all'); setHistoryEmployee(record.employeeId); }}>
                            {record.employeeName}
                          </span>
                          <span className="leave-emp-id">{record.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="leave-dept-badge">{record.department}</span></td>
                    <td><span className="leave-date">{record.period}</span></td>
                    <td><span className="payroll-salary">{formatCurrency(record.baseSalary)}</span></td>
                    <td><span className="payroll-salary bonus">{record.bonus > 0 ? formatCurrency(record.bonus) : '--'}</span></td>
                    <td><span className="payroll-salary deduction">{formatCurrency(record.totalDeductions)}</span></td>
                    <td><span className="payroll-salary net">{formatCurrency(record.netSalary)}</span></td>
                    <td>
                      <span className="leave-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                        <StatusIcon size={14} /> {record.status}
                      </span>
                    </td>
                    <td><span className="leave-date">{formatDate(record.paymentDate)}</span></td>
                    <td>
                      <div className="leave-action-btns">
                        <button className="leave-action-btn" title="View Details" onClick={() => setDetailRecord(record)}>
                          <Eye size={16} />
                        </button>
                        <button className="leave-action-btn" title="Edit" onClick={() => handleEditClick(record)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="leave-action-btn" title="Download Payslip" onClick={() => setPayslipRecord(record)}>
                          <Download size={16} />
                        </button>
                        {record.status === 'Pending' && (
                          <button className="leave-action-btn approve" title="Mark as Paid" onClick={() => handleMarkAsPaid(record.id)}>
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button className="leave-action-btn" title="Delete" onClick={() => setDeleteConfirm(record)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan="11" className="leave-datatable-empty">No payroll records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="leave-pagination">
          <span className="leave-page-info">
            Showing {filteredRecords.length > 0 ? (page - 1) * perPage + 1 : 0} to {Math.min(page * perPage, filteredRecords.length)} of {filteredRecords.length}
          </span>
          <div className="leave-page-buttons">
            <button className="leave-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} className={`leave-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
            <button className="leave-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {detailRecord && (
        <PayrollDetailsModal record={detailRecord} onClose={() => setDetailRecord(null)} />
      )}

      {payslipRecord && (
        <PayslipModal record={payslipRecord} onClose={() => setPayslipRecord(null)} />
      )}

      {editRecord && (
        <div className="modal-overlay" onClick={() => setEditRecord(null)}>
          <div className="modal-content payroll-edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <Edit3 size={20} color="var(--primary-blue)" />
                <div>
                  <h3>Edit Payroll</h3>
                  <p className="modal-subtitle">{editRecord.employeeName} &bull; {editRecord.period}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setEditRecord(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="payroll-edit-live-preview">
                <div className="payroll-edit-preview-row">
                  <span>Gross Salary</span>
                  <span className="payroll-edit-preview-value">{formatCurrency(editPreview.grossSalary)}</span>
                </div>
                <div className="payroll-edit-preview-row deduction">
                  <span>Total Deductions</span>
                  <span className="payroll-edit-preview-value">-{formatCurrency(editPreview.totalDeductions)}</span>
                </div>
                <div className="payroll-edit-preview-row net">
                  <span>Net Salary</span>
                  <span className="payroll-edit-preview-value">{formatCurrency(editPreview.netSalary)}</span>
                </div>
              </div>

              <div className="payroll-edit-section-label">Earnings</div>
              <div className="payroll-edit-grid">
                <div className="leave-form-group">
                  <label className="leave-form-label">Base Salary</label>
                  <input type="number" className="leave-form-input" value={editForm.baseSalary} onChange={e => setEditForm(f => ({ ...f, baseSalary: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Bonus</label>
                  <input type="number" className="leave-form-input" value={editForm.bonus} onChange={e => setEditForm(f => ({ ...f, bonus: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Overtime Pay</label>
                  <input type="number" className="leave-form-input" value={editForm.overtimePay} onChange={e => setEditForm(f => ({ ...f, overtimePay: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">HRA</label>
                  <input type="number" className="leave-form-input" value={editForm.hra} onChange={e => setEditForm(f => ({ ...f, hra: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Transport</label>
                  <input type="number" className="leave-form-input" value={editForm.transport} onChange={e => setEditForm(f => ({ ...f, transport: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Medical</label>
                  <input type="number" className="leave-form-input" value={editForm.medical} onChange={e => setEditForm(f => ({ ...f, medical: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Special Allowance</label>
                  <input type="number" className="leave-form-input" value={editForm.specialAllowance} onChange={e => setEditForm(f => ({ ...f, specialAllowance: e.target.value }))} />
                </div>
              </div>

              <div className="payroll-edit-section-label deduction">Deductions</div>
              <div className="payroll-edit-grid">
                <div className="leave-form-group">
                  <label className="leave-form-label">Income Tax</label>
                  <input type="number" className="leave-form-input" value={editForm.incomeTax} onChange={e => setEditForm(f => ({ ...f, incomeTax: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">PF</label>
                  <input type="number" className="leave-form-input" value={editForm.pf} onChange={e => setEditForm(f => ({ ...f, pf: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Insurance</label>
                  <input type="number" className="leave-form-input" value={editForm.insurance} onChange={e => setEditForm(f => ({ ...f, insurance: e.target.value }))} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Other Deductions</label>
                  <input type="number" className="leave-form-input" value={editForm.otherDeductions} onChange={e => setEditForm(f => ({ ...f, otherDeductions: e.target.value }))} />
                </div>
              </div>

              <div className="leave-form-actions">
                <button className="btn btn-outline" onClick={() => setEditRecord(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEditSave}>
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {generateModal && (
        <div className="modal-overlay" onClick={() => setGenerateModal(false)}>
          <div className="modal-content payroll-generate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <Wallet size={20} color="var(--primary-blue)" />
                <div>
                  <h3>Generate Payroll</h3>
                  <p className="modal-subtitle">Create a payroll record for a specific employee</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setGenerateModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="leave-form-group">
                <label className="leave-form-label">Employee *</label>
                <select
                  className="leave-form-input"
                  value={genForm.employeeId}
                  onChange={e => handleGenChange('employeeId', e.target.value)}
                >
                  <option value="">Select employee</option>
                  {employees.filter(e => e.status === 'Active').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              </div>

              <div className="leave-form-group">
                <label className="leave-form-label">Pay Period *</label>
                <select
                  className="leave-form-input"
                  value={genForm.periodKey}
                  onChange={e => handleGenChange('periodKey', e.target.value)}
                >
                  <option value="">Select period</option>
                  {periods.map(p => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="payroll-edit-live-preview" style={{ marginBottom: 16 }}>
                <div className="payroll-edit-preview-row">
                  <span>Gross Salary</span>
                  <span className="payroll-edit-preview-value">{formatCurrency(genPreview.grossSalary)}</span>
                </div>
                <div className="payroll-edit-preview-row deduction">
                  <span>Total Deductions</span>
                  <span className="payroll-edit-preview-value">-{formatCurrency(genPreview.totalDeductions)}</span>
                </div>
                <div className="payroll-edit-preview-row net">
                  <span>Net Salary</span>
                  <span className="payroll-edit-preview-value">{formatCurrency(genPreview.netSalary)}</span>
                </div>
              </div>

              <div className="payroll-edit-section-label">Earnings</div>
              <div className="payroll-edit-grid">
                <div className="leave-form-group">
                  <label className="leave-form-label">Base Salary *</label>
                  <input type="number" className="leave-form-input" value={genForm.baseSalary} onChange={e => handleGenChange('baseSalary', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">HRA</label>
                  <input type="number" className="leave-form-input" value={genForm.hra} onChange={e => handleGenChange('hra', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Transport</label>
                  <input type="number" className="leave-form-input" value={genForm.transport} onChange={e => handleGenChange('transport', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Medical</label>
                  <input type="number" className="leave-form-input" value={genForm.medical} onChange={e => handleGenChange('medical', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Special Allowance</label>
                  <input type="number" className="leave-form-input" value={genForm.specialAllowance} onChange={e => handleGenChange('specialAllowance', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Bonus</label>
                  <input type="number" className="leave-form-input" value={genForm.bonus} onChange={e => handleGenChange('bonus', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Overtime Pay</label>
                  <input type="number" className="leave-form-input" value={genForm.overtimePay} onChange={e => handleGenChange('overtimePay', e.target.value)} />
                </div>
              </div>

              <div className="payroll-edit-section-label deduction">Deductions</div>
              <div className="payroll-edit-grid">
                <div className="leave-form-group">
                  <label className="leave-form-label">Income Tax</label>
                  <input type="number" className="leave-form-input" value={genForm.incomeTax} onChange={e => handleGenChange('incomeTax', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">PF</label>
                  <input type="number" className="leave-form-input" value={genForm.pf} onChange={e => handleGenChange('pf', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Insurance</label>
                  <input type="number" className="leave-form-input" value={genForm.insurance} onChange={e => handleGenChange('insurance', e.target.value)} />
                </div>
                <div className="leave-form-group">
                  <label className="leave-form-label">Other Deductions</label>
                  <input type="number" className="leave-form-input" value={genForm.otherDeductions} onChange={e => handleGenChange('otherDeductions', e.target.value)} />
                </div>
              </div>

              {genError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 8, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
                  {genError}
                </div>
              )}

              <div className="leave-form-actions">
                <button className="btn btn-outline" onClick={() => setGenerateModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleGenerateSubmit}>
                  <Check size={16} /> Generate Payroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <Trash2 size={20} color="var(--danger)" />
                <div>
                  <h3>Delete Payroll Record</h3>
                  <p className="modal-subtitle">This action cannot be undone</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                Are you sure you want to delete the payroll record for <strong>{deleteConfirm.employeeName}</strong> ({deleteConfirm.period})?
              </p>
              <div className="leave-form-actions">
                <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDeleteConfirm}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
