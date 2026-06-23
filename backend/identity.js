// identity.js - verifikasi Google ID token di backend Apps Script.

function verifyIdToken(data) {
  const token = String((data && data.id_token) || '').trim();
  if (!token) throw new Error('Token Google wajib dikirim.');

  const cached = readCachedIdentity(token);
  if (cached && cached.email) return cached.email;

  const clientId = PROP.getProperty(PROP_KEYS.GOOGLE_CLIENT_ID);
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID belum diset di Script Properties.');

  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token);
  const res = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Token Google tidak valid.');

  let claims;
  try {
    claims = JSON.parse(res.getContentText() || '{}');
  } catch (err) {
    throw new Error('Respons verifikasi token tidak valid.');
  }

  validateGoogleClaims(claims, clientId);
  const email = normEmail(claims.email);
  cacheIdentity(token, email, Number(claims.exp || 0));
  return email;
}

function validateGoogleClaims(claims, clientId) {
  const issuer = String(claims.iss || '');
  const validIssuer = issuer === 'accounts.google.com' || issuer === 'https://accounts.google.com';
  if (!validIssuer) throw new Error('Issuer token tidak valid.');
  if (String(claims.aud || '') !== String(clientId)) throw new Error('Audience token tidak valid.');
  if (!claims.email) throw new Error('Token tidak memuat email.');
  if (String(claims.email_verified) !== 'true') throw new Error('Email Google belum terverifikasi.');
  const exp = Number(claims.exp || 0);
  if (!exp || exp <= Math.floor(Date.now() / 1000)) throw new Error('Token Google sudah kedaluwarsa.');
}

function identityCacheKey(token) {
  return 'idtok:' + sha256Hex(token).slice(0, 40);
}

function readCachedIdentity(token) {
  const raw = CacheService.getScriptCache().get(identityCacheKey(token));
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value.exp && Number(value.exp) <= Math.floor(Date.now() / 1000)) return null;
    return value;
  } catch (err) {
    return null;
  }
}

function cacheIdentity(token, email, exp) {
  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = Math.max(30, Math.min(3300, Number(exp || 0) - nowSec - 30));
  CacheService.getScriptCache().put(identityCacheKey(token), JSON.stringify({ email, exp }), ttl);
}

function sha256Hex(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value));
  const out = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const v = b < 0 ? b + 256 : b;
    out.push(('0' + v.toString(16)).slice(-2));
  }
  return out.join('');
}
