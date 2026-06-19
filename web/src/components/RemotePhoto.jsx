// Menampilkan foto dari "ref" yang bisa berupa URL langsung (http/data — mode mock)
// atau id file Drive privat (mode backend, diambil base64 via api.getPhoto).
// Mengembalikan null bila ref kosong / gagal dimuat (caller boleh tampilkan placeholder).
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const DIRECT = /^(https?:|data:)/;

const RemotePhoto = ({ refId, alt = '', className = '' }) => {
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
  return <img src={src} alt={alt} className={className} />;
};

export default RemotePhoto;
