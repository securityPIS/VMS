// Input teks dengan label. Teruskan props standar <input> (value, onChange, dst).
// Gaya premium: surface lembut, hairline, dan ring fokus bernuansa merek.
// `error`: bila true, border & ring berubah merah untuk menandai isian wajib kosong.
const InputField = ({ label, className = '', error = false, hint = '', ...props }) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label htmlFor={props.id} className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">
        {label}
      </label>
    )}
    <input
      className={`w-full px-4 py-3 bg-white/70 border rounded-2xl outline-none text-ink transition-all duration-200 placeholder:text-ink-muted/50 ${
        error
          ? 'border-[#BA313B] ring-4 ring-[#BA313B]/15 focus:border-[#BA313B] focus:ring-[#BA313B]/20 bg-[#FBE9EA]/40'
          : 'border-line hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15'
      }`}
      aria-invalid={error || undefined}
      {...props}
    />
    {error && hint && <p className="text-xs text-[#BA313B] mt-1.5 ml-0.5">{hint}</p>}
  </div>
);

export default InputField;
