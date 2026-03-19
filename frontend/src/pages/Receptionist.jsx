import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { registerPatient, getAllPatients, getTodayPatients, createAppointment, getAppointments } from '../api/features';
import MessagesPanel from '../components/MessagesPanel';
import Icon from '../components/Icon';

const statusColors = { waiting: '#f59e0b', assigned: '#3b82f6', 'in-progress': '#8b5cf6', completed: '#10b981', discharged: '#6b7280' };

const Receptionist = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [todayPatients, setTodayPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [patientForm, setPatientForm] = useState({ name: '', age: '', gender: 'male', phone: '', address: '', bloodGroup: '', department: '' });
  const [apptForm, setApptForm] = useState({ patientId: '', department: '', appointmentDate: '', reason: '' });

  useEffect(() => { loadTodayPatients(); loadAppointments(); }, []);
  useEffect(() => { if (tab === 'patients') loadAllPatients(); }, [tab]);

  const loadTodayPatients = async () => { try { const r = await getTodayPatients(); if (r.success) setTodayPatients(r.data); } catch {} };
  const loadAllPatients = async () => { try { const r = await getAllPatients(); if (r.success) setPatients(r.data); } catch {} };
  const loadAppointments = async () => { try { const r = await getAppointments(); if (r.success) setAppointments(r.data); } catch {} };

  const handleRegisterPatient = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await registerPatient({ ...patientForm, age: parseInt(patientForm.age) });
      if (r.success) { setMsg('Patient registered successfully!'); setPatientForm({ name: '', age: '', gender: 'male', phone: '', address: '', bloodGroup: '', department: '' }); loadTodayPatients(); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to register patient'); }
    finally { setLoading(false); }
  };

  const handleCreateAppt = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await createAppointment(apptForm);
      if (r.success) { setMsg('Appointment created!'); setApptForm({ patientId: '', department: '', appointmentDate: '', reason: '' }); loadAppointments(); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to create appointment'); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: 'dashboard',    label: 'Dashboard',        iconName: 'home'         },
    { id: 'register',     label: 'Register Patient', iconName: 'create'       },
    { id: 'appointments', label: 'Appointments',     iconName: 'appointments' },
    { id: 'patients',     label: 'All Patients',     iconName: 'patients'     },
    { id: 'messages',     label: 'Messages',         iconName: 'messages'     },
  ];

  return (
    <div style={s.root} className="page-root">
      <nav style={s.nav} className="page-nav">
        <div style={{ ...s.navBrand, display: "flex", alignItems: "center", gap: 8 }}><Icon name="hospital" size="md" color="#1d4ed8" /> Reception</div>
        <div style={s.navUser}>
          <span style={s.roleTag}>Receptionist</span>
          <strong>{user?.name}</strong>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>
      <div style={s.layout} className="page-layout">
        <aside style={s.sidebar} className="page-sidebar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...s.sideBtn, ...(tab === t.id ? s.sideBtnActive : {}), display: 'flex', alignItems: 'center', gap: 8 }}><Icon name={t.iconName} size="sm" color={tab === t.id ? '#fff' : '#94a3b8'} /> {t.label}</button>
          ))}
        </aside>
        <main style={s.main} className="page-main">
          {msg && <div style={s.success}>{msg}</div>}
          {err && <div style={s.error}>{err}</div>}

          {tab === 'dashboard' && (
            <>
              <h2 style={s.pageTitle}>Today's Overview</h2>
              <div style={s.statsRow}>
                <StatCard label="Today's Patients" value={todayPatients.length} color="#3b82f6" iconName="patient" />
                <StatCard label="Appointments" value={appointments.filter(a => a.status === 'scheduled').length} color="#10b981" iconName="appointments" />
                <StatCard label="Waiting" value={todayPatients.filter(p => p.status === 'waiting').length} color="#f59e0b" iconName="pending" />
                <StatCard label="Completed" value={todayPatients.filter(p => p.status === 'completed').length} color="#6b7280" iconName="success" />
              </div>
              <h3 style={s.sectionTitle}>Today's Patients</h3>
              <PatientTable patients={todayPatients} />
            </>
          )}

          {tab === 'register' && (
            <>
              <h2 style={s.pageTitle}>Register New Patient</h2>
              <div style={s.card}>
                <form onSubmit={handleRegisterPatient} style={s.form}>
                  <div style={s.formGrid}>
                    <FormField label="Full Name *" value={patientForm.name} onChange={v => setPatientForm(p => ({ ...p, name: v }))} placeholder="Patient name" />
                    <FormField label="Age *" type="number" value={patientForm.age} onChange={v => setPatientForm(p => ({ ...p, age: v }))} placeholder="Age" />
                    <div style={s.field}>
                      <label style={s.label}>Gender *</label>
                      <select style={s.select} value={patientForm.gender} onChange={e => setPatientForm(p => ({ ...p, gender: e.target.value }))}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <FormField label="Phone" value={patientForm.phone} onChange={v => setPatientForm(p => ({ ...p, phone: v }))} placeholder="Phone number" />
                    <FormField label="Blood Group" value={patientForm.bloodGroup} onChange={v => setPatientForm(p => ({ ...p, bloodGroup: v }))} placeholder="e.g. A+" />
                    <FormField label="Department" value={patientForm.department} onChange={v => setPatientForm(p => ({ ...p, department: v }))} placeholder="e.g. Cardiology" />
                  </div>
                  <FormField label="Address" value={patientForm.address} onChange={v => setPatientForm(p => ({ ...p, address: v }))} placeholder="Address" />
                  <button type="submit" style={s.submitBtn} disabled={loading}>{loading ? 'Registering...' : 'Register Patient'}</button>
                </form>
              </div>
            </>
          )}

          {tab === 'appointments' && (
            <>
              <h2 style={s.pageTitle}>Appointments</h2>
              <div style={s.card}>
                <h3 style={{ ...s.sectionTitle, marginTop: 0 }}>Book Appointment</h3>
                <form onSubmit={handleCreateAppt} style={s.form}>
                  <div style={s.formGrid}>
                    <FormField label="Patient ID *" value={apptForm.patientId} onChange={v => setApptForm(p => ({ ...p, patientId: v }))} placeholder="Patient MongoDB ID" />
                    <FormField label="Department *" value={apptForm.department} onChange={v => setApptForm(p => ({ ...p, department: v }))} placeholder="e.g. Neurology" />
                    <FormField label="Date & Time *" type="datetime-local" value={apptForm.appointmentDate} onChange={v => setApptForm(p => ({ ...p, appointmentDate: v }))} />
                    <FormField label="Reason" value={apptForm.reason} onChange={v => setApptForm(p => ({ ...p, reason: v }))} placeholder="Reason for visit" />
                  </div>
                  <button type="submit" style={s.submitBtn} disabled={loading}>{loading ? 'Booking...' : 'Book Appointment'}</button>
                </form>
              </div>
              <h3 style={s.sectionTitle}>All Appointments</h3>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr style={s.thead}>{['Patient','Department','Date','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a._id} style={s.tr}>
                        <td style={s.td}>{a.patientName}</td>
                        <td style={s.td}><span style={s.deptBadge}>{a.department}</span></td>
                        <td style={s.td}>{new Date(a.appointmentDate).toLocaleString()}</td>
                        <td style={s.td}><span style={{ ...s.statusBadge, background: a.status === 'scheduled' ? '#dbeafe' : '#d1fae5', color: a.status === 'scheduled' ? '#1d4ed8' : '#065f46' }}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {appointments.length === 0 && <p style={s.emptyMsg}>No appointments found.</p>}
              </div>
            </>
          )}

          {tab === 'patients' && (
            <>
              <h2 style={s.pageTitle}>All Patients</h2>
              <PatientTable patients={patients} />
            </>
          )}

          {tab === 'messages' && (
            <>
              <h2 style={s.pageTitle}>My Messages</h2>
              <MessagesPanel />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const PatientTable = ({ patients }) => (
  <div style={s.tableWrap}>
    <table style={s.table}>
      <thead><tr style={s.thead}>{['Name','Age','Gender','Department','Status','Registered'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
      <tbody>
        {patients.map(p => (
          <tr key={p._id} style={s.tr}>
            <td style={s.td}><strong>{p.name}</strong></td>
            <td style={s.td}>{p.age}</td>
            <td style={s.td}>{p.gender}</td>
            <td style={s.td}><span style={s.deptBadge}>{p.department || '—'}</span></td>
            <td style={s.td}><StatusBadge status={p.status} /></td>
            <td style={s.td}>{new Date(p.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {patients.length === 0 && <p style={s.emptyMsg}>No patients found.</p>}
  </div>
);

const statusColors2 = { waiting: { bg: '#fef3c7', color: '#92400e' }, assigned: { bg: '#dbeafe', color: '#1d4ed8' }, 'in-progress': { bg: '#ede9fe', color: '#5b21b6' }, completed: { bg: '#d1fae5', color: '#065f46' }, discharged: { bg: '#f1f5f9', color: '#475569' } };
const StatusBadge = ({ status }) => { const c = statusColors2[status] || { bg: '#f1f5f9', color: '#475569' }; return <span style={{ ...s.statusBadge, background: c.bg, color: c.color }}>{status}</span>; };
const StatCard = ({ label, value, color, iconName }) => (
  <div style={{ ...s.statCard, borderTop: `4px solid ${color}` }}>
    <div style={{ width: 44, height: 44, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={iconName} size="lg" color={color} /></div>
    <div><div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{value}</div><div style={{ color: '#64748b', fontSize: '.85rem' }}>{label}</div></div>
  </div>
);
const FormField = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div style={s.field}>
    <label style={s.label}>{label}</label>
    <input style={s.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const s = {
  root: { minHeight: '100vh', background: '#f0f4f8', fontFamily: 'system-ui, sans-serif' },
  nav: { background: '#fff', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,.1)', position: 'sticky', top: 0, zIndex: 100 },
  navBrand: { fontWeight: 800, fontSize: '1.2rem', color: '#1e293b' },
  navUser: { display: 'flex', alignItems: 'center', gap: 12 },
  roleTag: { background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700 },
  logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 },
  layout: { display: 'flex', minHeight: 'calc(100vh - 60px)' },
  sidebar: { width: 220, background: '#1e293b', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  sideBtn: { background: 'transparent', border: 'none', color: '#94a3b8', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: '.9rem', fontWeight: 500, transition: 'all .15s' },
  sideBtnActive: { background: '#334155', color: '#fff' },
  main: { flex: 1, padding: 32, overflowY: 'auto' },
  pageTitle: { fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: 20 },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: '24px 0 12px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16, marginBottom: 28 },
  statCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '.82rem', fontWeight: 600, color: '#475569' },
  input: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', outline: 'none', background: '#f8fafc' },
  select: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', background: '#f8fafc', outline: 'none' },
  submitBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '.95rem', alignSelf: 'flex-start', transition: 'background .15s' },
  tableWrap: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '.8rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: '.88rem', color: '#334155' },
  statusBadge: { padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 600 },
  deptBadge: { background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 99, fontSize: '.75rem', fontWeight: 600 },
  emptyMsg: { textAlign: 'center', padding: 40, color: '#94a3b8' },
  success: { background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  error: { background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};

export default Receptionist;
