import { useState, useEffect } from 'react';
import { getDoctorOverview, getDoctorDetail, adminSendMessage, getAllStaffForMessage } from '../api/features';
import api from '../api/axios';
import Icon from './Icon';

// ─── Doctor Overview Panel ────────────────────────────────────────────────────
export const DoctorOverviewPanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    getDoctorOverview().then(r => { if (r.success) setDoctors(r.data); }).catch(() => {});
  }, []);

  const loadDetail = async (doc) => {
    setSelected(doc);
    setLoadingDetail(true);
    try {
      const r = await getDoctorDetail(doc.id);
      if (r.success) setDetail(r.data);
    } catch {}
    finally { setLoadingDetail(false); }
  };

  const loadStatusStyle = (ls) => {
    const map = {
      'Available': { background: '#d1fae5', color: '#065f46' },
      'Busy': { background: '#fee2e2', color: '#991b1b' },
      'No Patients': { background: '#f1f5f9', color: '#475569' },
      'High Load': { background: '#fef3c7', color: '#92400e' },
    };
    return map[ls] || { background: '#f1f5f9', color: '#475569' };
  };

  return (
    <div>
      {selected && detail ? (
        <div>
          <button style={s.backBtn} onClick={() => { setSelected(null); setDetail(null); }}>← Back to List</button>
          <div style={s.detailCard}>
            <div style={s.detailHeader}>
              <div>
                <h3 style={s.detailName}>{detail.doctor.name}</h3>
                <span style={s.specTag}>{detail.doctor.specialization}</span>
              </div>
              <div style={s.workloadBox}>
                <div style={s.workloadNum}>{detail.doctor.activeCases} / {detail.doctor.maxCases}</div>
                <div style={s.workloadLabel}>Cases (Active / Max)</div>
                <div style={{ ...s.progressBar }}>
                  <div style={{ ...s.progressFill, width: `${Math.min(100, (detail.doctor.activeCases / detail.doctor.maxCases) * 100)}%`, background: detail.doctor.activeCases >= detail.doctor.maxCases ? '#ef4444' : '#3b82f6' }} />
                </div>
              </div>
            </div>
            <div style={s.summaryRow}>
              {[['Total', detail.summary.total, '#3b82f6'], ['Waiting', detail.summary.waiting, '#f59e0b'], ['Assigned', detail.summary.assigned, '#8b5cf6'], ['In Progress', detail.summary.inProgress, '#06b6d4'], ['Completed', detail.summary.completed, '#10b981']].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'center', padding: '10px 16px', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: '.78rem', color: '#64748b' }}>{l}</div>
                </div>
              ))}
            </div>
            <h4 style={{ fontWeight: 700, color: '#334155', margin: '20px 0 10px' }}>Assigned Patients</h4>
            {loadingDetail ? <div style={{ color: '#94a3b8' }}>Loading...</div> : (
              <div style={s.caseTable}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8fafc' }}>{['Patient', 'Priority', 'Status', 'Date'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {detail.cases.map(c => (
                      <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={s.td}><strong>{c.patientName}</strong></td>
                        <td style={s.td}><PriorityBadge p={c.priority} /></td>
                        <td style={s.td}><StatusBadge status={c.status} /></td>
                        <td style={s.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {detail.cases.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No cases assigned.</p>}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={s.statsRow}>
            <StatCard label="Total Doctors" value={doctors.length} color="#3b82f6" iconName="doctor" />
            <StatCard label="Available" value={doctors.filter(d => d.loadStatus === 'Available').length} color="#10b981" iconName="success" />
            <StatCard label="Busy" value={doctors.filter(d => d.loadStatus === 'Busy').length} color="#ef4444" iconName="error" />
            <StatCard label="No Patients" value={doctors.filter(d => d.loadStatus === 'No Patients').length} color="#94a3b8" iconName="user" />
          </div>
          <div style={s.docGrid}>
            {doctors.map(doc => {
              const ls = loadStatusStyle(doc.loadStatus);
              const pct = Math.min(100, (doc.currentCases / doc.maxCases) * 100);
              return (
                <div key={doc.id} style={s.docCard} onClick={() => loadDetail(doc)}>
                  <div style={s.docCardTop}>
                    <span style={s.docAvatar}>{doc.name?.[0]?.toUpperCase()}</span>
                    <div>
                      <div style={s.docName}>{doc.name}</div>
                      <div style={s.docSpec}>{doc.specialization}</div>
                    </div>
                    <span style={{ ...s.loadBadge, ...ls }}>{doc.loadStatus}</span>
                  </div>
                  <div style={s.caseRow}>
                    <span style={{ fontSize: '.82rem', color: '#64748b' }}>Cases: <strong>{doc.currentCases}/{doc.maxCases}</strong></span>
                  </div>
                  <div style={s.progressBar}>
                    <div style={{ ...s.progressFill, width: `${pct}%`, background: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#3b82f6' }} />
                  </div>
                  <div style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: 8 }}>Click for details →</div>
                </div>
              );
            })}
          </div>
          {doctors.length === 0 && <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No doctors found.</p>}
        </>
      )}
    </div>
  );
};

// ─── Send Message Panel ───────────────────────────────────────────────────────
export const SendMessagePanel = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ receiverId: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    getAllStaffForMessage().then(r => { if (r.success) setStaff(r.staff || []); }).catch(() => {});
  }, []);

  const handleSend = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await adminSendMessage(form);
      if (r.success) { setMsg('Message sent successfully!'); setForm({ receiverId: '', message: '' }); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to send message'); }
    finally { setLoading(false); }
  };

  const roleColors = { nurse: '#065f46', lab: '#5b21b6', pharmacist: '#86198f', receptionist: '#1d4ed8', ward: '#92400e', doctor: '#0e7490' };

  return (
    <div>
      {msg && <div style={s.success}>{msg}</div>}
      {err && <div style={s.error}>{err}</div>}
      <div style={s.msgCard}>
        <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 20, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="messages" size="md" color="secondary" /> Send Message to Staff</h3>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={s.field}>
            <label style={s.label}>Select Recipient *</label>
            <select style={s.select} value={form.receiverId} onChange={e => setForm(f => ({ ...f, receiverId: e.target.value }))} required>
              <option value="">— Select staff member —</option>
              {staff.map(st => (
                <option key={st._id} value={st._id}>[{st.role?.toUpperCase()}] {st.name} ({st.email})</option>
              ))}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Message *</label>
            <textarea
              style={{ ...s.input, minHeight: 100, resize: 'vertical' }}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Type your message here... (max 500 characters)"
              maxLength={500}
              required
            />
            <span style={{ fontSize: '.75rem', color: '#94a3b8', textAlign: 'right' }}>{form.message.length}/500</span>
          </div>
          <button type="submit" style={s.sendBtn} disabled={loading || !form.receiverId || !form.message}>
            {loading ? 'Sending...' : <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="send" size="sm" color="white" /> Send Message</span>}
          </button>
        </form>
      </div>
      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontWeight: 700, color: '#334155', marginBottom: 12 }}>Staff Directory</h3>
        <div style={s.staffGrid}>
          {staff.map(st => {
            const rc = roleColors[st.role] || '#475569';
            return (
              <div key={st._id} style={s.staffCard}>
                <span style={s.staffAvatar}>{st.name?.[0]?.toUpperCase()}</span>
                <div style={{ flex: 1 }}>
                  <div style={s.staffName}>{st.name}</div>
                  <div style={s.staffEmail}>{st.email}</div>
                </div>
                <span style={{ ...s.roleBadge, background: rc + '18', color: rc }}>{st.role}</span>
              </div>
            );
          })}
        </div>
        {staff.length === 0 && <p style={{ color: '#94a3b8', fontSize: '.9rem' }}>No staff found.</p>}
      </div>
    </div>
  );
};

const PriorityBadge = ({ p }) => {
  const map = { 1: ['#fee2e2', '#991b1b', 'Critical'], 2: ['#fef3c7', '#92400e', 'High'], 3: ['#dbeafe', '#1d4ed8', 'Medium'], 4: ['#f1f5f9', '#475569', 'Low'] };
  const [bg, color, label] = map[p] || ['#f1f5f9', '#475569', `P${p}`];
  return <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '.73rem', fontWeight: 600, background: bg, color }}>{label}</span>;
};
const StatusBadge = ({ status }) => {
  const map = { waiting: ['#fef3c7', '#92400e'], assigned: ['#dbeafe', '#1d4ed8'], 'in-progress': ['#ede9fe', '#5b21b6'], completed: ['#d1fae5', '#065f46'] };
  const [bg, color] = map[status] || ['#f1f5f9', '#475569'];
  return <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '.73rem', fontWeight: 600, background: bg, color }}>{status}</span>;
};
const StatCard = ({ label, value, color, iconName }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', borderTop: `4px solid ${color}` }}>
    <div style={{ width: 42, height: 42, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={iconName} size="lg" color={color} /></div>
    <div><div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div><div style={{ color: '#64748b', fontSize: '.8rem' }}>{label}</div></div>
  </div>
);

const s = {
  backBtn: { background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: '#475569', marginBottom: 16, fontWeight: 600 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 14, marginBottom: 20 },
  docGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 16 },
  docCard: { background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' },
  docCardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  docAvatar: { width: 42, height: 42, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 },
  docName: { fontWeight: 700, color: '#1e293b', fontSize: '.95rem' },
  docSpec: { fontSize: '.78rem', color: '#64748b', textTransform: 'capitalize' },
  loadBadge: { marginLeft: 'auto', padding: '3px 10px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700, whiteSpace: 'nowrap' },
  caseRow: { marginBottom: 6 },
  progressBar: { height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width .3s' },
  detailCard: { background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 },
  detailName: { fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 },
  specTag: { background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 99, fontSize: '.8rem', fontWeight: 600, textTransform: 'capitalize' },
  workloadBox: { textAlign: 'center', minWidth: 160 },
  workloadNum: { fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' },
  workloadLabel: { fontSize: '.78rem', color: '#64748b', marginBottom: 8 },
  summaryRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  caseTable: { border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' },
  td: { padding: '10px 14px', fontSize: '.86rem', color: '#334155' },
  msgCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', maxWidth: 620 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '.82rem', fontWeight: 600, color: '#475569' },
  input: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', outline: 'none', background: '#f8fafc' },
  select: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: '.9rem', background: '#f8fafc', outline: 'none' },
  sendBtn: { background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '.95rem', alignSelf: 'flex-start' },
  staffGrid: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 700 },
  staffCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  staffAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569' },
  staffName: { fontWeight: 600, color: '#1e293b', fontSize: '.9rem' },
  staffEmail: { fontSize: '.78rem', color: '#94a3b8' },
  roleBadge: { padding: '3px 10px', borderRadius: 99, fontSize: '.73rem', fontWeight: 700, textTransform: 'capitalize' },
  success: { background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  error: { background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};
