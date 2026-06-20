// setup.js — inisialisasi SATU KALI. Jalankan setupSpreadsheet() dari editor Apps Script.
// Membuat spreadsheet + semua sheet & header, seed Locations + admin, generate secret,
// dan menyiapkan folder foto privat. Mengembalikan info penting (catat secret-nya!).

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
  ensureSecret();
  getPhotoFolder();   // buat folder foto privat & simpan id-nya (drive.js)

  const info = {
    spreadsheet_id: ss.getId(),
    spreadsheet_url: ss.getUrl(),
    api_secret: PROP.getProperty(PROP_KEYS.API_SECRET),
    photo_folder_id: PROP.getProperty(PROP_KEYS.PHOTO_FOLDER_ID),
  };
  Logger.log(JSON.stringify(info, null, 2));   // salin api_secret ke web/.env (VITE_API_SECRET)
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

function ensureSecret() {
  if (PROP.getProperty(PROP_KEYS.API_SECRET)) return;
  const secret = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  PROP.setProperty(PROP_KEYS.API_SECRET, secret);
}
