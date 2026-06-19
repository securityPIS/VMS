// Container panel Security: memegang state + alur, merakit sidebar, tab, & modal.
// State masih berbasis data mock lokal; ganti ke api.* saat backend disambung.
import { useState } from 'react';
import { MOCK_VISITS, MOCK_PACKAGES } from '../../lib/mockData';
import { timeID } from '../../lib/constants';
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
  const [activeTab, setActiveTab] = useState('antrean');
  const [visits, setVisits] = useState(MOCK_VISITS);
  const [packages, setPackages] = useState(MOCK_PACKAGES);

  // Target modal (objek tamu) atau flag terbuka.
  const [checkInTarget, setCheckInTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [showAddPackage, setShowAddPackage] = useState(false);

  // Field input modal.
  const [cardNumber, setCardNumber] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [newPackage, setNewPackage] = useState({ sender: '', recipient: '', type: 'Dokumen' });
  const [packagePhoto, setPackagePhoto] = useState(false);

  const pendingVisits = visits.filter((v) => v.status === 'PENDING');
  const activeVisits = visits.filter((v) => v.status === 'CHECKED_IN');

  const closeCheckIn = () => { setCheckInTarget(null); setCardNumber(''); };
  const closeReject = () => { setRejectTarget(null); setRejectReason(''); };

  const handleCheckIn = () => {
    if (!cardNumber) return;
    setVisits(visits.map((v) => (v.id === checkInTarget.id ? { ...v, status: 'CHECKED_IN', cardNumber } : v)));
    closeCheckIn();
  };
  const handleReject = () => {
    if (!rejectReason) return;
    setVisits(visits.map((v) => (v.id === rejectTarget.id ? { ...v, status: 'REJECTED', rejectReason } : v)));
    closeReject();
  };
  const handleCheckOut = () => {
    setVisits(visits.map((v) => (v.id === checkoutTarget.id ? { ...v, status: 'CHECKED_OUT', timeOut: timeID() } : v)));
    setCheckoutTarget(null);
  };
  const handleAddPackage = () => {
    if (!newPackage.sender || !newPackage.recipient) return;
    const pkg = {
      id: `PKG-${100 + packages.length + 1}`,
      sender: newPackage.sender,
      recipient: newPackage.recipient,
      type: newPackage.type,
      time: timeID(),
      date: new Date().toISOString().split('T')[0],
      status: 'RECEIVED',
      photo: packagePhoto ? 'https://images.unsplash.com/photo-1620062483863-12502660a920?w=150&h=150&fit=crop' : null,
    };
    setPackages([pkg, ...packages]);
    setShowAddPackage(false);
    setNewPackage({ sender: '', recipient: '', type: 'Dokumen' });
    setPackagePhoto(false);
  };
  const handlePickup = (id) => setPackages(packages.map((p) => (p.id === id ? { ...p, status: 'PICKED_UP' } : p)));

  return (
    <div className="min-h-screen bg-[#F4F2F6] flex flex-col md:flex-row font-sans">
      <SecuritySidebar
        user={user}
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingVisits.length}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl font-normal text-[#1A1B1E]">{TITLES[activeTab]}</h1>
        </div>

        {activeTab === 'antrean' && <QueueTab visits={pendingVisits} onCheckIn={setCheckInTarget} onReject={setRejectTarget} />}
        {activeTab === 'aktif' && <ActiveVisitsTab visits={activeVisits} onCheckout={setCheckoutTarget} />}
        {activeTab === 'paket' && <PackagesTab packages={packages} onAdd={() => setShowAddPackage(true)} onPickup={handlePickup} />}
        {activeTab === 'riwayat' && <HistoryTab visits={visits} />}
      </main>

      <CheckInModal visit={checkInTarget} cardNumber={cardNumber} setCardNumber={setCardNumber} onConfirm={handleCheckIn} onClose={closeCheckIn} />
      <RejectModal visit={rejectTarget} rejectReason={rejectReason} setRejectReason={setRejectReason} onConfirm={handleReject} onClose={closeReject} />
      <CheckoutModal visit={checkoutTarget} onConfirm={handleCheckOut} onClose={() => setCheckoutTarget(null)} />
      <AddPackageModal
        isOpen={showAddPackage}
        value={newPackage}
        setValue={setNewPackage}
        photo={packagePhoto}
        setPhoto={setPackagePhoto}
        onSave={handleAddPackage}
        onClose={() => setShowAddPackage(false)}
      />
    </div>
  );
};

export default SecurityDashboard;
