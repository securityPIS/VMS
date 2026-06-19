// Kerangka modal: overlay + kartu + judul + body scrollable + footer aksi.
const ModalBase = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1B1E]/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FDFBFF] rounded-[28px] w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-normal text-[#1A1B1E]">{title}</h2>
        </div>
        <div className="px-6 py-2 max-h-[60vh] overflow-y-auto">{children}</div>
        <div className="p-6 pt-4 flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
};

export default ModalBase;
