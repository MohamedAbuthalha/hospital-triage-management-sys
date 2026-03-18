import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMyCases, completeCase } from '../api/doctor';
import './Doctor.css';
import Icon from '../components/Icon';

const Doctor = () => {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await getMyCases();
      if (response.success) {
        setCases(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCase = async (caseId) => {
    if (!window.confirm('Mark this case as complete?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await completeCase(caseId);
      if (response.success) {
        setSuccess('Case marked as complete!');
        loadCases();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete case');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in-treatment':
        return '#2196f3';
      case 'assigned':
        return '#ff9800';
      default:
        return '#666';
    }
  };

  return (
    <div className="doctor-container">
      <header className="doctor-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="doctor" size="xl" color="#0891b2" /> Doctor Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, Dr. {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="doctor-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{cases.length}</div>
            <div className="stat-label">Total Cases</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {cases.filter((c) => c.status !== 'completed').length}
            </div>
            <div className="stat-label">Active Cases</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {cases.filter((c) => c.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {cases.filter((c) => c.severity === 'critical').length}
            </div>
            <div className="stat-label">Critical</div>
          </div>
        </div>

        <div className="cases-section">
          <h2>My Assigned Cases</h2>
          {loading ? (
            <p>Loading cases...</p>
          ) : cases.length === 0 ? (
            <div className="empty-state">No cases assigned yet</div>
          ) : (
            <div className="cases-list">
              {cases.map((caseItem) => (
                <div key={caseItem._id || caseItem.id} className="case-card">
                  <div className="case-card-top">
                    <div className="case-patient-info">
                      <h3 className="patient-name">{caseItem.name}</h3>
                      <p className="case-meta">{caseItem.age} years • {caseItem.gender}</p>
                    </div>
                    <div className="case-badges">
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(caseItem.severity) }}
                      >
                        {caseItem.severity}
                      </span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(caseItem.status) }}
                      >
                        {caseItem.status}
                      </span>
                    </div>
                  </div>

                  <div className="case-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Symptoms:</strong>
                        <p>{caseItem.symptoms}</p>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Specialization:</strong>
                        <p>{caseItem.specialization}</p>
                      </div>
                    </div>

                    {caseItem.vitals && (
                      <div className="vitals-section">
                        <strong>Vitals:</strong>
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
                  </div>

                  <div className="case-actions">
                    {caseItem.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteCase(caseItem._id || caseItem.id)}
                        className="complete-btn"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctor;
