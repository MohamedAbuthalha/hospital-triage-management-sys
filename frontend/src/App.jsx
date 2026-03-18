import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Original pages
import Login from './pages/Login';
import Admin from './pages/Admin';
import Doctor from './pages/Doctor';
import Nurse from './pages/Nurse';
import PatientIntake from './pages/PatientIntake';
import Unauthorized from './pages/Unauthorized';

// New role pages
import Receptionist from './pages/Receptionist';
import NurseDashboard from './pages/NurseDashboard';
import LabDashboard from './pages/LabDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import WardenDashboard from './pages/WardenDashboard';

// Themes and Styles
import './theme/theme.css';
import './App.css';

const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  if (role === 'admin')        return <Navigate to="/admin" replace />;
  if (role === 'doctor')       return <Navigate to="/doctor" replace />;
  if (role === 'nurse')        return <Navigate to="/nurse-dashboard" replace />;
  if (role === 'receptionist') return <Navigate to="/reception" replace />;
  if (role === 'lab')          return <Navigate to="/lab" replace />;
  if (role === 'pharmacist')   return <Navigate to="/pharmacy" replace />;
  if (role === 'ward')         return <Navigate to="/ward" replace />;

  return <Navigate to="/unauthorized" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/patient-intake" element={<PatientIntake />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ── ORIGINAL PROTECTED ROUTES (unchanged) ── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Doctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse"
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <Nurse />
                </ProtectedRoute>
              }
            />

            {/* ── NEW ROLE ROUTES ── */}
            <Route
              path="/nurse-dashboard"
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reception"
              element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <Receptionist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab"
              element={
                <ProtectedRoute allowedRoles={['lab']}>
                  <LabDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy"
              element={
                <ProtectedRoute allowedRoles={['pharmacist']}>
                  <PharmacistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ward"
              element={
                <ProtectedRoute allowedRoles={['ward']}>
                  <WardenDashboard />
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<RoleRedirect />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
