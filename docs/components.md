# Komponen shared (`src/components/`)

Primitives UI yang dipakai lintas layar. Semua presentational (tanpa state global).

## `BrandLogo.jsx`
Logo Pertamina (SVG signature resmi) + wordmark "VISITOR MANAGEMENT SYSTEM".
- Props: `className` (atur tinggi, mis. `h-12`).
- Untuk latar gelap, pemanggil menambah `brightness-0 invert`.
- ⚠️ Brand: jangan ubah proporsi/warna/efek (lihat UIUX §3).

## `Button.jsx`
Tombol pill serbaguna.
- Props: `variant` (`filled`|`tonal`|`outlined`|`text`|`danger`|`success`), `className`, + props `<button>` (onClick, disabled, type).
- Warna mengikuti palet Pertamina.

## `InputField.jsx`
Input teks berlabel.
- Props: `label`, + props `<input>` standar (`value`, `onChange`, `type`, `placeholder`, `autoFocus`).
- Border fokus biru Pertamina; teks ≥16px (anti auto-zoom iOS).

## `Badge.jsx`
Pill status kunjungan.
- Props: `status` (`PENDING`|`CHECKED_IN`|`CHECKED_OUT`|`REJECTED`).
- Mengambil warna/ikon/label dari `VISIT_STATUS` (constants). Color-blind friendly (ikon+teks).

## `ModalBase.jsx`
Kerangka modal (overlay gelap + kartu).
- Props: `isOpen`, `onClose`, `title`, `children` (body), `footer` (tombol aksi).
- Klik overlay menutup; klik isi tidak menutup (stopPropagation).

## `RemotePhoto.jsx`
Menampilkan foto dari sebuah **ref** yang bisa berupa:
- URL langsung (`http(s):`/`data:`) → dipasang apa adanya (mode mock).
- id file Drive privat → diambil base64 via `api.getPhoto` (mode backend, di-cache).
- Props: `refId`, `alt`, `className`. Mengembalikan `null` bila ref kosong/gagal
  (pemanggil boleh menyiapkan placeholder sendiri).

## `PhotoCapture.jsx`
Kontrol ambil foto (kamera di mobile via atribut `capture`).
- Props: `label`, `value` (data URL atau `''`), `onChange(dataUrl)`, `capture`
  (`'user'` selfie / `'environment'` KTP/paket).
- Membaca berkas → **kompres** ke JPEG (maks sisi 1280px) → data URL base64; tampil
  pratinjau + "Ambil ulang". Hasilnya diunggah pemanggil via `api.uploadPhoto`.
