// drive.js — simpan foto (KTP/selfie/paket) di folder Drive PRIVAT.
// UU PDP / NFR-04: TANPA link publik. Foto diakses via action getPhoto (ber-secret).

function uploadPhoto(data) {
  if (!data.base64) throw new Error('Data foto kosong.');
  const folder = getPhotoFolder();
  const raw = String(data.base64);
  // Ambil mime dari prefix data URI (mis. data:image/webp;base64,...) agar file
  // tersimpan & disajikan dengan tipe benar. Fallback: data.mime, lalu JPEG.
  const m = raw.match(/^data:([^;,]+)[;,]/);
  const mime = data.mime || (m && m[1]) || 'image/jpeg';
  const clean = raw.replace(/^data:[^,]+,/, '');   // buang prefix data URI bila ada
  const bytes = Utilities.base64Decode(clean);
  const name = [data.type || 'photo', normEmail(data.email) || 'anon', Date.now()].join('_');
  const file = folder.createFile(Utilities.newBlob(bytes, mime, name));
  // Sengaja TIDAK setSharing publik — biarkan privat (hanya pemilik script).
  return { ok: true, id: file.getId(), url: file.getUrl() };
}

// Sajikan foto privat sebagai base64 lewat doGet?action=getPhoto&id=...&secret=...
// Frontend menyusunnya jadi data URI untuk <img>. (Apps Script ContentService
// hanya bisa teks, sehingga foto dikembalikan sebagai base64.)
function servePhoto(params) {
  const expected = PROP.getProperty(PROP_KEYS.API_SECRET);
  if (!expected || params.secret !== expected) return jsonOutput({ error: 'Akses ditolak.' });
  try {
    const blob = DriveApp.getFileById(params.id).getBlob();
    return jsonOutput({ ok: true, mime: blob.getContentType(), base64: Utilities.base64Encode(blob.getBytes()) });
  } catch (err) {
    return jsonOutput({ error: 'Foto tidak ditemukan.' });
  }
}

function getPhotoFolder() {
  const id = PROP.getProperty(PROP_KEYS.PHOTO_FOLDER_ID);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* folder hilang → buat ulang */ }
  }
  const folder = DriveApp.createFolder(PHOTO_FOLDER_NAME);
  PROP.setProperty(PROP_KEYS.PHOTO_FOLDER_ID, folder.getId());
  return folder;
}
