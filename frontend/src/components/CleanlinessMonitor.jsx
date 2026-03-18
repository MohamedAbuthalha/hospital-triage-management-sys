/**
 * CleanlinessMonitor.jsx
 * ──────────────────────
 * Admin-facing panel for monitoring hospital cleanliness reports.
 * Embedded inside the existing Admin dashboard as a new tab.
 *
 * Features:
 *  - Table of all reports (Date, Warden, Status, View button)
 *  - Detail modal: full department breakdown with green/red highlight
 *  - Filter by status: All / Clean / Attention Required
 */

import { useState, useEffect } from 'react';
import { getCleanReports } from '../api/features';
import Icon from './Icon';

// ── Colour tokens ──────────────────────────────────────────────────────────────
const C = {
  clean:      { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  attention:  { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  neutral:    { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  });

const statusStyle = (status) =>
  status === 'Clean' ? C.clean : C.attention;

// ── Sub-component: Department detail row ──────────────────────────────────────
const DeptRow = ({ dept }) => {
  const cs = statusStyle(dept.status);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 130px 1fr',
      gap: 12,
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: 8,
      background: cs.bg,
      border: `1px solid ${cs.border}`,
    }}>
      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '.9rem' }}>{dept.name}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontWeight: 700, color: cs.text, fontSize: '.85rem',
      }}>
        <Icon name={dept.status === 'Clean' ? 'success' : 'error'} size="xs" color={dept.status === 'Clean' ? 'success' : 'error'} /> {dept.status}
      </span>
      <span style={{ color: '#475569', fontSize: '.82rem' }}>
        {dept.notes || <em style={{ color: '#94a3b8' }}>No notes</em>}
      </span>
    </div>
  );
};

// ── Sub-component: Report detail modal ────────────────────────────────────────
const ReportModal = ({ report, onClose }) => {
  if (!report) return null;
  const cs = statusStyle(report.overallStatus);

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.box} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ ...ms.header, background: cs.bg, borderBottom: `2px solid ${cs.border}` }}>
          <div>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="hospital" size="md" color="#0891b2" /> Cleanliness Report Detail</span>
            </h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '.82rem' }}>
              {fmt(report.createdAt)}
            </p>
          </div>
          <button onClick={onClose} style={{ ...ms.closeBtn, display: 'flex', alignItems: 'center' }} aria-label="Close"><Icon name="close" size="md" color="secondary" /></button>
        </div>

        {/* Meta */}
        <div style={ms.meta}>
          <div style={ms.metaItem}>
            <span style={ms.metaLabel}>Warden</span>
            <span style={ms.metaVal}>{report.wardenId?.name || 'Unknown'}</span>
          </div>
          <div style={ms.metaItem}>
            <span style={ms.metaLabel}>Overall Status</span>
            <span style={{
              ...ms.statusBadge,
              background: cs.bg,
              color: cs.text,
              border: `1.5px solid ${cs.border}`,
            }}>
              <Icon name={report.overallStatus === 'Clean' ? 'success' : 'warning'} size="xs" color={report.overallStatus === 'Clean' ? 'success' : 'warning'} /> {report.overallStatus}
            </span>
          </div>
          <div style={ms.metaItem}>
            <span style={ms.metaLabel}>Departments</span>
            <span style={ms.metaVal}>{report.departments?.length}</span>
          </div>
        </div>

        {/* Department breakdown */}
        <h4 style={{ margin: '0 0 10px', color: '#334155', fontSize: '.9rem', fontWeight: 700 }}>
          Department Breakdown
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {report.departments?.map((d, i) => <DeptRow key={i} dept={d} />)}
        </div>
      </div>
    </div>
  );
};

const ms = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16,
  },
  box: {
    background: '#fff', borderRadius: 16,
    width: '100%', maxWidth: 680,
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,.2)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' },
  closeBtn: { background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', padding: 4 },
  meta: { display: 'flex', gap: 24, padding: '16px 24px', borderBottom: '1px solid #f1f5f9', marginBottom: 20 },
  metaItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  metaLabel: { fontSize: '.73rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.04em' },
  metaVal: { fontWeight: 600, color: '#1e293b', fontSize: '.9rem' },
  statusBadge: { padding: '4px 12px', borderRadius: 99, fontWeight: 700, fontSize: '.82rem', display: 'inline-block' },
};

// ── Main component ─────────────────────────────────────────────────────────────
const CleanlinessMonitor = () => {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);   // report shown in modal
  const [filter, setFilter]         = useState('all');   // 'all' | 'Clean' | 'Attention Required'
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (pg = 1, status = filter) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (status !== 'all') params.status = status;
      const r = await getCleanReports(params);
      if (r.success) {
        setReports(r.data.reports);
        setPagination(r.data.pagination || {});
        setPage(pg);
      }
    } catch { /* silently fail – network error */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1, filter); }, [filter]);

  // ── Summary counts ───────────────────────────────────────────────────────────
  const totalClean     = reports.filter(r => r.overallStatus === 'Clean').length;
  const totalAttention = reports.filter(r => r.overallStatus === 'Attention Required').length;

  return (
    <div>
      <h2 style={{ ...s.title, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="cleaning" size="lg" color="secondary" /> Cleanliness Monitor</h2>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: '.88rem' }}>
        Live overview of all warden-submitted cleanliness reports.
      </p>

      {/* Summary cards */}
      <div style={s.statsRow}>
        <SummaryCard label="Total Reports"      value={pagination.total || reports.length} color="#3b82f6" iconName="list" />
        <SummaryCard label="Clean"              value={totalClean}      color="#10b981" iconName="success" />
        <SummaryCard label="Attention Required" value={totalAttention}  color="#ef4444" iconName="warning" />
      </div>

      {/* Filter bar */}
      <div style={s.filterBar}>
        {['all', 'Clean', 'Attention Required'].map(opt => (
          <button
            key={opt}
            style={{ ...s.filterBtn, ...(filter === opt ? s.filterActive : {}) }}
            onClick={() => setFilter(opt)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {opt === 'all' ? <Icon name="list" size="xs" color="secondary" /> : opt === 'Clean' ? <Icon name="success" size="xs" color="success" /> : <Icon name="warning" size="xs" color="warning" />}
              {opt === 'all' ? 'All' : opt === 'Clean' ? 'Clean Only' : 'Attention Only'}
            </span>
          </button>
        ))}
        <button style={{ ...s.filterBtn, marginLeft: 'auto' }} onClick={() => load(1, filter)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="settings" size="xs" color="secondary" /> Refresh</span>
        </button>
      </div>

      {/* Reports table */}
      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.loading}>Loading reports…</div>
        ) : reports.length === 0 ? (
          <div style={s.empty}>No reports found.</div>
        ) : (
          <table style={s.table}>
            <thead style={s.thead}>
              <tr>
                <th style={s.th}>Date & Time</th>
                <th style={s.th}>Warden</th>
                <th style={s.th}>Departments</th>
                <th style={s.th}>Overall Status</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => {
                const cs = statusStyle(r.overallStatus);
                return (
                  <tr key={r._id} style={s.tr}>
                    <td style={s.td}>{fmt(r.createdAt)}</td>
                    <td style={s.td}>
                      <span style={s.wardenName}>{r.wardenId?.name || 'Unknown'}</span>
                      <span style={s.wardenEmail}>{r.wardenId?.email || ''}</span>
                    </td>
                    <td style={s.td}>{r.departments?.length} dept(s)</td>
                    <td style={s.td}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 12px', borderRadius: 99, fontWeight: 700,
                        fontSize: '.8rem', background: cs.bg, color: cs.text,
                        border: `1px solid ${cs.border}`,
                      }}>
                        <Icon name={r.overallStatus === 'Clean' ? 'success' : 'warning'} size="xs" color={r.overallStatus === 'Clean' ? 'success' : 'warning'} /> {r.overallStatus}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.viewBtn}
                        onClick={() => setSelected(r)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="eye" size="xs" color="white" /> View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={s.pagination}>
          <button
            style={s.pgBtn}
            disabled={page <= 1}
            onClick={() => load(page - 1, filter)}
          >← Prev</button>
          <span style={s.pgInfo}>Page {page} of {pagination.pages}</span>
          <button
            style={s.pgBtn}
            disabled={page >= pagination.pages}
            onClick={() => load(page + 1, filter)}
          >Next →</button>
        </div>
      )}

      {/* Detail modal */}
      {selected && <ReportModal report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

// ── Tiny summary card ──────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color, iconName }) => (
  <div style={{
    background: '#fff', borderRadius: 12, padding: '18px 22px',
    display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,.06)',
    borderTop: `4px solid ${color}`,
  }}>
    <div style={{ width: 44, height: 44, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={iconName} size="lg" color={color} /></div>
    <div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '.83rem' }}>{label}</div>
    </div>
  </div>
);

const s = {
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: 6 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 16, marginBottom: 24 },
  filterBar: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' },
  filterBtn: {
    background: '#f1f5f9', border: '1.5px solid #e2e8f0',
    borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
    fontSize: '.84rem', fontWeight: 600, color: '#475569',
  },
  filterActive: {
    background: '#1e293b', color: '#fff', borderColor: '#1e293b',
  },
  tableWrap: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '.04em' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '13px 16px', fontSize: '.87rem', color: '#334155', verticalAlign: 'middle' },
  wardenName: { display: 'block', fontWeight: 600, color: '#1e293b', fontSize: '.88rem' },
  wardenEmail: { display: 'block', color: '#94a3b8', fontSize: '.76rem' },
  viewBtn: {
    background: '#3b82f6', color: '#fff', border: 'none',
    borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
    fontSize: '.82rem', fontWeight: 600,
  },
  loading: { padding: 40, textAlign: 'center', color: '#94a3b8' },
  empty:   { padding: 40, textAlign: 'center', color: '#94a3b8' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 },
  pgBtn: { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '.85rem', color: '#475569' },
  pgInfo: { color: '#64748b', fontSize: '.85rem' },
};

export default CleanlinessMonitor;
