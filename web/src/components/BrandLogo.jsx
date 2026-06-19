// Logo Pertamina + wordmark VMS. Pakai signature resmi (jangan dimodifikasi).
// Untuk latar gelap, tambahkan className "brightness-0 invert" dari pemanggil.
const BrandLogo = ({ className = 'h-8' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 199 151" className="h-full w-auto">
      <path fill="#ed1b2f" d="m171.63 9.74c-3.83-5.73-10.34-9.49-17.73-9.49h-48.99l27.04 41.64c3.83 5.71 10.34 9.49 17.74 9.49h49z" />
      <path fill="#adc32b" d="m131.98 73.65c3.82-5.71 10.33-9.49 17.73-9.49h48.98l-27.04 41.64c-3.82 5.72-10.34 9.49-17.73 9.49h-49.01z" />
      <path fill="#006cb7" d="m110.78 74.76c2.7-4.08 6.05-7.66 9.93-10.6h-52.02c-7.39 0-13.91 3.78-17.72 9.49l-50.34 77.44h49.01c7.4 0 13.91-3.77 17.72-9.5z" />
    </svg>
    <div className="flex flex-col justify-center text-left">
      <span className="text-[#006cb7] font-bold text-sm md:text-base leading-tight tracking-wide text-left">VISITOR</span>
      <span className="text-[#006cb7] font-semibold text-[10px] md:text-[11px] leading-tight tracking-wide text-left">MANAGEMENT SYSTEM</span>
    </div>
  </div>
);

export default BrandLogo;
