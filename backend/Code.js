// Code.js - entry point Web App.
// doPost menerima JSON text/plain { action, id_token, ...payload }.
// Identitas selalu diverifikasi di server lewat Google ID token.

function doPost(e) {
  let data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const authedEmail = verifyIdToken(data);
    enforceRateLimit(data.action, authedEmail);
    const result = dispatch(data.action, data, authedEmail);
    return jsonOutput(result === undefined ? { ok: true } : result);
  } catch (err) {
    const publicErr = publicError(err);
    console.error(JSON.stringify({
      severity: 'ERROR',
      error_id: publicErr.error_id,
      error_code: publicErr.error_code,
      action: data && data.action ? data.action : '',
      message: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : '',
    }));
    return jsonOutput(publicErr);
  }
}

function doGet() {
  const readiness = backendReadiness();
  return jsonOutput({
    ok: true,
    service: 'VMS Apps Script',
    time: new Date().toISOString(),
    backend_version: '2026-06-23-auth-diagnostics',
    backend_ready: readiness.backend_ready,
    google_client_id_configured: readiness.google_client_id_configured,
    spreadsheet_configured: readiness.spreadsheet_configured,
    photo_folder_configured: readiness.photo_folder_configured,
  });
}

function backendReadiness() {
  const googleClientId = !!PROP.getProperty(PROP_KEYS.GOOGLE_CLIENT_ID);
  const spreadsheetId = !!PROP.getProperty(PROP_KEYS.SPREADSHEET_ID);
  const photoFolderId = !!PROP.getProperty(PROP_KEYS.PHOTO_FOLDER_ID);
  return {
    backend_ready: googleClientId && spreadsheetId && photoFolderId,
    google_client_id_configured: googleClientId,
    spreadsheet_configured: spreadsheetId,
    photo_folder_configured: photoFolderId,
  };
}

function dispatch(action, data, authedEmail) {
  switch (action) {
    // Visitor
    case 'getVisitorByEmail': return getVisitorByEmail(data, authedEmail);
    case 'uploadPhoto': return uploadPhoto(data, authedEmail);
    case 'submitVisit': return submitVisit(data, authedEmail);
    case 'getRole': return getRole(data, authedEmail);
    case 'getLocations': return getLocations(data, authedEmail);
    case 'getPhoto': return getPhoto(data, authedEmail);
    // Security - kunjungan
    case 'getPendingVisits': return getPendingVisits(data, authedEmail);
    case 'getActiveVisits': return getActiveVisits(data, authedEmail);
    case 'checkIn': return checkIn(data, authedEmail);
    case 'rejectVisit': return rejectVisit(data, authedEmail);
    case 'checkOut': return checkOut(data, authedEmail);
    case 'getVisitStatus': return getVisitStatus(data, authedEmail);
    // Security - paket
    case 'addPackage': return addPackage(data, authedEmail);
    case 'getPackages': return getPackages(data, authedEmail);
    case 'pickupPackage': return pickupPackage(data, authedEmail);
    // Admin
    case 'getHistory': return getHistory(data, authedEmail);
    case 'getDashboardStats': return getDashboardStats(data, authedEmail);
    case 'getVisitorTimeline': return getVisitorTimeline(data, authedEmail);
    case 'getOfficers': return getOfficers(data, authedEmail);
    case 'addOfficer': return addOfficer(data, authedEmail);
    case 'updateOfficer': return updateOfficer(data, authedEmail);
    case 'deleteOfficer': return deleteOfficer(data, authedEmail);
    default: throw new Error('Action tidak dikenal.');
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function publicError(err) {
  const message = String(err && err.message ? err.message : err || '');
  const errorId = Utilities.getUuid().slice(0, 8);

  if (/GOOGLE_CLIENT_ID belum diset/i.test(message)) {
    return {
      error: 'Konfigurasi login backend belum lengkap. Hubungi admin.',
      error_code: 'BACKEND_OAUTH_CONFIG_MISSING',
      error_id: errorId,
    };
  }
  if (/Audience token tidak valid/i.test(message)) {
    return {
      error: 'Konfigurasi login Google tidak cocok antara frontend dan backend. Hubungi admin.',
      error_code: 'OAUTH_CLIENT_MISMATCH',
      error_id: errorId,
    };
  }
  if (/Token Google|Issuer token|Email Google|kedaluwarsa/i.test(message)) {
    return {
      error: 'Sesi Google tidak valid. Silakan pilih akun Google lagi.',
      error_code: 'GOOGLE_TOKEN_REJECTED',
      error_id: errorId,
    };
  }
  if (/SPREADSHEET_ID|SpreadsheetApp|Sheet tidak ditemukan/i.test(message)) {
    return {
      error: 'Database aplikasi belum siap. Hubungi admin.',
      error_code: 'BACKEND_DATA_NOT_READY',
      error_id: errorId,
    };
  }
  if (/Akun petugas nonaktif/i.test(message)) {
    return { error: 'Akun petugas nonaktif. Hubungi admin.', error_code: 'ACCOUNT_INACTIVE', error_id: errorId };
  }
  if (/Lokasi petugas belum valid/i.test(message)) {
    return {
      error: 'Data penugasan petugas belum lengkap. Hubungi admin.',
      error_code: 'OFFICER_ASSIGNMENT_INVALID',
      error_id: errorId,
    };
  }
  if (/Terlalu banyak permintaan/i.test(message)) {
    return { error: 'Terlalu banyak permintaan. Coba lagi sebentar.', error_code: 'RATE_LIMITED', error_id: errorId };
  }
  if (/Akses ditolak/i.test(message)) {
    return { error: 'Akses ditolak.', error_code: 'ACCESS_DENIED', error_id: errorId };
  }
  if (/JSON/i.test(message) || /Unexpected token/i.test(message)) {
    return { error: 'Format permintaan tidak valid.', error_code: 'BAD_REQUEST', error_id: errorId };
  }
  return { error: 'Permintaan tidak dapat diproses.', error_code: 'REQUEST_FAILED', error_id: errorId };
}
