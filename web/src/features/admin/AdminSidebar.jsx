// Sidebar navigasi panel admin (tema gelap, sesuai header dashboard admin).
import { LogOut, BarChart3, ShieldCheck, History } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

const NAV = [
  { key: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
  { key: 'assignment', label: 'Assignment Petugas', icon: ShieldCheck },
  { key: 'visitor', label: 'Jejak Visitor', icon: History },
];

const AdminSidebar = ({ user, onLogout, activeTab, setActiveTab }) => (
  <aside className="w-full md:w-72 bg-[#1A1B1E] text-white flex flex-col md:h-screen sticky top-0 z-10 md:rounded-r-[32px] shadow-lg">
    <div className="p-6 md:pb-8 flex items-center justify-between md:justify-center">
      <BrandLogo className="h-8 brightness-0 invert" />
      <button className="md:hidden text-white/70 hover:text-white" onClick={onLogout}>
        <LogOut size={24} />
      </button>
    </div>

    <div className="px-6 py-4 flex items-center gap-4 border-b border-white/10 mb-4 pb-6">
      <div className="w-12 h-12 rounded-full bg-[#3C6DB2] text-white flex items-center justify-center font-medium text-lg">
        {user.name.charAt(0)}
      </div>
      <div>
        <div className="font-medium text-base">{user.name}</div>
        <div className="text-sm text-white/60">Administrator</div>
      </div>
    </div>

    <nav className="flex-1 px-4 py-2 flex flex-row md:flex-col gap-2 overflow-x-auto">
      {NAV.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-full transition-colors whitespace-nowrap text-sm font-medium ${
            activeTab === key ? 'bg-[#3C6DB2] text-white' : 'text-white/60 hover:bg-white/5'
          }`}
        >
          <Icon size={20} /> {label}
        </button>
      ))}
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
