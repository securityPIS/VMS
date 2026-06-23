// Login Google via GIS. Backend tetap wajib memverifikasi ID token ini.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GIS_SRC = 'https://accounts.google.com/gsi/client';

export const GOOGLE_CONFIGURED = !!CLIENT_ID;

let gisReady = null;

function loadGis() {
  if (gisReady) return gisReady;
  gisReady = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat Google Sign-In. Periksa koneksi internet.'));
    document.head.appendChild(s);
  });
  return gisReady;
}

function decodeJwtPayload(jwt) {
  const part = (jwt || '').split('.')[1];
  if (!part) throw new Error('Token Google tidak valid.');
  const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  return JSON.parse(atob(padded));
}

function parseCredential(jwt) {
  const payload = decodeJwtPayload(jwt);
  if (!payload.email) throw new Error('Token Google tidak memuat email.');
  if (payload.email_verified === false) throw new Error('Email Google belum terverifikasi.');
  return {
    email: payload.email,
    idToken: jwt,
    expiresAt: Number(payload.exp || 0) * 1000,
  };
}

export async function signInWithGoogle() {
  if (!CLIENT_ID) {
    throw new Error('Login Google belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID kosong).');
  }
  await loadGis();
  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (resp) => {
        try {
          resolve(parseCredential(resp.credential));
        } catch (err) {
          reject(err);
        }
      },
    });
    window.google.accounts.id.prompt((notif) => {
      if (notif.isNotDisplayed() || notif.isSkippedMoment()) {
        reject(new Error('Dialog Google tidak muncul. Coba lagi atau izinkan pop-up.'));
      }
    });
  });
}
