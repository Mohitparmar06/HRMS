import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ columns, data, searchable = true, pageSize = 10 }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(null);

  const filteredData = data.filter(row => {
    if (!search) return true;
    return columns.some(col => {
      const val = col.accessor(row);
      return val && String(val).toLowerCase().includes(search.toLowerCase());
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortCol === null) return 0;
    const col = columns[sortCol];
    const aVal = col.accessor(a);
    const bVal = col.accessor(b);
    const cmp = String(aVal || '').localeCompare(String(bVal || ''), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pagedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (idx) => {
    if (sortCol === idx) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(idx);
      setSortDir('asc');
    }
  };

  return (
    <div className="admin-datatable">
      {searchable && (
        <div className="admin-datatable-toolbar">
          <div className="admin-datatable-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      )}

      <div className="admin-datatable-wrapper">
        <table className="admin-datatable-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} onClick={() => col.sortable !== false && handleSort(idx)}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}>
                  <div className="admin-datatable-th-inner">
                    {col.header}
                    {col.sortable !== false && sortCol === idx && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, rIdx) => (
              <tr key={rIdx}>
                {columns.map((col, cIdx) => (
                  <td key={cIdx}>{col.render ? col.render(row) : col.accessor(row)}</td>
                ))}
              </tr>
            ))}
            {pagedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="admin-datatable-empty">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-datatable-pagination">
          <span className="admin-datatable-info">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="admin-datatable-pages">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
