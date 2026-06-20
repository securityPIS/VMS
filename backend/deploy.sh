#!/usr/bin/env bash
# deploy.sh — push & deploy backend Apps Script (clasp) dalam satu langkah.
#
# Jalankan dari mana saja; skrip pindah ke folder backend/ (tempat .clasp.json).
#
# Autentikasi (urutan):
#   1) Bila $CLASPRC_JSON terisi (mis. environment secret di Claude Code on the web),
#      isinya ditulis ke ~/.clasprc.json — berguna di container ephemeral.
#   2) Selain itu pakai ~/.clasprc.json yang sudah ada (mis. setelah `clasp login`
#      di mesin lokal).
#
# Deployment ID (agar URL Web App TIDAK berubah):
#   - argumen pertama:  ./deploy.sh <DEPLOYMENT_ID> ["deskripsi"]
#   - atau env:         DEPLOYMENT_ID=AKfyc... ./deploy.sh
#   Tanpa ID, skrip BERHENTI (menolak membuat URL baru tanpa sengaja). Untuk
#   sengaja membuat deployment baru, set NEW_DEPLOYMENT=1.
#
# Contoh:
#   ./deploy.sh AKfycb... "perf: caching + batch write + webp mime"

set -euo pipefail

cd "$(dirname "$0")"

DEPLOYMENT_ID="${1:-${DEPLOYMENT_ID:-}}"
DESC="${2:-deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)}"

log() { printf '\033[1;34m▸ %s\033[0m\n' "$*"; }
err() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; }

# 1) Pastikan clasp tersedia.
if ! command -v clasp >/dev/null 2>&1; then
  log "clasp belum terpasang — memasang @google/clasp…"
  npm i -g @google/clasp
fi

# 2) Siapkan kredensial dari secret bila ada.
if [ -n "${CLASPRC_JSON:-}" ] && [ ! -f "$HOME/.clasprc.json" ]; then
  log "Menulis ~/.clasprc.json dari \$CLASPRC_JSON"
  printf '%s' "$CLASPRC_JSON" > "$HOME/.clasprc.json"
  chmod 600 "$HOME/.clasprc.json"
fi

if [ ! -f "$HOME/.clasprc.json" ]; then
  err "Belum terautentikasi. Jalankan 'clasp login' (lokal) atau set \$CLASPRC_JSON."
  exit 1
fi

if [ ! -f ".clasp.json" ]; then
  err ".clasp.json tidak ditemukan di $(pwd). Jalankan skrip ini di dalam backend/."
  exit 1
fi

# 3) Push kode ke Apps Script.
log "clasp push"
clasp push --force

# 4) Deploy.
if [ -n "$DEPLOYMENT_ID" ]; then
  log "clasp deploy -i $DEPLOYMENT_ID (URL Web App dipertahankan)"
  clasp deploy -i "$DEPLOYMENT_ID" -d "$DESC"
elif [ "${NEW_DEPLOYMENT:-}" = "1" ]; then
  log "clasp deploy (deployment BARU — URL Web App berubah!)"
  clasp deploy -d "$DESC"
  err "URL Web App baru dibuat. Perbarui VITE_APPS_SCRIPT_URL di Vercel bila perlu."
else
  err "DEPLOYMENT_ID tidak diberikan. Lihat daftar di bawah, lalu ulangi dengan ID-nya:"
  clasp deployments || true
  err "Contoh: ./deploy.sh <DEPLOYMENT_ID> \"deskripsi\"   (atau NEW_DEPLOYMENT=1 untuk URL baru)"
  exit 1
fi

log "Selesai."
