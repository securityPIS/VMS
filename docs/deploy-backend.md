# Deploy Backend (Apps Script) — Step by Step

Panduan deploy kode `backend/*.js` ke Google Apps Script via `clasp`,
tanpa mengubah URL Web App yang sudah dipakai frontend.

## Prasyarat

- Node.js & npm terpasang.
- Akun Google yang punya akses **Editor** ke project Apps Script (script ID
  ada di `backend/.clasp.json`).
- Akses ke repo `securityPIS/VMS`.

## 1. Clone repo (sekali saja, bila belum punya)

```bash
git clone https://github.com/securityPIS/VMS.git
cd VMS
```

Kalau sudah punya clone-nya, cukup masuk ke folder itu:

```bash
cd /path/ke/VMS
```

## 2. Tarik kode terbaru dari `main`

```bash
git checkout main
git pull origin main
```

## 3. Masuk ke folder `backend/`

```bash
cd backend
```

Pastikan benar — jalankan `ls` dan harus ada `.clasp.json` dan `deploy.sh`.
Kalau tidak ada, Anda belum di folder yang tepat.

## 4. Login clasp (sekali per mesin, lewati bila sudah pernah)

```bash
npm i -g @google/clasp
clasp login
```

Ini membuka browser untuk login ke akun Google pemilik script. Menghasilkan
`~/.clasprc.json` di mesin Anda — dipakai otomatis oleh `deploy.sh`.

## 5. Jalankan deploy.sh — langkah pertama: cari Deployment ID

```bash
./deploy.sh
```

Tanpa argumen, skrip akan **menolak** men-deploy dan menampilkan daftar
deployment yang ada (`clasp deployments`). Catat ID Web App yang sedang
dipakai frontend (biasanya yang punya keterangan "Web app").

## 6. Jalankan deploy.sh — push + deploy ke deployment yang sama

```bash
./deploy.sh <DEPLOYMENT_ID> "deskripsi perubahan"
```

Contoh:

```bash
./deploy.sh AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx "perf: caching + batch write + webp mime"
```

Skrip ini akan:
1. Memasang `clasp` bila belum ada.
2. `clasp push --force` — unggah seluruh file `backend/*.js` ke editor Apps Script.
3. `clasp deploy -i <DEPLOYMENT_ID>` — perbarui deployment yang sama, **URL Web App tidak berubah**.

## 7. Verifikasi

- Buka project di `https://script.google.com/d/<scriptId>/edit` (scriptId ada
  di `backend/.clasp.json`) dan pastikan isi file terbaru sudah masuk.
- Coba 1 aksi nyata di aplikasi (mis. check-in tamu di panel Security) dan
  pastikan tidak ada error serta responsnya terasa lebih cepat.

## Catatan penting

- **Jangan** jalankan `./deploy.sh` tanpa `DEPLOYMENT_ID` lalu memaksa lanjut
  — itu membuat deployment & URL Web App **baru**, sehingga
  `VITE_APPS_SCRIPT_URL` di Vercel harus ikut diperbarui. Hanya lakukan ini
  dengan sengaja via `NEW_DEPLOYMENT=1 ./deploy.sh "deskripsi"`.
- `clasp push --force` menimpa isi editor Apps Script dengan isi repo — ini
  yang diinginkan, supaya editor selalu selaras dengan `main`. Jangan edit
  langsung di editor Apps Script kalau masih pakai alur ini, karena akan
  tertimpa di deploy berikutnya.
- Kalau pernah deploy dari **environment Claude Code on the web** (bukan
  mesin lokal), kredensial bisa disuntikkan lewat env secret
  `CLASPRC_JSON` (isi `~/.clasprc.json`) — lihat komentar di awal
  `backend/deploy.sh` untuk detailnya.
