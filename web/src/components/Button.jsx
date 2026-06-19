// Tombol serbaguna. variant: filled | tonal | outlined | text | danger | success.
const VARIANTS = {
  filled: 'bg-[#3C6DB2] hover:bg-[#2A5288] text-white shadow-sm hover:shadow-md',
  tonal: 'bg-[#D5E3FF] hover:bg-[#B3C8F2] text-[#001B3E]',
  outlined: 'border border-[#74777F] hover:bg-[#1A1B1E]/5 text-[#3C6DB2]',
  text: 'hover:bg-[#1A1B1E]/5 text-[#3C6DB2]',
  danger: 'bg-[#BA313B] hover:bg-[#93242E] text-white shadow-sm',
  success: 'bg-[#ADC52D] hover:bg-[#8CA220] text-[#1A1B1E] shadow-sm',
};

const Button = ({ children, variant = 'filled', className = '', ...props }) => {
  const base =
    'flex justify-center items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  return (
    <button className={`${base} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
