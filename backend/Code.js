// Code.js - entry point Web App.
// doPost menerima JSON text/plain { action, id_token, ...payload }.
// Identitas selalu diverifikasi di server lewat Google ID token.

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const authedEmail = verifyIdToken(data);
    enforceRateLimit(data.action, authedEmail);
    const result = dispatch(data.action, data, authedEmail);
    return jsonOutput(result === undefined ? { ok: true } : result);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return jsonOutput({ error: 'Permintaan tidak dapat diproses.' });
  }
}

function doGet() {
  return jsonOutput({
    ok: true,
    service: 'VMS Apps Script',
    time: new Date().toISOString(),
    google_client_id_configured: !!PROP.getProperty(PROP_KEYS.GOOGLE_CLIENT_ID),
  });
}

function dispatch(action, data, authedEmail) {
  switch (action) {
    // Visitor
    case 'getVisitorByEmail': return getVisitorByEmail(data, authedEmail);
    case 'uploadPhoto': return uploadPhoto(data, authedEmail);
    case 'submitVisit': return submitVisit(data, authedEmail);
    case 'getRole': return getRole(data, authedEmail);
    case 'getLocations': return getLocations(data, authedEmail);
    case 'getPhoto': return getPhoto(data, authedEmail);
    // Security - kunjungan
    case 'getPendingVisits': return getPendingVisits(data, authedEmail);
    case 'getActiveVisits': return getActiveVisits(data, authedEmail);
    case 'checkIn': return checkIn(data, authedEmail);
    case 'rejectVisit': return rejectVisit(data, authedEmail);
    case 'checkOut': return checkOut(data, authedEmail);
    case 'getVisitStatus': return getVisitStatus(data, authedEmail);
    // Security - paket
    case 'addPackage': return addPackage(data, authedEmail);
    case 'getPackages': return getPackages(data, authedEmail);
    case 'pickupPackage': return pickupPackage(data, authedEmail);
    // Admin
    case 'getHistory': return getHistory(data, authedEmail);
    case 'getDashboardStats': return getDashboardStats(data, authedEmail);
    case 'getVisitorTimeline': return getVisitorTimeline(data, authedEmail);
    case 'getOfficers': return getOfficers(data, authedEmail);
    case 'addOfficer': return addOfficer(data, authedEmail);
    case 'updateOfficer': return updateOfficer(data, authedEmail);
    case 'deleteOfficer': return deleteOfficer(data, authedEmail);
    default: throw new Error('Action tidak dikenal.');
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
