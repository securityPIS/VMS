// Lapisan integrasi ke Google Apps Script Web App.
//
// STATUS SAAT INI: scaffold. Komponen masih memakai data mock lokal (mockData.js)
// agar UI bisa dijalankan tanpa backend. Saat backend siap (Fase C), arahkan
// komponen untuk memanggil method `api.*` di bawah dan isi VITE_APPS_SCRIPT_URL.
//
// Catatan CORS: Apps Script Web App lebih mulus bila body dikirim sebagai
// text/plain (menghindari preflight). Backend membaca e.postData.contents.

import { resolveRoleFromEmail } from './mockData';

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';
const API_SECRET = import.meta.env.VITE_API_SECRET || '';

export const USE_MOCK = !API_URL;

async function post(action, payload = {}) {
  if (USE_MOCK) {
    // eslint-disable-next-line no-console
    console.warn(`[api] MODE MOCK — '${action}' tidak benar-benar memanggil backend.`, payload);
    throw new Error(`Backend belum dikonfigurasi (VITE_APPS_SCRIPT_URL kosong). Aksi: ${action}`);
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, secret: API_SECRET, ...payload }),
  });
  if (!res.ok) throw new Error(`API ${action} gagal: HTTP ${res.status}`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

// Peta method ↔ endpoint PRD Section 9. Dipakai saat wiring backend.
export const api = {
  // Visitor
  getVisitorByEmail: (email) => post('getVisitorByEmail', { email }),
  uploadPhoto: (base64, type, email) => post('uploadPhoto', { base64, type, email }),
  submitVisit: (data) => post('submitVisit', data),
  // Peran ditentukan sistem dari email. Di MODE MOCK diselesaikan lokal agar
  // login bisa diuji tanpa backend; di produksi memanggil endpoint getRole.
  getRole: (email) => (USE_MOCK ? Promise.resolve(resolveRoleFromEmail(email)) : post('getRole', { email })),
  getLocations: () => post('getLocations'),
  // Security — kunjungan
  getPendingVisits: (location) => post('getPendingVisits', { location }),
  getActiveVisits: (location) => post('getActiveVisits', { location }),
  checkIn: (visitId, cardNumber) => post('checkIn', { visit_id: visitId, card_number: cardNumber }),
  rejectVisit: (visitId, reason) => post('rejectVisit', { visit_id: visitId, reason }),
  checkOut: (visitId) => post('checkOut', { visit_id: visitId }),
  // Security — paket
  addPackage: (data) => post('addPackage', data),
  getPackages: (filter) => post('getPackages', filter),
  pickupPackage: (packageId) => post('pickupPackage', { package_id: packageId }),
  // Admin
  getHistory: (filter) => post('getHistory', filter),
  getDashboardStats: (filter) => post('getDashboardStats', filter),
  getVisitorTimeline: (search) => post('getVisitorTimeline', { search }),
  getOfficers: () => post('getOfficers'),
  addOfficer: (data) => post('addOfficer', data),
  updateOfficer: (data) => post('updateOfficer', data),
};
