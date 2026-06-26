// Avatar pengguna: tampilkan foto profil Google bila tersedia (klaim `picture`
// dari ID token), jika tidak fallback ke inisial nama. `className` mengatur
// ukuran/bentuk (mis. w-12 h-12 rounded-full); `fallbackClass` mengatur warna
// latar lingkaran inisial saat foto tidak ada.
import { useState } from 'react';

const Avatar = ({ src = '', name = '', className = '', fallbackClass = 'bg-brand-gradient text-white' }) => {
  const [failed, setFailed] = useState(false);
  const initial = (String(name).trim().charAt(0) || '?').toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center font-medium ${fallbackClass} ${className}`} aria-hidden="true">
      {initial}
    </div>
  );
};

export default Avatar;
