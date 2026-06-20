// officers.js — manajemen petugas (sheet Users, role=security) & daftar lokasi.
// Admin meng-assign email petugas di sini → inilah whitelist yang dipakai getRole
// untuk mengenali seseorang sebagai security.

function getLocations() {
  return readRows(SHEETS.LOCATIONS)
    .filter((l) => l.active === true || String(l.active).toUpperCase() === 'TRUE')
    .map((l) => ({ location_id: l.location_id, name: l.name }));
}

function getOfficers() {
  return readRows(SHEETS.USERS)
    .filter((u) => u.role === ROLE.SECURITY)
    .map((u) => {
      const loc = resolveLocationForUser(u);
      return {
        id: u.officer_id,
        officer_id: u.officer_id,
        name: u.name,
        email: u.email,
        location_id: loc.location_id,
        location: loc.name,
        status: u.status,
      };
    });
}

function addOfficer(data) {
  const email = normEmail(data.email);
  const name = String(data.name || '').trim();
  if (!name || !email) throw new Error('Nama & email wajib diisi.');
  if (findUserByEmail(email)) throw new Error('Email sudah terdaftar.');
  const loc = requireActiveLocation({ location_id: data.location_id, location: data.location });

  const officerId = nextOfficerId();
  appendRow(SHEETS.USERS, {
    email, role: ROLE.SECURITY, name: name,
    officer_id: officerId, location_id: loc.location_id, location: loc.name, status: USER_STATUS.ACTIVE,
  });
  return { ok: true, officer_id: officerId };
}

function updateOfficer(data) {
  const row = readRows(SHEETS.USERS).find((u) => u.officer_id === data.officer_id);
  if (!row) throw new Error('Petugas tidak ditemukan: ' + data.officer_id);

  const patch = {};
  if (data.name) {
    const name = String(data.name).trim();
    if (!name) throw new Error('Nama wajib diisi.');
    patch.name = name;
  }
  if (data.email) {
    const email = normEmail(data.email);
    if (!email) throw new Error('Email wajib diisi.');
    const duplicate = readRows(SHEETS.USERS).find((u) =>
      normEmail(u.email) === email && u.officer_id !== data.officer_id);
    if (duplicate) throw new Error('Email sudah terdaftar.');
    patch.email = email;
  }
  if (data.status) patch.status = data.status;
  if (data.location_id || data.location) {
    const loc = requireActiveLocation({ location_id: data.location_id, location: data.location });
    patch.location_id = loc.location_id;
    patch.location = loc.name;
  }
  if (!Object.keys(patch).length) throw new Error('Tidak ada perubahan.');

  updateCells(SHEETS.USERS, row._row, patch);
  return { ok: true, officer_id: data.officer_id };
}

function deleteOfficer(data) {
  const row = readRows(SHEETS.USERS).find((u) =>
    u.officer_id === data.officer_id && u.role === ROLE.SECURITY);
  if (!row) throw new Error('Petugas tidak ditemukan: ' + data.officer_id);
  deleteRow(SHEETS.USERS, row._row);
  return { ok: true, officer_id: data.officer_id };
}

// ID petugas berikutnya: SEC-01, SEC-02, ... (lanjut dari nomor terbesar).
function nextOfficerId() {
  const nums = readRows(SHEETS.USERS).map((u) => String(u.officer_id))
    .filter((s) => /^SEC-\d+$/.test(s)).map((s) => parseInt(s.split('-')[1], 10));
  const max = nums.length ? Math.max.apply(null, nums) : 0;
  return 'SEC-' + String(max + 1).padStart(2, '0');
}
