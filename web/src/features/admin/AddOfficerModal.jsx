// Modal Tambah Petugas: nama, email, lokasi penugasan (UIUX 5.13).
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { LOCATIONS } from '../../lib/constants';

const AddOfficerModal = ({ isOpen, value, setValue, onSave, onClose, busy }) => (
  <ModalBase
    isOpen={isOpen}
    onClose={onClose}
    title="Tambah Petugas Baru"
    footer={
      <>
        <Button variant="text" onClick={onClose} disabled={busy}>Batal</Button>
        <Button variant="filled" onClick={onSave} disabled={!value.name || !value.email || busy}>
          {busy ? 'Menyimpan…' : 'Simpan Data'}
        </Button>
      </>
    }
  >
    <div className="space-y-4 pt-2">
      <InputField label="Nama Lengkap" value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} required />
      <InputField label="Email Address" type="email" value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} required />
      <div className="w-full">
        <label className="block text-xs font-medium text-[#44474E] mb-1 ml-1">Lokasi Penugasan</label>
        <select
          className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#3C6DB2] text-[#1A1B1E]"
          value={value.location}
          onChange={(e) => setValue({ ...value, location: e.target.value })}
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
    </div>
  </ModalBase>
);

export default AddOfficerModal;
