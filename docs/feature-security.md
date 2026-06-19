# Modul Security (`src/features/security/`)

Dashboard petugas. State terpusat di `SecurityDashboard`, anak-anaknya presentational.

## `SecurityDashboard.jsx` ✅ (container)
Memegang state & alur, merakit sidebar + tab + modal.
- Props: `user`, `onLogout` (memakai `user.location` & `user.email` sebagai konteks).
- `load()` memuat paralel: `getPendingVisits`, `getActiveVisits`, `getHistory`,
  `getPackages` (dengan `location` + `actor_email`) saat mount; state `loading`/`error`.
- Aksi lewat helper `run(fn, onDone)`: panggil `api.*` → tutup modal → **muat ulang**;
  `handleCheckIn`, `handleReject`, `handleCheckOut`, `handleAddPackage` (unggah foto
  dulu bila ada), `handlePickup`. Flag `busy` menonaktifkan tombol saat proses.

## `SecuritySidebar.jsx`
Navigasi 4 tab + badge jumlah pending. Menampilkan nama & **lokasi** petugas.
- Props: `user`, `onLogout`, `activeTab`, `setActiveTab`, `pendingCount`.

## Tab
| File | Props | Fungsi |
|---|---|---|
| `QueueTab.jsx` | `visits`, `onCheckIn(v)`, `onReject(v)` | Kartu PENDING + foto KTP/selfie (`RemotePhoto`) + tombol aksi; empty state. |
| `ActiveVisitsTab.jsx` | `visits`, `onCheckout(v)` | Tabel CHECKED_IN + tombol Check-out. |
| `PackagesTab.jsx` | `packages`, `onAdd()`, `onPickup(id)` | Tabel paket + registrasi + Tandai Diambil. |
| `HistoryTab.jsx` | `visits` | Tabel riwayat + `Badge` status. |

## Modal
| File | Props | Fungsi |
|---|---|---|
| `CheckInModal.jsx` | `visit`, `cardNumber`, `setCardNumber`, `onConfirm`, `onClose`, `busy` | Input nomor kartu (wajib). Duplikat ditolak backend/store (FR-10). |
| `RejectModal.jsx` | `visit`, `rejectReason`, `setRejectReason`, `onConfirm`, `onClose`, `busy` | Alasan penolakan (wajib). |
| `CheckoutModal.jsx` | `visit`, `onConfirm`, `onClose`, `busy` | Konfirmasi + pengingat tukar kartu↔KTP. |
| `AddPackageModal.jsx` | `isOpen`, `value`, `setValue`, `photo`, `setPhoto`, `onSave`, `onClose`, `busy` | Form paket (pengirim/penerima wajib, jenis, foto via `PhotoCapture`). |

> Modal kunjungan terbuka bila prop `visit` truthy (`isOpen={!!visit}`).
