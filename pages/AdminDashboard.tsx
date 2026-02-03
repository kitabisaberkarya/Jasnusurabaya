
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Calendar, FileText, BarChart2, UserCheck, AlertCircle, ArrowUpRight, 
  ChevronRight, Image as ImageIcon, Check, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Undo, Redo, Strikethrough, Quote, Link as LinkIcon, Video, Plus, Table,
  Printer, Type, Highlighter, Indent, Outdent, RemoveFormatting, ChevronDown,
  FileSpreadsheet, Download, Filter, Search, Menu, Bell, Settings, LogOut, Circle, Save, Upload, Database, RefreshCcw, AlertTriangle,
  User as UserIcon, Youtube, Instagram, Trash2, PlayCircle, Edit3, Key, MapPin, Phone, Eye, ExternalLink, Grid, List as ListIcon, Lock, LayoutTemplate, ArrowLeft, Clock
} from 'lucide-react';
import { MemberStatus, AppState, NewsItem, AttendanceSession, AttendanceRecord, User, UserRole } from '../types';
import XLSX from 'xlsx-js-style';
import { motion, AnimatePresence } from 'framer-motion';
import { KORWIL_LIST } from '../constants';

// Interface untuk baris data tabel Korwil
interface KorwilRow {
  wilayah: string;
  nama: string;
  kontak: string;
}

export const AdminDashboard: React.FC = () => {
  const { 
    users, registrations, verifyMemberByKorwil, approveMemberFinal, rejectMember, deleteMember, updateMember, resetMemberPassword, attendanceSessions, attendanceRecords, 
    createSession, updateSession, deleteSession, toggleSession, markAttendance, updateAttendanceRecord, deleteAttendanceRecord, news, gallery, sliders, mediaPosts, addNews, updateNews, deleteNews, 
    addGalleryItem, deleteGalleryItem, addSliderItem, deleteSliderItem, addMediaPost, deleteMediaPost, 
    showToast, currentUser, logout, 
    siteConfig, updateSiteConfig, restoreData, profilePages, updateProfilePage, 
    korwils, addKorwil, deleteKorwil
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'members' | 'attendance' | 'news' | 'gallery' | 'slider' | 'media' | 'recap' | 'settings' | 'backup' | 'profile'>('overview');
  const [newSessionName, setNewSessionName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Geofencing State
  const [geoLat, setGeoLat] = useState<string>('');
  const [geoLng, setGeoLng] = useState<string>('');
  const [geoRadius, setGeoRadius] = useState<string>('100');
  
  // Recap State
  const [recapType, setRecapType] = useState<'attendance' | 'members'>('attendance');
  
  // Member Management State
  const [memberSearch, setMemberSearch] = useState('');
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editMemberForm, setEditMemberForm] = useState({ name: '', nik: '', email: '', phone: '', address: '', wilayah: '' });
  const [isCustomWilayahEdit, setIsCustomWilayahEdit] = useState(false);

  // Member Delete & Reset Password State
  const [deleteMemberData, setDeleteMemberData] = useState<{id: number, name: string} | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{id: number, name: string} | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Attendance Detail State
  const [viewingSession, setViewingSession] = useState<AttendanceSession | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceViewMode, setAttendanceViewMode] = useState<'list' | 'grid'>('list');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Attendance Edit State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editRecordForm, setEditRecordForm] = useState({ userName: '', location: '', timestamp: '' });

  // Session Edit State
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [editSessionName, setEditSessionName] = useState('');
  const [editSessionGeo, setEditSessionGeo] = useState({ lat: '', lng: '', rad: '100' });

  // Session Delete State
  const [deleteSessionData, setDeleteSessionData] = useState<{id: number, name: string} | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  // News, Gallery, Slider, Media Form States (Condensed)
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const newsCoverInputRef = useRef<HTMLInputElement>(null);
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '' });
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [sliderForm, setSliderForm] = useState({ imageUrl: '', title: '', description: '' });
  const sliderInputRef = useRef<HTMLInputElement>(null);
  const [mediaForm, setMediaForm] = useState({ type: 'youtube' as 'youtube' | 'instagram', url: '', caption: '' });

  // Profile Editor State
  const [selectedProfileSlug, setSelectedProfileSlug] = useState('sejarah');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileContent, setProfileContent] = useState('');

  // Korwil Table State
  const [korwilRows, setKorwilRows] = useState<KorwilRow[]>([]);
  const [newKorwilRow, setNewKorwilRow] = useState<KorwilRow>({ wilayah: '', nama: '', kontak: '' });
  const [isKorwilInitialized, setIsKorwilInitialized] = useState(false);

  // Settings State
  const [configForm, setConfigForm] = useState(siteConfig);
  const [newKorwilName, setNewKorwilName] = useState('');

  // Backup State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for editor
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // ACCESS CONTROL
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isKorwil = currentUser?.role === UserRole.ADMIN_KORWIL;
  const isPengurus = currentUser?.role === UserRole.ADMIN_PENGURUS;

  // Set default tab based on role
  useEffect(() => {
    if (isKorwil && activeTab !== 'approval') setActiveTab('approval');
  }, [isKorwil]);

  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  // Editor Sync Logic (Condensed)
  useEffect(() => {
    const page = profilePages.find(p => p.slug === selectedProfileSlug);
    const content = page ? page.content : '';
    setProfileContent(content);
    
    const defaultTitles: Record<string, string> = {
        'sejarah': 'Sejarah Jamiyah', 'pengurus': 'Susunan Pengurus Pusat',
        'korwil': 'Daftar Koordinator Wilayah', 'amaliyah': 'Amaliyah & Wirid Rutin',
        'tentang-kami': 'Membangun Ukhuwah Islamiyah'
    };
    setProfileTitle(page ? page.title : defaultTitles[selectedProfileSlug] || '');
    if (editorRef.current && selectedProfileSlug !== 'korwil') editorRef.current.innerHTML = content;

    if (selectedProfileSlug === 'korwil' && !isKorwilInitialized) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const rows = doc.querySelectorAll('tbody tr');
        const parsedRows: KorwilRow[] = [];
        rows.forEach(tr => {
            const cols = tr.querySelectorAll('td');
            if (cols.length >= 3) parsedRows.push({ wilayah: cols[0].innerText.trim(), nama: cols[1].innerText.trim(), kontak: cols[2].innerText.trim() });
        });
        if (parsedRows.length > 0) setKorwilRows(parsedRows);
        setIsKorwilInitialized(true);
    }
  }, [selectedProfileSlug, profilePages, activeTab, isKorwilInitialized]);

  // Filter Registrations Based on Role
  const getPendingRegistrations = () => {
     if (isKorwil) {
        // Korwil sees PENDING only
        // Ideal: Filter by currentUser.wilayah match. Current: All Pending.
        return registrations.filter(r => r.status === MemberStatus.PENDING);
     } else if (isPengurus) {
        // Pengurus sees VERIFIED_KORWIL (ready for NIA)
        return registrations.filter(r => r.status === MemberStatus.VERIFIED_KORWIL);
     } else {
        // Super Admin sees ALL incomplete
        return registrations.filter(r => r.status === MemberStatus.PENDING || r.status === MemberStatus.VERIFIED_KORWIL);
     }
  };

  const filteredRegistrations = getPendingRegistrations();

  // --- HANDLERS --- (Simplified)
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName) {
      const lat = geoLat ? parseFloat(geoLat) : undefined;
      const lng = geoLng ? parseFloat(geoLng) : undefined;
      const rad = geoRadius ? parseFloat(geoRadius) : undefined;
      createSession(newSessionName, lat, lng, rad);
      setNewSessionName('');
      setGeoLat(''); setGeoLng(''); setGeoRadius('100');
    }
  };

  const handleEditSession = (session: AttendanceSession) => {
    setEditingSession(session);
    setEditSessionName(session.name);
    setEditSessionGeo({
       lat: session.latitude?.toString() || '',
       lng: session.longitude?.toString() || '',
       rad: session.radius?.toString() || '100'
    });
  };

  const handleUpdateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession && editSessionName.trim()) {
      const lat = editSessionGeo.lat ? parseFloat(editSessionGeo.lat) : undefined;
      const lng = editSessionGeo.lng ? parseFloat(editSessionGeo.lng) : undefined;
      const rad = editSessionGeo.rad ? parseFloat(editSessionGeo.rad) : 100;
      updateSession(editingSession.id, editSessionName, lat, lng, rad);
      setEditingSession(null);
    }
  };

  // Korwil Table Logic (Same as existing)
  const handleAddKorwilRow = () => { if (newKorwilRow.wilayah && newKorwilRow.nama) { setKorwilRows([...korwilRows, newKorwilRow]); setNewKorwilRow({ wilayah: '', nama: '', kontak: '' }); } };
  const handleDeleteKorwilRow = (i: number) => { const n = [...korwilRows]; n.splice(i, 1); setKorwilRows(n); };
  const handleUpdateKorwilRow = (i: number, f: keyof KorwilRow, v: string) => { const n = [...korwilRows]; n[i] = { ...n[i], [f]: v }; setKorwilRows(n); };
  const generateKorwilHTML = () => { /* Same HTML generation */ return `<div class="w-full overflow-hidden rounded-xl border border-neutral-200 shadow-lg my-6 bg-white font-sans"><table class="w-full text-left border-collapse"><thead><tr class="bg-gradient-to-r from-primary-900 to-primary-700 text-white"><th class="p-5 font-bold text-sm uppercase tracking-wider border-b border-primary-800">Wilayah / Jabatan</th><th class="p-5 font-bold text-sm uppercase tracking-wider border-b border-primary-800">Nama Koordinator</th><th class="p-5 font-bold text-sm uppercase tracking-wider border-b border-primary-800">Kontak / Keterangan</th></tr></thead><tbody class="divide-y divide-neutral-100">${korwilRows.map((row, idx) => `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} hover:bg-primary-50 transition-colors duration-200"><td class="p-5 font-bold text-primary-900">${row.wilayah}</td><td class="p-5 text-neutral-700 font-medium">${row.nama}</td><td class="p-5 text-neutral-600 font-mono text-sm">${row.kontak}</td></tr>`).join('')}</tbody></table></div>`; };

  // Common delete handlers
  const handleDeleteSession = (id: number, name: string) => setDeleteSessionData({ id, name });
  const confirmDeleteSession = async () => { if (deleteSessionData) { setIsDeletingSession(true); await deleteSession(deleteSessionData.id); setIsDeletingSession(false); setDeleteSessionData(null); } };
  const handleDeleteMember = (id: number, name: string) => setDeleteMemberData({ id, name });
  const confirmDeleteMember = async () => { if (deleteMemberData) { setIsDeletingMember(true); await deleteMember(deleteMemberData.id); setIsDeletingMember(false); setDeleteMemberData(null); } };

  const handleDeleteRecord = async (record: AttendanceRecord) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) {
        await deleteAttendanceRecord(record.id, record.sessionId, record.userId);
    }
  };

  // Other form handlers (News, Gallery, etc.) mostly unchanged except permission checks in render

  return (
    <div className="min-h-screen bg-[#ecf0f5] font-sans text-sm">
      <header className="fixed top-0 left-0 right-0 h-[50px] bg-[#3c8dbc] z-50 flex">
        <div className={`h-full bg-[#367fa9] text-white flex items-center justify-center font-bold text-lg transition-all duration-300 ${sidebarOpen ? 'w-[230px]' : 'w-[50px]'}`}>
           {sidebarOpen ? (isSuperAdmin ? 'SUPER ADMIN' : isKorwil ? 'ADMIN KORWIL' : 'PENGURUS') : 'JSN'}
        </div>
        <nav className="flex-1 flex justify-between items-center px-4">
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-black/10 p-2 rounded transition">
              <Menu size={20} />
           </button>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-white pl-4 border-l border-white/20">
                 <img src={`https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`} className="w-8 h-8 rounded-full border border-white/50" alt="Admin" />
                 <span className="hidden sm:inline font-semibold">{currentUser?.name}</span>
              </div>
              <button onClick={logout} className="text-white/80 hover:text-white ml-2">
                 <LogOut size={18} />
              </button>
           </div>
        </nav>
      </header>

      <aside className={`fixed top-[50px] bottom-0 left-0 bg-[#222d32] text-[#b8c7ce] transition-all duration-300 z-40 overflow-y-auto ${sidebarOpen ? 'w-[230px]' : 'w-[50px]'}`}>
         {sidebarOpen && (
           <div className="p-4 flex items-center gap-3 mb-4">
              <img src={`https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`} className="w-12 h-12 rounded-full border-2 border-white/10" alt="User" />
              <div>
                 <p className="font-semibold text-white truncate w-32">{currentUser?.name}</p>
                 <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#00a65a]"></div> {currentUser?.role}
                 </div>
              </div>
           </div>
         )}
         <div className="py-2">
            {sidebarOpen && <p className="px-4 text-[10px] uppercase font-bold text-[#4b646f] mb-2 tracking-wider">Main Navigation</p>}
            <ul className="space-y-0.5">
               {/* ROLE BASED MENU ITEMS */}
               {(isSuperAdmin || isKorwil || isPengurus) && (
                 <li>
                    <button onClick={() => setActiveTab('approval')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'approval' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}>
                       <div className="flex items-center gap-3"><UserCheck size={18} />{sidebarOpen && <span>Approval Anggota</span>}</div>
                       {sidebarOpen && filteredRegistrations.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{filteredRegistrations.length}</span>}
                    </button>
                 </li>
               )}
               
               {(isSuperAdmin || isPengurus) && (
                 <>
                   <li>
                      <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'attendance' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}>
                         <div className="flex items-center gap-3"><Calendar size={18} />{sidebarOpen && <span>Absensi & Geo</span>}</div>
                      </button>
                   </li>
                   <li>
                      <button onClick={() => setActiveTab('recap')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'recap' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}>
                         <div className="flex items-center gap-3"><FileSpreadsheet size={18} />{sidebarOpen && <span>Rekap Data</span>}</div>
                      </button>
                   </li>
                   <li>
                      <button onClick={() => setActiveTab('members')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'members' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}>
                         <div className="flex items-center gap-3"><Users size={18} />{sidebarOpen && <span>Data Anggota</span>}</div>
                      </button>
                   </li>
                 </>
               )}

               {isSuperAdmin && (
                 <>
                   <li><button onClick={() => setActiveTab('overview')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'overview' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}><div className="flex items-center gap-3"><BarChart2 size={18} />{sidebarOpen && <span>Dashboard</span>}</div></button></li>
                   <li><button onClick={() => setActiveTab('news')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'news' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}><div className="flex items-center gap-3"><FileText size={18} />{sidebarOpen && <span>Berita</span>}</div></button></li>
                   <li><button onClick={() => setActiveTab('profile')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'profile' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}><div className="flex items-center gap-3"><UserIcon size={18} />{sidebarOpen && <span>Profil Organisasi</span>}</div></button></li>
                   <li><button onClick={() => setActiveTab('settings')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'settings' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}><div className="flex items-center gap-3"><Settings size={18} />{sidebarOpen && <span>Pengaturan</span>}</div></button></li>
                   <li><button onClick={() => setActiveTab('backup')} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] border-l-[3px] ${activeTab === 'backup' ? 'bg-[#1e282c] border-[#3c8dbc] text-white' : 'border-transparent'}`}><div className="flex items-center gap-3"><Database size={18} />{sidebarOpen && <span>Backup & Restore</span>}</div></button></li>
                 </>
               )}
            </ul>
         </div>
      </aside>

      <main className={`pt-[50px] transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-[230px]' : 'ml-[50px]'}`}>
         
         <div className="px-6 py-4 flex justify-between items-center bg-transparent">
            <div>
               <h1 className="text-2xl font-normal text-[#333]">
                  {activeTab === 'approval' && (isKorwil ? 'Verifikasi Anggota (Korwil)' : isPengurus ? 'Terbit NIA (Pengurus)' : 'Approval Anggota')}
                  {activeTab === 'attendance' && 'Absensi & Geofencing'}
                  {/* Other titles ... */}
                  {activeTab === 'overview' && 'Dashboard Super Admin'}
               </h1>
            </div>
         </div>

         <div className="px-6 pb-6 flex-grow">
            {/* APPROVAL TAB - MULTI-LEVEL LOGIC */}
            {activeTab === 'approval' && (
               <div className="bg-white border-t-[3px] border-[#00c0ef] shadow-sm rounded-sm">
                  <div className="px-4 py-3 border-b border-[#f4f4f4]">
                    <h3 className="text-lg font-normal text-[#333]">
                        {isKorwil ? 'Permohonan Masuk (Perlu Verifikasi)' : isPengurus ? 'Data Terverifikasi Korwil (Perlu NIA)' : 'Semua Permohonan'}
                    </h3>
                  </div>
                  <div className="p-0">
                     {filteredRegistrations.length === 0 ? <div className="p-4 text-center text-gray-500">Tidak ada data yang perlu diproses.</div> : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                 <tr><th className="px-4 py-3 border-b">Nama & NIK</th><th className="px-4 py-3 border-b">Kontak</th><th className="px-4 py-3 border-b">Wilayah</th><th className="px-4 py-3 border-b">Status</th><th className="px-4 py-3 border-b text-right">Aksi</th></tr>
                              </thead>
                              <tbody>
                                 {filteredRegistrations.map(reg => (
                                    <tr key={reg.id} className="hover:bg-gray-50 border-b last:border-0">
                                       <td className="px-4 py-3">
                                          <div className="font-bold text-[#333]">{reg.name}</div>
                                          <div className="text-xs text-gray-500 font-mono">NIK: {reg.nik || '-'}</div>
                                       </td>
                                       <td className="px-4 py-3 text-sm">{reg.phone}<br/><span className="text-gray-400 text-xs">{reg.email}</span></td>
                                       <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200 text-gray-600">{reg.wilayah}</span></td>
                                       <td className="px-4 py-3">
                                          {reg.status === MemberStatus.PENDING && <span className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded">Pending Korwil</span>}
                                          {reg.status === MemberStatus.VERIFIED_KORWIL && <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">Approved Korwil</span>}
                                       </td>
                                       <td className="px-4 py-3 text-right">
                                          <div className="flex justify-end gap-2">
                                             {/* Logic Tombol Berdasarkan Role */}
                                             {(isKorwil || isSuperAdmin) && reg.status === MemberStatus.PENDING && (
                                                <button onClick={() => verifyMemberByKorwil(reg.id)} className="bg-[#f39c12] text-white px-3 py-1 rounded-sm text-xs font-bold hover:bg-[#e08e0b] shadow-sm">Verifikasi (Korwil)</button>
                                             )}
                                             
                                             {(isPengurus || isSuperAdmin) && reg.status === MemberStatus.VERIFIED_KORWIL && (
                                                <button onClick={() => approveMemberFinal(reg.id)} className="bg-[#00a65a] text-white px-3 py-1 rounded-sm text-xs font-bold hover:bg-[#008d4c] shadow-sm">Terbit NIA (Final)</button>
                                             )}

                                             <button onClick={() => rejectMember(reg.id)} className="bg-[#dd4b39] text-white px-3 py-1 rounded-sm text-xs font-bold hover:bg-[#d73925] shadow-sm">Tolak</button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* ATTENDANCE TAB - WITH GEOFENCING */}
            {activeTab === 'attendance' && (
               <div className="space-y-6">
                  {!viewingSession ? (
                     <>
                        {/* Create Session Form with Geo */}
                        <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm rounded-sm">
                           <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Buat Sesi Absensi & Lokasi (Geofencing)</h3></div>
                           <div className="p-4">
                              <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                 <div className="md:col-span-5">
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Nama Kegiatan</label>
                                    <input type="text" placeholder="Contoh: Rutinan Malam Jumat" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:border-[#00a65a] outline-none transition" value={newSessionName} onChange={e => setNewSessionName(e.target.value)} required />
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Latitude</label>
                                    <input type="number" step="any" placeholder="-7.xxxx" className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#00a65a] outline-none" value={geoLat} onChange={e => setGeoLat(e.target.value)} />
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Longitude</label>
                                    <input type="number" step="any" placeholder="112.xxxx" className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#00a65a] outline-none" value={geoLng} onChange={e => setGeoLng(e.target.value)} />
                                 </div>
                                 <div className="md:col-span-1">
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Radius (m)</label>
                                    <input type="number" placeholder="100" className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#00a65a] outline-none" value={geoRadius} onChange={e => setGeoRadius(e.target.value)} />
                                 </div>
                                 <div className="md:col-span-2 flex items-end">
                                    <button type="submit" className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white py-2 rounded-sm font-bold shadow-sm flex items-center justify-center gap-2"><Plus size={16} /> Buat Sesi</button>
                                 </div>
                              </form>
                              <div className="mt-2 text-[10px] text-gray-400">
                                 *Biarkan Lat/Long kosong jika tidak ingin membatasi lokasi (Bebas Absen). Gunakan Google Maps untuk mendapatkan koordinat.
                              </div>
                           </div>
                        </div>

                        {/* Session List */}
                        <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm">
                           <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Daftar Sesi Absensi</h3></div>
                           <div className="p-0 overflow-x-auto">
                                 <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                       <tr><th className="px-4 py-3 border-b">Tanggal</th><th className="px-4 py-3 border-b">Kegiatan</th><th className="px-4 py-3 border-b">Lokasi (Geo)</th><th className="px-4 py-3 border-b text-center">Status</th><th className="px-4 py-3 border-b text-center">Hadir</th><th className="px-4 py-3 border-b text-right">Aksi</th></tr>
                                    </thead>
                                    <tbody>
                                       {attendanceSessions.map(session => (
                                          <tr key={session.id} className="hover:bg-gray-50 border-b last:border-0">
                                             <td className="px-4 py-3 text-gray-600 w-32"><div className="flex items-center gap-2"><Calendar size={14} /> {session.date}</div></td>
                                             <td className="px-4 py-3 font-bold text-[#333]">{session.name}</td>
                                             <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                                {session.latitude ? (
                                                   <span title={`Lat: ${session.latitude}, Lng: ${session.longitude}`}>
                                                      <MapPin size={12} className="inline text-red-500 mr-1"/>
                                                      Locked ({session.radius}m)
                                                   </span>
                                                ) : <span className="text-gray-400">Bebas</span>}
                                             </td>
                                             <td className="px-4 py-3 text-center">
                                                <button onClick={() => toggleSession(session.id)} className={`px-2 py-1 rounded text-xs font-bold uppercase transition ${session.isOpen ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                                   {session.isOpen ? 'DIBUKA' : 'DITUTUP'}
                                                </button>
                                             </td>
                                             <td className="px-4 py-3 text-center font-mono font-bold text-[#3c8dbc]">{session.attendees.length}</td>
                                             <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                   <button onClick={() => setViewingSession(session)} className="bg-[#3c8dbc] text-white p-1.5 rounded-sm hover:bg-[#367fa9] shadow-sm" title="Lihat Data"><ListIcon size={16} /></button>
                                                   <button onClick={() => handleEditSession(session)} className="bg-[#f39c12] text-white p-1.5 rounded-sm hover:bg-[#e08e0b] shadow-sm" title="Edit"><Edit3 size={16} /></button>
                                                   <button onClick={() => handleDeleteSession(session.id, session.name)} className="bg-[#dd4b39] text-white p-1.5 rounded-sm hover:bg-[#d73925] shadow-sm" title="Hapus"><Trash2 size={16} /></button>
                                                </div>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                           </div>
                        </div>
                     </>
                  ) : (
                     /* Session Detail View (Unchanged Logic, reusing existing code) */
                     <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm animate-fade-in-up">
                        {/* ... Existing session detail code ... */}
                        <div className="px-4 py-3 border-b border-[#f4f4f4] flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                               <button onClick={() => setViewingSession(null)} className="text-gray-500 hover:text-[#3c8dbc] p-1 rounded-full hover:bg-gray-100 transition"><ArrowLeft size={20} /></button>
                               <div>
                                  <h3 className="text-lg font-bold text-[#333]">{viewingSession.name}</h3>
                                  <p className="text-xs text-gray-500 flex items-center gap-2"><Calendar size={12}/> {viewingSession.date} • <UserIcon size={12}/> {viewingSession.attendees.length} Hadir</p>
                               </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                               <div className="relative flex-grow sm:flex-grow-0">
                                  <input type="text" placeholder="Cari peserta..." className="w-full sm:w-64 pl-8 pr-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:border-[#3c8dbc] outline-none" value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)} />
                                  <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                               </div>
                            </div>
                         </div>
                         <div className="p-4 bg-gray-50 min-h-[300px]">
                            {/* ... Existing table logic ... */}
                            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                                  <div className="overflow-x-auto">
                                      <table className="w-full text-left">
                                         <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                            <tr><th className="px-4 py-3 border-b">Waktu</th><th className="px-4 py-3 border-b">Nama</th><th className="px-4 py-3 border-b">Lokasi</th><th className="px-4 py-3 border-b text-right">Foto</th><th className="px-4 py-3 border-b text-right">Aksi</th></tr>
                                         </thead>
                                         <tbody>
                                            {attendanceRecords.filter(r => r.sessionId === viewingSession.id).map(record => (
                                               <tr key={record.id} className="hover:bg-gray-50 border-b last:border-0 text-sm">
                                                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{record.timestamp.split(',')[1]}</td>
                                                  <td className="px-4 py-3 font-bold text-[#333]">{record.userName}</td>
                                                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{record.location}</td>
                                                  <td className="px-4 py-3 text-right">
                                                     <button onClick={() => setPreviewImage(record.photoUrl)} className="text-[#3c8dbc] hover:underline text-xs flex items-center justify-end gap-1"><ImageIcon size={12} /> Lihat Foto</button>
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                      <div className="flex justify-end gap-2">
                                                         <button onClick={() => handleDeleteRecord(record)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={14}/></button>
                                                      </div>
                                                  </td>
                                               </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                  </div>
                               </div>
                         </div>
                     </div>
                  )}
               </div>
            )}

            {/* OVERVIEW TAB (Only for Super Admin) */}
            {activeTab === 'overview' && isSuperAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 {/* Overview Cards */}
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#00c0ef] flex items-center justify-center text-white"><Settings size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">ANGGOTA AKTIF</span><span className="block text-lg font-bold text-[#333]">{users.filter(u=>u.status==='active').length}</span></div>
                 </div>
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#dd4b39] flex items-center justify-center text-white"><AlertCircle size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">PENDING</span><span className="block text-lg font-bold text-[#333]">{registrations.length}</span></div>
                 </div>
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#00a65a] flex items-center justify-center text-white"><Calendar size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">TOTAL SESI</span><span className="block text-lg font-bold text-[#333]">{attendanceSessions.length}</span></div>
                 </div>
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#f39c12] flex items-center justify-center text-white"><Users size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">TOTAL BERITA</span><span className="block text-lg font-bold text-[#333]">{news.length}</span></div>
                 </div>
              </div>
            )}

            {/* Other tabs (News, Slider, Settings, etc) hidden if not Super Admin in render logic above */}
            {/* ... Only render these if isSuperAdmin ... */}
            
            {/* Edit Session Modal with Geo */}
            {editingSession && (
                <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-4">
                   <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                         <h3 className="font-bold text-gray-700">Edit Sesi & Lokasi</h3>
                         <button onClick={() => setEditingSession(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                      </div>
                      <form onSubmit={handleUpdateSessionSubmit} className="p-4 space-y-4">
                         <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Nama Kegiatan</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#f39c12] outline-none" value={editSessionName} onChange={(e) => setEditSessionName(e.target.value)} required />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Latitude</label>
                                <input type="number" step="any" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#f39c12] outline-none" value={editSessionGeo.lat} onChange={(e) => setEditSessionGeo({...editSessionGeo, lat: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Longitude</label>
                                <input type="number" step="any" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#f39c12] outline-none" value={editSessionGeo.lng} onChange={(e) => setEditSessionGeo({...editSessionGeo, lng: e.target.value})} />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Radius (meter)</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#f39c12] outline-none" value={editSessionGeo.rad} onChange={(e) => setEditSessionGeo({...editSessionGeo, rad: e.target.value})} />
                         </div>
                         <div className="flex justify-end pt-2 border-t border-gray-100 gap-2">
                            <button type="button" onClick={() => setEditingSession(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white rounded text-sm font-bold shadow-sm flex items-center gap-2"><Save size={16} /> Simpan</button>
                         </div>
                      </form>
                   </div>
                </div>
            )}
            
            {/* Keep existing Image Preview, Delete Member, Delete Session Modals */}
            {/* ... Same as original code ... */}
         </div>
      </main>
    </div>
  );
};
