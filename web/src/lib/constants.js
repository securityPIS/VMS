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

// --- LOG (riwayat) helpers --------------------------------------------------

// Tanggal panjang berbahasa Indonesia: '2026-06-19' → '19 Juni 2026'.
export const formatDateLong = (dateStr) => {
  if (!dateStr) return 'Tanpa Tanggal';
  const [y, mo, da] = String(dateStr).split('-').map(Number);
  if (!y || !mo || !da) return String(dateStr);
  return new Date(y, mo - 1, da).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

// Normalisasi jam ke format Indonesia 'HH.mm' (terima 'HH:mm' atau 'HH.mm').
export const formatClock = (value) => {
  const m = String(value || '').match(/(\d{1,2})[.:](\d{2})/);
  return m ? `${m[1].padStart(2, '0')}.${m[2]}` : '';
};

// 'HH:mm'/'HH.mm' → menit sejak tengah malam (atau null bila tak valid).
const parseClockMinutes = (value) => {
  const m = String(value || '').match(/(\d{1,2})[.:](\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

// Durasi menit → ringkas '2j 15m' / '2j' / '45m'.
const formatDuration = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}j ${m}m`;
  if (h) return `${h}j`;
  return `${m}m`;
};

// Rentang waktu kunjungan: 'HH.mm - HH.mm' bila sudah checkout, atau 'HH.mm'
// (jam kedatangan saja) bila belum.
export const visitTimeRange = (visit) => {
  const start = formatClock(visit?.time);
  if (!start) return '';
  const end = formatClock(visit?.timeOut);
  return end ? `${start} - ${end}` : start;
};

// Durasi kunjungan (kedatangan → checkout). Pakai timestamp penuh bila ada agar
// akurat lintas tengah malam, jika tidak hitung dari jam tampilan. '' bila belum
// checkout.
export const visitDuration = (visit) => {
  if (!visit) return '';
  let mins = null;
  if (visit.createdAt && visit.checkoutAt) {
    const a = Date.parse(visit.createdAt);
    const b = Date.parse(visit.checkoutAt);
    if (!Number.isNaN(a) && !Number.isNaN(b)) mins = Math.round((b - a) / 60000);
  }
  if (mins == null) {
    const a = parseClockMinutes(visit.time);
    const b = parseClockMinutes(visit.timeOut);
    if (a == null || b == null) return '';
    mins = b - a;
    if (mins < 0) mins += 1440; // lintas tengah malam
  }
  return mins < 0 ? '' : formatDuration(mins);
};

// Kelompokkan kunjungan per tanggal (terbaru dulu) untuk tampilan LOG.
// → [{ key: 'YYYY-MM-DD', label: '19 Juni 2026', visits: [...] }]
export const groupVisitsByDate = (visits = []) => {
  const groups = [];
  const index = new Map();
  for (const v of sortVisitsNewest(visits)) {
    const key = v.date || (v.createdAt ? dateID(new Date(v.createdAt)) : '');
    if (!index.has(key)) {
      const group = { key, label: formatDateLong(key), visits: [] };
      index.set(key, group);
      groups.push(group);
    }
    index.get(key).visits.push(v);
  }
  return groups;
};
