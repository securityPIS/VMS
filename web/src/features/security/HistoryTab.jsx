// Tab LOG: tabel seluruh kunjungan dengan badge status (UIUX 5.9 ringkas).
import Badge from '../../components/Badge';
import { sortVisitsNewest, visitCreatedDateTime } from '../../lib/constants';

const HistoryTab = ({ visits, showLocation = false }) => {
  const sorted = sortVisitsNewest(visits);

  return (
    <div className="bg-[#FDFBFF] rounded-[28px] shadow-sm border border-[#EAE7EC] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F2F6] text-[#44474E] text-sm border-b border-[#EAE7EC]">
              <th className="p-5 font-medium pl-6">Visitor</th>
              <th className="p-5 font-medium hidden md:table-cell">Waktu</th>
              {showLocation && <th className="p-5 font-medium hidden lg:table-cell">Lokasi</th>}
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium hidden sm:table-cell">Detail</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => (
              <tr key={v.id} className="border-b border-[#EAE7EC] hover:bg-[#F4F2F6]/50 transition-colors">
                <td className="p-5 pl-6">
                  <div className="font-medium text-[#1A1B1E] text-base">{v.name}</div>
                  <div className="text-xs text-[#74777F] mt-0.5">{visitCreatedDateTime(v)}</div>
                </td>
                <td className="p-5 hidden md:table-cell text-sm text-[#44474E]">
                  {visitCreatedDateTime(v)} {v.timeOut ? `- ${v.timeOut}` : ''}
                </td>
                {showLocation && <td className="p-5 hidden lg:table-cell text-sm text-[#44474E]">{v.location || '-'}</td>}
                <td className="p-5">
                  <Badge status={v.status} />
                </td>
                <td className="p-5 hidden sm:table-cell text-sm text-[#44474E]">
                  {v.status === 'REJECTED' ? v.rejectReason : `Bertemu: ${v.tujuan}`}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={showLocation ? 5 : 4} className="p-10 text-center text-[#74777F]">LOG kunjungan masih kosong.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTab;
