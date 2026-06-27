// Membuat gambar (PNG) ringkasan pendaftaran kunjungan untuk disimpan tamu —
// khususnya tamu terjadwal (SCHEDULE) sebagai bukti. Gambar dirender via canvas
// di sisi klien lalu diunduh; tidak ada data yang dikirim ke server.

const BRAND = '#1A2A4F';
const GOLD = '#C9A24B';
const INK = '#1A1B1E';
const INK_SOFT = '#44474E';
const LINE = '#E3E5EA';

// Bungkus teks agar tidak melebihi lebar maksimum; kembalikan array baris.
function wrapText(ctx, text, maxWidth) {
  const words = String(text || '-').split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// rows: [{ label, value }]. meta: { title, subtitle, footer, fileName }.
export function buildRegistrationImage(rows, meta = {}) {
  const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
  const W = 720;
  const padX = 56;
  const contentW = W - padX * 2;

  // Ukur tinggi dinamis dulu (header + tiap baris + footer).
  const measure = document.createElement('canvas').getContext('2d');
  measure.font = '500 22px Arial, sans-serif';
  let bodyH = 0;
  const rowLines = rows.map(({ label, value }) => {
    const lines = wrapText(measure, value, contentW);
    bodyH += 30 + lines.length * 30 + 18; // label + nilai + jarak
    return { label, lines };
  });
  measure.font = '400 19px Arial, sans-serif';
  const footerLines = wrapText(measure, meta.footer || '', contentW);
  const headerH = 196;
  const footerH = 44 + footerLines.length * 28 + 40;
  const H = headerH + 32 + bodyH + footerH;

  const canvas = document.createElement('canvas');
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Latar
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, W, headerH);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, headerH - 6, W, 6);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = GOLD;
  ctx.font = '700 15px Arial, sans-serif';
  ctx.fillText((meta.eyebrow || 'BUKTI PENDAFTARAN KUNJUNGAN').toUpperCase(), padX, 64);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 34px Arial, sans-serif';
  ctx.fillText(meta.title || 'Ringkasan Pendaftaran', padX, 108);

  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = '400 19px Arial, sans-serif';
  if (meta.subtitle) ctx.fillText(meta.subtitle, padX, 142);

  // Baris ringkasan
  let y = headerH + 48;
  rowLines.forEach(({ label, lines }) => {
    ctx.fillStyle = INK_SOFT;
    ctx.font = '700 14px Arial, sans-serif';
    ctx.fillText(String(label).toUpperCase(), padX, y);
    y += 28;
    ctx.fillStyle = INK;
    ctx.font = '500 22px Arial, sans-serif';
    lines.forEach((ln) => {
      ctx.fillText(ln, padX, y);
      y += 30;
    });
    y += 12;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(W - padX, y);
    ctx.stroke();
    y += 24;
  });

  // Footer instruksi (kotak emas lembut)
  const boxY = y;
  const boxH = footerH - 24;
  ctx.fillStyle = '#FBF4E2';
  ctx.fillRect(padX - 16, boxY, contentW + 32, boxH);
  ctx.fillStyle = GOLD;
  ctx.fillRect(padX - 16, boxY, 6, boxH);
  ctx.fillStyle = INK;
  ctx.font = '400 19px Arial, sans-serif';
  let fy = boxY + 38;
  footerLines.forEach((ln) => {
    ctx.fillText(ln, padX + 4, fy);
    fy += 28;
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    fileName: meta.fileName || 'pendaftaran-kunjungan.png',
  };
}

// Unduh hasil buildRegistrationImage ke perangkat tamu.
export function downloadRegistrationImage(rows, meta = {}) {
  const { dataUrl, fileName } = buildRegistrationImage(rows, meta);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
