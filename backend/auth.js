// auth.js - resolusi peran dan otorisasi berbasis email yang sudah diverifikasi.

function getRole(data, authedEmail) {
  const email = validateEmailValue(authedEmail);
  const user = findUserByEmail(email);
  if (user) {
    if (String(user.status) === USER_STATUS.INACTIVE) {
      throw new Error('Akun petugas nonaktif. Hubungi admin.');
    }
    const assignedLocation = resolveLocationForUser(user);
    return {
      role: user.role,
      name: user.name,
      email,
      officer_id: user.officer_id,
      location_id: assignedLocation.location_id,
      location: assignedLocation.name,
    };
  }

  const visitor = findVisitorByEmail(email);
  if (visitor) {
    return { role: ROLE.VISITOR, type: 'returning', name: visitor.nama, email, asal: visitor.asal };
  }
  return { role: ROLE.VISITOR, type: 'new', name: nameFromEmail(email), email };
}

function findUserByEmail(email) {
  return readRows(SHEETS.USERS).find((u) => normEmail(u.email) === normEmail(email)) || null;
}

function findVisitorByEmail(email) {
  return readRows(SHEETS.VISITORS).find((v) => normEmail(v.email) === normEmail(email)) || null;
}

function normEmail(x) { return String(x || '').trim().toLowerCase(); }
function normText(x) { return String(x || '').trim().toLowerCase(); }

function nameFromEmail(email) {
  const local = (String(email || '').split('@')[0] || 'Tamu').replace(/[._-]+/g, ' ').trim();
  return local.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Tamu';
}

function isActiveLocationRow(row) {
  return row && (row.active === true || String(row.active).toUpperCase() === 'TRUE');
}

function activeLocationRows() {
  return readRows(SHEETS.LOCATIONS).filter(isActiveLocationRow);
}

function findActiveLocation(ref) {
  const locationId = normText(ref && ref.location_id);
  const locationName = normText(ref && ref.location);
  if (!locationId && !locationName) return null;
  return activeLocationRows().find((l) =>
    (locationId && normText(l.location_id) === locationId) ||
    (locationName && normText(l.name) === locationName)
  ) || null;
}

function requireActiveLocation(ref) {
  const location = findActiveLocation(ref);
  if (!location) throw new Error('Lokasi penugasan tidak valid atau tidak aktif.');
  return { location_id: location.location_id, name: location.name };
}

function resolveLocationForUser(user) {
  const active = findActiveLocation({ location_id: user.location_id, location: user.location });
  if (active) return { location_id: active.location_id, name: active.name };
  return { location_id: user.location_id || '', name: user.location || '' };
}

function requireUser(authedEmail) {
  const user = findUserByEmail(validateEmailValue(authedEmail));
  if (!user || String(user.status) === USER_STATUS.INACTIVE) throw new Error('Akses ditolak.');
  return user;
}

function requireAdmin(authedEmail) {
  const user = requireUser(authedEmail);
  if (user.role !== ROLE.ADMIN) throw new Error('Akses ditolak.');
  return user;
}

function isAdminEmail(authedEmail) {
  const user = findUserByEmail(normEmail(authedEmail));
  return !!(user && user.role === ROLE.ADMIN && String(user.status) !== USER_STATUS.INACTIVE);
}

function requireSecurityScope(authedEmail, ref) {
  const user = requireUser(authedEmail);
  if (user.role === ROLE.ADMIN) {
    return {
      user,
      isAdmin: true,
      location: hasLocationRef(ref) ? requireActiveLocation(ref).name : '',
    };
  }
  if (user.role !== ROLE.SECURITY) throw new Error('Akses ditolak.');

  const assigned = resolveLocationForUser(user);
  if (!assigned.location_id && !assigned.name) throw new Error('Lokasi petugas belum valid.');

  if (!hasLocationRef(ref)) {
    return { user, isAdmin: false, location: assigned.name };
  }

  const requested = requireActiveLocation(ref);
  const sameId = assigned.location_id && requested.location_id && normText(assigned.location_id) === normText(requested.location_id);
  const sameName = normText(assigned.name) === normText(requested.name);
  if (!sameId && !sameName) throw new Error('Akses ditolak: lokasi di luar penugasan Anda.');
  return { user, isAdmin: false, location: requested.name };
}

function requireVisitAccess(authedEmail, visitRow) {
  if (!visitRow) throw new Error('Kunjungan tidak ditemukan.');
  if (normEmail(visitRow.email) === normEmail(authedEmail)) return { role: ROLE.VISITOR };
  return requireSecurityScope(authedEmail, { location: visitRow.location });
}

function canAccessPhotoForLocation(authedEmail, location) {
  try {
    requireSecurityScope(authedEmail, { location });
    return true;
  } catch (err) {
    return false;
  }
}
