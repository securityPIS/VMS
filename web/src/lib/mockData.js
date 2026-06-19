// Data dummy untuk MODE MOCK (dev). Akan digantikan data dari Apps Script
// saat backend disambungkan (lihat lib/api.js). JANGAN dipakai di produksi.

export const MOCK_SECURITY_OFFICERS = [
  { id: 'SEC-01', name: 'Budi Santoso', email: 'budi.s@security.com', location: 'Gate Utama', status: 'Active' },
  { id: 'SEC-02', name: 'Agus Pratama', email: 'agus.p@security.com', location: 'Lobi Resepsionis', status: 'Active' },
  { id: 'SEC-03', name: 'Hendra Wijaya', email: 'hendra.w@security.com', location: 'Gate Logistik', status: 'Inactive' },
];

export const MOCK_PACKAGES = [
  { id: 'PKG-101', sender: 'JNE Express', recipient: 'Bpk. Andi (IT Dept)', type: 'Kardus Sedang/Besar', time: '09:15', date: '2026-06-19', status: 'RECEIVED', photo: 'https://images.unsplash.com/photo-1620062483863-12502660a920?w=150&h=150&fit=crop' },
  { id: 'PKG-102', sender: 'Gojek (Food)', recipient: 'Ibu Rina (HRD)', type: 'Makanan / Minuman', time: '11:30', date: '2026-06-19', status: 'PICKED_UP', photo: null },
];

export const MOCK_VISITS = [
  { id: 'V-101', name: 'Ahmad Faisal', asal: 'PT Teknologi Jaya', keperluan: 'Meeting Vendor IT', tujuan: 'Bpk. Andi', time: '08:30', date: '2026-06-19', status: 'CHECKED_OUT', timeOut: '10:45', cardNumber: 'V-012', selfiePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', location: 'Lobi Resepsionis' },
  { id: 'V-102', name: 'Sarah Nabila', asal: 'Kandidat Karyawan', keperluan: 'Interview HRD', tujuan: 'Ibu Rina', time: '09:00', date: '2026-06-19', status: 'CHECKED_IN', cardNumber: 'V-045', selfiePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', location: 'Gate Utama' },
  { id: 'V-103', name: 'Budi Hartono', asal: 'Kurir Spesial', keperluan: 'Kirim Dokumen Rahasia', tujuan: 'Direksi', time: '09:15', date: '2026-06-19', status: 'PENDING', ktpPhoto: 'https://images.unsplash.com/photo-1621974737299-4c2f6d2e6123?w=150&h=100&fit=crop', selfiePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', location: 'Lobi Resepsionis' },
  { id: 'V-104', name: 'Ahmad Faisal', asal: 'PT Teknologi Jaya', keperluan: 'Presentasi Produk', tujuan: 'Bpk. Andi', time: '13:00', date: '2026-06-15', status: 'CHECKED_OUT', timeOut: '15:30', cardNumber: 'V-018', selfiePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', location: 'Gate Utama' },
  { id: 'V-105', name: 'Diana Putri', asal: 'Freelance Designer', keperluan: 'Diskusi Project', tujuan: 'Tim Marketing', time: '10:00', date: '2026-06-19', status: 'REJECTED', rejectReason: 'Tujuan sedang tidak ada di tempat', location: 'Lobi Resepsionis' },
];

// Data grafik dashboard admin (mock). Nanti dari `getDashboardStats`.
export const CHART_WEEKLY = [
  { name: 'Sen', kunjungan: 12 }, { name: 'Sel', kunjungan: 19 },
  { name: 'Rab', kunjungan: 15 }, { name: 'Kam', kunjungan: 22 },
  { name: 'Jum', kunjungan: 28 }, { name: 'Sab', kunjungan: 5 }, { name: 'Min', kunjungan: 2 },
];

export const CHART_DEPT = [
  { name: 'IT Dept', value: 35 }, { name: 'HRD', value: 25 },
  { name: 'Operasional', value: 20 }, { name: 'Manajemen', value: 10 }, { name: 'Lainnya', value: 10 },
];

export const PIE_COLORS = ['#3C6DB2', '#ADC52D', '#BA313B', '#1A1B1E', '#74777F'];

// --- Direktori peran (mock) -------------------------------------------------
// Mencerminkan logika backend `getRole(email)`: sistem menentukan peran HANYA
// dari email yang login lewat Google. Sumber kebenaran di produksi adalah sheet
// Users/Officers (email petugas di-assign oleh admin) & Visitors (riwayat).

// Email admin (di produksi: baris role=admin pada sheet Users).
export const MOCK_ADMINS = [
  { email: 'admin@pertamina.com', name: 'Admin IT' },
];

// Email yang pernah berkunjung → diperlakukan sebagai "tamu lama" (data terisi).
export const MOCK_RETURNING_VISITORS = [
  { email: 'sarah@gmail.com', name: 'Sarah Nabila', asal: 'PT Teknologi Jaya' },
];

// Pintasan untuk MODE DEMO (USE_MOCK) — uji tiap peran tanpa OAuth asli.
export const DEV_LOGIN_PRESETS = [
  { label: 'Tamu Baru', email: 'tamu.baru@gmail.com' },
  { label: 'Tamu Lama', email: 'sarah@gmail.com' },
  { label: 'Petugas · Gate Utama', email: 'budi.s@security.com' },
  { label: 'Admin', email: 'admin@pertamina.com' },
];

// Tebak nama dari bagian lokal email untuk tamu baru (mis. "john.doe" → "John Doe").
function nameFromEmail(email) {
  const local = (email.split('@')[0] || 'Tamu').replace(/[._-]+/g, ' ').trim();
  return local.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Tamu';
}

// Resolusi peran dari email (versi mock dari endpoint backend `getRole`).
// Urutan: admin → petugas aktif → tamu lama → tamu baru.
export function resolveRoleFromEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) throw new Error('Email Google tidak terbaca.');

  const admin = MOCK_ADMINS.find((a) => a.email.toLowerCase() === e);
  if (admin) return { role: 'admin', name: admin.name, email: e };

  // Hanya petugas berstatus Active yang boleh masuk sebagai security.
  // (Backend: petugas nonaktif sebaiknya ditolak eksplisit, bukan jadi tamu.)
  const officer = MOCK_SECURITY_OFFICERS.find(
    (o) => o.email.toLowerCase() === e && o.status === 'Active',
  );
  if (officer) return { role: 'security', name: officer.name, email: e, location: officer.location };

  const ret = MOCK_RETURNING_VISITORS.find((v) => v.email.toLowerCase() === e);
  if (ret) return { role: 'visitor', type: 'returning', name: ret.name, asal: ret.asal, email: e };

  return { role: 'visitor', type: 'new', name: nameFromEmail(e), email: e };
}
