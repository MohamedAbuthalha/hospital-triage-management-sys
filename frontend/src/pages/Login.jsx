
import { useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { login as loginAPI } from '../api/auth';
import { gsap } from 'gsap';
import './Login.css';

const Login = () => {
  const containerRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        '.login-overlay',
        { y: '0%' },
        { y: '-100%', duration: 1.2, ease: 'power4.inOut' }
      )
        .from(
          '.login-text',
          { opacity: 0, x: -80, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .from(
          '.login-card',
          { opacity: 0, scale: 0.9, duration: 0.8, ease: 'power3.out' },
          '-=0.6'
        )
        .from(
          '.form-group, .login-card button, .login-footer',
          {
            opacity: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.4'
        )
        // Ensure button remains visible and interactive
        .set('.login-card button', { opacity: 1, y: 0, pointerEvents: 'auto', visibility: 'visible' }, '+=0');
    }, containerRef);

    return () => ctx.revert(); // IMPORTANT: cleanup GSAP context
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAPI(email, password);

      if (response.success) {
        login(response.token, response.user);

        const role = response.user.role;
        if (role === 'admin')              navigate('/admin');
        else if (role === 'doctor')        navigate('/doctor');
        else if (role === 'nurse')         navigate('/nurse-dashboard');
        else if (role === 'pharmacist')    navigate('/pharmacy');
        else if (role === 'receptionist')  navigate('/reception');
        else if (role === 'lab')           navigate('/lab');
        else if (role === 'ward')          navigate('/ward');
        else navigate('/unauthorized');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-hero" ref={containerRef}>
      <div className="login-overlay"></div>

      <div className="login-content">
        <div className="login-text">
          <h1>Hospital</h1>
          <h2>Management System</h2>
          <p>Secure access for hospital staff</p>
        </div>

        <div className="login-card">
          <h3>Welcome Back</h3>
          <p className="subtitle">Staff Login</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Patient intake? <a href="/patient-intake">Click here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 

