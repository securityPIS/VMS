// Input teks dengan label. Teruskan props standar <input> (value, onChange, dst).
const InputField = ({ label, className = '', ...props }) => (
  <div className={`w-full ${className}`}>
    {label && <label className="block text-xs font-medium text-[#44474E] mb-1 ml-1">{label}</label>}
    <input
      className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#3C6DB2] text-[#1A1B1E] transition-colors placeholder:text-[#74777F]/60"
      {...props}
    />
  </div>
);

export default InputField;
