# Modul Security (`src/features/security/`)

Dashboard petugas. State terpusat di `SecurityDashboard`, anak-anaknya presentational.

## `SecurityDashboard.jsx` 🟡 (container)
Memegang state & alur, merakit sidebar + tab + modal.
- Props: `user`, `onLogout`.
- State: `visits`, `packages` (seed dari mock), tab aktif, target/flag tiap modal,
  field input (cardNumber, rejectReason, newPackage, packagePhoto).
- Handlers: `handleCheckIn`, `handleReject`, `handleCheckOut`, `handleAddPackage`, `handlePickup`.
- ⚠️ Operasi mengubah state lokal saja. **Fase C:** ganti ke `api.checkIn`, dst,
  dan muat data via `api.getPendingVisits(location)` pada mount.

## `SecuritySidebar.jsx`
Navigasi 4 tab + badge jumlah pending. Menampilkan nama & **lokasi** petugas.
- Props: `user`, `onLogout`, `activeTab`, `setActiveTab`, `pendingCount`.

## Tab
| File | Props | Fungsi |
|---|---|---|
| `QueueTab.jsx` | `visits`, `onCheckIn(v)`, `onReject(v)` | Kartu PENDING + foto KTP/selfie + tombol aksi; empty state. |
| `ActiveVisitsTab.jsx` | `visits`, `onCheckout(v)` | Tabel CHECKED_IN + tombol Check-out. |
| `PackagesTab.jsx` | `packages`, `onAdd()`, `onPickup(id)` | Tabel paket + registrasi + Tandai Diambil. |
| `HistoryTab.jsx` | `visits` | Tabel riwayat + `Badge` status. |

## Modal
| File | Props | Fungsi |
|---|---|---|
| `CheckInModal.jsx` | `visit`, `cardNumber`, `setCardNumber`, `onConfirm`, `onClose` | Input nomor kartu (wajib). TODO: validasi duplikat (FR-10). |
| `RejectModal.jsx` | `visit`, `rejectReason`, `setRejectReason`, `onConfirm`, `onClose` | Alasan penolakan (wajib). |
| `CheckoutModal.jsx` | `visit`, `onConfirm`, `onClose` | Konfirmasi + pengingat tukar kartu↔KTP. |
| `AddPackageModal.jsx` | `isOpen`, `value`, `setValue`, `photo`, `setPhoto`, `onSave`, `onClose` | Form paket (pengirim/penerima wajib, jenis, foto opsional). |

> Modal kunjungan terbuka bila prop `visit` truthy (`isOpen={!!visit}`).
