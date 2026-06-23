// Root aplikasi: routing sederhana berbasis peran & state kunjungan.
// Alur: Login → (Visitor: Form → Status) | (Security: Dashboard) | (Admin: Dashboard).
import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import VisitorFormScreen from './screens/VisitorFormScreen';
import VisitorStatusScreen from './screens/VisitorStatusScreen';
import SecurityDashboard from './features/security/SecurityDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import { api } from './lib/api';

const SESSION_USER_KEY = 'vms.session.user';
const SESSION_VISIT_KEY = 'vms.session.visitStatus';

function readSession(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function writeSession(key, value) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // Storage bisa gagal di mode privat; state React tetap menjadi sumber sesi.
  }
}

const App = () => {
  const [user, setUser] = useState(() => (api.hasAuthSession() ? readSession(SESSION_USER_KEY) : null));
  const [visitStatus, setVisitStatus] = useState(() => readSession(SESSION_VISIT_KEY));

  const handleLogin = (userData) => {
    setUser(userData);
    writeSession(SESSION_USER_KEY, userData);
  };
  // VisitorFormScreen sudah mengirim ke backend & meneruskan { visitId, status, tujuan }.
  const handleVisitorSubmit = (result) => {
    setVisitStatus(result);
    writeSession(SESSION_VISIT_KEY, result);
  };
  const handleLogout = () => {
    api.clearAuthSession();
    setUser(null);
    setVisitStatus(null);
    writeSession(SESSION_USER_KEY, null);
    writeSession(SESSION_VISIT_KEY, null);
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
