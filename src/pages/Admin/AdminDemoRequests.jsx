import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, Eye, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2,
  User, Mail, Phone, Building2, Calendar, Users, AlertTriangle, X, Loader2,
} from 'lucide-react';
import { useDemoRequests } from '../../contexts/DemoRequestContext';

const STATUS_CONFIG = {
  Pending: { color: 'var(--warning)', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' },
  Approved: { color: 'var(--primary)', icon: CheckCircle, bg: 'rgba(99, 102, 241, 0.1)' },
  Rejected: { color: 'var(--danger)', icon: XCircle, bg: 'rgba(239, 68, 68, 0.1)' },
  Completed: { color: 'var(--success)', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' },
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDemoRequests() {
  const { requests, stats, loading, fetchRequests, approveRequest, rejectRequest, completeRequest, deleteRequest } = useDemoRequests();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [detailRequest, setDetailRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const perPage = 10;

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (activeTab !== 'All') params.status = activeTab;
    params.sortBy = sortField;
    params.sortOrder = sortDir;
    params.page = page;
    params.limit = perPage;
    fetchRequests(params);
  }, [search, activeTab, sortField, sortDir, page, fetchRequests]);

  const filtered = useMemo(() => {
    let recs = [...requests];
    if (search) {
      const q = search.toLowerCase();
      recs = recs.filter(r =>
        r.fullName?.toLowerCase().includes(q) ||
        r.company?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') recs = recs.filter(r => r.status === statusFilter);
    return recs;
  }, [requests, search, statusFilter]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  const handleApprove = async (id) => {
    const res = await approveRequest(id, actionNote);
    if (res.success) {
      setDetailRequest(prev => prev ? { ...prev, status: 'Approved' } : null);
      setActionNote('');
    }
  };

  const handleReject = async (id) => {
    const res = await rejectRequest(id, actionNote);
    if (res.success) {
      setDetailRequest(prev => prev ? { ...prev, status: 'Rejected' } : null);
      setActionNote('');
    }
  };

  const handleComplete = async (id) => {
    const res = await completeRequest(id, actionNote);
    if (res.success) {
      setDetailRequest(prev => prev ? { ...prev, status: 'Completed' } : null);
      setActionNote('');
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteRequest(id);
    if (res.success) {
      setDeleteConfirm(null);
      setDetailRequest(null);
    }
  };

  const TABS = [
    { key: 'All', label: 'All', count: stats.total },
    { key: 'Pending', label: 'Pending', count: stats.pending },
    { key: 'Approved', label: 'Approved', count: stats.approved },
    { key: 'Rejected', label: 'Rejected', count: stats.rejected },
    { key: 'Completed', label: 'Completed', count: stats.completed },
  ];

  return (
    <div className="leave-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Demo Requests</h1>
          <p className="page-subtitle">Manage incoming demo requests from the landing page</p>
        </div>
      </div>

      <div className="leave-dashboard-cards">
        {TABS.map(tab => {
          const iconMap = { All: Users, Pending: Clock, Approved: CheckCircle, Rejected: XCircle, Completed: CheckCircle };
          const colorMap = { All: 'var(--primary)', Pending: 'var(--warning)', Approved: 'var(--primary)', Rejected: 'var(--danger)', Completed: 'var(--success)' };
          const bgMap = { All: 'rgba(99, 102, 241, 0.1)', Pending: 'rgba(245, 158, 11, 0.1)', Approved: 'rgba(99, 102, 241, 0.1)', Rejected: 'rgba(239, 68, 68, 0.1)', Completed: 'rgba(16, 185, 129, 0.1)' };
          const Icon = iconMap[tab.key];
          return (
            <div key={tab.key} className="leave-stat-card" onClick={() => { setActiveTab(tab.key); setStatusFilter(tab.key); setPage(1); }} style={{ cursor: 'pointer' }}>
              <div className="leave-stat-icon" style={{ background: bgMap[tab.key], color: colorMap[tab.key] }}>
                <Icon size={22} />
              </div>
              <div className="leave-stat-info">
                <span className="leave-stat-value">{tab.count}</span>
                <span className="leave-stat-label">{tab.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="leave-filters">
        <div className="leave-search">
          <Search size={16} />
          <input type="text" placeholder="Search by name, company, or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="leave-filter-group">
          <Filter size={16} />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setActiveTab(e.target.value); setPage(1); }}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="leave-tabs" style={{ marginBottom: 16 }}>
        {TABS.map(tab => (
          <button key={tab.key} className={`leave-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setStatusFilter(tab.key); setPage(1); }}>
            {tab.label}
            <span className="leave-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={24} className="spin" style={{ color: 'var(--text-muted)' }} />
        </div>
      ) : (
        <div className="leave-table-container">
          <table className="leave-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('fullName')} style={{ cursor: 'pointer' }}>Name <SortIcon field="fullName" /></th>
                <th onClick={() => toggleSort('company')} style={{ cursor: 'pointer' }}>Company <SortIcon field="company" /></th>
                <th>Email</th>
                <th>Phone</th>
                <th onClick={() => toggleSort('status')} style={{ cursor: 'pointer' }}>Status <SortIcon field="status" /></th>
                <th onClick={() => toggleSort('createdAt')} style={{ cursor: 'pointer' }}>Submitted <SortIcon field="createdAt" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No demo requests found
                  </td>
                </tr>
              ) : filtered.map(req => {
                const StatusIcon = STATUS_CONFIG[req.status]?.icon || Clock;
                const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
                return (
                  <tr key={req._id}>
                    <td style={{ fontWeight: 600 }}>{req.fullName}</td>
                    <td>{req.company || '--'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{req.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{req.phone || '--'}</td>
                    <td>
                      <span className="leave-status-badge" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                        <StatusIcon size={12} /> {req.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(req.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setDetailRequest(req)}>
                          <Eye size={12} /> View
                        </button>
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          onClick={() => setDeleteConfirm(req)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailRequest && (
        <div className="modal-overlay" onClick={() => { setDetailRequest(null); setActionNote(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="leave-reject-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--primary)' }}>
                  <User size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3>{detailRequest.fullName}</h3>
                  <p className="modal-subtitle">{detailRequest.company || 'No company'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => { setDetailRequest(null); setActionNote(''); }}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="detail-field">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={12} /> Email
                  </label>
                  <span style={{ fontSize: '0.9rem' }}>{detailRequest.email}</span>
                </div>
                <div className="detail-field">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={12} /> Phone
                  </label>
                  <span style={{ fontSize: '0.9rem' }}>{detailRequest.phone || '--'}</span>
                </div>
                <div className="detail-field">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={12} /> Team Size
                  </label>
                  <span style={{ fontSize: '0.9rem' }}>{detailRequest.teamSize || 'Not specified'}</span>
                </div>
                <div className="detail-field">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} /> Preferred Date
                  </label>
                  <span style={{ fontSize: '0.9rem' }}>{detailRequest.preferredDate || 'Not set'}</span>
                </div>
                <div className="detail-field">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} /> Preferred Time
                  </label>
                  <span style={{ fontSize: '0.9rem' }}>{detailRequest.preferredTime || 'Not set'}</span>
                </div>
                <div className="detail-field">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Message
                  </label>
                  <span style={{ fontSize: '0.9rem', color: detailRequest.message ? 'white' : 'var(--text-dim)' }}>
                    {detailRequest.message || 'No message'}
                  </span>
                </div>
              </div>

              {detailRequest.statusNote && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Note: {detailRequest.statusNote}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', minHeight: 60 }}
                  placeholder="Add a note (optional)..."
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Submitted {formatDate(detailRequest.createdAt)}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {detailRequest.status === 'Pending' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={() => handleApprove(detailRequest._id)}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleReject(detailRequest._id)}>
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {detailRequest.status === 'Approved' && (
                    <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem', background: 'var(--success)' }} onClick={() => handleComplete(detailRequest._id)}>
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                  )}
                  <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(detailRequest)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content leave-reject-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="leave-reject-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)' }}>
                  <AlertTriangle size={24} color="var(--danger)" />
                </div>
                <div>
                  <h3>Delete Demo Request</h3>
                  <p className="modal-subtitle">{deleteConfirm.fullName} at {deleteConfirm.company || 'No company'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Are you sure you want to delete this demo request? This action cannot be undone.
              </p>
              <div className="leave-form-actions">
                <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>
                  <Trash2 size={16} /> Delete Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
