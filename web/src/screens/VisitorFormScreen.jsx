// Form registrasi tamu baru / reservasi tamu lama (PRD 3.1-3.2, UIUX 5.2-5.3).
// Foto KTP/selfie ditangkap via kamera (PhotoCapture) lalu diunggah ke backend
// (api.uploadPhoto) sebelum submit kunjungan (api.submitVisit).
import { useEffect, useState } from 'react';
import { Users, MapPin, CheckCircle } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Button from '../components/Button';
import InputField from '../components/InputField';
import PhotoCapture from '../components/PhotoCapture';
import { api } from '../lib/api';
import { LOCATIONS } from '../lib/constants';

const VisitorFormScreen = ({ user, onSubmit }) => {
  const isReturning = user.type === 'returning';
  const [formData, setFormData] = useState({
    name: user.name, ktp: '', asal: user.asal || '', tujuan: '', keperluan: '', location: '', consent: false,
  });
  const [ktpPhoto, setKtpPhoto] = useState('');       // data URL atau ''
  const [selfiePhoto, setSelfiePhoto] = useState(''); // data URL atau ''
  const [locations, setLocations] = useState(LOCATIONS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Lokasi/gerbang kedatangan — agar kunjungan masuk antrean petugas yang tepat.
  useEffect(() => {
    let alive = true;
    api.getLocations()
      .then((list) => { if (alive && list && list.length) setLocations(list.map((l) => l.name)); })
      .catch(() => { /* fallback ke LOCATIONS */ });
    return () => { alive = false; };
  }, []);

  const isFormValid = isReturning
    ? formData.tujuan && formData.keperluan && formData.location && selfiePhoto && formData.consent
    : formData.name && formData.ktp.length === 16 && formData.asal && formData.tujuan &&
      formData.keperluan && formData.location && ktpPhoto && selfiePhoto && formData.consent;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      // Selfie & KTP diunggah paralel (tiap upload = round-trip + createFile Drive
      // yang lambat); keduanya independen, jadi tak perlu berurutan.
      const [selfieRes, ktpRes] = await Promise.all([
        selfiePhoto ? api.uploadPhoto(selfiePhoto, 'selfie', user.email) : Promise.resolve({ id: '' }),
        (!isReturning && ktpPhoto) ? api.uploadPhoto(ktpPhoto, 'ktp', user.email) : Promise.resolve({ id: '' }),
      ]);
      const selfieRef = selfieRes.id || '';
      const ktpRef = ktpRes.id || '';

      const res = await api.submitVisit({
        email: user.email,
        name: formData.name,
        ktp: formData.ktp,
        asal: formData.asal,
        tujuan: formData.tujuan,
        keperluan: formData.keperluan,
        location: formData.location,
        selfie_url: selfieRef,
        ktp_photo_url: ktpRef,
      });
      onSubmit({ visitId: res.visit_id, status: res.status || 'PENDING', tujuan: formData.tujuan });
    } catch (err) {
      setError(err.message || 'Gagal mengirim registrasi. Coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2F6] p-4 md:py-8 flex justify-center">
      <div className="w-full max-w-lg bg-[#FDFBFF] rounded-[28px] shadow-sm overflow-hidden">
        <div className="bg-[#3C6DB2] p-6 text-white text-center">
          <BrandLogo className="h-8 justify-center brightness-0 invert mb-4" />
          <h1 className="text-2xl font-normal">Halo, {user.name}</h1>
          <p className="text-white/80 text-sm mt-1">
            {isReturning ? 'Silakan isi detail kunjungan Anda hari ini.' : 'Lengkapi data diri untuk registrasi tamu.'}
          </p>
        </div>

        <div className="p-6 space-y-8">
          {!isReturning && (
            <section className="space-y-4">
              <h2 className="text-lg font-medium text-[#1A1B1E] flex items-center gap-2 border-b border-[#EAE7EC] pb-2">
                <Users size={20} className="text-[#3C6DB2]" /> Informasi Pribadi
              </h2>
              <InputField label="Nama Lengkap" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <InputField label="Nomor KTP (16 Digit)" type="number" placeholder="Contoh: 3171234567890123" value={formData.ktp} onChange={(e) => setFormData({ ...formData, ktp: e.target.value })} />
              <InputField label="Asal / Instansi" placeholder="Darimana Anda berasal" value={formData.asal} onChange={(e) => setFormData({ ...formData, asal: e.target.value })} />
              <PhotoCapture label="Foto KTP Asli" value={ktpPhoto} onChange={setKtpPhoto} capture="environment" />
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-medium text-[#1A1B1E] flex items-center gap-2 border-b border-[#EAE7EC] pb-2">
              <MapPin size={20} className="text-[#3C6DB2]" /> Detail Kunjungan
            </h2>
            <div className="w-full">
              <label className="block text-xs font-medium text-[#44474E] mb-1 ml-1">Lokasi / Gerbang Kedatangan</label>
              <select
                className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#3C6DB2] text-[#1A1B1E]"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                <option value="" disabled>Pilih lokasi kedatangan…</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <InputField label="Orang yang Dituju" placeholder="Nama karyawan / departemen" value={formData.tujuan} onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })} />
            <div className="w-full">
              <label className="block text-xs font-medium text-[#44474E] mb-1 ml-1">Keperluan Kunjungan</label>
              <textarea
                className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#3C6DB2] text-[#1A1B1E] min-h-[100px] resize-none"
                placeholder="Jelaskan secara singkat keperluan Anda..."
                value={formData.keperluan}
                onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
              />
            </div>
            <PhotoCapture label="Verifikasi Wajah (Selfie)" value={selfiePhoto} onChange={setSelfiePhoto} capture="user" />
          </section>

          <section className="bg-[#E6F893]/30 p-4 rounded-[16px] border border-[#E6F893]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-[#3C6DB2]" checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })} />
              <span className="text-xs text-[#192100] leading-relaxed">
                Saya menyetujui data pribadi saya (nama, NIK, foto wajah, dan KTP) diproses oleh Pertamina untuk keperluan
                keamanan kunjungan sesuai dengan <strong>Undang-Undang Perlindungan Data Pribadi (UU PDP)</strong>. Data akan
                disimpan maksimal 1 bulan.
              </span>
            </label>
          </section>

          {error && (
            <div role="alert" className="px-4 py-3 rounded-[12px] bg-[#FBE9EA] border border-[#E9A6AB] text-[#7A1D24] text-sm">
              {error}
            </div>
          )}

          <Button variant="filled" className="w-full h-14 text-base" disabled={!isFormValid || submitting} onClick={handleSubmit}>
            {submitting ? 'Mengirim…' : (
              <>
                <CheckCircle size={20} />
                {isReturning ? 'Kirim Reservasi Kunjungan' : 'Kirim Registrasi'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VisitorFormScreen;
