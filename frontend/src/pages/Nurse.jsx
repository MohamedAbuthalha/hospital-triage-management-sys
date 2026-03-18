import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { addVitals } from '../api/nurse';
import { getMyCases } from '../api/doctor';
import api from '../api/axios';
import './Nurse.css';
import Icon from '../components/Icon';

const Nurse = () => {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    oxygenLevel: '',
    notes: '',
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      // Fetch cases that nurses can add vitals to
      // Using the patient API to get all cases
      const response = await api.get('/patients');
      if (response.data.success) {
        // Filter for cases that are waiting or assigned
        const activeCases = (response.data.data || []).filter(
          (c) => c.status === 'waiting' || c.status === 'assigned'
        );
        setCases(activeCases);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVitals = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      setError('');
      setSuccess('');
      const response = await addVitals(selectedCase._id || selectedCase.id, vitalsForm);
      if (response.success) {
        setSuccess('Vitals recorded successfully!');
        setVitalsForm({
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          oxygenLevel: '',
          notes: '',
        });
        setSelectedCase(null);
        loadCases();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record vitals');
    }
  };

  const openVitalsForm = (caseItem) => {
    setSelectedCase(caseItem);
    if (caseItem.vitals) {
      setVitalsForm({
        bloodPressure: caseItem.vitals.bloodPressure || '',
        heartRate: caseItem.vitals.heartRate || '',
        temperature: caseItem.vitals.temperature || '',
        oxygenLevel: caseItem.vitals.oxygenLevel || '',
        notes: caseItem.vitals.notes || '',
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  return (
    <div className="nurse-container">
      <header className="nurse-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="nurse" size="xl" color="#06b6d4" /> Nurse Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="nurse-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="cases-section">
          <h2>Patient Cases</h2>
          {loading ? (
            <p>Loading cases...</p>
          ) : cases.length === 0 ? (
            <div className="empty-state">No active cases found</div>
          ) : (
            <div className="cases-list">
              {cases.map((caseItem) => (
                <div key={caseItem._id || caseItem.id} className="case-card">
                  <div className="case-header">
                    <div>
                      <h3>{caseItem.name}</h3>
                      <p className="case-meta">
                        {caseItem.age} years, {caseItem.gender}
                      </p>
                    </div>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(caseItem.severity) }}
                    >
                      {caseItem.severity}
                    </span>
                  </div>
                  <div className="case-details">
                    <div className="detail-item">
                      <strong>Symptoms:</strong> {caseItem.symptoms}
                    </div>
                    <div className="detail-item">
                      <strong>Specialization:</strong> {caseItem.specialization}
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong> {caseItem.status}
                    </div>
                    {caseItem.vitals && (
                      <div className="vitals-display">
                        <strong>Current Vitals:</strong>
                        <div className="vitals-grid">
                          {caseItem.vitals.bloodPressure && (
                            <span>BP: {caseItem.vitals.bloodPressure}</span>
                          )}
                          {caseItem.vitals.heartRate && (
                            <span>HR: {caseItem.vitals.heartRate} bpm</span>
                          )}
                          {caseItem.vitals.temperature && (
                            <span>Temp: {caseItem.vitals.temperature}°F</span>
                          )}
                          {caseItem.vitals.oxygenLevel && (
                            <span>O2: {caseItem.vitals.oxygenLevel}%</span>
                          )}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => openVitalsForm(caseItem)}
                      className="add-vitals-btn"
                    >
                      {caseItem.vitals ? 'Update Vitals' : 'Add Vitals'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCase && (
          <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Record Vitals - {selectedCase.name}</h2>
              <form onSubmit={handleAddVitals} className="vitals-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Blood Pressure</label>
                    <input
                      type="text"
                      value={vitalsForm.bloodPressure}
                      onChange={(e) =>
                        setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })
                      }
                      placeholder="e.g., 120/80"
                    />
                  </div>
                  <div className="form-group">
                    <label>Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={vitalsForm.heartRate}
                      onChange={(e) =>
                        setVitalsForm({ ...vitalsForm, heartRate: e.target.value })
                      }
                      placeholder="e.g., 72"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Temperature (°F)</label>
                    <input
                      type="number"
                      value={vitalsForm.temperature}
                      onChange={(e) =>
                        setVitalsForm({ ...vitalsForm, temperature: e.target.value })
                      }
                      placeholder="e.g., 98.6"
                    />
                  </div>
                  <div className="form-group">
                    <label>Oxygen Level (%)</label>
                    <input
                      type="number"
                      value={vitalsForm.oxygenLevel}
                      onChange={(e) =>
                        setVitalsForm({ ...vitalsForm, oxygenLevel: e.target.value })
                      }
                      placeholder="e.g., 98"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={vitalsForm.notes}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setSelectedCase(null)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Save Vitals
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nurse;
