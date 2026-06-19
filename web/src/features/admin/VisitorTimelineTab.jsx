// Tab Jejak Visitor admin: pencarian + kartu visitor yang dapat di-expand jadi
// timeline kunjungan (UIUX 5.14). Pencarian kini fungsional (filter nama/instansi).
import { useMemo, useState } from 'react';
import { Search, ChevronRight, MapPin } from 'lucide-react';
import Badge from '../../components/Badge';
import RemotePhoto from '../../components/RemotePhoto';

const VisitorTimelineTab = ({ visits }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState('');

  // Kelompokkan kunjungan per nama visitor, urutkan terbaru dulu.
  const grouped = useMemo(() => {
    const acc = visits.reduce((map, visit) => {
      if (!map[visit.name]) {
        map[visit.name] = {
          name: visit.name,
          asal: visit.asal,
          photo: visit.selfiePhoto || '',
          history: [],
        };
      }
      map[visit.name].history.push(visit);
      return map;
    }, {});
    return Object.values(acc).map((v) => {
      v.history.sort((a, b) => new Date(b.date) - new Date(a.date));
      return v;
    });
  }, [visits]);

  const filtered = grouped.filter((v) =>
    `${v.name} ${v.asal}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-[#FDFBFF] p-5 rounded-[28px] shadow-sm border border-[#EAE7EC] flex items-center gap-3">
        <Search className="text-[#74777F] ml-2" size={24} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama visitor atau instansi..."
          className="flex-1 bg-transparent border-none outline-none text-[#1A1B1E] text-base placeholder:text-[#74777F]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((visitor) => {
          const isExpanded = expandedId === visitor.name;
          return (
            <div
              key={visitor.name}
              className={`bg-[#FDFBFF] rounded-[28px] shadow-sm border overflow-hidden transition-all duration-300 ${
                isExpanded ? 'border-[#3C6DB2] ring-1 ring-[#3C6DB2]' : 'border-[#EAE7EC] hover:border-[#3C6DB2]/50'
              }`}
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : visitor.name)}
              >
                <div className="flex items-center gap-5">
                  {visitor.photo ? (
                    <RemotePhoto refId={visitor.photo} alt={visitor.name} className="w-16 h-16 rounded-full object-cover border-4 border-[#F4F2F6]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#D5E3FF] text-[#001B3E] flex items-center justify-center font-medium text-2xl border-4 border-[#F4F2F6]">
                      {visitor.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-medium text-[#1A1B1E]">{visitor.name}</h3>
                    <p className="text-base text-[#74777F] mt-0.5">{visitor.asal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-base font-medium text-[#1A1B1E]">{visitor.history.length} Kunjungan</div>
                    <div className="text-sm text-[#74777F]">Terakhir: {visitor.history[0].date}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#D5E3FF] text-[#001B3E]' : 'bg-[#F4F2F6] text-[#44474E]'}`}>
                    <ChevronRight className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} size={24} />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-8 pb-8 pt-4 border-t border-[#EAE7EC] bg-[#FDFBFF] animate-in slide-in-from-top-2">
                  <h4 className="text-base font-medium text-[#1A1B1E] mb-6">Riwayat Perjalanan (Timeline)</h4>
                  <div className="relative border-l-2 border-[#EAE7EC] ml-3 space-y-6">
                    {visitor.history.map((visit, idx) => (
                      <div key={idx} className="relative pl-8">
                        <div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full bg-[#FDFBFF] border-[3px] border-[#3C6DB2]" />
                        <div className="bg-[#F4F2F6] p-5 rounded-[20px] hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[#1A1B1E] text-base">{visit.date}</span>
                              <span className="text-sm text-[#74777F] bg-[#EAE7EC] px-3 py-1 rounded-full">
                                {visit.time} {visit.timeOut ? `- ${visit.timeOut}` : ''}
                              </span>
                            </div>
                            <Badge status={visit.status} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                            <div>
                              <span className="block text-sm text-[#74777F] mb-1">Bertemu dengan</span>
                              <span className="text-base font-medium text-[#1A1B1E]">{visit.tujuan}</span>
                            </div>
                            <div>
                              <span className="block text-sm text-[#74777F] mb-1">Keperluan</span>
                              <span className="text-base font-medium text-[#1A1B1E]">{visit.keperluan}</span>
                            </div>
                            <div>
                              <span className="block text-sm text-[#74777F] mb-1">Lokasi Check-in</span>
                              <span className="text-base font-medium text-[#3C6DB2] flex items-center gap-1.5">
                                <MapPin size={16} /> {visit.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#74777F] bg-[#FDFBFF] rounded-[28px] border border-[#EAE7EC] border-dashed">
            Tidak ada visitor yang cocok dengan pencarian.
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorTimelineTab;
