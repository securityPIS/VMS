// Tab Dashboard Analitik admin: kartu metrik + grafik tren & distribusi (UIUX 5.12).
// Data dari api.getDashboardStats (mock/backend transparan).
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, CheckCircle, AlertCircle, LogIn, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { PIE_COLORS } from '../../lib/mockData';

const tooltipStyle = { borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' };
const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('id-ID') : '—');

const DashboardOverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.getDashboardStats()
      .then((s) => { if (alive) setStats(s); })
      .catch((e) => { if (alive) setError(e.message || 'Gagal memuat statistik.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[#74777F]">
        <Loader2 className="animate-spin mb-3" size={32} />
        <p>Memuat statistik…</p>
      </div>
    );
  }

  const weekly = stats?.weekly || [];
  const dept = stats?.dept || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {error && (
        <div role="alert" className="px-4 py-3 rounded-[12px] bg-[#FBE9EA] border border-[#E9A6AB] text-[#7A1D24] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Total Tamu (Bulan Ini)" value={fmt(stats?.totalMonth)} />
        <MetricCard icon={CheckCircle} label="Tamu Selesai Hari Ini" value={fmt(stats?.doneToday)} />
        <MetricCard icon={LogIn} label="Sedang Berkunjung" value={fmt(stats?.activeNow)} />
        <MetricCard icon={AlertCircle} label="Kunjungan Ditolak" value={fmt(stats?.rejected)} valueClass="text-[#BA313B]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC] h-[420px] flex flex-col">
          <h3 className="text-lg font-medium text-[#1A1B1E] mb-6">Tren Kunjungan Mingguan</h3>
          <div className="flex-1 min-h-0">
            {weekly.length === 0 ? (
              <EmptyChart label="Belum ada data kunjungan minggu ini." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE7EC" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#74777F', fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#74777F', fontSize: 13 }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#F4F2F6' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="kunjungan" fill="#3C6DB2" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC] h-[420px] flex flex-col">
          <h3 className="text-lg font-medium text-[#1A1B1E] mb-6">Distribusi Tujuan Kunjungan</h3>
          <div className="flex-1 min-h-0 relative flex justify-center">
            {dept.length === 0 ? (
              <EmptyChart label="Belum ada data tujuan kunjungan." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dept} cx="50%" cy="50%" innerRadius={90} outerRadius={125} paddingAngle={2} dataKey="value" stroke="none">
                    {dept.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    iconSize={12}
                    formatter={(value) => <span className="text-sm text-[#44474E] ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, valueClass = 'text-[#1A1B1E]' }) => (
  <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC]">
    <div className="text-[#74777F] text-sm mb-2 flex items-center gap-2"><Icon size={18} /> {label}</div>
    <div className={`text-4xl font-normal ${valueClass}`}>{value}</div>
  </div>
);

const EmptyChart = ({ label }) => (
  <div className="h-full flex items-center justify-center text-sm text-[#74777F] text-center px-6">{label}</div>
);

export default DashboardOverviewTab;
