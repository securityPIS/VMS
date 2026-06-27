// Form registrasi tamu baru / reservasi tamu lama (PRD 3.1-3.2, UIUX 5.2-5.3).
// Foto KTP/selfie ditangkap via kamera (PhotoCapture) lalu diunggah ke backend
// (api.uploadPhoto) sebelum submit kunjungan (api.submitVisit).
// Setelah submit berhasil, tampil layar ucapan terima kasih + ringkasan
// pendaftaran; tamu terjadwal bisa menyimpan ringkasan sebagai gambar.
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle, Download, MapPin, Phone, ShieldCheck, Users } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Button from '../components/Button';
import InputField from '../components/InputField';
import PhotoCapture, { makeThumb } from '../components/PhotoCapture';
import { api } from '../lib/api';
import { dateID, formatPhoneID, LOCATIONS, phoneDigits } from '../lib/constants';
import { downloadRegistrationImage } from '../lib/registrationImage';

const MIN_PHONE_DIGITS = 9;

const VisitorFormScreen = ({ user, onSubmit }) => {
  const isReturning = user.type === 'returning';
  const today = dateID();
  const [formData, setFormData] = useState({
    name: user.name || '',
    ktp: '',
    phone: '',            // hanya digit; ditampilkan terformat xxxx-xxxx-xxxx
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
  const [attempted, setAttempted] = useState(false);  // tandai isian wajib setelah submit pertama
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);         // ringkasan setelah submit sukses

  // Lokasi/gerbang kedatangan — agar kunjungan masuk antrean petugas yang tepat.
  useEffect(() => {
    let alive = true;
    api.getLocations()
      .then((list) => { if (alive && list && list.length) setLocations(list.map((l) => l.name)); })
      .catch(() => { /* fallback ke LOCATIONS */ });
    return () => { alive = false; };
  }, []);

  // Semua isian wajib. Validasi mengembalikan map field→true bila kosong/invalid.
  const errors = useMemo(() => {
    const e = {};
    if (!isReturning) {
      if (!formData.name.trim()) e.name = true;
      if (phoneDigits(formData.ktp).length !== 16) e.ktp = true;
      if (!formData.asal.trim()) e.asal = true;
      if (!ktpPhoto) e.ktpPhoto = true;
    }
    if (phoneDigits(formData.phone).length < MIN_PHONE_DIGITS) e.phone = true;
    if (!formData.location) e.location = true;
    if (!formData.tujuan.trim()) e.tujuan = true;
    if (!formData.keperluan.trim()) e.keperluan = true;
    if (formData.scheduleType === 'SCHEDULE' && !(formData.scheduledDate >= today)) e.scheduledDate = true;
    if (!selfiePhoto) e.selfiePhoto = true;
    if (!formData.consent) e.consent = true;
    return e;
  }, [formData, ktpPhoto, selfiePhoto, isReturning, today]);

  const isFormValid = Object.keys(errors).length === 0;
  const showErr = (field) => attempted && !!errors[field];

  const setPhone = (raw) => setFormData((f) => ({ ...f, phone: phoneDigits(raw) }));

  const summaryRows = (visitId, status) => {
    const rows = [{ label: 'Nama Lengkap', value: formData.name }];
    if (!isReturning || formData.asal) rows.push({ label: 'Asal / Instansi', value: formData.asal || '-' });
    rows.push(
      { label: 'Nomor Telepon', value: formatPhoneID(formData.phone) },
      { label: 'Lokasi / Gerbang', value: formData.location },
      { label: 'Orang yang Dituju', value: formData.tujuan },
      { label: 'Keperluan', value: formData.keperluan },
      {
        label: 'Waktu Kunjungan',
        value: formData.scheduleType === 'SCHEDULE' ? `Terjadwal — ${formData.scheduledDate}` : 'Sekarang',
      },
      { label: 'ID Pendaftaran', value: visitId },
      { label: 'Status', value: status === 'PENDING' ? 'Menunggu verifikasi petugas' : status },
    );
    return rows;
  };

  const handleSubmit = async () => {
    setAttempted(true);
    if (!isFormValid) {
      setError('Beberapa isian wajib masih kosong atau belum benar. Mohon lengkapi bagian yang ditandai merah.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // Buat thumbnail kecil dulu (di klien) lalu unggah penuh + thumb sekaligus.
      // Selfie & KTP diunggah paralel (tiap upload = round-trip + createFile Drive
      // yang lambat); keduanya independen, jadi tak perlu berurutan.
      const [selfieThumb, ktpThumb] = await Promise.all([
        selfiePhoto ? makeThumb(selfiePhoto) : Promise.resolve(''),
        (!isReturning && ktpPhoto) ? makeThumb(ktpPhoto) : Promise.resolve(''),
      ]);
      const [selfieRes, ktpRes] = await Promise.all([
        selfiePhoto ? api.uploadPhoto(selfiePhoto, 'selfie', selfieThumb) : Promise.resolve({ id: '', thumb_id: '' }),
        (!isReturning && ktpPhoto) ? api.uploadPhoto(ktpPhoto, 'ktp', ktpThumb) : Promise.resolve({ id: '', thumb_id: '' }),
      ]);
      const selfieRef = selfieRes.id || '';
      const selfieThumbRef = selfieRes.thumb_id || '';
      const ktpRef = ktpRes.id || '';
      const ktpThumbRef = ktpRes.thumb_id || '';

      const res = await api.submitVisit({
        email: user.email,
        name: formData.name,
        ktp: formData.ktp,
        phone: phoneDigits(formData.phone),
        asal: formData.asal,
        tujuan: formData.tujuan,
        keperluan: formData.keperluan,
        location: formData.location,
        schedule_type: formData.scheduleType,
        scheduled_date: formData.scheduleType === 'SCHEDULE' ? formData.scheduledDate : '',
        consent: formData.consent,
        selfie_url: selfieRef,
        selfie_thumb_url: selfieThumbRef,
        ktp_photo_url: ktpRef,
        ktp_thumb_url: ktpThumbRef,
      });
      const status = res.status || 'PENDING';
      setResult({
        visitId: res.visit_id,
        status,
        tujuan: formData.tujuan,
        location: formData.location,
        scheduleType: formData.scheduleType,
        rows: summaryRows(res.visit_id, status),
      });
    } catch (err) {
      setError(err.message || 'Gagal mengirim registrasi. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Layar ucapan terima kasih + ringkasan (setelah submit sukses) ----------
  if (result) {
    const isSchedule = result.scheduleType === 'SCHEDULE';
    const handleSaveImage = () => {
      downloadRegistrationImage(result.rows, {
        eyebrow: 'Bukti Pendaftaran Kunjungan',
        title: 'Ringkasan Pendaftaran',
        subtitle: 'Sistem Manajemen Tamu — Pertamina',
        footer: `Penting: Saat tiba di lokasi, tamu tetap WAJIB konfirmasi kedatangan ke petugas security di lobi ${result.location}. Tunjukkan ringkasan ini kepada petugas.`,
        fileName: `pendaftaran-${result.visitId}.png`,
      });
    };

    return (
      <div className="min-h-screen p-4 md:py-10 flex justify-center">
        <div className="w-full max-w-lg surface-raised rounded-[28px] overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="relative bg-ink-gradient px-6 py-8 text-white text-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(28rem 28rem at 80% -30%, #3C6DB2, transparent 60%)' }} />
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 bg-[#E6F893] text-[#192100] rounded-full flex items-center justify-center mb-4 ring-8 ring-[#E6F893]/30">
                <CheckCircle size={34} />
              </div>
              <p className="eyebrow text-gold-soft mb-1.5">Pendaftaran Terkirim</p>
              <h1 className="text-display text-white text-2xl">Terima Kasih, {formData.name}</h1>
              <p className="text-white/70 text-sm mt-2">
                Registrasi kunjungan Anda berhasil dikirim.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Petunjuk konfirmasi ke security */}
            <section className="bg-gold-light/50 p-4 rounded-2xl border border-gold-soft/40 flex items-start gap-3">
              <ShieldCheck size={22} className="text-brand-700 shrink-0 mt-0.5" />
              <div className="text-sm text-ink-soft leading-relaxed">
                {isSchedule ? (
                  <>
                    Kunjungan Anda <strong>terjadwal</strong>. Saat tiba nanti, Anda <strong>tetap wajib
                    konfirmasi kedatangan</strong> ke petugas security di lobi <strong>{result.location}</strong>{' '}
                    tempat Anda mendaftar. Simpan ringkasan di bawah sebagai bukti.
                  </>
                ) : (
                  <>
                    Jika Anda datang <strong>sekarang</strong>, harap segera <strong>konfirmasi ke petugas
                    security di lobi {result.location}</strong> tempat Anda mendaftar untuk proses check-in.
                  </>
                )}
              </div>
            </section>

            {/* Ringkasan pendaftaran */}
            <section className="rounded-2xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-brand-50/60 border-b border-line">
                <h2 className="text-sm font-semibold text-ink">Ringkasan Pendaftaran</h2>
              </div>
              <dl className="divide-y divide-line">
                {result.rows.map((row) => (
                  <div key={row.label} className="px-4 py-2.5 flex gap-3">
                    <dt className="text-xs font-semibold text-ink-soft w-36 shrink-0 pt-0.5">{row.label}</dt>
                    <dd className="text-sm text-ink break-words flex-1">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {isSchedule && (
              <Button variant="tonal" className="w-full h-12" onClick={handleSaveImage}>
                <Download size={18} />
                Simpan Ringkasan sebagai Gambar
              </Button>
            )}

            <Button
              variant="filled"
              className="w-full h-14 text-base"
              onClick={() => onSubmit({ visitId: result.visitId, status: result.status, tujuan: result.tujuan })}
            >
              <CheckCircle size={20} />
              Lihat Status Kunjungan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Form pendaftaran -------------------------------------------------------
  // Field Nomor Telepon dipakai di bagian "Informasi Pribadi" untuk tamu baru
  // maupun lama, jadi diekstrak agar tidak duplikat.
  const phoneField = (
    <div className="w-full">
      <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5 flex items-center gap-1.5">
        <Phone size={13} className="text-brand-600" /> Nomor Telepon
      </label>
      <input
        type="tel"
        inputMode="numeric"
        placeholder="xxxx-xxxx-xxxx"
        value={formatPhoneID(formData.phone)}
        onChange={(e) => setPhone(e.target.value)}
        className={`w-full px-4 py-3 bg-white/70 border rounded-2xl outline-none text-ink transition-all duration-200 placeholder:text-ink-muted/50 ${
          showErr('phone')
            ? 'border-[#BA313B] ring-4 ring-[#BA313B]/15 bg-[#FBE9EA]/40'
            : 'border-line hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15'
        }`}
      />
      {showErr('phone') && <p className="text-xs text-[#BA313B] mt-1.5 ml-0.5">Nomor telepon wajib diisi (minimal {MIN_PHONE_DIGITS} digit).</p>}
    </div>
  );

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
          <section className="space-y-4">
            <h2 className="text-xl text-display flex items-center gap-2.5 border-b border-line pb-3">
              <Users size={20} className="text-brand-600" /> Informasi Pribadi
            </h2>
            {!isReturning && (
              <>
                <div className="w-full">
                  <InputField
                    label="Nama Lengkap"
                    value={formData.name}
                    readOnly
                    error={showErr('name')}
                    hint="Nama wajib diisi."
                    className="[&_input]:bg-brand-50/40 [&_input]:cursor-not-allowed"
                  />
                  <p className="text-[11px] text-ink-muted mt-1.5 ml-0.5">Diambil otomatis dari akun Google Anda.</p>
                </div>
                <InputField
                  label="Nomor KTP (16 Digit)"
                  type="number"
                  placeholder="Contoh: 3171234567890123"
                  value={formData.ktp}
                  error={showErr('ktp')}
                  hint="Nomor KTP wajib 16 digit."
                  onChange={(e) => setFormData({ ...formData, ktp: e.target.value })}
                />
              </>
            )}
            {phoneField}
            {!isReturning && (
              <>
                <InputField
                  label="Asal / Instansi"
                  placeholder="Darimana Anda berasal"
                  value={formData.asal}
                  error={showErr('asal')}
                  hint="Asal / instansi wajib diisi."
                  onChange={(e) => setFormData({ ...formData, asal: e.target.value })}
                />
                <PhotoCapture label="Foto KTP Asli" value={ktpPhoto} onChange={setKtpPhoto} capture="environment" error={showErr('ktpPhoto')} />
              </>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-display flex items-center gap-2.5 border-b border-line pb-3">
              <MapPin size={20} className="text-brand-600" /> Detail Kunjungan
            </h2>
            <div className="w-full">
              <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Lokasi / Gerbang Kedatangan</label>
              <select
                className={`w-full px-4 py-3 bg-white/70 border rounded-2xl outline-none text-ink transition-all duration-200 ${
                  showErr('location')
                    ? 'border-[#BA313B] ring-4 ring-[#BA313B]/15 bg-[#FBE9EA]/40'
                    : 'border-line hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15'
                }`}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                <option value="" disabled>Pilih lokasi kedatangan…</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {showErr('location') && <p className="text-xs text-[#BA313B] mt-1.5 ml-0.5">Lokasi kedatangan wajib dipilih.</p>}
            </div>
            <InputField
              label="Orang yang Dituju"
              placeholder="Nama karyawan / departemen"
              value={formData.tujuan}
              error={showErr('tujuan')}
              hint="Orang yang dituju wajib diisi."
              onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
            />
            <div className="w-full">
              <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Keperluan Kunjungan</label>
              <textarea
                className={`w-full px-4 py-3 bg-white/70 border rounded-2xl outline-none text-ink transition-all duration-200 min-h-[100px] resize-none ${
                  showErr('keperluan')
                    ? 'border-[#BA313B] ring-4 ring-[#BA313B]/15 bg-[#FBE9EA]/40'
                    : 'border-line hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15'
                }`}
                placeholder="Jelaskan secara singkat keperluan Anda..."
                value={formData.keperluan}
                onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
              />
              {showErr('keperluan') && <p className="text-xs text-[#BA313B] mt-1.5 ml-0.5">Keperluan kunjungan wajib diisi.</p>}
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
                      className={`w-full pl-11 pr-4 py-3 bg-white/70 border rounded-2xl outline-none text-ink transition-all duration-200 ${
                        showErr('scheduledDate')
                          ? 'border-[#BA313B] ring-4 ring-[#BA313B]/15 bg-[#FBE9EA]/40'
                          : 'border-line hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15'
                      }`}
                    />
                  </div>
                  {showErr('scheduledDate') && <p className="text-xs text-[#BA313B] mt-1.5 ml-0.5">Tanggal kunjungan wajib dipilih (tidak boleh sebelum hari ini).</p>}
                </div>
              )}
            </div>
            <PhotoCapture label="Verifikasi Wajah (Selfie)" value={selfiePhoto} onChange={setSelfiePhoto} capture="user" error={showErr('selfiePhoto')} />
          </section>

          <section className={`bg-gold-light/50 p-4 rounded-2xl border transition-colors ${
            showErr('consent') ? 'border-[#BA313B] ring-4 ring-[#BA313B]/15' : 'border-gold-soft/40'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-brand-600" checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })} />
              <span className="text-xs text-ink-soft leading-relaxed">
                Saya menyetujui data pribadi saya (nama, NIK, nomor telepon, foto wajah, dan KTP) diproses oleh Pertamina untuk
                keperluan keamanan kunjungan sesuai dengan <strong>Undang-Undang Perlindungan Data Pribadi (UU PDP)</strong>. Data akan
                disimpan maksimal 1 bulan.
              </span>
            </label>
            {showErr('consent') && <p className="text-xs text-[#BA313B] mt-2 ml-8">Persetujuan wajib dicentang untuk melanjutkan.</p>}
          </section>

          {error && (
            <div role="alert" className="px-4 py-3 rounded-[12px] bg-[#FBE9EA] border border-[#E9A6AB] text-[#7A1D24] text-sm">
              {error}
            </div>
          )}

          <Button variant="filled" className="w-full h-14 text-base" disabled={submitting} onClick={handleSubmit}>
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
