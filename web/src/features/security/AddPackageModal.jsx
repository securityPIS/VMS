// Modal Registrasi Paket masuk (UIUX 5.11). Foto barang opsional (kamera + unggah).
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import PhotoCapture from '../../components/PhotoCapture';

const AddPackageModal = ({ isOpen, value, setValue, photo, setPhoto, locations, requireLocation = false, onSave, onClose, busy }) => {
  const locationOptions = locations || [];
  const showLocationSelect = requireLocation || locationOptions.length > 0;
  const isInvalid = !value.sender || !value.recipient || (requireLocation && !value.location_id);

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Registrasi Paket Masuk"
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>Batal</Button>
          <Button variant="filled" onClick={onSave} disabled={isInvalid || busy}>
            {busy ? 'Menyimpan...' : 'Simpan Paket'}
          </Button>
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
        {showLocationSelect && (
          <div className="w-full">
            <label className="block text-xs font-semibold tracking-wide text-ink-soft mb-1.5 ml-0.5">Lokasi Penerimaan</label>
            <select
              className="w-full px-4 py-3 bg-white/70 border border-line rounded-2xl outline-none text-ink transition-all duration-200 hover:border-brand-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
              value={value.location_id || ''}
              disabled={!locationOptions.length}
              onChange={(e) => {
                const selected = locationOptions.find((loc) => loc.location_id === e.target.value);
                setValue({
                  ...value,
                  location_id: selected ? selected.location_id : '',
                  location: selected ? selected.name : '',
                });
              }}
            >
              <option value="" disabled>Pilih lokasi penerimaan</option>
              {locationOptions.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>
              ))}
            </select>
          </div>
        )}
        <InputField
          label="Deskripsi Barang"
          placeholder="Contoh: Dokumen / Kardus sedang / Makanan"
          value={value.type}
          onChange={(e) => setValue({ ...value, type: e.target.value })}
        />
        <PhotoCapture label="Foto Barang / Resi (Opsional)" value={photo} onChange={setPhoto} capture="environment" />
      </div>
    </ModalBase>
  );
};

export default AddPackageModal;
