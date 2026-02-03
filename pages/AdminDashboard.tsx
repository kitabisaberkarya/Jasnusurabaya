
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Calendar, FileText, BarChart2, UserCheck, AlertCircle, ArrowUpRight, 
  ChevronRight, Image as ImageIcon, Check, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Undo, Redo, Strikethrough, Quote, Link as LinkIcon, Video, Plus, Table,
  Printer, Type, Highlighter, Indent, Outdent, RemoveFormatting, ChevronDown,
  FileSpreadsheet, Download, Filter, Search, Menu, Bell, Settings, LogOut, Circle, Save, Upload, Database, RefreshCcw, AlertTriangle,
  User as UserIcon, Youtube, Instagram, Trash2, PlayCircle, Edit3, Key, MapPin, Phone, Eye, ExternalLink, Grid, List as ListIcon, Lock, LayoutTemplate, ArrowLeft, Clock,
  LayoutDashboard, CheckCircle2
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
        return registrations.filter(r => r.status === MemberStatus.PENDING);
     } else if (isPengurus) {
        return registrations.filter(r => r.status === MemberStatus.VERIFIED_KORWIL);
     } else {
        return registrations.filter(r => r.status === MemberStatus.PENDING || r.status === MemberStatus.VERIFIED_KORWIL);
     }
  };

  const filteredRegistrations = getPendingRegistrations();

  // --- HANDLERS ---
  const handleGetCurrentLocation = (isEdit: boolean = false) => {
    if (!navigator.geolocation) {
        showToast("Browser tidak mendukung Geolokasi", "error");
        return;
    }
    showToast("Mendeteksi lokasi saat ini...", "info");
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude.toString();
            const lng = pos.coords.longitude.toString();
            if (isEdit) {
                 setEditSessionGeo(prev => ({ ...prev, lat, lng }));
            } else {
                 setGeoLat(lat);
                 setGeoLng(lng);
            }
            showToast("Lokasi ditemukan!", "success");
        },
        (err) => {
             console.error(err);
             showToast("Gagal mengambil lokasi: " + err.message, "error");
        },
        { enableHighAccuracy: true }
    );
  };

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

  // Korwil Table Logic
  const handleAddKorwilRow = () => { if (newKorwilRow.wilayah && newKorwilRow.nama) { setKorwilRows([...korwilRows, newKorwilRow]); setNewKorwilRow({ wilayah: '', nama: '', kontak: '' }); } };
  const handleDeleteKorwilRow = (i: number) => { const n = [...korwilRows]; n.splice(i, 1); setKorwilRows(n); };
  const handleUpdateKorwilRow = (i: number, f: keyof KorwilRow, v: string) => { const n = [...korwilRows]; n[i] = { ...n[i], [f]: v }; setKorwilRows(n); };
  
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

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-sm flex flex-col">
      {/* HEADER BAR */}
      <header className="fixed top-0 left-0 right-0 h-[64px] bg-white border-b border-neutral-200 z-50 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className={`h-full bg-primary-900 text-white flex items-center justify-center font-bold text-lg tracking-wider transition-all duration-300 ${sidebarOpen ? 'w-[260px]' : 'w-[70px]'}`}>
           {sidebarOpen ? (isSuperAdmin ? 'SUPER ADMIN' : isKorwil ? 'ADMIN KORWIL' : 'PENGURUS') : 'JSN'}
        </div>
        
        <div className="flex-1 flex justify-between items-center px-6">
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-neutral-500 hover:bg-neutral-100 p-2 rounded-lg transition">
              <Menu size={20} />
           </button>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                 <div className="text-right hidden sm:block">
                     <p className="font-bold text-neutral-800 text-sm">{currentUser?.name}</p>
                     <p className="text-xs text-neutral-500 uppercase">{currentUser?.role}</p>
                 </div>
                 <img src={`https://ui-avatars.com/api/?name=${currentUser?.name}&background=047857&color=fff`} className="w-9 h-9 rounded-full border-2 border-primary-100 shadow-sm" alt="Admin" />
              </div>
              <button onClick={logout} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Logout">
                 <LogOut size={18} />
              </button>
           </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`fixed top-[64px] bottom-0 left-0 bg-primary-900 text-primary-100 transition-all duration-300 z-40 overflow-y-auto border-r border-primary-800 ${sidebarOpen ? 'w-[260px]' : 'w-[70px]'}`}>
         <div className="py-4 px-3">
            <ul className="space-y-1">
               {/* APPROVAL MENU (All Roles) */}
               {(isSuperAdmin || isKorwil || isPengurus) && (
                 <li>
                    <button onClick={() => setActiveTab('approval')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'approval' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}>
                       <UserCheck size={20} className={activeTab === 'approval' ? 'text-secondary-500' : ''} />
                       {sidebarOpen && (
                          <span className="flex-1 text-left font-medium flex justify-between items-center">
                             Approval
                             {filteredRegistrations.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{filteredRegistrations.length}</span>}
                          </span>
                       )}
                    </button>
                 </li>
               )}
               
               {/* CORE MENU (Pengurus & Super Admin) */}
               {(isSuperAdmin || isPengurus) && (
                 <>
                   <li>
                      <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}>
                         <Calendar size={20} className={activeTab === 'attendance' ? 'text-secondary-500' : ''} />
                         {sidebarOpen && <span className="flex-1 text-left font-medium">Absensi & Geo</span>}
                      </button>
                   </li>
                   <li>
                      <button onClick={() => setActiveTab('recap')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'recap' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}>
                         <FileSpreadsheet size={20} className={activeTab === 'recap' ? 'text-secondary-500' : ''} />
                         {sidebarOpen && <span className="flex-1 text-left font-medium">Rekap Data</span>}
                      </button>
                   </li>
                   <li>
                      <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'members' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}>
                         <Users size={20} className={activeTab === 'members' ? 'text-secondary-500' : ''} />
                         {sidebarOpen && <span className="flex-1 text-left font-medium">Data Anggota</span>}
                      </button>
                   </li>
                 </>
               )}

               {/* SUPER ADMIN EXCLUSIVE */}
               {isSuperAdmin && (
                 <>
                   <div className="pt-4 pb-2">
                      {sidebarOpen && <p className="px-3 text-[10px] uppercase font-bold text-primary-400 tracking-wider">Konten & Sistem</p>}
                   </div>
                   <li><button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Dashboard</span>}</button></li>
                   <li><button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'news' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><FileText size={20} className={activeTab === 'news' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Berita</span>}</button></li>
                   <li><button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><UserIcon size={20} className={activeTab === 'profile' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Profil & Hal</span>}</button></li>
                   <li><button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><Settings size={20} className={activeTab === 'settings' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Pengaturan</span>}</button></li>
                   <li><button onClick={() => setActiveTab('backup')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'backup' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><Database size={20} className={activeTab === 'backup' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Backup</span>}</button></li>
                 </>
               )}
            </ul>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`pt-[80px] pb-10 transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-[260px]' : 'ml-[70px]'} px-8`}>
         
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-2xl font-bold text-neutral-800 font-serif">
                  {activeTab === 'approval' && 'Verifikasi Anggota'}
                  {activeTab === 'attendance' && 'Manajemen Absensi'}
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'members' && 'Data Keanggotaan'}
                  {activeTab === 'news' && 'Berita & Artikel'}
                  {activeTab === 'settings' && 'Pengaturan Sistem'}
                  {activeTab === 'profile' && 'Editor Profil'}
               </h1>
               <p className="text-neutral-500 text-sm mt-1">
                  Selamat datang kembali, {currentUser?.name}
               </p>
            </div>
            
            {activeTab === 'attendance' && !viewingSession && (
               <button onClick={() => document.getElementById('session-form')?.scrollIntoView({behavior: 'smooth'})} className="bg-primary-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-800 transition flex items-center gap-2 shadow-sm">
                  <Plus size={18} /> Buat Sesi Baru
               </button>
            )}
         </div>

         <div className="flex-grow">
            {/* APPROVAL TAB */}
            {activeTab === 'approval' && (
               <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                    <h3 className="font-bold text-neutral-700">
                        {isKorwil ? 'Permohonan Masuk (Perlu Verifikasi)' : isPengurus ? 'Data Terverifikasi Korwil (Perlu NIA)' : 'Semua Permohonan'}
                    </h3>
                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">{filteredRegistrations.length} Pending</span>
                  </div>
                  <div className="p-0">
                     {filteredRegistrations.length === 0 ? <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-3"><CheckCircle2 size={48} className="text-neutral-200" />Tidak ada data yang perlu diproses.</div> : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-bold tracking-wider">
                                 <tr><th className="px-6 py-4">Nama & NIK</th><th className="px-6 py-4">Kontak</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100">
                                 {filteredRegistrations.map(reg => (
                                    <tr key={reg.id} className="hover:bg-neutral-50 transition">
                                       <td className="px-6 py-4">
                                          <div className="font-bold text-neutral-800">{reg.name}</div>
                                          <div className="text-xs text-neutral-500 font-mono mt-0.5">NIK: {reg.nik || '-'}</div>
                                       </td>
                                       <td className="px-6 py-4 text-sm">
                                          <div className="flex items-center gap-2"><Phone size={14} className="text-neutral-400" /> {reg.phone}</div>
                                          <div className="text-neutral-400 text-xs mt-1">{reg.email}</div>
                                       </td>
                                       <td className="px-6 py-4"><span className="bg-neutral-100 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600">{reg.wilayah}</span></td>
                                       <td className="px-6 py-4">
                                          {reg.status === MemberStatus.PENDING && <span className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-100">Pending Korwil</span>}
                                          {reg.status === MemberStatus.VERIFIED_KORWIL && <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Approved Korwil</span>}
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <div className="flex justify-end gap-2">
                                             {(isKorwil || isSuperAdmin) && reg.status === MemberStatus.PENDING && (
                                                <button onClick={() => verifyMemberByKorwil(reg.id)} className="bg-secondary-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-secondary-600 shadow-sm transition">Verifikasi</button>
                                             )}
                                             
                                             {(isPengurus || isSuperAdmin) && reg.status === MemberStatus.VERIFIED_KORWIL && (
                                                <button onClick={() => approveMemberFinal(reg.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm transition">Terbit NIA</button>
                                             )}

                                             <button onClick={() => rejectMember(reg.id)} className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition">Tolak</button>
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

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
               <div className="space-y-8">
                  {!viewingSession ? (
                     <>
                        {/* CREATE SESSION CARD */}
                        <div id="session-form" className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden p-6 md:p-8">
                           <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2"><MapPin size={20} className="text-secondary-500"/> Buat Sesi & Geofencing</h3>
                           <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                 <div className="md:col-span-12 lg:col-span-5">
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-2">Nama Kegiatan</label>
                                    <input type="text" placeholder="Contoh: Rutinan Malam Jumat" className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" value={newSessionName} onChange={e => setNewSessionName(e.target.value)} required />
                                 </div>
                                 
                                 {/* Geo Inputs Group */}
                                 <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                     <div>
                                        <label className="block text-xs uppercase font-bold text-neutral-400 mb-2">Latitude</label>
                                        <input type="number" step="any" placeholder="-7.xxxx" className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-lg focus:border-primary-500 outline-none text-sm" value={geoLat} onChange={e => setGeoLat(e.target.value)} />
                                     </div>
                                     <div>
                                        <label className="block text-xs uppercase font-bold text-neutral-400 mb-2">Longitude</label>
                                        <input type="number" step="any" placeholder="112.xxxx" className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-lg focus:border-primary-500 outline-none text-sm" value={geoLng} onChange={e => setGeoLng(e.target.value)} />
                                     </div>
                                     <div>
                                        <label className="block text-xs uppercase font-bold text-neutral-400 mb-2">Radius (m)</label>
                                        <input type="number" placeholder="100" className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-lg focus:border-primary-500 outline-none text-sm" value={geoRadius} onChange={e => setGeoRadius(e.target.value)} />
                                     </div>
                                     <div className="sm:col-span-3 flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-neutral-400">*Kosongkan Lat/Long untuk Absensi Bebas Lokasi</span>
                                        <button type="button" onClick={() => handleGetCurrentLocation(false)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 transition font-bold">
                                           <MapPin size={14} /> Ambil Lokasi Saya
                                        </button>
                                     </div>
                                 </div>

                                 <div className="md:col-span-12 flex justify-end">
                                    <button type="submit" className="px-8 py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold shadow-lg shadow-primary-700/20 flex items-center gap-2 transition transform hover:-translate-y-0.5">
                                       <Plus size={18} /> Buat Sesi Baru
                                    </button>
                                 </div>
                              </form>
                        </div>

                        {/* SESSION LIST */}
                        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                           <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                              <h3 className="font-bold text-neutral-700">Daftar Sesi Absensi</h3>
                           </div>
                           <div className="overflow-x-auto">
                                 <table className="w-full text-left">
                                    <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-bold tracking-wider">
                                       <tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Kegiatan</th><th className="px-6 py-4">Lokasi (Geo)</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Hadir</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                       {attendanceSessions.map(session => (
                                          <tr key={session.id} className="hover:bg-neutral-50 transition">
                                             <td className="px-6 py-4 text-neutral-500 font-mono text-xs w-32 whitespace-nowrap"><div className="flex items-center gap-2"><Calendar size={14} /> {session.date}</div></td>
                                             <td className="px-6 py-4 font-bold text-neutral-800">{session.name}</td>
                                             <td className="px-6 py-4">
                                                {session.latitude ? (
                                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100" title={`Lat: ${session.latitude}, Lng: ${session.longitude}`}>
                                                      <Lock size={12} /> Radius {session.radius}m
                                                   </span>
                                                ) : <span className="text-neutral-400 text-xs flex items-center gap-1"><MapPin size={12}/> Bebas</span>}
                                             </td>
                                             <td className="px-6 py-4 text-center">
                                                <button onClick={() => toggleSession(session.id)} className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition shadow-sm ${session.isOpen ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                                   {session.isOpen ? 'DIBUKA' : 'DITUTUP'}
                                                </button>
                                             </td>
                                             <td className="px-6 py-4 text-center font-mono font-bold text-primary-600 text-lg">{session.attendees.length}</td>
                                             <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                   <button onClick={() => setViewingSession(session)} className="bg-primary-50 text-primary-700 p-2 rounded-lg hover:bg-primary-100 transition" title="Lihat Data"><ListIcon size={16} /></button>
                                                   <button onClick={() => handleEditSession(session)} className="bg-amber-50 text-amber-600 p-2 rounded-lg hover:bg-amber-100 transition" title="Edit"><Edit3 size={16} /></button>
                                                   <button onClick={() => handleDeleteSession(session.id, session.name)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition" title="Hapus"><Trash2 size={16} /></button>
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
                     /* Session Detail View - MODERN */
                     <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-50">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                               <button onClick={() => setViewingSession(null)} className="text-neutral-400 hover:text-primary-700 p-2 rounded-full hover:bg-white transition shadow-sm"><ArrowLeft size={20} /></button>
                               <div>
                                  <h3 className="text-lg font-bold text-neutral-800">{viewingSession.name}</h3>
                                  <p className="text-xs text-neutral-500 flex items-center gap-3 mt-1 font-medium"><Calendar size={14}/> {viewingSession.date} <span className="text-neutral-300">|</span> <UserIcon size={14}/> {viewingSession.attendees.length} Hadir</p>
                               </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                               <div className="relative flex-grow sm:flex-grow-0">
                                  <input type="text" placeholder="Cari peserta..." className="w-full sm:w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:border-primary-500 outline-none shadow-sm" value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)} />
                                  <Search size={16} className="absolute left-3.5 top-2.5 text-neutral-400" />
                               </div>
                            </div>
                         </div>
                         <div className="p-0">
                                  <div className="overflow-x-auto">
                                      <table className="w-full text-left">
                                         <thead className="bg-white text-neutral-500 text-xs uppercase font-bold tracking-wider border-b border-neutral-100">
                                            <tr><th className="px-6 py-4">Waktu</th><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Lokasi Absen</th><th className="px-6 py-4 text-right">Foto Bukti</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                                         </thead>
                                         <tbody className="divide-y divide-neutral-50">
                                            {attendanceRecords.filter(r => r.sessionId === viewingSession.id).map(record => (
                                               <tr key={record.id} className="hover:bg-neutral-50 transition">
                                                  <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{record.timestamp.split(',')[1]}</td>
                                                  <td className="px-6 py-4 font-bold text-neutral-800">{record.userName}</td>
                                                  <td className="px-6 py-4 text-neutral-600 text-sm truncate max-w-xs">{record.location}</td>
                                                  <td className="px-6 py-4 text-right">
                                                     <button onClick={() => setPreviewImage(record.photoUrl)} className="text-primary-600 hover:text-primary-800 text-xs font-bold inline-flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-full"><ImageIcon size={12} /> Lihat Foto</button>
                                                  </td>
                                                  <td className="px-6 py-4 text-right">
                                                      <div className="flex justify-end gap-2">
                                                         <button onClick={() => handleDeleteRecord(record)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                                                      </div>
                                                  </td>
                                               </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                  </div>
                         </div>
                     </div>
                  )}
               </div>
            )}

            {/* OVERVIEW TAB (Only for Super Admin) */}
            {activeTab === 'overview' && isSuperAdmin && (
              <div className="space-y-8">
                  {/* Modern Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-start justify-between hover:shadow-md transition">
                        <div>
                           <p className="text-neutral-500 text-sm font-medium">Anggota Aktif</p>
                           <h3 className="text-3xl font-bold text-neutral-800 mt-2">{users.filter(u=>u.status==='active').length}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                           <UserCheck size={24} />
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-start justify-between hover:shadow-md transition">
                        <div>
                           <p className="text-neutral-500 text-sm font-medium">Menunggu Verifikasi</p>
                           <h3 className="text-3xl font-bold text-neutral-800 mt-2">{registrations.length}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                           <AlertCircle size={24} />
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-start justify-between hover:shadow-md transition">
                        <div>
                           <p className="text-neutral-500 text-sm font-medium">Total Kegiatan</p>
                           <h3 className="text-3xl font-bold text-neutral-800 mt-2">{attendanceSessions.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                           <Calendar size={24} />
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-start justify-between hover:shadow-md transition">
                        <div>
                           <p className="text-neutral-500 text-sm font-medium">Total Berita</p>
                           <h3 className="text-3xl font-bold text-neutral-800 mt-2">{news.length}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                           <FileText size={24} />
                        </div>
                     </div>
                  </div>
                  
                  {/* Recent Activity or Placeholder */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400">
                     <p>Selamat bekerja, Administrator. Pilih menu di sebelah kiri untuk mengelola sistem.</p>
                  </div>
              </div>
            )}
            
            {/* Edit Session Modal with Geo */}
            {editingSession && (
                <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                      <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                         <h3 className="font-bold text-neutral-800 text-lg">Edit Sesi & Lokasi</h3>
                         <button onClick={() => setEditingSession(null)} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
                      </div>
                      <form onSubmit={handleUpdateSessionSubmit} className="p-6 space-y-5">
                         <div>
                            <label className="block text-xs uppercase font-bold text-neutral-500 mb-2">Nama Kegiatan</label>
                            <input type="text" className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-secondary-500 outline-none" value={editSessionName} onChange={(e) => setEditSessionName(e.target.value)} required />
                         </div>
                         <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <div>
                                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2">Latitude</label>
                                <input type="number" step="any" className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-secondary-500 outline-none bg-white" value={editSessionGeo.lat} onChange={(e) => setEditSessionGeo({...editSessionGeo, lat: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2">Longitude</label>
                                <input type="number" step="any" className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-secondary-500 outline-none bg-white" value={editSessionGeo.lng} onChange={(e) => setEditSessionGeo({...editSessionGeo, lng: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2">Radius (meter)</label>
                                <input type="number" className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-secondary-500 outline-none bg-white" value={editSessionGeo.rad} onChange={(e) => setEditSessionGeo({...editSessionGeo, rad: e.target.value})} />
                            </div>
                            <div className="col-span-2 flex justify-end">
                              <button type="button" onClick={() => handleGetCurrentLocation(true)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition font-bold">
                                  <MapPin size={12} /> Gunakan Lokasi Saya
                              </button>
                            </div>
                         </div>
                         <div className="flex justify-end pt-4 border-t border-neutral-100 gap-3">
                            <button type="button" onClick={() => setEditingSession(null)} className="px-5 py-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl text-sm font-bold transition">Batal</button>
                            <button type="submit" className="px-5 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary-500/20 flex items-center gap-2 transition"><Save size={18} /> Simpan Perubahan</button>
                         </div>
                      </form>
                   </div>
                </div>
            )}
            
            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-2xl w-full bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                        <img src={previewImage} alt="Bukti Absensi" className="w-full h-auto" />
                        <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2 text-white transition" onClick={() => setPreviewImage(null)}><X size={24}/></button>
                    </div>
                </div>
            )}

            {/* Delete Session Confirmation */}
            {deleteSessionData && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full animate-scale-in shadow-2xl">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                           <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Hapus Sesi?</h3>
                        <p className="text-neutral-500 mb-8 leading-relaxed">Anda akan menghapus sesi "<strong>{deleteSessionData.name}</strong>" beserta seluruh data absensinya. Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteSessionData(null)} className="px-5 py-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold transition">Batal</button>
                            <button onClick={confirmDeleteSession} disabled={isDeletingSession} className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-600/20 transition">{isDeletingSession ? 'Menghapus...' : 'Ya, Hapus'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Member Confirmation */}
            {deleteMemberData && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full animate-scale-in shadow-2xl">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                           <UserIcon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Hapus Anggota?</h3>
                        <p className="text-neutral-500 mb-8 leading-relaxed">Menghapus "<strong>{deleteMemberData.name}</strong>" akan menghilangkan data riwayat absensi mereka juga secara permanen.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteMemberData(null)} className="px-5 py-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold transition">Batal</button>
                            <button onClick={confirmDeleteMember} disabled={isDeletingMember} className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-600/20 transition">{isDeletingMember ? 'Menghapus...' : 'Ya, Hapus'}</button>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </main>
    </div>
  );
};
