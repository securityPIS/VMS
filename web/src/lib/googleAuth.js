// Login satu tombol via Google Identity Services (GIS).
// Mengembalikan email terverifikasi dari akun Google; peran ditentukan
// terpisah oleh sistem (lihat api.getRole). Memerlukan VITE_GOOGLE_CLIENT_ID
// (OAuth 2.0 Client ID tipe Web). Docs: https://developers.google.com/identity/gsi/web
//
// Memakai alur OAuth2 popup (initTokenClient) — bukan One Tap (id.prompt).
// One Tap kerap "menggantung": setelah migrasi FedCM, moment notification
// (isNotDisplayed/isSkippedMoment) tidak lagi didukung dan One Tap bisa
// di-suppress otomatis, sehingga callback maupun reject tak pernah terpanggil
// dan tombol berhenti di status "Memproses…". Popup token client selalu
// menyelesaikan promise lewat callback atau error_callback.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export const GOOGLE_CONFIGURED = !!CLIENT_ID;

let gisReady = null;

// Muat skrip GIS sekali (idempoten).
function loadGis() {
  if (gisReady) return gisReady;
  gisReady = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
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

// Minta access token lewat popup OAuth2. Selalu resolve/reject:
// - callback   → token diterima, atau resp.error (mis. izin ditolak)
// - error_callback → popup gagal dibuka/ditutup pengguna
function requestAccessToken() {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      callback: (resp) => {
        if (resp.error) {
          reject(new Error('Login Google gagal atau izin ditolak. Coba lagi.'));
          return;
        }
        resolve(resp.access_token);
      },
      error_callback: (err) => {
        if (err?.type === 'popup_closed') {
          reject(new Error('Jendela Google ditutup sebelum selesai. Coba lagi.'));
        } else {
          reject(new Error('Pop-up Google diblokir. Izinkan pop-up lalu coba lagi.'));
        }
      },
    });
    client.requestAccessToken();
  });
}

// Tampilkan dialog Google dan resolve dengan email terverifikasi.
export async function signInWithGoogle() {
  if (!CLIENT_ID) {
    throw new Error('Login Google belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID kosong).');
  }
  await loadGis();
  const accessToken = await requestAccessToken();

  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Gagal mengambil profil Google. Coba lagi.');

  const profile = await res.json();
  if (!profile.email) throw new Error('Akun Google tidak memuat email.');
  if (profile.email_verified === false) throw new Error('Email Google belum terverifikasi.');
  return profile.email;
}
