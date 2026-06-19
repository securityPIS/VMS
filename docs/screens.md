# Layar (`src/screens/`)

Layar level-atas untuk peran Visitor (dan halaman login bersama).

## `LoginScreen.jsx` 🟡
Halaman masuk (UIUX 5.1). **Satu metode auth: "Masuk dengan Google".**
- Props: `onLogin(userData)`.
- Alur: tombol Google → `signInWithGoogle()` (email terverifikasi) → `api.getRole(email)`
  → `onLogin(user)`. **Tidak ada pemilihan peran manual** — sistem yang menentukan
  tamu baru/lama, security, atau admin dari email.
- Email petugas security berasal dari **assignment admin** (panel admin →
  `OfficerAssignmentTab`/`AddOfficerModal`); itulah yang dikenali `getRole` sebagai security.
- `userData` membawa `role`, `type` (new/returning), `name`, `email`, `location` (security), `asal` (tamu lama).
- 🟡 **Mode demo (USE_MOCK):** panel di bawah tombol Google untuk masuk sebagai
  tiap peran (preset + input email bebas) tanpa OAuth asli. Sembunyi otomatis saat
  backend aktif.
- ⏳ **Sisa go-live:** isi `VITE_GOOGLE_CLIENT_ID` agar tombol Google berfungsi nyata.

## `VisitorFormScreen.jsx` ✅
Form registrasi tamu baru / reservasi tamu lama (UIUX 5.2–5.3).
- Props: `user`, `onSubmit({ visitId, status, tujuan })`.
- Tamu **baru**: nama, KTP (16 digit), asal, **lokasi/gerbang**, tujuan, keperluan,
  foto KTP, selfie, consent. Tamu **lama**: lokasi, tujuan, keperluan, selfie, consent.
- Lokasi diisi dari `api.getLocations` (fallback `LOCATIONS`) — menentukan antrean
  petugas mana yang menerima kunjungan.
- Foto via `PhotoCapture` (kamera+kompres). Submit: unggah foto (`api.uploadPhoto`)
  lalu `api.submitVisit`; ada state `submitting` & `error`.

## `VisitorStatusScreen.jsx` ✅
Status kunjungan tamu (UIUX 5.4).
- Props: `statusData` (`{ visitId, status, tujuan, rejectReason }`), `onLogout`.
- Menampilkan PENDING / CHECKED_IN / CHECKED_OUT / REJECTED dengan ikon + warna.
- **Polling** `api.getVisitStatus(visitId)` tiap 5 dtk sampai status final
  (REJECTED/CHECKED_OUT) agar tamu tak perlu reload.
