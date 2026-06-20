// visitors.js — master tamu & submit kunjungan (Visitors + Visits).

function getVisitorByEmail(data) {
  const v = findVisitorByEmail(normEmail(data.email));
  return { visitor: v ? stripRow(v) : null };
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

// submitVisit: buat/peroleh Visitor lalu catat satu Visit berstatus PENDING.
// Wajib: email, tujuan, keperluan. Tamu baru juga mengisi nama/ktp/asal + foto.
function submitVisit(data) {
  const email = normEmail(data.email);
  if (!email) throw new Error('Email wajib diisi.');
  if (!data.tujuan || !data.keperluan) throw new Error('Tujuan & keperluan wajib diisi.');
  const schedule = normalizeVisitSchedule(data);

  let visitor = findVisitorByEmail(email);
  let visitorId;
  if (visitor) {
    visitorId = visitor.visitor_id;
  } else {
    visitorId = uuid();
    appendRow(SHEETS.VISITORS, {
      visitor_id: visitorId,
      email,
      nama: data.name || nameFromEmail(email),
      ktp: data.ktp || '',
      asal: data.asal || '',
      ktp_photo_url: data.ktp_photo_url || '',
      created_at: now(),
    });
  }

  const visitId = 'V-' + shortId();
  appendRow(SHEETS.VISITS, {
    visit_id: visitId,
    visitor_id: visitorId,
    email,
    nama: data.name || (visitor && visitor.nama) || nameFromEmail(email),
    keperluan: data.keperluan,
    tujuan: data.tujuan,
    location: data.location || '',
    selfie_url: data.selfie_url || '',
    status: VISIT_STATUS.PENDING,
    card_number: '',
    reject_reason: '',
    security_email: '',
    created_at: now(),
    checkin_at: '',
    checkout_at: '',
    schedule_type: schedule.schedule_type,
    scheduled_at: schedule.scheduled_at,
  });
  return { ok: true, visit_id: visitId, status: VISIT_STATUS.PENDING };
}
