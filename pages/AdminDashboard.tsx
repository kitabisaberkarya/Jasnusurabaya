
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Calendar, FileText, BarChart2, UserCheck, AlertCircle, ArrowUpRight, 
  ChevronRight, Image as ImageIcon, Check, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Undo, Redo, Strikethrough, Quote, Link as LinkIcon, Video, Plus, Table,
  Printer, Type, Highlighter, Indent, Outdent, RemoveFormatting, ChevronDown,
  FileSpreadsheet, Download, Filter, Search, Menu, Bell, Settings, LogOut, Circle, Save, Upload, Database, RefreshCcw, AlertTriangle,
  User as UserIcon, Youtube, Instagram, Trash2, PlayCircle, Edit3, Key, MapPin, Phone, Eye, ExternalLink, Grid, List as ListIcon, Lock, LayoutTemplate, ArrowLeft, Clock,
  LayoutDashboard, CheckCircle2, Map, CreditCard, MonitorPlay, HelpCircle, ShieldAlert, ShieldCheck, HardDrive, Cloud, FileJson, Server, UploadCloud, RefreshCw, Info,
  MapPinned, UserCog, PenTool, Stamp
} from 'lucide-react';
import { MemberStatus, AppState, NewsItem, AttendanceSession, AttendanceRecord, User, UserRole, BackupData, Korwil } from '../types';
import XLSX from 'xlsx-js-style';
import { motion, AnimatePresence } from 'framer-motion';
import { KORWIL_LIST } from '../constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { RichTextEditor } from '../components/RichTextEditor';

// File Upload Component Helper
const FileUploader = ({ 
  currentImage, 
  onFileSelect, 
  label,
  hint
}: { 
  currentImage?: string, 
  onFileSelect: (file: File) => void, 
  label: string,
  hint?: string
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-neutral-500 uppercase">{label}</label>
      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition cursor-pointer relative overflow-hidden group min-h-[160px]">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
        />
        {preview ? (
          <div className="relative w-full h-full min-h-[160px] rounded-lg overflow-hidden bg-neutral-100">
             <img src={preview} alt="Preview" className="w-full h-full object-contain" />
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                <span className="text-white font-bold flex items-center gap-2"><Edit3 size={16}/> Ganti Foto</span>
             </div>
          </div>
        ) : (
          <div className="py-8 px-4">
             <UploadCloud className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
             <p className="text-sm text-neutral-500 font-medium mb-1">Klik untuk upload foto</p>
             <p className="text-[10px] text-neutral-400 leading-tight max-w-[200px] mx-auto">
               {hint || "JPG, PNG, WEBP (Max 2MB)"}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { 
    users, registrations, verifyMemberByKorwil, approveMemberFinal, rejectMember, deleteMember, updateMember, resetMemberPassword, attendanceSessions, attendanceRecords, 
    createSession, updateSession, deleteSession, toggleSession, markAttendance, updateAttendanceRecord, deleteAttendanceRecord, news, gallery, sliders, mediaPosts, addNews, updateNews, deleteNews, 
    addGalleryItem, deleteGalleryItem, addSliderItem, deleteSliderItem, addMediaPost, deleteMediaPost, 
    showToast, currentUser, logout, 
    siteConfig, updateSiteConfig, downloadBackup, restoreData, profilePages, updateProfilePage, 
    korwils, addKorwil, updateKorwil, deleteKorwil,
    createAdminUser, changePassword,
    uploadFile, refreshData, isLoading
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'members' | 'attendance' | 'news' | 'gallery' | 'slider' | 'media' | 'recap' | 'settings' | 'backup' | 'profile' | 'admin-management' | 'korwil-data'>('overview');
  // ... (Other states remain same)
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

  // News Form States
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });
  const [newsFile, setNewsFile] = useState<File | null>(null); 
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  
  // Gallery Form States
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '' });
  const [galleryFile, setGalleryFile] = useState<File | null>(null); 
  
  // Slider Form States
  const [sliderForm, setSliderForm] = useState({ imageUrl: '', title: '', description: '' });
  const [sliderFile, setSliderFile] = useState<File | null>(null); 
  
  const [mediaForm, setMediaForm] = useState({ type: 'youtube' as 'youtube' | 'instagram', url: '', caption: '' });

  // Profile Editor State
  const [selectedProfileSlug, setSelectedProfileSlug] = useState('sejarah');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileContent, setProfileContent] = useState('');

  // Backup & Restore State
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [configForm, setConfigForm] = useState(siteConfig);
  const [newKorwilName, setNewKorwilName] = useState('');
  // New States for Signature & Stamp
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  
  // Korwil Editing State (Inline)
  const [editingKorwilId, setEditingKorwilId] = useState<number | null>(null);
  const [editingKorwilData, setEditingKorwilData] = useState<Partial<Korwil>>({});

  // Loading States for Uploads
  const [isUploading, setIsUploading] = useState(false);

  // ACCESS CONTROL
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isKorwil = currentUser?.role === UserRole.ADMIN_KORWIL;
  const isPengurus = currentUser?.role === UserRole.ADMIN_PENGURUS;

  // REFRESH DATA ON MOUNT
  useEffect(() => {
      refreshData();
  }, []);

  // ... (Chart Data & Effects remain the same) ...
  // --- CHART DATA PREPARATION (REALTIME) ---
  
  const memberGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];
    const months: Record<string, number> = {};
    const sortedUsers = [...users].sort((a, b) => {
        const dateA = new Date((a as any).joined_at || a.joinedAt || '2024-01-01').getTime();
        const dateB = new Date((b as any).joined_at || b.joinedAt || '2024-01-01').getTime();
        return dateA - dateB;
    });
    sortedUsers.forEach(user => {
       if (user.role === UserRole.MEMBER) {
           const rawDate = (user as any).joined_at || user.joinedAt || new Date().toISOString();
           const date = new Date(rawDate);
           if (!isNaN(date.getTime())) {
               const key = date.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
               months[key] = (months[key] || 0) + 1;
           }
       }
    });
    let total = 0;
    return Object.entries(months).map(([name, count]) => {
        total += count;
        return { name, Anggota: total, Baru: count };
    });
  }, [users]);

  const attendanceStatsData = useMemo(() => {
     if (!attendanceSessions || attendanceSessions.length === 0) return [];
     return [...attendanceSessions]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7)
        .map(s => ({
            name: s.date.split('-').slice(1).reverse().join('/'), 
            Hadir: s.attendees ? s.attendees.length : 0,
            fullDate: s.date,
            title: s.name
        }));
  }, [attendanceSessions]);

  const wilayahData = useMemo(() => {
      if (!users || users.length === 0) return [];
      const counts: Record<string, number> = {};
      users.forEach(u => {
          if (u.role === UserRole.MEMBER && u.status === MemberStatus.ACTIVE) {
              const w = u.wilayah || 'Lainnya';
              counts[w] = (counts[w] || 0) + 1;
          }
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); 
  }, [users]);

  const COLORS = ['#059669', '#d97706', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

  useEffect(() => {
    if (isKorwil && activeTab !== 'approval') setActiveTab('approval');
    if (isPengurus && activeTab === 'overview') setActiveTab('approval');
  }, [isKorwil, isPengurus]);

  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

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
  }, [selectedProfileSlug, profilePages, activeTab]);

  const getPendingRegistrations = () => {
     if (isKorwil) {
        return registrations.filter(r => r.status === MemberStatus.PENDING && r.wilayah === currentUser?.wilayah);
     } else if (isPengurus) {
        return registrations.filter(r => r.status === MemberStatus.VERIFIED_KORWIL);
     } else {
        return registrations.filter(r => r.status === MemberStatus.PENDING || r.status === MemberStatus.VERIFIED_KORWIL);
     }
  };

  const filteredRegistrations = getPendingRegistrations();
  const filteredUsers = users.filter(u => {
      if (isKorwil) return u.wilayah === currentUser?.wilayah && u.role === UserRole.MEMBER;
      return true; 
  }).filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()));

  // --- HANDLERS ---
  
  const handleUpdateConfigWithFiles = async () => {
    setIsUploading(true);
    try {
        let finalSignatureUrl = configForm.signatureUrl;
        let finalStampUrl = configForm.stampUrl;

        if (signatureFile) {
            const url = await uploadFile(signatureFile, 'signatures');
            if (url) finalSignatureUrl = url;
        }

        if (stampFile) {
            const url = await uploadFile(stampFile, 'stamps');
            if (url) finalStampUrl = url;
        }

        await updateSiteConfig({
            ...configForm,
            signatureUrl: finalSignatureUrl,
            stampUrl: finalStampUrl
        });
        
        setSignatureFile(null);
        setStampFile(null);
    } catch (e) {
        console.error(e);
        showToast("Gagal menyimpan konfigurasi aset digital", "error");
    } finally {
        setIsUploading(false);
    }
  };

  // ... (Other Handlers remain same: handleNewsSubmit, handleEditorImageUpload, etc.)
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
        let finalImageUrl = newsForm.imageUrl;
        if (newsFile) {
            const uploadedUrl = await uploadFile(newsFile, 'news');
            if (uploadedUrl) finalImageUrl = uploadedUrl;
        }
        const payload = { ...newsForm, imageUrl: finalImageUrl };
        if (editingNewsId) {
            await updateNews(editingNewsId, payload);
        } else {
            await addNews({ ...payload, date: new Date().toISOString().split('T')[0] });
        }
        setNewsForm({ title: '', excerpt: '', content: '', imageUrl: '' });
        setNewsFile(null);
        setEditingNewsId(null);
    } catch (error) { console.error(error); showToast("Gagal menyimpan berita", "error"); } finally { setIsUploading(false); }
  };
  const handleEditorImageUpload = async (file: File) => {
      try {
          const url = await uploadFile(file, 'content_images');
          return url;
      } catch (error) {
          console.error("Editor upload error", error);
          showToast("Gagal upload gambar editor", "error");
          return null;
      }
  };
  const handleGallerySubmit = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!galleryFile && !galleryForm.imageUrl) { showToast("Pilih foto atau masukkan URL", "error"); return; }
      setIsUploading(true);
      try {
          let finalUrl = galleryForm.imageUrl;
          if (galleryFile) {
              const uploadedUrl = await uploadFile(galleryFile, 'gallery');
              if (uploadedUrl) finalUrl = uploadedUrl;
          }
          if(finalUrl) {
              addGalleryItem({ type: 'image', url: finalUrl, caption: galleryForm.caption });
              setGalleryForm({ imageUrl: '', caption: '' });
              setGalleryFile(null);
          }
      } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };
  const handleSliderSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!sliderFile && !sliderForm.imageUrl) { showToast("Pilih gambar slider", "error"); return; }
      setIsUploading(true);
      try {
          let finalUrl = sliderForm.imageUrl;
          if (sliderFile) {
              const uploadedUrl = await uploadFile(sliderFile, 'sliders');
              if (uploadedUrl) finalUrl = uploadedUrl;
          }
          if(finalUrl) {
              addSliderItem({ ...sliderForm, imageUrl: finalUrl });
              setSliderForm({ imageUrl: '', title: '', description: '' });
              setSliderFile(null);
          }
      } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };
  const handleCreateAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      if (newAdminForm.password.length < 6) { showToast("Password minimal 6 karakter", "error"); return; }
      createAdminUser(newAdminForm.name, newAdminForm.email, newAdminForm.role as UserRole, newAdminForm.wilayah, newAdminForm.password);
      setNewAdminForm({ name: '', email: '', role: 'korwil', wilayah: '', password: '' });
  };
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (changePasswordForm.new !== changePasswordForm.confirm) { showToast("Konfirmasi password tidak cocok", "error"); return; }
      if (changePasswordForm.new.length < 6) { showToast("Password minimal 6 karakter", "error"); return; }
      if (!currentUser) return;
      const success = await changePassword(currentUser.id, changePasswordForm.new);
      if (success) setChangePasswordForm({ current: '', new: '', confirm: '' });
  };
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
  const handleEditMember = (member: User) => {
    setEditingMember(member);
    setEditMemberForm({ name: member.name, nik: member.nik || '', email: member.email, phone: member.phone || '', address: member.address || '', wilayah: member.wilayah || '', role: member.role || 'member' });
    setIsCustomWilayahEdit(!korwils.some(k => k.name === member.wilayah));
  };
  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
        const updateData: any = { ...editMemberForm };
        if (updateData.role === 'pengurus' && !updateData.wilayah) { updateData.wilayah = 'Pusat'; }
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
  const handleExportMembers = () => {
     try {
         const data = filteredUsers.map(u => ({ 'Nama': u.name, 'NIA': u.nia, 'NIK': u.nik, 'Wilayah': u.wilayah, 'HP': u.phone, 'Alamat': u.address }));
         const wb = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Anggota");
         XLSX.writeFile(wb, `Anggota_JSN.xlsx`);
         showToast("Export berhasil!", "success");
     } catch (e) { showToast("Gagal export data", "error"); }
  };
  const handleProfileSave = () => { updateProfilePage(selectedProfileSlug, profileTitle, profileContent); };
  const handleRestoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (!window.confirm("PERINGATAN: Restore akan menimpa/menambah data yang ada di database. Apakah Anda yakin ingin melanjutkan?")) { e.target.value = ''; return; }
        setIsRestoring(true);
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text) as BackupData;
            if (!jsonData.version || !jsonData.data) { throw new Error("Format file backup tidak valid"); }
            const success = await restoreData(jsonData);
            if (success) { showToast("Database berhasil direstore!", "success"); }
        } catch (error) { console.error(error); showToast("Gagal membaca file backup", "error"); } finally { setIsRestoring(false); e.target.value = ''; }
    }
  };
  const handleEditKorwil = (k: Korwil) => {
    setEditingKorwilId(k.id);
    setEditingKorwilData({ name: k.name, coordinatorName: k.coordinatorName, contact: k.contact });
  };

  const handleSaveKorwil = (id: number) => {
    updateKorwil(id, editingKorwilData);
    setEditingKorwilId(null);
    setEditingKorwilData({});
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 border border-white/20 rounded-xl shadow-xl">
          <p className="font-bold text-primary-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-sm flex flex-col">
      {/* HEADER & SIDEBAR REMAIN UNCHANGED - ONLY CHANGING CONTENT */}
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

      <aside className={`fixed top-[64px] bottom-0 left-0 bg-primary-900 text-white transition-all duration-300 z-40 overflow-y-auto border-r border-primary-800 ${sidebarOpen ? 'w-[260px]' : 'w-[70px]'}`}>
         <div className="py-4 px-3">
            <ul className="space-y-1">
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

               {isSuperAdmin && (
                 <>
                   <div className="pt-4 pb-2">
                      {sidebarOpen && <p className="px-3 text-[10px] uppercase font-bold text-primary-400 tracking-wider">Konten & Sistem</p>}
                   </div>
                   <li><button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Dashboard</span>}</button></li>
                   <li><button onClick={() => setActiveTab('admin-management')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'admin-management' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><ShieldCheck size={20} className={activeTab === 'admin-management' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Manajemen Admin</span>}</button></li>
                   <li><button onClick={() => setActiveTab('korwil-data')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'korwil-data' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><Map size={20} className={activeTab === 'korwil-data' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Data Wilayah</span>}</button></li>
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
            {/* ... other tabs ... */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                       <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                           <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                           <p className="text-sm font-bold text-emerald-100 uppercase tracking-wider relative z-10">Total Anggota</p>
                           <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{users.filter(u => u.status === 'active' && u.role === UserRole.MEMBER).length}</h3>
                           <div className="absolute bottom-4 right-4 text-white opacity-20"><Users size={40}/></div>
                       </div>
                       <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                           <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                           <p className="text-sm font-bold text-amber-100 uppercase tracking-wider relative z-10">Total Kegiatan</p>
                           <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{attendanceSessions.length}</h3>
                           <div className="absolute bottom-4 right-4 text-white opacity-20"><Calendar size={40}/></div>
                       </div>
                       <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                           <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                           <p className="text-sm font-bold text-rose-100 uppercase tracking-wider relative z-10">Menunggu Verifikasi</p>
                           <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{filteredRegistrations.length}</h3>
                           <div className="absolute bottom-4 right-4 text-white opacity-20"><UserCheck size={40}/></div>
                       </div>
                       <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                           <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                           <p className="text-sm font-bold text-blue-100 uppercase tracking-wider relative z-10">Berita Terbit</p>
                           <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{news.length}</h3>
                           <div className="absolute bottom-4 right-4 text-white opacity-20"><FileText size={40}/></div>
                       </div>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                       <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 shadow-lg p-6 relative overflow-hidden">
                           <div className="flex justify-between items-center mb-6 relative z-10">
                               <div><h3 className="font-bold text-lg text-primary-900">Pertumbuhan Anggota</h3><p className="text-xs text-neutral-400">Akumulasi anggota terdaftar per bulan (Realtime)</p></div>
                               <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl"><BarChart2 size={20}/></div>
                           </div>
                           <div className="h-[300px] w-full relative z-10">
                               <ResponsiveContainer width="100%" height="100%"><AreaChart data={memberGrowthData}><defs><linearGradient id="colorAnggota" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.4}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="Anggota" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorAnggota)" animationDuration={1500}/></AreaChart></ResponsiveContainer>
                           </div>
                       </div>
                       <div className="lg:col-span-1 bg-white rounded-3xl border border-neutral-100 shadow-lg p-6 relative overflow-hidden flex flex-col">
                            <div className="mb-4 relative z-10"><h3 className="font-bold text-lg text-primary-900">Sebaran Wilayah</h3><p className="text-xs text-neutral-400">Top 5 Korwil dengan anggota terbanyak</p></div>
                            <div className="flex-1 min-h-[250px] relative z-10">
                               <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={wilayahData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">{wilayahData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))'}} />))}</Pie><Tooltip content={<CustomTooltip />} /><Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '10px', paddingTop: '20px'}}/></PieChart></ResponsiveContainer>
                            </div>
                       </div>
                   </div>
               </div>
            )}
            
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
                                {isLoading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-400"><RefreshCw className="animate-spin mx-auto mb-2"/>Memuat data anggota...</td></tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(u => (
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
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-400">Belum ada data anggota. Pastikan script SQL sudah dijalankan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* ... other content tabs ... */}
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
                </div>
            )}
            
            {/* ... other content ... */}
            {activeTab === 'news' && isSuperAdmin && (
                <div className="flex flex-col gap-10">
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm group/editor">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-neutral-800 flex items-center gap-2">
                                {editingNewsId ? <Edit3 size={24} className="text-amber-500"/> : <Plus size={24} className="text-primary-600"/>}
                                {editingNewsId ? 'Mode Edit Berita' : 'Tulis Berita Baru'}
                            </h3>
                            {editingNewsId && (
                                 <button type="button" onClick={() => { setEditingNewsId(null); setNewsForm({title:'', excerpt:'', content:'', imageUrl:''}); setNewsFile(null); }} className="text-sm bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg font-bold hover:bg-neutral-200">
                                    Batal Edit
                                 </button>
                            )}
                        </div>
                        <form onSubmit={handleNewsSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Judul Berita</label>
                                        <input type="text" placeholder="Masukkan judul berita yang menarik..." className="w-full border border-neutral-300 rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                                    </div>
                                    <div>
                                         <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Ringkasan Singkat</label>
                                         <textarea placeholder="Tulis ringkasan singkat untuk tampilan kartu..." className="w-full border border-neutral-300 rounded-xl p-3 text-sm h-24 focus:ring-2 focus:ring-primary-500 outline-none resize-none" value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})} required />
                                    </div>
                                </div>
                                <div>
                                    <FileUploader 
                                        label="Foto Sampul (Cover)" 
                                        currentImage={newsForm.imageUrl} 
                                        onFileSelect={(file) => setNewsFile(file)} 
                                        hint="Format: JPG/PNG. Rasio Landscape (16:9). Min. 800x450px. Max 2MB."
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <RichTextEditor 
                                    label="Konten Artikel Lengkap" 
                                    value={newsForm.content} 
                                    onChange={(html) => setNewsForm({...newsForm, content: html})} 
                                    placeholder="Mulai menulis artikel lengkap di sini..."
                                    onUpload={(file) => handleEditorImageUpload(file)}
                                />
                            </div>
                            <div className="flex justify-end pt-4 border-t border-neutral-100">
                                <button type="submit" disabled={isUploading} className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition transform active:scale-95 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-700 hover:bg-primary-800'}`}>
                                    {isUploading ? (<><RefreshCcw className="animate-spin" size={20} /> Memproses...</>) : (editingNewsId ? <><Save size={20}/> Simpan Perubahan</> : <><CheckCircle2 size={20}/> Terbitkan Berita</>)}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-neutral-600 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-200 pb-2">
                            <FileText size={20}/> Riwayat Berita ({news.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {news.map(n => (
                                <div key={n.id} className={`bg-white border rounded-xl p-4 flex gap-4 hover:shadow-lg transition group ${editingNewsId === n.id ? 'border-amber-400 ring-2 ring-amber-100' : 'border-neutral-200'}`}>
                                    <img src={n.imageUrl} className="w-24 h-24 object-cover rounded-lg bg-neutral-100 shadow-sm group-hover:scale-105 transition duration-500" />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-neutral-800 line-clamp-2 leading-tight text-sm mb-1">{n.title}</h3>
                                            <p className="text-[10px] text-neutral-500 bg-neutral-50 inline-block px-2 py-0.5 rounded border border-neutral-100">{n.date}</p>
                                        </div>
                                        <div className="flex gap-2 text-xs mt-3">
                                            <button onClick={() => { setNewsForm({ title: n.title, excerpt: n.excerpt, content: n.content, imageUrl: n.imageUrl }); setEditingNewsId(n.id); document.querySelector('.group\\/editor')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 text-center text-amber-600 font-bold bg-amber-50 hover:bg-amber-100 py-1.5 rounded transition flex items-center justify-center gap-1"><Edit3 size={14}/> Edit</button>
                                            <button onClick={() => deleteNews(n.id)} className="flex-1 text-center text-red-600 font-bold bg-red-50 hover:bg-red-100 py-1.5 rounded transition flex items-center justify-center gap-1"><Trash2 size={14}/> Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'gallery' && isSuperAdmin && (
               <div className="space-y-6">
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-6">
                       <h3 className="font-bold text-neutral-800 mb-4">Tambah Foto Galeri</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <FileUploader 
                                   label="Upload Foto Galeri" 
                                   currentImage="" 
                                   onFileSelect={(file) => setGalleryFile(file)} 
                                   hint="Format: JPG/PNG/WEBP. Resolusi HD disarankan. Max 5MB."
                               />
                           </div>
                           <div className="flex flex-col justify-end space-y-4">
                               <input type="text" placeholder="Caption / Keterangan" className="w-full border rounded-lg p-3" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} />
                               <button onClick={handleGallerySubmit} disabled={isUploading} className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-700 hover:bg-primary-800'}`}>{isUploading ? <><RefreshCcw className="animate-spin" size={16}/> Mengupload...</> : 'Tambah ke Galeri'}</button>
                           </div>
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
            
            {activeTab === 'settings' && (
               <div className="max-w-4xl space-y-8">
                  {/* Password Change */}
                  <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                      <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2"><Lock size={20}/> Ganti Password</h3>
                      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                          <div><label className="block text-xs font-bold text-neutral-500 mb-1">Password Baru</label><input type="password" className="w-full border rounded-lg p-3" value={changePasswordForm.new} onChange={e => setChangePasswordForm({...changePasswordForm, new: e.target.value})} required placeholder="Minimal 6 karakter" /></div>
                          <div><label className="block text-xs font-bold text-neutral-500 mb-1">Konfirmasi Password Baru</label><input type="password" className="w-full border rounded-lg p-3" value={changePasswordForm.confirm} onChange={e => setChangePasswordForm({...changePasswordForm, confirm: e.target.value})} required /></div>
                          <button type="submit" className="bg-primary-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-800">Simpan Password Baru</button>
                      </form>
                  </div>
                  
                  {isSuperAdmin && (
                    <>
                      {/* General Config */}
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
                          
                          {/* NEW: Digital Assets Configuration */}
                          <div className="mt-8 pt-6 border-t border-neutral-100">
                             <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2"><Stamp size={20} className="text-amber-600"/> Aset Digital E-KTA</h4>
                             <p className="text-sm text-neutral-500 mb-4">Unggah Tanda Tangan dan Stempel digital (format PNG Transparan) untuk ditampilkan pada Kartu Anggota.</p>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FileUploader 
                                        label="Tanda Tangan Pengurus" 
                                        currentImage={configForm.signatureUrl} 
                                        onFileSelect={(file) => setSignatureFile(file)} 
                                        hint="PNG Transparan. Rasio 2:1."
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <PenTool size={16} className="text-neutral-400"/>
                                        <span className="text-xs text-neutral-500">Akan muncul di kolom TTD E-KTA.</span>
                                    </div>
                                </div>
                                <div>
                                    <FileUploader 
                                        label="Stempel Organisasi" 
                                        currentImage={configForm.stampUrl} 
                                        onFileSelect={(file) => setStampFile(file)} 
                                        hint="PNG Transparan. Rasio 1:1."
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <Stamp size={16} className="text-neutral-400"/>
                                        <span className="text-xs text-neutral-500">Akan menimpa tanda tangan.</span>
                                    </div>
                                </div>
                             </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-neutral-100 text-right">
                              <button onClick={handleUpdateConfigWithFiles} disabled={isUploading} className={`bg-primary-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-800 transition flex items-center justify-center gap-2 ml-auto ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                  {isUploading ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>} 
                                  {isUploading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                              </button>
                          </div>
                      </div>
                    </>
                  )}
               </div>
            )}
            
            {/* Other modals remain same */}
            {deleteMemberData && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl max-w-sm w-full"><h3 className="font-bold text-lg mb-2">Hapus Anggota?</h3><p className="text-neutral-500 mb-6">Tindakan ini akan menghapus anggota "{deleteMemberData.name}" dan riwayat absensinya.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteMemberData(null)} className="px-4 py-2 rounded-lg bg-neutral-100 font-bold">Batal</button><button onClick={confirmDeleteMember} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">{isDeletingMember ? 'Menghapus...' : 'Ya, Hapus'}</button></div></div></div>
            )}
            {deleteSessionData && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl max-w-sm w-full"><h3 className="font-bold text-lg mb-2">Hapus Sesi?</h3><p className="text-neutral-500 mb-6">Sesi "{deleteSessionData.name}" dan seluruh data absensi di dalamnya akan dihapus permanen.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteSessionData(null)} className="px-4 py-2 rounded-lg bg-neutral-100 font-bold">Batal</button><button onClick={confirmDeleteSession} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">{isDeletingSession ? 'Menghapus...' : 'Ya, Hapus'}</button></div></div></div>
            )}
            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" /></div>
            )}
            {editingMember && (
                <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"><div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50"><h3 className="font-bold text-lg">Edit Data Anggota</h3><button onClick={() => setEditingMember(null)}><X size={20}/></button></div><form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4">{isSuperAdmin && (<div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4"><label className="block text-xs uppercase font-bold text-amber-700 mb-2">Role / Hak Akses</label><select className="w-full border-2 border-amber-200 rounded-lg p-2 font-bold text-neutral-800 focus:border-amber-500 outline-none" value={editMemberForm.role} onChange={e => setEditMemberForm({...editMemberForm, role: e.target.value})}><option value="member">Member (Anggota Biasa)</option><option value="korwil">Admin Korwil</option><option value="pengurus">Pengurus Pusat</option><option value="admin">Super Admin</option></select></div>)}<div><label className="text-xs font-bold text-neutral-500">Nama Lengkap</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.name} onChange={e => setEditMemberForm({...editMemberForm, name: e.target.value})} required /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-neutral-500">NIK</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.nik} onChange={e => setEditMemberForm({...editMemberForm, nik: e.target.value})} /></div><div><label className="text-xs font-bold text-neutral-500">No. HP</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.phone} onChange={e => setEditMemberForm({...editMemberForm, phone: e.target.value})} /></div></div><div><label className="text-xs font-bold text-neutral-500">Alamat</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.address} onChange={e => setEditMemberForm({...editMemberForm, address: e.target.value})} /></div><div><label className="text-xs font-bold text-neutral-500">Wilayah</label><select className="w-full border rounded-lg p-2" value={editMemberForm.wilayah} onChange={e => setEditMemberForm({...editMemberForm, wilayah: e.target.value})}>{korwils.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}<option value="Pusat">Pusat</option></select></div><div className="flex justify-end pt-4 border-t border-neutral-100"><button type="submit" className="bg-primary-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-800 shadow-lg">Simpan Perubahan</button></div></form></div></div>
            )}
         </div>
      </main>
    </div>
  );
};
