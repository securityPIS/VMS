// Kontrol ambil foto: input file (membuka kamera di mobile via `capture`),
// dikompres ke JPEG (data URL base64) di sisi klien sebelum diunggah. Nilai yang
// dikelola caller berupa data URL (string) atau kosong.
import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Button from './Button';

// Kompres gambar: skala sisi terpanjang ke maxSide, encode JPEG → data URL.
async function compress(file, maxSide = 1280, quality = 0.8) {
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Gagal membaca berkas foto.'));
    r.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Berkas bukan gambar yang valid.'));
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

const PhotoCapture = ({ label, value, onChange, capture = 'user' }) => {
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
    <div className="border border-[#74777F]/30 border-dashed p-4 rounded-[16px] text-center bg-[#F4F2F6]">
      <p className="text-sm font-medium text-[#1A1B1E] mb-2">{label}</p>
      <input ref={inputRef} type="file" accept="image/*" capture={capture} className="hidden" onChange={handleFile} />
      {value ? (
        <div className="flex flex-col items-center gap-2">
          <img src={value} alt={label} className="w-24 h-24 object-cover rounded-[12px] border border-[#EAE7EC]" />
          <button type="button" className="text-xs font-medium text-[#3C6DB2] hover:underline" onClick={open}>
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
