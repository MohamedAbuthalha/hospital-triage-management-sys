import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getBeds, addBed, assignBed, releaseBed, getWeeklyTasks, completeTask, closeWeek, submitCleanReport } from '../api/features';
import MessagesPanel from '../components/MessagesPanel';
import './WardenDashboard.css';
import Icon from '../components/Icon';

const WardenDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [beds, setBeds] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [weekInfo, setWeekInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [bedForm, setBedForm] = useState({ bedNumber: '', ward: '' });
  const [assignForm, setAssignForm] = useState({ patientId: '' });
  const [assigningBed, setAssigningBed] = useState(null);

  // ── Cleanliness state ───────────────────────────────────────────────────
  const DEFAULT_DEPTS = [
    { name: 'Bathroom',       status: '', notes: '' },
    { name: 'Ward',           status: '', notes: '' },
    { name: 'ICU',            status: '', notes: '' },
    { name: 'Corridor',       status: '', notes: '' },
    { name: 'Nurses Station', status: '', notes: '' },
  ];
  const [depts, setDepts]               = useState(DEFAULT_DEPTS);
  const [cleanMsg, setCleanMsg]         = useState('');
  const [cleanErr, setCleanErr]         = useState('');
  const [cleanLoading, setCleanLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => { loadBeds(); loadTasks(); }, []);

  const loadBeds = async () => { try { const r = await getBeds(); if (r.success) setBeds(r.data); } catch {} };
  const loadTasks = async () => {
    try { const r = await getWeeklyTasks(); if (r.success) { setTasks(r.data); setWeekInfo({ week: r.week, year: r.year }); } } catch {}
  };

  const handleAddBed = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await addBed(bedForm);
      if (r.success) { setMsg('Bed added!'); setBedForm({ bedNumber: '', ward: '' }); loadBeds(); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to add bed'); }
    finally { setLoading(false); }
  };

  const handleAssignBed = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await assignBed(assigningBed._id, { patientId: assignForm.patientId });
      if (r.success) { setMsg('Bed assigned!'); setAssigningBed(null); setAssignForm({ patientId: '' }); loadBeds(); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to assign bed'); }
    finally { setLoading(false); }
  };

  const handleReleaseBed = async (id) => {
    setLoading(true); setErr(''); setMsg('');
    try { const r = await releaseBed(id); if (r.success) { setMsg('Bed released!'); loadBeds(); } }
    catch (ex) { setErr(ex.response?.data?.message || 'Failed to release bed'); }
    finally { setLoading(false); }
  };

  const handleCompleteTask = async (id) => {
    try { const r = await completeTask(id); if (r.success) loadTasks(); } catch {}
  };

  const handleCloseWeek = async () => {
    setErr(''); setMsg(''); setLoading(true);
    try {
      const r = await closeWeek();
      if (r.success) { setMsg('Week closed successfully!'); loadTasks(); }
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to close week'); }
    finally { setLoading(false); }
  };

  // ── Cleanliness handlers ────────────────────────────────────────────────
  // handleChange uses index so we know WHICH department row to update.
  // We never mutate state directly — we spread the array then replace the element.
  const handleDeptChange = (index, field, value) => {
    setDepts(prev => {
      const updated = [...prev];              // shallow copy — don't mutate original
      updated[index] = { ...updated[index], [field]: value }; // replace changed field
      return updated;
    });
  };

  const handleCleanSubmit = async (e) => {
    e.preventDefault();
    setCleanErr(''); setCleanMsg(''); setNotification('');
    // Validate all departments have a status
    const missing = depts.find(d => !d.status);
    if (missing) { setCleanErr(`Please select a status for "${missing.name}"`); return; }
    setCleanLoading(true);
    try {
      const r = await submitCleanReport({ departments: depts });
      if (r.success) {
        setCleanMsg('Report submitted successfully!');
        setNotification(r.data?.notification || '');
        setDepts(DEFAULT_DEPTS);  // reset form
      }
    } catch (ex) {
      setCleanErr(ex.response?.data?.message || 'Failed to submit report');
    } finally { setCleanLoading(false); }
  };

  const allTasksDone = tasks.length > 0 && tasks.every(t => t.status === 'completed');
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  const tabs = [
    { id: 'dashboard',   label: 'Ward Overview',    iconName: 'hospital'    },
    { id: 'beds',        label: 'Bed Management',   iconName: 'bed'         },
    { id: 'checklist',   label: 'Weekly Checklist', iconName: 'checklist'   },
    { id: 'messages',    label: 'Messages',         iconName: 'messages'    },
    { id: 'cleanliness', label: 'Cleanliness',      iconName: 'cleaning'    },
  ];

  return (
    <div className="warden-root">
      <nav className="warden-nav">
        <div className="warden-brand" style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="hospital" size="md" color="#0891b2" /> Ward Management</div>
        <div className="warden-nav-right">
          <span className="warden-role-tag">Ward Warden</span>
          <strong>{user?.name}</strong>
          <button onClick={logout} className="warden-logout-btn">Logout</button>
        </div>
      </nav>
      <div className="warden-layout">
        <aside className="warden-sidebar">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => { setTab(t.id); setAssigningBed(null); setMsg(''); setErr(''); }} 
              className={`warden-side-btn ${tab === t.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Icon name={t.iconName} size="sm" color={tab === t.id ? '#fff' : '#a5b4fc'} />
              {t.label}
            </button>
          ))}
        </aside>
        <main className="warden-main">
          {msg && <div className="warden-success">{msg}</div>}
          {err && <div className="warden-error">{err}</div>}

          {tab === 'dashboard' && (
            <>
              <h2 className="warden-title">Ward Overview</h2>
              <div className="warden-stats-row">
                <StatCard 
                  label="Total Beds" 
                  value={beds.length} 
                  iconName="bed" 
                  status="maintenance"
                />
                <StatCard 
                  label="Available" 
                  value={beds.filter(b => b.status === 'available').length} 
                  iconName="success" 
                  status="available"
                />
                <StatCard 
                  label="Occupied" 
                  value={beds.filter(b => b.status === 'occupied').length} 
                  iconName="error" 
                  status="occupied"
                />
                <StatCard 
                  label="Pending Tasks" 
                  value={pendingCount} 
                  iconName="list" 
                  status={pendingCount > 0 ? 'pending' : 'available'}
                />
              </div>
              {pendingCount > 0 && (
                <div className="warden-alert-banner" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="warning" size="sm" color="warning" /><strong>{pendingCount} weekly task(s) pending.</strong> Complete them before closing the week.
                </div>
              )}
              <h3 className="warden-section-title">Bed Grid</h3>
              <div className="warden-bed-grid">
                {beds.map(bed => (
                  <div key={bed._id} className={`warden-bed-card ${bed.status}`}>
                    <div className="warden-bed-number">Bed {bed.bedNumber}</div>
                    <div className="warden-bed-ward">{bed.ward}</div>
                    <span className={`warden-badge warden-badge-${bed.status === 'available' ? 'success' : bed.status === 'occupied' ? 'error' : 'info'}`}>
                      {bed.status}
                    </span>
                    {bed.patientName && <div className="warden-bed-patient" style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="patient" size="xs" color="secondary" /> {bed.patientName}</div>}
                    {bed.admittedAt && (
                      <div className="warden-bed-admitted">
                        Since: {new Date(bed.admittedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
                {beds.length === 0 && (
                  <p style={{ color: 'var(--color-text-tertiary)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
                    No beds configured.
                  </p>
                )}
              </div>
            </>
          )}

          {tab === 'beds' && (
            <>
              <h2 className="warden-title">Bed Management</h2>
              <div className="warden-cards-grid">
                <div className="warden-card">
                  <h3 className="warden-section-title" style={{ marginTop: 0 }}>Add New Bed</h3>
                  <form onSubmit={handleAddBed} className="warden-form">
                    <FormField 
                      label="Bed Number *" 
                      value={bedForm.bedNumber} 
                      onChange={v => setBedForm(f => ({ ...f, bedNumber: v }))} 
                      placeholder="e.g. A-101" 
                    />
                    <FormField 
                      label="Ward *" 
                      value={bedForm.ward} 
                      onChange={v => setBedForm(f => ({ ...f, ward: v }))} 
                      placeholder="e.g. General Ward" 
                    />
                    <button type="submit" className="warden-btn warden-btn-primary" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Bed'}
                    </button>
                  </form>
                </div>
                {assigningBed && (
                  <div className="warden-card">
                    <h3 className="warden-section-title" style={{ marginTop: 0 }}>Assign Bed {assigningBed.bedNumber}</h3>
                    <form onSubmit={handleAssignBed} className="warden-form">
                      <FormField 
                        label="Patient ID *" 
                        value={assignForm.patientId} 
                        onChange={v => setAssignForm(f => ({ ...f, patientId: v }))} 
                        placeholder="Patient MongoDB ID" 
                      />
                      <div className="warden-btn-group">
                        <button type="submit" className="warden-btn warden-btn-primary" disabled={loading}>
                          {loading ? 'Assigning...' : 'Assign'}
                        </button>
                        <button type="button" className="warden-btn warden-btn-secondary" onClick={() => setAssigningBed(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              <h3 className="warden-section-title">All Beds</h3>
              <div className="warden-table-wrap">
                <table className="warden-table">
                  <thead>
                    <tr>
                      {['Bed', 'Ward', 'Status', 'Patient', 'Admitted', 'Actions'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {beds.map(bed => (
                      <tr key={bed._id}>
                        <td><strong>{bed.bedNumber}</strong></td>
                        <td>{bed.ward}</td>
                        <td>
                          <span className={`warden-badge warden-badge-${bed.status === 'available' ? 'success' : bed.status === 'occupied' ? 'error' : 'info'}`}>
                            {bed.status}
                          </span>
                        </td>
                        <td>{bed.patientName || '—'}</td>
                        <td>{bed.admittedAt ? new Date(bed.admittedAt).toLocaleDateString() : '—'}</td>
                        <td>
                          {bed.status === 'available' && (
                            <button className="warden-action-btn" onClick={() => setAssigningBed(bed)}>
                              Assign
                            </button>
                          )}
                          {bed.status === 'occupied' && (
                            <button className="warden-action-btn warden-action-btn-danger" onClick={() => handleReleaseBed(bed._id)}>
                              Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {beds.length === 0 && <p className="warden-table-empty">No beds found.</p>}
              </div>
            </>
          )}

          {tab === 'checklist' && (
            <>
              <h2 className="warden-title">Weekly Checklist</h2>
              <div className="warden-week-header">
                <div className="warden-week-info">
                  <span className="warden-week-badge">Week {weekInfo.week}, {weekInfo.year}</span>
                  <p className="warden-week-desc">
                    {allTasksDone ? 'All tasks completed! You can close the week.' : `${pendingCount} task(s) remaining.`}
                  </p>
                </div>
                <button
                  className="warden-btn warden-btn-success"
                  onClick={handleCloseWeek}
                  disabled={!allTasksDone || loading}
                  title={allTasksDone ? 'Close week' : 'Complete all tasks first'}
                  style={{ opacity: allTasksDone ? 1 : 0.5, cursor: allTasksDone ? 'pointer' : 'not-allowed' }}
                >
                  {loading ? 'Closing...' : 'Complete Week'}
                </button>
              </div>
              {!allTasksDone && (
                <div className="warden-pending-alert" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="warning" size="sm" color="warning" /> Complete all tasks before closing the week. <strong>{pendingCount} pending.</strong>
                </div>
              )}
              <div className="warden-task-list">
                {tasks.map(task => (
                  <div 
                    key={task._id} 
                    className={`warden-task-item ${task.status === 'completed' ? 'completed' : 'pending'}`}
                  >
                    <div className="warden-task-left">
                      <span className="warden-task-icon">
                        {task.status === 'completed' ? <Icon name="success" size="sm" color="success" /> : <Icon name="checklist" size="sm" color="muted" />}
                      </span>
                      <div>
                        <div className="warden-task-name">{task.taskName}</div>
                        {task.completedAt && (
                          <div className="warden-task-date">
                            Completed: {new Date(task.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {task.status === 'pending' && (
                      <button className="warden-btn warden-btn-success" onClick={() => handleCompleteTask(task._id)}>
                        Mark Done
                      </button>
                    )}
                    {task.status === 'completed' && <span className="warden-done-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="success" size="xs" color="success" /> Done</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'cleanliness' && (
            <>
              <h2 className="warden-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="cleaning" size="lg" color="secondary" /> Cleanliness Report</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '.9rem' }}>
                Inspect each department and submit your cleanliness report.
                The system will automatically compute the overall status.
              </p>

              {cleanMsg && (
                <div className="warden-success">
                  {cleanMsg}
                  {notification && <div style={{ marginTop: 6, fontWeight: 800 }}>{notification}</div>}
                </div>
              )}
              {cleanErr && <div className="warden-error">{cleanErr}</div>}

              <form onSubmit={handleCleanSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {depts.map((dept, i) => (
                    <div key={dept.name} className="warden-dept-row">
                      <div className="warden-dept-name">{dept.name}</div>

                      {/* Radio buttons — Clean / Not Clean */}
                      <div className="warden-radio-group">
                        {['Clean', 'Not Clean'].map(opt => (
                          <label 
                            key={opt} 
                            className={`warden-radio-label ${
                              dept.status === opt 
                                ? (opt === 'Clean' ? 'clean' : 'dirty')
                                : 'unselected'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`status-${i}`}
                              value={opt}
                              checked={dept.status === opt}
                              onChange={() => handleDeptChange(i, 'status', opt)}
                            />
                            {opt === 'Clean' ? <Icon name="success" size="xs" color="success" /> : <Icon name="error" size="xs" color="error" />} {opt}
                          </label>
                        ))}
                      </div>

                      {/* Notes input */}
                      <input
                        className="warden-notes-input"
                        placeholder="Notes (optional)"
                        value={dept.notes}
                        onChange={e => handleDeptChange(i, 'notes', e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <button type="submit" className="warden-btn warden-btn-primary" disabled={cleanLoading}>
                  {cleanLoading ? 'Submitting...' : 'Submit Cleanliness Report'}
                </button>
              </form>
            </>
          )}

          {tab === 'messages' && (
            <>
              <h2 className="warden-title">My Messages</h2>
              <MessagesPanel />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, iconName, status }) => (
  <div className={`warden-stat-card ${status}`}>
    <span className="warden-stat-icon"><Icon name={iconName} size="md" /></span>
    <div>
      <div className="warden-stat-value">{value}</div>
      <div className="warden-stat-label">{label}</div>
    </div>
  </div>
);

const FormField = ({ label, value, onChange, placeholder }) => (
  <div className="warden-field">
    <label className="warden-label">{label}</label>
    <input 
      className="warden-input" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
    />
  </div>
);

export default WardenDashboard;
