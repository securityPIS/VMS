// drive.js - simpan dan sajikan foto privat dengan otorisasi per foto.

function uploadPhoto(data, authedEmail) {
  const raw = String(data.base64 || '');
  if (!raw) throw new Error('Data foto kosong.');
  const parsed = parsePhotoPayload(raw, data.mime);
  const type = optionalText(data.type || 'photo', 'Jenis foto', 32) || 'photo';
  if (!/^(ktp|selfie|package|photo)$/i.test(type)) throw new Error('Jenis foto tidak valid.');

  const folder = getPhotoFolder();
  const name = [type, normEmail(authedEmail), Date.now()].join('_');
  const file = folder.createFile(Utilities.newBlob(parsed.bytes, parsed.mime, name));
  const result = { ok: true, id: file.getId() };

  // Thumbnail opsional (dibuat di klien) disimpan sebagai file kedua agar daftar/tabel
  // cukup mengunduh versi kecil — hemat kuota & lebih cepat di mobile.
  const thumbRaw = String(data.thumb_base64 || '');
  if (thumbRaw) {
    const thumb = parsePhotoPayload(thumbRaw, data.thumb_mime);
    const thumbFile = folder.createFile(Utilities.newBlob(thumb.bytes, thumb.mime, name + '_thumb'));
    result.thumb_id = thumbFile.getId();
  }
  return result;
}

function getPhoto(data, authedEmail) {
  const photoId = extractDriveFileId(requiredText(data.photo_id || data.id, 'ID foto', 160));
  if (!photoId) throw new Error('ID foto tidak valid.');
  const access = findPhotoAccess(photoId);
  if (!access || !canReadPhotoAccess(authedEmail, access)) throw new Error('Foto tidak ditemukan.');

  const blob = DriveApp.getFileById(photoId).getBlob();
  return { ok: true, mime: blob.getContentType(), base64: Utilities.base64Encode(blob.getBytes()) };
}

function parsePhotoPayload(raw, declaredMime) {
  const header = raw.match(/^data:([^;,]+);base64,/i);
  const mime = String(declaredMime || (header && header[1]) || '').toLowerCase();
  if (ALLOWED_PHOTO_MIME.indexOf(mime) < 0) throw new Error('Format foto tidak didukung.');

  const clean = raw.replace(/^data:[^,]+,/, '');
  let bytes;
  try {
    bytes = Utilities.base64Decode(clean);
  } catch (err) {
    throw new Error('Data foto tidak valid.');
  }
  if (!bytes.length) throw new Error('Data foto kosong.');
  if (bytes.length > MAX_PHOTO_BYTES) throw new Error('Ukuran foto terlalu besar.');
  return { mime, bytes };
}

function findPhotoAccess(photoId) {
  const visits = readRows(SHEETS.VISITS);
  for (let i = 0; i < visits.length; i++) {
    if (photoRefMatches(visits[i].selfie_url, photoId) ||
        photoRefMatches(visits[i].selfie_thumb_url, photoId)) return { kind: 'visit', row: visits[i] };
  }

  const packages = readRows(SHEETS.PACKAGES);
  for (let j = 0; j < packages.length; j++) {
    if (photoRefMatches(packages[j].photo_url, photoId) ||
        photoRefMatches(packages[j].photo_thumb_url, photoId)) return { kind: 'package', row: packages[j] };
  }

  const visitors = readRows(SHEETS.VISITORS);
  for (let k = 0; k < visitors.length; k++) {
    if (photoRefMatches(visitors[k].ktp_photo_url, photoId) ||
        photoRefMatches(visitors[k].ktp_thumb_url, photoId)) return { kind: 'visitor', row: visitors[k] };
  }
  return null;
}

function canReadPhotoAccess(authedEmail, access) {
  if (access.kind === 'visit') {
    return normEmail(access.row.email) === normEmail(authedEmail) ||
      canAccessPhotoForLocation(authedEmail, access.row.location);
  }
  if (access.kind === 'package') {
    return canAccessPhotoForLocation(authedEmail, access.row.location);
  }
  if (access.kind === 'visitor') {
    if (normEmail(access.row.email) === normEmail(authedEmail)) return true;
    if (isAdminEmail(authedEmail)) return true;
    return readRows(SHEETS.VISITS).some((visit) =>
      visit.visitor_id === access.row.visitor_id && canAccessPhotoForLocation(authedEmail, visit.location));
  }
  return false;
}

function photoRefMatches(value, photoId) {
  return extractDriveFileId(value) === photoId;
}

function extractDriveFileId(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/[-\w]{25,}/);
  return match ? match[0] : raw;
}

function servePhoto() {
  return jsonOutput({ error: 'Permintaan tidak dapat diproses.' });
}

function getPhotoFolder() {
  const id = PROP.getProperty(PROP_KEYS.PHOTO_FOLDER_ID);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* folder hilang, buat ulang */ }
  }
  const folder = DriveApp.createFolder(PHOTO_FOLDER_NAME);
  PROP.setProperty(PROP_KEYS.PHOTO_FOLDER_ID, folder.getId());
  return folder;
}
