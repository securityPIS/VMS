// Modal Check-in: input nomor kartu (wajib) sebelum mengizinkan tamu (UIUX 5.6).
// TODO integrasi: validasi nomor kartu tidak duplikat dengan tamu aktif (FR-10).
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';
import InputField from '../../components/InputField';

const CheckInModal = ({ visit, cardNumber, setCardNumber, onConfirm, onClose }) => (
  <ModalBase
    isOpen={!!visit}
    onClose={onClose}
    title="Check-in Visitor"
    footer={
      <>
        <Button variant="text" onClick={onClose}>Batal</Button>
        <Button variant="success" onClick={onConfirm} disabled={!cardNumber}>Konfirmasi Check-in</Button>
      </>
    }
  >
    <div className="space-y-4 pt-2">
      <div className="bg-[#E6F893]/30 p-5 rounded-[20px] border border-[#E6F893]">
        <p className="text-sm text-[#192100] mb-1">
          Visitor: <strong className="text-base">{visit?.name}</strong>
        </p>
        <p className="text-xs text-[#44474E]">
          Pastikan Anda telah menerima KTP fisik tamu dan mencocokkan wajahnya sebelum memberikan kartu.
        </p>
      </div>
      <InputField
        label="Nomor Kartu Visitor (Wajib)"
        placeholder="Contoh: V-042"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        autoFocus
      />
    </div>
  </ModalBase>
);

export default CheckInModal;
