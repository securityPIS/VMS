// Login satu tombol via Google Identity Services (GIS).
// Mengembalikan email terverifikasi dari ID token Google; peran ditentukan
// terpisah oleh sistem (lihat api.getRole). Memerlukan VITE_GOOGLE_CLIENT_ID
// (OAuth 2.0 Client ID tipe Web). Docs: https://developers.google.com/identity/gsi/web

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GIS_SRC = 'https://accounts.google.com/gsi/client';

export const GOOGLE_CONFIGURED = !!CLIENT_ID;

let gisReady = null;

// Muat skrip GIS sekali (idempoten).
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

// Ambil email dari payload JWT ID token (email bersifat ASCII → atob aman).
function emailFromCredential(jwt) {
  const part = (jwt || '').split('.')[1];
  if (!part) throw new Error('Token Google tidak valid.');
  const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  if (!payload.email) throw new Error('Token Google tidak memuat email.');
  if (payload.email_verified === false) throw new Error('Email Google belum terverifikasi.');
  return payload.email;
}

// Tampilkan dialog Google dan resolve dengan email terverifikasi.
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
          resolve(emailFromCredential(resp.credential));
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
