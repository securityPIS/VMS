// visits.js — alur kunjungan untuk security (antrean → check-in/reject → check-out)
// dan riwayat untuk admin.

function getPendingVisits(data) {
  assertSecurityAt(data, data.location);
  return filterVisits(VISIT_STATUS.PENDING, data.location).map(stripRow);
}

function getActiveVisits(data) {
  assertSecurityAt(data, data.location);
  return filterVisits(VISIT_STATUS.CHECKED_IN, data.location).map(stripRow);
}

function filterVisits(status, location) {
  return readRows(SHEETS.VISITS).filter((v) =>
    v.status === status && (!location || normEmail(v.location) === normEmail(location)));
}

// Check-in: validasi PENDING + nomor kartu wajib & unik antar tamu CHECKED_IN (FR-10).
function checkIn(data) {
  const row = findVisitRow(data.visit_id);
  if (row.status !== VISIT_STATUS.PENDING) throw new Error('Kunjungan bukan status PENDING.');
  const card = String(data.card_number || '').trim();
  if (!card) throw new Error('Nomor kartu wajib diisi.');

  const dup = readRows(SHEETS.VISITS).some((v) =>
    v.status === VISIT_STATUS.CHECKED_IN && String(v.card_number).trim() === card);
  if (dup) throw new Error('Nomor kartu sedang digunakan tamu lain.');

  updateCells(SHEETS.VISITS, row._row, {
    status: VISIT_STATUS.CHECKED_IN,
    card_number: card,
    security_email: normEmail(data.actor_email),
    checkin_at: now(),
  });
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
  return rows.map(stripRow);
}

function findVisitRow(visitId) {
  const row = readRows(SHEETS.VISITS).find((v) => v.visit_id === visitId);
  if (!row) throw new Error('Kunjungan tidak ditemukan: ' + visitId);
  return row;
}
