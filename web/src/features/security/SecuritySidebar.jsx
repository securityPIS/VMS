// Sidebar navigasi panel security (responsif: baris di mobile, kolom di desktop).
import { LogOut, Clock, Users, Package, History } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import Button from '../../components/Button';

const NAV = [
  { key: 'antrean', label: 'Antrean', icon: Clock },
  { key: 'aktif', label: 'Tamu Aktif', icon: Users },
  { key: 'riwayat', label: 'LOG', icon: History },
  { key: 'paket', label: 'Paket & Kiriman', icon: Package },
];

const SecuritySidebar = ({ user, onLogout, activeTab, setActiveTab, pendingCount, activeCount }) => (
  <aside className="w-full md:w-72 bg-white/80 backdrop-blur-xl flex flex-col md:h-screen sticky top-0 z-10 md:rounded-r-[32px] shadow-premium border-r border-white/70 ring-1 ring-ink/[0.03]">
    <div className="p-6 md:pb-4 flex items-center justify-between md:justify-center">
      <BrandLogo className="h-8" />
      <button className="md:hidden text-ink-soft" onClick={onLogout}>
        <LogOut size={24} />
      </button>
    </div>

    <div className="px-6 py-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-ink-gradient text-white flex items-center justify-center font-medium text-lg shadow-premium ring-1 ring-white/10">
        {user.name.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-ink">{user.name}</div>
        <div className="text-xs text-ink-muted">Petugas — {user.location || 'Semua Lokasi'}</div>
      </div>
    </div>

    <div className="mx-6 mb-2 rule-gold hidden md:block" />

    <nav className="flex-1 px-4 py-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto">
      {NAV.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        const count = key === 'antrean' ? pendingCount : key === 'aktif' ? activeCount : 0;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 whitespace-nowrap text-sm font-medium ${
              active ? 'bg-brand-gradient text-white shadow-premium' : 'text-ink-soft hover:bg-ink/[0.05]'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon size={20} /> {label}
              {count > 0 && <span className="md:hidden">({count})</span>}
            </span>
            {count > 0 && (
              <span className="hidden md:flex bg-[#BA313B] text-white text-[10px] w-5 h-5 items-center justify-center rounded-full">
                {count}
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
