# Product Requirements Document (PRD)
## Visitor Management System (VMS) — Pertamina (operasi keamanan SmartPatrol)

| | |
|---|---|
| **Versi Dokumen** | 1.3 |
| **Tanggal** | 19 Juni 2026 |
| **Status** | Draft |
| **Pemilik Produk** | Bayu / Pertamina (operasi keamanan SmartPatrol) |
| **Identitas Brand** | Mengikuti Manual Logo Corporate Pertamina (warna & logo resmi). Detail penerapan UI di dokumen UI/UX Design Requirements. |
| **Stack Teknologi** | React (Frontend) + Google Apps Script (Backend API) + Google Spreadsheet (Database) + Google Drive (Storage) + Vercel (Deployment) |

### Riwayat Perubahan (Changelog)

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.2 | 19 Jun 2026 | Foto KTP+selfie wajib, retensi 1 bulan, kepatuhan UU PDP. |
| **1.3** | **19 Jun 2026** | **Sinkronisasi dengan prototype. Menambahkan ke scope v1: (1) Manajemen Paket & Kiriman, (2) Multi-lokasi/Gate, (3) Manajemen & Assignment Petugas, (4) Dashboard Analitik + Jejak Visitor. Perluasan model data, API, dan layar UI mengikuti fitur tersebut.** |

---

## 1. Ringkasan (Overview)

Visitor Management System (VMS) adalah aplikasi web untuk mengelola alur kunjungan tamu di lokasi yang dijaga petugas security. Sistem ini menggantikan buku tamu manual dengan proses digital: tamu mengisi form via Google Auth, petugas security melakukan verifikasi dan check-in/check-out, serta sistem mengirim notifikasi email otomatis.

### 1.1 Tujuan
- Mendigitalkan dan mempercepat proses registrasi tamu.
- Menjaga keamanan dengan mekanisme tukar KTP ↔ kartu visitor.
- Memberikan jejak audit (audit trail) setiap kunjungan.
- Mengurangi gesekan untuk tamu yang sudah pernah berkunjung (returning visitor).

### 1.2 Lingkup (Scope)
**Termasuk (v1):**
- Registrasi tamu, login Google, approval security, check-in/check-out, notifikasi email, reservasi tamu lama, dashboard security.
- **Manajemen Paket & Kiriman** — security mencatat paket/titipan kurir yang masuk dan menandai saat diambil penerima.
- **Multi-lokasi / Gate** — sistem mendukung beberapa titik jaga (mis. Gate Utama, Lobi Resepsionis, Gate Logistik). Setiap kunjungan & petugas terkait dengan satu lokasi.
- **Manajemen & Assignment Petugas** — admin menambah/menonaktifkan akun petugas security dan menetapkan lokasi penugasannya.
- **Dashboard Analitik & Jejak Visitor** — admin melihat statistik kunjungan (tren, distribusi tujuan) dan rekam jejak per-visitor (timeline kunjungan).

**Tidak termasuk (v1):** integrasi hardware (printer kartu, scanner KTP), pembayaran, multi-bahasa selain Bahasa Indonesia, aplikasi mobile native, face match otomatis, notifikasi penerima paket otomatis (email/WA), penjadwalan shift petugas.

---

## 2. Peran Pengguna (User Roles)

| Peran | Deskripsi | Akses |
|---|---|---|
| **Visitor (Tamu)** | Orang yang berkunjung, login via Google Auth, mengisi form/reservasi. | Form registrasi, status kunjungan sendiri |
| **Security (Petugas)** | Memverifikasi data, approve/reject, check-in/check-out, mengelola kartu visitor, **mencatat paket masuk**. Bertugas di **satu lokasi** tertentu. | Dashboard antrean, tamu aktif, paket, riwayat (lokasi tugasnya) |
| **Admin** | Mengelola data master, **mengelola akun & assignment petugas**, melihat **dashboard analitik & jejak visitor**, ekspor data. | Semua data lintas lokasi, konfigurasi sistem |

---

## 3. Alur Pengguna (User Flow)

### 3.1 Tamu Baru (First-time Visitor)
1. Tamu membuka aplikasi → klik **Login dengan Google**.
2. Sistem mengambil **nama** dari profil Google (auto-generate, **editable**).
3. Tamu mengisi form:
   - Nama (auto, editable)
   - Nomor KTP
   - Asal / Instansi (darimana)
   - Keperluan
   - Tujuan (nama orang yang dituju)
   - **Foto KTP (wajib)** — diambil via kamera/upload
   - **Foto Selfie (wajib)** — diambil via kamera depan
4. Foto diunggah ke **Google Drive**, sistem menyimpan URL/file ID.
5. Tamu submit → status menjadi **PENDING**.
6. Tamu menunggu verifikasi security.

### 3.2 Tamu Lama (Returning Visitor)
1. Tamu **Login dengan Google**.
2. Sistem mendeteksi email sudah terdaftar → menampilkan data tersimpan (nama, KTP, instansi).
3. Tamu cukup mengisi **form reservasi kunjungan baru** (keperluan + tujuan).
4. **Selfie tetap wajib** diambil ulang setiap kunjungan (verifikasi kehadiran orang yang sama). Foto KTP tidak perlu diunggah ulang karena sudah tersimpan.
5. Submit → status **PENDING**.

### 3.3 Verifikasi & Check-in (Security)
1. Security membuka dashboard → melihat antrean tamu **PENDING**.
2. Security memeriksa kelengkapan data tamu, **termasuk mencocokkan foto KTP dan foto selfie** dengan tamu yang hadir.
3. **Jika valid:** Security klik **Check-in** → memasukkan **Nomor Kartu Visitor** (kartu ditukar dengan KTP fisik tamu) → status **CHECKED_IN**.
4. **Jika tidak valid:** Security klik **Reject** → **wajib mengisi alasan penolakan** → status **REJECTED** → sistem kirim **email notifikasi** ke tamu berisi alasan.

### 3.4 Check-out (Security)
1. Saat tamu pulang, security meminta **kartu visitor** dikembalikan.
2. Security mengembalikan **KTP** ke tamu.
3. Security klik **Check-out** → status **CHECKED_OUT** → waktu keluar tercatat.

### 3.5 Paket & Kiriman (Security)
1. Kurir/ekspedisi datang membawa paket untuk karyawan internal.
2. Security klik **Registrasi Paket** → mengisi: pengirim/ekspedisi, penerima (nama/departemen), jenis barang, **foto barang/resi (opsional)** → status **RECEIVED** (di pos security).
3. Saat penerima mengambil, security klik **Tandai Diambil** → status **PICKED_UP**, waktu pengambilan tercatat.

> Catatan: notifikasi otomatis ke penerima (email/WA) **tidak termasuk v1**; pemberitahuan dilakukan manual.

### 3.6 Manajemen Petugas (Admin)
1. Admin membuka **Assignment Petugas** → melihat daftar petugas + lokasi + status.
2. Admin **menambah petugas** (nama, email, lokasi) → otomatis masuk whitelist role `security`.
3. Admin dapat **menonaktifkan/mengaktifkan** petugas (petugas nonaktif tidak bisa login).

---

## 4. Status Kunjungan (State Machine)

```
PENDING ──approve──> CHECKED_IN ──checkout──> CHECKED_OUT
   │
   └──reject (wajib alasan)──> REJECTED ──> [Email ke Visitor]
```

| Status | Deskripsi | Aksi Selanjutnya |
|---|---|---|
| `PENDING` | Menunggu verifikasi | Check-in / Reject |
| `CHECKED_IN` | Tamu sedang di dalam, kartu diberikan | Check-out |
| `CHECKED_OUT` | Tamu sudah pulang, KTP dikembalikan | Selesai |
| `REJECTED` | Ditolak, alasan tercatat, email terkirim | Selesai |

### 4.1 Status Paket

```
RECEIVED ──ambil──> PICKED_UP
```

| Status | Deskripsi | Aksi Selanjutnya |
|---|---|---|
| `RECEIVED` | Paket diterima & disimpan di pos security | Tandai Diambil |
| `PICKED_UP` | Paket sudah diambil penerima | Selesai |

---

## 5. Kebutuhan Fungsional (Functional Requirements)

### 5.1 Autentikasi
- **FR-01** Sistem menyediakan login menggunakan Google OAuth.
- **FR-02** Sistem membedakan tamu baru vs tamu lama berdasarkan email Google.
- **FR-03** Peran Security & Admin ditentukan melalui whitelist email di spreadsheet.

### 5.2 Registrasi Tamu
- **FR-04** Nama tamu auto-generate dari profil Google namun dapat diedit.
- **FR-05** Field wajib: Nama, KTP, Asal, Keperluan, Tujuan.
- **FR-06** Validasi nomor KTP (16 digit angka).
- **FR-07** Tamu lama tidak perlu mengisi ulang data identitas, cukup reservasi baru.

### 5.2a Foto KTP & Selfie
- **FR-07a** Tamu baru **wajib** mengunggah/mengambil **foto KTP** dan **foto selfie** saat registrasi.
- **FR-07b** Foto selfie **wajib diambil ulang setiap kunjungan** (termasuk tamu lama) untuk verifikasi kehadiran.
- **FR-07c** Foto disimpan di **Google Drive** dalam folder terstruktur; sistem menyimpan file ID/URL di spreadsheet.
- **FR-07d** Foto selfie sebaiknya diambil langsung via kamera (bukan hanya upload galeri) untuk mencegah penyalahgunaan.
- **FR-07e** Security dapat melihat foto KTP & selfie di dashboard saat verifikasi.

### 5.2b Persetujuan (Consent)
- **FR-07f** Sebelum submit, tamu **wajib menyetujui** pemrosesan data pribadi (nama, KTP, foto KTP, selfie) via checkbox consent yang tertaut ke kebijakan privasi (lihat Section 15).

### 5.3 Verifikasi & Check-in
- **FR-08** Security melihat daftar tamu PENDING secara real-time.
- **FR-09** Check-in mewajibkan input Nomor Kartu Visitor.
- **FR-10** Satu nomor kartu tidak boleh dipakai dua tamu aktif (validasi duplikat).

### 5.4 Penolakan (Rejection)
- **FR-11** Reject mewajibkan pengisian alasan penolakan.
- **FR-12** Sistem mengirim email otomatis ke tamu berisi alasan penolakan.

### 5.5 Check-out
- **FR-13** Check-out mencatat timestamp keluar.
- **FR-14** Kartu visitor menjadi tersedia kembali setelah check-out.

### 5.6 Notifikasi Email
- **FR-15** Email dikirim via `MailApp`/`GmailApp` pada Apps Script saat reject (dan opsional saat approve).

### 5.7 Multi-lokasi / Gate
- **FR-16** Sistem memiliki daftar lokasi/gate (master `Locations`).
- **FR-17** Setiap kunjungan menyimpan **lokasi** tempat tamu diproses.
- **FR-18** Setiap petugas security ditugaskan pada **satu lokasi**; antrean & tamu aktif yang ia lihat difilter sesuai lokasinya.
- **FR-19** Admin melihat data lintas semua lokasi.

### 5.8 Manajemen Paket & Kiriman
- **FR-20** Security dapat meregistrasi paket masuk: pengirim/ekspedisi (wajib), penerima (wajib), jenis barang, foto barang/resi (opsional), lokasi (otomatis dari lokasi petugas).
- **FR-21** Paket baru berstatus `RECEIVED`; security dapat mengubah menjadi `PICKED_UP` saat diambil.
- **FR-22** Foto paket disimpan di Google Drive (folder paket), URL/file ID disimpan di spreadsheet.
- **FR-23** Daftar paket dapat difilter per status & lokasi.

### 5.9 Manajemen & Assignment Petugas
- **FR-24** Admin dapat menambah petugas (nama, email, lokasi) — email otomatis masuk whitelist role `security`.
- **FR-25** Admin dapat mengaktifkan/menonaktifkan petugas; petugas `Inactive` tidak dapat login/diproses sebagai security.
- **FR-26** Admin dapat mengubah lokasi penugasan petugas.

### 5.10 Dashboard Analitik & Jejak Visitor
- **FR-27** Admin melihat ringkasan metrik: total tamu (bulan ini), tamu selesai hari ini, kunjungan ditolak.
- **FR-28** Admin melihat grafik tren kunjungan (mingguan) dan distribusi tujuan/departemen.
- **FR-29** Admin melihat **jejak per-visitor**: data tamu + timeline seluruh kunjungannya (tanggal, status, tujuan, keperluan, lokasi), dengan pencarian nama/instansi.
- **FR-30** Statistik dihitung di backend (agregasi) atau di frontend dari data yang diambil; data sensitif tidak diekspos ke peran non-admin.

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kode | Kebutuhan |
|---|---|
| NFR-01 | Frontend di-deploy di Vercel, responsif (mobile & desktop). |
| NFR-02 | Apps Script di-deploy sebagai Web App (`doGet`/`doPost`) dengan akses "Anyone". |
| NFR-03 | Waktu respons API < 3 detik untuk operasi umum. |
| NFR-04 | Data KTP disimpan aman; akses spreadsheet dibatasi. |
| NFR-05 | Endpoint diamankan dengan token/secret antara React dan Apps Script. |
| NFR-06 | Antarmuka berbahasa Indonesia. |
| NFR-07 | Retensi data: data kunjungan & foto (KTP/selfie) disimpan maksimal **1 bulan**, lalu diarsipkan/dihapus otomatis (mis. trigger terjadwal Apps Script). Foto paket mengikuti retensi yang sama. |
| NFR-08 | Filter berbasis lokasi tidak boleh membocorkan data lokasi lain ke petugas yang tidak berwenang (enforce di backend, bukan hanya UI). |

---

## 7. Arsitektur Sistem

```
┌─────────────┐      HTTPS/JSON       ┌──────────────────┐
│   React App  │ ───────────────────> │  Google Apps     │
│   (Vercel)   │ <─────────────────── │  Script Web App  │
└─────────────┘                       └────────┬─────────┘
       │                                        │
       │ Google OAuth                           │
       ▼                                        ▼
┌─────────────┐                       ┌──────────────────┐
│   Google     │                       │ Google Spreadsheet│
│   Identity   │                       │   (Database)      │
└─────────────┘                       ├──────────────────┤
                                       │ Google Drive      │
                                       │ (Foto/Lampiran)   │
                                       └──────────────────┘
```

**Catatan keamanan:** Google OAuth token sebaiknya diverifikasi. Karena Apps Script Web App "Anyone" tidak otomatis mengetahui user, kirim Google ID token dari React dan verifikasi di Apps Script, atau gunakan shared secret + email dari sesi Google login frontend.

---

## 8. Model Data (Spreadsheet Schema)

### Sheet: `Visitors` (master tamu)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `visitor_id` | string | ID unik (UUID) |
| `email` | string | Email Google (kunci tamu lama) |
| `nama` | string | Nama tamu |
| `ktp` | string | Nomor KTP (16 digit) |
| `asal` | string | Instansi/asal |
| `ktp_photo_url` | string | URL/file ID foto KTP di Google Drive |
| `created_at` | datetime | Tanggal daftar pertama |

### Sheet: `Visits` (transaksi kunjungan)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `visit_id` | string | ID unik kunjungan |
| `visitor_id` | string | Relasi ke Visitors |
| `email` | string | Email tamu |
| `nama` | string | Nama saat kunjungan |
| `keperluan` | string | Keperluan kunjungan |
| `tujuan` | string | Orang yang dituju |
| `location` | string | Lokasi/gate tempat tamu diproses (relasi ke `Locations`) |
| `selfie_url` | string | URL/file ID foto selfie kunjungan ini di Google Drive |
| `status` | enum | PENDING / CHECKED_IN / CHECKED_OUT / REJECTED |
| `card_number` | string | Nomor kartu visitor |
| `reject_reason` | string | Alasan penolakan |
| `security_email` | string | Petugas yang memproses |
| `created_at` | datetime | Waktu submit |
| `checkin_at` | datetime | Waktu check-in |
| `checkout_at` | datetime | Waktu check-out |

### Sheet: `Users` (whitelist peran & data petugas)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `email` | string | Email user (kunci) |
| `role` | enum | security / admin |
| `name` | string | Nama petugas/admin |
| `officer_id` | string | ID petugas (mis. `SEC-01`), untuk role security |
| `location` | string | Lokasi penugasan (relasi ke `Locations`), untuk role security |
| `status` | enum | Active / Inactive (petugas Inactive tidak bisa login) |

> Sheet `Users` sekaligus menjadi sumber data **Assignment Petugas** di panel admin (baris ber-`role=security`).

### Sheet: `Locations` (master lokasi/gate)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `location_id` | string | ID unik lokasi |
| `name` | string | Nama lokasi (mis. "Gate Utama", "Lobi Resepsionis") |
| `active` | boolean | Lokasi aktif/tidak |

### Sheet: `Packages` (paket & kiriman)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `package_id` | string | ID unik paket (mis. `PKG-101`) |
| `sender` | string | Pengirim/ekspedisi (mis. JNE, Gojek) |
| `recipient` | string | Penerima (nama/departemen) |
| `type` | string | Jenis barang (Dokumen, Kardus, Makanan, Lainnya) |
| `photo_url` | string | URL/file ID foto barang/resi di Google Drive (opsional) |
| `status` | enum | RECEIVED / PICKED_UP |
| `location` | string | Lokasi pos penerima (relasi ke `Locations`) |
| `security_email` | string | Petugas yang mencatat |
| `received_at` | datetime | Waktu paket diterima |
| `picked_up_at` | datetime | Waktu paket diambil |

---

## 9. Spesifikasi API (Apps Script Endpoints)

Semua request melalui `doPost` dengan parameter `action`. Format respons JSON.

| Action | Peran | Deskripsi | Payload Utama |
|---|---|---|---|
| `getVisitorByEmail` | Visitor | Cek tamu lama/baru | `email` |
| `uploadPhoto` | Visitor/Security | Upload foto (KTP/selfie/paket) ke Drive | `base64`, `type`, `email` |
| `submitVisit` | Visitor | Submit kunjungan/reservasi | data form + URL foto + `location` |
| `getRole` | Semua | Ambil peran + lokasi + status user | `email` |
| `getLocations` | Semua | Daftar lokasi/gate aktif | — |
| `getPendingVisits` | Security | Antrean PENDING (difilter lokasi petugas) | `location` |
| `getActiveVisits` | Security | Tamu CHECKED_IN (difilter lokasi) | `location` |
| `checkIn` | Security | Approve + nomor kartu (validasi unik) | `visit_id`, `card_number` |
| `rejectVisit` | Security | Tolak + alasan + email | `visit_id`, `reason` |
| `checkOut` | Security | Catat keluar | `visit_id` |
| `addPackage` | Security | Registrasi paket masuk | `sender`, `recipient`, `type`, `photo_url?`, `location` |
| `getPackages` | Security | Daftar paket (filter status/lokasi) | `status?`, `location?` |
| `pickupPackage` | Security | Tandai paket diambil | `package_id` |
| `getHistory` | Admin | Riwayat kunjungan lengkap | filter tanggal/lokasi |
| `getDashboardStats` | Admin | Metrik & data grafik (tren, distribusi) | filter periode |
| `getVisitorTimeline` | Admin | Jejak per-visitor (grouped) | `search?` |
| `getOfficers` | Admin | Daftar petugas + lokasi + status | — |
| `addOfficer` | Admin | Tambah petugas (→ whitelist security) | `name`, `email`, `location` |
| `updateOfficer` | Admin | Ubah status/lokasi petugas | `officer_id`, `status?`, `location?` |

---

## 10. Antarmuka Pengguna (UI Screens)

| Layar | Peran | Komponen Utama |
|---|---|---|
| Halaman Login | Semua | Tombol Login Google |
| Form Registrasi | Visitor (baru) | Field nama, KTP, asal, keperluan, tujuan + **capture foto KTP & selfie** |
| Form Reservasi | Visitor (lama) | Field keperluan, tujuan + **capture selfie** |
| Status Kunjungan | Visitor | Badge status, alasan reject jika ada |
| Dashboard Antrean | Security | Kartu PENDING, **preview foto KTP & selfie**, tombol Check-in/Reject |
| Tamu Aktif | Security | Tabel CHECKED_IN, tombol Check-out |
| Paket & Kiriman | Security | Tabel paket, tombol Registrasi Paket, Tandai Diambil |
| Modal Check-in | Security | Input nomor kartu |
| Modal Reject | Security | Textarea alasan (wajib) |
| Modal Registrasi Paket | Security | Pengirim, penerima, jenis, foto paket (opsional) |
| Dashboard Analitik | Admin | Kartu metrik + grafik tren (bar) & distribusi tujuan (pie) |
| Assignment Petugas | Admin | Kartu petugas, tambah, aktif/nonaktif, lokasi |
| Jejak Visitor | Admin | Pencarian + kartu visitor dengan timeline kunjungan |
| Riwayat & Laporan | Admin | Tabel + filter + ekspor (CSV) |

---

## 11. Notifikasi Email

| Pemicu | Penerima | Isi |
|---|---|---|
| Reject | Visitor | Pemberitahuan ditolak + **alasan penolakan** |
| Approve/Check-in (opsional) | Visitor | Konfirmasi kunjungan disetujui |

Dikirim menggunakan `MailApp.sendEmail()` di Google Apps Script.

---

## 12. Rencana Implementasi (Milestones)

| Fase | Deliverable | Estimasi |
|---|---|---|
| **Fase 1** | Setup spreadsheet (semua sheet), Apps Script Web App, Google OAuth | 1 minggu |
| **Fase 2** | Frontend React: login + form tamu baru/lama (+ kamera & upload) | 1 minggu |
| **Fase 3** | Dashboard security: antrean (filter lokasi), check-in, reject, check-out | 1 minggu |
| **Fase 4** | Modul Paket & Kiriman (security) + notifikasi email reject | 1 minggu |
| **Fase 5** | Panel admin: assignment petugas, dashboard analitik, jejak visitor, ekspor CSV | 1 minggu |
| **Fase 6** | Multi-lokasi end-to-end, validasi, retensi otomatis (UU PDP) | 3–5 hari |
| **Fase 7** | Deploy Vercel, UAT, perbaikan, pelatihan petugas | 3–5 hari |

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Apps Script Web App publik tanpa auth kuat | Data bocor | Verifikasi Google ID token + shared secret |
| Spreadsheet sebagai DB punya limit kuota | Lambat saat data besar | Arsip berkala, paginasi |
| Kartu visitor duplikat aktif | Salah identifikasi | Validasi `card_number` unik untuk status aktif |
| Data KTP sensitif | Pelanggaran privasi | Batasi akses sheet, jangan tampilkan KTP penuh di UI publik |
| Foto KTP & selfie sensitif (data pribadi) | Pelanggaran privasi/UU PDP | Folder Drive privat (tidak public-link), akses terbatas role security/admin, retensi 1 bulan lalu data & foto diarsipkan/dihapus otomatis |
| Ukuran/format foto besar | Upload lambat, kuota Drive | Kompres gambar di sisi React sebelum upload, batasi resolusi/ukuran |
| Foto selfie dari galeri (bukan kamera live) | Pemalsuan identitas | Gunakan `capture="user"` pada input kamera, idealnya kamera live in-app |

---

## 14. Metrik Keberhasilan (Success Metrics)
- ≥ 90% kunjungan diproses tanpa buku manual.
- Waktu rata-rata check-in < 1 menit.
- 0 kasus kartu/KTP tertukar karena sistem.
- 100% penolakan disertai alasan dan email terkirim.

---

## 15. Kepatuhan UU PDP (Perlindungan Data Pribadi)

VMS memproses data pribadi (nama, NIK/KTP, foto KTP, foto selfie, email) sehingga tunduk pada **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**, yang berlaku penuh sejak 17 Oktober 2024 setelah masa transisi dua tahun. SmartPatrol/operator lokasi berperan sebagai **Pengendali Data Pribadi**.

### 15.1 Batasan & Kewajiban Sistem

| Prinsip UU PDP | Penerapan di VMS |
|---|---|
| **Persetujuan (consent)** | Tamu harus menyetujui pemrosesan data (nama, KTP, foto KTP, selfie) sebelum submit. Tampilkan checkbox consent + tautan kebijakan privasi. |
| **Tujuan terbatas** | Data hanya digunakan untuk verifikasi & pencatatan kunjungan, tidak untuk tujuan lain (mis. marketing). |
| **Minimalisasi data** | Hanya mengumpulkan data yang diperlukan untuk keamanan kunjungan. |
| **Pembatasan akses** | Foto KTP/selfie & NIK hanya dapat dilihat role security/admin; folder Drive privat (tanpa public-link). |
| **Retensi terbatas** | Data & foto disimpan maksimal **1 bulan**, lalu dihapus/diarsipkan otomatis (lihat NFR-07). |
| **Hak subjek data** | Tamu berhak meminta akses, koreksi, dan penghapusan datanya. Sediakan kanal permintaan (mis. email kontak). |
| **Keamanan** | Endpoint diamankan token/secret; data sensitif tidak ditaruh di URL; transmisi via HTTPS. |
| **Notifikasi pelanggaran** | Jika terjadi kebocoran data, wajib lapor ke subjek data & lembaga pengawas dalam **paling lama 72 jam**. |

### 15.2 Kondisi yang Dapat Menimbulkan Pelanggaran

Berikut praktik yang **harus dihindari** karena dapat dikategorikan pelanggaran UU PDP:

1. **Mengumpulkan data tanpa consent** — memproses KTP/selfie tanpa persetujuan eksplisit tamu.
2. **Foto KTP/selfie dapat diakses publik** — mis. folder Drive ber-link "anyone with the link" atau URL foto terindeks/terbuka.
3. **Menyimpan data melebihi kebutuhan/retensi** — menyimpan foto KTP & data tamu lebih dari periode yang ditetapkan (1 bulan) tanpa dasar hukum.
4. **Akses tidak terkontrol** — spreadsheet/Drive dapat dibuka pihak di luar role security/admin, atau tanpa log akses.
5. **Penggunaan di luar tujuan** — memakai data tamu untuk keperluan selain verifikasi kunjungan.
6. **Transmisi tidak aman** — mengirim NIK/foto melalui parameter URL, channel non-HTTPS, atau pihak ketiga yang tidak terikat perjanjian.
7. **Tidak menghapus data atas permintaan** — mengabaikan permintaan penghapusan/koreksi dari subjek data.
8. **Tidak melaporkan kebocoran** — gagal memberi tahu subjek data & lembaga pengawas dalam 72 jam saat terjadi insiden.
9. **Membagikan data ke pihak ketiga tanpa dasar** — meneruskan data tamu tanpa persetujuan atau dasar hukum yang sah.

### 15.3 Konsekuensi Pelanggaran

Pelanggaran dapat dikenai sanksi administratif berupa denda hingga 2% dari pendapatan tahunan, dan untuk pelanggaran serius (mis. pemalsuan data) dapat dikenai pidana penjara hingga 6 tahun serta denda hingga Rp 6 miliar. Subjek data yang dirugikan juga dapat mengajukan gugatan perdata.

> **Catatan:** Section ini bersifat panduan teknis-operasional, bukan nasihat hukum. Untuk kepatuhan formal (mis. penyusunan kebijakan privasi resmi atau penunjukan DPO bila relevan), disarankan konsultasi dengan ahli hukum perlindungan data.

---


1. ~~Apakah perlu upload foto tamu / foto KTP ke Google Drive?~~ **✓ Diputuskan: foto KTP + selfie WAJIB, disimpan di Google Drive.**
2. ~~Saat approve, apakah kirim email konfirmasi?~~ **✓ Diputuskan: approve disamakan dengan aksi check-in (PENDING → CHECKED_IN dalam satu aksi).**
3. ~~Apakah perlu QR code untuk check-out mandiri?~~ **✓ Diputuskan: TIDAK. Check-out tetap dilakukan oleh security untuk memastikan visitor mengembalikan kartu visitor (ditukar kembali dengan KTP).**
4. ~~Berapa lama data kunjungan & foto disimpan?~~ **✓ Diputuskan: retensi 1 bulan, setelah itu data kunjungan & foto diarsipkan/dihapus.**
5. ~~Apakah perlu face match otomatis selfie vs KTP?~~ **✓ Diputuskan: TIDAK. Verifikasi visual dilakukan manual oleh security.**
