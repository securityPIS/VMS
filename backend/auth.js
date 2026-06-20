// auth.js — keamanan endpoint (NFR-05), resolusi peran (getRole), & enforce lokasi (NFR-08).

// Verifikasi shared secret pada setiap request POST.
function verifySecret(data) {
  const expected = PROP.getProperty(PROP_KEYS.API_SECRET);
  if (!expected) throw new Error('API_SECRET belum diset di Script Properties.');
  if (!data || data.secret !== expected) throw new Error('Akses ditolak: secret tidak valid.');
}

// getRole(email): peran ditentukan sistem dari email.
// Urutan: Users (admin/security) → Visitors (tamu lama) → tamu baru.
// Mencerminkan resolveRoleFromEmail di frontend (mock).
function getRole(data) {
  const email = normEmail(data.email);
  if (!email) throw new Error('Email wajib diisi.');

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
  return readRows(SHEETS.USERS).find((u) => normEmail(u.email) === email) || null;
}
function findVisitorByEmail(email) {
  return readRows(SHEETS.VISITORS).find((v) => normEmail(v.email) === email) || null;
}

function normEmail(x) { return String(x || '').trim().toLowerCase(); }
function normText(x) { return String(x || '').trim().toLowerCase(); }

function nameFromEmail(email) {
  const local = (email.split('@')[0] || 'Tamu').replace(/[._-]+/g, ' ').trim();
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

// NFR-08: jika request menyertakan `actor_email` (identitas petugas), pastikan ia
// petugas Active pada lokasi yang diminta. Tanpa actor_email (fase mock), dilewati.
// TODO go-live: wajibkan actor_email/token terverifikasi agar enforcement penuh.
function assertSecurityAt(data, location) {
  const actor = normEmail(data.actor_email);
  if (!actor) return;
  const user = findUserByEmail(actor);
  if (!user || user.role !== ROLE.SECURITY || String(user.status) === USER_STATUS.INACTIVE) {
    throw new Error('Akses ditolak: bukan petugas aktif.');
  }
  const assigned = resolveLocationForUser(user);
  const requested = findActiveLocation({ location_id: data.location_id, location: location || data.location });
  if (requested && assigned.location_id && assigned.location_id === requested.location_id) return;
  if ((data.location_id || location || data.location) && normText(assigned.name) !== normText(location || data.location)) {
    throw new Error('Akses ditolak: lokasi di luar penugasan Anda.');
  }
}
