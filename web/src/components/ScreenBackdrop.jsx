// Latar dekoratif untuk layar publik (login & alur tamu): gradien korporat + orb
// lembut blur + tekstur dot grid. Fixed ke viewport (bukan absolute) agar tetap
// konsisten di halaman panjang seperti form registrasi. CSS murni, tanpa aset
// gambar, agar tetap ringan.
const ScreenBackdrop = () => (
  <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
    <div
      className="absolute inset-0 opacity-[0.15]"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
    />
    <div className="absolute -top-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-brand-300/40 blur-3xl animate-float" />
    <div className="absolute top-1/3 -right-36 w-[34rem] h-[34rem] rounded-full bg-gold/25 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
    <div className="absolute -bottom-44 left-1/4 w-[32rem] h-[32rem] rounded-full bg-pertamina-green/20 blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
  </div>
);

export default ScreenBackdrop;
