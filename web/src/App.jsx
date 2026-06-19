// Root aplikasi: routing sederhana berbasis peran & state kunjungan.
// Alur: Login → (Visitor: Form → Status) | (Security: Dashboard) | (Admin: Dashboard).
import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import VisitorFormScreen from './screens/VisitorFormScreen';
import VisitorStatusScreen from './screens/VisitorStatusScreen';
import SecurityDashboard from './features/security/SecurityDashboard';
import AdminDashboard from './features/admin/AdminDashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [visitStatus, setVisitStatus] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleVisitorSubmit = (formData) => setVisitStatus({ status: 'PENDING', tujuan: formData.tujuan });
  const handleLogout = () => {
    setUser(null);
    setVisitStatus(null);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  if (user.role === 'visitor') {
    if (visitStatus) return <VisitorStatusScreen statusData={visitStatus} onLogout={handleLogout} />;
    return <VisitorFormScreen user={user} onSubmit={handleVisitorSubmit} />;
  }

  if (user.role === 'security') return <SecurityDashboard user={user} onLogout={handleLogout} />;
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;

  return <div>Role tidak diketahui</div>;
};

export default App;
