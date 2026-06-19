// Tab Tamu Aktif: tabel tamu CHECKED_IN + tombol Check-out (UIUX 5.8).
import Button from '../../components/Button';
import RemotePhoto from '../../components/RemotePhoto';

const ActiveVisitsTab = ({ visits, onCheckout }) => (
  <div className="bg-[#FDFBFF] rounded-[28px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 border border-[#EAE7EC]">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F4F2F6] text-[#44474E] text-sm border-b border-[#EAE7EC]">
            <th className="p-5 font-medium pl-6">Visitor</th>
            <th className="p-5 font-medium hidden sm:table-cell">Nomor Kartu</th>
            <th className="p-5 font-medium hidden md:table-cell">Tujuan</th>
            <th className="p-5 font-medium hidden lg:table-cell">Waktu Masuk</th>
            <th className="p-5 font-medium text-right pr-6">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((v) => (
            <tr key={v.id} className="border-b border-[#EAE7EC] hover:bg-[#F4F2F6]/50 transition-colors">
              <td className="p-5 pl-6">
                <div className="flex items-center gap-4">
                  {v.selfiePhoto && (
                    <RemotePhoto refId={v.selfiePhoto} alt="Selfie" className="w-12 h-12 rounded-full object-cover shadow-sm hidden lg:block border border-[#EAE7EC]" />
                  )}
                  <div>
                    <div className="font-medium text-[#1A1B1E] text-base">{v.name}</div>
                    <div className="text-xs text-[#74777F]">{v.asal}</div>
                  </div>
                </div>
              </td>
              <td className="p-5 hidden sm:table-cell">
                <span className="inline-block bg-[#D5E3FF] text-[#001B3E] font-bold px-3 py-1.5 rounded-[8px] text-sm">{v.cardNumber}</span>
              </td>
              <td className="p-5 hidden md:table-cell text-sm text-[#44474E]">{v.tujuan}</td>
              <td className="p-5 hidden lg:table-cell text-sm text-[#44474E]">{v.time}</td>
              <td className="p-5 text-right pr-6">
                <Button variant="outlined" className="text-sm" onClick={() => onCheckout(v)}>
                  Check-out
                </Button>
              </td>
            </tr>
          ))}
          {visits.length === 0 && (
            <tr>
              <td colSpan="5" className="p-10 text-center text-[#74777F]">Tidak ada tamu aktif saat ini.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default ActiveVisitsTab;
