// validation.js - validasi input dan helper keamanan umum.

function stripControlChars(value) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
}

function requiredText(value, label, maxLen) {
  const out = stripControlChars(value);
  if (!out) throw new Error(label + ' wajib diisi.');
  if (out.length > maxLen) throw new Error(label + ' terlalu panjang.');
  return out;
}

function optionalText(value, label, maxLen) {
  const out = stripControlChars(value);
  if (out.length > maxLen) throw new Error(label + ' terlalu panjang.');
  return out;
}

function validateEmailValue(value) {
  const email = normEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email tidak valid.');
  if (email.length > 254) throw new Error('Email terlalu panjang.');
  return email;
}

function validateKtp(value) {
  const ktp = String(value || '').replace(/\D/g, '');
  if (!/^\d{16}$/.test(ktp)) throw new Error('Nomor KTP wajib 16 digit.');
  return ktp;
}

function validatePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) throw new Error('Nomor telepon wajib diisi.');
  if (digits.length < 9 || digits.length > 16) throw new Error('Nomor telepon tidak valid (9-16 digit).');
  return digits;
}

function maskKtp(value) {
  const ktp = String(value || '').replace(/\D/g, '');
  if (!ktp) return '';
  return '*'.repeat(Math.max(0, ktp.length - 4)) + ktp.slice(-4);
}

function publicVisitor(row) {
  if (!row) return null;
  return {
    visitor_id: row.visitor_id,
    email: row.email,
    nama: row.nama,
    ktp_masked: maskKtp(row.ktp),
    asal: row.asal,
    created_at: row.created_at,
  };
}

function hasLocationRef(ref) {
  return !!(ref && (ref.location_id || ref.location));
}

function withScriptLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}
