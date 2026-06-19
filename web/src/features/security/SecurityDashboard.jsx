// Container panel Security: memuat data lewat api.* (mock/backend transparan),
// merakit sidebar, tab, & modal. Setiap aksi memanggil backend lalu memuat ulang.
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import SecuritySidebar from './SecuritySidebar';
import QueueTab from './QueueTab';
import ActiveVisitsTab from './ActiveVisitsTab';
import PackagesTab from './PackagesTab';
import HistoryTab from './HistoryTab';
import CheckInModal from './CheckInModal';
import RejectModal from './RejectModal';
import CheckoutModal from './CheckoutModal';
import AddPackageModal from './AddPackageModal';

const TITLES = {
  antrean: 'Antrean Menunggu',
  aktif: 'Tamu Aktif',
  paket: 'Paket & Kiriman Masuk',
  riwayat: 'Riwayat Kunjungan',
};

const SecurityDashboard = ({ user, onLogout }) => {
  const loc = user.location;
  const actor = user.email;

  const [activeTab, setActiveTab] = useState('antrean');
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Target modal (objek tamu) atau flag terbuka.
  const [checkInTarget, setCheckInTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [showAddPackage, setShowAddPackage] = useState(false);

  // Field input modal.
  const [cardNumber, setCardNumber] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [newPackage, setNewPackage] = useState({ sender: '', recipient: '', type: 'Dokumen' });
  const [packagePhoto, setPackagePhoto] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, a, h, pk] = await Promise.all([
        api.getPendingVisits(loc, actor),
        api.getActiveVisits(loc, actor),
        api.getHistory({ location: loc, actor_email: actor }),
        api.getPackages({ location: loc }, actor),
      ]);
      setPending(p);
      setActive(a);
      setHistory(h);
      setPackages(pk);
    } catch (err) {
      setError(err.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [loc, actor]);

  useEffect(() => { load(); }, [load]);

  const closeCheckIn = () => { setCheckInTarget(null); setCardNumber(''); };
  const closeReject = () => { setRejectTarget(null); setRejectReason(''); };

  // Bungkus aksi: jalankan, tutup modal, muat ulang; tampilkan error bila gagal.
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

  const handleCheckIn = () => {
    if (!cardNumber) return;
    run(() => api.checkIn(checkInTarget.id, cardNumber, actor), closeCheckIn);
  };
  const handleReject = () => {
    if (!rejectReason) return;
    run(() => api.rejectVisit(rejectTarget.id, rejectReason, actor), closeReject);
  };
  const handleCheckOut = () => {
    run(() => api.checkOut(checkoutTarget.id, actor), () => setCheckoutTarget(null));
  };
  const handlePickup = (id) => run(() => api.pickupPackage(id, actor));
  const handleAddPackage = () => {
    if (!newPackage.sender || !newPackage.recipient) return;
    run(async () => {
      let photoRef = '';
      if (packagePhoto) photoRef = (await api.uploadPhoto(packagePhoto, 'package', actor)).id;
      await api.addPackage({ ...newPackage, location: loc, photo_url: photoRef }, actor);
    }, () => {
      setShowAddPackage(false);
      setNewPackage({ sender: '', recipient: '', type: 'Dokumen' });
      setPackagePhoto('');
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F2F6] flex flex-col md:flex-row font-sans">
      <SecuritySidebar
        user={user}
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pending.length}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-normal text-[#1A1B1E]">{TITLES[activeTab]}</h1>
          {busy && <Loader2 className="text-[#3C6DB2] animate-spin" size={22} />}
        </div>

        {error && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-[12px] bg-[#FBE9EA] border border-[#E9A6AB] text-[#7A1D24] text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button className="font-medium underline shrink-0" onClick={load}>Coba lagi</button>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-[#74777F]">
            <Loader2 className="animate-spin mb-3" size={32} />
            <p>Memuat data…</p>
          </div>
        ) : (
          <>
            {activeTab === 'antrean' && <QueueTab visits={pending} onCheckIn={setCheckInTarget} onReject={setRejectTarget} />}
            {activeTab === 'aktif' && <ActiveVisitsTab visits={active} onCheckout={setCheckoutTarget} />}
            {activeTab === 'paket' && <PackagesTab packages={packages} onAdd={() => setShowAddPackage(true)} onPickup={handlePickup} />}
            {activeTab === 'riwayat' && <HistoryTab visits={history} />}
          </>
        )}
      </main>

      <CheckInModal visit={checkInTarget} cardNumber={cardNumber} setCardNumber={setCardNumber} onConfirm={handleCheckIn} onClose={closeCheckIn} busy={busy} />
      <RejectModal visit={rejectTarget} rejectReason={rejectReason} setRejectReason={setRejectReason} onConfirm={handleReject} onClose={closeReject} busy={busy} />
      <CheckoutModal visit={checkoutTarget} onConfirm={handleCheckOut} onClose={() => setCheckoutTarget(null)} busy={busy} />
      <AddPackageModal
        isOpen={showAddPackage}
        value={newPackage}
        setValue={setNewPackage}
        photo={packagePhoto}
        setPhoto={setPackagePhoto}
        onSave={handleAddPackage}
        onClose={() => setShowAddPackage(false)}
        busy={busy}
      />
    </div>
  );
};

export default SecurityDashboard;
