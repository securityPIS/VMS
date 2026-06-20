// Tab Tamu Aktif: daftar tamu CHECKED_IN + tombol Check Out (UIUX 5.8).
import { useState } from 'react';
import Button from '../../components/Button';
import ModalBase from '../../components/ModalBase';
import RemotePhoto from '../../components/RemotePhoto';
import { visitCheckInDateTime } from '../../lib/constants';

const DetailLine = ({ label, value }) => (
  <div>
    <div className="text-xs font-medium text-[#74777F]">{label}</div>
    <div className="text-sm text-[#1A1B1E] mt-0.5">{value || '-'}</div>
  </div>
);

const ActiveVisitsTab = ({ visits, onCheckout }) => {
  const [detail, setDetail] = useState(null);

  const openWithKeyboard = (event, visit) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setDetail(visit);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {visits.length === 0 ? (
        <div className="p-10 text-center text-[#74777F] bg-[#FDFBFF] rounded-[28px] shadow-sm border border-[#EAE7EC]">
          Tidak ada tamu aktif saat ini.
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {visits.map((v) => (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetail(v)}
                onKeyDown={(event) => openWithKeyboard(event, v)}
                className="bg-[#FDFBFF] rounded-[20px] border border-[#EAE7EC] p-4 shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[#1A1B1E] truncate">{v.name}</div>
                    <div className="text-xs text-[#74777F] mt-0.5 truncate">{v.asal}</div>
                    <div className="text-xs text-[#3C6DB2] mt-2 font-medium truncate">Bertemu: {v.tujuan}</div>
                  </div>
                  <span className="shrink-0 bg-[#D5E3FF] text-[#001B3E] font-bold px-3 py-1 rounded-[8px] text-xs">
                    {v.cardNumber || '-'}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="text-xs text-[#44474E]">
                    <div className="text-[#74777F]">Waktu Masuk</div>
                    <div className="font-medium text-[#1A1B1E]">{visitCheckInDateTime(v)}</div>
                  </div>
                  <Button
                    variant="outlined"
                    className="text-xs px-3 py-2"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCheckout(v);
                    }}
                  >
                    Check Out
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-[#FDFBFF] rounded-[28px] shadow-sm overflow-hidden border border-[#EAE7EC]">
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
                      <td className="p-5 hidden lg:table-cell text-sm text-[#44474E]">{visitCheckInDateTime(v)}</td>
                      <td className="p-5 text-right pr-6">
                        <Button variant="outlined" className="text-sm" onClick={() => onCheckout(v)}>
                          Check Out
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ModalBase
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Tamu Aktif"
        footer={<Button variant="text" onClick={() => setDetail(null)}>Tutup</Button>}
      >
        <div className="space-y-4 pt-1">
          {detail?.selfiePhoto && (
            <RemotePhoto refId={detail.selfiePhoto} alt="Selfie" className="w-20 h-20 rounded-full object-cover border border-[#EAE7EC]" />
          )}
          <div className="grid grid-cols-2 gap-4">
            <DetailLine label="Nama" value={detail?.name} />
            <DetailLine label="Asal" value={detail?.asal} />
            <DetailLine label="Nomor Kartu" value={detail?.cardNumber} />
            <DetailLine label="Waktu Masuk" value={detail ? visitCheckInDateTime(detail) : ''} />
            <DetailLine label="Tujuan" value={detail?.tujuan} />
            <DetailLine label="Keperluan" value={detail?.keperluan} />
          </div>
        </div>
      </ModalBase>
    </div>
  );
};

export default ActiveVisitsTab;
