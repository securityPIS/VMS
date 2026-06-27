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
  PENDING: { color: 'bg-[#FFEFD6] text-[#5E4200]', icon: Clock, label: 'Menunggu' },
  CHECKED_IN: { color: 'bg-[#E6F893] text-[#192100]', icon: LogIn, label: 'Check In' },
  CHECKED_OUT: { color: 'bg-[#EFEDF1] text-[#44474E]', icon: LogOut, label: 'Check Out' },
  REJECTED: { color: 'bg-[#FFDAD6] text-[#410002]', icon: X, label: 'Reject' },
};

// Konfigurasi badge status paket (UIUX Section 4).
export const PACKAGE_STATUS = {
  RECEIVED: { color: 'bg-[#FFEFD6] text-[#5E4200]', icon: Package, label: 'Di Pos Security' },
  PICKED_UP: { color: 'bg-[#E6F893] text-[#192100]', icon: CheckCircle, label: 'Sudah Diambil' },
};

// Format tanggal/jam operasional Indonesia.
export const dateID = (date = new Date()) =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export const timeID = (date = new Date()) =>
  date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });

export const dateTimeID = (value = new Date()) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${dateID(d)} ${timeID(d)}`;
};

export const joinDateTime = (date, time) => [date, time].filter(Boolean).join(' ');

// Hanya digit dari nomor telepon (untuk validasi & penyimpanan).
export const phoneDigits = (value) => String(value || '').replace(/\D/g, '').slice(0, 16);

// Format nomor telepon otomatis menjadi grup 4 digit: xxxx-xxxx-xxxx.
export const formatPhoneID = (value) => {
  const digits = phoneDigits(value);
  return digits.replace(/(\d{4})(?=\d)/g, '$1-');
};

export const visitScheduleStatus = (visit) =>
  String(visit?.scheduleType || 'NOW').toUpperCase() === 'SCHEDULE' ? 'SCHEDULE' : 'NOW';

export const visitCreatedDateTime = (visit) =>
  visit?.createdAt ? dateTimeID(visit.createdAt) : joinDateTime(visit?.date, visit?.time);

export const visitScheduleDateTime = (visit) => {
  if (visitScheduleStatus(visit) !== 'SCHEDULE') return visitCreatedDateTime(visit);
  if (visit?.scheduledAt) return dateTimeID(visit.scheduledAt);
  return joinDateTime(visit?.scheduledDate, '00:00');
};

export const visitCheckInDateTime = (visit) =>
  visit?.checkinAt ? dateTimeID(visit.checkinAt) : joinDateTime(visit?.checkinDate || visit?.date, visit?.checkinTime || visit?.time);

export const sortVisitsNewest = (visits = []) => [...visits].sort((a, b) => {
  const av = Date.parse(a.createdAt || `${a.date || ''}T${a.time || '00:00'}`) || 0;
  const bv = Date.parse(b.createdAt || `${b.date || ''}T${b.time || '00:00'}`) || 0;
  return bv - av;
});
