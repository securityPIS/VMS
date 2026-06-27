// Menampilkan foto dari "ref" yang bisa berupa URL langsung (http/data — mode mock)
// atau id file Drive privat (mode backend, diambil base64 via api.getPhoto).
//
// Performa mobile:
// - Lazy-load: foto baru diunduh saat elemen mendekati viewport (IntersectionObserver),
//   bukan saat render. Hemat kuota di daftar/tabel yang panjang.
// - `refId` sebaiknya versi thumbnail (kecil) untuk tampilan inline; `fullId` opsional
//   = versi penuh yang dibuka saat klik (openInNewTab).
// Mengembalikan placeholder ringan sebelum termuat, dan null bila ref kosong/gagal.
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

const DIRECT = /^(https?:|data:)/;

const RemotePhoto = ({ refId, fullId = '', alt = '', className = '', openInNewTab = false }) => {
  const holderRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);

  // Tunda pemuatan sampai elemen mendekati viewport (rootMargin 200px).
  useEffect(() => {
    if (visible) return undefined;
    const el = holderRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return undefined; }
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setVisible(true); obs.disconnect(); }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    let alive = true;
    setFailed(false);
    if (!refId) { setSrc(''); return undefined; }
    if (DIRECT.test(refId)) { setSrc(refId); return undefined; }
    api.getPhoto(refId)
      .then((uri) => { if (alive) { setSrc(uri || ''); if (!uri) setFailed(true); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [visible, refId]);

  if (!refId || failed) return null;

  // Placeholder dengan className yang sama agar layout & visibilitas (hidden md:block dst)
  // konsisten dan tidak terjadi pergeseran tata letak saat foto belum termuat.
  if (!src) {
    return <div ref={holderRef} className={`${className} bg-ink/[0.05] animate-pulse`} aria-hidden="true" />;
  }

  const openPhoto = async (event) => {
    if (!openInNewTab) return;
    event.stopPropagation();
    const win = window.open('about:blank', '_blank');
    if (!win) return;
    win.opener = null;
    win.document.title = alt || 'Foto';
    win.document.body.style.margin = '0';
    win.document.body.style.background = '#111';
    win.document.body.style.display = 'grid';
    win.document.body.style.minHeight = '100vh';
    win.document.body.style.placeItems = 'center';
    const img = win.document.createElement('img');
    img.src = src; // tampilkan thumb dulu, lalu tukar ke versi penuh bila ada
    img.alt = alt;
    img.style.maxWidth = '100vw';
    img.style.maxHeight = '100vh';
    img.style.objectFit = 'contain';
    win.document.body.appendChild(img);
    if (fullId && fullId !== refId) {
      try {
        const full = await api.getPhoto(fullId);
        if (full && !win.closed) img.src = full;
      } catch { /* tetap pakai thumb bila gagal */ }
    }
  };

  const handleKeyDown = (event) => {
    if (!openInNewTab) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPhoto(event);
    }
  };

  return (
    <img
      ref={holderRef}
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      role={openInNewTab ? 'button' : undefined}
      tabIndex={openInNewTab ? 0 : undefined}
      title={openInNewTab ? 'Buka gambar di tab baru' : undefined}
      onClick={openInNewTab ? openPhoto : undefined}
      onKeyDown={openInNewTab ? handleKeyDown : undefined}
    />
  );
};

export default RemotePhoto;
