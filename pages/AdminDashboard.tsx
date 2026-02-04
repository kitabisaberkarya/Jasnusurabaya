
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
  LayoutDashboard, CheckCircle2, Map, CreditCard, MonitorPlay, HelpCircle, ShieldAlert, ShieldCheck, HardDrive, Cloud, FileJson, Server
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
    korwils, addKorwil, deleteKorwil,
    createAdminUser, changePassword
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'members' | 'attendance' | 'news' | 'gallery' | 'slider' | 'media' | 'recap' | 'settings' | 'backup' | 'profile' | 'admin-management'>('overview');
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
  const [editMemberForm, setEditMemberForm] = useState({ name: '', nik: '', email: '', phone: '', address: '', wilayah: '', role: '' });
  const [isCustomWilayahEdit, setIsCustomWilayahEdit] = useState(false);

  // Admin Management State
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', role: 'korwil', wilayah: '', password: '' });

  // Member Delete & Reset Password State
  const [deleteMemberData, setDeleteMemberData] = useState<{id: number, name: string} | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ current: '', new: '', confirm: '' });

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

  // Filter Registrations Based on Role & Wilayah
  const getPendingRegistrations = () => {
     if (isKorwil) {
        // Korwil hanya melihat PENDING di wilayahnya
        return registrations.filter(r => r.status === MemberStatus.PENDING && r.wilayah === currentUser?.wilayah);
     } else if (isPengurus) {
        // Pengurus melihat VERIFIED_KORWIL dari semua wilayah
        return registrations.filter(r => r.status === MemberStatus.VERIFIED_KORWIL);
     } else {
        // Super Admin melihat semua
        return registrations.filter(r => r.status === MemberStatus.PENDING || r.status === MemberStatus.VERIFIED_KORWIL);
     }
  };

  const filteredRegistrations = getPendingRegistrations();
  
  // Filter Members Based on Role
  const filteredUsers = users.filter(u => {
      // Logic: Super Admin lihat semua, Korwil lihat wilayahnya saja, Pengurus lihat semua anggota
      if (isKorwil) return u.wilayah === currentUser?.wilayah && u.role === UserRole.MEMBER;
      return true; // Pengurus & Admin can see all
  }).filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()));

  // --- HANDLERS ---
  const handleCreateAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      if (newAdminForm.password.length < 6) {
          showToast("Password minimal 6 karakter", "error");
          return;
      }
      createAdminUser(newAdminForm.name, newAdminForm.email, newAdminForm.role as UserRole, newAdminForm.wilayah, newAdminForm.password);
      setNewAdminForm({ name: '', email: '', role: 'korwil', wilayah: '', password: '' });
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (changePasswordForm.new !== changePasswordForm.confirm) {
          showToast("Konfirmasi password tidak cocok", "error");
          return;
      }
      if (changePasswordForm.new.length < 6) {
          showToast("Password minimal 6 karakter", "error");
          return;
      }
      if (!currentUser) return;
      
      const success = await changePassword(currentUser.id, changePasswordForm.new);
      if (success) setChangePasswordForm({ current: '', new: '', confirm: '' });
  };

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

  const handleEditMember = (member: User) => {
    setEditingMember(member);
    setEditMemberForm({
        name: member.name, 
        nik: member.nik || '', 
        email: member.email,
        phone: member.phone || '', 
        address: member.address || '', 
        wilayah: member.wilayah || '',
        role: member.role || 'member'
    });
    setIsCustomWilayahEdit(!korwils.some(k => k.name === member.wilayah));
  };
  
  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
        const updateData: any = { ...editMemberForm };
        if (updateData.role === 'pengurus' && !updateData.wilayah) {
            updateData.wilayah = 'Pusat';
        }
        updateMember(editingMember.id, updateData);
        setEditingMember(null);
    }
  };

  const handleDeleteSession = (id: number, name: string) => setDeleteSessionData({ id, name });
  const confirmDeleteSession = async () => { if (deleteSessionData) { setIsDeletingSession(true); await deleteSession(deleteSessionData.id); setIsDeletingSession(false); setDeleteSessionData(null); } };
  const handleDeleteMember = (id: number, name: string) => setDeleteMemberData({ id, name });
  const confirmDeleteMember = async () => { if (deleteMemberData) { setIsDeletingMember(true); await deleteMember(deleteMemberData.id); setIsDeletingMember(false); setDeleteMemberData(null); } };

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
         const data = filteredUsers.map(u => ({
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
      <aside className={`fixed top-[64px] bottom-0 left-0 bg-primary-900 text-white transition-all duration-300 z-40 overflow-y-auto border-r border-primary-800 ${sidebarOpen ? 'w-[260px]' : 'w-[70px]'}`}>
         <div className="py-4 px-3">
            <ul className="space-y-1">
               {/* APPROVAL MENU (All Roles) */}
               {(isSuperAdmin || isKorwil || isPengurus) && (
                 <li>
                    <button onClick={() => setActiveTab('approval')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'approval' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}>
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
               
               {/* CORE MENU */}
               {(isSuperAdmin || isPengurus || isKorwil) && (
                   <li>
                      <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'members' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}>
                         <Users size={20} className={activeTab === 'members' ? 'text-secondary-500' : ''} />
                         {sidebarOpen && <span className="flex-1 text-left font-medium">Data Anggota</span>}
                      </button>
                   </li>
               )}
               
               {(isSuperAdmin || isPengurus) && (
                 <>
                   <li>
                      <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}>
                         <Calendar size={20} className={activeTab === 'attendance' ? 'text-secondary-500' : ''} />
                         {sidebarOpen && <span className="flex-1 text-left font-medium">Absensi & Geo</span>}
                      </button>
                   </li>
                   <li>
                      <button onClick={() => setActiveTab('recap')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'recap' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}>
                         <FileSpreadsheet size={20} className={activeTab === 'recap' ? 'text-secondary-500' : ''} />
                         {sidebarOpen && <span className="flex-1 text-left font-medium">Rekap Data</span>}
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
                   <li><button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Dashboard</span>}</button></li>
                   <li><button onClick={() => setActiveTab('admin-management')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'admin-management' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><ShieldCheck size={20} className={activeTab === 'admin-management' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Manajemen Admin</span>}</button></li>
                   <li><button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'news' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><FileText size={20} className={activeTab === 'news' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Berita</span>}</button></li>
                   <li><button onClick={() => setActiveTab('gallery')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'gallery' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><ImageIcon size={20} className={activeTab === 'gallery' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Galeri</span>}</button></li>
                   <li><button onClick={() => setActiveTab('slider')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'slider' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><MonitorPlay size={20} className={activeTab === 'slider' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Slider Beranda</span>}</button></li>
                   <li><button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'media' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><PlayCircle size={20} className={activeTab === 'media' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Video / Media</span>}</button></li>
                   <li><button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><UserIcon size={20} className={activeTab === 'profile' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Profil & Hal</span>}</button></li>
                   <li><button onClick={() => setActiveTab('backup')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'backup' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><HardDrive size={20} className={activeTab === 'backup' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Backup</span>}</button></li>
                 </>
               )}
               
               <div className="pt-4 pb-2">
                   {sidebarOpen && <p className="px-3 text-[10px] uppercase font-bold text-primary-400 tracking-wider">Akun Saya</p>}
               </div>
               <li><button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><Settings size={20} className={activeTab === 'settings' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Ganti Password</span>}</button></li>

            </ul>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`pt-[80px] pb-10 transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-[260px]' : 'ml-[70px]'} px-8`}>
         
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-2xl font-bold text-neutral-800 font-serif capitalize">
                  {activeTab.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
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
                    <div>
                        <h3 className="font-bold text-neutral-700">Verifikasi Permohonan Anggota</h3>
                        {isKorwil && <p className="text-xs text-neutral-500">Menampilkan data wilayah: <strong>{currentUser?.wilayah}</strong></p>}
                    </div>
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
                           {filteredRegistrations.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Tidak ada data permohonan.</td></tr>}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* ADMIN MANAGEMENT TAB (SUPER ADMIN ONLY) */}
            {activeTab === 'admin-management' && isSuperAdmin && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <h3 className="font-bold text-neutral-800 mb-4">Buat Akun Pengurus / Korwil</h3>
                        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-neutral-500">Nama Lengkap</label><input type="text" className="w-full border rounded-lg p-2" value={newAdminForm.name} onChange={e => setNewAdminForm({...newAdminForm, name: e.target.value})} required /></div>
                            <div><label className="text-xs font-bold text-neutral-500">Email Login</label><input type="email" className="w-full border rounded-lg p-2" value={newAdminForm.email} onChange={e => setNewAdminForm({...newAdminForm, email: e.target.value})} required /></div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500">Role</label>
                                <select className="w-full border rounded-lg p-2" value={newAdminForm.role} onChange={e => setNewAdminForm({...newAdminForm, role: e.target.value})}>
                                    <option value="korwil">Admin Korwil</option>
                                    <option value="pengurus">Pengurus Pusat</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500">Wilayah</label>
                                {newAdminForm.role === 'pengurus' ? (
                                     <input type="text" className="w-full border rounded-lg p-2 bg-neutral-100" value="Surabaya Pusat" disabled />
                                ) : (
                                    <select className="w-full border rounded-lg p-2" value={newAdminForm.wilayah} onChange={e => setNewAdminForm({...newAdminForm, wilayah: e.target.value})} required>
                                        <option value="">Pilih Wilayah</option>
                                        {korwils.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div><label className="text-xs font-bold text-neutral-500">Password</label><input type="password" className="w-full border rounded-lg p-2" value={newAdminForm.password} onChange={e => setNewAdminForm({...newAdminForm, password: e.target.value})} required /></div>
                            <div className="md:col-span-2 text-right">
                                <button type="submit" className="bg-primary-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-800">Buat Akun Admin</button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100"><h3 className="font-bold">Daftar Akun Admin & Pengurus</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">NIA Admin</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {users.filter(u => u.role !== UserRole.MEMBER).map(u => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 font-bold">{u.name}<br/><span className="text-xs font-normal text-neutral-500">{u.email}</span></td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-neutral-100 rounded text-xs uppercase font-bold">{u.role}</span></td>
                                            <td className="px-6 py-4 text-sm">{u.wilayah}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{u.nia}</td>
                                            <td className="px-6 py-4 text-right">
                                                {u.role !== UserRole.SUPER_ADMIN && (
                                                    <button onClick={() => handleDeleteMember(u.id, u.name)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MEMBERS TAB */}
            {activeTab === 'members' && (
                <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input type="text" placeholder="Cari anggota..." className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-500 outline-none" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                                <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
                            </div>
                            {isKorwil && <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-100">Wilayah: {currentUser?.wilayah}</span>}
                        </div>
                        <button onClick={handleExportMembers} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-2"><FileSpreadsheet size={16}/> Export</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100">
                                <tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 font-bold text-neutral-800">
                                            {u.name}
                                            <div className="text-xs text-neutral-400 font-mono font-normal">{u.nia}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                u.role === 'admin' ? 'bg-neutral-800 text-white' : 
                                                u.role === 'korwil' ? 'bg-blue-100 text-blue-700' :
                                                u.role === 'pengurus' ? 'bg-secondary-100 text-secondary-700' :
                                                'bg-neutral-100 text-neutral-600'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">{u.wilayah}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEditMember(u)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Edit3 size={16}/></button>
                                            <button onClick={() => resetMemberPassword(u.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Reset Password"><Key size={16}/></button>
                                            <button onClick={() => handleDeleteMember(u.id, u.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
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
                                    {attendanceSessions.map(session => (
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
                                    ))}
                                    {attendanceSessions.length === 0 && (
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
                </div>
            )}

            {/* RECAP TAB */}
            {activeTab === 'recap' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-neutral-800">Export Data Anggota</h3>
                                <p className="text-sm text-neutral-500 mt-1">Unduh seluruh database anggota aktif format Excel.</p>
                            </div>
                            <button onClick={handleExportMembers} className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl shadow-lg shadow-emerald-600/20 transition"><Download size={24}/></button>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-neutral-800">Export Rekap Absensi</h3>
                                <p className="text-sm text-neutral-500 mt-1">Unduh ringkasan dan detail kehadiran per sesi.</p>
                            </div>
                            <button onClick={handleExportAttendance} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg shadow-blue-600/20 transition"><FileSpreadsheet size={24}/></button>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-neutral-100 bg-neutral-50">
                            <h3 className="font-bold text-neutral-800">Ringkasan Statistik Kehadiran</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100">
                                    <tr><th className="px-6 py-4">Nama Sesi</th><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4 text-center">Jumlah Hadir</th><th className="px-6 py-4 text-center">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {attendanceSessions.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-6 py-4 font-bold text-neutral-800">{s.name}</td>
                                            <td className="px-6 py-4 text-sm text-neutral-600">{s.date}</td>
                                            <td className="px-6 py-4 text-center font-mono font-bold text-emerald-600">{s.attendees.length}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${s.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                                    {s.isOpen ? 'Buka' : 'Tutup'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SETTINGS / CHANGE PASSWORD */}
            {activeTab === 'settings' && (
               <div className="max-w-4xl space-y-8">
                  {/* Password Change Section */}
                  <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                      <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2"><Lock size={20}/> Ganti Password</h3>
                      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                          <div>
                              <label className="block text-xs font-bold text-neutral-500 mb-1">Password Baru</label>
                              <input type="password" className="w-full border rounded-lg p-3" value={changePasswordForm.new} onChange={e => setChangePasswordForm({...changePasswordForm, new: e.target.value})} required placeholder="Minimal 6 karakter" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-neutral-500 mb-1">Konfirmasi Password Baru</label>
                              <input type="password" className="w-full border rounded-lg p-3" value={changePasswordForm.confirm} onChange={e => setChangePasswordForm({...changePasswordForm, confirm: e.target.value})} required />
                          </div>
                          <button type="submit" className="bg-primary-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-800">Simpan Password Baru</button>
                      </form>
                  </div>

                  {/* Super Admin Config */}
                  {isSuperAdmin && (
                    <>
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
                    </>
                  )}
               </div>
            )}
            
            {/* NEWS TAB */}
            {activeTab === 'news' && isSuperAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {news.map(n => (
                            <div key={n.id} className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col sm:flex-row gap-4 hover:shadow-md transition relative">
                                <img src={n.imageUrl} className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg bg-neutral-100" />
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
            
            {/* GALLERY TAB */}
            {activeTab === 'gallery' && isSuperAdmin && (
               <div className="space-y-6">
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-6">
                       <h3 className="font-bold text-neutral-800 mb-4">Tambah Foto Galeri</h3>
                       <div className="flex flex-col md:flex-row gap-4">
                           <input type="text" placeholder="URL Gambar" className="flex-1 border rounded-lg p-2" value={galleryForm.imageUrl} onChange={e => setGalleryForm({...galleryForm, imageUrl: e.target.value})} />
                           <input type="text" placeholder="Caption" className="flex-1 border rounded-lg p-2" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} />
                           <button onClick={() => { if(galleryForm.imageUrl) { addGalleryItem({ type: 'image', url: galleryForm.imageUrl, caption: galleryForm.caption }); setGalleryForm({imageUrl:'', caption:''}); } }} className="bg-primary-700 text-white px-6 py-2 rounded-lg font-bold">Tambah</button>
                       </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {gallery.map(item => (
                           <div key={item.id} className="relative group rounded-xl overflow-hidden border border-neutral-200">
                               <img src={item.url} alt={item.caption} className="w-full h-40 object-cover" />
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                   <button onClick={() => deleteGalleryItem(item.id)} className="bg-red-600 text-white p-2 rounded-full"><Trash2 size={16}/></button>
                               </div>
                               <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-xs font-bold truncate">{item.caption || 'Tanpa Caption'}</div>
                           </div>
                       ))}
                   </div>
               </div>
            )}
            
            {/* SLIDER TAB */}
            {activeTab === 'slider' && isSuperAdmin && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                       <h3 className="font-bold text-neutral-800 mb-4">Tambah Slider Beranda</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                           <input type="text" placeholder="URL Gambar Full HD" className="border rounded-lg p-2" value={sliderForm.imageUrl} onChange={e => setSliderForm({...sliderForm, imageUrl: e.target.value})} />
                           <input type="text" placeholder="Judul Besar" className="border rounded-lg p-2" value={sliderForm.title} onChange={e => setSliderForm({...sliderForm, title: e.target.value})} />
                           <input type="text" placeholder="Deskripsi Singkat" className="border rounded-lg p-2" value={sliderForm.description} onChange={e => setSliderForm({...sliderForm, description: e.target.value})} />
                       </div>
                       <button onClick={() => { if(sliderForm.imageUrl) { addSliderItem(sliderForm); setSliderForm({imageUrl:'', title:'', description:''}); } }} className="bg-primary-700 text-white px-6 py-2 rounded-lg font-bold w-full md:w-auto">Tambah Slide</button>
                    </div>
                    <div className="space-y-4">
                        {sliders.map(s => (
                            <div key={s.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex gap-4 items-center">
                                <img src={s.imageUrl} className="w-32 h-20 object-cover rounded-lg bg-neutral-100" />
                                <div className="flex-1">
                                    <h4 className="font-bold">{s.title}</h4>
                                    <p className="text-sm text-neutral-500">{s.description}</p>
                                </div>
                                <button onClick={() => deleteSliderItem(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={20}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* MEDIA TAB */}
            {activeTab === 'media' && isSuperAdmin && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <h3 className="font-bold text-neutral-800 mb-4">Tambah Video / Media</h3>
                        <div className="flex gap-4 mb-4">
                           <select className="border rounded-lg p-2" value={mediaForm.type} onChange={(e: any) => setMediaForm({...mediaForm, type: e.target.value})}>
                               <option value="youtube">YouTube</option>
                               <option value="instagram">Instagram</option>
                           </select>
                           <input type="text" placeholder="URL Video / Post" className="flex-1 border rounded-lg p-2" value={mediaForm.url} onChange={e => {
                               let embed = e.target.value;
                               if(mediaForm.type === 'youtube' && e.target.value.includes('watch?v=')) {
                                   embed = e.target.value.replace('watch?v=', 'embed/');
                               } else if (mediaForm.type === 'instagram' && !e.target.value.includes('/embed')) {
                                   embed = e.target.value.replace(/\/$/, '') + '/embed';
                               }
                               setMediaForm({...mediaForm, url: e.target.value, embedUrl: embed}); // Store embed logic here or in submit
                           }} />
                        </div>
                        <input type="text" placeholder="Judul / Caption" className="w-full border rounded-lg p-2 mb-4" value={mediaForm.caption} onChange={e => setMediaForm({...mediaForm, caption: e.target.value})} />
                        <button onClick={() => { if(mediaForm.url) { 
                            let embed = mediaForm.url;
                            if(mediaForm.type === 'youtube' && mediaForm.url.includes('watch?v=')) {
                                embed = mediaForm.url.replace('watch?v=', 'embed/');
                            } else if (mediaForm.type === 'instagram') {
                                embed = mediaForm.url.split('?')[0].replace(/\/$/, '') + '/embed';
                            }
                            addMediaPost({ type: mediaForm.type, url: mediaForm.url, embedUrl: embed, caption: mediaForm.caption }); 
                            setMediaForm({type:'youtube', url:'', caption:''}); 
                        } }} className="bg-primary-700 text-white px-6 py-2 rounded-lg font-bold">Simpan Media</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mediaPosts.map(m => (
                            <div key={m.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                <div className="aspect-video bg-black relative">
                                    <iframe src={m.embedUrl} className="w-full h-full" allowFullScreen></iframe>
                                </div>
                                <div className="p-4 flex justify-between items-start">
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${m.type === 'youtube' ? 'bg-red-100 text-red-600' : 'bg-pink-100 text-pink-600'}`}>{m.type}</span>
                                        <p className="font-bold text-sm mt-2 line-clamp-1">{m.caption}</p>
                                    </div>
                                    <button onClick={() => deleteMediaPost(m.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && isSuperAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-2">
                        {['sejarah', 'pengurus', 'korwil', 'amaliyah', 'tentang-kami'].map(slug => (
                            <button 
                                key={slug}
                                onClick={() => setSelectedProfileSlug(slug)}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold capitalize transition ${selectedProfileSlug === slug ? 'bg-primary-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}
                            >
                                {slug.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Edit Halaman: {selectedProfileSlug.toUpperCase()}</h3>
                            <button onClick={handleProfileSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2"><Save size={16}/> Simpan</button>
                        </div>
                        <input type="text" placeholder="Judul Halaman" className="w-full border rounded-lg p-3 mb-4 font-bold text-lg" value={profileTitle} onChange={e => setProfileTitle(e.target.value)} />
                        
                        {selectedProfileSlug === 'korwil' ? (
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center">
                                <p className="text-neutral-500">Halaman ini otomatis digenerate dari database Korwil.</p>
                                <p className="text-xs text-neutral-400 mt-2">Gunakan menu "Settings &gt; Manajemen Korwil" untuk mengubah data.</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-neutral-100 p-2 border-b flex gap-2">
                                    <button className="p-1 hover:bg-white rounded"><Bold size={16}/></button>
                                    <button className="p-1 hover:bg-white rounded"><Italic size={16}/></button>
                                    <button className="p-1 hover:bg-white rounded"><List size={16}/></button>
                                </div>
                                <div 
                                    ref={editorRef}
                                    className="p-4 min-h-[300px] outline-none prose max-w-none"
                                    contentEditable
                                    suppressContentEditableWarning={true}
                                >
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-neutral-400 mt-2">* Gunakan format HTML sederhana. Paste dari Word mungkin perlu perapian.</p>
                    </div>
                </div>
            )}
            
            {/* BACKUP TAB - REDESIGNED ENTERPRISE LOOK */}
            {activeTab === 'backup' && isSuperAdmin && (
                <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                    {/* Header Alert */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                         <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                             <ShieldAlert size={20} />
                         </div>
                         <div>
                             <h4 className="font-bold text-blue-800 text-sm">Security & Compliance Notice</h4>
                             <p className="text-xs text-blue-600/80 mt-1 leading-relaxed">
                                 Database ini dikelola menggunakan layanan Cloud Supabase (PostgreSQL). 
                                 Backup otomatis dilakukan setiap hari pada pukul 00:00 UTC. 
                                 Akses ke panel ini dicatat dalam log sistem untuk keperluan audit.
                             </p>
                         </div>
                    </div>

                    {/* Status Grid (HUD) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors group">
                             <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition">
                                 <ShieldCheck size={24} strokeWidth={1.5} />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Encryption</p>
                                 <h4 className="font-bold text-neutral-800">AES-256</h4>
                                 <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={10}/> At Rest & Transit</span>
                             </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors group">
                             <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition">
                                 <Clock size={24} strokeWidth={1.5} />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Backup Schedule</p>
                                 <h4 className="font-bold text-neutral-800">Daily (Auto)</h4>
                                 <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1"><HardDrive size={10}/> Point-in-Time Active</span>
                             </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-colors group">
                             <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition">
                                 <Database size={24} strokeWidth={1.5} />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Data Retention</p>
                                 <h4 className="font-bold text-neutral-800">7 Days</h4>
                                 <span className="text-[10px] text-purple-600 font-medium flex items-center gap-1"><Cloud size={10}/> Managed Cloud</span>
                             </div>
                        </div>
                    </div>

                    {/* Main Action Area */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Control Panel */}
                        <div className="md:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
                                    <Server size={18} className="text-neutral-400" /> Database Control
                                </h3>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded border border-emerald-200 uppercase tracking-wide">System Online</span>
                            </div>
                            <div className="p-8 flex flex-col items-center text-center justify-center flex-grow space-y-6">
                                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center border-4 border-neutral-50 shadow-inner">
                                    <Database size={40} className="text-neutral-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900">Supabase Console</h2>
                                    <p className="text-neutral-500 max-w-md mx-auto mt-2">
                                        Untuk melakukan Full Backup (Dump), Restore Point-in-Time, atau Query Analysis, silakan akses dashboard infrastruktur.
                                    </p>
                                </div>
                                <div className="flex gap-4 w-full justify-center">
                                    <a href="https://supabase.com/dashboard/project/_/database/backups" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition shadow-lg shadow-primary-900/20 transform hover:-translate-y-0.5">
                                        <ExternalLink size={18}/> Buka Backup Manager
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions / SOP */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                                <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                    <FileText size={16} /> Recovery Procedures
                                </h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 items-start text-xs text-neutral-600">
                                        <span className="flex-shrink-0 w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-500">1</span>
                                        <p>Login ke Supabase menggunakan akun Administrator yang terdaftar.</p>
                                    </li>
                                    <li className="flex gap-3 items-start text-xs text-neutral-600">
                                        <span className="flex-shrink-0 w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-500">2</span>
                                        <p>Navigasi ke menu <strong className="text-neutral-800">Database &gt; Backups</strong>.</p>
                                    </li>
                                    <li className="flex gap-3 items-start text-xs text-neutral-600">
                                        <span className="flex-shrink-0 w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-500">3</span>
                                        <p>Pilih "Point in Time" untuk restore ke jam tertentu, atau unduh .sql untuk arsip manual.</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm opacity-60 pointer-events-none grayscale">
                                <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                    <FileJson size={16} /> Logical Dump
                                </h4>
                                <p className="text-xs text-neutral-500 mb-4">Unduh data tabel dalam format JSON/CSV untuk keperluan analisis lokal.</p>
                                <button className="w-full py-2 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-400">Export Tables (Coming Soon)</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Total Anggota</p><h3 className="text-3xl font-bold mt-2">{users.filter(u => u.status === 'active' && u.role === UserRole.MEMBER).length}</h3></div>
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Total Kegiatan</p><h3 className="text-3xl font-bold mt-2">{attendanceSessions.length}</h3></div>
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Menunggu Verifikasi</p><h3 className="text-3xl font-bold mt-2">{filteredRegistrations.length}</h3></div>
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"><p className="text-sm font-medium text-neutral-500">Berita Terbit</p><h3 className="text-3xl font-bold mt-2">{news.length}</h3></div>
               </div>
            )}

            {/* MODALS */}
            {deleteMemberData && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-2">Hapus Anggota?</h3>
                        <p className="text-neutral-500 mb-6">Tindakan ini akan menghapus anggota "{deleteMemberData.name}" dan riwayat absensinya.</p>
                        <div className="flex justify-end gap-3"><button onClick={() => setDeleteMemberData(null)} className="px-4 py-2 rounded-lg bg-neutral-100 font-bold">Batal</button><button onClick={confirmDeleteMember} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">{isDeletingMember ? 'Menghapus...' : 'Ya, Hapus'}</button></div>
                    </div>
                </div>
            )}
            
            {deleteSessionData && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-2">Hapus Sesi?</h3>
                        <p className="text-neutral-500 mb-6">Sesi "{deleteSessionData.name}" dan seluruh data absensi di dalamnya akan dihapus permanen.</p>
                        <div className="flex justify-end gap-3"><button onClick={() => setDeleteSessionData(null)} className="px-4 py-2 rounded-lg bg-neutral-100 font-bold">Batal</button><button onClick={confirmDeleteSession} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">{isDeletingSession ? 'Menghapus...' : 'Ya, Hapus'}</button></div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
                    <img src={previewImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                </div>
            )}
            
            {editingMember && (
                <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                      <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50"><h3 className="font-bold text-lg">Edit Data Anggota</h3><button onClick={() => setEditingMember(null)}><X size={20}/></button></div>
                      <form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4">
                         {isSuperAdmin && (
                             <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                                 <label className="block text-xs uppercase font-bold text-amber-700 mb-2">Role / Hak Akses</label>
                                 <select className="w-full border-2 border-amber-200 rounded-lg p-2 font-bold text-neutral-800 focus:border-amber-500 outline-none" value={editMemberForm.role} onChange={e => setEditMemberForm({...editMemberForm, role: e.target.value})}>
                                     <option value="member">Member (Anggota Biasa)</option>
                                     <option value="korwil">Admin Korwil</option>
                                     <option value="pengurus">Pengurus Pusat</option>
                                     <option value="admin">Super Admin</option>
                                 </select>
                             </div>
                         )}
                         <div><label className="text-xs font-bold text-neutral-500">Nama Lengkap</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.name} onChange={e => setEditMemberForm({...editMemberForm, name: e.target.value})} required /></div>
                         <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-xs font-bold text-neutral-500">NIK</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.nik} onChange={e => setEditMemberForm({...editMemberForm, nik: e.target.value})} /></div>
                             <div><label className="text-xs font-bold text-neutral-500">No. HP</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.phone} onChange={e => setEditMemberForm({...editMemberForm, phone: e.target.value})} /></div>
                         </div>
                         <div><label className="text-xs font-bold text-neutral-500">Alamat</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.address} onChange={e => setEditMemberForm({...editMemberForm, address: e.target.value})} /></div>
                         <div>
                             <label className="text-xs font-bold text-neutral-500">Wilayah</label>
                             <select className="w-full border rounded-lg p-2" value={editMemberForm.wilayah} onChange={e => setEditMemberForm({...editMemberForm, wilayah: e.target.value})}>
                                {korwils.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                                <option value="Pusat">Pusat</option>
                             </select>
                         </div>
                         <div className="flex justify-end pt-4 border-t border-neutral-100">
                             <button type="submit" className="bg-primary-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-800 shadow-lg">Simpan Perubahan</button>
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
