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
      <div className="bg-[#E6F893]/40 p-5 rounded-2xl border border-[#E6F893]">
        <p className="text-sm text-[#192100] mb-1">
          Visitor: <strong className="text-base">{visit?.name}</strong>
        </p>
        <p className="text-xs text-ink-soft">
          Pastikan Anda telah menerima KTP fisik tamu dan mencocokkan wajahnya sebelum memberikan kartu.
        </p>
      </div>
      <InputField
        id="checkin-card-number"
        label="Nomor Kartu Visitor (Wajib)"
        placeholder="Contoh: V-042"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        autoFocus
      />
      <div className="w-full">
        <label htmlFor="checkin-confirm-notes" className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Catatan Konfirmasi (Wajib)</label>
        <textarea
          id="checkin-confirm-notes"
          className="w-full px-4 py-3 bg-white/70 border border-line rounded-2xl outline-none text-ink transition-all duration-200 hover:border-[#9DBE3E] focus:border-[#2E7D32] focus:bg-white focus:ring-4 focus:ring-[#2E7D32]/15 min-h-[96px] resize-none"
          placeholder="Contoh: Kunjungan dikonfirmasi. Silakan datang sesuai jadwal dan membawa identitas asli."
          value={confirmNotes}
          onChange={(e) => setConfirmNotes(e.target.value)}
        />
      </div>
    </div>
  </ModalBase>
);

export default CheckInModal;
