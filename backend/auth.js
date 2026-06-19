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
    return { role: user.role, name: user.name, email, officer_id: user.officer_id, location: user.location };
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

function nameFromEmail(email) {
  const local = (email.split('@')[0] || 'Tamu').replace(/[._-]+/g, ' ').trim();
  return local.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Tamu';
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
  if (location && normEmail(user.location) !== normEmail(location)) {
    throw new Error('Akses ditolak: lokasi di luar penugasan Anda.');
  }
}
