// Tab Antrean: kartu tamu PENDING + tombol Izinkan Masuk / Tolak (UIUX 5.5).
import { CheckCircle, X } from 'lucide-react';
import Button from '../../components/Button';
import RemotePhoto from '../../components/RemotePhoto';
import { visitScheduleDateTime, visitScheduleStatus } from '../../lib/constants';

const QueueTab = ({ visits, onCheckIn, onReject }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
    {visits.map((v) => (
      <div key={v.id} className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-xl text-[#1A1B1E]">{v.name}</h3>
            <p className="text-sm text-[#74777F]">{v.asal}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            visitScheduleStatus(v) === 'SCHEDULE' ? 'bg-[#D5E3FF] text-[#001B3E]' : 'bg-[#E6F893] text-[#192100]'
          }`}>
            {visitScheduleStatus(v)}
          </span>
        </div>

        <div className="flex gap-3 mb-5">
          {v.ktpPhoto && (
            <RemotePhoto refId={v.ktpPhoto} alt="KTP" openInNewTab className="w-24 h-16 object-cover rounded-[12px] border border-[#EAE7EC] cursor-pointer hover:opacity-80" />
          )}
          {v.selfiePhoto && (
            <RemotePhoto refId={v.selfiePhoto} alt="Selfie" openInNewTab className="w-16 h-16 object-cover rounded-[12px] border border-[#EAE7EC] cursor-pointer hover:opacity-80" />
          )}
        </div>

        <div className="bg-[#F4F2F6] p-4 rounded-[16px] mb-6">
          <div className="text-xs text-[#74777F] mb-1">Keperluan &amp; Tujuan</div>
          <div className="text-sm font-medium text-[#1A1B1E]">{v.keperluan}</div>
          <div className="text-sm text-[#3C6DB2] mt-1 font-medium">Bertemu: {v.tujuan}</div>
          <div className="text-xs text-[#44474E] mt-3">Waktu Kunjungan: <span className="font-medium text-[#1A1B1E]">{visitScheduleDateTime(v)}</span></div>
        </div>

        <div className="flex gap-2">
          <Button variant="success" className="flex-1" onClick={() => onCheckIn(v)}>
            <CheckCircle size={18} /> Izinkan Masuk
          </Button>
          <Button variant="danger" className="px-5" onClick={() => onReject(v)}>
            <X size={18} /> Tolak
          </Button>
        </div>
      </div>
    ))}

    {visits.length === 0 && (
      <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#74777F] bg-[#FDFBFF] rounded-[28px] shadow-sm border border-[#EAE7EC] border-dashed">
        <CheckCircle size={48} className="text-[#D5E3FF] mb-4" />
        <p className="text-lg">Tidak ada tamu dalam antrean saat ini.</p>
      </div>
    )}
  </div>
);

export default QueueTab;
