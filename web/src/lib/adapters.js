// Normalisasi bentuk data backend (snake_case, datetime gabungan) → bentuk yang
// dipakai komponen frontend (camelCase, date/time terpisah). Dipanggil di api.js
// untuk respons backend; data mock sudah memakai bentuk frontend sehingga lewat.

import { dateID, timeID } from './constants';

// Pisah nilai datetime jadi { date: 'YYYY-MM-DD', time: 'HH:mm' } (lokal).
export function splitDateTime(value) {
  if (!value) return { date: '', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: String(value), time: '' };
  return { date: dateID(d), time: timeID(d) };
}

function justTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : timeID(d);
}

// Baris Visit backend → objek visit frontend (dipakai antrean, aktif, riwayat,
// timeline). `selfiePhoto`/`ktpPhoto` berisi ref foto (id Drive) → RemotePhoto.
export function adaptVisit(row) {
  const created = splitDateTime(row.created_at);
  const scheduled = splitDateTime(row.scheduled_at);
  const checkin = splitDateTime(row.checkin_at);
  const scheduleType = String(row.schedule_type || 'NOW').toUpperCase() === 'SCHEDULE' ? 'SCHEDULE' : 'NOW';
  return {
    id: row.visit_id,
    visitorId: row.visitor_id,
    email: row.email || '',
    name: row.nama || '',
    asal: row.asal || '',
    keperluan: row.keperluan || '',
    tujuan: row.tujuan || '',
    location: row.location || '',
    status: row.status,
    cardNumber: row.card_number || '',
    rejectReason: row.reject_reason || '',
    selfiePhoto: row.selfie_url || '',
    ktpPhoto: row.ktp_photo_url || '',
    scheduleType,
    scheduledAt: row.scheduled_at || '',
    scheduledDate: scheduled.date,
    createdAt: row.created_at || '',
    checkinAt: row.checkin_at || '',
    checkinDate: checkin.date,
    checkinTime: checkin.time,
    checkoutAt: row.checkout_at || '',
    date: created.date,
    time: created.time,
    timeOut: justTime(row.checkout_at),
  };
}

// Baris Package backend → objek package frontend.
export function adaptPackage(row) {
  const received = splitDateTime(row.received_at);
  return {
    id: row.package_id,
    sender: row.sender || '',
    recipient: row.recipient || '',
    type: row.type || '',
    status: row.status,
    photo: row.photo_url || null,
    location: row.location || '',
    date: received.date,
    time: received.time,
  };
}
