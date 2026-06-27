// visits.js - alur kunjungan dan riwayat operasional.

function getPendingVisits(data, authedEmail) {
  const scope = requireSecurityScope(authedEmail, data);
  return enrichVisits(filterVisits(VISIT_STATUS.PENDING, scope.location));
}

function getActiveVisits(data, authedEmail) {
  const scope = requireSecurityScope(authedEmail, data);
  return enrichVisits(filterVisits(VISIT_STATUS.CHECKED_IN, scope.location));
}

function filterVisits(status, location) {
  return readRows(SHEETS.VISITS).filter((v) =>
    v.status === status && (!location || normEmail(v.location) === normEmail(location)));
}

function enrichVisits(rows) {
  const byId = {};
  readRows(SHEETS.VISITORS).forEach((v) => { byId[v.visitor_id] = v; });
  return rows.map((r) => {
    const o = stripRow(r);
    const v = byId[r.visitor_id];
    o.asal = v ? v.asal : '';
    o.ktp_photo_url = v ? v.ktp_photo_url : '';
    o.ktp_thumb_url = v ? v.ktp_thumb_url : '';
    delete o.ktp;
    return o;
  });
}

function getVisitStatus(data, authedEmail) {
  const row = findVisitRow(data.visit_id);
  requireVisitAccess(authedEmail, row);
  return { status: row.status, reject_reason: row.reject_reason || '', tujuan: row.tujuan, nama: row.nama };
}

function checkIn(data, authedEmail) {
  return withScriptLock(() => {
    const rows = readRows(SHEETS.VISITS);
    const row = rows.find((v) => v.visit_id === data.visit_id);
    if (!row) throw new Error('Kunjungan tidak ditemukan.');
    requireSecurityScope(authedEmail, { location: row.location });
    if (row.status !== VISIT_STATUS.PENDING) throw new Error('Kunjungan bukan status PENDING.');

    const card = requiredText(data.card_number, 'Nomor kartu', 32);
    // Catatan konfirmasi hanya wajib untuk kunjungan terjadwal; kedatangan
    // langsung (NOW) cukup nomor kartu.
    const isSchedule = String(row.schedule_type || '').toUpperCase() === 'SCHEDULE';
    const notes = isSchedule
      ? requiredText(data.confirm_notes || data.notes, 'Catatan konfirmasi', 500)
      : optionalText(data.confirm_notes || data.notes, 'Catatan konfirmasi', 500);
    const dup = rows.some((v) =>
      v.status === VISIT_STATUS.CHECKED_IN && String(v.card_number).trim() === card);
    if (dup) throw new Error('Nomor kartu sedang digunakan tamu lain.');

    updateCells(SHEETS.VISITS, row._row, {
      status: VISIT_STATUS.CHECKED_IN,
      card_number: card,
      confirm_notes: notes,
      security_email: normEmail(authedEmail),
      checkin_at: now(),
    });
    sendConfirmEmail(row, notes);
    return { ok: true, visit_id: data.visit_id, status: VISIT_STATUS.CHECKED_IN };
  });
}

function rejectVisit(data, authedEmail) {
  return withScriptLock(() => {
    const row = findVisitRow(data.visit_id);
    requireSecurityScope(authedEmail, { location: row.location });
    const reason = requiredText(data.reason, 'Alasan penolakan', 500);

    updateCells(SHEETS.VISITS, row._row, {
      status: VISIT_STATUS.REJECTED,
      reject_reason: reason,
      security_email: normEmail(authedEmail),
    });
    sendRejectEmail(row.email, row.nama, reason);
    return { ok: true, visit_id: data.visit_id, status: VISIT_STATUS.REJECTED };
  });
}

function checkOut(data, authedEmail) {
  return withScriptLock(() => {
    const row = findVisitRow(data.visit_id);
    requireSecurityScope(authedEmail, { location: row.location });
    if (row.status !== VISIT_STATUS.CHECKED_IN) throw new Error('Kunjungan belum CHECKED_IN.');
    updateCells(SHEETS.VISITS, row._row, { status: VISIT_STATUS.CHECKED_OUT, checkout_at: now() });
    return { ok: true, visit_id: data.visit_id, status: VISIT_STATUS.CHECKED_OUT };
  });
}

function getHistory(data, authedEmail) {
  const scope = requireSecurityScope(authedEmail, data);
  let rows = readRows(SHEETS.VISITS);
  if (scope.location) rows = rows.filter((v) => normEmail(v.location) === normEmail(scope.location));
  if (data.from) rows = rows.filter((v) => v.created_at && new Date(v.created_at) >= new Date(data.from));
  if (data.to) rows = rows.filter((v) => v.created_at && new Date(v.created_at) <= new Date(data.to));
  rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return enrichVisits(rows);
}

function findVisitRow(visitId) {
  const id = requiredText(visitId, 'ID kunjungan', 80);
  const row = readRows(SHEETS.VISITS).find((v) => v.visit_id === id);
  if (!row) throw new Error('Kunjungan tidak ditemukan.');
  return row;
}
