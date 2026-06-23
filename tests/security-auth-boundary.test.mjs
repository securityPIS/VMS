import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');

test('frontend does not ship shared backend secret or actor_email trust input', () => {
  const api = read('web', 'src', 'lib', 'api.js');
  const env = read('web', '.env.example');

  assert.doesNotMatch(api, /VITE_API_SECRET|API_SECRET|secret:\s*API_SECRET|getPhoto\?action|actor_email/);
  assert.doesNotMatch(env, /VITE_API_SECRET|API_SECRET/);
  assert.match(api, /id_token:\s*getIdToken\(\)/);
  assert.match(api, /post\('getPhoto',\s*\{\s*photo_id:/);
});

test('Apps Script router verifies Google ID token before dispatch', () => {
  const code = read('backend', 'Code.js');

  assert.match(code, /const authedEmail = verifyIdToken\(data\)/);
  assert.match(code, /enforceRateLimit\(data\.action,\s*authedEmail\)/);
  assert.match(code, /dispatch\(data\.action,\s*data,\s*authedEmail\)/);
  assert.doesNotMatch(code, /verifySecret|secret/);
});

test('admin and security handlers enforce server-side authorization', () => {
  const auth = read('backend', 'auth.js');
  const officers = read('backend', 'officers.js');
  const analytics = read('backend', 'analytics.js');
  const visits = read('backend', 'visits.js');
  const packages = read('backend', 'packages.js');

  assert.match(auth, /function requireAdmin/);
  assert.match(auth, /function requireSecurityScope/);
  assert.doesNotMatch(auth, /assertSecurityAt/);
  assert.match(officers, /requireAdmin\(authedEmail\)/);
  assert.match(analytics, /requireAdmin\(authedEmail\)/);
  assert.match(visits, /requireSecurityScope\(authedEmail/);
  assert.match(packages, /requireSecurityScope\(authedEmail/);
});

test('photo access is POST-tokenized and tied to owned rows', () => {
  const drive = read('backend', 'drive.js');
  const code = read('backend', 'Code.js');
  const doGetBody = code.match(/function doGet\(\) \{([\s\S]*?)\n\}/)?.[1] || '';

  assert.match(code, /case 'getPhoto': return getPhoto\(data,\s*authedEmail\)/);
  assert.doesNotMatch(doGetBody, /getPhoto|servePhoto|parameter/);
  assert.match(drive, /function getPhoto\(data,\s*authedEmail\)/);
  assert.match(drive, /findPhotoAccess\(photoId\)/);
  assert.match(drive, /canReadPhotoAccess\(authedEmail,\s*access\)/);
  assert.match(drive, /MAX_PHOTO_BYTES/);
});

test('Vercel security headers include CSP and browser hardening', () => {
  const vercel = read('web', 'vercel.json');

  assert.match(vercel, /Content-Security-Policy/);
  assert.match(vercel, /X-Content-Type-Options/);
  assert.match(vercel, /Referrer-Policy/);
  assert.match(vercel, /Permissions-Policy/);
  assert.match(vercel, /frame-ancestors 'none'/);
});
