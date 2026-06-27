// config.js — konstanta backend VMS. Semua nama sheet, kolom, & kunci properti
// terpusat di sini agar tidak ada "magic string" tersebar di banyak file.

const PROP = PropertiesService.getScriptProperties();

// Kunci Script Properties (diisi oleh setup.js, lihat setupSpreadsheet()).
const PROP_KEYS = {
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  PHOTO_FOLDER_ID: 'PHOTO_FOLDER_ID',
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
};

const SHEETS = {
  VISITORS: 'Visitors',
  VISITS: 'Visits',
  USERS: 'Users',
  LOCATIONS: 'Locations',
  PACKAGES: 'Packages',
};

// Header tiap sheet = sumber kebenaran urutan kolom (dipakai setup & helper).
const HEADERS = {
  Visitors: ['visitor_id', 'email', 'nama', 'ktp', 'phone', 'asal', 'ktp_photo_url', 'ktp_thumb_url', 'created_at'],
  Visits: ['visit_id', 'visitor_id', 'email', 'nama', 'phone', 'keperluan', 'tujuan', 'location',
    'selfie_url', 'selfie_thumb_url', 'status', 'card_number', 'reject_reason', 'confirm_notes', 'security_email',
    'created_at', 'checkin_at', 'checkout_at', 'schedule_type', 'scheduled_at'],
  Users: ['email', 'role', 'name', 'officer_id', 'location_id', 'location', 'status'],
  Locations: ['location_id', 'name', 'active'],
  Packages: ['package_id', 'sender', 'recipient', 'type', 'photo_url', 'photo_thumb_url', 'status',
    'location', 'security_email', 'received_at', 'picked_up_at'],
};

const VISIT_STATUS = { PENDING: 'PENDING', CHECKED_IN: 'CHECKED_IN', CHECKED_OUT: 'CHECKED_OUT', REJECTED: 'REJECTED' };
const PACKAGE_STATUS = { RECEIVED: 'RECEIVED', PICKED_UP: 'PICKED_UP' };
const ROLE = { SECURITY: 'security', ADMIN: 'admin', VISITOR: 'visitor' };
const USER_STATUS = { ACTIVE: 'Active', INACTIVE: 'Inactive' };

const RETENTION_DAYS = 30;                     // NFR-07 (UU PDP): simpan maks 1 bulan.
const PHOTO_FOLDER_NAME = 'VMS Photos (Private)';

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const ALLOWED_PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp'];
