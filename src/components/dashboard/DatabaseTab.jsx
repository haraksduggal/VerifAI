import React, { useState, useEffect, useCallback } from 'react';
import { getAllQRs, deleteAllQRs } from '../../utils/storage.js';
import ConfirmModal from './ConfirmModal.jsx';
import { useToast } from './Toast.jsx';

function StatusBadge({ status }) {
  const label = status === 'active' ? 'Active' : status === 'dead' ? 'Dead' : 'Scanned';
  return <span className={`status-badge ${status}`}>{label}</span>;
}

function EmptyState({ filtered }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      </div>
      {filtered ? (
        <>
          <h3>No matching records</h3>
          <p>Try adjusting your search or filter to find what you're looking for.</p>
        </>
      ) : (
        <>
          <h3>No QR codes yet</h3>
          <p>Head to the Generate tab to create your first one-time QR code and start securing products.</p>
        </>
      )}
    </div>
  );
}

export default function DatabaseTab() {
  const addToast = useToast();
  const [data,        setData]        = useState([]);
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal,   setShowModal]   = useState(false);

  const reload = useCallback(() => setData(getAllQRs()), []);
  useEffect(() => { reload(); }, [reload]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handler = () => reload();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [reload]);

  const handleClearAll = () => {
    deleteAllQRs();
    setData([]);
    setShowModal(false);
    addToast({ type: 'info', title: 'Database Cleared', message: 'All QR records have been deleted' });
  };

  const filtered = data.filter(qr => {
    const matchSearch = !search ||
      qr.productName.toLowerCase().includes(search.toLowerCase()) ||
      qr.productId.toLowerCase().includes(search.toLowerCase()) ||
      qr.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || qr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:  data.length,
    active: data.filter(q => q.status === 'active').length,
    dead:   data.filter(q => q.status === 'dead').length,
  };

  return (
    <div className="tab-panel">
      <div className="section-header">
        <h2>QR Database</h2>
        <p>All registered product QR codes. Active codes are awaiting first scan; dead codes have been verified.</p>
      </div>

      {/* Summary stats */}
      {data.length > 0 && (
        <div className="db-summary">
          <div className="db-stat">
            <div className="db-stat-value">{stats.total}</div>
            <div className="db-stat-label">Total</div>
          </div>
          <div className="db-stat" style={{ borderColor: 'rgba(0,168,84,0.3)' }}>
            <div className="db-stat-value" style={{ color: 'var(--success)' }}>{stats.active}</div>
            <div className="db-stat-label">Active</div>
          </div>
          <div className="db-stat" style={{ borderColor: 'rgba(217,43,43,0.3)' }}>
            <div className="db-stat-value" style={{ color: 'var(--danger)' }}>{stats.dead}</div>
            <div className="db-stat-label">Dead</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="db-toolbar">
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, ID, or manufacturer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="dead">Dead</option>
        </select>

        {data.length > 0 && (
          <button className="btn-danger" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Clear All
          </button>
        )}
      </div>

      {/* Table / empty */}
      {data.length === 0 ? (
        <EmptyState filtered={false} />
      ) : filtered.length === 0 ? (
        <EmptyState filtered={true} />
      ) : (
        <div className="db-table-wrapper">
          <table className="db-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Product ID</th>
                <th>Manufacturer</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(qr => (
                <tr key={qr.id}>
                  <td className="db-table-name">{qr.productName}</td>
                  <td className="db-table-id">{qr.productId}</td>
                  <td>{qr.manufacturer}</td>
                  <td><StatusBadge status={qr.status} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {new Date(qr.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ConfirmModal
          title="Clear all QR data?"
          message={`This will permanently delete all ${data.length} QR record${data.length !== 1 ? 's' : ''} from the database. This action cannot be undone.`}
          confirmLabel="Yes, Clear All"
          onConfirm={handleClearAll}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
