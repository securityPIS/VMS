// setup.js — inisialisasi SATU KALI. Jalankan setupSpreadsheet() dari editor Apps Script.
// Membuat spreadsheet + semua sheet & header, seed Locations + admin,
// dan menyiapkan folder foto privat.

// ── Ubah sesuai kebutuhan sebelum menjalankan setup ──
const SEED_ADMIN_EMAIL = 'admin@pertamina.com';
const SEED_ADMIN_NAME = 'Admin IT';

function setupSpreadsheet() {
  let ss;
  const existingId = PROP.getProperty(PROP_KEYS.SPREADSHEET_ID);
  if (existingId) {
    ss = SpreadsheetApp.openById(existingId);
  } else {
    ss = SpreadsheetApp.create('VMS Database');
    PROP.setProperty(PROP_KEYS.SPREADSHEET_ID, ss.getId());
  }

  Object.keys(HEADERS).forEach((name) => ensureSheet(ss, name, HEADERS[name]));
  removeDefaultSheet(ss);

  seedLocations();
  seedAdmin();
  getPhotoFolder();   // buat folder foto privat & simpan id-nya (drive.js)

  const info = {
    spreadsheet_id: ss.getId(),
    spreadsheet_url: ss.getUrl(),
    photo_folder_id: PROP.getProperty(PROP_KEYS.PHOTO_FOLDER_ID),
    google_client_id_configured: !!PROP.getProperty(PROP_KEYS.GOOGLE_CLIENT_ID),
  };
  Logger.log(JSON.stringify(info, null, 2));
  return info;
}

function authorizeRuntimeScopes() {
  // Jalankan sekali dari Apps Script editor setelah ada scope baru di manifest.
  // Fungsi ini sengaja menyentuh service runtime utama agar Google menampilkan
  // dialog consent untuk Spreadsheet, Drive, dan UrlFetchApp.
  const tokenInfoProbe = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo', {
    method: 'get',
    muteHttpExceptions: true,
  });
  const spreadsheet = getSpreadsheet();
  const folder = getPhotoFolder();
  const info = Object.assign({}, backendReadiness(), {
    tokeninfo_probe_status: tokenInfoProbe.getResponseCode(),
    spreadsheet_opened: !!spreadsheet.getId(),
    photo_folder_opened: !!folder.getId(),
  });
  Logger.log(JSON.stringify(info, null, 2));
  return info;
}

function ensureSheet(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function removeDefaultSheet(ss) {
  const def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
}

function seedLocations() {
  if (readRows(SHEETS.LOCATIONS).length) return;
  [['LOC-01', 'Gate Utama', true], ['LOC-02', 'Lobi Resepsionis', true], ['LOC-03', 'Gate Logistik', true]]
    .forEach((r) => appendRow(SHEETS.LOCATIONS, { location_id: r[0], name: r[1], active: r[2] }));
}

function seedAdmin() {
  if (findUserByEmail(normEmail(SEED_ADMIN_EMAIL))) return;
  appendRow(SHEETS.USERS, {
    email: normEmail(SEED_ADMIN_EMAIL), role: ROLE.ADMIN, name: SEED_ADMIN_NAME,
    officer_id: '', location_id: '', location: '', status: USER_STATUS.ACTIVE,
  });
}
