// packages.js — registrasi & pengambilan paket/kiriman (FR-21..FR-23).

function addPackage(data) {
  if (!data.sender || !data.recipient) throw new Error('Pengirim & penerima wajib diisi.');
  assertSecurityAt(data, data.location);

  const id = 'PKG-' + shortId();
  appendRow(SHEETS.PACKAGES, {
    package_id: id,
    sender: data.sender,
    recipient: data.recipient,
    type: data.type || 'Lainnya',
    photo_url: data.photo_url || '',
    status: PACKAGE_STATUS.RECEIVED,
    location: data.location || '',
    security_email: normEmail(data.actor_email),
    received_at: now(),
    picked_up_at: '',
  });
  return { ok: true, package_id: id, status: PACKAGE_STATUS.RECEIVED };
}

function getPackages(data) {
  assertSecurityAt(data, data.location);
  return readRows(SHEETS.PACKAGES).filter((p) =>
    (!data.status || p.status === data.status) &&
    (!data.location || normEmail(p.location) === normEmail(data.location))
  ).map(stripRow);
}

function pickupPackage(data) {
  const row = readRows(SHEETS.PACKAGES).find((p) => p.package_id === data.package_id);
  if (!row) throw new Error('Paket tidak ditemukan: ' + data.package_id);
  if (row.status === PACKAGE_STATUS.PICKED_UP) throw new Error('Paket sudah diambil.');
  updateCells(SHEETS.PACKAGES, row._row, { status: PACKAGE_STATUS.PICKED_UP, picked_up_at: now() });
  return { ok: true, package_id: data.package_id, status: PACKAGE_STATUS.PICKED_UP };
}
