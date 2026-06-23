// email.js - notifikasi email via MailApp untuk konfirmasi dan penolakan.

function emailName(nama) {
  return stripControlChars(nama || 'Bapak/Ibu') || 'Bapak/Ibu';
}

function formatVisitSchedule(visit) {
  if (!visit || String(visit.schedule_type || '').toUpperCase() !== 'SCHEDULE') {
    return 'Kunjungan langsung';
  }
  if (!visit.scheduled_at) return 'Kunjungan terjadwal';
  const parsed = new Date(visit.scheduled_at);
  if (Number.isNaN(parsed.getTime())) return String(visit.scheduled_at);
  const tz = Session.getScriptTimeZone() || 'Asia/Jakarta';
  return Utilities.formatDate(parsed, tz, 'dd MMM yyyy');
}

function sendEmailSafely(message, logLabel) {
  try {
    MailApp.sendEmail(Object.assign({ name: 'Visitor Management System' }, message));
  } catch (err) {
    // Email gagal tidak boleh menggagalkan transaksi operasional.
    console.warn('Gagal kirim email ' + logLabel + ': ' + err.message);
  }
}

function sendConfirmEmail(visit, notes) {
  if (!visit || !visit.email) return;
  const catatan = optionalText(notes, 'Catatan petugas', 500);
  sendEmailSafely({
    to: visit.email,
    subject: 'Konfirmasi Kunjungan Anda - Visitor Management System',
    body: [
      'Yth. ' + emailName(visit.nama) + ',',
      '',
      'Permohonan kunjungan Anda telah dikonfirmasi oleh petugas security.',
      '',
      'Detail kunjungan:',
      'Nama: ' + emailName(visit.nama),
      'Tujuan: ' + (visit.tujuan || '-'),
      'Keperluan: ' + (visit.keperluan || '-'),
      'Lokasi: ' + (visit.location || '-'),
      'Jadwal: ' + formatVisitSchedule(visit),
      '',
      'Catatan petugas:',
      catatan,
      '',
      'Mohon mengikuti arahan petugas security selama berada di area perusahaan dan menggunakan kartu visitor sesuai ketentuan.',
      '',
      'Hormat kami,',
      'Visitor Management System',
      '',
      'Pesan ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.',
    ].join('\n'),
  }, 'konfirmasi kunjungan');
}

function sendRejectEmail(email, nama, reason) {
  if (!email) return;
  const safeReason = optionalText(reason, 'Alasan penolakan', 500) || '-';
  sendEmailSafely({
    to: email,
    subject: 'Pemberitahuan Penolakan Kunjungan - Visitor Management System',
    body: [
      'Yth. ' + emailName(nama) + ',',
      '',
      'Dengan hormat, kami informasikan bahwa permohonan kunjungan Anda belum dapat disetujui.',
      '',
      'Alasan penolakan:',
      safeReason,
      '',
      'Apabila diperlukan, silakan menghubungi pihak yang Anda tuju atau melakukan registrasi ulang dengan data yang sesuai.',
      '',
      'Hormat kami,',
      'Visitor Management System',
      '',
      'Pesan ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.',
    ].join('\n'),
  }, 'penolakan kunjungan');
}
