// email.js — notifikasi email via MailApp. Saat ini: pemberitahuan penolakan (§11).

function sendRejectEmail(email, nama, reason) {
  if (!email) return;
  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Kunjungan Anda Ditolak — Visitor Management System',
      body: [
        'Halo ' + (nama || '') + ',',
        '',
        'Mohon maaf, permohonan kunjungan Anda saat ini tidak dapat disetujui.',
        'Alasan: ' + reason,
        '',
        'Silakan hubungi pihak yang Anda tuju untuk informasi lebih lanjut.',
        '',
        '— Pesan ini dikirim otomatis oleh sistem. Mohon tidak membalas.',
      ].join('\n'),
    });
  } catch (err) {
    // Email gagal tidak boleh menggagalkan transaksi reject.
    console.warn('Gagal kirim email reject: ' + err.message);
  }
}
