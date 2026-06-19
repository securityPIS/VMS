// Pill status kunjungan (warna + ikon + teks). Color-blind friendly (UIUX 4 & 7).
import { VISIT_STATUS } from '../lib/constants';

const Badge = ({ status }) => {
  const st = VISIT_STATUS[status] || VISIT_STATUS.PENDING;
  const Icon = st.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${st.color}`}>
      <Icon size={14} /> {st.label}
    </span>
  );
};

export default Badge;
