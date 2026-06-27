// ratelimit.js - throttle best-effort berbasis CacheService.

function enforceRateLimit(action, authedEmail) {
  const email = normEmail(authedEmail) || 'unknown';
  const limit = rateLimitFor(action);
  if (!limit) return;

  const bucket = Math.floor(Date.now() / 60000);
  const key = 'rl:' + sha256Hex([action, email, bucket].join(':')).slice(0, 42);
  const cache = CacheService.getScriptCache();
  const current = Number(cache.get(key) || '0');
  if (current >= limit) throw new Error('Terlalu banyak permintaan. Coba lagi sebentar.');
  cache.put(key, String(current + 1), 70);
}

function rateLimitFor(action) {
  switch (action) {
    case 'uploadPhoto': return 20;
    case 'submitVisit': return 10;
    case 'checkIn':
    case 'rejectVisit':
    case 'checkOut':
    case 'addPackage':
    case 'pickupPackage':
    case 'addOfficer':
    case 'updateOfficer':
    case 'deleteOfficer':
      return 60;
    case 'getPhoto': return 120;
    case 'getVisitStatus': return 180;
    default: return 240;
  }
}
