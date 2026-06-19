// Layar status kunjungan untuk tamu (PRD 5.4 / UIUX 5.4).
// TODO integrasi: auto-refresh/polling status agar tamu tak perlu reload.
import { Clock, CheckCircle, X } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Button from '../components/Button';

const VisitorStatusScreen = ({ statusData, onLogout }) => (
  <div className="min-h-screen bg-[#F4F2F6] flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-md bg-[#FDFBFF] rounded-[28px] shadow-sm p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
      <BrandLogo className="h-8 mb-8" />

      {statusData.status === 'PENDING' && (
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

      {statusData.status === 'CHECKED_IN' && (
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

      {statusData.status === 'REJECTED' && (
        <>
          <div className="w-24 h-24 bg-[#FFDAD6] text-[#410002] rounded-full flex items-center justify-center mb-6">
            <X size={48} />
          </div>
          <h2 className="text-2xl font-normal text-[#1A1B1E] mb-2">Kunjungan Ditolak</h2>
          <div className="bg-[#FFDAD6]/30 border border-[#FFDAD6] p-4 rounded-[16px] text-sm text-[#410002] mb-6 w-full text-left">
            <strong>Alasan:</strong> {statusData.rejectReason || 'Tujuan tidak dapat ditemui.'}
          </div>
        </>
      )}

      <Button variant="text" onClick={onLogout} className="mt-4">
        Kembali ke Beranda
      </Button>
    </div>
  </div>
);

export default VisitorStatusScreen;
