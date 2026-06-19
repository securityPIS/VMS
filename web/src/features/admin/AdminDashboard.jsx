// Container panel Admin: state petugas + tab routing + modal tambah petugas.
import { useState } from 'react';
import { MOCK_SECURITY_OFFICERS, MOCK_VISITS } from '../../lib/mockData';
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
  const [officers, setOfficers] = useState(MOCK_SECURITY_OFFICERS);
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [newOfficer, setNewOfficer] = useState({ name: '', email: '', location: LOCATIONS[0] });

  const handleAddOfficer = () => {
    if (!newOfficer.name || !newOfficer.email) return;
    setOfficers([...officers, { id: `SEC-0${officers.length + 1}`, ...newOfficer, status: 'Active' }]);
    setShowAddOfficer(false);
    setNewOfficer({ name: '', email: '', location: LOCATIONS[0] });
  };

  const toggleOfficer = (id) =>
    setOfficers(officers.map((o) => (o.id === id ? { ...o, status: o.status === 'Active' ? 'Inactive' : 'Active' } : o)));

  return (
    <div className="min-h-screen bg-[#F4F2F6] flex flex-col md:flex-row font-sans">
      <AdminSidebar user={user} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-normal text-[#1A1B1E] leading-tight">{TITLES[activeTab]}</h1>
            <p className="text-sm text-[#44474E] mt-1.5">Data operasional Visitor Management System.</p>
          </div>
        </div>

        {activeTab === 'dashboard' && <DashboardOverviewTab />}
        {activeTab === 'assignment' && (
          <OfficerAssignmentTab officers={officers} onAdd={() => setShowAddOfficer(true)} onToggle={toggleOfficer} />
        )}
        {activeTab === 'visitor' && <VisitorTimelineTab visits={MOCK_VISITS} />}
      </main>

      <AddOfficerModal
        isOpen={showAddOfficer}
        value={newOfficer}
        setValue={setNewOfficer}
        onSave={handleAddOfficer}
        onClose={() => setShowAddOfficer(false)}
      />
    </div>
  );
};

export default AdminDashboard;
