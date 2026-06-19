// Tab Assignment Petugas admin: kartu petugas + aktif/nonaktif + lokasi (UIUX 5.13).
import { Plus, MapPin, MoreVertical } from 'lucide-react';
import Button from '../../components/Button';

const OfficerAssignmentTab = ({ officers, onAdd, onToggle }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
    <div className="flex justify-between items-center bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC]">
      <p className="text-[#44474E] text-base">Kelola akun dan lokasi penugasan petugas keamanan.</p>
      <Button variant="filled" onClick={onAdd}>
        <Plus size={18} /> Tambah Petugas
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {officers.map((officer) => (
        <div key={officer.id} className="bg-[#FDFBFF] p-6 rounded-[28px] shadow-sm border border-[#EAE7EC] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#D5E3FF] text-[#001B3E] flex items-center justify-center font-medium text-xl">
                {officer.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-[#1A1B1E] text-lg">{officer.name}</div>
                <div className="text-sm text-[#74777F]">{officer.id}</div>
              </div>
            </div>
            <button className="text-[#74777F] hover:bg-[#F4F2F6] p-2 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="bg-[#F4F2F6] p-4 rounded-[16px] flex items-center gap-3 mb-6 mt-auto">
            <MapPin size={20} className="text-[#3C6DB2]" />
            <span className="text-base font-medium text-[#1A1B1E]">{officer.location}</span>
          </div>

          <div className="flex items-center justify-between border-t border-[#EAE7EC] pt-5">
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${officer.status === 'Active' ? 'bg-[#E6F893] text-[#192100]' : 'bg-[#EFEDF1] text-[#44474E]'}`}>
              {officer.status === 'Active' ? 'Aktif Bertugas' : 'Nonaktif'}
            </span>
            <button onClick={() => onToggle(officer.id)} className="text-sm font-medium text-[#3C6DB2] hover:underline">
              {officer.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default OfficerAssignmentTab;
