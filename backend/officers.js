// officers.js - manajemen petugas dan daftar lokasi.

function getLocations() {
  return activeLocationRows().map((l) => ({ location_id: l.location_id, name: l.name }));
}

function getOfficers(data, authedEmail) {
  requireAdmin(authedEmail);
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

function addOfficer(data, authedEmail) {
  return withScriptLock(() => {
    requireAdmin(authedEmail);
    const email = validateEmailValue(data.email);
    const name = requiredText(data.name, 'Nama', 120);
    if (findUserByEmail(email)) throw new Error('Email sudah terdaftar.');
    const loc = requireActiveLocation({ location_id: data.location_id, location: data.location });

    const officerId = nextOfficerId();
    appendRow(SHEETS.USERS, {
      email,
      role: ROLE.SECURITY,
      name,
      officer_id: officerId,
      location_id: loc.location_id,
      location: loc.name,
      status: USER_STATUS.ACTIVE,
    });
    return { ok: true, officer_id: officerId };
  });
}

function updateOfficer(data, authedEmail) {
  return withScriptLock(() => {
    requireAdmin(authedEmail);
    const officerId = requiredText(data.officer_id, 'ID petugas', 80);
    const row = readRows(SHEETS.USERS).find((u) => u.officer_id === officerId && u.role === ROLE.SECURITY);
    if (!row) throw new Error('Petugas tidak ditemukan.');

    const patch = {};
    if (data.name) patch.name = requiredText(data.name, 'Nama', 120);
    if (data.email) {
      const email = validateEmailValue(data.email);
      const duplicate = readRows(SHEETS.USERS).find((u) =>
        normEmail(u.email) === email && u.officer_id !== officerId);
      if (duplicate) throw new Error('Email sudah terdaftar.');
      patch.email = email;
    }
    if (data.status) {
      if (data.status !== USER_STATUS.ACTIVE && data.status !== USER_STATUS.INACTIVE) {
        throw new Error('Status petugas tidak valid.');
      }
      patch.status = data.status;
    }
    if (data.location_id || data.location) {
      const loc = requireActiveLocation({ location_id: data.location_id, location: data.location });
      patch.location_id = loc.location_id;
      patch.location = loc.name;
    }
    if (!Object.keys(patch).length) throw new Error('Tidak ada perubahan.');

    updateCells(SHEETS.USERS, row._row, patch);
    return { ok: true, officer_id: officerId };
  });
}

function deleteOfficer(data, authedEmail) {
  return withScriptLock(() => {
    requireAdmin(authedEmail);
    const officerId = requiredText(data.officer_id, 'ID petugas', 80);
    const row = readRows(SHEETS.USERS).find((u) =>
      u.officer_id === officerId && u.role === ROLE.SECURITY);
    if (!row) throw new Error('Petugas tidak ditemukan.');
    deleteRow(SHEETS.USERS, row._row);
    return { ok: true, officer_id: officerId };
  });
}

function nextOfficerId() {
  const nums = readRows(SHEETS.USERS).map((u) => String(u.officer_id))
    .filter((s) => /^SEC-\d+$/.test(s)).map((s) => parseInt(s.split('-')[1], 10));
  const max = nums.length ? Math.max.apply(null, nums) : 0;
  return 'SEC-' + String(max + 1).padStart(2, '0');
}
