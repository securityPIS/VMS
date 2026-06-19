// Halaman login: SATU metode auth — "Masuk dengan Google". Peran (tamu baru/
// lama, security, admin) ditentukan sistem dari email via api.getRole — tidak
// ada pemilihan peran manual. Email petugas security di-assign oleh admin
// (panel admin), itulah yang dipakai getRole untuk mengenali security.
// Panel "Mode demo" hanya tampil saat USE_MOCK (backend belum aktif).
import { useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { api, USE_MOCK } from '../lib/api';
import { signInWithGoogle } from '../lib/googleAuth';
import { DEV_LOGIN_PRESETS } from '../lib/mockData';

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.3 0-1.3-.1-2.7-.4-4z" />
  </svg>
);

const LoginScreen = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devEmail, setDevEmail] = useState('');

  // Sistem yang menentukan peran dari email — bukan pilihan pengguna.
  const signIn = async (email) => {
    setError('');
    setLoading(true);
    try {
      const user = await api.getRole(email);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    // MODE DEMO: anggap login Google sukses sebagai tamu baru (jalur happy path).
    // Uji peran lain lewat panel demo di bawah.
    if (USE_MOCK) return signIn('tamu.baru@gmail.com');
    setError('');
    setLoading(true);
    try {
      const email = await signInWithGoogle();
      await signIn(email);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2F6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FDFBFF] rounded-[28px] shadow-sm p-8 flex flex-col items-center text-center">
        <BrandLogo className="h-12 mb-8 justify-center" />
        <h1 className="text-2xl font-normal text-[#1A1B1E] mb-2">Selamat Datang</h1>
        <p className="text-[#44474E] mb-8 text-sm">
          Masuk dengan akun Google Anda. Sistem akan mengenali peran Anda secara otomatis.
        </p>

        {error && (
          <div role="alert" className="w-full mb-4 px-4 py-3 rounded-[12px] bg-[#FBE9EA] border border-[#E9A6AB] text-[#7A1D24] text-sm text-left">
            {error}
          </div>
        )}

        <Button
          variant="outlined"
          className="w-full h-14 text-base bg-white text-[#1A1B1E] border-[#CFC7D2]"
          disabled={loading}
          onClick={handleGoogle}
        >
          <GoogleIcon />
          {loading ? 'Memproses…' : 'Masuk dengan Google'}
        </Button>

        {USE_MOCK && (
          <div className="w-full mt-6 pt-5 border-t border-dashed border-[#CFC7D2]">
            <p className="text-xs font-medium text-[#74777F] mb-3">
              Mode demo (backend belum aktif) — masuk sebagai:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DEV_LOGIN_PRESETS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  disabled={loading}
                  onClick={() => signIn(p.email)}
                  className="px-3 py-2 text-xs font-medium rounded-full border border-[#CFC7D2] text-[#3C6DB2] hover:bg-[#1A1B1E]/5 disabled:opacity-50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <InputField
                placeholder="atau ketik email apa pun…"
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && devEmail && signIn(devEmail)}
              />
              <Button variant="tonal" className="h-[46px] px-5" disabled={loading || !devEmail} onClick={() => signIn(devEmail)}>
                Masuk
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-[#74777F] mt-8 max-w-xs">
          Dengan masuk, Anda menyetujui Kebijakan Privasi serta Syarat &amp; Ketentuan kami (sesuai UU PDP).
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
