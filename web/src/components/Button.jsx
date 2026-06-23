// Tombol serbaguna. variant: filled | tonal | outlined | text | danger | success.
// Gaya premium: gradien halus, bayangan berlapis, dan efek angkat saat hover.
const VARIANTS = {
  filled:
    'bg-brand-gradient text-white shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 ring-1 ring-brand-700/30',
  tonal:
    'bg-brand-50 hover:bg-brand-100 text-brand-800 ring-1 ring-brand-200/70 hover:-translate-y-0.5',
  outlined:
    'border border-line bg-white/60 hover:bg-white text-brand-700 hover:border-brand-300 hover:-translate-y-0.5 shadow-sm hover:shadow-premium',
  text: 'hover:bg-ink/[0.05] text-brand-700',
  danger:
    'bg-gradient-to-br from-[#C8434C] to-[#93242E] text-white shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 ring-1 ring-[#93242E]/40',
  success:
    'bg-gradient-to-br from-[#B9D23A] to-[#8CA220] text-[#1A2100] shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 ring-1 ring-[#8CA220]/40',
};

const Button = ({ children, variant = 'filled', className = '', ...props }) => {
  const base =
    'flex justify-center items-center gap-2 px-6 py-3 rounded-full font-medium tracking-tight transition-all duration-300 ease-out active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0';
  return (
    <button className={`${base} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
