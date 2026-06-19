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
