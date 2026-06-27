// Container panel Security: memuat data lewat api.* (mock/backend transparan),
// merakit sidebar, tab, & modal. Setiap aksi memanggil backend lalu memuat ulang.
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { makeThumb } from '../../components/PhotoCapture';
import { dateID, sortVisitsNewest, timeID, visitScheduleStatus } from '../../lib/constants';
import Button from '../../components/Button';
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
  riwayat: 'LOG',
};

const isStatusText = (value) => ['active', 'inactive'].includes(String(value || '').trim().toLowerCase());

function securityScope(user) {
  return {
    location_id: user.location_id || '',
    location: isStatusText(user.location) ? '' : (user.location || ''),
  };
}

function locationLabel(user) {
  const scope = securityScope(user);
  return scope.location || scope.location_id || 'Lokasi belum valid';
}

const SecurityDashboard = ({ user, onLogout }) => {
  const loc = locationLabel(user);
  const locScope = securityScope(user);
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
  const [confirmNotes, setConfirmNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [newPackage, setNewPackage] = useState({ sender: '', recipient: '', type: '' });
  const [packagePhoto, setPackagePhoto] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const tasks = [
      ['Antrean', api.getPendingVisits(locScope), setPending],
      ['Tamu aktif', api.getActiveVisits(locScope), setActive],
      ['LOG', api.getHistory(locScope), (rows) => setHistory(sortVisitsNewest(rows))],
      ['Paket', api.getPackages(locScope), setPackages],
    ];
    const results = await Promise.allSettled(tasks.map(([, promise]) => promise));
    const failures = [];
    results.forEach((result, index) => {
      const [label, , apply] = tasks[index];
      if (result.status === 'fulfilled') {
        apply(result.value);
      } else {
        failures.push(`${label}: ${api.errorDetails(result.reason, 'Gagal memuat data.')}`);
      }
    });
    if (failures.length) setError(failures.join(' '));
    setLoading(false);
  }, [locScope.location_id, locScope.location, actor]);

  useEffect(() => { load(); }, [load]);

  const closeCheckIn = () => { setCheckInTarget(null); setCardNumber(''); setConfirmNotes(''); };
  const closeReject = () => { setRejectTarget(null); setRejectReason(''); };

  // Bungkus aksi: jalankan aksi backend lalu terapkan perubahan ke state lokal
  // (optimistic) — tanpa memuat ulang keempat dataset, agar respons terasa instan.
  // Bila aksi gagal, sinkron ulang penuh dari backend dan tampilkan error.
  const run = async (fn, apply) => {
    setBusy(true);
    setError('');
    try {
      const result = await fn();
      if (apply) apply(result);
    } catch (err) {
      setError(err.message || 'Aksi gagal.');
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleCheckIn = () => {
    const isSchedule = visitScheduleStatus(checkInTarget) === 'SCHEDULE';
    if (!cardNumber || (isSchedule && !confirmNotes.trim())) return;
    const target = checkInTarget;
    const card = cardNumber.trim();
    const notes = confirmNotes.trim();
    const checkedInAt = new Date();
    const checkedIn = {
      ...target,
      status: 'CHECKED_IN',
      cardNumber: card,
      confirmNotes: notes,
      checkinAt: checkedInAt.toISOString(),
      checkinDate: dateID(checkedInAt),
      checkinTime: timeID(checkedInAt),
    };
    run(() => api.checkIn(target.id, card, notes, actor), () => {
      setPending((prev) => prev.filter((x) => x.id !== target.id));
      setActive((prev) => [checkedIn, ...prev]);
      // LOG juga ikut berubah ke status Check In tanpa perlu muat ulang.
      setHistory((prev) => {
        const exists = prev.some((x) => x.id === target.id);
        const next = exists
          ? prev.map((x) => (x.id === target.id ? { ...x, ...checkedIn } : x))
          : [checkedIn, ...prev];
        return sortVisitsNewest(next);
      });
      closeCheckIn();
    });
  };
  const handleReject = () => {
    if (!rejectReason) return;
    const target = rejectTarget;
    run(() => api.rejectVisit(target.id, rejectReason, actor), () => {
      setPending((prev) => prev.filter((x) => x.id !== target.id));
      closeReject();
    });
  };
  const handleCheckOut = () => {
    const target = checkoutTarget;
    const checkedOutAt = new Date();
    run(() => api.checkOut(target.id, actor), () => {
      setActive((prev) => prev.filter((x) => x.id !== target.id));
      // LOG ikut berubah ke status Check Out (auto-refresh tanpa muat ulang).
      setHistory((prev) => prev.map((x) => (x.id === target.id ? {
        ...x,
        status: 'CHECKED_OUT',
        checkoutAt: checkedOutAt.toISOString(),
        timeOut: timeID(checkedOutAt),
      } : x)));
      setCheckoutTarget(null);
    });
  };
  const handlePickup = (id) =>
    run(() => api.pickupPackage(id, actor), () => {
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'PICKED_UP' } : p)));
    });
  const handleAddPackage = () => {
    if (!newPackage.sender || !newPackage.recipient) return;
    const draft = newPackage;
    const photo = packagePhoto;
    run(async () => {
      let photoRef = '';
      let photoThumbRef = '';
      if (photo) {
        const up = await api.uploadPhoto(photo, 'package', await makeThumb(photo));
        photoRef = up.id;
        photoThumbRef = up.thumb_id || '';
      }
      const res = await api.addPackage({ ...draft, ...locScope, photo_url: photoRef, photo_thumb_url: photoThumbRef }, actor);
      return { ...res, photoRef, photoThumbRef };
    }, (res) => {
      const d = new Date();
      setPackages((prev) => [{
        id: res.package_id,
        sender: draft.sender,
        recipient: draft.recipient,
        type: draft.type,
        status: 'RECEIVED',
        photo: res.photoRef || null,
        photoThumb: res.photoThumbRef || null,
        location: loc,
        date: dateID(d),
        time: timeID(d),
      }, ...prev]);
      setShowAddPackage(false);
      setNewPackage({ sender: '', recipient: '', type: '' });
      setPackagePhoto('');
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      <SecuritySidebar
        user={{ ...user, location: loc }}
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pending.length}
        activeCount={active.length}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl text-display">{TITLES[activeTab]}</h1>
          <div className="flex items-center gap-3 shrink-0">
            {busy && <Loader2 className="text-[#3C6DB2] animate-spin" size={22} />}
            {activeTab === 'paket' && (
              <Button
                variant="filled"
                className="md:hidden !px-4 !py-2 !gap-1.5 text-sm whitespace-nowrap"
                onClick={() => setShowAddPackage(true)}
              >
                <Plus size={16} /> Registrasi
              </Button>
            )}
          </div>
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
