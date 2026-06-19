// Konstanta & konfigurasi status terpusat (dipakai lintas komponen).
import { Clock, LogIn, LogOut, X, Package, CheckCircle } from 'lucide-react';

// Master lokasi/gate (PRD 5.7). Nanti diambil dari backend `getLocations`.
export const LOCATIONS = [
  'Gate Utama',
  'Lobi Resepsionis',
  'Gate Logistik',
  'Basement Parking',
];

// Jenis barang pada registrasi paket (PRD 5.8).
export const PACKAGE_TYPES = [
  'Dokumen',
  'Kardus Sedang/Besar',
  'Makanan / Minuman',
  'Lainnya',
];

// Konfigurasi badge status kunjungan (UIUX Section 4).
export const VISIT_STATUS = {
  PENDING: { color: 'bg-[#FFEFD6] text-[#5E4200]', icon: Clock, label: 'Menunggu Verifikasi' },
  CHECKED_IN: { color: 'bg-[#E6F893] text-[#192100]', icon: LogIn, label: 'Sedang Berkunjung' },
  CHECKED_OUT: { color: 'bg-[#EFEDF1] text-[#44474E]', icon: LogOut, label: 'Selesai' },
  REJECTED: { color: 'bg-[#FFDAD6] text-[#410002]', icon: X, label: 'Ditolak' },
};

// Konfigurasi badge status paket (UIUX Section 4).
export const PACKAGE_STATUS = {
  RECEIVED: { color: 'bg-[#FFEFD6] text-[#5E4200]', icon: Package, label: 'Di Pos Security' },
  PICKED_UP: { color: 'bg-[#E6F893] text-[#192100]', icon: CheckCircle, label: 'Sudah Diambil' },
};

// Format jam Indonesia (HH:mm).
export const timeID = (date = new Date()) =>
  date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
