// analytics.js — metrik dashboard & jejak per-visitor untuk admin.
// Bentuk output `weekly`/`dept` sengaja cocok dengan grafik recharts di frontend.

function getDashboardStats() {
  const visits = readRows(SHEETS.VISITS);
  const today = dateKey(new Date());
  const monthPrefix = today.slice(0, 7);

  const inMonth = (d) => dateKey(d).slice(0, 7) === monthPrefix;

  return {
    totalMonth: visits.filter((v) => inMonth(v.created_at)).length,
    doneToday: visits.filter((v) => v.status === VISIT_STATUS.CHECKED_OUT && dateKey(v.checkout_at) === today).length,
    rejected: visits.filter((v) => v.status === VISIT_STATUS.REJECTED && inMonth(v.created_at)).length,
    activeNow: visits.filter((v) => v.status === VISIT_STATUS.CHECKED_IN).length,
    weekly: weeklySeries(visits),
    dept: deptDistribution(visits),
  };
}

// Jumlah kunjungan 7 hari terakhir, diurutkan Sen..Min (konsisten dgn UI).
function weeklySeries(visits) {
  const names = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const weekAgo = stripTime(new Date(Date.now() - 6 * 86400000));
  visits.forEach((v) => {
    if (!v.created_at) return;
    const d = new Date(v.created_at);
    if (d >= weekAgo) counts[d.getDay()]++;
  });
  return [1, 2, 3, 4, 5, 6, 0].map((i) => ({ name: names[i], kunjungan: counts[i] }));
}

// Distribusi tujuan/departemen (top 6) untuk pie chart.
function deptDistribution(visits) {
  const map = {};
  visits.forEach((v) => { const k = v.tujuan || 'Lainnya'; map[k] = (map[k] || 0) + 1; });
  return Object.keys(map)
    .map((k) => ({ name: k, value: map[k] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

// Jejak per-visitor: kelompokkan kunjungan per email, terbaru dulu.
function getVisitorTimeline(data) {
  let visits = readRows(SHEETS.VISITS).map(stripRow);
  if (data.search) {
    const q = String(data.search).toLowerCase();
    visits = visits.filter((v) =>
      String(v.nama).toLowerCase().indexOf(q) >= 0 || String(v.email).toLowerCase().indexOf(q) >= 0);
  }
  const groups = {};
  visits.forEach((v) => {
    const k = v.email || v.nama;
    if (!groups[k]) groups[k] = { email: v.email, nama: v.nama, visits: [] };
    groups[k].visits.push(v);
  });
  return Object.keys(groups).map((k) => {
    const g = groups[k];
    g.visits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return g;
  });
}

function dateKey(d) { return d ? Utilities.formatDate(new Date(d), tz(), 'yyyy-MM-dd') : ''; }
function stripTime(d) { d.setHours(0, 0, 0, 0); return d; }
function tz() { return Session.getScriptTimeZone() || 'Asia/Jakarta'; }
