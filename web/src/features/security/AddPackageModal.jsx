// Modal Registrasi Paket masuk (UIUX 5.11). Foto barang opsional.
// TODO integrasi: ganti tombol foto dengan capture/upload via api.uploadPhoto.
import { Camera, CheckCircle } from 'lucide-react';
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { PACKAGE_TYPES } from '../../lib/constants';

const AddPackageModal = ({ isOpen, value, setValue, photo, setPhoto, onSave, onClose }) => (
  <ModalBase
    isOpen={isOpen}
    onClose={onClose}
    title="Registrasi Paket Masuk"
    footer={
      <>
        <Button variant="text" onClick={onClose}>Batal</Button>
        <Button variant="filled" onClick={onSave} disabled={!value.sender || !value.recipient}>Simpan Paket</Button>
      </>
    }
  >
    <div className="space-y-4 pt-2">
      <InputField
        label="Nama Pengirim / Ekspedisi"
        placeholder="Contoh: JNE / Gojek / Bpk. Budi"
        value={value.sender}
        onChange={(e) => setValue({ ...value, sender: e.target.value })}
      />
      <InputField
        label="Nama Penerima"
        placeholder="Contoh: Bpk. Andi (IT)"
        value={value.recipient}
        onChange={(e) => setValue({ ...value, recipient: e.target.value })}
      />
      <div className="w-full">
        <label className="block text-xs font-medium text-[#44474E] mb-1 ml-1">Jenis Barang</label>
        <select
          className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#3C6DB2] text-[#1A1B1E]"
          value={value.type}
          onChange={(e) => setValue({ ...value, type: e.target.value })}
        >
          {PACKAGE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="border border-[#74777F]/30 border-dashed p-4 rounded-[16px] text-center bg-[#F4F2F6] mt-4">
        <p className="text-sm font-medium text-[#1A1B1E] mb-2">Foto Barang / Resi (Opsional)</p>
        {photo ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="text-[#ADC52D] mb-1" size={28} />
            <span className="text-xs text-[#44474E]">Foto tersimpan</span>
          </div>
        ) : (
          <Button type="button" variant="tonal" onClick={() => setPhoto(true)} className="w-full">
            <Camera size={18} /> Ambil Foto Paket
          </Button>
        )}
      </div>
    </div>
  </ModalBase>
);

export default AddPackageModal;
