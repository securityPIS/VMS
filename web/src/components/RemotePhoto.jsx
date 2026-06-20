// Menampilkan foto dari "ref" yang bisa berupa URL langsung (http/data — mode mock)
// atau id file Drive privat (mode backend, diambil base64 via api.getPhoto).
// Mengembalikan null bila ref kosong / gagal dimuat (caller boleh tampilkan placeholder).
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const DIRECT = /^(https?:|data:)/;

const RemotePhoto = ({ refId, alt = '', className = '', openInNewTab = false }) => {
  const [src, setSrc] = useState(() => (DIRECT.test(refId || '') ? refId : ''));

  useEffect(() => {
    let alive = true;
    if (!refId) { setSrc(''); return undefined; }
    if (DIRECT.test(refId)) { setSrc(refId); return undefined; }
    api.getPhoto(refId)
      .then((uri) => { if (alive) setSrc(uri); })
      .catch(() => { if (alive) setSrc(''); });
    return () => { alive = false; };
  }, [refId]);

  if (!src) return null;

  const openPhoto = (event) => {
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
    img.src = src;
    img.alt = alt;
    img.style.maxWidth = '100vw';
    img.style.maxHeight = '100vh';
    img.style.objectFit = 'contain';
    win.document.body.appendChild(img);
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
      src={src}
      alt={alt}
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
