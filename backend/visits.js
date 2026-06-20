// visits.js — alur kunjungan untuk security (antrean → check-in/reject → check-out)
// dan riwayat untuk admin.

function getPendingVisits(data) {
  assertSecurityAt(data, data.location);
  return enrichVisits(filterVisits(VISIT_STATUS.PENDING, data.location));
}

function getActiveVisits(data) {
  assertSecurityAt(data, data.location);
  return enrichVisits(filterVisits(VISIT_STATUS.CHECKED_IN, data.location));
}

function filterVisits(status, location) {
  return readRows(SHEETS.VISITS).filter((v) =>
    v.status === status && (!location || normEmail(v.location) === normEmail(location)));
}

// Gabungkan data master Visitor (asal + foto KTP) ke tiap baris kunjungan agar
// kartu antrean/riwayat di frontend bisa menampilkan instansi & foto verifikasi.
function enrichVisits(rows) {
  const byId = {};
  readRows(SHEETS.VISITORS).forEach((v) => { byId[v.visitor_id] = v; });
  return rows.map((r) => {
    const o = stripRow(r);
    const v = byId[r.visitor_id];
    o.asal = v ? v.asal : '';
    o.ktp_photo_url = v ? v.ktp_photo_url : '';
    return o;
  });
}

// Status satu kunjungan (untuk polling layar tamu). Tanpa enforcement lokasi —
// hanya butuh secret + visit_id yang valid.
function getVisitStatus(data) {
  const row = findVisitRow(data.visit_id);
  return { status: row.status, reject_reason: row.reject_reason || '', tujuan: row.tujuan, nama: row.nama };
}

// Check-in: validasi PENDING + nomor kartu wajib & unik antar tamu CHECKED_IN (FR-10).
function checkIn(data) {
  // Satu kali baca sheet, dipakai untuk cari baris sekaligus cek duplikat kartu.
  const rows = readRows(SHEETS.VISITS);
  const row = rows.find((v) => v.visit_id === data.visit_id);
  if (!row) throw new Error('Kunjungan tidak ditemukan: ' + data.visit_id);
  if (row.status !== VISIT_STATUS.PENDING) throw new Error('Kunjungan bukan status PENDING.');
  const card = String(data.card_number || '').trim();
  if (!card) throw new Error('Nomor kartu wajib diisi.');
  const notes = String(data.confirm_notes || data.notes || '').trim();
  if (!notes) throw new Error('Catatan konfirmasi wajib diisi.');

  const dup = rows.some((v) =>
    v.status === VISIT_STATUS.CHECKED_IN && String(v.card_number).trim() === card);
  if (dup) throw new Error('Nomor kartu sedang digunakan tamu lain.');

  updateCells(SHEETS.VISITS, row._row, {
    status: VISIT_STATUS.CHECKED_IN,
    card_number: card,
    confirm_notes: notes,
    security_email: normEmail(data.actor_email),
    checkin_at: now(),
  });
  sendConfirmEmail(row, notes);                // email.js
  return { ok: true, visit_id: data.visit_id, status: VISIT_STATUS.CHECKED_IN };
}

// Reject: alasan wajib + kirim email pemberitahuan ke tamu (FR-13 / §11).
function rejectVisit(data) {
  const row = findVisitRow(data.visit_id);
  const reason = String(data.reason || '').trim();
  if (!reason) throw new Error('Alasan penolakan wajib diisi.');

  updateCells(SHEETS.VISITS, row._row, {
    status: VISIT_STATUS.REJECTED,
    reject_reason: reason,
    security_email: normEmail(data.actor_email),
  });
  sendRejectEmail(row.email, row.nama, reason);   // email.js
  return { ok: true, visit_id: data.visit_id, status: VISIT_STATUS.REJECTED };
}

function checkOut(data) {
  const row = findVisitRow(data.visit_id);
  if (row.status !== VISIT_STATUS.CHECKED_IN) throw new Error('Kunjungan belum CHECKED_IN.');
  updateCells(SHEETS.VISITS, row._row, { status: VISIT_STATUS.CHECKED_OUT, checkout_at: now() });
  return { ok: true, visit_id: data.visit_id, status: VISIT_STATUS.CHECKED_OUT };
}

// Riwayat lengkap untuk admin, dengan filter opsional lokasi & rentang tanggal.
function getHistory(data) {
  let rows = readRows(SHEETS.VISITS);
  if (data.location) rows = rows.filter((v) => normEmail(v.location) === normEmail(data.location));
  if (data.from) rows = rows.filter((v) => v.created_at && new Date(v.created_at) >= new Date(data.from));
  if (data.to) rows = rows.filter((v) => v.created_at && new Date(v.created_at) <= new Date(data.to));
  rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return enrichVisits(rows);
}

function findVisitRow(visitId) {
  const row = readRows(SHEETS.VISITS).find((v) => v.visit_id === visitId);
  if (!row) throw new Error('Kunjungan tidak ditemukan: ' + visitId);
  return row;
}
