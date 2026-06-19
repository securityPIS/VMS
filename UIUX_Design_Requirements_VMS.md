# UI/UX Design Requirements
## Visitor Management System (VMS) — Pertamina (operasi keamanan SmartPatrol)

| | |
|---|---|
| **Versi Dokumen** | 1.1 |
| **Tanggal** | 19 Juni 2026 |
| **Status** | Draft |
| **Terkait** | PRD Visitor Management System v1.3 |
| **Platform** | Web Responsive (mobile-first), deploy Vercel |

> **Perubahan v1.1:** Menambahkan spesifikasi layar untuk fitur baru (sinkron dengan prototype & PRD v1.3): **Paket & Kiriman** (security), **Dashboard Analitik**, **Assignment Petugas**, dan **Jejak Visitor** (admin), serta indikator status paket dan konteks **multi-lokasi**.

---

## 1. Prinsip Desain (Design Principles)

| Prinsip | Penjelasan |
|---|---|
| **Mobile-first** | Tamu mayoritas mengisi via HP; layout diutamakan untuk layar kecil, lalu ditingkatkan ke desktop. |
| **Cepat & minim friksi** | Alur tamu (terutama tamu lama) harus selesai dalam ≤ 1 menit. Hindari langkah yang tidak perlu. |
| **Jelas & berbahasa Indonesia** | Semua label, instruksi, dan pesan error dalam Bahasa Indonesia yang lugas. |
| **Trust & transparansi** | Tampilkan consent dan tujuan pengambilan data (foto KTP/selfie) secara jelas demi kepatuhan UU PDP. |
| **Status selalu terlihat** | Tamu & security selalu tahu posisi proses (PENDING/CHECKED_IN/dst.) melalui badge & warna. |
| **Aksi destruktif aman** | Reject, hapus, dan checkout butuh konfirmasi; aksi wajib (alasan reject, nomor kartu) tidak bisa dilewati. |

---

## 2. Target Pengguna & Konteks Pemakaian

| Pengguna | Perangkat utama | Konteks |
|---|---|---|
| **Visitor (Tamu)** | Smartphone | Mengisi di lobi/pos satpam, mungkin terburu-buru, koneksi bervariasi. |
| **Security (Petugas)** | Tablet / desktop di pos | Memproses banyak tamu, butuh tampilan ringkas & cepat di-tap. |
| **Admin** | Desktop | Melihat laporan & data, butuh tabel & filter. |

---

## 3. Identitas Visual (Visual Identity)

> **Penggunaan logo (sesuai Manual Logo Corporate Pertamina):** Gunakan **logo/signature resmi Pertamina** apa adanya. Aturan wajib:
> - Versi **full colour pada background putih** adalah opsi utama dan dipakai bila memungkinkan (mis. halaman login & header dengan latar terang).
> - Versi **reversed white** dipakai di background gelap (mis. header dashboard security berlatar gelap), pastikan kontras cukup.
> - **Jangan** mengubah proporsi, warna, atau elemen logo; **jangan** memberi outline, **efek halo/glow**, bayangan dekoratif, atau menempatkan logo di atas pattern/foto yang mengurangi keterbacaan.
> - Pastikan kontras latar memadai untuk legibilitas.


### 3.1 Warna
Mengacu **brand guideline resmi Pertamina** (Manual Logo Corporate Pertamina). Warna identitas Pertamina: merah, biru, hijau, dan hitam. Nilai RGB di bawah diambil dari nilai *monitor* pada manual; untuk cetak gunakan referensi Pantone resmi.

| Token | Hex | Pantone | RGB | Penggunaan |
|---|---|---|---|---|
| `--pertamina-red` | `#BA313B` | 186C | R186 G49 B59 | Aksen merah identitas |
| `--pertamina-blue` | `#3C6DB2` | 2935C | R60 G109 B178 | Aksen biru identitas |
| `--pertamina-green` | `#ADC52D` | 383C | R173 G197 B45 | Aksen hijau identitas |
| `--pertamina-black` | `#101410` | Black 3C | R16 G20 B16 | Teks gelap / black |
| `--color-primary` | `#3C6DB2` | — | — | Warna primer UI (biru Pertamina) — tombol primer, link |
| `--color-bg-light` | `#ffffff` | — | — | Background terang — form tamu (ruang putih bersih, sesuai guideline) |
| `--color-success` | `#22c55e` | — | — | Status CHECKED_IN / berhasil |
| `--color-warning` | `#f59e0b` | — | — | Status PENDING / menunggu |
| `--color-danger` | `#ef4444` | — | — | Status REJECTED / aksi destruktif |
| `--color-neutral` | `#64748b` | — | — | Status CHECKED_OUT / teks sekunder |
| `--color-text` | `#101410` | — | — | Teks utama |

> **Catatan kepatuhan brand:**
> - Warna status (hijau/kuning/merah untuk PENDING/CHECKED_IN/dst.) bersifat **fungsional** dan terpisah dari warna identitas Pertamina, agar tidak mengaburkan makna brand.
> - Untuk **cetak**, selalu rujuk swatch Pantone resmi pada manual — nilai RGB di atas hanya untuk tampilan layar.
> - **Ruang putih (white space)** adalah elemen penting identitas Pertamina; jaga tampilan bersih dan tidak ramai.

### 3.2 Tipografi
- **Font:** Inter / system-ui (mudah dibaca, gratis, performa baik).
- **Skala:** H1 24–28px, H2 20px, Body 16px, Caption 13px.
- **Berat:** Body 400, label/penegasan 600, heading 700.
- Ukuran font input minimal **16px** agar tidak auto-zoom di iOS.

### 3.3 Komponen & Spasi
- **Grid:** 8px base spacing.
- **Sudut:** radius 8–12px (kartu, tombol, input).
- **Target tap:** minimum **44×44px** untuk semua elemen interaktif.
- **Elevasi:** kartu dengan shadow halus; tombol primer memakai warna primer (biru Pertamina). Hindari efek glow/halo pada logo (dilarang oleh brand guideline).

---

## 4. Status & Indikator Visual

| Status | Warna | Label UI | Ikon (Lucide) |
|---|---|---|---|
| `PENDING` | Kuning (`--color-warning`) | "Menunggu Verifikasi" | `clock` |
| `CHECKED_IN` | Hijau (`--color-success`) | "Sedang Berkunjung" | `log-in` |
| `CHECKED_OUT` | Abu (`--color-neutral`) | "Selesai" | `log-out` |
| `REJECTED` | Merah (`--color-danger`) | "Ditolak" | `x-circle` |

Badge status ditampilkan sebagai pill berwarna dengan ikon + teks, konsisten di semua layar.

**Status paket:**

| Status | Warna | Label UI | Ikon (Lucide) |
|---|---|---|---|
| `RECEIVED` | Kuning (`--color-warning`) | "Di Pos Security" | `package` |
| `PICKED_UP` | Hijau (`--color-success`) | "Sudah Diambil" | `check-circle` |

---

## 5. Spesifikasi Layar (Screen Specifications)

### 5.1 Login
- **Logo Pertamina** di tengah atas — gunakan signature resmi versi *full colour pada background putih* (opsi utama sesuai manual). Jangan dimodifikasi.
- Judul singkat: "Sistem Manajemen Tamu".
- Satu tombol besar: **"Masuk dengan Google"** (ikon Google + teks).
- Footer kecil: tautan kebijakan privasi.
- **State:** loading saat proses OAuth, error jika gagal login.

### 5.2 Form Registrasi — Tamu Baru
Susunan vertikal, satu kolom, mobile-first:
1. Sapaan: "Halo, [Nama]" (dari Google).
2. **Nama** — terisi otomatis, dapat diedit (ikon pensil).
3. **Nomor KTP** — input numerik, validasi 16 digit, keyboard angka.
4. **Asal / Instansi** — input teks.
5. **Keperluan** — input teks / textarea.
6. **Tujuan (orang yang dituju)** — input teks (idealnya autocomplete bila ada daftar).
7. **Foto KTP** — tombol "Ambil/Unggah Foto KTP", preview thumbnail setelah diambil.
8. **Foto Selfie** — tombol "Ambil Selfie" (buka kamera depan, `capture="user"`), preview thumbnail.
9. **Checkbox consent** — "Saya setuju data saya diproses sesuai kebijakan privasi" (tautan).
10. Tombol **Kirim** (disabled hingga field wajib & consent terisi).

**Catatan UX:**
- Validasi inline real-time (mis. KTP < 16 digit → pesan langsung di bawah field).
- Kompres gambar di sisi klien sebelum unggah; tampilkan progress upload.
- Tampilkan ringkasan "tujuan pengambilan foto" agar tamu paham (kepatuhan UU PDP).

### 5.3 Form Reservasi — Tamu Lama
- Tampilkan data tersimpan (nama, instansi) sebagai ringkasan read-only (dengan opsi "Ubah" bila perlu).
- Field aktif: **Keperluan**, **Tujuan**.
- **Foto Selfie wajib diambil ulang** setiap kunjungan.
- Checkbox consent (ringkas, karena identitas sudah tersimpan).
- Tombol **Kirim Reservasi**.

### 5.4 Status Kunjungan — Visitor
- Kartu status besar dengan badge berwarna + ikon (lihat Section 4).
- Jika **PENDING:** pesan "Mohon tunggu, petugas sedang memverifikasi."
- Jika **CHECKED_IN:** tampilkan nomor kartu visitor + waktu masuk.
- Jika **REJECTED:** tampilkan **alasan penolakan** dengan jelas + saran tindak lanjut.
- Jika **CHECKED_OUT:** ringkasan kunjungan (waktu masuk & keluar).
- Auto-refresh / polling status agar tamu tidak perlu reload manual.

### 5.5 Dashboard Antrean — Security
- Header: jumlah tamu PENDING, nama petugas login, tombol refresh.
- **List kartu tamu PENDING**, tiap kartu menampilkan:
  - Nama, asal, keperluan, tujuan.
  - **Thumbnail foto KTP & selfie** (tap untuk perbesar / lihat berdampingan).
  - Waktu submit.
  - Tombol **Check-in** (hijau) & **Reject** (merah).
- Optimalkan untuk tablet: kartu cukup besar, tombol mudah di-tap.
- Empty state: "Tidak ada tamu menunggu." dengan ilustrasi ringan.

### 5.6 Modal Check-in — Security
- Judul: "Check-in [Nama Tamu]".
- Ringkasan data tamu + foto.
- **Input Nomor Kartu Visitor** (wajib, validasi tidak duplikat dengan tamu aktif).
- Pengingat: "Pastikan KTP fisik tamu sudah diterima."
- Tombol **Konfirmasi Check-in** & **Batal**.

### 5.7 Modal Reject — Security
- Judul: "Tolak Kunjungan [Nama Tamu]".
- **Textarea Alasan Penolakan** (wajib, tidak bisa kosong).
- Info: "Tamu akan menerima email berisi alasan ini."
- Tombol **Konfirmasi Tolak** (merah) & **Batal**.

### 5.8 Daftar Tamu Aktif — Security
- List tamu `CHECKED_IN`: nama, nomor kartu, waktu masuk, tujuan.
- Tombol **Check-out** per tamu.
- Pengingat saat checkout: "Pastikan kartu visitor dikembalikan & KTP diserahkan ke tamu."
- Konfirmasi sebelum check-out final.

### 5.9 Riwayat & Laporan — Admin
- Tabel: nama, tanggal, status, petugas, waktu masuk/keluar.
- Filter: rentang tanggal, status, pencarian nama.
- Tombol ekspor (CSV).
- Foto hanya dapat dibuka oleh role yang berwenang.

### 5.10 Paket & Kiriman — Security
- Header: judul "Paket & Kiriman Masuk" + tombol **Registrasi Paket** (primer).
- Tabel paket: detail (pengirim, jenis, ID) dengan thumbnail foto, penerima, waktu masuk, **badge status** (RECEIVED/PICKED_UP), aksi.
- Paket `RECEIVED` → tombol **Tandai Diambil** (hijau); `PICKED_UP` → label "Selesai".
- Empty state: "Belum ada paket yang diregistrasi hari ini."
- Daftar paket sesuai **lokasi** petugas yang login.

### 5.11 Modal Registrasi Paket — Security
- Judul: "Registrasi Paket Masuk".
- Field: **Nama Pengirim/Ekspedisi** (wajib), **Nama Penerima** (wajib), **Jenis Barang** (dropdown: Dokumen / Kardus Sedang-Besar / Makanan-Minuman / Lainnya).
- **Foto Barang/Resi (opsional)** — tombol ambil/upload, preview thumbnail.
- Tombol **Simpan Paket** (disabled hingga pengirim & penerima terisi) & **Batal**.

### 5.12 Dashboard Analitik — Admin
- **Kartu metrik** (3): Total Tamu (bulan ini) + tren %, Tamu Selesai Hari Ini, Kunjungan Ditolak.
- **Grafik tren kunjungan mingguan** — bar chart (warna primer biru Pertamina), sumbu bersih tanpa garis berat.
- **Distribusi tujuan/departemen** — donut/pie chart memakai palet identitas (biru, hijau, merah, hitam, abu) + legend.
- Kartu memakai radius besar, shadow halus, ruang putih lega (sesuai brand).
- Responsif: kartu metrik 1 kolom (mobile) → 3 kolom (desktop); grafik menumpuk di layar kecil.

### 5.13 Assignment Petugas — Admin
- Header: deskripsi singkat + tombol **Tambah Petugas**.
- **Grid kartu petugas**: inisial avatar, nama, ID, **lokasi penugasan** (dengan ikon `map-pin`), badge status (Aktif/Nonaktif), aksi **Aktifkan/Nonaktifkan**.
- **Modal Tambah Petugas**: Nama Lengkap, Email, **Lokasi Penugasan** (dropdown dari master lokasi).
- Konfirmasi saat menonaktifkan petugas (aksi berdampak akses login).

### 5.14 Jejak Visitor (Timeline) — Admin
- **Bar pencarian** nama visitor / instansi di atas.
- **Kartu visitor** (dapat di-expand): avatar foto, nama, instansi, jumlah kunjungan, tanggal terakhir, ikon chevron.
- Saat di-expand → **timeline vertikal** kunjungan (dot per kunjungan): tanggal & jam, badge status, "bertemu dengan", keperluan, **lokasi check-in**.
- Animasi expand halus; state aktif diberi ring/border warna primer.

> **Konteks multi-lokasi:** Petugas security terikat pada satu lokasi (dari data petugas), sehingga antrean, tamu aktif, dan paket otomatis terfilter ke lokasinya — tidak perlu memilih lokasi manual. Admin melihat seluruh lokasi dan dapat memfilter per lokasi pada riwayat & laporan.

---

## 6. Pola Interaksi (Interaction Patterns)

| Pola | Aturan |
|---|---|
| **Validasi** | Inline & real-time; tombol submit disabled sampai valid. |
| **Loading** | Skeleton/spinner untuk fetch data; progress bar untuk upload foto. |
| **Feedback** | Toast sukses ("Check-in berhasil"), toast/inline error untuk kegagalan. |
| **Konfirmasi** | Modal konfirmasi untuk aksi tidak bisa dibatalkan (reject, check-out). |
| **Aksi wajib** | Nomor kartu (check-in) & alasan (reject) tidak bisa dilewati. |
| **Empty state** | Pesan ramah + ilustrasi saat list kosong. |
| **Auto-refresh** | Polling status (visitor) & antrean (security) secara berkala. |

---

## 7. Aksesibilitas (Accessibility)

- Kontras warna memenuhi **WCAG AA** (rasio ≥ 4.5:1 untuk teks).
- Status tidak hanya dibedakan warna, tapi juga ikon + teks (color-blind friendly).
- Target tap ≥ 44×44px.
- Label form jelas & terkait input (untuk screen reader).
- Dukungan navigasi keyboard di layar security/admin (desktop).
- Pesan error deskriptif, bukan sekadar "error".

---

## 8. Pertimbangan Privasi pada UI (UU PDP)

- **Consent jelas** sebelum pengambilan data/foto, dengan tautan kebijakan privasi.
- **Penjelasan tujuan** foto KTP & selfie ditampilkan dekat tombol pengambilan.
- **Foto tidak ditampilkan publik** — hanya di layar security/admin terautentikasi.
- **NIK disamarkan** di tampilan yang tidak perlu (mis. `••••••••••••3456`) bila ditampilkan ke peran non-verifikasi.
- **Tidak ada data sensitif di URL** atau parameter query.
- Informasi retensi (data dihapus setelah 1 bulan) dapat dicantumkan di kebijakan privasi.

---

## 9. Responsivitas (Breakpoints)

| Breakpoint | Lebar | Target | Layout |
|---|---|---|---|
| Mobile | < 640px | Tamu | 1 kolom, tombol full-width |
| Tablet | 640–1024px | Security | Grid kartu 2 kolom, sidebar ringkas |
| Desktop | > 1024px | Security/Admin | Sidebar + tabel, multi-kolom |

---

## 10. Deliverables Desain

| Deliverable | Keterangan |
|---|---|
| **Wireframe** | Low-fidelity untuk semua layar di Section 5. |
| **High-fidelity mockup** | Menerapkan identitas visual (Section 3). |
| **Komponen library** | Tombol, input, badge status, kartu, modal, toast. |
| **Prototype interaktif** | Alur tamu baru, tamu lama, dan alur security (check-in/reject/checkout). |
| **Design tokens** | Variabel warna, tipografi, spasi (siap dipakai di React). |

---

## Lampiran: Peta Layar ke Peran

| Layar | Visitor | Security | Admin |
|---|:---:|:---:|:---:|
| Login | ✓ | ✓ | ✓ |
| Form Registrasi (baru) | ✓ | | |
| Form Reservasi (lama) | ✓ | | |
| Status Kunjungan | ✓ | | |
| Dashboard Antrean | | ✓ | |
| Modal Check-in / Reject | | ✓ | |
| Tamu Aktif (Check-out) | | ✓ | |
| Paket & Kiriman (+ modal) | | ✓ | |
| Dashboard Analitik | | | ✓ |
| Assignment Petugas | | | ✓ |
| Jejak Visitor (Timeline) | | | ✓ |
| Riwayat & Laporan | | | ✓ |
