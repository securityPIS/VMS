# Modul Admin (`src/features/admin/`)

Panel admin. State petugas, lokasi, dan riwayat terpusat di `AdminDashboard`.

## `AdminDashboard.jsx` (container)
Tab routing + data petugas/riwayat/lokasi + modal tambah/edit/hapus petugas.
- Props: `user`, `onLogout`.
- `load()` memuat `api.getOfficers()`, `api.getHistory({})`, dan `api.getLocations()` saat mount; state `loading`/`error`/`busy`.
- Aksi lewat helper `run(fn, onDone)` -> panggil `api.*` -> muat ulang:
  tambah/edit petugas (`api.addOfficer`/`api.updateOfficer`), hapus petugas (`api.deleteOfficer`), dan aktif/nonaktif (`api.updateOfficer` dengan `officer_id` + status berlawanan).

## `AdminSidebar.jsx`
Navigasi gelap 3 tab.
- Props: `user`, `onLogout`, `activeTab`, `setActiveTab`.

## Tab
| File | Props | Fungsi |
|---|---|---|
| `DashboardOverviewTab.jsx` | - | Memuat `api.getDashboardStats` (loading/error); kartu metrik + grafik tren (bar) & distribusi (pie) via recharts; empty state bila data kosong. |
| `OfficerAssignmentTab.jsx` | `officers`, `onAdd()`, `onEdit(officer)`, `onDelete(officer)`, `onToggle(officer)` | Kartu petugas + lokasi + menu titik tiga edit/delete + aktif/nonaktif. |
| `VisitorTimelineTab.jsx` | `visits` | Pencarian + kartu visitor expandable -> timeline; avatar via `RemotePhoto`. |

## Modal
| File | Props | Fungsi |
|---|---|---|
| `AddOfficerModal.jsx` | `isOpen`, `mode`, `value`, `setValue`, `locations`, `onSave`, `onClose`, `busy` | Tambah/edit petugas; nama, email, dan lokasi aktif wajib. |
| `DeleteOfficerModal.jsx` | `officer`, `onConfirm`, `onClose`, `busy` | Konfirmasi hapus petugas dari whitelist security. |

> `locations` berasal dari `api.getLocations()` sehingga assignment petugas mengikuti master `Locations`, bukan konstanta frontend.
