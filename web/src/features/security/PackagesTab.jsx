// Tab Paket & Kiriman: tabel paket + registrasi + tandai diambil (PRD 3.5, UIUX 5.10).
import { Plus, Package } from 'lucide-react';
import Button from '../../components/Button';

const PackagesTab = ({ packages, onAdd, onPickup }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC]">
      <div>
        <h2 className="text-xl font-normal text-[#1A1B1E]">Daftar Paket</h2>
        <p className="text-sm text-[#44474E] mt-1">Registrasi barang titipan kurir / ekspedisi.</p>
      </div>
      <Button variant="filled" onClick={onAdd}>
        <Plus size={18} /> Registrasi Paket
      </Button>
    </div>

    <div className="bg-[#FDFBFF] rounded-[28px] shadow-sm border border-[#EAE7EC] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F2F6] text-[#44474E] text-sm border-b border-[#EAE7EC]">
              <th className="p-5 font-medium pl-6">Detail Paket</th>
              <th className="p-5 font-medium hidden md:table-cell">Untuk (Penerima)</th>
              <th className="p-5 font-medium hidden md:table-cell">Waktu Masuk</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id} className="border-b border-[#EAE7EC] hover:bg-[#F4F2F6]/50 transition-colors">
                <td className="p-5 pl-6">
                  <div className="flex items-center gap-4">
                    {p.photo ? (
                      <img src={p.photo} alt="Paket" className="w-12 h-12 rounded-[12px] object-cover shadow-sm hidden sm:block" />
                    ) : (
                      <div className="w-12 h-12 rounded-[12px] bg-[#F4F2F6] border border-[#EAE7EC] flex items-center justify-center text-[#74777F] hidden sm:flex">
                        <Package size={20} />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-[#1A1B1E] text-base">{p.sender}</div>
                      <div className="text-xs text-[#74777F] mt-0.5">{p.type} • {p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5 hidden md:table-cell text-sm text-[#1A1B1E] font-medium">{p.recipient}</td>
                <td className="p-5 hidden md:table-cell text-sm text-[#44474E]">{p.date} {p.time}</td>
                <td className="p-5">
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${p.status === 'RECEIVED' ? 'bg-[#FFEFD6] text-[#5E4200]' : 'bg-[#E6F893] text-[#192100]'}`}>
                    {p.status === 'RECEIVED' ? 'Di Pos Security' : 'Sudah Diambil'}
                  </span>
                </td>
                <td className="p-5 text-right pr-6">
                  {p.status === 'RECEIVED' ? (
                    <Button variant="success" className="text-xs" onClick={() => onPickup(p.id)}>
                      Tandai Diambil
                    </Button>
                  ) : (
                    <span className="text-xs font-medium text-[#74777F] px-4">Selesai</span>
                  )}
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-[#74777F]">Belum ada paket yang diregistrasi hari ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default PackagesTab;
