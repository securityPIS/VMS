// Login Google via GIS. Backend tetap wajib memverifikasi ID token ini.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GIS_SRC = 'https://accounts.google.com/gsi/client';

export const GOOGLE_CONFIGURED = !!CLIENT_ID;

let gisReady = null;
let activeCredentialHandler = null;
let activeErrorHandler = null;

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

function ensureConfigured() {
  if (!CLIENT_ID) {
    throw new Error('Login Google belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID kosong).');
  }
}

export async function renderGoogleSignInButton(container, onCredential, onError) {
  ensureConfigured();
  if (!container) return null;
  await loadGis();
  activeCredentialHandler = onCredential;
  activeErrorHandler = onError;
  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    ux_mode: 'popup',
    callback: (resp) => {
      try {
        if (!resp?.credential) throw new Error('Token Google tidak diterima.');
        activeCredentialHandler(parseCredential(resp.credential));
      } catch (err) {
        if (activeErrorHandler) activeErrorHandler(err);
      }
    },
  });
  container.innerHTML = '';
  window.google.accounts.id.renderButton(container, {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    shape: 'pill',
    text: 'signin_with',
    logo_alignment: 'center',
    width: Math.max(240, Math.round(container.getBoundingClientRect().width || 360)),
    locale: 'id',
  });
  return () => {
    if (activeCredentialHandler === onCredential) activeCredentialHandler = null;
    if (activeErrorHandler === onError) activeErrorHandler = null;
    container.innerHTML = '';
  };
}
