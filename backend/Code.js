// Code.js — entry point Web App.
// - doPost: router semua aksi. Body dikirim text/plain berisi JSON
//   { action, secret, ...payload } (text/plain → hindari CORS preflight).
// - doGet: health check + sajikan foto privat (action=getPhoto).

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    verifySecret(data);                       // NFR-05: gerbang shared secret.
    const result = dispatch(data.action, data);
    return jsonOutput(result === undefined ? { ok: true } : result);
  } catch (err) {
    return jsonOutput({ error: err.message || String(err) });
  }
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'getPhoto') return servePhoto(e.parameter);   // drive.js
  return jsonOutput({ ok: true, service: 'VMS Apps Script', time: new Date().toISOString() });
}

// Dispatch action → handler. Tiap handler menerima objek `data` lengkap.
function dispatch(action, data) {
  switch (action) {
    // Visitor
    case 'getVisitorByEmail': return getVisitorByEmail(data);
    case 'uploadPhoto': return uploadPhoto(data);
    case 'submitVisit': return submitVisit(data);
    case 'getRole': return getRole(data);
    case 'getLocations': return getLocations(data);
    // Security — kunjungan
    case 'getPendingVisits': return getPendingVisits(data);
    case 'getActiveVisits': return getActiveVisits(data);
    case 'checkIn': return checkIn(data);
    case 'rejectVisit': return rejectVisit(data);
    case 'checkOut': return checkOut(data);
    // Security — paket
    case 'addPackage': return addPackage(data);
    case 'getPackages': return getPackages(data);
    case 'pickupPackage': return pickupPackage(data);
    // Admin
    case 'getHistory': return getHistory(data);
    case 'getDashboardStats': return getDashboardStats(data);
    case 'getVisitorTimeline': return getVisitorTimeline(data);
    case 'getOfficers': return getOfficers(data);
    case 'addOfficer': return addOfficer(data);
    case 'updateOfficer': return updateOfficer(data);
    default: throw new Error('Action tidak dikenal: ' + action);
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
