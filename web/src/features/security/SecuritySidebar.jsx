// Sidebar navigasi panel security (responsif: baris di mobile, kolom di desktop).
import { LogOut, Clock, Users, Package, History } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import Button from '../../components/Button';

const NAV = [
  { key: 'antrean', label: 'Antrean', icon: Clock },
  { key: 'aktif', label: 'Tamu Aktif', icon: Users },
  { key: 'paket', label: 'Paket & Kiriman', icon: Package },
  { key: 'riwayat', label: 'Riwayat', icon: History },
];

const SecuritySidebar = ({ user, onLogout, activeTab, setActiveTab, pendingCount }) => (
  <aside className="w-full md:w-72 bg-[#FDFBFF] flex flex-col md:h-screen sticky top-0 z-10 md:rounded-r-[32px] shadow-sm border-r border-[#EAE7EC]">
    <div className="p-6 md:pb-4 flex items-center justify-between md:justify-center">
      <BrandLogo className="h-8" />
      <button className="md:hidden text-[#44474E]" onClick={onLogout}>
        <LogOut size={24} />
      </button>
    </div>

    <div className="px-6 py-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-[#1A1B1E] text-white flex items-center justify-center font-medium text-lg">
        {user.name.charAt(0)}
      </div>
      <div>
        <div className="font-medium text-[#1A1B1E]">{user.name}</div>
        <div className="text-xs text-[#74777F]">Petugas — {user.location || 'Semua Lokasi'}</div>
      </div>
    </div>

    <nav className="flex-1 px-4 py-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
      {NAV.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center justify-between px-4 py-3.5 rounded-full transition-colors whitespace-nowrap text-sm font-medium ${
              active ? 'bg-[#D5E3FF] text-[#001B3E]' : 'text-[#44474E] hover:bg-[#1A1B1E]/5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon size={20} /> {label}
              {key === 'antrean' && <span className="md:hidden">({pendingCount})</span>}
            </span>
            {key === 'antrean' && pendingCount > 0 && (
              <span className="hidden md:flex bg-[#BA313B] text-white text-[10px] w-5 h-5 items-center justify-center rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    <div className="p-6 mt-auto hidden md:block">
      <Button variant="outlined" className="w-full" onClick={onLogout}>
        <LogOut size={18} /> Keluar
      </Button>
    </div>
  </aside>
);

export default SecuritySidebar;
