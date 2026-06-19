// Layar status kunjungan untuk tamu (PRD 5.4 / UIUX 5.4).
// Auto-refresh: polling api.getVisitStatus tiap 5 detik selama status belum final
// (PENDING/CHECKED_IN) agar tamu tak perlu reload.
import { useEffect, useState } from 'react';
import { Clock, CheckCircle, X, LogOut } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Button from '../components/Button';
import { api } from '../lib/api';

const FINAL = ['REJECTED', 'CHECKED_OUT'];

const VisitorStatusScreen = ({ statusData, onLogout }) => {
  const [status, setStatus] = useState(statusData.status || 'PENDING');
  const [rejectReason, setRejectReason] = useState(statusData.rejectReason || '');

  useEffect(() => {
    if (!statusData.visitId || FINAL.includes(status)) return undefined;
    const tick = async () => {
      try {
        const r = await api.getVisitStatus(statusData.visitId);
        if (r.status) setStatus(r.status);
        if (r.reject_reason) setRejectReason(r.reject_reason);
      } catch { /* abaikan error sementara, coba lagi tick berikutnya */ }
    };
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [statusData.visitId, status]);

  return (
    <div className="min-h-screen bg-[#F4F2F6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FDFBFF] rounded-[28px] shadow-sm p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
        <BrandLogo className="h-8 mb-8" />

        {status === 'PENDING' && (
          <>
            <div className="w-24 h-24 bg-[#FFEFD6] text-[#5E4200] rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Clock size={48} />
            </div>
            <h2 className="text-2xl font-normal text-[#1A1B1E] mb-2">Menunggu Verifikasi</h2>
            <p className="text-[#44474E] text-sm mb-6">
              Mohon tunggu sebentar di lobi. Petugas keamanan sedang memverifikasi data dan tujuan Anda (
              <strong>{statusData.tujuan}</strong>).
            </p>
          </>
        )}

        {status === 'CHECKED_IN' && (
          <>
            <div className="w-24 h-24 bg-[#E6F893] text-[#192100] rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-normal text-[#1A1B1E] mb-2">Kunjungan Disetujui</h2>
            <p className="text-[#44474E] text-sm mb-6">
              Silakan masuk. Jangan lupa mengenakan kartu visitor Anda selama berada di dalam area.
            </p>
          </>
        )}

        {status === 'CHECKED_OUT' && (
          <>
            <div className="w-24 h-24 bg-[#EFEDF1] text-[#44474E] rounded-full flex items-center justify-center mb-6">
              <LogOut size={48} />
            </div>
            <h2 className="text-2xl font-normal text-[#1A1B1E] mb-2">Kunjungan Selesai</h2>
            <p className="text-[#44474E] text-sm mb-6">
              Terima kasih atas kunjungan Anda. Pastikan kartu visitor telah dikembalikan ke petugas.
            </p>
          </>
        )}

        {status === 'REJECTED' && (
          <>
            <div className="w-24 h-24 bg-[#FFDAD6] text-[#410002] rounded-full flex items-center justify-center mb-6">
              <X size={48} />
            </div>
            <h2 className="text-2xl font-normal text-[#1A1B1E] mb-2">Kunjungan Ditolak</h2>
            <div className="bg-[#FFDAD6]/30 border border-[#FFDAD6] p-4 rounded-[16px] text-sm text-[#410002] mb-6 w-full text-left">
              <strong>Alasan:</strong> {rejectReason || 'Tujuan tidak dapat ditemui.'}
            </div>
          </>
        )}

        <Button variant="text" onClick={onLogout} className="mt-4">
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
};

export default VisitorStatusScreen;
