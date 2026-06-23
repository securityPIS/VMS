// Input teks dengan label. Teruskan props standar <input> (value, onChange, dst).
// Gaya premium: surface lembut, hairline, dan ring fokus bernuansa merek.
const InputField = ({ label, className = '', ...props }) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label htmlFor={props.id} className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">
        {label}
      </label>
    )}
    <input
      className="w-full px-4 py-3 bg-white/70 border border-line rounded-2xl outline-none text-ink transition-all duration-200 placeholder:text-ink-muted/50 hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
      {...props}
    />
  </div>
);

export default InputField;
