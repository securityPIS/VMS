// Container panel Admin: memuat petugas & riwayat lewat api.*, tab routing,
// modal tambah petugas. Aksi memanggil backend lalu memuat ulang data.
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { LOCATIONS } from '../../lib/constants';
import AdminSidebar from './AdminSidebar';
import DashboardOverviewTab from './DashboardOverviewTab';
import OfficerAssignmentTab from './OfficerAssignmentTab';
import VisitorTimelineTab from './VisitorTimelineTab';
import AddOfficerModal from './AddOfficerModal';

const TITLES = {
  dashboard: 'Dashboard Statistik',
  assignment: 'Manajemen Petugas',
  visitor: 'Rekam Jejak Kunjungan',
};

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [officers, setOfficers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [newOfficer, setNewOfficer] = useState({ name: '', email: '', location: LOCATIONS[0] });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [o, h] = await Promise.all([api.getOfficers(), api.getHistory({})]);
      setOfficers(o);
      setVisits(h);
    } catch (err) {
      setError(err.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, onDone) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      if (onDone) onDone();
      await load();
    } catch (err) {
      setError(err.message || 'Aksi gagal.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddOfficer = () => {
    if (!newOfficer.name || !newOfficer.email) return;
    run(() => api.addOfficer(newOfficer), () => {
      setShowAddOfficer(false);
      setNewOfficer({ name: '', email: '', location: LOCATIONS[0] });
    });
  };

  const toggleOfficer = (officer) => {
    const nextStatus = officer.status === 'Active' ? 'Inactive' : 'Active';
    run(() => api.updateOfficer({ officer_id: officer.officer_id || officer.id, status: nextStatus }));
  };

  return (
    <div className="min-h-screen bg-[#F4F2F6] flex flex-col md:flex-row font-sans">
      <AdminSidebar user={user} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-normal text-[#1A1B1E] leading-tight">{TITLES[activeTab]}</h1>
            <p className="text-sm text-[#44474E] mt-1.5">Data operasional Visitor Management System.</p>
          </div>
          {busy && <Loader2 className="text-[#3C6DB2] animate-spin" size={22} />}
        </div>

        {error && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-[12px] bg-[#FBE9EA] border border-[#E9A6AB] text-[#7A1D24] text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button className="font-medium underline shrink-0" onClick={load}>Coba lagi</button>
          </div>
        )}

        {activeTab === 'dashboard' && <DashboardOverviewTab />}

        {activeTab === 'assignment' && (
          loading ? <LoadingBlock /> : (
            <OfficerAssignmentTab officers={officers} onAdd={() => setShowAddOfficer(true)} onToggle={toggleOfficer} />
          )
        )}

        {activeTab === 'visitor' && (
          loading ? <LoadingBlock /> : <VisitorTimelineTab visits={visits} />
        )}
      </main>

      <AddOfficerModal
        isOpen={showAddOfficer}
        value={newOfficer}
        setValue={setNewOfficer}
        onSave={handleAddOfficer}
        onClose={() => setShowAddOfficer(false)}
        busy={busy}
      />
    </div>
  );
};

const LoadingBlock = () => (
  <div className="py-24 flex flex-col items-center justify-center text-[#74777F]">
    <Loader2 className="animate-spin mb-3" size={32} />
    <p>Memuat data…</p>
  </div>
);

export default AdminDashboard;
