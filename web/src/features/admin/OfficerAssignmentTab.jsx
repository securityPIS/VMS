// Tab Assignment Petugas admin: kartu petugas + aktif/nonaktif + lokasi (UIUX 5.13).
import { useState } from 'react';
import { Edit2, MapPin, MoreVertical, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/Button';

const OfficerAssignmentTab = ({ officers, onAdd, onEdit, onDelete, onToggle }) => {
  const [openMenuId, setOpenMenuId] = useState('');

  const handleMenuAction = (action, officer) => {
    setOpenMenuId('');
    action(officer);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/85 backdrop-blur-xl p-6 rounded-[28px] shadow-card border border-line">
        <p className="text-[#44474E] text-base">Kelola akun dan lokasi penugasan petugas keamanan.</p>
        <Button variant="filled" onClick={onAdd}>
          <Plus size={18} /> Tambah Petugas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {officers.map((officer) => {
          const officerId = officer.officer_id || officer.id;
          const isMenuOpen = openMenuId === officerId;
          return (
            <div key={officerId} className="relative bg-white/85 backdrop-blur-xl p-6 rounded-[28px] shadow-card border border-line flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-brand-gradient text-white flex items-center justify-center font-medium text-xl shrink-0 shadow-premium ring-1 ring-white/20">
                    {officer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg text-display truncate">{officer.name}</div>
                    <div className="text-sm text-[#74777F]">{officerId}</div>
                    <div className="text-xs text-[#74777F] truncate">{officer.email}</div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    aria-label={`Aksi ${officer.name}`}
                    aria-expanded={isMenuOpen}
                    onClick={() => setOpenMenuId(isMenuOpen ? '' : officerId)}
                    className="text-[#74777F] hover:bg-ink/[0.03] p-2 rounded-full transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-11 z-20 w-44 rounded-[12px] border border-line bg-white/85 backdrop-blur-xl shadow-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleMenuAction(onEdit, officer)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm text-[#1A1B1E] hover:bg-ink/[0.03]"
                      >
                        <Edit2 size={16} /> Edit Petugas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMenuAction(onDelete, officer)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm text-[#BA313B] hover:bg-[#FFDAD6]/40"
                      >
                        <Trash2 size={16} /> Hapus Petugas
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-ink/[0.03] p-4 rounded-[16px] flex items-center gap-3 mb-6 mt-auto">
                <MapPin size={20} className="text-[#3C6DB2] shrink-0" />
                <span className="text-base font-medium text-[#1A1B1E]">{officer.location}</span>
              </div>

              <div className="flex items-center justify-between border-t border-line pt-5">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${officer.status === 'Active' ? 'bg-[#E6F893] text-[#192100]' : 'bg-[#EFEDF1] text-[#44474E]'}`}>
                  {officer.status === 'Active' ? 'Aktif Bertugas' : 'Nonaktif'}
                </span>
                <button onClick={() => onToggle(officer)} className="text-sm font-medium text-[#3C6DB2] hover:underline">
                  {officer.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OfficerAssignmentTab;
