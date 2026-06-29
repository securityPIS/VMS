// Layar status kunjungan untuk tamu (PRD 5.4 / UIUX 5.4).
// Auto-refresh: polling api.getVisitStatus tiap 5 detik selama status belum final
// (PENDING/CHECKED_IN) agar tamu tak perlu reload.
import { useEffect, useState } from 'react';
import { Clock, CheckCircle, X, LogOut } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Button from '../components/Button';
import ScreenBackdrop from '../components/ScreenBackdrop';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-ink-gradient">
      <ScreenBackdrop />

      <div className="relative w-full max-w-md surface-raised rounded-[28px] p-8 md:p-10 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
        <BrandLogo className="h-8 mb-8" />

        {status === 'PENDING' && (
          <>
            <div className="w-20 h-20 bg-[#FFEFD6] text-[#5E4200] rounded-full flex items-center justify-center mb-6 ring-8 ring-[#FFEFD6]/40 animate-pulse-soft">
              <Clock size={38} />
            </div>
            <p className="eyebrow mb-2">Status Kunjungan</p>
            <h2 className="text-display text-2xl mb-3">Menunggu</h2>
            <p className="text-ink-muted text-sm mb-6 leading-relaxed">
              Mohon tunggu sebentar di lobi. Petugas keamanan sedang memverifikasi data dan tujuan Anda (
              <strong>{statusData.tujuan}</strong>).
            </p>
          </>
        )}

        {status === 'CHECKED_IN' && (
          <>
            <div className="w-20 h-20 bg-[#E6F893] text-[#192100] rounded-full flex items-center justify-center mb-6 ring-8 ring-[#E6F893]/40">
              <CheckCircle size={38} />
            </div>
            <p className="eyebrow mb-2">Status Kunjungan</p>
            <h2 className="text-display text-2xl mb-3">Check In</h2>
            <p className="text-ink-muted text-sm mb-6 leading-relaxed">
              Silakan masuk. Jangan lupa mengenakan kartu visitor Anda selama berada di dalam area.
            </p>
          </>
        )}

        {status === 'CHECKED_OUT' && (
          <>
            <div className="w-20 h-20 bg-[#EFEDF1] text-[#44474E] rounded-full flex items-center justify-center mb-6 ring-8 ring-[#EFEDF1]/50">
              <LogOut size={38} />
            </div>
            <p className="eyebrow mb-2">Status Kunjungan</p>
            <h2 className="text-display text-2xl mb-3">Check Out</h2>
            <p className="text-ink-muted text-sm mb-6 leading-relaxed">
              Terima kasih atas kunjungan Anda. Pastikan kartu visitor telah dikembalikan ke petugas.
            </p>
          </>
        )}

        {status === 'REJECTED' && (
          <>
            <div className="w-20 h-20 bg-[#FFDAD6] text-[#410002] rounded-full flex items-center justify-center mb-6 ring-8 ring-[#FFDAD6]/40">
              <X size={38} />
            </div>
            <p className="eyebrow mb-2">Status Kunjungan</p>
            <h2 className="text-display text-2xl mb-3">Ditolak</h2>
            <div className="bg-[#FFDAD6]/30 border border-[#FFDAD6] p-4 rounded-2xl text-sm text-[#410002] mb-6 w-full text-left">
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
