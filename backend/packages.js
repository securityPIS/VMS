// packages.js - registrasi dan pengambilan paket/kiriman.

function addPackage(data, authedEmail) {
  return withScriptLock(() => {
    const scope = requireSecurityScope(authedEmail, { location_id: data.location_id, location: data.location });
    if (!scope.location) throw new Error('Lokasi penugasan tidak valid atau tidak aktif.');

    const id = 'PKG-' + shortId();
    appendRow(SHEETS.PACKAGES, {
      package_id: id,
      sender: requiredText(data.sender, 'Pengirim', 160),
      recipient: requiredText(data.recipient, 'Penerima', 160),
      type: optionalText(data.type || 'Lainnya', 'Jenis paket', 80) || 'Lainnya',
      photo_url: optionalText(data.photo_url, 'Foto paket', 160),
      photo_thumb_url: optionalText(data.photo_thumb_url, 'Thumbnail paket', 160),
      status: PACKAGE_STATUS.RECEIVED,
      location: scope.location,
      security_email: normEmail(authedEmail),
      received_at: now(),
      picked_up_at: '',
    });
    return { ok: true, package_id: id, status: PACKAGE_STATUS.RECEIVED };
  });
}

function getPackages(data, authedEmail) {
  const scope = requireSecurityScope(authedEmail, data);
  return readRows(SHEETS.PACKAGES).filter((p) =>
    (!data.status || p.status === data.status) &&
    (!scope.location || normEmail(p.location) === normEmail(scope.location))
  ).map(stripRow);
}

function pickupPackage(data, authedEmail) {
  return withScriptLock(() => {
    const id = requiredText(data.package_id, 'ID paket', 80);
    const row = readRows(SHEETS.PACKAGES).find((p) => p.package_id === id);
    if (!row) throw new Error('Paket tidak ditemukan.');
    requireSecurityScope(authedEmail, { location: row.location });
    if (row.status === PACKAGE_STATUS.PICKED_UP) throw new Error('Paket sudah diambil.');
    updateCells(SHEETS.PACKAGES, row._row, { status: PACKAGE_STATUS.PICKED_UP, picked_up_at: now() });
    return { ok: true, package_id: id, status: PACKAGE_STATUS.PICKED_UP };
  });
}
