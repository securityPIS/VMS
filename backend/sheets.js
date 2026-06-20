// sheets.js — helper akses Spreadsheet tingkat rendah. Tanpa logika bisnis.

// Cache objek Spreadsheet & Sheet selama satu eksekusi. SpreadsheetApp.openById()
// dan getSheetByName() relatif mahal; satu request bisa menyentuh sheet yang sama
// berkali-kali, jadi cukup buka sekali.
let _ssCache = null;
const _sheetCache = {};

function getSpreadsheet() {
  if (_ssCache) return _ssCache;
  const id = PROP.getProperty(PROP_KEYS.SPREADSHEET_ID);
  if (!id) throw new Error('SPREADSHEET_ID belum diset. Jalankan setupSpreadsheet() dulu.');
  _ssCache = SpreadsheetApp.openById(id);
  return _ssCache;
}

function getSheet(name) {
  if (_sheetCache[name]) return _sheetCache[name];
  const sh = getSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Sheet tidak ditemukan: ' + name);
  _sheetCache[name] = sh;
  return sh;
}

// Baca seluruh baris → array of objects. Key dari header (baris 1).
// `_row` = nomor baris sheet, dipakai untuk update/hapus presisi.
function readRows(name) {
  const sh = getSheet(name);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const header = values[0];
  return values.slice(1).map((row, i) => {
    const obj = { _row: i + 2 };
    header.forEach((h, c) => { obj[h] = row[c]; });
    return obj;
  });
}

// Tambah satu baris dari objek, mengikuti urutan kolom di HEADERS[name].
function appendRow(name, obj) {
  const header = HEADERS[name];
  getSheet(name).appendRow(header.map((h) => (obj[h] !== undefined && obj[h] !== null ? obj[h] : '')));
}

// Update sebagian sel pada satu baris (rowNum = nomor baris sheet).
// Menulis sekali sebagai satu rentang kontigu (1 baca + 1 tulis) alih-alih
// setValue() per sel — tiap setValue() adalah round-trip terpisah ke Sheets.
function updateCells(name, rowNum, patch) {
  const sh = getSheet(name);
  const header = HEADERS[name];
  const cols = Object.keys(patch)
    .map((key) => header.indexOf(key))
    .filter((c) => c >= 0);
  if (!cols.length) return;

  const min = Math.min.apply(null, cols);
  const max = Math.max.apply(null, cols);
  const range = sh.getRange(rowNum, min + 1, 1, max - min + 1);
  const rowVals = range.getValues()[0];
  Object.keys(patch).forEach((key) => {
    const col = header.indexOf(key);
    if (col >= 0) rowVals[col - min] = patch[key];
  });
  range.setValues([rowVals]);
}

// Buang field internal `_row` sebelum dikirim sebagai respons.
function stripRow(obj) {
  const o = Object.assign({}, obj);
  delete o._row;
  return o;
}

function uuid() { return Utilities.getUuid(); }
function now() { return new Date(); }

// ID pendek unik-cukup untuk visit/package (mis. "8F3A").
function shortId() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
}
