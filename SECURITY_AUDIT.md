# Security Audit — Visitor Management System (VMS)

**Tanggal:** 2026-06-23
**Cakupan:** Frontend React/Vite (`web/`) + backend Google Apps Script (`backend/`)
**Metode:** Review kode statik manual (whitebox) atas seluruh endpoint, model autentikasi/otorisasi, penanganan data pribadi (PII), dan konfigurasi deploy.

> **Kesimpulan eksekutif:** Aplikasi memiliki **kelemahan otorisasi yang fundamental**.
> Satu-satunya gerbang keamanan backend adalah *shared secret* yang—karena di-*inline* ke
> dalam bundle JavaScript publik—efektif **bersifat publik**. Peran (admin/security)
> ditentukan dari email yang dikirim klien **tanpa verifikasi token**. Akibatnya, **siapa
> pun di internet dapat membaca seluruh data tamu (termasuk foto KTP/selfie), menjadi admin,
> mengelola whitelist petugas, dan menghapus data**. Sebelum *go-live*, isu C1–C4 di bawah
> **wajib** ditangani.

Severity: **Critical** = eksploitasi langsung berdampak besar · **High** = dampak besar dgn syarat ringan · **Medium** = perlu kondisi tertentu · **Low/Info**.

---

## Ringkasan Temuan

| ID | Severity | Judul |
|----|----------|-------|
| C1 | 🔴 Critical | Shared secret ter-*embed* di bundle klien → gerbang auth satu-satunya jadi publik |
| C2 | 🔴 Critical | Peran ditentukan dari email klien tanpa verifikasi token (auth bypass / privilege escalation) |
| C3 | 🔴 Critical | Endpoint admin tidak punya otorisasi sama sekali (broken access control) |
| C4 | 🔴 Critical | `assertSecurityAt` bersifat opsional & sepele dilewati |
| H1 | 🟠 High | Foto KTP/selfie dapat diunduh siapa pun (`getPhoto` hanya butuh secret publik) |
| H2 | 🟠 High | PII tamu (nama, email, no. KTP) terekspos lewat endpoint tanpa otorisasi |
| H3 | 🟠 High | Tidak ada rate-limit / anti-otomasi → spam data & penyalahgunaan email (phishing) |
| M1 | 🟡 Medium | Tidak ada pembatasan asal (origin); API publik dapat dipanggil situs/skrip mana pun |
| M2 | 🟡 Medium | `uploadPhoto` tanpa batas ukuran/validasi → penyalahgunaan kuota Drive (DoS) |
| M3 | 🟡 Medium | Peran disimpan di `localStorage` & dipercaya klien |
| L1 | 🔵 Low | Pesan error membocorkan detail internal ke klien |
| L2 | 🔵 Low | `scriptId` ter-commit di `.clasp.json` |
| L3 | 🔵 Info | `executeAs: USER_DEPLOYING` — semua operasi & kuota memakai akun pemilik |

---

## Detail Temuan

### C1 — Shared secret ter-*embed* di bundle klien (gerbang auth tunggal jadi publik)
🔴 **Critical** — `web/src/lib/api.js:22`, `web/.env.example:8`, `backend/Code.js:9`, `backend/auth.js:4-8`

Backend hanya punya satu kontrol autentikasi: `verifySecret(data)` yang membandingkan
`data.secret` dengan `API_SECRET`. Secret itu di frontend diambil dari `import.meta.env.VITE_API_SECRET`:

```js
// web/src/lib/api.js
const API_SECRET = import.meta.env.VITE_API_SECRET || '';
...
body: JSON.stringify({ action, secret: API_SECRET, ...payload }),
```

Vite **meng-*inline* semua variabel `VITE_*` ke dalam bundle JS produksi** saat build. Artinya
secret tersebut terkirim ke setiap pengunjung situs Vercel dan dapat dibaca dengan membuka
DevTools / "View Source" / file `dist/assets/*.js`. Karena manifest mengizinkan
`access: ANYONE_ANONYMOUS` (`backend/appsscript.json:8`), **siapa pun yang membuka situs dapat
mengekstrak secret dan memanggil seluruh endpoint backend**. Secara efektif backend tidak
terautentikasi.

**Dampak:** Semua temuan C2–C4 dan H1–H3 menjadi dapat dieksploitasi oleh penyerang anonim.

**Rekomendasi:**
- Berhenti menjadikan shared secret sebagai mekanisme autentikasi. Shared secret yang
  dikirim ke browser **tidak pernah** rahasia.
- Ganti dengan autentikasi berbasis **Google ID token (JWT)**: lihat C2.
- Secret semacam itu hanya layak antar dua server (server-to-server), bukan browser→backend.

---

### C2 — Peran dari email klien tanpa verifikasi token (auth bypass / privilege escalation)
🔴 **Critical** — `backend/auth.js:13-38`, `backend/Code.js:30`, `web/src/lib/googleAuth.js`

`getRole` menentukan peran berdasarkan **string email yang dikirim klien**, tanpa membuktikan
bahwa pemanggil benar-benar memiliki email tersebut:

```js
function getRole(data) {
  const email = normEmail(data.email);   // ← dipercaya apa adanya
  const user = findUserByEmail(email);
  if (user) return { role: user.role, ... };  // admin / security
  ...
}
```

Login Google (OAuth) **hanya terjadi di sisi klien** (`googleAuth.js`); backend tidak pernah
menerima maupun memvalidasi token OAuth. Penyerang cukup melewati frontend dan mengirim:

```
POST <APPS_SCRIPT_URL>
{ "action": "getRole", "email": "admin@pertamina.com", "secret": "<secret publik dari C1>" }
→ { "role": "admin", ... }
```

Bahkan tanpa `getRole`, penyerang bisa langsung memanggil endpoint istimewa (lihat C3).

**Dampak:** Privilege escalation penuh ke admin/security; impersonasi siapa pun.

**Rekomendasi (perbaikan inti aplikasi):**
1. Frontend sudah mendapatkan **Google ID token** saat OAuth. Kirim **ID token (JWT)** itu ke
   backend pada tiap request, bukan sekadar string email.
2. Backend **memverifikasi JWT**: validasi signature (JWKS Google), `aud` = OAuth Client ID
   sendiri, `iss` = `accounts.google.com`, dan `exp`. Ambil email **dari token terverifikasi**,
   bukan dari `data.email`. Apps Script dapat memverifikasi via endpoint tokeninfo Google atau
   verifikasi JWT lokal.
3. Setelah email tepercaya, barulah lookup peran di sheet `Users`.

> Catatan: `web/src/lib/googleAuth.js` saat ini memakai *access token* + memanggil `userinfo`
> di sisi klien. Untuk pola di atas, minta **`id_token`** (atau verifikasi access token di
> backend ke endpoint Google) agar identitas dapat dibuktikan **server-side**.

---

### C3 — Endpoint admin tanpa otorisasi sama sekali (broken access control)
🔴 **Critical** — `backend/officers.js`, `backend/analytics.js`, `backend/Code.js:44-50`

Handler berikut **tidak memanggil cek otorisasi apa pun** (tidak ada `assertSecurityAt`, tidak
ada cek `role === admin`):

- `getOfficers`, `addOfficer`, `updateOfficer`, `deleteOfficer` (`officers.js`)
- `getDashboardStats`, `getVisitorTimeline` (`analytics.js`)
- `getHistory` memanggil `assertSecurityAt` tetapi itu pun dapat dilewati (lihat C4)

Dengan hanya bermodal secret publik (C1), penyerang anonim dapat:

- `addOfficer` → **menambahkan email-nya sendiri sebagai petugas security aktif** (membuka
  akses ke seluruh fitur security di lokasi mana pun).
- `deleteOfficer` → menghapus petugas dari whitelist (pengingkaran layanan operasional).
- `getVisitorTimeline` / `getDashboardStats` → menarik **seluruh jejak & PII tamu**.

```
POST { "action": "addOfficer", "secret": "...", "name": "x",
       "email": "attacker@evil.com", "location": "Gate Utama" }
```

**Dampak:** Kontrol akses rusak total; eskalasi privilege; pengelolaan whitelist oleh penyerang.

**Rekomendasi:** Setelah identitas terverifikasi (C2), tambahkan **otorisasi per-aksi**:
- Endpoint admin → wajib `role === 'admin'` (mis. `assertAdmin(actor)`).
- Endpoint security → wajib petugas Active pada lokasi terkait (perketat C4).
- Terapkan prinsip *deny-by-default*: setiap handler memvalidasi peran sebelum aksi.

---

### C4 — `assertSecurityAt` opsional & sepele dilewati
🔴 **Critical** — `backend/auth.js:88-106`

```js
function assertSecurityAt(data, location) {
  const actor = normEmail(data.actor_email);
  if (!actor) return;          // ← tanpa actor_email, enforcement DILEWATI total
  const user = findUserByEmail(actor);
  ...
}
```

Dua masalah:
1. **Bila `actor_email` tidak dikirim, fungsi langsung `return`** — semua enforcement lokasi
   dilewati. Penyerang cukup menghilangkan field tersebut.
2. **`actor_email` tidak diverifikasi** (sama seperti C2) — penyerang dapat mengisinya dengan
   email petugas aktif mana pun.

Akibatnya `checkIn`, `rejectVisit`, `checkOut`, `addPackage`, `pickupPackage`, `getPackages`,
`getPendingVisits`, `getActiveVisits` tidak memiliki otorisasi efektif. Hal ini bahkan
**sudah disadari** di kode:

```js
// TODO go-live: wajibkan actor_email/token terverifikasi agar enforcement penuh.
```

**Dampak:** Penyerang dapat meng-*check-in*/menolak/meng-*check-out* tamu, mengirim email atas
nama sistem, dan mengelola paket di lokasi mana pun.

**Rekomendasi:** Jadikan identitas **wajib & terverifikasi** (dari JWT, bukan field opsional).
Hapus *early-return* `if (!actor) return;`. Identitas tak ada → tolak (`throw`).

---

### H1 — Foto KTP/selfie dapat diunduh siapa pun
🟠 **High** — `backend/drive.js:23-32`, `backend/Code.js:19`, `web/src/lib/api.js:46`

`servePhoto` hanya mensyaratkan secret (yang publik, C1):

```js
function servePhoto(params) {
  if (!expected || params.secret !== expected) return jsonOutput({ error: 'Akses ditolak.' });
  const blob = DriveApp.getFileById(params.id).getBlob();   // ← id dari query string
  return jsonOutput({ ok: true, mime: ..., base64: ... });
}
```

Rantai eksploitasi PII massal:
1. Panggil `getHistory`/`getPendingVisits` (tanpa otorisasi, C3/C4) → dapatkan seluruh
   `ktp_photo_url` & `selfie_url` (ID file Drive).
2. Untuk tiap ID, panggil `GET ?action=getPhoto&id=<id>&secret=<publik>` → unduh **foto KTP &
   selfie seluruh tamu**.

Folder Drive sengaja privat (baik), tetapi gerbangnya hanya secret publik, sehingga proteksi
itu tidak berarti bagi penyerang. Foto KTP = data pribadi yang dilindungi **UU PDP**.

**Rekomendasi:** Lindungi `getPhoto` dengan identitas terverifikasi + otorisasi (hanya
security/admin, idealnya terbatas pada lokasi/kepemilikan kunjungan terkait). Hindari `doGet`
ber-secret untuk data sensitif.

---

### H2 — PII tamu terekspos lewat endpoint tanpa otorisasi
🟠 **High** — `backend/visitors.js:3-6`, `backend/visits.js:93-101`, `backend/analytics.js:45-63`

- `getVisitorByEmail` mengembalikan baris Visitor lengkap termasuk **nomor KTP** (`ktp`).
- `getHistory` / `getVisitorTimeline` mengembalikan nama, email, tujuan, keperluan seluruh tamu.

Karena endpoint ini tidak terotorisasi efektif (C3/C4) dan secret publik (C1), seluruh basis
data tamu dapat diekstrak oleh penyerang anonim → pelanggaran UU PDP & risiko reputasi.

**Rekomendasi:** Wajibkan otorisasi (C2/C3); minimisasi field yang dikembalikan
(jangan kirim no. KTP kecuali benar-benar perlu); pertimbangkan masking.

---

### H3 — Tidak ada rate-limit / anti-otomasi → spam & penyalahgunaan email
🟠 **High** — `backend/visits.js:64,80`, `backend/email.js`, `backend/visitors.js:31`

`submitVisit`, `checkIn`, `rejectVisit` tanpa autentikasi/throttling. Lebih berbahaya: `checkIn`
dan `rejectVisit` mengirim email **via `MailApp` dari akun Google pemilik** dengan **`notes`/
`reason` yang dikendalikan penyerang**:

```js
sendConfirmEmail(row, notes);   // notes → body email, dikirim "atas nama" sistem Pertamina
```

Penyerang dapat membuat kunjungan lalu memicu email berisi konten arbitrer ke alamat tamu,
menjadi **vektor phishing yang tampak resmi** (domain pengirim = akun pemilik), sekaligus
menghabiskan **kuota harian MailApp** (DoS notifikasi).

**Rekomendasi:** Otorisasi aksi (C2–C4); batasi laju per identitas/IP; sanitasi & batasi panjang
`notes`/`reason`; pertimbangkan template tetap tanpa konten bebas dari klien.

---

### M1 — Tidak ada pembatasan asal (origin)
🟡 **Medium** — `web/src/lib/api.js:27-32`, `backend/Code.js`

Body dikirim `text/plain` secara sengaja untuk menghindari *preflight* CORS. Apps Script tidak
menerapkan pembatasan origin, dan akses `ANYONE_ANONYMOUS`, sehingga endpoint dapat dipanggil
dari situs/skrip mana pun. Ini memperkuat C1–C4. (Catatan: CORS bukan kontrol auth, tetapi
ketiadaan batasan apa pun memperluas permukaan serang.)

**Rekomendasi:** Andalkan autentikasi token (C2) sebagai kontrol utama; origin check bukan
pengganti auth.

---

### M2 — `uploadPhoto` tanpa batas ukuran/validasi
🟡 **Medium** — `backend/drive.js:4-18`

`uploadPhoto` menerima base64 arbitrer tanpa autentikasi, tanpa batas ukuran, dan menyimpannya
ke Drive pemilik. Penyerang dapat membuat banyak file besar → menghabiskan **kuota Drive**
pemilik (DoS) dan menanam konten arbitrer.

**Rekomendasi:** Wajibkan auth; validasi MIME (whitelist gambar), batasi ukuran (mis. ≤ 2–5 MB),
batasi laju per identitas.

---

### M3 — Peran disimpan & dipercaya dari `localStorage`
🟡 **Medium** — `web/src/App.jsx:10-31`, `web/src/lib/api.js:114`

Objek `user` (termasuk `role`) disimpan di `localStorage` dan menentukan UI. Karena backend
tidak menegakkan peran (C3/C4), mengubah `localStorage` menjadi `role: "admin"` memuat dasbor
admin yang **berfungsi penuh**. Ini gejala dari akar masalah otorisasi server.

**Rekomendasi:** Setelah backend menegakkan otorisasi (C2/C3), UI klien tidak lagi menjadi
batas keamanan. Tetap perlakukan state klien sebagai tidak tepercaya.

---

### L1 — Pesan error membocorkan detail internal
🔵 **Low** — `backend/Code.js:13`

```js
return jsonOutput({ error: err.message || String(err) });
```

Pesan internal (nama sheet, alasan validasi, jejak) dikirim ke klien. Membantu *recon*.

**Rekomendasi:** Kembalikan pesan generik ke klien; log detail hanya di sisi server (Stackdriver).

---

### L2 — `scriptId` ter-commit
🔵 **Low** — `backend/.clasp.json:2`

`scriptId` ada di repo. Bukan rahasia mutlak, tetapi membocorkan identitas proyek Apps Script.
Pastikan repo privat atau pindahkan ke konfigurasi lokal bila repo publik.

---

### L3 — `executeAs: USER_DEPLOYING`
🔵 **Info** — `backend/appsscript.json:7`

Semua operasi (Spreadsheet, Drive, MailApp) berjalan sebagai akun pemilik. Diperlukan oleh
arsitektur, tetapi berarti **setiap penyalahgunaan memakai data, kuota, dan reputasi email
pemilik**. Memperbesar dampak H2/H3/M2.

---

## Rekomendasi Prioritas (Roadmap Remediasi)

**Sebelum go-live (wajib):**
1. **Verifikasi identitas server-side (C2):** kirim Google **ID token** dari frontend; backend
   memverifikasi JWT (signature, `aud`, `iss`, `exp`) dan mengambil email dari token.
2. **Otorisasi per-aksi (C3, C4):** `assertAdmin`/`assertSecurityActive` wajib & *deny-by-default*;
   hapus *early-return* opsional pada `assertSecurityAt`.
3. **Hentikan shared secret sebagai auth (C1):** secret di browser bukan rahasia. Auth = token.
4. **Lindungi foto & PII (H1, H2):** `getPhoto` dan endpoint data hanya untuk identitas berwenang.

**Berikutnya (tinggi):**
5. Rate-limit + sanitasi konten email (H3, M2).
6. Minimisasi data (jangan kirim no. KTP tanpa kebutuhan), masking PII.

**Pengerasan (medium/low):**
7. Pesan error generik (L1); audit log aksi sensitif; review kuota & monitoring (L3).
8. `npm audit` rutin untuk dependensi frontend.

---

## Catatan Cakupan
- Mode **mock** (frontend tanpa backend) hanya untuk dev/demo dan tidak menyentuh data nyata;
  temuan di atas berfokus pada **mode backend (produksi)**.
- Tidak ditemukan: `.env`/kredensial yang ter-commit (✅ `.gitignore` benar), `eval`/`innerHTML`
  berbahaya di frontend (✅), atau SQL injection (tidak ada SQL — penyimpanan via Spreadsheet).
- Audit ini statik; disarankan pengujian dinamis (DAST) setelah remediasi C1–C4.
</content>
</invoke>
