import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';

const DeleteOfficerModal = ({ officer, onConfirm, onClose, busy }) => (
  <ModalBase
    isOpen={!!officer}
    onClose={onClose}
    title="Hapus Petugas"
    footer={
      <>
        <Button variant="text" onClick={onClose} disabled={busy}>Batal</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Menghapus...' : 'Hapus Petugas'}
        </Button>
      </>
    }
  >
    <div className="space-y-4 pt-2">
      <div className="bg-[#FFDAD6]/30 border border-[#FFDAD6] rounded-[16px] p-4">
        <p className="text-sm text-[#410002]">
          Petugas <strong>{officer?.name}</strong> akan dihapus dari whitelist security.
        </p>
      </div>
      <p className="text-sm text-[#44474E]">
        Setelah dihapus, email ini tidak lagi dikenali sebagai petugas security.
      </p>
    </div>
  </ModalBase>
);

export default DeleteOfficerModal;
