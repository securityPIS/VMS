// Lapisan integrasi tunggal ke Google Apps Script Web App.
//
// Dua mode otomatis berdasarkan env:
//  • MODE BACKEND (VITE_APPS_SCRIPT_URL terisi): POST text/plain ke Apps Script,
//    respons dinormalisasi ke bentuk frontend lewat adapters.js.
//  • MODE MOCK (URL kosong): membaca/menulis store di memori (salinan mockData),
//    sehingga UI & alur (check-in, dll.) tetap jalan tanpa backend.
//
// Komponen TIDAK memanggil fetch langsung — selalu lewat `api.*`. Bentuk data
// yang dikembalikan identik di kedua mode.
//
// Catatan CORS: Apps Script lebih mulus bila body text/plain (hindari preflight).

import {
  MOCK_VISITS, MOCK_PACKAGES, MOCK_SECURITY_OFFICERS,
  CHART_WEEKLY, CHART_DEPT, resolveRoleFromEmail,
} from './mockData';
import { dateID, LOCATIONS, sortVisitsNewest, timeID } from './constants';
import { adaptVisit, adaptPackage } from './adapters';

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';
const API_SECRET = import.meta.env.VITE_API_SECRET || '';

export const USE_MOCK = !API_URL;

// ── Transport (mode backend) ────────────────────────────────────────────────
async function post(action, payload = {}) {
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

// Ambil foto privat lewat doGet?action=getPhoto → data URI base64 (di-cache).
const DIRECT_SRC = /^(https?:|data:)/;
const photoCache = new Map();
async function fetchPhoto(ref) {
  if (!ref) return '';
  if (DIRECT_SRC.test(ref)) return ref;
  if (photoCache.has(ref)) return photoCache.get(ref);
  const url = `${API_URL}?action=getPhoto&id=${encodeURIComponent(ref)}&secret=${encodeURIComponent(API_SECRET)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const uri = `data:${data.mime};base64,${data.base64}`;
  photoCache.set(ref, uri);
  return uri;
}

// ── Store di memori (mode mock) ─────────────────────────────────────────────
const clone = (x) => JSON.parse(JSON.stringify(x));
const store = {
  visits: clone(MOCK_VISITS),
  packages: clone(MOCK_PACKAGES),
  officers: clone(MOCK_SECURITY_OFFICERS),
};
let visitSeq = 200;
let pkgSeq = 200;

function nowParts() {
  const d = new Date();
  return { date: dateID(d), time: timeID(d), iso: d.toISOString() };
}
function scheduledAt(date) {
  return date ? `${date}T00:00:00+07:00` : '';
}
function mutateVisit(id, patch) {
  const v = store.visits.find((x) => x.id === id);
  if (!v) throw new Error('Kunjungan tidak ditemukan: ' + id);
  Object.assign(v, patch);
}
function nextMockOfficerId() {
  const nums = store.officers.map((o) => String(o.officer_id || o.id))
    .filter((s) => /^SEC-\d+$/.test(s)).map((s) => parseInt(s.split('-')[1], 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return 'SEC-' + String(max + 1).padStart(2, '0');
}
function mockLocations() {
  return LOCATIONS.map((name, i) => ({ location_id: `LOC-${String(i + 1).padStart(2, '0')}`, name }));
}
function resolveMockLocation(data = {}) {
  const locationId = String(data.location_id || data.locationId || '').trim();
  const locationName = String(data.location || '').trim();
  const loc = mockLocations().find((item) =>
    (locationId && item.location_id === locationId) ||
    (locationName && item.name.toLowerCase() === locationName.toLowerCase()));
  if (!loc) throw new Error('Lokasi penugasan tidak valid atau tidak aktif.');
  return loc;
}
function mockStats() {
  const v = store.visits;
  return {
    totalMonth: v.length,
    doneToday: v.filter((x) => x.status === 'CHECKED_OUT').length,
    rejected: v.filter((x) => x.status === 'REJECTED').length,
    activeNow: v.filter((x) => x.status === 'CHECKED_IN').length,
    weekly: CHART_WEEKLY,
    dept: CHART_DEPT,
  };
}
function sameLocation(rowLocation, location) {
  if (!location) return true;
  return String(rowLocation || '').trim().toLowerCase() === String(location || '').trim().toLowerCase();
}

// ── API publik ──────────────────────────────────────────────────────────────
export const api = {
  // Peran ditentukan sistem dari email (mock: lokal; backend: endpoint getRole).
  getRole: (email) => (USE_MOCK ? Promise.resolve(resolveRoleFromEmail(email)) : post('getRole', { email })),

  getLocations: async () => {
    if (USE_MOCK) return mockLocations();
    return post('getLocations');
  },

  // Resolusi ref foto → URL yang bisa dipasang di <img>. Dipakai RemotePhoto.
  getPhoto: (ref) => {
    if (!ref) return Promise.resolve('');
    if (USE_MOCK) return Promise.resolve(DIRECT_SRC.test(ref) ? ref : '');
    return fetchPhoto(ref);
  },

  // ── Visitor ──
  uploadPhoto: async (base64, type, email) => {
    // Mock: pakai data URL langsung sebagai "ref" agar bisa langsung dipreview.
    if (USE_MOCK) return { ok: true, id: base64, url: base64 };
    return post('uploadPhoto', { base64, type, email });
  },

  submitVisit: async (data) => {
    if (USE_MOCK) {
      const id = 'V-' + (++visitSeq);
      const { date, time, iso } = nowParts();
      const scheduleType = String(data.schedule_type || 'NOW').toUpperCase() === 'SCHEDULE' ? 'SCHEDULE' : 'NOW';
      const scheduledDate = scheduleType === 'SCHEDULE' ? data.scheduled_date : '';
      store.visits.unshift({
        id, email: data.email, name: data.name || '', asal: data.asal || '',
        keperluan: data.keperluan, tujuan: data.tujuan, location: data.location || '',
        status: 'PENDING', cardNumber: '', rejectReason: '', confirmNotes: '',
        selfiePhoto: data.selfie_url || '', ktpPhoto: data.ktp_photo_url || '',
        scheduleType,
        scheduledDate,
        scheduledAt: scheduledAt(scheduledDate),
        createdAt: iso,
        checkinAt: '',
        checkinDate: '',
        checkinTime: '',
        checkoutAt: '',
        date, time, timeOut: '',
      });
      return { ok: true, visit_id: id, status: 'PENDING' };
    }
    return post('submitVisit', data);
  },

  getVisitStatus: async (visitId) => {
    if (USE_MOCK) {
      const v = store.visits.find((x) => x.id === visitId);
      return v ? { status: v.status, reject_reason: v.rejectReason || '', tujuan: v.tujuan } : { status: 'PENDING' };
    }
    return post('getVisitStatus', { visit_id: visitId });
  },

  // ── Security: kunjungan ──
  getPendingVisits: async (location, actorEmail) => {
    if (USE_MOCK) return store.visits.filter((v) => v.status === 'PENDING' && sameLocation(v.location, location));
    return (await post('getPendingVisits', { location, actor_email: actorEmail })).map(adaptVisit);
  },
  getActiveVisits: async (location, actorEmail) => {
    if (USE_MOCK) return store.visits.filter((v) => v.status === 'CHECKED_IN' && sameLocation(v.location, location));
    return (await post('getActiveVisits', { location, actor_email: actorEmail })).map(adaptVisit);
  },
  getHistory: async (filter = {}) => {
    if (USE_MOCK) return sortVisitsNewest(clone(store.visits).filter((v) => sameLocation(v.location, filter.location)));
    return sortVisitsNewest((await post('getHistory', filter)).map(adaptVisit));
  },

  checkIn: async (visitId, cardNumber, confirmNotes, actorEmail) => {
    if (USE_MOCK) {
      const card = String(cardNumber || '').trim();
      const notes = String(confirmNotes || '').trim();
      if (!card) throw new Error('Nomor kartu wajib diisi.');
      if (!notes) throw new Error('Catatan konfirmasi wajib diisi.');
      if (store.visits.some((v) => v.status === 'CHECKED_IN' && String(v.cardNumber).trim() === card)) {
        throw new Error('Nomor kartu sedang digunakan tamu lain.');
      }
      const { date, time, iso } = nowParts();
      mutateVisit(visitId, {
        status: 'CHECKED_IN',
        cardNumber: card,
        confirmNotes: notes,
        checkinAt: iso,
        checkinDate: date,
        checkinTime: time,
      });
      return { ok: true };
    }
    return post('checkIn', {
      visit_id: visitId,
      card_number: cardNumber,
      confirm_notes: confirmNotes,
      actor_email: actorEmail,
    });
  },
  rejectVisit: async (visitId, reason, actorEmail) => {
    if (USE_MOCK) {
      if (!String(reason || '').trim()) throw new Error('Alasan penolakan wajib diisi.');
      mutateVisit(visitId, { status: 'REJECTED', rejectReason: reason });
      return { ok: true };
    }
    return post('rejectVisit', { visit_id: visitId, reason, actor_email: actorEmail });
  },
  checkOut: async (visitId, actorEmail) => {
    if (USE_MOCK) {
      mutateVisit(visitId, { status: 'CHECKED_OUT', checkoutAt: new Date().toISOString(), timeOut: timeID() });
      return { ok: true };
    }
    return post('checkOut', { visit_id: visitId, actor_email: actorEmail });
  },

  // ── Security: paket ──
  getPackages: async (filter = {}, actorEmail) => {
    if (USE_MOCK) {
      return clone(store.packages).filter((p) =>
        (!filter.status || p.status === filter.status) && sameLocation(p.location, filter.location));
    }
    return (await post('getPackages', { ...filter, actor_email: actorEmail })).map(adaptPackage);
  },
  addPackage: async (data, actorEmail) => {
    if (USE_MOCK) {
      const id = 'PKG-' + (++pkgSeq);
      const { date, time } = nowParts();
      store.packages.unshift({
        id, sender: data.sender, recipient: data.recipient, type: data.type,
        status: 'RECEIVED', photo: data.photo_url || null, location: data.location || '', date, time,
      });
      return { ok: true, package_id: id };
    }
    return post('addPackage', { ...data, actor_email: actorEmail });
  },
  pickupPackage: async (packageId, actorEmail) => {
    if (USE_MOCK) {
      const p = store.packages.find((x) => x.id === packageId);
      if (!p) throw new Error('Paket tidak ditemukan: ' + packageId);
      if (p.status === 'PICKED_UP') throw new Error('Paket sudah diambil.');
      p.status = 'PICKED_UP';
      return { ok: true };
    }
    return post('pickupPackage', { package_id: packageId, actor_email: actorEmail });
  },

  // ── Admin ──
  getDashboardStats: async () => {
    if (USE_MOCK) return mockStats();
    return post('getDashboardStats');
  },
  getOfficers: async () => {
    if (USE_MOCK) return clone(store.officers);
    return post('getOfficers');
  },
  addOfficer: async (data) => {
    if (USE_MOCK) {
      if (store.officers.some((o) => o.email.toLowerCase() === String(data.email).toLowerCase())) {
        throw new Error('Email sudah terdaftar.');
      }
      const loc = resolveMockLocation(data);
      const id = nextMockOfficerId();
      store.officers.push({
        id,
        officer_id: id,
        name: data.name,
        email: data.email,
        location_id: loc.location_id,
        location: loc.name,
        status: 'Active',
      });
      return { ok: true, officer_id: id };
    }
    return post('addOfficer', data);
  },
  updateOfficer: async (data) => {
    if (USE_MOCK) {
      const o = store.officers.find((x) => (x.officer_id || x.id) === data.officer_id);
      if (!o) throw new Error('Petugas tidak ditemukan: ' + data.officer_id);
      if (data.email && store.officers.some((x) =>
        String(x.email).toLowerCase() === String(data.email).toLowerCase() && (x.officer_id || x.id) !== data.officer_id)) {
        throw new Error('Email sudah terdaftar.');
      }
      if (data.name) o.name = data.name;
      if (data.email) o.email = data.email;
      if (data.status) o.status = data.status;
      if (data.location_id || data.location) {
        const loc = resolveMockLocation(data);
        o.location_id = loc.location_id;
        o.location = loc.name;
      }
      return { ok: true };
    }
    return post('updateOfficer', data);
  },
  deleteOfficer: async (officerId) => {
    if (USE_MOCK) {
      const idx = store.officers.findIndex((x) => (x.officer_id || x.id) === officerId);
      if (idx < 0) throw new Error('Petugas tidak ditemukan: ' + officerId);
      store.officers.splice(idx, 1);
      return { ok: true };
    }
    return post('deleteOfficer', { officer_id: officerId });
  },
};
