// Container panel Admin: memuat petugas & riwayat lewat api.*, tab routing,
// modal tambah petugas. Aksi memanggil backend lalu memuat ulang data.
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import AdminSidebar from './AdminSidebar';
import DashboardOverviewTab from './DashboardOverviewTab';
import OfficerAssignmentTab from './OfficerAssignmentTab';
import VisitorTimelineTab from './VisitorTimelineTab';
import AddOfficerModal from './AddOfficerModal';
import DeleteOfficerModal from './DeleteOfficerModal';

const TITLES = {
  dashboard: 'Dashboard Statistik',
  assignment: 'Manajemen Petugas',
  visitor: 'Rekam Jejak Kunjungan',
};

const emptyOfficerDraft = (locations) => {
  const loc = locations[0] || { location_id: '', name: '' };
  return { name: '', email: '', location_id: loc.location_id, location: loc.name };
};

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [officers, setOfficers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [deletingOfficer, setDeletingOfficer] = useState(null);
  const [officerDraft, setOfficerDraft] = useState(emptyOfficerDraft([]));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [o, h, locs] = await Promise.all([api.getOfficers(), api.getHistory({}), api.getLocations()]);
      setOfficers(o);
      setVisits(h);
      setLocations(locs);
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

  const openAddOfficer = () => {
    setEditingOfficer(null);
    setOfficerDraft(emptyOfficerDraft(locations));
    setShowOfficerModal(true);
  };

  const openEditOfficer = (officer) => {
    setEditingOfficer(officer);
    setOfficerDraft({
      name: officer.name || '',
      email: officer.email || '',
      location_id: officer.location_id || '',
      location: officer.location || '',
    });
    setShowOfficerModal(true);
  };

  const closeOfficerModal = () => {
    setShowOfficerModal(false);
    setEditingOfficer(null);
    setOfficerDraft(emptyOfficerDraft(locations));
  };

  const handleSaveOfficer = () => {
    if (!officerDraft.name || !officerDraft.email || !officerDraft.location_id) return;
    const payload = {
      name: officerDraft.name.trim(),
      email: officerDraft.email.trim(),
      location_id: officerDraft.location_id,
      location: officerDraft.location,
    };
    if (editingOfficer) {
      run(() => api.updateOfficer({ officer_id: editingOfficer.officer_id || editingOfficer.id, ...payload }), closeOfficerModal);
      return;
    }
    run(() => api.addOfficer(payload), closeOfficerModal);
  };

  const handleDeleteOfficer = () => {
    if (!deletingOfficer) return;
    run(() => api.deleteOfficer(deletingOfficer.officer_id || deletingOfficer.id), () => {
      setDeletingOfficer(null);
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
            <OfficerAssignmentTab
              officers={officers}
              onAdd={openAddOfficer}
              onEdit={openEditOfficer}
              onDelete={setDeletingOfficer}
              onToggle={toggleOfficer}
            />
          )
        )}

        {activeTab === 'visitor' && (
          loading ? <LoadingBlock /> : <VisitorTimelineTab visits={visits} />
        )}
      </main>

      <AddOfficerModal
        isOpen={showOfficerModal}
        mode={editingOfficer ? 'edit' : 'add'}
        value={officerDraft}
        setValue={setOfficerDraft}
        locations={locations}
        onSave={handleSaveOfficer}
        onClose={closeOfficerModal}
        busy={busy}
      />
      <DeleteOfficerModal
        officer={deletingOfficer}
        onConfirm={handleDeleteOfficer}
        onClose={() => setDeletingOfficer(null)}
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
