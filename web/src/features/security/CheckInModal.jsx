// Modal Check In: input nomor kartu (wajib) sebelum mengizinkan tamu (UIUX 5.6).
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';
import InputField from '../../components/InputField';

const CheckInModal = ({
  visit,
  cardNumber,
  setCardNumber,
  confirmNotes,
  setConfirmNotes,
  onConfirm,
  onClose,
  busy,
}) => (
  <ModalBase
    isOpen={!!visit}
    onClose={onClose}
    title="Check In Visitor"
    footer={
      <>
        <Button variant="text" onClick={onClose} disabled={busy}>Batal</Button>
        <Button
          variant="success"
          className="whitespace-nowrap text-sm sm:text-base"
          onClick={onConfirm}
          disabled={!cardNumber || !String(confirmNotes || '').trim() || busy}
        >
          {busy ? 'Memproses...' : 'Konfirmasi Check In'}
        </Button>
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
      <div className="w-full">
        <label className="block text-xs font-medium text-[#44474E] mb-1 ml-1">Catatan Konfirmasi (Wajib)</label>
        <textarea
          className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#2E7D32] text-[#1A1B1E] min-h-[96px] resize-none"
          placeholder="Contoh: Kunjungan dikonfirmasi. Silakan datang sesuai jadwal dan membawa identitas asli."
          value={confirmNotes}
          onChange={(e) => setConfirmNotes(e.target.value)}
        />
      </div>
    </div>
  </ModalBase>
);

export default CheckInModal;
