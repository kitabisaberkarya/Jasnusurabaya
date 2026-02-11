
// @ts-nocheck
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceSession } from '../../types';
import { ArrowLeft, FileSpreadsheet, Trash2, ImageIcon, Plus, MapPin, Edit3, Users, Calendar, RefreshCw } from 'lucide-react';
import XLSX from 'xlsx-js-style';

const AbsensiGeo: React.FC = () => {
  const { 
    attendanceSessions, attendanceRecords, createSession, updateSession, deleteSession, toggleSession, deleteAttendanceRecord, showToast, isLoading, users
  } = useApp();

  const [viewingSession, setViewingSession] = useState<AttendanceSession | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Session Form States
  const [newSessionName, setNewSessionName] = useState('');
  const [geoLat, setGeoLat] = useState<string>('');
  const [geoLng, setGeoLng] = useState<string>('');
  const [geoRadius, setGeoRadius] = useState<string>('100');
  const [geoMapsUrl, setGeoMapsUrl] = useState<string>('');

  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [editSessionName, setEditSessionName] = useState('');
  const [editSessionGeo, setEditSessionGeo] = useState({ lat: '', lng: '', rad: '100', mapsUrl: '' });

  const [deleteSessionData, setDeleteSessionData] = useState<{id: number, name: string} | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  // Handlers
  const handleGetCurrentLocation = (isEdit: boolean = false) => {
    if (!navigator.geolocation) { showToast("Browser tidak mendukung Geolokasi", "error"); return; }
    showToast("Mendeteksi lokasi saat ini...", "info");
    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude.toString();
        const lng = pos.coords.longitude.toString();
        if (isEdit) { setEditSessionGeo(prev => ({ ...prev, lat, lng })); } else { setGeoLat(lat); setGeoLng(lng); }
        showToast("Lokasi ditemukan!", "success");
    }, (err) => { console.error(err); showToast("Gagal mengambil lokasi: " + err.message, "error"); }, { enableHighAccuracy: true });
  };

  const extractCoordsFromUrl = (url: string) => {
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };
    const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataMatch) return { lat: dataMatch[1], lng: dataMatch[2] };
    const searchMatch = url.match(/search\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (searchMatch) return { lat: searchMatch[1], lng: searchMatch[2] };
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };
    return null;
  };

  const handleMapsLinkChange = (val: string, isEdit: boolean = false) => {
    const coords = extractCoordsFromUrl(val);
    if (isEdit) { setEditSessionGeo(prev => ({ ...prev, mapsUrl: val, lat: coords ? coords.lat : prev.lat, lng: coords ? coords.lng : prev.lng })); } else { setGeoMapsUrl(val); if (coords) { setGeoLat(coords.lat); setGeoLng(coords.lng); showToast("Koordinat berhasil diekstrak dari link!", "success"); } }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName) {
      const lat = geoLat ? parseFloat(geoLat) : undefined;
      const lng = geoLng ? parseFloat(geoLng) : undefined;
      const rad = geoRadius ? parseFloat(geoRadius) : undefined;
      createSession(newSessionName, lat, lng, rad, geoMapsUrl);
      setNewSessionName(''); setGeoLat(''); setGeoLng(''); setGeoRadius('100'); setGeoMapsUrl('');
    }
  };

  const handleEditSession = (session: AttendanceSession) => {
    setEditingSession(session); setEditSessionName(session.name);
    setEditSessionGeo({ lat: session.latitude?.toString() || '', lng: session.longitude?.toString() || '', rad: session.radius?.toString() || '100', mapsUrl: session.mapsUrl || '' });
  };

  const handleUpdateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession && editSessionName.trim()) {
      const lat = editSessionGeo.lat ? parseFloat(editSessionGeo.lat) : undefined;
      const lng = editSessionGeo.lng ? parseFloat(editSessionGeo.lng) : undefined;
      const rad = editSessionGeo.rad ? parseFloat(editSessionGeo.rad) : 100;
      updateSession(editingSession.id, editSessionName, lat, lng, rad, editSessionGeo.mapsUrl);
      setEditingSession(null);
    }
  };

  const handleDeleteSession = (id: number, name: string) => setDeleteSessionData({ id, name });
  const confirmDeleteSession = async () => { if (deleteSessionData) { setIsDeletingSession(true); await deleteSession(deleteSessionData.id); setIsDeletingSession(false); setDeleteSessionData(null); } };

  const handleExportAttendance = () => {
    try {
        const wb = XLSX.utils.book_new();
        const summaryData = attendanceSessions.map(s => ({ 'ID Sesi': s.id, 'Tanggal': s.date, 'Kegiatan': s.name, 'Total Hadir': s.attendees.length, 'Status': s.isOpen ? 'Buka' : 'Tutup' }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Ringkasan");
        const detailData = attendanceRecords.map(r => {
             const session = attendanceSessions.find(s => s.id === r.sessionId);
             const user = users.find(u => u.id === r.userId);
             return { 'Waktu': r.timestamp, 'Nama': r.userName, 'NIA': user?.nia || '-', 'Kegiatan': session?.name || '-', 'Lokasi': r.location };
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailData), "Detail");
        XLSX.writeFile(wb, `Absensi_JSN_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast("Export berhasil!", "success");
    } catch (e) { showToast("Gagal export data", "error"); }
  };

  return (
    <div className="space-y-6">
        {viewingSession ? (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => setViewingSession(null)} className="p-2 hover:bg-neutral-200 rounded-full transition"><ArrowLeft size={20}/></button>
                    <div>
                        <h3 className="font-bold text-neutral-800">{viewingSession.name}</h3>
                        <p className="text-xs text-neutral-500">{viewingSession.date} • {viewingSession.attendees.length} Hadir</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Cari peserta..." className="border rounded-lg px-3 py-1.5 text-xs" value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)} />
                    <button onClick={handleExportAttendance} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"><FileSpreadsheet size={14}/> Export XLSX</button>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[70vh]">
                <table className="w-full text-left">
                    <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100 sticky top-0 z-0">
                        <tr><th className="px-6 py-3">Waktu</th><th className="px-6 py-3">Nama Anggota</th><th className="px-6 py-3">Lokasi Absen</th><th className="px-6 py-3 text-center">Bukti Foto</th><th className="px-6 py-3 text-right">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {attendanceRecords.filter(r => r.sessionId === viewingSession.id && r.userName.toLowerCase().includes(attendanceSearch.toLowerCase())).map(r => (
                            <tr key={r.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-3 text-xs font-mono text-neutral-600">{r.timestamp}</td>
                                <td className="px-6 py-3 font-bold text-neutral-800">{r.userName}</td>
                                <td className="px-6 py-3 text-xs text-neutral-600 max-w-xs truncate" title={r.location}>{r.location}</td>
                                <td className="px-6 py-3 text-center">
                                    <button onClick={() => setPreviewImage(r.photoUrl)} className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md text-xs font-bold text-neutral-600 hover:bg-neutral-200"><ImageIcon size={12}/> Lihat</button>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button onClick={() => deleteAttendanceRecord(r.id, r.sessionId, r.userId)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {attendanceRecords.filter(r => r.sessionId === viewingSession.id).length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Belum ada data absensi masuk.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    ) : (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12 bg-white rounded-2xl"><RefreshCw className="animate-spin mx-auto mb-2 text-neutral-400"/>Memuat sesi absensi...</div>
                    ) : attendanceSessions.length > 0 ? (
                        attendanceSessions.map(session => (
                        <div key={session.id} className={`bg-white border rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all ${session.isOpen ? 'border-emerald-200 shadow-sm' : 'border-neutral-200 opacity-80 hover:opacity-100'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {session.isOpen ? <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> : <span className="w-2 h-2 rounded-full bg-neutral-400"></span>}
                                    <span className={`text-xs font-bold uppercase tracking-wider ${session.isOpen ? 'text-emerald-600' : 'text-neutral-500'}`}>{session.isOpen ? 'Sesi Dibuka' : 'Sesi Ditutup'}</span>
                                    <span className="text-xs text-neutral-400">• {session.date}</span>
                                </div>
                                <h3 className="text-lg font-bold text-neutral-800">{session.name}</h3>
                                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-600">
                                    <span className="flex items-center gap-1"><Users size={14}/> {session.attendees.length} Hadir</span>
                                    {session.latitude ? <span className="flex items-center gap-1 text-amber-600"><MapPin size={14}/> Wajib Lokasi ({session.radius}m)</span> : <span className="flex items-center gap-1 text-emerald-600"><MapPin size={14}/> Bebas Lokasi</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button onClick={() => toggleSession(session.id)} className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-xs font-bold border transition ${session.isOpen ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                                    {session.isOpen ? 'Tutup Sesi' : 'Buka Sesi'}
                                </button>
                                <button onClick={() => setViewingSession(session)} className="flex-1 md:flex-none px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-xs font-bold hover:bg-neutral-200">Detail</button>
                                <button onClick={() => handleEditSession(session)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
                                <button onClick={() => handleDeleteSession(session.id, session.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-300">
                            <Calendar size={48} className="mx-auto text-neutral-300 mb-4"/>
                            <h3 className="text-neutral-500 font-medium">Belum ada sesi absensi dibuat</h3>
                        </div>
                    )}
                </div>
                
                <div id="session-form" className="bg-white border border-neutral-200 rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
                    <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                        {editingSession ? <Edit3 size={18} className="text-amber-500"/> : <Plus size={18} className="text-emerald-500"/>}
                        {editingSession ? 'Edit Sesi Absensi' : 'Buat Sesi Baru'}
                    </h3>
                    <form onSubmit={editingSession ? handleUpdateSessionSubmit : handleCreateSession} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1">Nama Kegiatan</label>
                            <input type="text" className="w-full border rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none" placeholder="Contoh: Majelis Rutin Malam Jumat" value={editingSession ? editSessionName : newSessionName} onChange={e => editingSession ? setEditSessionName(e.target.value) : setNewSessionName(e.target.value)} required />
                        </div>
                        
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-neutral-600 flex items-center gap-1"><MapPin size={12}/> Geofencing (Opsional)</label>
                                <button type="button" onClick={() => handleGetCurrentLocation(!!editingSession)} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200">Gunakan Lokasi Saya</button>
                            </div>
                            <input type="text" placeholder="Link Google Maps (Otomatis Ekstrak)" className="w-full border rounded-lg p-2 text-xs" value={editingSession ? editSessionGeo.mapsUrl : geoMapsUrl} onChange={e => handleMapsLinkChange(e.target.value, !!editingSession)} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Latitude" className="w-full border rounded-lg p-2 text-xs bg-white" value={editingSession ? editSessionGeo.lat : geoLat} readOnly />
                                <input type="text" placeholder="Longitude" className="w-full border rounded-lg p-2 text-xs bg-white" value={editingSession ? editSessionGeo.lng : geoLng} readOnly />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Radius Toleransi (Meter)</label>
                                <input type="number" className="w-full border rounded-lg p-2 text-xs" value={editingSession ? editSessionGeo.rad : geoRadius} onChange={e => editingSession ? setEditSessionGeo({...editSessionGeo, rad: e.target.value}) : setGeoRadius(e.target.value)} min="10" />
                            </div>
                        </div>

                        <button type="submit" className={`w-full py-2.5 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${editingSession ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary-900 hover:bg-primary-800'}`}>
                            {editingSession ? 'Simpan Perubahan' : 'Buat Sesi Sekarang'}
                        </button>
                        {editingSession && (
                            <button type="button" onClick={() => { setEditingSession(null); setEditSessionName(''); setEditSessionGeo({lat:'', lng:'', rad:'100', mapsUrl:''}); }} className="w-full py-2 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200">Batal Edit</button>
                        )}
                    </form>
                </div>
            </div>
        </>
    )}

    {/* Delete Modal */}
    {deleteSessionData && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl max-w-sm w-full"><h3 className="font-bold text-lg mb-2">Hapus Sesi?</h3><p className="text-neutral-500 mb-6">Sesi "{deleteSessionData.name}" dan seluruh data absensi di dalamnya akan dihapus permanen.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteSessionData(null)} className="px-4 py-2 rounded-lg bg-neutral-100 font-bold">Batal</button><button onClick={confirmDeleteSession} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">{isDeletingSession ? 'Menghapus...' : 'Ya, Hapus'}</button></div></div></div>
    )}
    {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" /></div>
    )}
    </div>
  );
};

export default AbsensiGeo;
