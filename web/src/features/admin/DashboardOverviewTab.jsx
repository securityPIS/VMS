// Tab Dashboard Analitik admin: kartu metrik + grafik tren & distribusi (UIUX 5.12).
// Angka & data grafik masih mock; ganti dengan api.getDashboardStats saat integrasi.
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import { CHART_WEEKLY, CHART_DEPT, PIE_COLORS } from '../../lib/mockData';

const tooltipStyle = { borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' };

const DashboardOverviewTab = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC]">
        <div className="text-[#74777F] text-sm mb-2 flex items-center gap-2"><Users size={18} /> Total Tamu (Bulan Ini)</div>
        <div className="text-4xl font-normal text-[#1A1B1E]">1,284</div>
        <div className="text-sm text-[#ADC52D] mt-3 font-medium flex items-center gap-1">+12% dari bulan lalu</div>
      </div>
      <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC]">
        <div className="text-[#74777F] text-sm mb-2 flex items-center gap-2"><CheckCircle size={18} /> Tamu Selesai Hari Ini</div>
        <div className="text-4xl font-normal text-[#1A1B1E]">45</div>
      </div>
      <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC]">
        <div className="text-[#74777F] text-sm mb-2 flex items-center gap-2"><AlertCircle size={18} /> Kunjungan Ditolak</div>
        <div className="text-4xl font-normal text-[#BA313B]">3</div>
        <div className="text-sm text-[#74777F] mt-3">Rata-rata alasan: Data tidak lengkap</div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC] h-[420px] flex flex-col">
        <h3 className="text-lg font-medium text-[#1A1B1E] mb-6">Tren Kunjungan Mingguan</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_WEEKLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE7EC" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#74777F', fontSize: 13 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#74777F', fontSize: 13 }} />
              <RechartsTooltip cursor={{ fill: '#F4F2F6' }} contentStyle={tooltipStyle} />
              <Bar dataKey="kunjungan" fill="#3C6DB2" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC] h-[420px] flex flex-col">
        <h3 className="text-lg font-medium text-[#1A1B1E] mb-6">Distribusi Tujuan Kunjungan</h3>
        <div className="flex-1 min-h-0 relative flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={CHART_DEPT} cx="50%" cy="50%" innerRadius={90} outerRadius={125} paddingAngle={2} dataKey="value" stroke="none">
                {CHART_DEPT.map((entry, index) => (
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
        </div>
      </div>
    </div>
  </div>
);

export default DashboardOverviewTab;
