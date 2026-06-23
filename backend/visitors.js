// visitors.js - master tamu dan submit kunjungan.

function getVisitorByEmail(data, authedEmail) {
  const requested = normEmail(data.email || authedEmail);
  if (requested !== normEmail(authedEmail)) requireAdmin(authedEmail);
  const v = findVisitorByEmail(requested);
  return { visitor: publicVisitor(v) };
}

function normalizeVisitSchedule(data) {
  const type = String(data.schedule_type || data.scheduleType || 'NOW').trim().toUpperCase() === 'SCHEDULE'
    ? 'SCHEDULE'
    : 'NOW';
  if (type === 'NOW') return { schedule_type: 'NOW', scheduled_at: '' };

  const scheduledDate = String(data.scheduled_date || data.scheduledDate || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
    throw new Error('Tanggal kunjungan wajib dipilih.');
  }

  const tz = Session.getScriptTimeZone() || 'Asia/Jakarta';
  const today = Utilities.formatDate(now(), tz, 'yyyy-MM-dd');
  if (scheduledDate < today) throw new Error('Tanggal kunjungan tidak boleh lebih lama dari hari ini.');

  return {
    schedule_type: 'SCHEDULE',
    scheduled_at: scheduledDate + 'T00:00:00+07:00',
  };
}

function submitVisit(data, authedEmail) {
  const email = validateEmailValue(authedEmail);
  if (data.email && normEmail(data.email) !== email) throw new Error('Email payload tidak sesuai token.');
  if (!(data.consent === true || String(data.consent).toUpperCase() === 'TRUE')) {
    throw new Error('Persetujuan pemrosesan data wajib diberikan.');
  }

  const tujuan = requiredText(data.tujuan, 'Tujuan', 160);
  const keperluan = requiredText(data.keperluan, 'Keperluan', 500);
  const loc = requireActiveLocation({ location_id: data.location_id, location: data.location });
  const selfieUrl = requiredText(data.selfie_url, 'Foto selfie', 160);
  const schedule = normalizeVisitSchedule(data);

  let visitor = findVisitorByEmail(email);
  let visitorId;
  let nama;
  if (visitor) {
    visitorId = visitor.visitor_id;
    nama = visitor.nama || nameFromEmail(email);
  } else {
    visitorId = uuid();
    nama = requiredText(data.name || nameFromEmail(email), 'Nama', 120);
    const ktp = validateKtp(data.ktp);
    const asal = requiredText(data.asal, 'Asal atau instansi', 160);
    const ktpPhotoUrl = requiredText(data.ktp_photo_url, 'Foto KTP', 160);
    appendRow(SHEETS.VISITORS, {
      visitor_id: visitorId,
      email,
      nama,
      ktp,
      asal,
      ktp_photo_url: ktpPhotoUrl,
      created_at: now(),
    });
  }

  const visitId = 'V-' + shortId();
  appendRow(SHEETS.VISITS, {
    visit_id: visitId,
    visitor_id: visitorId,
    email,
    nama,
    keperluan,
    tujuan,
    location: loc.name,
    selfie_url: selfieUrl,
    status: VISIT_STATUS.PENDING,
    card_number: '',
    reject_reason: '',
    confirm_notes: '',
    security_email: '',
    created_at: now(),
    checkin_at: '',
    checkout_at: '',
    schedule_type: schedule.schedule_type,
    scheduled_at: schedule.scheduled_at,
  });
  return { ok: true, visit_id: visitId, status: VISIT_STATUS.PENDING };
}
