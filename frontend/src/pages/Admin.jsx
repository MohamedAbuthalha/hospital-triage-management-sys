import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { createDoctor, createNurse, createStaff, getAllStaff } from '../api/admin';
import { DoctorOverviewPanel, SendMessagePanel } from '../components/AdminExtensions';
import CleanlinessMonitor from '../components/CleanlinessMonitor';
import './Admin.css';
import Icon from '../components/Icon';

const Admin = () => {
  const { user, logout } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('create-doctor');

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    maxCases: '5',
  });

  // Nurse form state
  const [nurseForm, setNurseForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Staff form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });

  useEffect(() => {
    if (activeTab === 'staff-list') {
      loadStaff();
    }
  }, [activeTab]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await getAllStaff();
      if (response.success) {
        setStaff(response.staff || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await createDoctor({
        ...doctorForm,
        experience: parseInt(doctorForm.experience),
        maxCases: parseInt(doctorForm.maxCases) || 5,
      });
      if (response.success) {
        setSuccess('Doctor created successfully!');
        setDoctorForm({ name: '', email: '', password: '', specialization: '', experience: '', maxCases: '5' });
        loadStaff();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNurse = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await createNurse(nurseForm);
      if (response.success) {
        setSuccess('Nurse created successfully!');
        setNurseForm({ name: '', email: '', password: '' });
        loadStaff();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create nurse');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await createStaff(staffForm);
      if (response.success) {
        setSuccess('Staff created successfully!');
        setStaffForm({ name: '', email: '', password: '', role: 'receptionist' });
        loadStaff();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="admin-content">
        <div className="tabs">
          {/* ── ORIGINAL TABS (unchanged) ── */}
          <button
            className={activeTab === 'create-doctor' ? 'active' : ''}
            onClick={() => setActiveTab('create-doctor')}
          >
            Create Doctor
          </button>
          <button
            className={activeTab === 'create-nurse' ? 'active' : ''}
            onClick={() => setActiveTab('create-nurse')}
          >
            Create Nurse
          </button>
          <button
            className={activeTab === 'create-staff' ? 'active' : ''}
            onClick={() => setActiveTab('create-staff')}
          >
            Create Staff
          </button>
          <button
            className={activeTab === 'staff-list' ? 'active' : ''}
            onClick={() => setActiveTab('staff-list')}
          >
            View Staff
          </button>
          {/* ── NEW TABS ── */}
          <button
            className={activeTab === 'doctor-overview' ? 'active' : ''}
            onClick={() => setActiveTab('doctor-overview')}
            style={{ borderLeft: '2px solid #3b82f6' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="doctor" size="sm" color="#3b82f6" /> Doctor Overview</span>
          </button>
          <button
            className={activeTab === 'send-message' ? 'active' : ''}
            onClick={() => setActiveTab('send-message')}
          >
            Send Message
          </button>
          <button
            className={activeTab === 'cleanliness' ? 'active' : ''}
            onClick={() => setActiveTab('cleanliness')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="cleaning" size="sm" color="#64748b" /> Cleanliness</span>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="tab-content">
          {/* ── ORIGINAL TAB CONTENT (unchanged) ── */}
          {activeTab === 'create-doctor' && (
            <form onSubmit={handleCreateDoctor} className="form">
              <h2>Create Doctor Account</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specialization *</label>
                  <input
                    type="text"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    placeholder="e.g., cardiology"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience (years) *</label>
                  <input
                    type="number"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Max Cases *</label>
                <input
                  type="number"
                  value={doctorForm.maxCases}
                  onChange={(e) => setDoctorForm({ ...doctorForm, maxCases: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating...' : 'Create Doctor'}
              </button>
            </form>
          )}

          {activeTab === 'create-nurse' && (
            <form onSubmit={handleCreateNurse} className="form">
              <h2>Create Nurse Account</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={nurseForm.name}
                    onChange={(e) => setNurseForm({ ...nurseForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={nurseForm.email}
                    onChange={(e) => setNurseForm({ ...nurseForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={nurseForm.password}
                  onChange={(e) => setNurseForm({ ...nurseForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating...' : 'Create Nurse'}
              </button>
            </form>
          )}

          {activeTab === 'create-staff' && (
            <form onSubmit={handleCreateStaff} className="form">
              <h2>Create Staff Account</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    required
                  >
                    <option value="nurse">nurse</option>
                    <option value="receptionist">receptionist</option>
                    <option value="lab">lab</option>
                    <option value="ward">ward</option>
                    <option value="pharmacist">pharmacist</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating...' : 'Create Staff'}
              </button>
            </form>
          )}

          {activeTab === 'staff-list' && (
            <div className="staff-list">
              <h2>All Staff Members</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>
                          No staff members found
                        </td>
                      </tr>
                    ) : (
                      staff.map((member) => (
                        <tr key={member._id || member.id}>
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td>
                            <span className={`role-badge role-${member.role}`}>
                              {member.role}
                            </span>
                          </td>
                          <td>
                            <span className={member.isActive ? 'status-active' : 'status-inactive'}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── NEW TAB CONTENT ── */}
          {activeTab === 'doctor-overview' && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Doctor Overview</h2>
              <DoctorOverviewPanel />
            </div>
          )}

          {activeTab === 'cleanliness' && (
            <CleanlinessMonitor />
          )}

          {activeTab === 'send-message' && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Send Message to Staff</h2>
              <SendMessagePanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
