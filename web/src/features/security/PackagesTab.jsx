// Tab Paket & Kiriman: tabel paket + registrasi + tandai diambil (PRD 3.5, UIUX 5.10).
import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import Button from '../../components/Button';
import ModalBase from '../../components/ModalBase';
import RemotePhoto from '../../components/RemotePhoto';
import { joinDateTime } from '../../lib/constants';

const packageStatusClass = (status) =>
  status === 'RECEIVED' ? 'bg-[#FFEFD6] text-[#5E4200]' : 'bg-[#E6F893] text-[#192100]';

const packageStatusLabel = (status) => (status === 'RECEIVED' ? 'Di Pos Security' : 'Sudah Diambil');

const DetailLine = ({ label, value }) => (
  <div>
    <div className="text-xs font-medium text-[#74777F]">{label}</div>
    <div className="text-sm text-[#1A1B1E] mt-0.5">{value || '-'}</div>
  </div>
);

const PackagesTab = ({ packages, onAdd, onPickup, showLocation = false }) => {
  const [detail, setDetail] = useState(null);

  const openWithKeyboard = (event, item) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setDetail(item);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      {/* Header "Daftar Paket" hanya tampil di desktop; di mobile tombol registrasi
          dipindah sejajar judul "Paket & Kiriman Masuk" (lihat SecurityDashboard). */}
      <div className="hidden md:flex justify-between items-center gap-4 bg-white/85 backdrop-blur-xl p-6 rounded-[28px] shadow-card border border-line mb-6">
        <div>
          <h2 className="text-2xl text-display">Daftar Paket</h2>
          <p className="text-sm text-ink-muted mt-1">Registrasi barang titipan kurir / ekspedisi.</p>
        </div>
        <Button variant="filled" className="px-6 py-3" onClick={onAdd}>
          <Plus size={18} /> Registrasi Paket
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="p-10 text-center text-[#74777F] bg-white/85 backdrop-blur-xl rounded-[28px] shadow-card border border-line">
          Belum ada paket yang diregistrasi hari ini.
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {packages.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetail(p)}
                onKeyDown={(event) => openWithKeyboard(event, p)}
                className="bg-white/85 backdrop-blur-xl rounded-[20px] border border-line p-4 shadow-card active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[#1A1B1E] truncate">{p.sender}</div>
                    <div className="text-xs text-[#74777F] mt-0.5 truncate">{p.type} - {p.id}</div>
                    <div className="text-xs text-[#3C6DB2] mt-2 font-medium truncate">Untuk: {p.recipient}</div>
                    {showLocation && <div className="text-xs text-[#44474E] mt-1 truncate">{p.location || 'Lokasi belum tercatat'}</div>}
                  </div>
                  {p.photo ? (
                    <RemotePhoto refId={p.photoThumb || p.photo} fullId={p.photo} alt="Paket" openInNewTab className="w-12 h-12 rounded-[12px] object-cover shadow-card border border-line cursor-pointer shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-[12px] bg-ink/[0.03] border border-line flex items-center justify-center text-[#74777F] shrink-0">
                      <Package size={20} />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-[#44474E]">{joinDateTime(p.date, p.time)}</div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${packageStatusClass(p.status)}`}>
                      {packageStatusLabel(p.status)}
                    </span>
                  </div>
                  {p.status === 'RECEIVED' ? (
                    <Button
                      variant="success"
                      className="text-xs px-3 py-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPickup(p.id);
                      }}
                    >
                      Diambil
                    </Button>
                  ) : (
                    <span className="text-xs font-medium text-[#74777F] px-2">Selesai</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white/85 backdrop-blur-xl rounded-[28px] shadow-card border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink/[0.03] text-[#44474E] text-sm border-b border-line">
                    <th className="p-5 font-medium pl-6">Detail Paket</th>
                    <th className="p-5 font-medium hidden md:table-cell">Untuk (Penerima)</th>
                    {showLocation && <th className="p-5 font-medium hidden lg:table-cell">Lokasi</th>}
                    <th className="p-5 font-medium hidden md:table-cell">Waktu Masuk</th>
                    <th className="p-5 font-medium">Status</th>
                    <th className="p-5 font-medium text-right pr-6">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p) => (
                    <tr key={p.id} className="border-b border-line hover:bg-ink/[0.04] transition-colors">
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-4">
                          {p.photo ? (
                            <RemotePhoto refId={p.photoThumb || p.photo} fullId={p.photo} alt="Paket" openInNewTab className="w-12 h-12 rounded-[12px] object-cover shadow-card hidden sm:block cursor-pointer" />
                          ) : (
                            <div className="w-12 h-12 rounded-[12px] bg-ink/[0.03] border border-line flex items-center justify-center text-[#74777F] hidden sm:flex">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[#1A1B1E] text-base">{p.sender}</div>
                            <div className="text-xs text-[#74777F] mt-0.5">{p.type} - {p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 hidden md:table-cell text-sm text-[#1A1B1E] font-medium">{p.recipient}</td>
                      {showLocation && <td className="p-5 hidden lg:table-cell text-sm text-[#44474E]">{p.location || '-'}</td>}
                      <td className="p-5 hidden md:table-cell text-sm text-[#44474E]">{joinDateTime(p.date, p.time)}</td>
                      <td className="p-5">
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${packageStatusClass(p.status)}`}>
                          {packageStatusLabel(p.status)}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-6">
                        {p.status === 'RECEIVED' ? (
                          <Button variant="success" className="text-xs px-4 py-2" onClick={() => onPickup(p.id)}>
                            Tandai Diambil
                          </Button>
                        ) : (
                          <span className="text-xs font-medium text-[#74777F] px-4">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ModalBase
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Paket"
        footer={<Button variant="text" onClick={() => setDetail(null)}>Tutup</Button>}
      >
        <div className="space-y-4 pt-1">
          {detail?.photo && (
            <RemotePhoto refId={detail.photoThumb || detail.photo} fullId={detail.photo} alt="Paket" openInNewTab className="w-28 h-28 rounded-[16px] object-cover border border-line cursor-pointer" />
          )}
          <div className="grid grid-cols-2 gap-4">
            <DetailLine label="Pengirim" value={detail?.sender} />
            <DetailLine label="Penerima" value={detail?.recipient} />
            <DetailLine label="Jenis" value={detail?.type} />
            <DetailLine label="ID Paket" value={detail?.id} />
            {showLocation && <DetailLine label="Lokasi" value={detail?.location} />}
            <DetailLine label="Waktu Masuk" value={detail ? joinDateTime(detail.date, detail.time) : ''} />
            <DetailLine label="Status" value={detail ? packageStatusLabel(detail.status) : ''} />
          </div>
        </div>
      </ModalBase>
    </div>
  );
};

export default PackagesTab;
