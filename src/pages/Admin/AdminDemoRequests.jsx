import { useState, useMemo } from 'react';
import {
  Search, Filter, Eye, CheckCircle, Clock, MessageSquare,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2,
  User, Mail, Phone, Building2, Calendar, Users, AlertTriangle, X
} from 'lucide-react';
import { useDemoRequests } from '../../contexts/DemoRequestContext';

const STATUS_CONFIG = {
  Pending: { color: 'var(--warning)', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' },
  Viewed: { color: 'var(--primary)', icon: Eye, bg: 'rgba(99, 102, 241, 0.1)' },
  Contacted: { color: 'var(--success)', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' },
  Scheduled: { color: '#8b5cf6', icon: Calendar, bg: 'rgba(139, 92, 246, 0.1)' },
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDemoRequests() {
  const { requests, markAsViewed, markAsContacted, markAsScheduled, deleteRequest, getStats } = useDemoRequests();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [detailRequest, setDetailRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const perPage = 10;

  const stats = useMemo(() => getStats(), [requests]);

  const filtered = useMemo(() => {
    let recs = [...requests];

    if (activeTab !== 'all') {
      recs = recs.filter(r => r.status === activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    }

    if (search) {
      const q = search.toLowerCase();
      recs = recs.filter(r =>
        r.fullName?.toLowerCase().includes(q) ||
        r.companyName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') recs = recs.filter(r => r.status === statusFilter);

    recs.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'fullName') cmp = (a.fullName || '').localeCompare(b.fullName || '');
      else if (sortField === 'companyName') cmp = (a.companyName || '').localeCompare(b.companyName || '');
      else if (sortField === 'submittedAt') cmp = (a.submittedAt || '').localeCompare(b.submittedAt || '');
      else if (sortField === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return recs;
  }, [requests, search, statusFilter, sortField, sortDir, activeTab]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  const handleView = (req) => {
    if (req.status === 'Pending') markAsViewed(req.id);
    setDetailRequest(req);
  };

  const handleDelete = (id) => {
    deleteRequest(id);
    setDeleteConfirm(null);
    setDetailRequest(null);
  };

  return (
    <div className="leave-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Demo Requests</h1>
          <p className="page-subtitle">Manage incoming demo requests from the landing page</p>
        </div>
      </div>

      <div className="leave-dashboard-cards">
        <div className="leave-stat-card" onClick={() => setActiveTab('all')} style={{ cursor: 'pointer' }}>
          <div className="leave-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Users size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{stats.total}</span>
            <span className="leave-stat-label">Total Requests</span>
          </div>
        </div>
        <div className="leave-stat-card" onClick={() => setActiveTab('pending')} style={{ cursor: 'pointer' }}>
          <div className="leave-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{stats.pending}</span>
            <span className="leave-stat-label">Pending</span>
          </div>
        </div>
        <div className="leave-stat-card" onClick={() => setActiveTab('contacted')} style={{ cursor: 'pointer' }}>
          <div className="leave-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{stats.contacted}</span>
            <span className="leave-stat-label">Contacted</span>
          </div>
        </div>
        <div className="leave-stat-card" onClick={() => setActiveTab('scheduled')} style={{ cursor: 'pointer' }}>
          <div className="leave-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Calendar size={22} />
          </div>
          <div className="leave-stat-info">
            <span className="leave-stat-value">{stats.scheduled}</span>
            <span className="leave-stat-label">Scheduled</span>
          </div>
        </div>
      </div>

      <div className="leave-filters">
        <div className="leave-search">
          <Search size={16} />
          <input type="text" placeholder="Search by name, company, or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="leave-filter-group">
          <Filter size={16} />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Viewed">Viewed</option>
            <option value="Contacted">Contacted</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      <div className="leave-tabs" style={{ marginBottom: 16 }}>
        {['all', 'pending', 'viewed', 'contacted', 'scheduled'].map(tab => (
          <button key={tab} className={`leave-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setPage(1); }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="leave-tab-count">
              {tab === 'all' ? requests.length : requests.filter(r => r.status === tab.charAt(0).toUpperCase() + tab.slice(1)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="leave-table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('fullName')} style={{ cursor: 'pointer' }}>Name <SortIcon field="fullName" /></th>
              <th onClick={() => toggleSort('companyName')} style={{ cursor: 'pointer' }}>Company <SortIcon field="companyName" /></th>
              <th>Email</th>
              <th>Phone</th>
              <th onClick={() => toggleSort('status')} style={{ cursor: 'pointer' }}>Status <SortIcon field="status" /></th>
              <th onClick={() => toggleSort('submittedAt')} style={{ cursor: 'pointer' }}>Submitted <SortIcon field="submittedAt" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  No demo requests found
                </td>
              </tr>
            ) : paginated.map(req => {
              const StatusIcon = STATUS_CONFIG[req.status]?.icon || Clock;
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
              return (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>{req.fullName}</td>
                  <td>{req.companyName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{req.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{req.phone || '--'}</td>
                  <td>
                    <span className="leave-status-badge" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                      <StatusIcon size={12} /> {req.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(req.submittedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => handleView(req)}>
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

      {totalPages > 1 && (
        <div className="leave-pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </div>
      )}

      {detailRequest && (
        <div className="modal-overlay" onClick={() => setDetailRequest(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="leave-reject-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--primary)' }}>
                  <User size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3>{detailRequest.fullName}</h3>
                  <p className="modal-subtitle">{detailRequest.companyName}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDetailRequest(null)}><X size={20} /></button>
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
                    <MessageSquare size={12} /> Message
                  </label>
                  <span style={{ fontSize: '0.9rem', color: detailRequest.message ? 'white' : 'var(--text-dim)' }}>
                    {detailRequest.message || 'No message'}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Submitted {formatDate(detailRequest.submittedAt)}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {detailRequest.status !== 'Contacted' && (
                    <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={() => { markAsContacted(detailRequest.id); setDetailRequest({ ...detailRequest, status: 'Contacted' }); }}>
                      <CheckCircle size={14} /> Mark Contacted
                    </button>
                  )}
                  {detailRequest.status !== 'Scheduled' && (
                    <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#8b5cf6', color: '#8b5cf6' }} onClick={() => { markAsScheduled(detailRequest.id); setDetailRequest({ ...detailRequest, status: 'Scheduled' }); }}>
                      <Calendar size={14} /> Schedule Demo
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
                  <p className="modal-subtitle">{deleteConfirm.fullName} at {deleteConfirm.companyName}</p>
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
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
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
