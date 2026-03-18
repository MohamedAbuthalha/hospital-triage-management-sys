import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Unauthorized.css';
import Icon from '../components/Icon';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Icon name="error" size="xl" color="#dc2626" /> Unauthorized Access</h1>
        <p>You don't have permission to access this page.</p>
        {user && (
          <p className="user-info">Current role: <strong>{user.role}</strong></p>
        )}
        <div className="button-group">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Go Back
          </button>
          <button onClick={handleLogout} className="btn-primary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
