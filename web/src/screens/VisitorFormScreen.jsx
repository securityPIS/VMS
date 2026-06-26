// Form registrasi tamu baru / reservasi tamu lama (PRD 3.1-3.2, UIUX 5.2-5.3).
// Foto KTP/selfie ditangkap via kamera (PhotoCapture) lalu diunggah ke backend
// (api.uploadPhoto) sebelum submit kunjungan (api.submitVisit).
import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle, MapPin, Users } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Button from '../components/Button';
import InputField from '../components/InputField';
import PhotoCapture from '../components/PhotoCapture';
import { api } from '../lib/api';
import { dateID, LOCATIONS } from '../lib/constants';

const VisitorFormScreen = ({ user, onSubmit }) => {
  const isReturning = user.type === 'returning';
  const today = dateID();
  const [formData, setFormData] = useState({
    name: user.name,
    ktp: '',
    asal: user.asal || '',
    tujuan: '',
    keperluan: '',
    location: '',
    scheduleType: 'NOW',
    scheduledDate: today,
    consent: false,
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
    ? formData.tujuan && formData.keperluan && formData.location &&
      (formData.scheduleType === 'NOW' || formData.scheduledDate >= today) && selfiePhoto && formData.consent
    : formData.name && formData.ktp.length === 16 && formData.asal && formData.tujuan &&
      formData.keperluan && formData.location &&
      (formData.scheduleType === 'NOW' || formData.scheduledDate >= today) && ktpPhoto && selfiePhoto && formData.consent;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      // Selfie & KTP diunggah paralel (tiap upload = round-trip + createFile Drive
      // yang lambat); keduanya independen, jadi tak perlu berurutan.
      const [selfieRes, ktpRes] = await Promise.all([
        selfiePhoto ? api.uploadPhoto(selfiePhoto, 'selfie') : Promise.resolve({ id: '' }),
        (!isReturning && ktpPhoto) ? api.uploadPhoto(ktpPhoto, 'ktp') : Promise.resolve({ id: '' }),
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
        schedule_type: formData.scheduleType,
        scheduled_date: formData.scheduleType === 'SCHEDULE' ? formData.scheduledDate : '',
        consent: formData.consent,
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
    <div className="min-h-screen p-4 md:py-10 flex justify-center">
      <div className="w-full max-w-lg surface-raised rounded-[28px] overflow-hidden">
        <div className="relative bg-ink-gradient px-6 py-8 text-white text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(28rem 28rem at 80% -30%, #3C6DB2, transparent 60%)' }} />
          <div className="relative">
            <BrandLogo className="h-7 justify-center brightness-0 invert mb-4" />
            <p className="eyebrow text-gold-soft mb-1.5">Registrasi Kunjungan</p>
            <h1 className="text-display text-white text-2xl">Halo, {user.name}</h1>
            <p className="text-white/70 text-sm mt-2">
              {isReturning ? 'Silakan isi detail kunjungan Anda hari ini.' : 'Lengkapi data diri untuk registrasi tamu.'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {!isReturning && (
            <section className="space-y-4">
              <h2 className="text-xl text-display flex items-center gap-2.5 border-b border-line pb-3">
                <Users size={20} className="text-brand-600" /> Informasi Pribadi
              </h2>
              <InputField label="Nama Lengkap" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <InputField label="Nomor KTP (16 Digit)" type="number" placeholder="Contoh: 3171234567890123" value={formData.ktp} onChange={(e) => setFormData({ ...formData, ktp: e.target.value })} />
              <InputField label="Asal / Instansi" placeholder="Darimana Anda berasal" value={formData.asal} onChange={(e) => setFormData({ ...formData, asal: e.target.value })} />
              <PhotoCapture label="Foto KTP Asli" value={ktpPhoto} onChange={setKtpPhoto} capture="environment" />
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-xl text-display flex items-center gap-2.5 border-b border-line pb-3">
              <MapPin size={20} className="text-brand-600" /> Detail Kunjungan
            </h2>
            <div className="w-full">
              <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Lokasi / Gerbang Kedatangan</label>
              <select
                className="w-full px-4 py-3 bg-white/70 border border-line rounded-2xl outline-none text-ink transition-all duration-200 hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
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
              <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Keperluan Kunjungan</label>
              <textarea
                className="w-full px-4 py-3 bg-white/70 border border-line rounded-2xl outline-none text-ink transition-all duration-200 hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15 min-h-[100px] resize-none"
                placeholder="Jelaskan secara singkat keperluan Anda..."
                value={formData.keperluan}
                onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
              />
            </div>
            <div className="w-full">
              <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-2 ml-0.5">Waktu Kunjungan</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'NOW', label: 'Sekarang' },
                  { key: 'SCHEDULE', label: 'Pilih tanggal' },
                ].map((option) => {
                  const active = formData.scheduleType === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, scheduleType: option.key, scheduledDate: formData.scheduledDate || today })}
                      className={`h-12 rounded-full border text-sm font-medium transition-all duration-200 ${
                        active ? 'bg-brand-50 border-brand-400 text-brand-800 ring-2 ring-brand-500/15' : 'border-line text-ink-soft hover:border-brand-200 hover:bg-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {formData.scheduleType === 'SCHEDULE' && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Tanggal Kunjungan</label>
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-600 z-10" />
                    <input
                      type="date"
                      min={today}
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white/70 border border-line rounded-2xl outline-none text-ink transition-all duration-200 hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
                    />
                  </div>
                </div>
              )}
            </div>
            <PhotoCapture label="Verifikasi Wajah (Selfie)" value={selfiePhoto} onChange={setSelfiePhoto} capture="user" />
          </section>

          <section className="bg-gold-light/50 p-4 rounded-2xl border border-gold-soft/40">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-brand-600" checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })} />
              <span className="text-xs text-ink-soft leading-relaxed">
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
