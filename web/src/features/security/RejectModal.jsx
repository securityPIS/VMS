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
      <div className="bg-[#FFDAD6]/30 p-5 rounded-[20px] border border-[#FFDAD6]">
        <p className="text-sm text-[#410002]">
          Visitor: <strong className="text-base">{visit?.name}</strong>
        </p>
      </div>
      <div className="w-full">
        <label className="block text-xs font-medium text-[#44474E] mb-1 ml-1">Alasan Penolakan (Wajib)</label>
        <textarea
          className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#BA313B] text-[#1A1B1E] min-h-[100px] resize-none"
          placeholder="Contoh: KTP tidak jelas, tujuan tidak ada di tempat..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          autoFocus
        />
      </div>
      <p className="text-xs text-[#74777F] ml-1">Alasan ini akan dikirimkan otomatis ke email visitor.</p>
    </div>
  </ModalBase>
);

export default RejectModal;
