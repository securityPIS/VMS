# Modul Admin (`src/features/admin/`)

Panel admin (tema gelap). State petugas terpusat di `AdminDashboard`.

## `AdminDashboard.jsx` ✅ (container)
Tab routing + data petugas/riwayat + modal tambah petugas.
- Props: `user`, `onLogout`.
- `load()` memuat `api.getOfficers()` + `api.getHistory({})` saat mount; state
  `loading`/`error`/`busy`.
- Aksi lewat helper `run(fn, onDone)` → panggil `api.*` → **muat ulang**:
  `handleAddOfficer` (`api.addOfficer`), `toggleOfficer(officer)` (`api.updateOfficer`
  dengan `officer_id` & status berlawanan).

## `AdminSidebar.jsx`
Navigasi gelap 3 tab.
- Props: `user`, `onLogout`, `activeTab`, `setActiveTab`.

## Tab
| File | Props | Fungsi |
|---|---|---|
| `DashboardOverviewTab.jsx` ✅ | — | Memuat `api.getDashboardStats` (loading/error); kartu metrik + grafik tren (bar) & distribusi (pie) via recharts; empty state bila data kosong. |
| `OfficerAssignmentTab.jsx` | `officers`, `onAdd()`, `onToggle(officer)` | Kartu petugas + lokasi + aktif/nonaktif (mengirim objek officer agar `officer_id` terbawa). |
| `VisitorTimelineTab.jsx` | `visits` | Pencarian (fungsional) + kartu visitor expandable → timeline; avatar via `RemotePhoto`. |

## Modal
| File | Props | Fungsi |
|---|---|---|
| `AddOfficerModal.jsx` | `isOpen`, `value`, `setValue`, `onSave`, `onClose`, `busy` | Tambah petugas (nama/email wajib, lokasi dari `LOCATIONS`). |

> **Catatan:** `VisitorTimelineTab` menerima riwayat ter-adapt (flat) lalu
> mengelompokkan per nama & mengurutkan terbaru dulu (useMemo). Alternatif backend:
> `api.getVisitorTimeline` (sudah mengelompokkan di server).
