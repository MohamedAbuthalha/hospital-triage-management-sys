import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getNursePatients, updateVitals, updateCareStatus } from '../api/features';
import MessagesPanel from '../components/MessagesPanel';
import Icon from '../components/Icon';

const NurseDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({ bp: '', temperature: '', pulse: '' });
  const [careForm, setCareForm] = useState({ careStatus: 'pending', status: 'waiting' });

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try { const r = await getNursePatients(); if (r.success) setPatients(r.data); } catch {}
  };

  const handleUpdateVitals = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await updateVitals(selectedPatient._id, vitalsForm);
      if (r.success) { setMsg('Vitals updated!'); loadPatients(); setSelectedPatient(null); setVitalsForm({ bp: '', temperature: '', pulse: '' }); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to update vitals'); }
    finally { setLoading(false); }
  };

  const handleUpdateCare = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await updateCareStatus(selectedPatient._id, careForm);
      if (r.success) { setMsg('Care status updated!'); loadPatients(); setSelectedPatient(null); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to update care'); }
    finally { setLoading(false); }
  };

  const careColors = { pending: '#f59e0b', 'in-care': '#3b82f6', stable: '#10b981', critical: '#ef4444' };
  const patientStatusColors = { waiting: '#f59e0b', assigned: '#3b82f6', 'in-progress': '#8b5cf6', completed: '#10b981' };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard',     iconName: 'home'      },
    { id: 'vitals',    label: 'Update Vitals', iconName: 'vitals'    },
    { id: 'care',      label: 'Care Status',   iconName: 'heart'     },
    { id: 'messages',  label: 'Messages',      iconName: 'messages'  },
  ];

  return (
    <div style={s.root} className="page-root">
      <nav style={s.nav} className="page-nav">
        <div style={{ ...s.brand, display: "flex", alignItems: "center", gap: 8 }}><Icon name="stethoscope" size="md" color="#065f46" /> Nurse Station</div>
        <div style={s.navRight}>
          <span style={s.roleTag}>Nurse</span>
          <strong>{user?.name}</strong>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>
      <div style={s.layout} className="page-layout">
        <aside style={s.sidebar} className="page-sidebar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedPatient(null); setMsg(''); setErr(''); }}
              style={{ ...s.sideBtn, ...(tab === t.id ? s.sideBtnActive : {}), display: 'flex', alignItems: 'center', gap: 8 }} className="page-sidebar-btn"><Icon name={t.iconName} size="sm" color={tab === t.id ? '#fff' : '#a7f3d0'} /> {t.label}</button>
          ))}
        </aside>
        <main style={s.main} className="page-main">
          {msg && <div style={s.success}>{msg}</div>}
          {err && <div style={s.error}>{err}</div>}

          {tab === 'dashboard' && (
            <>
              <h2 style={s.title}>Patient Overview</h2>
              <div style={s.statsRow}>
                <StatCard label="Total Patients" value={patients.length} color="#3b82f6" iconName="patient" />
                <StatCard label="Waiting" value={patients.filter(p => p.status === 'waiting').length} color="#f59e0b" iconName="pending" />
                <StatCard label="In Care" value={patients.filter(p => p.careStatus === 'in-care').length} color="#8b5cf6" iconName="hospital" />
                <StatCard label="Critical" value={patients.filter(p => p.careStatus === 'critical').length} color="#ef4444" iconName="critical" />
              </div>
              <div style={s.grid}>
                {patients.map(p => (
                  <div key={p._id} style={s.patCard}>
                    <div style={s.patHeader}>
                      <span style={s.patName}>{p.name}</span>
                      <span style={{ ...s.badge, background: patientStatusColors[p.status] + '22', color: patientStatusColors[p.status] }}>{p.status}</span>
                    </div>
                    <div style={s.patMeta}>{p.age} yrs • {p.gender} • {p.department || 'General'}</div>
                    {p.vitals?.bp && (
                      <div style={s.vitalsRow}>
                        <span>BP: <strong>{p.vitals.bp}</strong></span>
                        <span>Temp: <strong>{p.vitals.temperature}°</strong></span>
                        <span>Pulse: <strong>{p.vitals.pulse}</strong></span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button style={s.actionBtn} onClick={() => { setSelectedPatient(p); setTab('vitals'); }}>Update Vitals</button>
                      <button style={{ ...s.actionBtn, background: '#8b5cf6' }} onClick={() => { setSelectedPatient(p); setTab('care'); }}>Care Status</button>
                    </div>
                  </div>
                ))}
              </div>
              {patients.length === 0 && <p style={s.empty}>No patients assigned.</p>}
            </>
          )}

          {tab === 'vitals' && (
            <>
              <h2 style={s.title}>Update Patient Vitals</h2>
              {!selectedPatient ? (
                <>
                  <p style={{ color: '#64748b', marginBottom: 16 }}>Select a patient to update vitals:</p>
                  <div style={s.selectList}>
                    {patients.map(p => (
                      <div key={p._id} style={s.selectItem} onClick={() => setSelectedPatient(p)}>
                        <strong>{p.name}</strong> <span style={{ color: '#94a3b8' }}>{p.age} yrs • {p.department}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={s.card}>
                  <div style={s.selectedInfo}>
                    <strong>Patient:</strong> {selectedPatient.name} | <strong>Age:</strong> {selectedPatient.age} | <strong>Dept:</strong> {selectedPatient.department}
                    <button onClick={() => setSelectedPatient(null)} aria-label="Clear selection" style={{ ...s.clearBtn, display: "flex", alignItems: "center", gap: 4 }}><Icon name="close" size="xs" color="#16a34a" /> Clear</button>
                  </div>
                  <form onSubmit={handleUpdateVitals} style={s.form}>
                    <div style={s.formGrid}>
                      <FormField label="Blood Pressure" value={vitalsForm.bp} onChange={v => setVitalsForm(f => ({ ...f, bp: v }))} placeholder="e.g. 120/80" />
                      <FormField label="Temperature (°C)" value={vitalsForm.temperature} onChange={v => setVitalsForm(f => ({ ...f, temperature: v }))} placeholder="e.g. 37.2" />
                      <FormField label="Pulse (bpm)" value={vitalsForm.pulse} onChange={v => setVitalsForm(f => ({ ...f, pulse: v }))} placeholder="e.g. 72" />
                    </div>
                    <button type="submit" style={s.submitBtn} disabled={loading}>{loading ? 'Saving...' : 'Save Vitals'}</button>
                  </form>
                </div>
              )}
            </>
          )}

          {tab === 'care' && (
            <>
              <h2 style={s.title}>Update Care Status</h2>
              {!selectedPatient ? (
                <div style={s.selectList}>
                  {patients.map(p => (
                    <div key={p._id} style={s.selectItem} onClick={() => { setSelectedPatient(p); setCareForm({ careStatus: p.careStatus, status: p.status }); }}>
                      <strong>{p.name}</strong>
                      <span style={{ ...s.badge, background: careColors[p.careStatus] + '22', color: careColors[p.careStatus] }}>{p.careStatus}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={s.card}>
                  <div style={s.selectedInfo}>
                    <strong>Patient:</strong> {selectedPatient.name}
                    <button onClick={() => setSelectedPatient(null)} aria-label="Clear selection" style={{ ...s.clearBtn, display: "flex", alignItems: "center", gap: 4 }}><Icon name="close" size="xs" color="#16a34a" /> Clear</button>
                  </div>
                  <form onSubmit={handleUpdateCare} style={s.form}>
                    <div style={s.formGrid}>
                      <div style={s.field}>
                        <label style={s.label}>Care Status</label>
                        <select style={s.select} value={careForm.careStatus} onChange={e => setCareForm(f => ({ ...f, careStatus: e.target.value }))}>
                          <option value="pending">Pending</option>
                          <option value="in-care">In Care</option>
                          <option value="stable">Stable</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Patient Status</label>
                        <select style={s.select} value={careForm.status} onChange={e => setCareForm(f => ({ ...f, status: e.target.value }))}>
                          <option value="waiting">Waiting</option>
                          <option value="assigned">Assigned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" style={s.submitBtn} disabled={loading}>{loading ? 'Saving...' : 'Update Status'}</button>
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
const FormField = ({ label, value, onChange, placeholder }) => (
  <div style={s.field}><label style={s.label}>{label}</label><input style={s.input} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>
);

const s = {
  root: { minHeight: '100vh', background: '#f0f4f8', fontFamily: 'system-ui, sans-serif' },
  nav: { background: '#fff', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,.1)', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontWeight: 800, fontSize: '1.2rem', color: '#1e293b' },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  roleTag: { background: '#f0fdf4', color: '#166534', padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700 },
  logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 },
  layout: { display: 'flex', minHeight: 'calc(100vh - 60px)' },
  sidebar: { width: 220, background: '#064e3b', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  sideBtn: { background: 'transparent', border: 'none', color: '#a7f3d0', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: '.9rem', fontWeight: 500 },
  sideBtnActive: { background: '#065f46', color: '#fff' },
  main: { flex: 1, padding: 32 },
  title: { fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: 20 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: 16, marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16 },
  patCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  patHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  patName: { fontWeight: 700, color: '#1e293b', fontSize: '1rem' },
  patMeta: { color: '#64748b', fontSize: '.85rem', marginBottom: 10 },
  vitalsRow: { display: 'flex', gap: 12, fontSize: '.82rem', color: '#475569', background: '#f8fafc', padding: '8px 10px', borderRadius: 6 },
  badge: { padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 600 },
  actionBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600 },
  selectList: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 },
  selectItem: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', maxWidth: 600 },
  selectedInfo: { background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, fontSize: '.88rem', color: '#166534', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  clearBtn: { marginLeft: 'auto', background: 'transparent', border: '1px solid #16a34a', color: '#16a34a', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: '.8rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '.82rem', fontWeight: 600, color: '#475569' },
  input: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', outline: 'none', background: '#f8fafc' },
  select: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', background: '#f8fafc', outline: 'none' },
  submitBtn: { background: '#065f46', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '.95rem', alignSelf: 'flex-start' },
  empty: { textAlign: 'center', padding: 40, color: '#94a3b8' },
  success: { background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  error: { background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};

export default NurseDashboard;
