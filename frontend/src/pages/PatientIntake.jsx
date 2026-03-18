import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatientCase } from '../api/patient';
import './PatientIntake.css';
import Icon from '../components/Icon';

const PatientIntake = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    symptoms: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createPatientCase({
        ...formData,
        age: parseInt(formData.age),
      });

      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          age: '',
          gender: '',
          symptoms: '',
        });
        // Optionally redirect after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit patient information. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-intake-container">
      <div className="patient-intake-card">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="hospital" size="xl" color="#0891b2" /> Patient Intake Form</h1>
        <p className="subtitle">Please provide your information to begin the triage process</p>

        {success && (
          <div className="success-message">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="success" size="lg" color="success" /> Submission Successful!</h3>
            <p>
              Your information has been received. You will be assigned to a doctor based on your
              symptoms and priority. Thank you!
            </p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className="intake-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age *</label>
                <input
                  type="number"
                  id="age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  min="1"
                  max="150"
                  placeholder="45"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="symptoms">Symptoms *</label>
              <textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                required
                rows="4"
                placeholder="Please describe your symptoms in detail. For example: 'Chest pain and difficulty breathing' or 'High fever and body aches'"
              />
              <small className="hint">
                Provide as much detail as possible to help us assess your condition accurately.
              </small>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Submitting...' : 'Submit Information'}
            </button>
          </form>
        )}

        <div className="intake-footer">
          <p>
            <a href="/login">Staff login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientIntake;
