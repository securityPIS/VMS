// Kerangka modal: overlay + kartu + judul + body scrollable + footer aksi.
// Gaya premium: overlay gelap berblur, kartu kaca, judul serif, aksen garis emas.
const ModalBase = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-[28px] w-full max-w-md shadow-float ring-1 ring-white/60 border border-white/70 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-3">
          <h2 className="text-2xl text-display">{title}</h2>
          <div className="rule-gold mt-4" />
        </div>
        <div className="px-6 py-2 max-h-[60vh] overflow-y-auto">{children}</div>
        <div className="p-6 pt-4 flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
};

export default ModalBase;
