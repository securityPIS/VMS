// sheets.js — helper akses Spreadsheet tingkat rendah. Tanpa logika bisnis.

function getSpreadsheet() {
  const id = PROP.getProperty(PROP_KEYS.SPREADSHEET_ID);
  if (!id) throw new Error('SPREADSHEET_ID belum diset. Jalankan setupSpreadsheet() dulu.');
  return SpreadsheetApp.openById(id);
}

function getSheet(name) {
  const sh = getSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Sheet tidak ditemukan: ' + name);
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
function updateCells(name, rowNum, patch) {
  const sh = getSheet(name);
  const header = HEADERS[name];
  Object.keys(patch).forEach((key) => {
    const col = header.indexOf(key);
    if (col >= 0) sh.getRange(rowNum, col + 1).setValue(patch[key]);
  });
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
