# Security Remediation Plan — Visitor Management System (VMS)

**Tanggal:** 2026-06-23
**Dasar:** Temuan pada `SECURITY_AUDIT.md` (C1–C4, H1–H3, M1–M3, L1–L3)
**Tujuan:** Menutup celah otorisasi fundamental sebelum *go-live* dan mengeraskan aplikasi.

> **Prinsip perbaikan inti:** Hentikan ketergantungan pada *shared secret* di browser.
> Pindahkan **autentikasi ke server** (verifikasi Google ID token) dan terapkan
> **otorisasi per-aksi** (deny-by-default). Setelah ini, UI klien & `localStorage`
> tidak lagi menjadi batas keamanan.

---

## Ringkasan Fase

| Fase | Fokus | Temuan ditutup | Estimasi |
|------|-------|----------------|----------|
| **0** | Persiapan & rotasi kredensial | — | 0.5 hari |
| **1** | Autentikasi server-side (verifikasi JWT) | C1, C2 | 1.5 hari |
| **2** | Otorisasi per-aksi (deny-by-default) | C3, C4, M3 | 1.5 hari |
| **3** | Proteksi PII: foto & data tamu | H1, H2 | 1 hari |
| **4** | Anti-abuse: rate-limit, validasi, sanitasi email | H3, M2 | 1 hari |
| **5** | Pengerasan: error handling, origin, logging, deps | M1, L1–L3 | 0.5 hari |
| **6** | Verifikasi & uji keamanan | semua | 1 hari |

Estimasi total: ± **7 hari kerja** (1 engineer).

---

## Fase 0 — Persiapan & Rotasi Kredensial

**Sasaran:** Hentikan kebocoran aktif sebelum refactor.

- [ ] **Rotasi `API_SECRET`** di Script Properties (yang lama sudah bocor ke bundle publik bila pernah di-deploy).
- [ ] **Batasi OAuth Client ID**: di Google Cloud Console, set *Authorized JavaScript origins* hanya ke domain Vercel produksi (mis. `https://vms.pertamina.app`) — tutup penyalahgunaan Client ID dari origin lain.
- [ ] **Pastikan repo privat** (mengandung `scriptId`, `.clasp.json`).
- [ ] Buat branch kerja `claude/security-fix-*` dan checklist PR mengacu ke temuan.
- [ ] Backup spreadsheet & folder Drive foto sebelum perubahan.

**Acceptance:** Secret lama tidak berlaku; origin OAuth terbatas; backup tersedia.

---

## Fase 1 — Autentikasi Server-Side (verifikasi Google ID token) — **C1, C2**

**Sasaran:** Backend membuktikan identitas pemanggil dari token, bukan dari string email.

### 1a. Frontend — kirim ID token (bukan hanya email)
File: `web/src/lib/googleAuth.js`, `web/src/lib/api.js`

- [ ] Ubah alur OAuth agar memperoleh **`id_token` (JWT)**, bukan sekadar access token + userinfo.
  - Opsi A (disarankan): gunakan **Google Identity Services — ID token flow** (`google.accounts.id.initialize` + callback `credential`) yang mengembalikan JWT.
  - Opsi B: tetap pakai access token, tapi backend yang memverifikasi access token ke endpoint Google (lihat 1b opsi B).
- [ ] Simpan token di memori/`sessionStorage` (bukan menaruh role tepercaya di `localStorage`).
- [ ] `api.post()` menyertakan `id_token` pada setiap request:
  ```js
  body: JSON.stringify({ action, id_token: getIdToken(), ...payload })
  ```
- [ ] **Hapus `VITE_API_SECRET` dari frontend** dan dari `body` request. Secret tidak lagi dikirim browser.

### 1b. Backend — verifikasi token & turunkan identitas tepercaya
File baru: `backend/identity.js`; ubah `backend/Code.js`, `backend/auth.js`

- [ ] Tambah `verifyIdToken(data)` yang:
  - Mengambil `data.id_token`.
  - **Opsi A (verifikasi JWT):** ambil JWKS Google (cache via `CacheService`), verifikasi signature RS256, lalu validasi klaim: `iss ∈ {accounts.google.com, https://accounts.google.com}`, `aud === GOOGLE_CLIENT_ID`, `exp > now`, `email_verified === true`.
  - **Opsi B (tokeninfo):** `UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token)` lalu validasi `aud` & `exp`. Lebih sederhana, ada latensi jaringan; cache hasil per token (CacheService) untuk mengurangi round-trip.
  - Mengembalikan **email terverifikasi** (`getAuthedEmail(data)`); `throw` bila tidak valid.
- [ ] Simpan `GOOGLE_CLIENT_ID` di **Script Properties** (bukan hardcode).
- [ ] `doPost` memanggil `verifyIdToken` **menggantikan** `verifySecret` sebagai gerbang utama:
  ```js
  function doPost(e) {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    const authedEmail = getAuthedEmail(data);   // throw jika token tidak valid
    const result = dispatch(data.action, data, authedEmail);
    ...
  }
  ```
- [ ] `getRole` mengambil email **dari `authedEmail`**, bukan `data.email`.

### 1c. Endpoint publik tamu (tanpa login penuh)
Beberapa aksi tamu mungkin tetap perlu jalur ringan (mis. `getVisitStatus` saat polling). Putuskan eksplisit:
- [ ] `submitVisit`, `getVisitStatus`, `uploadPhoto`, `getRole` → **wajib ID token tamu** (Google login tamu sudah ada di alur). Tetap verifikasi token, peran "visitor" diberikan setelah email terverifikasi.
- [ ] Tidak ada lagi jalur "secret-only" yang melewati verifikasi identitas.

**Acceptance:**
- Request tanpa `id_token` valid → ditolak (`401`-equivalent / `{error}`).
- `getRole` dengan token milik admin → role admin; dengan email admin dipalsukan di body tapi token bukan admin → bukan admin.
- `VITE_API_SECRET` tidak lagi ada di bundle (`grep` pada `dist/`).

---

## Fase 2 — Otorisasi Per-Aksi (deny-by-default) — **C3, C4, M3**

**Sasaran:** Setiap handler memvalidasi peran/lokasi dari identitas tepercaya.

File: `backend/auth.js`, `backend/Code.js`, masing-masing handler.

- [ ] Tambah helper berbasis `authedEmail` (bukan `data.actor_email` opsional):
  ```js
  function requireUser(authedEmail) {
    const u = findUserByEmail(normEmail(authedEmail));
    if (!u || String(u.status) === USER_STATUS.INACTIVE)
      throw new Error('Akses ditolak.');
    return u;
  }
  function requireAdmin(authedEmail) {
    const u = requireUser(authedEmail);
    if (u.role !== ROLE.ADMIN) throw new Error('Akses ditolak: butuh admin.');
    return u;
  }
  function requireSecurityAt(authedEmail, location) {
    const u = requireUser(authedEmail);
    if (u.role === ROLE.ADMIN) return u;            // admin boleh semua lokasi
    if (u.role !== ROLE.SECURITY) throw new Error('Akses ditolak.');
    const assigned = resolveLocationForUser(u);
    const requested = requireActiveLocation({ location_id: ..., location });
    if (assigned.location_id !== requested.location_id)
      throw new Error('Akses ditolak: di luar lokasi penugasan.');
    return u;
  }
  ```
- [ ] **Hapus `assertSecurityAt` lama** (yang punya `if (!actor) return;`) dan ganti seluruh pemanggilan dengan `requireSecurityAt(authedEmail, ...)`.
- [ ] Petakan otorisasi tiap endpoint (lihat tabel di bawah).
- [ ] `dispatch(action, data, authedEmail)` meneruskan `authedEmail` ke handler.
- [ ] M3: Karena server kini menegakkan peran, manipulasi `localStorage` di klien tidak lagi memberi akses nyata. Tetap **jangan** mempercayai role dari klien untuk keputusan apa pun.

### Matriks Otorisasi Endpoint

| Endpoint | Peran minimum | Catatan |
|----------|---------------|---------|
| `getRole` | tamu terverifikasi | email dari token |
| `submitVisit`, `uploadPhoto`, `getVisitStatus` | tamu terverifikasi (pemilik) | `getVisitStatus`: batasi ke pemilik visit |
| `getLocations` | tamu terverifikasi | data non-sensitif |
| `getPendingVisits`, `getActiveVisits`, `checkIn`, `rejectVisit`, `checkOut` | security@lokasi / admin | `requireSecurityAt` |
| `addPackage`, `getPackages`, `pickupPackage` | security@lokasi / admin | `requireSecurityAt` |
| `getHistory` | security@lokasi / admin | filter lokasi sesuai penugasan |
| `getDashboardStats`, `getVisitorTimeline` | **admin** | `requireAdmin` |
| `getOfficers`, `addOfficer`, `updateOfficer`, `deleteOfficer` | **admin** | `requireAdmin` |

**Acceptance:** Pemanggilan endpoint admin oleh non-admin → ditolak; security hanya bisa beroperasi di lokasi penugasannya; tidak ada handler tanpa cek otorisasi.

---

## Fase 3 — Proteksi PII: Foto & Data Tamu — **H1, H2**

**Sasaran:** Foto KTP/selfie & PII hanya untuk identitas berwenang; minimisasi data.

File: `backend/drive.js`, `backend/Code.js`, `backend/visitors.js`, `backend/visits.js`.

- [ ] **`getPhoto` (servePhoto)**: hentikan akses berbasis secret. Wajibkan identitas terverifikasi (security/admin), idealnya terbatas pada visit/lokasi yang berkaitan dengan foto.
  - Karena `doGet` sulit menerima token via body, pertimbangkan **pindahkan `getPhoto` ke `doPost`** (action `getPhoto` dengan `id_token`), lalu frontend `RemotePhoto`/`fetchPhoto` memakai POST.
- [ ] **Validasi kepemilikan foto**: pastikan `id` yang diminta memang tercatat sebagai `ktp_photo_url`/`selfie_url` pada baris Visit/Visitor yang boleh diakses pemanggil (mencegah enumerasi ID Drive arbitrer).
- [ ] **Minimisasi data (H2):**
  - `getVisitorByEmail` & endpoint riwayat: **jangan kirim nomor KTP** kecuali benar-benar diperlukan; bila perlu untuk verifikasi, **mask** (mis. `••••••••1234`).
  - Kembalikan hanya field yang dipakai UI.
- [ ] Pastikan kebijakan retensi (`retention.js`, 30 hari) tetap berjalan & terjadwal.

**Acceptance:** `getPhoto` tanpa identitas berwenang → ditolak; ID acak yang tak berelasi → ditolak; respons tidak memuat no. KTP penuh.

---

## Fase 4 — Anti-Abuse: Rate-limit, Validasi, Sanitasi Email — **H3, M2**

File: `backend/visits.js`, `backend/email.js`, `backend/drive.js`, helper baru `backend/ratelimit.js`.

- [ ] **Rate-limit per identitas** menggunakan `CacheService` (mis. token bucket sederhana: N aksi / menit per email). Terapkan pada `submitVisit`, `uploadPhoto`, `checkIn`, `rejectVisit`.
- [ ] **Validasi `uploadPhoto` (M2):**
  - Whitelist MIME gambar (`image/jpeg|png|webp`).
  - Batas ukuran terdekode (mis. ≤ 3 MB) — tolak bila lebih.
- [ ] **Sanitasi konten email (H3):**
  - Batasi panjang `notes`/`reason` (mis. ≤ 500 char) dan strip karakter kontrol.
  - Pertimbangkan template tetap; perlakukan input bebas sebagai teks (sudah plain-text body — pastikan tidak pindah ke HTML email tanpa escaping).
  - Karena email memakai akun pemilik (reputasi), pertimbangkan footer disclaimer & monitoring kuota MailApp.

**Acceptance:** Upload non-gambar/oversize ditolak; lonjakan request dibatasi; email tidak bisa membawa konten arbitrer berbahaya.

---

## Fase 5 — Pengerasan — **M1, L1, L2, L3**

- [ ] **L1 — Error generik ke klien:** `doPost`/`doGet` kembalikan pesan umum (`{error:'Permintaan tidak dapat diproses.'}`); log detail via `console.error`/Stackdriver. Jangan bocorkan `err.message` mentah.
- [ ] **M1 — Origin:** andalkan token sebagai kontrol utama; opsional, tolak request bila `Origin`/referer tak dikenal (best-effort, bukan pengganti auth).
- [ ] **L2 — `scriptId`:** pastikan repo privat; pertimbangkan memindahkan `.clasp.json` ke konfigurasi lokal bila repo akan dipublik.
- [ ] **L3 — `executeAs`:** dokumentasikan bahwa operasi memakai kuota/akun pemilik; aktifkan monitoring kuota Drive/Mail.
- [ ] **Dependensi frontend:** jalankan `npm audit` dan perbarui paket rentan.

**Acceptance:** Tidak ada kebocoran detail error; `npm audit` bersih (atau ter-triage).

---

## Fase 6 — Verifikasi & Uji Keamanan

- [ ] **Uji negatif (harus DITOLAK):**
  - Request tanpa `id_token` / token kedaluwarsa / `aud` salah.
  - `getRole`/aksi admin dengan email admin dipalsukan di body tapi token non-admin.
  - `addOfficer`/`deleteOfficer`/`getVisitorTimeline` oleh non-admin.
  - `checkIn`/`getPackages` oleh security di luar lokasi penugasan.
  - `getPhoto` dengan ID Drive acak / tanpa identitas berwenang.
  - `uploadPhoto` file non-gambar / oversize; banjir request (rate-limit).
- [ ] **Uji positif (alur normal tetap jalan):** tamu submit → security check-in/reject/checkout → admin kelola petugas & dashboard.
- [ ] **Verifikasi build:** `grep -r "VITE_API_SECRET" web/dist` → kosong; tidak ada secret di bundle.
- [ ] Update `SYSTEM_MAP.md` & `docs/backend.md` sesuai model auth baru.
- [ ] (Disarankan) DAST/pentest ringan setelah remediasi C1–C4.

---

## Ringkasan Berkas yang Disentuh

| Berkas | Perubahan |
|--------|-----------|
| `backend/Code.js` | Gerbang `verifyIdToken`; teruskan `authedEmail`; error generik |
| `backend/identity.js` *(baru)* | Verifikasi Google ID token (JWKS/tokeninfo) + cache |
| `backend/auth.js` | `requireUser/requireAdmin/requireSecurityAt`; hapus `assertSecurityAt` opsional |
| `backend/visits.js`, `packages.js`, `analytics.js`, `officers.js`, `visitors.js` | Pasang cek otorisasi; minimisasi PII |
| `backend/drive.js` | `getPhoto` ber-otorisasi + validasi kepemilikan + validasi upload |
| `backend/ratelimit.js` *(baru)* | Rate-limit via CacheService |
| `backend/email.js` | Sanitasi & batasi panjang konten |
| `backend/config.js` | Tambah `PROP_KEYS.GOOGLE_CLIENT_ID` |
| `web/src/lib/googleAuth.js` | Alur ID token (JWT) |
| `web/src/lib/api.js` | Kirim `id_token`; hapus `VITE_API_SECRET` |
| `web/src/App.jsx` | Jangan percayai role dari `localStorage` untuk keputusan keamanan |

---

## Definisi Selesai (Go-Live Gate)

1. ✅ Tidak ada secret/auth-bypass di bundle klien (`VITE_API_SECRET` dihapus).
2. ✅ Semua endpoint memverifikasi **Google ID token** server-side.
3. ✅ Setiap aksi memiliki **otorisasi peran/lokasi** (deny-by-default).
4. ✅ Foto KTP/selfie & PII hanya untuk identitas berwenang; no. KTP di-mask.
5. ✅ Rate-limit + validasi upload + sanitasi email aktif.
6. ✅ Seluruh uji negatif pada Fase 6 lulus (akses ilegal ditolak).
</content>
