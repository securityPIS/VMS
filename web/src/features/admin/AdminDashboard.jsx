// Container panel Admin: memuat fungsi admin dan fungsi operasional security
// dalam satu dashboard. Admin bersifat global, sehingga data operasional
// diminta tanpa filter lokasi, sedangkan backend tetap mencatat actor email.
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { dateID, sortVisitsNewest, timeID } from '../../lib/constants';
import AdminSidebar from './AdminSidebar';
import DashboardOverviewTab from './DashboardOverviewTab';
import OfficerAssignmentTab from './OfficerAssignmentTab';
import VisitorTimelineTab from './VisitorTimelineTab';
import AddOfficerModal from './AddOfficerModal';
import DeleteOfficerModal from './DeleteOfficerModal';
import QueueTab from '../security/QueueTab';
import ActiveVisitsTab from '../security/ActiveVisitsTab';
import PackagesTab from '../security/PackagesTab';
import HistoryTab from '../security/HistoryTab';
import CheckInModal from '../security/CheckInModal';
import RejectModal from '../security/RejectModal';
import CheckoutModal from '../security/CheckoutModal';
import AddPackageModal from '../security/AddPackageModal';

const TITLES = {
  dashboard: 'Dashboard Statistik',
  assignment: 'Manajemen Petugas',
  visitor: 'Rekam Jejak Kunjungan',
  antrean: 'Antrean Semua Lokasi',
  aktif: 'Tamu Aktif Semua Lokasi',
  riwayat: 'LOG Semua Lokasi',
  paket: 'Paket & Kiriman Semua Lokasi',
};

const emptyOfficerDraft = (locations) => {
  const loc = locations[0] || { location_id: '', name: '' };
  return { name: '', email: '', location_id: loc.location_id, location: loc.name };
};

const emptyPackageDraft = (locations) => {
  const loc = locations[0] || { location_id: '', name: '' };
  return { sender: '', recipient: '', type: 'Dokumen', location_id: loc.location_id, location: loc.name };
};

const AdminDashboard = ({ user, onLogout }) => {
  const actor = user.email;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [officers, setOfficers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [deletingOfficer, setDeletingOfficer] = useState(null);
  const [officerDraft, setOfficerDraft] = useState(emptyOfficerDraft([]));

  const [checkInTarget, setCheckInTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [newPackage, setNewPackage] = useState(emptyPackageDraft([]));
  const [packagePhoto, setPackagePhoto] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [o, h, locs, p, a, pk] = await Promise.all([
        api.getOfficers(),
        api.getHistory(),
        api.getLocations(),
        api.getPendingVisits(undefined, actor),
        api.getActiveVisits(undefined, actor),
        api.getPackages({}, actor),
      ]);
      setOfficers(o);
      setVisits(h);
      setHistory(sortVisitsNewest(h));
      setLocations(locs);
      setPending(p);
      setActive(a);
      setPackages(pk);
    } catch (err) {
      setError(err.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, onDone) => {
    setBusy(true);
    setError('');
    try {
      const result = await fn();
      if (onDone) onDone(result);
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

  const openAddPackage = () => {
    setNewPackage(emptyPackageDraft(locations));
    setPackagePhoto('');
    setShowAddPackage(true);
  };

  const closeAddPackage = () => {
    setShowAddPackage(false);
    setNewPackage(emptyPackageDraft(locations));
    setPackagePhoto('');
  };

  const closeCheckIn = () => {
    setCheckInTarget(null);
    setCardNumber('');
    setConfirmNotes('');
  };

  const closeReject = () => {
    setRejectTarget(null);
    setRejectReason('');
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

  const handleCheckIn = () => {
    if (!cardNumber || !confirmNotes.trim() || !checkInTarget) return;
    const target = checkInTarget;
    const card = cardNumber.trim();
    const notes = confirmNotes.trim();
    const checkedInAt = new Date();
    run(() => api.checkIn(target.id, card, notes, actor), () => {
      setPending((prev) => prev.filter((x) => x.id !== target.id));
      setActive((prev) => [{
        ...target,
        status: 'CHECKED_IN',
        cardNumber: card,
        confirmNotes: notes,
        checkinAt: checkedInAt.toISOString(),
        checkinDate: dateID(checkedInAt),
        checkinTime: timeID(checkedInAt),
      }, ...prev]);
      closeCheckIn();
    });
  };

  const handleReject = () => {
    if (!rejectReason || !rejectTarget) return;
    const target = rejectTarget;
    run(() => api.rejectVisit(target.id, rejectReason, actor), () => {
      setPending((prev) => prev.filter((x) => x.id !== target.id));
      closeReject();
    });
  };

  const handleCheckOut = () => {
    if (!checkoutTarget) return;
    const target = checkoutTarget;
    run(() => api.checkOut(target.id, actor), () => {
      setActive((prev) => prev.filter((x) => x.id !== target.id));
      setCheckoutTarget(null);
    });
  };

  const handlePickup = (id) =>
    run(() => api.pickupPackage(id, actor), () => {
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'PICKED_UP' } : p)));
    });

  const handleAddPackage = () => {
    if (!newPackage.sender || !newPackage.recipient || !newPackage.location_id) return;
    const draft = newPackage;
    const photo = packagePhoto;
    run(async () => {
      let photoRef = '';
      if (photo) photoRef = (await api.uploadPhoto(photo, 'package', actor)).id;
      const res = await api.addPackage({ ...draft, photo_url: photoRef }, actor);
      return { ...res, photoRef };
    }, (res) => {
      const d = new Date();
      setPackages((prev) => [{
        id: res.package_id,
        sender: draft.sender,
        recipient: draft.recipient,
        type: draft.type,
        status: 'RECEIVED',
        photo: res.photoRef || null,
        location: draft.location,
        date: dateID(d),
        time: timeID(d),
      }, ...prev]);
      closeAddPackage();
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      <AdminSidebar
        user={user}
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pending.length}
        activeCount={active.length}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <p className="eyebrow mb-1.5">Panel Administrator</p>
            <h1 className="text-3xl md:text-4xl text-display leading-tight">{TITLES[activeTab]}</h1>
            <p className="text-sm text-ink-muted mt-2">Data operasional Visitor Management System.</p>
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

        {activeTab === 'antrean' && (
          loading ? <LoadingBlock /> : (
            <QueueTab visits={pending} onCheckIn={setCheckInTarget} onReject={setRejectTarget} showLocation />
          )
        )}

        {activeTab === 'aktif' && (
          loading ? <LoadingBlock /> : (
            <ActiveVisitsTab visits={active} onCheckout={setCheckoutTarget} showLocation />
          )
        )}

        {activeTab === 'riwayat' && (
          loading ? <LoadingBlock /> : <HistoryTab visits={history} showLocation />
        )}

        {activeTab === 'paket' && (
          loading ? <LoadingBlock /> : (
            <PackagesTab packages={packages} onAdd={openAddPackage} onPickup={handlePickup} showLocation />
          )
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
      <CheckInModal
        visit={checkInTarget}
        cardNumber={cardNumber}
        setCardNumber={setCardNumber}
        confirmNotes={confirmNotes}
        setConfirmNotes={setConfirmNotes}
        onConfirm={handleCheckIn}
        onClose={closeCheckIn}
        busy={busy}
      />
      <RejectModal
        visit={rejectTarget}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onConfirm={handleReject}
        onClose={closeReject}
        busy={busy}
      />
      <CheckoutModal
        visit={checkoutTarget}
        onConfirm={handleCheckOut}
        onClose={() => setCheckoutTarget(null)}
        busy={busy}
      />
      <AddPackageModal
        isOpen={showAddPackage}
        value={newPackage}
        setValue={setNewPackage}
        photo={packagePhoto}
        setPhoto={setPackagePhoto}
        locations={locations}
        requireLocation
        onSave={handleAddPackage}
        onClose={closeAddPackage}
        busy={busy}
      />
    </div>
  );
};

const LoadingBlock = () => (
  <div className="py-24 flex flex-col items-center justify-center text-[#74777F]">
    <Loader2 className="animate-spin mb-3" size={32} />
    <p>Memuat data...</p>
  </div>
);

export default AdminDashboard;
