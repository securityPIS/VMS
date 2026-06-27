// Kontrol ambil foto: input file (membuka kamera di mobile via `capture`),
// dikompres ke WebP (fallback JPEG) data URL base64 di sisi klien sebelum
// diunggah. Nilai yang dikelola caller berupa data URL (string) atau kosong.
import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Button from './Button';

// Deteksi sekali apakah canvas bisa meng-encode WebP. Penting: bila tak didukung
// (mis. Safari lama), toDataURL('image/webp') diam-diam mengembalikan PNG yang
// justru jauh lebih besar — jadi kita cek eksplisit lalu fallback ke JPEG.
let _webpSupport;
function pickType() {
  if (_webpSupport === undefined) {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    _webpSupport = c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return _webpSupport ? 'image/webp' : 'image/jpeg';
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Berkas bukan gambar yang valid.'));
    i.src = src;
  });
}

// Skala sisi terpanjang ke maxSide lalu encode WebP/JPEG → data URL.
function encodeScaled(img, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  return canvas.toDataURL(pickType(), quality);
}

// Kompres berkas asli kamera → versi penuh (default 1280px) untuk disimpan/diunduh penuh.
async function compress(file, maxSide = 1280, quality = 0.8) {
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Gagal membaca berkas foto.'));
    r.readAsDataURL(file);
  });
  return encodeScaled(await loadImage(dataUrl), maxSide, quality);
}

// Buat thumbnail kecil (default 320px, q0.7) dari data URL versi penuh.
// Dipakai untuk daftar/tabel agar unduhan mobile jauh lebih ringan.
export async function makeThumb(dataUrl, maxSide = 320, quality = 0.7) {
  if (!dataUrl) return '';
  try {
    return encodeScaled(await loadImage(dataUrl), maxSide, quality);
  } catch {
    return ''; // gagal buat thumb → caller fallback ke versi penuh
  }
}

const PhotoCapture = ({ label, value, onChange, capture = 'user', error = false }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const open = () => inputRef.current && inputRef.current.click();

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      onChange(await compress(file));
    } catch (ex) {
      setErr(ex.message || 'Gagal memproses foto.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`border border-dashed p-4 rounded-2xl text-center transition-colors ${
      error ? 'border-[#BA313B] bg-[#FBE9EA]/40' : 'border-brand-200 bg-brand-50/40'
    }`}>
      <p className="text-sm font-semibold text-ink mb-2">{label}</p>
      <input ref={inputRef} type="file" accept="image/*" capture={capture} className="hidden" onChange={handleFile} />
      {value ? (
        <div className="flex flex-col items-center gap-2">
          <img src={value} alt={label} className="w-24 h-24 object-cover rounded-2xl border border-white shadow-premium" />
          <button type="button" className="text-xs font-semibold text-brand-700 hover:underline" onClick={open}>
            Ambil ulang
          </button>
        </div>
      ) : (
        <Button type="button" variant="tonal" className="w-full py-2.5" disabled={busy} onClick={open}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          {busy ? 'Memproses…' : 'Ambil Foto'}
        </Button>
      )}
      {err && <p className="text-xs text-[#BA313B] mt-2">{err}</p>}
    </div>
  );
};

export default PhotoCapture;
