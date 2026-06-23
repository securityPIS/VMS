// Modal Tolak: alasan penolakan wajib; dikirim ke email tamu (UIUX 5.7, FR-11/12).
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';

const RejectModal = ({ visit, rejectReason, setRejectReason, onConfirm, onClose, busy }) => (
  <ModalBase
    isOpen={!!visit}
    onClose={onClose}
    title="Tolak Kunjungan"
    footer={
      <>
        <Button variant="text" onClick={onClose} disabled={busy}>Batal</Button>
        <Button variant="danger" onClick={onConfirm} disabled={!rejectReason || busy}>
          {busy ? 'Memproses…' : 'Konfirmasi Tolak'}
        </Button>
      </>
    }
  >
    <div className="space-y-4 pt-2">
      <div className="bg-[#FFDAD6]/40 p-5 rounded-2xl border border-[#FFDAD6]">
        <p className="text-sm text-[#410002]">
          Visitor: <strong className="text-base">{visit?.name}</strong>
        </p>
      </div>
      <div className="w-full">
        <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Alasan Penolakan (Wajib)</label>
        <textarea
          className="w-full px-4 py-3 bg-white/70 border border-line rounded-2xl outline-none text-ink transition-all duration-200 hover:border-[#E9A6AB] focus:border-[#BA313B] focus:bg-white focus:ring-4 focus:ring-[#BA313B]/15 min-h-[100px] resize-none"
          placeholder="Contoh: KTP tidak jelas, tujuan tidak ada di tempat..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          autoFocus
        />
      </div>
      <p className="text-xs text-ink-muted ml-1">Alasan ini akan dikirimkan otomatis ke email visitor.</p>
    </div>
  </ModalBase>
);

export default RejectModal;
