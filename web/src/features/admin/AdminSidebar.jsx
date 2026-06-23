// Sidebar navigasi panel admin (tema gelap, sesuai header dashboard admin).
import { LogOut, BarChart3, ShieldCheck, History, Clock, Users, Package } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

const NAV = [
  { key: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
  { key: 'assignment', label: 'Assignment Petugas', icon: ShieldCheck },
  { key: 'visitor', label: 'Jejak Visitor', icon: History },
  { key: 'antrean', label: 'Antrean', icon: Clock, countKey: 'pending' },
  { key: 'aktif', label: 'Tamu Aktif', icon: Users, countKey: 'active' },
  { key: 'riwayat', label: 'LOG', icon: History },
  { key: 'paket', label: 'Paket & Kiriman', icon: Package },
];

const AdminSidebar = ({ user, onLogout, activeTab, setActiveTab, pendingCount = 0, activeCount = 0 }) => (
  <aside className="w-full md:w-72 bg-ink-gradient text-white flex flex-col md:h-screen sticky top-0 z-10 md:rounded-r-[32px] shadow-float ring-1 ring-white/5">
    <div className="p-6 md:pb-8 flex items-center justify-between md:justify-center">
      <BrandLogo className="h-8 brightness-0 invert" />
      <button className="md:hidden text-white/70 hover:text-white" onClick={onLogout}>
        <LogOut size={24} />
      </button>
    </div>

    <div className="px-6 py-4 flex items-center gap-4 border-b border-white/10 mb-4 pb-6">
      <div className="w-12 h-12 rounded-full bg-brand-gradient text-white flex items-center justify-center font-medium text-lg shadow-premium ring-1 ring-white/20">
        {user.name.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-base">{user.name}</div>
        <div className="text-xs uppercase tracking-[0.18em] text-gold-soft/80 mt-0.5">Administrator</div>
      </div>
    </div>

    <nav className="flex-1 px-4 py-2 flex flex-row md:flex-col gap-2 overflow-x-auto">
      {NAV.map(({ key, label, icon: Icon, countKey }) => {
        const count = countKey === 'pending' ? pendingCount : countKey === 'active' ? activeCount : 0;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 whitespace-nowrap text-sm font-medium ${
              activeTab === key ? 'bg-brand-gradient text-white shadow-premium ring-1 ring-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
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
      <button
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
        onClick={onLogout}
      >
        <LogOut size={18} /> Keluar Sistem
      </button>
    </div>
  </aside>
);

export default AdminSidebar;
