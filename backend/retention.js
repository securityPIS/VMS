// retention.js — hapus data & foto lebih lama dari RETENTION_DAYS (NFR-07 / UU PDP).
// purgeOldData dipicu trigger harian; installRetentionTrigger dijalankan sekali.

function purgeOldData() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400000);
  purgeSheetByDate(SHEETS.VISITS, 'created_at', cutoff, ['selfie_url', 'selfie_thumb_url']);
  purgeSheetByDate(SHEETS.PACKAGES, 'received_at', cutoff, ['photo_url', 'photo_thumb_url']);
  purgeSheetByDate(SHEETS.VISITORS, 'created_at', cutoff, ['ktp_photo_url', 'ktp_thumb_url']);
}

// Hapus baris yang lebih tua dari cutoff + buang file foto terkait ke Trash.
// Iterasi dari bawah agar nomor baris tidak bergeser saat menghapus.
function purgeSheetByDate(name, dateCol, cutoff, photoCols) {
  const sh = getSheet(name);
  const rows = readRows(name);
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    const d = r[dateCol] ? new Date(r[dateCol]) : null;
    if (d && d < cutoff) {
      (photoCols || []).forEach((c) => trashDriveFile(r[c]));
      sh.deleteRow(r._row);
    }
  }
}

function trashDriveFile(idOrUrl) {
  if (!idOrUrl) return;
  try {
    const m = String(idOrUrl).match(/[-\w]{25,}/);   // file id di URL/teks
    if (m) DriveApp.getFileById(m[0]).setTrashed(true);
  } catch (err) { /* abaikan bila sudah tidak ada */ }
}

// Pasang trigger harian 02:00 (idempoten — hapus duplikat dulu). Jalankan sekali.
function installRetentionTrigger() {
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === 'purgeOldData') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('purgeOldData').timeBased().everyDays(1).atHour(2).create();
  return 'Trigger retensi harian terpasang (02:00 ' + (Session.getScriptTimeZone() || 'lokal') + ').';
}
