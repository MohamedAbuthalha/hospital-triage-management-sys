import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getLabRequests, updateTestStatus } from '../api/features';
import MessagesPanel from '../components/MessagesPanel';
import Icon from '../components/Icon';

const LabDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: 'in-progress', notes: '', reportUrl: '' });

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => { try { const r = await getLabRequests(); if (r.success) setRequests(r.data); } catch {} };

  const handleUpdate = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await updateTestStatus(selected._id, updateForm);
      if (r.success) { setMsg('Test updated successfully!'); loadRequests(); setSelected(null); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const statusColor = { pending: { bg: '#fef3c7', color: '#92400e' }, 'in-progress': { bg: '#dbeafe', color: '#1d4ed8' }, completed: { bg: '#d1fae5', color: '#065f46' } };

  const tabs = [
    { id: 'dashboard', label: 'Lab Requests', iconName: 'lab'       },
    { id: 'update',    label: 'Update Test',  iconName: 'edit'      },
    { id: 'history',   label: 'History',      iconName: 'list'      },
    { id: 'messages',  label: 'Messages',     iconName: 'messages'  },
  ];

  return (
    <div style={s.root}>
      <nav style={s.nav}>
        <div style={{ ...s.brand, display: "flex", alignItems: "center", gap: 8 }}><Icon name="lab" size="md" color="#5b21b6" /> Lab Dashboard</div>
        <div style={s.navRight}>
          <span style={s.roleTag}>Lab Technician</span>
          <strong>{user?.name}</strong>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>
      <div style={s.layout}>
        <aside style={s.sidebar}>
          {tabs.map(t => <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); setMsg(''); setErr(''); }} style={{ ...s.sideBtn, ...(tab === t.id ? s.sideBtnActive : {}) }}>{t.label}</button>)}
        </aside>
        <main style={s.main}>
          {msg && <div style={s.success}>{msg}</div>}
          {err && <div style={s.error}>{err}</div>}

          {(tab === 'dashboard' || tab === 'history') && (
            <>
              <h2 style={s.title}>{tab === 'dashboard' ? 'Incoming Lab Requests' : 'Test History'}</h2>
              <div style={s.statsRow}>
                <StatCard label="Total" value={requests.length} color="#3b82f6" iconName="labTest" />
                <StatCard label="Pending" value={requests.filter(r => r.status === 'pending').length} color="#f59e0b" iconName="pending" />
                <StatCard label="In Progress" value={requests.filter(r => r.status === 'in-progress').length} color="#8b5cf6" iconName="settings" />
                <StatCard label="Completed" value={requests.filter(r => r.status === 'completed').length} color="#10b981" iconName="success" />
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr style={s.thead}>{['Patient', 'Test Name', 'Requested By', 'Status', 'Date', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {requests.filter(r => tab === 'dashboard' ? r.status !== 'completed' : r.status === 'completed').map(r => {
                      const c = statusColor[r.status] || { bg: '#f1f5f9', color: '#475569' };
                      return (
                        <tr key={r._id} style={s.tr}>
                          <td style={s.td}><strong>{r.patientName}</strong></td>
                          <td style={s.td}>{r.testName}</td>
                          <td style={s.td}>{r.requestedBy || '—'}</td>
                          <td style={s.td}><span style={{ ...s.badge, background: c.bg, color: c.color }}>{r.status}</span></td>
                          <td style={s.td}>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td style={s.td}>
                            {r.status !== 'completed' && (
                              <button style={s.actionBtn} onClick={() => { setSelected(r); setUpdateForm({ status: 'in-progress', notes: r.notes || '', reportUrl: '' }); setTab('update'); }}>Update</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {requests.length === 0 && <p style={s.empty}>No requests found.</p>}
              </div>
            </>
          )}

          {tab === 'update' && (
            <>
              <h2 style={s.title}>Update Test Status</h2>
              {!selected ? (
                <div style={s.selectList}>
                  {requests.filter(r => r.status !== 'completed').map(r => (
                    <div key={r._id} style={s.selectItem} onClick={() => { setSelected(r); setUpdateForm({ status: 'in-progress', notes: r.notes || '', reportUrl: '' }); }}>
                      <div><strong>{r.patientName}</strong> — {r.testName}</div>
                      <span style={{ ...s.badge, background: '#fef3c7', color: '#92400e' }}>{r.status}</span>
                    </div>
                  ))}
                  {requests.filter(r => r.status !== 'completed').length === 0 && <p style={s.empty}>No pending tests.</p>}
                </div>
              ) : (
                <div style={s.card}>
                  <div style={s.selectedInfo}>
                    <strong>Patient:</strong> {selected.patientName} | <strong>Test:</strong> {selected.testName}
                    <button style={{ ...s.clearBtn, display: "flex", alignItems: "center", gap: 4 }} onClick={() => setSelected(null)} aria-label="Clear selection"><Icon name="close" size="xs" color="#7c3aed" /> Clear</button>
                  </div>
                  <form onSubmit={handleUpdate} style={s.form}>
                    <div style={s.field}>
                      <label style={s.label}>Test Status *</label>
                      <select style={s.select} value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Report URL</label>
                      <input style={s.input} value={updateForm.reportUrl} onChange={e => setUpdateForm(f => ({ ...f, reportUrl: e.target.value }))} placeholder="Link to uploaded report" />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Notes</label>
                      <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={updateForm.notes} onChange={e => setUpdateForm(f => ({ ...f, notes: e.target.value }))} placeholder="Lab notes..." />
                    </div>
                    <button type="submit" style={s.submitBtn} disabled={loading}>{loading ? 'Saving...' : 'Update Test'}</button>
                  </form>
                </div>
              )}
            </>
          )}

          {tab === 'messages' && (
            <>
              <h2 style={s.title}>My Messages</h2>
              <MessagesPanel />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, iconName }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', borderTop: `4px solid ${color}` }}>
    <div style={{ width: 44, height: 44, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={iconName} size="lg" color={color} /></div>
    <div><div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{value}</div><div style={{ color: '#64748b', fontSize: '.85rem' }}>{label}</div></div>
  </div>
);

const s = {
  root: { minHeight: '100vh', background: '#f0f4f8', fontFamily: 'system-ui, sans-serif' },
  nav: { background: '#fff', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,.1)', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontWeight: 800, fontSize: '1.2rem', color: '#1e293b' },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  roleTag: { background: '#ede9fe', color: '#5b21b6', padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700 },
  logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 },
  layout: { display: 'flex', minHeight: 'calc(100vh - 60px)' },
  sidebar: { width: 220, background: '#2e1065', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  sideBtn: { background: 'transparent', border: 'none', color: '#c4b5fd', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: '.9rem', fontWeight: 500 },
  sideBtnActive: { background: '#4c1d95', color: '#fff' },
  main: { flex: 1, padding: 32 },
  title: { fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: 20 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: 16, marginBottom: 28 },
  tableWrap: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '.8rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: '.88rem', color: '#334155' },
  badge: { padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 600 },
  actionBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600 },
  selectList: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 },
  selectItem: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', maxWidth: 600 },
  selectedInfo: { background: '#ede9fe', padding: '10px 14px', borderRadius: 8, fontSize: '.88rem', color: '#4c1d95', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  clearBtn: { marginLeft: 'auto', background: 'transparent', border: '1px solid #7c3aed', color: '#7c3aed', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: '.8rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '.82rem', fontWeight: 600, color: '#475569' },
  input: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', outline: 'none', background: '#f8fafc' },
  select: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', background: '#f8fafc', outline: 'none' },
  submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '.95rem', alignSelf: 'flex-start' },
  empty: { textAlign: 'center', padding: 40, color: '#94a3b8' },
  success: { background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  error: { background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};

export default LabDashboard;
