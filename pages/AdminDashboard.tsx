
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
  LayoutDashboard, CheckCircle2, Map, CreditCard, MonitorPlay, HelpCircle
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
  const [geoMapsUrl, setGeoMapsUrl] = useState<string>('');
  
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Session Edit State
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [editSessionName, setEditSessionName] = useState('');
  const [editSessionGeo, setEditSessionGeo] = useState({ lat: '', lng: '', rad: '100', mapsUrl: '' });

  // Session Delete State
  const [deleteSessionData, setDeleteSessionData] = useState<{id: number, name: string} | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  // News, Gallery, Slider, Media Form States
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '' });
  const [sliderForm, setSliderForm] = useState({ imageUrl: '', title: '', description: '' });
  const [mediaForm, setMediaForm] = useState({ type: 'youtube' as 'youtube' | 'instagram', url: '', caption: '' });

  // Profile Editor State
  const [selectedProfileSlug, setSelectedProfileSlug] = useState('sejarah');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileContent, setProfileContent] = useState('');

  // Korwil Table State (For Profile Editor)
  const [korwilRows, setKorwilRows] = useState<KorwilRow[]>([]);
  const [newKorwilRow, setNewKorwilRow] = useState<KorwilRow>({ wilayah: '', nama: '', kontak: '' });
  const [isKorwilInitialized, setIsKorwilInitialized] = useState(false);

  // Settings State
  const [configForm, setConfigForm] = useState(siteConfig);
  const [newKorwilName, setNewKorwilName] = useState('');

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);

  // ACCESS CONTROL
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isKorwil = currentUser?.role === UserRole.ADMIN_KORWIL;
  const isPengurus = currentUser?.role === UserRole.ADMIN_PENGURUS;

  // Set default tab based on role
  useEffect(() => {
    if (isKorwil && activeTab !== 'approval') setActiveTab('approval');
    if (isPengurus && activeTab === 'overview') setActiveTab('approval');
  }, [isKorwil, isPengurus]);

  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  // Editor Sync Logic
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
  }, [selectedProfileSlug, profilePages, activeTab]);

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
  
  // Helper to parse Google Maps URL
  const extractCoordsFromUrl = (url: string) => {
    // Regex for: @lat,lng
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };

    // Regex for: !3d...!4d (Standard in Long Place URLs)
    const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataMatch) return { lat: dataMatch[1], lng: dataMatch[2] };
    
    // Regex for: search/lat,lng
    const searchMatch = url.match(/search\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (searchMatch) return { lat: searchMatch[1], lng: searchMatch[2] };

    // Regex for: ?q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };

    return null;
  };

  const handleMapsLinkChange = (val: string, isEdit: boolean = false) => {
    const coords = extractCoordsFromUrl(val);
    
    if (isEdit) {
        setEditSessionGeo(prev => ({ 
            ...prev, 
            mapsUrl: val,
            lat: coords ? coords.lat : prev.lat,
            lng: coords ? coords.lng : prev.lng
        }));
    } else {
        setGeoMapsUrl(val);
        if (coords) {
            setGeoLat(coords.lat);
            setGeoLng(coords.lng);
            showToast("Koordinat berhasil diekstrak dari link!", "success");
        }
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName) {
      const lat = geoLat ? parseFloat(geoLat) : undefined;
      const lng = geoLng ? parseFloat(geoLng) : undefined;
      const rad = geoRadius ? parseFloat(geoRadius) : undefined;
      createSession(newSessionName, lat, lng, rad, geoMapsUrl);
      setNewSessionName('');
      setGeoLat(''); setGeoLng(''); setGeoRadius('100'); setGeoMapsUrl('');
    }
  };

  const handleEditSession = (session: AttendanceSession) => {
    setEditingSession(session);
    setEditSessionName(session.name);
    setEditSessionGeo({
       lat: session.latitude?.toString() || '',
       lng: session.longitude?.toString() || '',
       rad: session.radius?.toString() || '100',
       mapsUrl: session.mapsUrl || ''
    });
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
  
  // News Handlers
  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNewsId) {
        updateNews(editingNewsId, newsForm);
    } else {
        addNews({ ...newsForm, date: new Date().toISOString().split('T')[0] });
    }
    setNewsForm({ title: '', excerpt: '', content: '', imageUrl: '' });
    setEditingNewsId(null);
  };

  // Member Management Handlers
  const handleEditMember = (member: User) => {
    setEditingMember(member);
    setEditMemberForm({
        name: member.name, nik: member.nik || '', email: member.email,
        phone: member.phone || '', address: member.address || '', wilayah: member.wilayah || ''
    });
    setIsCustomWilayahEdit(!korwils.some(k => k.name === member.wilayah));
  };
  
  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
        updateMember(editingMember.id, editMemberForm);
        setEditingMember(null);
    }
  };

  // Common delete handlers
  const handleDeleteSession = (id: number, name: string) => setDeleteSessionData({ id, name });
  const confirmDeleteSession = async () => { if (deleteSessionData) { setIsDeletingSession(true); await deleteSession(deleteSessionData.id); setIsDeletingSession(false); setDeleteSessionData(null); } };
  const handleDeleteMember = (id: number, name: string) => setDeleteMemberData({ id, name });
  const confirmDeleteMember = async () => { if (deleteMemberData) { setIsDeletingMember(true); await deleteMember(deleteMemberData.id); setIsDeletingMember(false); setDeleteMemberData(null); } };
  const handleDeleteRecord = async (record: AttendanceRecord) => { if (window.confirm('Hapus data absensi ini?')) { await deleteAttendanceRecord(record.id, record.sessionId, record.userId); } };

  // EXPORT HANDLERS
  const handleExportAttendance = () => {
    try {
        const wb = XLSX.utils.book_new();
        const summaryData = attendanceSessions.map(s => ({
            'ID Sesi': s.id, 'Tanggal': s.date, 'Kegiatan': s.name, 'Total Hadir': s.attendees.length, 'Status': s.isOpen ? 'Buka' : 'Tutup'
        }));
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

  const handleExportMembers = () => {
     try {
         const data = users.filter(u => u.role === UserRole.MEMBER && u.status === MemberStatus.ACTIVE).map(u => ({
             'Nama': u.name, 'NIA': u.nia, 'NIK': u.nik, 'Wilayah': u.wilayah, 'HP': u.phone, 'Alamat': u.address
         }));
         const wb = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Anggota");
         XLSX.writeFile(wb, `Anggota_JSN.xlsx`);
         showToast("Export berhasil!", "success");
     } catch (e) { showToast("Gagal export data", "error"); }
  };

  const handleProfileSave = () => {
    if (editorRef.current) {
        updateProfilePage(selectedProfileSlug, profileTitle, editorRef.current.innerHTML);
    } else if (selectedProfileSlug === 'korwil') {
        // Logic specific for Korwil Profile (HTML generation from rows) is simplified here for brevity
        // In real implementation, construct HTML table from korwilRows
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

               {/* SUPER ADMIN COMPLETE FEATURES */}
               {isSuperAdmin && (
                 <>
                   <div className="pt-4 pb-2">
                      {sidebarOpen && <p className="px-3 text-[10px] uppercase font-bold text-primary-400 tracking-wider">Konten & Sistem</p>}
                   </div>
                   <li><button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Dashboard</span>}</button></li>
                   <li><button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'news' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><FileText size={20} className={activeTab === 'news' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Berita</span>}</button></li>
                   <li><button onClick={() => setActiveTab('gallery')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'gallery' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><ImageIcon size={20} className={activeTab === 'gallery' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Galeri</span>}</button></li>
                   <li><button onClick={() => setActiveTab('slider')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'slider' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><MonitorPlay size={20} className={activeTab === 'slider' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Slider Beranda</span>}</button></li>
                   <li><button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'media' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-primary-200'}`}><PlayCircle size={20} className={activeTab === 'media' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Video / Media</span>}</button></li>
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
               <h1 className="text-2xl font-bold text-neutral-800 font-serif capitalize">
                  {activeTab.replace(/([A-Z])/g, ' $1').trim()}
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

         <div className="flex-grow animate-fade-in-up">
            
            {/* APPROVAL TAB */}
            {activeTab === 'approval' && (
               <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                    <h3 className="font-bold text-neutral-700">Verifikasi Permohonan Anggota</h3>
                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">{filteredRegistrations.length} Pending</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-bold tracking-wider">
                           <tr><th className="px-6 py-4">Nama & NIK</th><th className="px-6 py-4">Kontak</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                           {filteredRegistrations.map(reg => (
                              <tr key={reg.id} className="hover:bg-neutral-50">
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-neutral-800">{reg.name}</div>
                                    <div className="text-xs text-neutral-500 font-mono mt-0.5">NIK: {reg.nik || '-'}</div>
                                 </td>
                                 <td className="px-6 py-4 text-sm"><div className="flex items-center gap-2">{reg.phone}</div><div className="text-neutral-400 text-xs">{reg.email}</div></td>
                                 <td className="px-6 py-4"><span className="bg-neutral-100 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600">{reg.wilayah}</span></td>
                                 <td className="px-6 py-4">
                                    {reg.status === MemberStatus.PENDING && <span className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-md">Pending Korwil</span>}
                                    {reg.status === MemberStatus.VERIFIED_KORWIL && <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-md">Approved Korwil</span>}
                                 </td>
                                 <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {(isKorwil || isSuperAdmin) && reg.status === MemberStatus.PENDING && <button onClick={() => verifyMemberByKorwil(reg.id)} className="bg-secondary-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-secondary-600">Verifikasi</button>}
                                    {(isPengurus || isSuperAdmin) && reg.status === MemberStatus.VERIFIED_KORWIL && <button onClick={() => approveMemberFinal(reg.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700">Terbit NIA</button>}
                                    <button onClick={() => rejectMember(reg.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">Tolak</button>
                                 </td>
                              </tr>
                           ))}
                           {filteredRegistrations.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Tidak ada data.</td></tr>}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* MEMBERS TAB */}
            {activeTab === 'members' && (
                <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                        <div className="relative">
                            <input type="text" placeholder="Cari anggota..." className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-500 outline-none" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                            <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
                        </div>
                        <button onClick={handleExportMembers} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-2"><FileSpreadsheet size={16}/> Export</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100">
                                <tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">NIA</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {users.filter(u => u.role === UserRole.MEMBER && u.name.toLowerCase().includes(memberSearch.toLowerCase())).map(u => (
                                    <tr key={u.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 font-bold text-neutral-800">{u.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{u.nia}</td>
                                        <td className="px-6 py-4 text-xs">{u.wilayah}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {isSuperAdmin && (
                                                <>
                                                    <button onClick={() => resetMemberPassword(u.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Reset Password"><Key size={16}/></button>
                                                    <button onClick={() => handleDeleteMember(u.id, u.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={16}/></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* NEWS TAB (Super Admin Only) */}
            {activeTab === 'news' && isSuperAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {news.map(n => (
                            <div key={n.id} className="bg-white border border-neutral-200 rounded-xl p-6 flex gap-4 hover:shadow-md transition">
                                <img src={n.imageUrl} className="w-24 h-24 object-cover rounded-lg bg-neutral-100" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{n.title}</h3>
                                    <p className="text-sm text-neutral-500 line-clamp-2">{n.excerpt}</p>
                                    <div className="mt-4 flex gap-3 text-xs">
                                        <button onClick={() => { setNewsForm({ title: n.title, excerpt: n.excerpt, content: n.content, imageUrl: n.imageUrl }); setEditingNewsId(n.id); }} className="text-amber-600 font-bold hover:underline">Edit</button>
                                        <button onClick={() => deleteNews(n.id)} className="text-red-600 font-bold hover:underline">Hapus</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 h-fit sticky top-24">
                        <h3 className="font-bold mb-4">{editingNewsId ? 'Edit Berita' : 'Tambah Berita'}</h3>
                        <form onSubmit={handleNewsSubmit} className="space-y-4">
                            <input type="text" placeholder="Judul Berita" className="w-full border rounded-lg p-2 text-sm" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                            <textarea placeholder="Ringkasan Singkat" className="w-full border rounded-lg p-2 text-sm h-20" value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})} required />
                            <textarea placeholder="Konten HTML Full" className="w-full border rounded-lg p-2 text-sm h-40 font-mono" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} required />
                            <input type="text" placeholder="URL Gambar (https://...)" className="w-full border rounded-lg p-2 text-sm" value={newsForm.imageUrl} onChange={e => setNewsForm({...newsForm, imageUrl: e.target.value})} required />
                            <button type="submit" className="w-full bg-primary-700 text-white py-2 rounded-lg font-bold hover:bg-primary-800">{editingNewsId ? 'Simpan Perubahan' : 'Publish Berita'}</button>
                            {editingNewsId && <button type="button" onClick={() => { setEditingNewsId(null); setNewsForm({title:'', excerpt:'', content:'', imageUrl:''}); }} className="w-full mt-2 bg-neutral-100 text-neutral-600 py-2 rounded-lg font-bold">Batal</button>}
                        </form>
                    </div>
                </div>
            )}

            {/* GALLERY TAB (Super Admin Only) */}
            {activeTab === 'gallery' && isSuperAdmin && (
                <div className="space-y-8">
                     <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="font-bold mb-4">Tambah Foto Galeri</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="URL Foto" className="flex-1 border rounded-lg p-2" value={galleryForm.imageUrl} onChange={e => setGalleryForm({...galleryForm, imageUrl: e.target.value})} />
                            <input type="text" placeholder="Caption" className="flex-1 border rounded-lg p-2" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} />
                            <button onClick={() => { if(galleryForm.imageUrl) { addGalleryItem({type: 'image', url: galleryForm.imageUrl, caption: galleryForm.caption}); setGalleryForm({imageUrl:'', caption:''}); } }} className="bg-secondary-600 text-white px-6 rounded-lg font-bold">Tambah</button>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {gallery.map(g => (
                            <div key={g.id} className="relative group rounded-xl overflow-hidden shadow-sm">
                                <img src={g.url} className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <button onClick={() => deleteGalleryItem(g.id)} className="bg-red-600 text-white p-2 rounded-full"><Trash2 size={20}/></button>
                                </div>
                                <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{g.caption}</p>
                            </div>
                        ))}
                     </div>
                </div>
            )}
            
            {/* SLIDER TAB (Super Admin Only) */}
            {activeTab === 'slider' && isSuperAdmin && (
                <div className="space-y-8">
                     <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="font-bold mb-4">Tambah Slider Beranda</h3>
                        <div className="grid gap-4">
                            <input type="text" placeholder="URL Gambar Besar (Landscape)" className="w-full border rounded-lg p-2" value={sliderForm.imageUrl} onChange={e => setSliderForm({...sliderForm, imageUrl: e.target.value})} />
                            <input type="text" placeholder="Judul Utama" className="w-full border rounded-lg p-2" value={sliderForm.title} onChange={e => setSliderForm({...sliderForm, title: e.target.value})} />
                            <textarea placeholder="Deskripsi Singkat" className="w-full border rounded-lg p-2" value={sliderForm.description} onChange={e => setSliderForm({...sliderForm, description: e.target.value})} />
                            <button onClick={() => { if(sliderForm.imageUrl) { addSliderItem({...sliderForm}); setSliderForm({imageUrl:'', title:'', description:''}); } }} className="bg-secondary-600 text-white py-2 rounded-lg font-bold">Simpan Slider</button>
                        </div>
                     </div>
                     <div className="space-y-4">
                        {sliders.map(s => (
                            <div key={s.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                                <img src={s.imageUrl} className="w-full h-40 object-cover" />
                                <div className="absolute top-2 right-2">
                                    <button onClick={() => deleteSliderItem(s.id)} className="bg-red-600 text-white p-2 rounded-full shadow-lg"><Trash2 size={16}/></button>
                                </div>
                                <div className="p-4 bg-white">
                                    <h4 className="font-bold">{s.title}</h4>
                                    <p className="text-sm text-neutral-500">{s.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
            
            {/* MEDIA TAB (Super Admin Only) */}
            {activeTab === 'media' && isSuperAdmin && (
                <div className="space-y-8">
                     <div className="bg-white p-6 rounded-xl border border-neutral-200">
                         <h3 className="font-bold mb-4">Tambah Video</h3>
                         <div className="grid gap-4">
                             <select className="border rounded-lg p-2" value={mediaForm.type} onChange={e => setMediaForm({...mediaForm, type: e.target.value as 'youtube' | 'instagram'})}>
                                 <option value="youtube">YouTube</option>
                                 <option value="instagram">Instagram</option>
                             </select>
                             <input type="text" placeholder="URL Video / Embed Link" className="w-full border rounded-lg p-2" value={mediaForm.url} onChange={e => setMediaForm({...mediaForm, url: e.target.value})} />
                             <input type="text" placeholder="Judul Video" className="w-full border rounded-lg p-2" value={mediaForm.caption} onChange={e => setMediaForm({...mediaForm, caption: e.target.value})} />
                             <button onClick={() => { 
                                 if(mediaForm.url) { 
                                     // Simple Embed Logic
                                     let embed = mediaForm.url;
                                     if(mediaForm.type === 'youtube' && mediaForm.url.includes('watch?v=')) embed = mediaForm.url.replace('watch?v=', 'embed/');
                                     else if(mediaForm.type === 'instagram' && !mediaForm.url.includes('/embed')) embed = mediaForm.url + '/embed';
                                     
                                     addMediaPost({ type: mediaForm.type, url: mediaForm.url, embedUrl: embed, caption: mediaForm.caption }); 
                                     setMediaForm({type: 'youtube', url:'', caption:''}); 
                                 } 
                             }} className="bg-secondary-600 text-white py-2 rounded-lg font-bold">Simpan Video</button>
                         </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {mediaPosts.map(m => (
                             <div key={m.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex justify-between items-start">
                                 <div>
                                     <span className="text-xs font-bold uppercase text-neutral-400">{m.type}</span>
                                     <h4 className="font-bold truncate w-48">{m.caption}</h4>
                                     <a href={m.url} target="_blank" className="text-blue-600 text-xs hover:underline">Lihat Asli</a>
                                 </div>
                                 <button onClick={() => deleteMediaPost(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                             </div>
                         ))}
                     </div>
                </div>
            )}

            {/* RECAP TAB */}
            {activeTab === 'recap' && (
                <div className="space-y-6">
                    <div className="flex gap-4 mb-6">
                        <button onClick={() => setRecapType('attendance')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${recapType === 'attendance' ? 'bg-primary-900 text-white shadow-lg' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'}`}><Calendar size={18} /> Absensi</button>
                        <button onClick={() => setRecapType('members')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${recapType === 'members' ? 'bg-primary-900 text-white shadow-lg' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'}`}><Users size={18} /> Statistik</button>
                    </div>
                    {recapType === 'attendance' ? (
                        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                             <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                                <h3 className="font-bold text-neutral-800">Rekapitulasi Kehadiran</h3>
                                <button onClick={handleExportAttendance} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-2"><FileSpreadsheet size={16} /> Export Excel</button>
                             </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100"><tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Nama Kegiatan</th><th className="px-6 py-4 text-center">Total Hadir</th><th className="px-6 py-4 text-center">Status</th></tr></thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {attendanceSessions.map(session => (
                                            <tr key={session.id} className="hover:bg-neutral-50">
                                                <td className="px-6 py-4 font-mono text-xs">{session.date}</td><td className="px-6 py-4 font-bold">{session.name}</td>
                                                <td className="px-6 py-4 text-center"><span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">{session.attendees.length}</span></td>
                                                <td className="px-6 py-4 text-center">{session.isOpen ? <span className="text-emerald-600 text-xs font-bold">Buka</span> : <span className="text-red-500 text-xs font-bold">Tutup</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 flex justify-between"><div><p className="text-xs font-bold uppercase">Total Anggota</p><h3 className="text-3xl font-bold mt-1">{users.filter(u=>u.status==='active').length}</h3></div><UserCheck size={24} className="text-primary-600"/></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* SETTINGS TAB */}
            {activeTab === 'settings' && isSuperAdmin && (
               <div className="max-w-4xl space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                      <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2"><Settings size={20}/> Konfigurasi Website</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Nama Aplikasi</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.appName} onChange={e => setConfigForm({...configForm, appName: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Nama Organisasi</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.orgName} onChange={e => setConfigForm({...configForm, orgName: e.target.value})} /></div>
                          <div className="col-span-2"><label className="text-xs font-bold text-neutral-500 mb-1 block">Deskripsi</label><textarea className="w-full border rounded-lg p-3" value={configForm.description} onChange={e => setConfigForm({...configForm, description: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Alamat</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.address} onChange={e => setConfigForm({...configForm, address: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Email</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.email} onChange={e => setConfigForm({...configForm, email: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Telepon</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.phone} onChange={e => setConfigForm({...configForm, phone: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Logo URL</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.logoUrl} onChange={e => setConfigForm({...configForm, logoUrl: e.target.value})} /></div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-neutral-100 text-right">
                          <button onClick={() => updateSiteConfig(configForm)} className="bg-primary-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-800 transition">Simpan Konfigurasi</button>
                      </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                      <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2"><Map size={20}/> Manajemen Korwil</h3>
                      <div className="flex gap-4 mb-6">
                          <input type="text" placeholder="Nama Wilayah Baru" className="flex-1 border rounded-lg p-3" value={newKorwilName} onChange={e => setNewKorwilName(e.target.value)} />
                          <button onClick={() => { if(newKorwilName) { addKorwil(newKorwilName); setNewKorwilName(''); } }} className="bg-secondary-600 text-white px-6 rounded-lg font-bold">Tambah</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {korwils.map(k => (
                              <div key={k.id} className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 flex justify-between items-center">
                                  <span className="font-medium">{k.name}</span>
                                  <button onClick={() => deleteKorwil(k.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button>
                              </div>
                          ))}
                      </div>
                  </div>
               </div>
            )}
            
            {/* PROFILE EDITOR TAB */}
            {activeTab === 'profile' && isSuperAdmin && (
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="mb-6 flex gap-4 border-b border-neutral-100 pb-4">
                        <select className="border rounded-lg p-2" value={selectedProfileSlug} onChange={e => setSelectedProfileSlug(e.target.value)}>
                            <option value="sejarah">Sejarah</option>
                            <option value="pengurus">Pengurus</option>
                            <option value="korwil">Daftar Korwil</option>
                            <option value="amaliyah">Amaliyah</option>
                            <option value="tentang-kami">Tentang Kami (Beranda)</option>
                        </select>
                        <input type="text" className="flex-1 border rounded-lg p-2 font-bold" value={profileTitle} onChange={e => setProfileTitle(e.target.value)} placeholder="Judul Halaman" />
                        <button onClick={handleProfileSave} className="bg-primary-700 text-white px-6 rounded-lg font-bold">Simpan</button>
                    </div>
                    {/* Simple Content Editable Div acting as WYSIWYG */}
                    <div 
                        ref={editorRef}
                        contentEditable 
                        className="w-full min-h-[500px] border border-neutral-200 rounded-xl p-6 focus:outline-none focus:ring-2 focus:ring-primary-200 prose prose-lg max-w-none"
                        onInput={e => setProfileContent(e.currentTarget.innerHTML)}
                    />
                    <p className="mt-2 text-xs text-neutral-400">* Anda bisa paste teks dan gambar langsung ke area editor di atas.</p>
                </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && !viewingSession && (
               <div className="space-y-8">
                  <div id="session-form" className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden p-6 md:p-8">
                      <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2"><MapPin size={20} className="text-secondary-500"/> Buat Sesi & Geofencing</h3>
                      <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-12 lg:col-span-5">
                                <div className="mb-4">
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-2">Nama Kegiatan</label>
                                    <input type="text" placeholder="Contoh: Rutinan Malam Jumat" className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 outline-none" value={newSessionName} onChange={e => setNewSessionName(e.target.value)} required />
                                </div>
                                
                                {/* GOOGLE MAPS LINK INPUT */}
                                <div className="mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <div className="flex items-start gap-2 mb-2">
                                        <label className="block text-xs uppercase font-bold text-blue-700 mt-0.5">Link Google Maps (Auto-Detect)</label>
                                        <div className="group relative">
                                            <HelpCircle size={14} className="text-blue-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 w-64 bg-neutral-800 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                                                Paste link dari address bar browser (contoh: google.com/maps/@-7.25...) untuk otomatis mengisi Latitude & Longitude.
                                            </div>
                                        </div>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Paste link maps di sini..." 
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none" 
                                        value={geoMapsUrl} 
                                        onChange={e => handleMapsLinkChange(e.target.value)} 
                                    />
                                    <p className="text-[10px] text-blue-500 mt-1.5 leading-snug">
                                        * Gunakan link lengkap dari browser, bukan link pendek "Share".<br/>
                                        * Sistem akan otomatis mengekstrak koordinat jika format link valid.
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <div><label className="block text-xs uppercase font-bold text-neutral-400 mb-2">Latitude</label><input type="number" step="any" className="w-full px-3 py-2 border rounded-lg bg-white" value={geoLat} onChange={e => setGeoLat(e.target.value)} placeholder="-7.xxxxx" /></div>
                                <div><label className="block text-xs uppercase font-bold text-neutral-400 mb-2">Longitude</label><input type="number" step="any" className="w-full px-3 py-2 border rounded-lg bg-white" value={geoLng} onChange={e => setGeoLng(e.target.value)} placeholder="112.xxxxx" /></div>
                                <div><label className="block text-xs uppercase font-bold text-neutral-400 mb-2">Radius (m)</label><input type="number" className="w-full px-3 py-2 border rounded-lg bg-white" value={geoRadius} onChange={e => setGeoRadius(e.target.value)} /></div>
                                <div className="sm:col-span-3 mt-2 flex justify-end"><button type="button" onClick={() => handleGetCurrentLocation(false)} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-100 transition"><MapPin size={12} /> Ambil Lokasi Saya (GPS)</button></div>
                            </div>
                            <div className="md:col-span-12 flex justify-end"><button type="submit" className="px-8 py-3 bg-primary-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-primary-800 transition"><Plus size={18} /> Buat Sesi Baru</button></div>
                        </form>
                  </div>
                  <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-neutral-100"><h3 className="font-bold text-neutral-700">Daftar Sesi Absensi</h3></div>
                      <div className="overflow-x-auto">
                            <table className="w-full text-left">
                            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-bold"><tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Kegiatan</th><th className="px-6 py-4">Lokasi</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Hadir</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
                            <tbody className="divide-y divide-neutral-100">
                                {attendanceSessions.map(session => (
                                    <tr key={session.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 text-xs font-mono">{session.date}</td><td className="px-6 py-4 font-bold">{session.name}</td>
                                        <td className="px-6 py-4">
                                            {session.latitude ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-amber-700 text-xs font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100 w-fit">Radius {session.radius}m</span>
                                                    {session.mapsUrl && (
                                                        <a href={session.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-[10px] flex items-center gap-1">
                                                            <ExternalLink size={10} /> Lihat Peta
                                                        </a>
                                                    )}
                                                </div>
                                            ) : <span className="text-neutral-400 text-xs">Bebas</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center"><button onClick={() => toggleSession(session.id)} className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${session.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{session.isOpen ? 'DIBUKA' : 'DITUTUP'}</button></td>
                                        <td className="px-6 py-4 text-center font-bold text-primary-600">{session.attendees.length}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => setViewingSession(session)} className="bg-primary-50 text-primary-700 p-2 rounded-lg"><ListIcon size={16} /></button>
                                            <button onClick={() => handleEditSession(session)} className="bg-amber-50 text-amber-600 p-2 rounded-lg"><Edit3 size={16} /></button>
                                            <button onClick={() => handleDeleteSession(session.id, session.name)} className="bg-red-50 text-red-600 p-2 rounded-lg"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                      </div>
                  </div>
               </div>
            )}

            {activeTab === 'attendance' && viewingSession && (
               <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden animate-fade-in-up">
                  <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                      <div className="flex items-center gap-4"><button onClick={() => setViewingSession(null)} className="p-2 hover:bg-white rounded-full"><ArrowLeft size={20} /></button><div><h3 className="font-bold text-lg">{viewingSession.name}</h3><p className="text-xs text-neutral-500">{viewingSession.date}</p></div></div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Waktu</th><th className="px-6 py-4">Lokasi</th><th className="px-6 py-4 text-right">Bukti</th></tr></thead>
                          <tbody className="divide-y divide-neutral-50">
                              {attendanceRecords.filter(r => r.sessionId === viewingSession.id).map(r => (
                                  <tr key={r.id} className="hover:bg-neutral-50">
                                      <td className="px-6 py-4 font-bold">{r.userName}</td><td className="px-6 py-4 font-mono text-xs">{r.timestamp}</td><td className="px-6 py-4 text-xs">{r.location}</td>
                                      <td className="px-6 py-4 text-right"><button onClick={() => setPreviewImage(r.photoUrl)} className="text-primary-600 text-xs font-bold flex items-center gap-1 justify-end"><ImageIcon size={14}/> Lihat Foto</button></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
               </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Total Anggota</p><h3 className="text-3xl font-bold mt-2">{users.filter(u => u.status === 'active').length}</h3></div>
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Total Kegiatan</p><h3 className="text-3xl font-bold mt-2">{attendanceSessions.length}</h3></div>
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Menunggu Verifikasi</p><h3 className="text-3xl font-bold mt-2">{registrations.length}</h3></div>
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Berita Terbit</p><h3 className="text-3xl font-bold mt-2">{news.length}</h3></div>
               </div>
            )}

            {/* BACKUP TAB */}
            {activeTab === 'backup' && isSuperAdmin && (
               <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm text-center">
                   <Database size={48} className="mx-auto text-neutral-300 mb-4" />
                   <h3 className="font-bold text-xl mb-2">Backup & Restore Database</h3>
                   <p className="text-neutral-500 mb-6">Unduh seluruh data sistem dalam format JSON untuk cadangan.</p>
                   <button onClick={() => showToast('Fitur Backup dalam pengembangan. Gunakan Export Excel di menu Rekap.', 'info')} className="bg-primary-900 text-white px-8 py-3 rounded-xl font-bold">Download Backup</button>
               </div>
            )}

            {/* MODALS */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <img src={previewImage} className="max-w-full max-h-[90vh] rounded-lg" />
                    <button className="absolute top-4 right-4 text-white"><X size={32}/></button>
                </div>
            )}

            {/* Delete/Edit Session Modals ... (Included logic above covers triggers) */}
            {deleteSessionData && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-2">Hapus Sesi?</h3>
                        <p className="text-neutral-500 mb-6">Tindakan ini akan menghapus sesi "{deleteSessionData.name}" dan seluruh data absensi di dalamnya.</p>
                        <div className="flex justify-end gap-3"><button onClick={() => setDeleteSessionData(null)} className="px-4 py-2 rounded-lg bg-neutral-100 font-bold">Batal</button><button onClick={confirmDeleteSession} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">{isDeletingSession ? 'Menghapus...' : 'Ya, Hapus'}</button></div>
                    </div>
                </div>
            )}
            
            {editingSession && (
                <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                      <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50"><h3 className="font-bold text-lg">Edit Sesi</h3><button onClick={() => setEditingSession(null)}><X size={20}/></button></div>
                      <form onSubmit={handleUpdateSessionSubmit} className="p-6 space-y-4">
                         <input type="text" className="w-full border rounded-lg p-3" value={editSessionName} onChange={e => setEditSessionName(e.target.value)} required />
                         
                         {/* Edit Google Maps Input */}
                         <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                             <label className="block text-xs uppercase font-bold text-blue-700 mb-1">Link Google Maps</label>
                             <input 
                                type="text" 
                                placeholder="Paste link untuk auto-update koordinat" 
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white outline-none" 
                                value={editSessionGeo.mapsUrl} 
                                onChange={e => handleMapsLinkChange(e.target.value, true)} 
                             />
                         </div>

                         <div className="grid grid-cols-3 gap-2"><input type="number" placeholder="Lat" className="border rounded-lg p-2" value={editSessionGeo.lat} onChange={e=>setEditSessionGeo({...editSessionGeo, lat:e.target.value})}/><input type="number" placeholder="Lng" className="border rounded-lg p-2" value={editSessionGeo.lng} onChange={e=>setEditSessionGeo({...editSessionGeo, lng:e.target.value})}/><input type="number" placeholder="Rad" className="border rounded-lg p-2" value={editSessionGeo.rad} onChange={e=>setEditSessionGeo({...editSessionGeo, rad:e.target.value})}/></div>
                         <div className="flex justify-between items-center">
                             <button type="button" onClick={() => handleGetCurrentLocation(true)} className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded"><MapPin size={12}/> Ambil Lokasi Saya</button>
                             <button type="submit" className="bg-secondary-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary-600">Simpan</button>
                         </div>
                      </form>
                   </div>
                </div>
            )}

         </div>
      </main>
    </div>
  );
};