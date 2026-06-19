// Modal Check-out: konfirmasi + pengingat tukar kembali kartu ↔ KTP (UIUX 5.8).
import { AlertCircle } from 'lucide-react';
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';

const CheckoutModal = ({ visit, onConfirm, onClose, busy }) => (
  <ModalBase
    isOpen={!!visit}
    onClose={onClose}
    title="Check-out Visitor"
    footer={
      <>
        <Button variant="text" onClick={onClose} disabled={busy}>Batal</Button>
        <Button variant="filled" onClick={onConfirm} disabled={busy}>
          {busy ? 'Memproses…' : 'Konfirmasi Selesai'}
        </Button>
      </>
    }
  >
    <div className="pt-2 text-[#44474E]">
      <p className="mb-4 text-base">
        Selesaikan kunjungan untuk <strong className="text-[#1A1B1E]">{visit?.name}</strong>?
      </p>
      <div className="flex items-start gap-3 p-5 bg-[#D5E3FF]/30 border border-[#D5E3FF] rounded-[20px]">
        <AlertCircle className="text-[#3C6DB2] shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-[#001B3E]">
          Pastikan untuk mengambil kembali Kartu Visitor <strong>{visit?.cardNumber}</strong> dan mengembalikan KTP fisik kepada tamu.
        </p>
      </div>
    </div>
  </ModalBase>
);

export default CheckoutModal;
