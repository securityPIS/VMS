# Modul Admin (`src/features/admin/`)

Panel admin (tema gelap). State petugas terpusat di `AdminDashboard`.

## `AdminDashboard.jsx` 🟡 (container)
Tab routing + state petugas + modal tambah petugas.
- Props: `user`, `onLogout`.
- State: `officers` (seed mock), `activeTab` (dashboard/assignment/visitor),
  `showAddOfficer`, `newOfficer`.
- Handlers: `handleAddOfficer`, `toggleOfficer`.
- ⚠️ **Fase C:** ganti ke `api.getOfficers/addOfficer/updateOfficer`.

## `AdminSidebar.jsx`
Navigasi gelap 3 tab.
- Props: `user`, `onLogout`, `activeTab`, `setActiveTab`.

## Tab
| File | Props | Fungsi |
|---|---|---|
| `DashboardOverviewTab.jsx` 🟡 | — | Kartu metrik + grafik tren (bar) & distribusi (pie) via recharts. Angka mock; ganti `api.getDashboardStats`. |
| `OfficerAssignmentTab.jsx` | `officers`, `onAdd()`, `onToggle(id)` | Kartu petugas + lokasi + aktif/nonaktif. |
| `VisitorTimelineTab.jsx` | `visits` | Pencarian (fungsional) + kartu visitor expandable → timeline kunjungan. |

## Modal
| File | Props | Fungsi |
|---|---|---|
| `AddOfficerModal.jsx` | `isOpen`, `value`, `setValue`, `onSave`, `onClose` | Tambah petugas (nama/email wajib, lokasi dari `LOCATIONS`). |

> **Catatan:** `VisitorTimelineTab` mengelompokkan `visits` per nama & mengurutkan
> terbaru dulu (useMemo). Saat backend siap, ganti dengan `api.getVisitorTimeline`.
