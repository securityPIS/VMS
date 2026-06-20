// Modal tambah/edit petugas. Lokasi wajib berasal dari master Locations backend.
import ModalBase from '../../components/ModalBase';
import Button from '../../components/Button';
import InputField from '../../components/InputField';

const AddOfficerModal = ({
  isOpen,
  value,
  setValue,
  locations,
  mode = 'add',
  onSave,
  onClose,
  busy,
}) => {
  const locationOptions = locations || [];
  const selectedLocationId = value.location_id || '';
  const canSave = value.name && value.email && selectedLocationId;

  const handleLocationChange = (e) => {
    const selected = locationOptions.find((loc) => loc.location_id === e.target.value);
    setValue({
      ...value,
      location_id: selected ? selected.location_id : '',
      location: selected ? selected.name : '',
    });
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Petugas' : 'Tambah Petugas Baru'}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>Batal</Button>
          <Button variant="filled" onClick={onSave} disabled={!canSave || busy}>
            {busy ? 'Menyimpan...' : 'Simpan Data'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <InputField
          id="officer-name"
          label="Nama Lengkap"
          value={value.name}
          onChange={(e) => setValue({ ...value, name: e.target.value })}
          required
        />
        <InputField
          id="officer-email"
          label="Email Address"
          type="email"
          value={value.email}
          onChange={(e) => setValue({ ...value, email: e.target.value })}
          required
        />
        <div className="w-full">
          <label htmlFor="officer-location" className="block text-xs font-medium text-[#44474E] mb-1 ml-1">Lokasi Penugasan</label>
          <select
            id="officer-location"
            className="w-full px-4 py-3 bg-transparent border border-[#74777F] rounded-[8px] outline-none focus:border-2 focus:border-[#3C6DB2] text-[#1A1B1E]"
            value={selectedLocationId}
            onChange={handleLocationChange}
            disabled={!locationOptions.length}
          >
            <option value="" disabled>Pilih lokasi aktif</option>
            {locationOptions.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>
    </ModalBase>
  );
};

export default AddOfficerModal;
