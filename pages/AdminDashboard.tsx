
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
import { MemberStatus, AppState, NewsItem, AttendanceSession, AttendanceRecord, User } from '../types';
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
    users, registrations, approveMember, rejectMember, deleteMember, updateMember, resetMemberPassword, attendanceSessions, attendanceRecords, 
    createSession, updateSession, deleteSession, toggleSession, markAttendance, updateAttendanceRecord, deleteAttendanceRecord, news, gallery, sliders, mediaPosts, addNews, updateNews, deleteNews, 
    addGalleryItem, deleteGalleryItem, addSliderItem, deleteSliderItem, addMediaPost, deleteMediaPost, 
    showToast, currentUser, logout, 
    siteConfig, updateSiteConfig, restoreData, profilePages, updateProfilePage, 
    korwils, addKorwil, deleteKorwil, 
    ...fullState 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'members' | 'attendance' | 'news' | 'gallery' | 'slider' | 'media' | 'recap' | 'settings' | 'backup' | 'profile'>('overview');
  const [newSessionName, setNewSessionName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Recap State
  const [recapType, setRecapType] = useState<'attendance' | 'members'>('attendance');
  
  // Member Management State
  const [memberSearch, setMemberSearch] = useState('');
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editMemberForm, setEditMemberForm] = useState({ name: '', nik: '', email: '', phone: '', address: '', wilayah: '' });
  const [isCustomWilayahEdit, setIsCustomWilayahEdit] = useState(false);

  // Member Delete & Reset Password State (Modern Popups)
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
  // Session Delete State (New)
  const [deleteSessionData, setDeleteSessionData] = useState<{id: number, name: string} | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  // News Form State
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const newsCoverInputRef = useRef<HTMLInputElement>(null);

  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '' });
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Slider Form State
  const [sliderForm, setSliderForm] = useState({ imageUrl: '', title: '', description: '' });
  const sliderInputRef = useRef<HTMLInputElement>(null);

  // Media Form State
  const [mediaForm, setMediaForm] = useState({ type: 'youtube' as 'youtube' | 'instagram', url: '', caption: '' });

  // Profile Editor State
  const [selectedProfileSlug, setSelectedProfileSlug] = useState('sejarah');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileContent, setProfileContent] = useState('');

  // --- KORWIL TABLE EDITOR STATE ---
  const [korwilRows, setKorwilRows] = useState<KorwilRow[]>([]);
  const [newKorwilRow, setNewKorwilRow] = useState<KorwilRow>({ wilayah: '', nama: '', kontak: '' });
  const [isKorwilInitialized, setIsKorwilInitialized] = useState(false);

  // Settings State
  const [configForm, setConfigForm] = useState(siteConfig);
  const [newKorwilName, setNewKorwilName] = useState('');

  // Backup/Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update configForm when siteConfig changes
  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  // Load initial content and title for profile editor
  useEffect(() => {
    const page = profilePages.find(p => p.slug === selectedProfileSlug);
    const content = page ? page.content : '';
    setProfileContent(content);
    
    // Default titles fallback
    const defaultTitles: Record<string, string> = {
        'sejarah': 'Sejarah Jamiyah',
        'pengurus': 'Susunan Pengurus Pusat',
        'korwil': 'Daftar Koordinator Wilayah',
        'amaliyah': 'Amaliyah & Wirid Rutin',
        'tentang-kami': 'Membangun Ukhuwah Islamiyah'
    };
    
    setProfileTitle(page ? page.title : defaultTitles[selectedProfileSlug] || '');
    
    // Sync to editor div if exists
    if (editorRef.current && selectedProfileSlug !== 'korwil') {
        editorRef.current.innerHTML = content;
    }

    // Parsing HTML Table to JSON Rows for Korwil Editor
    if (selectedProfileSlug === 'korwil') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const rows = doc.querySelectorAll('tbody tr');
        const parsedRows: KorwilRow[] = [];
        
        rows.forEach(tr => {
            const cols = tr.querySelectorAll('td');
            if (cols.length >= 3) {
                parsedRows.push({
                    wilayah: cols[0].innerText.trim(),
                    nama: cols[1].innerText.trim(),
                    kontak: cols[2].innerText.trim()
                });
            }
        });

        // Initialize with parsed data OR default empty if none
        if (parsedRows.length > 0) {
            setKorwilRows(parsedRows);
        } else if (!isKorwilInitialized && (!page || !content)) {
            // Initial dummy data if totally empty
            setKorwilRows([
                { wilayah: 'Kalirungkut', nama: 'H. Abdullah', kontak: '0812-xxxx-xxxx' },
                { wilayah: 'Rungkut Kidul', nama: 'Ust. Ahmad', kontak: '0813-xxxx-xxxx' }
            ]);
        }
        setIsKorwilInitialized(true);
    }

  }, [selectedProfileSlug, profilePages, activeTab]);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to top of form
  const formRef = useRef<HTMLDivElement>(null);

  // Sync Editor content on mount or reset
  useEffect(() => {
    if (editorRef.current) {
      if (activeTab === 'news') {
          if (newsForm.content === '') {
            editorRef.current.innerHTML = '';
          } else if (editorRef.current.innerHTML === '') {
            editorRef.current.innerHTML = newsForm.content;
          }
      }
    }
  }, [newsForm.content, activeTab]);

  // --- KORWIL ACTIONS ---
  const handleAddKorwilRow = () => {
    if (newKorwilRow.wilayah && newKorwilRow.nama) {
        setKorwilRows([...korwilRows, newKorwilRow]);
        setNewKorwilRow({ wilayah: '', nama: '', kontak: '' });
    } else {
        showToast("Mohon isi Wilayah dan Nama Koordinator", "error");
    }
  };

  const handleDeleteKorwilRow = (index: number) => {
    const newRows = [...korwilRows];
    newRows.splice(index, 1);
    setKorwilRows(newRows);
  };

  const handleUpdateKorwilRow = (index: number, field: keyof KorwilRow, value: string) => {
    const newRows = [...korwilRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setKorwilRows(newRows);
  };

  // Generate Modern HTML Table from Data
  const generateKorwilHTML = () => {
     return `
      <div class="w-full overflow-hidden rounded-xl border border-neutral-200 shadow-lg my-6 bg-white font-sans">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gradient-to-r from-primary-900 to-primary-700 text-white">
              <th class="p-5 font-bold text-sm uppercase tracking-wider border-b border-primary-800">Wilayah / Jabatan</th>
              <th class="p-5 font-bold text-sm uppercase tracking-wider border-b border-primary-800">Nama Koordinator</th>
              <th class="p-5 font-bold text-sm uppercase tracking-wider border-b border-primary-800">Kontak / Keterangan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            ${korwilRows.map((row, idx) => `
              <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} hover:bg-primary-50 transition-colors duration-200">
                <td class="p-5 font-bold text-primary-900">${row.wilayah}</td>
                <td class="p-5 text-neutral-700 font-medium">${row.nama}</td>
                <td class="p-5 text-neutral-600 font-mono text-sm">${row.kontak}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="bg-neutral-50 p-4 text-xs text-center text-neutral-400 border-t border-neutral-200">
           Update Data: ${new Date().toLocaleDateString('id-ID')}
        </div>
      </div>
     `;
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName) {
      createSession(newSessionName);
      setNewSessionName('');
    }
  };

  const handleEditSession = (session: AttendanceSession) => {
    setEditingSession(session);
    setEditSessionName(session.name);
  };

  const handleUpdateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession && editSessionName.trim()) {
      updateSession(editingSession.id, editSessionName);
      setEditingSession(null);
    }
  };

  // Trigger Modal Popup instead of window.confirm
  const handleDeleteSession = (id: number, name: string) => {
    setDeleteSessionData({ id, name });
  };

  // Confirm Action inside Modal
  const confirmDeleteSession = async () => {
    if (deleteSessionData) {
      setIsDeletingSession(true);
      await deleteSession(deleteSessionData.id);
      setIsDeletingSession(false);
      setDeleteSessionData(null);
    }
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const thumbnail = newsForm.imageUrl || "https://picsum.photos/800/600";
    const finalContent = newsForm.content;

    if (editingNewsId !== null) {
      updateNews(editingNewsId, {
        title: newsForm.title,
        excerpt: newsForm.excerpt,
        content: finalContent,
        imageUrl: thumbnail
      });
      setEditingNewsId(null);
    } else {
      addNews({
        ...newsForm,
        content: finalContent,
        imageUrl: thumbnail,
        date: new Date().toISOString().split('T')[0]
      });
    }
    
    setNewsForm({ title: '', excerpt: '', content: '', imageUrl: '' });
    setEditingNewsId(null);
    if (editorRef.current) editorRef.current.innerHTML = '';
    if (newsCoverInputRef.current) newsCoverInputRef.current.value = '';
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setEditingNewsId(newsItem.id);
    setNewsForm({
      title: newsItem.title,
      excerpt: newsItem.excerpt,
      content: newsItem.content,
      imageUrl: newsItem.imageUrl
    });
    if (editorRef.current) {
       editorRef.current.innerHTML = newsItem.content;
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEditNews = () => {
    setEditingNewsId(null);
    setNewsForm({ title: '', excerpt: '', content: '', imageUrl: '' });
    if (editorRef.current) editorRef.current.innerHTML = '';
    if (newsCoverInputRef.current) newsCoverInputRef.current.value = '';
  };

  const handleDeleteNews = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      deleteNews(id);
      if (editingNewsId === id) {
        handleCancelEditNews();
      }
    }
  };

  const handleNewsCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran gambar terlalu besar (Maks 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
           setNewsForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.imageUrl) {
      showToast("Silakan pilih gambar terlebih dahulu", "error");
      return;
    }
    addGalleryItem({
      type: 'image',
      url: galleryForm.imageUrl,
      caption: galleryForm.caption
    });
    setGalleryForm({ imageUrl: '', caption: '' });
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran gambar terlalu besar (Maks 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
           setGalleryForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Slider Handlers
  const handleSliderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sliderForm.imageUrl) {
      showToast("Silakan pilih gambar terlebih dahulu", "error");
      return;
    }
    addSliderItem({
      imageUrl: sliderForm.imageUrl,
      title: sliderForm.title,
      description: sliderForm.description
    });
    setSliderForm({ imageUrl: '', title: '', description: '' });
    if (sliderInputRef.current) sliderInputRef.current.value = '';
  };

  const handleSliderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran gambar terlalu besar (Maks 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
           setSliderForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };


  // Trigger Delete Member Modal
  const handleDeleteMember = (id: number, name: string) => {
    setDeleteMemberData({ id, name });
  };

  const confirmDeleteMember = async () => {
    if (deleteMemberData) {
      setIsDeletingMember(true);
      await deleteMember(deleteMemberData.id);
      setIsDeletingMember(false);
      setDeleteMemberData(null);
    }
  };

  const handleEditMember = (member: User) => {
    setEditingMember(member);
    setEditMemberForm({
      name: member.name,
      nik: member.nik || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      wilayah: member.wilayah || ''
    });
    setIsCustomWilayahEdit(false);
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      updateMember(editingMember.id, {
        name: editMemberForm.name,
        nik: editMemberForm.nik,
        email: editMemberForm.email,
        phone: editMemberForm.phone,
        address: editMemberForm.address,
        wilayah: editMemberForm.wilayah
      });
      setEditingMember(null);
    }
  };

  // Trigger Reset Password Modal
  const handleResetPassword = (id: number, name: string) => {
    setResetPasswordData({ id, name });
  };

  const confirmResetPassword = async () => {
    if (resetPasswordData) {
      setIsResettingPassword(true);
      await resetMemberPassword(resetPasswordData.id);
      setIsResettingPassword(false);
      setResetPasswordData(null);
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    let embedUrl = "";

    if (mediaForm.type === 'youtube') {
       const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
       const match = mediaForm.url.match(regExp);
       if (match && match[2].length === 11) {
          embedUrl = `https://www.youtube.com/embed/${match[2]}`;
       } else {
          showToast("URL YouTube tidak valid", "error");
          return;
       }
    } else {
       if (mediaForm.url.match(/instagram\.com\/(p|reel|tv)\//)) {
           let cleanUrl = mediaForm.url.split('?')[0];
           if (cleanUrl.endsWith('/')) {
               cleanUrl = cleanUrl.slice(0, -1);
           }
           embedUrl = `${cleanUrl}/embed`;
       } else {
           showToast("URL Instagram tidak valid (Gunakan Link Postingan/Reel)", "error");
           return;
       }
    }

    addMediaPost({
       type: mediaForm.type,
       url: mediaForm.url,
       embedUrl: embedUrl,
       caption: mediaForm.caption
    });
    setMediaForm({ type: 'youtube', url: '', caption: '' });
  };

  const handleSaveProfile = () => {
    if (selectedProfileSlug === 'korwil') {
        const htmlContent = generateKorwilHTML();
        updateProfilePage(selectedProfileSlug, profileTitle, htmlContent);
    } else if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        updateProfilePage(selectedProfileSlug, profileTitle, content);
    }
  };

  const handleAddKorwil = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKorwilName.trim()) {
      addKorwil(newKorwilName.trim());
      setNewKorwilName('');
    }
  };

  const handleDeleteKorwil = (id: number, name: string) => {
    if (window.confirm(`Hapus wilayah '${name}'?`)) {
      deleteKorwil(id);
    }
  };
  
  // Attendance Management
  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditRecordForm({
      userName: record.userName,
      location: record.location,
      timestamp: record.timestamp
    });
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateAttendanceRecord(editingRecord.id, editRecordForm);
      setEditingRecord(null);
    }
  };

  const handleDeleteRecord = (record: AttendanceRecord) => {
    if (window.confirm(`Hapus data kehadiran '${record.userName}'?`)) {
      deleteAttendanceRecord(record.id, record.sessionId, record.userId);
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        if (activeTab === 'news') {
             setNewsForm(prev => ({ ...prev, content: html }));
        } else if (activeTab === 'profile') {
             setProfileContent(html);
        }
    }
    editorRef.current?.focus();
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <div class="overflow-hidden my-6 rounded-xl shadow-lg border border-neutral-200">
        <table class="w-full text-sm text-left border-collapse bg-white">
          <thead class="text-xs text-white uppercase bg-gradient-to-r from-primary-700 to-primary-600">
            <tr>
              <th class="px-6 py-4 font-bold border-b border-white/10">Wilayah / Jabatan</th>
              <th class="px-6 py-4 font-bold border-b border-white/10">Nama Koordinator</th>
              <th class="px-6 py-4 font-bold border-b border-white/10">Kontak / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-white hover:bg-primary-50 transition-colors duration-200">
              <td class="px-6 py-4 border-b border-neutral-100 font-medium text-gray-900">Korwil 1</td>
              <td class="px-6 py-4 border-b border-neutral-100">Nama Pengurus</td>
              <td class="px-6 py-4 border-b border-neutral-100">08xx-xxxx-xxxx</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br/></p>
    `;
    
    if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertHTML', false, tableHtml);
        const html = editorRef.current.innerHTML;
        if (activeTab === 'news') setNewsForm(prev => ({ ...prev, content: html }));
        if (activeTab === 'profile') setProfileContent(html);
    }
  };

  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran gambar terlalu besar (Maks 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          editorRef.current?.focus();
          const imgHtml = `<img src="${reader.result}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem;" />`;
          document.execCommand('insertHTML', false, imgHtml);
          if (editorRef.current) {
             const html = editorRef.current.innerHTML;
             if (activeTab === 'news') setNewsForm(prev => ({ ...prev, content: html }));
             if (activeTab === 'profile') setProfileContent(html);
          }
        }
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleEditorVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast("Ukuran video terlalu besar (Maks 10MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
           editorRef.current?.focus();
           const videoHtml = `
             <div class="my-4">
               <video controls class="max-w-full rounded-lg shadow-sm border border-neutral-200" style="max-height: 400px; width: 100%;">
                 <source src="${reader.result}" type="${file.type}">
                 Browser Anda tidak mendukung tag video.
               </video>
               <p><br/></p>
             </div>
           `;
           document.execCommand('insertHTML', false, videoHtml);
           if (editorRef.current) {
             const html = editorRef.current.innerHTML;
             if (activeTab === 'news') setNewsForm(prev => ({ ...prev, content: html }));
             if (activeTab === 'profile') setProfileContent(html);
          }
        }
      };
      reader.readAsDataURL(file);
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran logo terlalu besar (Maks 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
           setConfigForm(prev => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig(configForm);
  };

  const handleBackup = () => {
    const backupData: AppState = {
      users, registrations, news, gallery, sliders, mediaPosts, profilePages, attendanceSessions, attendanceRecords, siteConfig, korwils,
      currentUser: null, toasts: [] 
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().slice(0, 10);
    downloadAnchorNode.setAttribute("download", `JSN_Backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Backup data berhasil diunduh!", "success");
  };

  const handleRestoreClick = () => {
    if (window.confirm("PERINGATAN: Tindakan ini akan menimpa seluruh data sistem saat ini dengan data dari file backup. Lanjutkan?")) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (file) {
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (event) => {
        try {
          if (event.target?.result) {
            const parsedData = JSON.parse(event.target.result as string);
            restoreData(parsedData);
          }
        } catch (err) {
          showToast("File tidak valid atau rusak.", "error");
        }
      };
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // HELPER: Generate Styled Excel using xlsx-js-style
  const generateStyledExcel = (data: any[], sheetName: string, fileName: string) => {
     // 1. Create Worksheet
     const ws = XLSX.utils.json_to_sheet(data);

     // 2. Define Styles
     // Header Style: Emerald Background, White Bold Text, Centered
     const headerStyle = {
        font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "064E3B" } }, // Emerald 900
        alignment: { horizontal: "center", vertical: "center" },
        border: {
           top: { style: "thin", color: { rgb: "FFFFFF" } },
           bottom: { style: "thin", color: { rgb: "FFFFFF" } },
           left: { style: "thin", color: { rgb: "FFFFFF" } },
           right: { style: "thin", color: { rgb: "FFFFFF" } }
        }
     };

     // Body Style: Alternating Colors (Not strictly possible row-by-row easily without loop, applying base style)
     const bodyStyle = {
        font: { name: "Arial", sz: 10 },
        alignment: { vertical: "center" },
        border: {
           top: { style: "thin", color: { rgb: "E2E8F0" } }, // Neutral 200
           bottom: { style: "thin", color: { rgb: "E2E8F0" } },
           left: { style: "thin", color: { rgb: "E2E8F0" } },
           right: { style: "thin", color: { rgb: "E2E8F0" } }
        }
     };

     // 3. Apply Styles to Cells
     const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
     
     // Calculate Column Widths based on content
     const colWidths: number[] = [];

     for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
           const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
           if (!ws[cellRef]) continue;

           // Apply Header Style
           if (R === 0) {
              ws[cellRef].s = headerStyle;
           } else {
              // Apply Body Style
              ws[cellRef].s = bodyStyle;
           }

           // Calculate Max Width
           const cellValue = ws[cellRef].v ? String(ws[cellRef].v) : "";
           colWidths[C] = Math.max(colWidths[C] || 10, cellValue.length + 5);
        }
     }

     // 4. Set Column Widths
     ws['!cols'] = colWidths.map(w => ({ wch: w }));

     // 5. Create Workbook and Download
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, sheetName);
     XLSX.writeFile(wb, fileName);
  };

  const downloadReport = () => {
    const data: any[] = [];
    const timestamp = new Date().toISOString().slice(0,10);

    if (recapType === 'attendance') {
      attendanceSessions.forEach(session => {
        session.attendees.forEach(userId => {
          // Use String comparison for safer matching
          const user = users.find(u => String(u.id) === String(userId));
          const record = attendanceRecords.find(r => r.sessionId === session.id && String(r.userId) === String(userId));
          
          if (user) {
            data.push({
              "Tanggal": session.date,
              "Kegiatan": session.name,
              "Nama Anggota": user.name.toUpperCase(),
              "NIA": user.nia || '-',
              "NIK KTP": user.nik || '-', // Pastikan NIK terambil
              "Wilayah": user.wilayah || '-',
              "Waktu Hadir": record ? record.timestamp : 'Manual/Tanpa Foto',
              "Lokasi": record ? record.location : '-'
            });
          }
        });
      });
    } else {
      users.filter(u => u.role !== 'admin').forEach(user => {
         data.push({
           "NIA": user.nia || '-', 
           "NIK KTP": user.nik || '-', // Pastikan NIK terambil
           "Nama Lengkap": user.name.toUpperCase(), 
           "Email": user.email, 
           "No HP": user.phone || '-',
           "Alamat": user.address || '-', 
           "Wilayah": user.wilayah || '-', 
           "Status": user.status === MemberStatus.ACTIVE ? 'AKTIF' : 'PENDING',
           "Bergabung": user.joinedAt || '-'
         });
      });
    }

    if (data.length === 0) {
      showToast("Tidak ada data untuk diunduh.", "info");
      return;
    }

    generateStyledExcel(data, recapType === 'attendance' ? "Laporan Absensi" : "Database Anggota", `JSN_Laporan_${recapType}_${timestamp}.xlsx`);
    showToast("Laporan berhasil diunduh (Styled XLSX)", "success");
  };

  const downloadSessionReport = (session: AttendanceSession) => {
    const data: any[] = [];
    const filteredRecords = attendanceRecords.filter(r => r.sessionId === session.id);
    
    filteredRecords.forEach(record => {
      // Robust comparison using String() to avoid Type Mismatches
      const user = users.find(u => String(u.id) === String(record.userId));
      
      data.push({
        "Waktu": record.timestamp,
        "Nama Lengkap": (user?.name || record.userName).toUpperCase(), 
        "NIA": user?.nia || '-', 
        "NIK KTP": user?.nik || '-', // Pastikan NIK terambil
        "Wilayah": user?.wilayah || '-',
        "Lokasi Kehadiran": record.location,
        "Status": "HADIR"
      });
    });

    if (data.length === 0) {
      showToast("Belum ada yang hadir pada sesi ini.", "info");
      return;
    }

    const safeName = session.name.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
    generateStyledExcel(data, "Absensi Sesi", `JSN_Absensi_${safeName}_${session.date}.xlsx`);
    showToast("Absensi sesi berhasil diunduh (Styled XLSX)", "success");
  }

  // Use korwils from DB if available, otherwise fallback to static list
  const displayKorwils = korwils.length > 0 ? korwils : KORWIL_LIST.map((k, i) => ({ id: i, name: k }));

  const activeMembersCount = users.filter(u => u.status === MemberStatus.ACTIVE && u.role !== 'admin').length;
  const pendingCount = registrations.length;
  const totalSessions = attendanceSessions.length;
  const totalNews = news.length;

  const filteredMembers = users.filter(u => 
      u.role === MemberStatus.ACTIVE as any || (u.role as any) === 'member'
  ).filter(u => 
      u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (u.nia && u.nia.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const getFilteredAttendance = () => {
    if (!viewingSession) return [];
    return attendanceRecords.filter(record => 
       record.sessionId === viewingSession.id &&
       record.userName.toLowerCase().includes(attendanceSearch.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-[#ecf0f5] font-sans text-sm">
      <header className="fixed top-0 left-0 right-0 h-[50px] bg-[#3c8dbc] z-50 flex">
        <div className={`h-full bg-[#367fa9] text-white flex items-center justify-center font-bold text-lg transition-all duration-300 ${sidebarOpen ? 'w-[230px]' : 'w-[50px]'}`}>
           {sidebarOpen ? 'JSN ADMIN' : 'JSN'}
        </div>
        <nav className="flex-1 flex justify-between items-center px-4">
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-black/10 p-2 rounded transition">
              <Menu size={20} />
           </button>
           <div className="flex items-center gap-4">
              <div className="relative text-white/80 hover:text-white cursor-pointer hidden sm:block">
                 <Bell size={18} />
                 {pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-[#f39c12] text-white text-[10px] px-1 rounded-sm">{pendingCount}</span>}
              </div>
              <div className="flex items-center gap-3 text-white pl-4 border-l border-white/20">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=random" className="w-8 h-8 rounded-full border border-white/50" alt="Admin" />
                 <span className="hidden sm:inline font-semibold">Alexander Pierce</span>
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
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" className="w-12 h-12 rounded-full border-2 border-white/10" alt="User" />
              <div>
                 <p className="font-semibold text-white">Alexander Pierce</p>
                 <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#00a65a]"></div> Online
                 </div>
              </div>
           </div>
         )}
         <div className="py-2">
            {sidebarOpen && <p className="px-4 text-[10px] uppercase font-bold text-[#4b646f] mb-2 tracking-wider">Main Navigation</p>}
            <ul className="space-y-0.5">
               {[
                 { id: 'overview', icon: BarChart2, label: 'Dashboard', badge: null },
                 { id: 'approval', icon: UserCheck, label: 'Approval Anggota', badge: pendingCount, badgeColor: 'bg-[#00c0ef]' },
                 { id: 'members', icon: Users, label: 'Data Anggota', badge: null }, 
                 { id: 'profile', icon: UserIcon, label: 'Manajemen Profil', badge: null },
                 { id: 'slider', icon: LayoutTemplate, label: 'Slider Beranda', badge: null },
                 { id: 'media', icon: PlayCircle, label: 'Manajemen Media', badge: null },
                 { id: 'gallery', icon: ImageIcon, label: 'Manajemen Galeri', badge: null },
                 { id: 'attendance', icon: Calendar, label: 'Absensi Majelis', badge: null },
                 { id: 'recap', icon: FileSpreadsheet, label: 'Rekapitulasi', badge: null },
                 { id: 'news', icon: FileText, label: 'Manajemen Berita', badge: null },
                 { id: 'settings', icon: Settings, label: 'Pengaturan', badge: null },
                 { id: 'backup', icon: Database, label: 'Backup & Restore', badge: null, badgeColor: 'bg-[#f39c12]' },
               ].map(item => (
                 <li key={item.id}>
                    <button 
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1e282c] transition-colors border-l-[3px] ${
                        activeTab === item.id 
                        ? 'bg-[#1e282c] border-[#3c8dbc] text-white' 
                        : 'border-transparent'
                      }`}
                    >
                       <div className="flex items-center gap-3">
                          <item.icon size={18} />
                          {sidebarOpen && <span>{item.label}</span>}
                       </div>
                       {sidebarOpen && item.badge !== null && item.badge > 0 && (
                          <span className={`${item.badgeColor || 'bg-red-500'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm`}>
                             {item.badge}
                          </span>
                       )}
                    </button>
                 </li>
               ))}
            </ul>
         </div>
      </aside>

      <main className={`pt-[50px] transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-[230px]' : 'ml-[50px]'}`}>
         
         <div className="px-6 py-4 flex justify-between items-center bg-transparent">
            <div>
               <h1 className="text-2xl font-normal text-[#333]">
                  {activeTab === 'overview' && 'Dashboard'}
                  {activeTab === 'approval' && 'Approval Anggota'}
                  {activeTab === 'members' && 'Data Anggota'}
                  {activeTab === 'profile' && 'Manajemen Profil Organisasi'}
                  {activeTab === 'slider' && 'Manajemen Slider Beranda'}
                  {activeTab === 'media' && 'Manajemen Media & Video'}
                  {activeTab === 'gallery' && 'Manajemen Galeri Foto'}
                  {activeTab === 'attendance' && 'Absensi Majelis'}
                  {activeTab === 'recap' && 'Rekapitulasi Laporan'}
                  {activeTab === 'news' && 'Manajemen Berita'}
                  {activeTab === 'settings' && 'Pengaturan Sistem'}
                  {activeTab === 'backup' && 'Backup & Restore Data'}
                  <span className="text-xs text-gray-500 ml-2">Version 2.0</span>
               </h1>
            </div>
         </div>

         <div className="px-6 pb-6 flex-grow">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 {/* Overview Cards */}
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#00c0ef] flex items-center justify-center text-white"><Settings size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">ANGGOTA AKTIF</span><span className="block text-lg font-bold text-[#333]">{activeMembersCount}</span></div>
                 </div>
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#dd4b39] flex items-center justify-center text-white"><AlertCircle size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">PENDING</span><span className="block text-lg font-bold text-[#333]">{pendingCount}</span></div>
                 </div>
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#00a65a] flex items-center justify-center text-white"><Calendar size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">TOTAL SESI</span><span className="block text-lg font-bold text-[#333]">{totalSessions}</span></div>
                 </div>
                 <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                    <div className="w-[90px] h-full bg-[#f39c12] flex items-center justify-center text-white"><Users size={40} /></div>
                    <div className="px-4 flex-grow"><span className="block text-xs uppercase font-bold text-[#333]">TOTAL BERITA</span><span className="block text-lg font-bold text-[#333]">{totalNews}</span></div>
                 </div>
              </div>
            )}

            {/* Approval Tab (Restored) */}
            {activeTab === 'approval' && (
               <div className="bg-white border-t-[3px] border-[#00c0ef] shadow-sm rounded-sm">
                  <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Permohonan Anggota Baru</h3></div>
                  <div className="p-0">
                     {registrations.length === 0 ? <div className="p-4 text-center text-gray-500">Tidak ada permohonan baru.</div> : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                 <tr><th className="px-4 py-3 border-b">Nama</th><th className="px-4 py-3 border-b">NIK</th><th className="px-4 py-3 border-b">Kontak</th><th className="px-4 py-3 border-b">Wilayah</th><th className="px-4 py-3 border-b text-right">Aksi</th></tr>
                              </thead>
                              <tbody>
                                 {registrations.map(reg => (
                                    <tr key={reg.id} className="hover:bg-gray-50 border-b last:border-0">
                                       <td className="px-4 py-3 font-bold text-[#333]">{reg.name}</td>
                                       <td className="px-4 py-3 font-mono text-sm text-gray-600">{reg.nik}</td>
                                       <td className="px-4 py-3 text-sm">{reg.phone}<br/><span className="text-gray-400 text-xs">{reg.email}</span></td>
                                       <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200 text-gray-600">{reg.wilayah}</span></td>
                                       <td className="px-4 py-3 text-right">
                                          <div className="flex justify-end gap-2">
                                             <button onClick={() => approveMember(reg.id)} className="bg-[#00a65a] text-white px-2 py-1 rounded-sm text-xs font-bold hover:bg-[#008d4c] shadow-sm">Terima</button>
                                             <button onClick={() => rejectMember(reg.id)} className="bg-[#dd4b39] text-white px-2 py-1 rounded-sm text-xs font-bold hover:bg-[#d73925] shadow-sm">Tolak</button>
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

            {/* Attendance Tab (Restored) */}
            {activeTab === 'attendance' && (
               <div className="space-y-6">
                  {!viewingSession ? (
                     <>
                        {/* Create Session Form */}
                        <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm rounded-sm">
                           <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Buat Sesi Absensi Baru</h3></div>
                           <div className="p-4">
                              <form onSubmit={handleCreateSession} className="flex gap-4">
                                 <input type="text" placeholder="Nama Kegiatan (Misal: Rutinan Malam Jumat)" className="flex-1 px-4 py-2 border border-gray-300 rounded-sm focus:border-[#00a65a] outline-none transition" value={newSessionName} onChange={e => setNewSessionName(e.target.value)} required />
                                 <button type="submit" className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2"><Plus size={16} /> Buat Sesi</button>
                              </form>
                           </div>
                        </div>

                        {/* Session List */}
                        <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm">
                           <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Daftar Sesi Absensi</h3></div>
                           <div className="p-0">
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                       <tr><th className="px-4 py-3 border-b">Tanggal</th><th className="px-4 py-3 border-b">Nama Kegiatan</th><th className="px-4 py-3 border-b text-center">Status</th><th className="px-4 py-3 border-b text-center">Hadir</th><th className="px-4 py-3 border-b text-right">Aksi</th></tr>
                                    </thead>
                                    <tbody>
                                       {attendanceSessions.map(session => (
                                          <tr key={session.id} className="hover:bg-gray-50 border-b last:border-0">
                                             <td className="px-4 py-3 text-gray-600 w-32"><div className="flex items-center gap-2"><Calendar size={14} /> {session.date}</div></td>
                                             <td className="px-4 py-3 font-bold text-[#333]">{session.name}</td>
                                             <td className="px-4 py-3 text-center">
                                                <button onClick={() => toggleSession(session.id)} className={`px-2 py-1 rounded text-xs font-bold uppercase transition ${session.isOpen ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                                   {session.isOpen ? 'DIBUKA' : 'DITUTUP'}
                                                </button>
                                             </td>
                                             <td className="px-4 py-3 text-center font-mono font-bold text-[#3c8dbc]">{session.attendees.length}</td>
                                             <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                   <button onClick={() => setViewingSession(session)} className="bg-[#3c8dbc] text-white p-1.5 rounded-sm hover:bg-[#367fa9] shadow-sm" title="Lihat Data"><ListIcon size={16} /></button>
                                                   <button onClick={() => handleEditSession(session)} className="bg-[#f39c12] text-white p-1.5 rounded-sm hover:bg-[#e08e0b] shadow-sm" title="Edit Nama"><Edit3 size={16} /></button>
                                                   <button onClick={() => downloadSessionReport(session)} className="bg-[#00a65a] text-white p-1.5 rounded-sm hover:bg-[#008d4c] shadow-sm" title="Download Excel"><Download size={16} /></button>
                                                   <button onClick={() => handleDeleteSession(session.id, session.name)} className="bg-[#dd4b39] text-white p-1.5 rounded-sm hover:bg-[#d73925] shadow-sm" title="Hapus"><Trash2 size={16} /></button>
                                                </div>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </div>
                     </>
                  ) : (
                     /* Session Detail View */
                     <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm animate-fade-in-up">
                         {/* Header with Back button */}
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
                               <div className="flex bg-gray-100 p-1 rounded-sm border border-gray-200">
                                  <button onClick={() => setAttendanceViewMode('list')} className={`p-1 rounded-sm transition ${attendanceViewMode === 'list' ? 'bg-white shadow-sm text-[#3c8dbc]' : 'text-gray-500 hover:text-gray-700'}`}><ListIcon size={16} /></button>
                                  <button onClick={() => setAttendanceViewMode('grid')} className={`p-1 rounded-sm transition ${attendanceViewMode === 'grid' ? 'bg-white shadow-sm text-[#3c8dbc]' : 'text-gray-500 hover:text-gray-700'}`}><Grid size={16} /></button>
                               </div>
                            </div>
                         </div>
                         
                         {/* List/Grid View Logic */}
                         <div className="p-4 bg-gray-50 min-h-[300px]">
                            {getFilteredAttendance().length === 0 ? (
                               <div className="text-center py-10 text-gray-400">Belum ada data absensi yang sesuai.</div>
                            ) : attendanceViewMode === 'list' ? (
                               <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                                  <div className="overflow-x-auto">
                                      <table className="w-full text-left">
                                         <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                            <tr><th className="px-4 py-3 border-b">Waktu</th><th className="px-4 py-3 border-b">Nama</th><th className="px-4 py-3 border-b">Lokasi</th><th className="px-4 py-3 border-b text-right">Foto</th><th className="px-4 py-3 border-b text-right">Aksi</th></tr>
                                         </thead>
                                         <tbody>
                                            {getFilteredAttendance().map(record => (
                                               <tr key={record.id} className="hover:bg-gray-50 border-b last:border-0 text-sm">
                                                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{record.timestamp.split(',')[1]}</td>
                                                  <td className="px-4 py-3 font-bold text-[#333]">{record.userName}</td>
                                                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{record.location}</td>
                                                  <td className="px-4 py-3 text-right">
                                                     <button onClick={() => setPreviewImage(record.photoUrl)} className="text-[#3c8dbc] hover:underline text-xs flex items-center justify-end gap-1"><ImageIcon size={12} /> Lihat Foto</button>
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                      <div className="flex justify-end gap-2">
                                                         <button onClick={() => handleEditRecord(record)} className="text-amber-500 hover:text-amber-600 p-1"><Edit3 size={14}/></button>
                                                         <button onClick={() => handleDeleteRecord(record)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={14}/></button>
                                                      </div>
                                                  </td>
                                               </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                  </div>
                               </div>
                            ) : (
                               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                  {getFilteredAttendance().map(record => (
                                     <div key={record.id} className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                                        <div className="aspect-square bg-gray-100 relative cursor-pointer" onClick={() => setPreviewImage(record.photoUrl)}>
                                           <img src={record.photoUrl} alt={record.userName} className="w-full h-full object-cover" />
                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                              <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                                           </div>
                                        </div>
                                        <div className="p-3">
                                           <h4 className="font-bold text-[#333] text-sm truncate" title={record.userName}>{record.userName}</h4>
                                           <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={10} /> {record.timestamp.split(',')[1]}</p>
                                           <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-100">
                                              <button onClick={() => handleEditRecord(record)} className="text-xs text-amber-600 font-bold hover:underline">Edit</button>
                                              <button onClick={() => handleDeleteRecord(record)} className="text-xs text-red-600 font-bold hover:underline">Hapus</button>
                                           </div>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'news' && (
               <div className="space-y-6">
                 {/* ... News UI (Existing code) ... */}
                 <div ref={formRef} className={`bg-white border-t-[3px] ${editingNewsId ? 'border-[#f39c12]' : 'border-[#dd4b39]'} shadow-sm rounded-sm`}>
                    <div className="px-4 py-3 border-b border-[#f4f4f4] flex justify-between items-center">
                       <h3 className="text-lg font-normal text-[#333]">{editingNewsId ? 'Edit Berita' : 'Tulis Berita Baru'}</h3>
                       {editingNewsId && <button onClick={handleCancelEditNews} className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1"><X size={14} /> Batal Edit</button>}
                    </div>
                    <div className="p-4">
                       <form onSubmit={handleNewsSubmit} className="space-y-4">
                          <input type="text" placeholder="Judul Berita" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none transition text-lg" required value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />
                          <div className="p-4 border border-gray-300 rounded-sm bg-gray-50">
                             <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Upload Sampul Berita (Cover)</label>
                             <div className="flex items-center gap-4">
                                <div className="w-32 h-24 bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 rounded">
                                   {newsForm.imageUrl ? <img src={newsForm.imageUrl} alt="Cover" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-400" />}
                                </div>
                                <div className="flex-1">
                                   <input type="file" accept="image/*" ref={newsCoverInputRef} onChange={handleNewsCoverUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#3c8dbc] file:text-white hover:file:bg-[#367fa9]" />
                                   <p className="text-[10px] text-gray-500 mt-1">Gambar ini akan menjadi thumbnail. Jangan masukkan gambar yang sama di editor jika tidak ingin muncul dua kali.</p>
                                </div>
                             </div>
                          </div>
                          <div className="border border-gray-300 rounded-sm">
                             <div className="bg-[#f0f0f0] border-b border-gray-300 p-2 flex flex-wrap gap-1">
                                <button type="button" onClick={() => execCmd('bold')} className="p-1 hover:bg-gray-200 rounded"><Bold size={16} /></button>
                                <button type="button" onClick={() => execCmd('italic')} className="p-1 hover:bg-gray-200 rounded"><Italic size={16} /></button>
                                <button type="button" onClick={() => execCmd('underline')} className="p-1 hover:bg-gray-200 rounded"><Underline size={16} /></button>
                                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1 hover:bg-gray-200 rounded"><ImageIcon size={16} /></button>
                                <button type="button" onClick={handleInsertTable} className="p-1 hover:bg-gray-200 rounded"><Table size={16} /></button>
                                <input type="file" ref={imageInputRef} onChange={handleEditorImageUpload} accept="image/*" className="hidden" />
                                <input type="file" ref={videoInputRef} onChange={handleEditorVideoUpload} accept="video/*" className="hidden" />
                             </div>
                             <div ref={editorRef} contentEditable className="min-h-[300px] p-4 outline-none prose max-w-none bg-white [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg" onInput={(e) => setNewsForm({...newsForm, content: e.currentTarget.innerHTML})} ></div>
                          </div>
                          <textarea placeholder="Ringkasan Singkat (Excerpt)" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none h-20 text-sm" required value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})}></textarea>
                          <div className="flex justify-end gap-2">
                             <button type="submit" className={`${editingNewsId ? 'bg-[#f39c12] hover:bg-[#e08e0b]' : 'bg-[#3c8dbc] hover:bg-[#367fa9]'} text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2`}>
                                {editingNewsId ? <><Save size={16} /> Simpan Perubahan</> : 'Publish Berita'}
                             </button>
                          </div>
                       </form>
                    </div>
                 </div>
                 <div className="bg-white border-t-[3px] border-[#00c0ef] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Daftar Berita</h3></div>
                    <div className="p-0">
                       <table className="w-full text-left">
                          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                             <tr><th className="px-4 py-3 border-b">Berita</th><th className="px-4 py-3 border-b w-48">Tanggal</th><th className="px-4 py-3 border-b text-right w-32">Aksi</th></tr>
                          </thead>
                          <tbody>
                             {news.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 border-b last:border-0 group">
                                   <td className="px-4 py-3">
                                      <div className="flex gap-4">
                                         <img src={item.imageUrl} alt="" className="w-16 h-16 object-cover rounded shadow-sm" />
                                         <div><h4 className="font-bold text-[#333] line-clamp-1">{item.title}</h4><p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.excerpt}</p></div>
                                      </div>
                                   </td>
                                   <td className="px-4 py-3 text-sm text-gray-600"><div className="flex items-center gap-2"><Calendar size={14} /> {item.date}</div></td>
                                   <td className="px-4 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                         <button onClick={() => handleEditNews(item)} className="bg-[#f39c12] hover:bg-[#db8b0b] text-white p-2 rounded-sm shadow-sm transition"><Edit3 size={16} /></button>
                                         <button onClick={() => handleDeleteNews(item.id)} className="bg-[#dd4b39] hover:bg-[#c23321] text-white p-2 rounded-sm shadow-sm transition"><Trash2 size={16} /></button>
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

            {/* Slider Management Tab */}
            {activeTab === 'slider' && (
               <div className="space-y-6">
                 <div className="bg-white border-t-[3px] border-[#605ca8] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Tambah Slide Halaman Utama</h3></div>
                    <div className="p-4">
                       <form onSubmit={handleSliderSubmit} className="space-y-4">
                          <div className="flex flex-col md:flex-row gap-4">
                             <div className="w-full md:w-1/3">
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Gambar Banner (Landscape)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-sm p-4 text-center hover:bg-gray-50 transition cursor-pointer relative" onClick={() => sliderInputRef.current?.click()}>
                                   {sliderForm.imageUrl ? <img src={sliderForm.imageUrl} alt="Preview" className="max-h-40 mx-auto object-cover w-full" /> : <div className="py-8 text-gray-400"><ImageIcon size={32} className="mx-auto mb-2" /><span className="text-xs">Klik untuk pilih gambar</span></div>}
                                   <input type="file" ref={sliderInputRef} onChange={handleSliderImageUpload} accept="image/*" className="hidden" />
                                </div>
                             </div>
                             <div className="w-full md:w-2/3 flex flex-col gap-4">
                                <div>
                                   <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Judul Utama (Headline)</label>
                                   <input type="text" placeholder="Contoh: BERKHIDMAT UNTUK UMAT" className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#605ca8] outline-none" value={sliderForm.title} onChange={e => setSliderForm({...sliderForm, title: e.target.value})} />
                                </div>
                                <div>
                                   <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Deskripsi Singkat (Sub-heading)</label>
                                   <input type="text" placeholder="Contoh: Mari bergabung bersama kami..." className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#605ca8] outline-none" value={sliderForm.description} onChange={e => setSliderForm({...sliderForm, description: e.target.value})} />
                                </div>
                                <div className="flex justify-end mt-2">
                                   <button type="submit" className="bg-[#605ca8] hover:bg-[#4b478d] text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2"><Upload size={16} /> Tambah Slide</button>
                                </div>
                             </div>
                          </div>
                       </form>
                    </div>
                 </div>
                 
                 <div className="bg-white border-t-[3px] border-[#00c0ef] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Daftar Slide Aktif</h3></div>
                    <div className="p-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sliders.map(item => (
                             <div key={item.id} className="group relative border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition">
                                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                                        <h4 className="text-white font-bold text-lg">{item.title}</h4>
                                        <p className="text-white/80 text-sm">{item.description}</p>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button onClick={() => deleteSliderItem(item.id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"><Trash2 size={16} /></button>
                                </div>
                             </div>
                          ))}
                       </div>
                       {sliders.length === 0 && <div className="p-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded"><ImageIcon size={48} className="mx-auto mb-2 opacity-20" />Belum ada slide. Halaman depan akan menggunakan tampilan default.</div>}
                    </div>
                 </div>
               </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
               <div className="space-y-6">
                 <div className="bg-white border-t-[3px] border-[#605ca8] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Upload Foto Galeri</h3></div>
                    <div className="p-4">
                       <form onSubmit={handleGallerySubmit} className="space-y-4">
                          <div className="flex flex-col md:flex-row gap-4">
                             <div className="w-full md:w-1/3">
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">File Gambar</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-sm p-4 text-center hover:bg-gray-50 transition cursor-pointer relative" onClick={() => galleryInputRef.current?.click()}>
                                   {galleryForm.imageUrl ? <img src={galleryForm.imageUrl} alt="Preview" className="max-h-40 mx-auto object-contain" /> : <div className="py-8 text-gray-400"><ImageIcon size={32} className="mx-auto mb-2" /><span className="text-xs">Klik untuk pilih foto</span></div>}
                                   <input type="file" ref={galleryInputRef} onChange={handleGalleryImageUpload} accept="image/*" className="hidden" />
                                </div>
                             </div>
                             <div className="w-full md:w-2/3 flex flex-col justify-between">
                                <div>
                                   <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Judul / Caption</label>
                                   <input type="text" placeholder="Kegiatan majelis di..." className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#605ca8] outline-none" required value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} />
                                </div>
                                <div className="flex justify-end mt-4">
                                   <button type="submit" className="bg-[#605ca8] hover:bg-[#4b478d] text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2"><Upload size={16} /> Upload Foto</button>
                                </div>
                             </div>
                          </div>
                       </form>
                    </div>
                 </div>
                 <div className="bg-white border-t-[3px] border-[#00c0ef] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Daftar Galeri</h3></div>
                    <div className="p-4">
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {gallery.map(item => (
                             <div key={item.id} className="group relative border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition">
                                <div className="aspect-square bg-gray-100 overflow-hidden"><img src={item.url} alt={item.caption} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" /></div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"><button onClick={() => deleteGalleryItem(item.id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"><Trash2 size={16} /></button></div>
                                <div className="p-2 text-xs text-gray-600 truncate bg-white border-t border-gray-100">{item.caption}</div>
                             </div>
                          ))}
                       </div>
                       {gallery.length === 0 && <div className="p-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded"><ImageIcon size={48} className="mx-auto mb-2 opacity-20" />Belum ada foto di galeri.</div>}
                    </div>
                 </div>
               </div>
            )}

            {/* Media Tab (Restored) */}
            {activeTab === 'media' && (
               <div className="space-y-6">
                  {/* Add Media Form */}
                  <div className="bg-white border-t-[3px] border-[#605ca8] shadow-sm rounded-sm">
                     <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Tambah Media</h3></div>
                     <div className="p-4">
                        <form onSubmit={handleAddMedia} className="flex flex-col md:flex-row gap-4">
                           <select className="px-3 py-2 border border-gray-300 rounded-sm bg-white" value={mediaForm.type} onChange={(e: any) => setMediaForm({...mediaForm, type: e.target.value})}>
                              <option value="youtube">YouTube</option>
                              <option value="instagram">Instagram</option>
                           </select>
                           <input type="text" placeholder="URL Video / Post" className="flex-1 px-3 py-2 border border-gray-300 rounded-sm" value={mediaForm.url} onChange={e => setMediaForm({...mediaForm, url: e.target.value})} required />
                           <input type="text" placeholder="Caption / Judul" className="flex-1 px-3 py-2 border border-gray-300 rounded-sm" value={mediaForm.caption} onChange={e => setMediaForm({...mediaForm, caption: e.target.value})} />
                           <button type="submit" className="bg-[#605ca8] text-white px-6 py-2 rounded-sm font-bold flex items-center gap-2"><Plus size={16} /> Tambah</button>
                        </form>
                     </div>
                  </div>
                  {/* Media List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {mediaPosts.map(post => (
                        <div key={post.id} className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden relative group">
                           {/* Iframe Logic */}
                           <div className="relative pt-[56.25%] bg-black">
                              <iframe src={post.embedUrl} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                           </div>
                           <div className="p-4">
                              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase text-gray-500">
                                 {post.type === 'youtube' ? <Youtube size={14} className="text-red-600" /> : <Instagram size={14} className="text-pink-600" />}
                                 {post.type}
                              </div>
                              <p className="font-bold text-[#333] line-clamp-2">{post.caption || 'Tanpa Judul'}</p>
                           </div>
                           <button onClick={() => deleteMediaPost(post.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"><Trash2 size={16} /></button>
                        </div>
                     ))}
                  </div>
                  {mediaPosts.length === 0 && <div className="p-10 text-center text-gray-400">Belum ada media yang ditambahkan.</div>}
               </div>
            )}

            {activeTab === 'members' && (
               <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm">
                  <div className="px-4 py-3 border-b border-[#f4f4f4] flex flex-col sm:flex-row justify-between items-center gap-4">
                     <h3 className="text-lg font-normal text-[#333]">Data Anggota Aktif</h3>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input type="text" placeholder="Cari Nama / NIA..." className="px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#3c8dbc] w-full sm:w-64" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
                        <button className="bg-gray-100 p-2 rounded-sm border border-gray-300 text-gray-600"><Search size={16} /></button>
                     </div>
                  </div>
                  <div className="p-0">
                     {filteredMembers.length === 0 ? <div className="p-10 text-center text-gray-500">Data anggota tidak ditemukan.</div> : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                 <tr><th className="px-4 py-3 border-b w-10">No</th><th className="px-4 py-3 border-b">Identitas Anggota</th><th className="px-4 py-3 border-b">Kontak & Alamat</th><th className="px-4 py-3 border-b">Wilayah</th><th className="px-4 py-3 border-b text-right w-40">Aksi</th></tr>
                              </thead>
                              <tbody>
                                 {filteredMembers.map((member, idx) => (
                                    <tr key={member.id} className="hover:bg-gray-50 border-b last:border-0">
                                       <td className="px-4 py-3 text-gray-500 text-center">{idx + 1}</td>
                                       <td className="px-4 py-3">
                                          <div className="font-bold text-[#333]">{member.name}</div>
                                          <div className="flex flex-col gap-1 mt-1">
                                             <div className="text-xs text-[#3c8dbc] font-mono bg-blue-50 inline-block px-1 rounded border border-blue-100 w-fit">NIA: {member.nia}</div>
                                             {/* NIK Display */}
                                             <div className="text-xs text-gray-600 font-mono bg-gray-50 inline-block px-1 rounded border border-gray-200 w-fit" title="Nomor Induk Kependudukan">
                                                NIK: {member.nik || '-'}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-4 py-3 text-sm"><div className="flex items-center gap-1 text-gray-600"><Phone size={12} /> {member.phone || '-'}</div><div className="text-xs text-gray-500 mt-1 max-w-xs">{member.address || '-'}</div></td>
                                       <td className="px-4 py-3 text-sm"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs border border-gray-200">{member.wilayah}</span></td>
                                       <td className="px-4 py-3 text-right">
                                          <div className="flex justify-end gap-2">
                                             <button onClick={() => handleEditMember(member)} className="bg-amber-50 hover:bg-amber-100 text-amber-600 p-1.5 rounded-sm border border-amber-200 transition" title="Edit Anggota"><Edit3 size={14} /></button>
                                             <button onClick={() => handleResetPassword(member.id, member.name)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-sm border border-gray-300 transition" title="Reset Password (12345678)"><Key size={14} /></button>
                                             <button onClick={() => handleDeleteMember(member.id, member.name)} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-sm border border-red-200 transition" title="Hapus Anggota Permanen"><Trash2 size={14} /></button>
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

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                 <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-lg font-normal text-[#333]">Edit Menu & Sub-Menu Profil</h3>
                        <div className="flex gap-2 flex-wrap">
                            {['sejarah', 'pengurus', 'korwil', 'amaliyah', 'tentang-kami'].map(slug => (
                                <button key={slug} onClick={() => setSelectedProfileSlug(slug)} className={`px-3 py-1 text-sm rounded-sm font-bold transition uppercase ${selectedProfileSlug === slug ? 'bg-[#3c8dbc] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                   {slug === 'sejarah' ? 'Sejarah' : slug === 'pengurus' ? 'Pengurus' : slug === 'korwil' ? 'Daftar Korwil' : slug === 'amaliyah' ? 'Amaliyah' : 'Tentang Kami (Beranda)'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4">
                       <div className="mb-4">
                          <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Judul Halaman (Tampil di Menu Website)</label>
                          <div className="flex gap-2">
                              <div className="bg-gray-100 p-2 rounded-l-sm border border-r-0 border-gray-300 text-gray-500"><Edit3 size={18} /></div>
                              <input type="text" value={profileTitle} onChange={(e) => setProfileTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-r-sm focus:border-[#3c8dbc] outline-none font-bold text-[#333]" placeholder="Contoh: Sejarah Berdirinya JASNU" />
                          </div>
                       </div>
                       
                       {/* CONDITIONAL RENDER: KORWIL TABLE EDITOR vs RICH TEXT EDITOR */}
                       {selectedProfileSlug === 'korwil' ? (
                          <div className="border border-gray-300 rounded-sm bg-gray-50/50 p-6">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-primary-900 font-bold text-lg flex items-center gap-2">
                                  <Table className="text-primary-600" size={20} /> 
                                  Manajemen Tabel Koordinator
                                </h4>
                                <span className="text-xs text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
                                  Total: {korwilRows.length} Baris
                                </span>
                              </div>

                              {/* Input Row for New Data */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-primary-100">
                                  <div className="md:col-span-3">
                                      <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Wilayah / Jabatan</label>
                                      <input 
                                        type="text" 
                                        placeholder="Contoh: Kalirungkut" 
                                        className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary-500 outline-none text-sm"
                                        value={newKorwilRow.wilayah}
                                        onChange={(e) => setNewKorwilRow({...newKorwilRow, wilayah: e.target.value})}
                                      />
                                  </div>
                                  <div className="md:col-span-4">
                                      <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Nama Koordinator</label>
                                      <input 
                                        type="text" 
                                        placeholder="Nama Lengkap" 
                                        className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary-500 outline-none text-sm"
                                        value={newKorwilRow.nama}
                                        onChange={(e) => setNewKorwilRow({...newKorwilRow, nama: e.target.value})}
                                      />
                                  </div>
                                  <div className="md:col-span-3">
                                      <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Kontak / Keterangan</label>
                                      <input 
                                        type="text" 
                                        placeholder="No. HP / Ket." 
                                        className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary-500 outline-none text-sm"
                                        value={newKorwilRow.kontak}
                                        onChange={(e) => setNewKorwilRow({...newKorwilRow, kontak: e.target.value})}
                                      />
                                  </div>
                                  <div className="md:col-span-2 flex items-end">
                                      <button 
                                        onClick={handleAddKorwilRow}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
                                      >
                                          <Plus size={16} /> Tambah
                                      </button>
                                  </div>
                              </div>

                              {/* Interactive Table View */}
                              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-neutral-100 text-neutral-600 uppercase text-xs font-bold">
                                          <tr>
                                              <th className="px-4 py-3 border-b border-neutral-200">Wilayah</th>
                                              <th className="px-4 py-3 border-b border-neutral-200">Nama</th>
                                              <th className="px-4 py-3 border-b border-neutral-200">Kontak</th>
                                              <th className="px-4 py-3 border-b border-neutral-200 text-right">Aksi</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-neutral-100">
                                          {korwilRows.length === 0 ? (
                                              <tr>
                                                  <td colSpan={4} className="p-8 text-center text-neutral-400 italic">
                                                      Belum ada data. Silakan tambahkan baris baru di atas.
                                                  </td>
                                              </tr>
                                          ) : (
                                              korwilRows.map((row, idx) => (
                                                  <tr key={idx} className="hover:bg-neutral-50 group transition">
                                                      <td className="px-4 py-3 font-medium text-primary-900">
                                                          <input 
                                                            className="bg-transparent border-none focus:ring-0 p-0 w-full font-bold text-primary-900" 
                                                            value={row.wilayah} 
                                                            onChange={(e) => handleUpdateKorwilRow(idx, 'wilayah', e.target.value)} 
                                                          />
                                                      </td>
                                                      <td className="px-4 py-3">
                                                          <input 
                                                            className="bg-transparent border-none focus:ring-0 p-0 w-full" 
                                                            value={row.nama} 
                                                            onChange={(e) => handleUpdateKorwilRow(idx, 'nama', e.target.value)} 
                                                          />
                                                      </td>
                                                      <td className="px-4 py-3 text-neutral-500">
                                                          <input 
                                                            className="bg-transparent border-none focus:ring-0 p-0 w-full font-mono text-xs" 
                                                            value={row.kontak} 
                                                            onChange={(e) => handleUpdateKorwilRow(idx, 'kontak', e.target.value)} 
                                                          />
                                                      </td>
                                                      <td className="px-4 py-3 text-right">
                                                          <button 
                                                            onClick={() => handleDeleteKorwilRow(idx)}
                                                            className="text-neutral-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                                          >
                                                              <Trash2 size={14} />
                                                          </button>
                                                      </td>
                                                  </tr>
                                              ))
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                              <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                                  <AlertCircle size={12} />
                                  Tips: Anda bisa mengedit langsung teks pada tabel di atas sebelum menyimpan.
                              </p>
                          </div>
                       ) : (
                          // STANDARD RICH TEXT EDITOR FOR OTHER PAGES
                          <div className="border border-gray-300 rounded-sm">
                               <div className="bg-[#f0f0f0] border-b border-gray-300 p-2 flex flex-wrap gap-1">
                                  <button type="button" onClick={() => execCmd('bold')} className="p-1 hover:bg-gray-200 rounded"><Bold size={16} /></button>
                                  <button type="button" onClick={() => execCmd('italic')} className="p-1 hover:bg-gray-200 rounded"><Italic size={16} /></button>
                                  <button type="button" onClick={() => execCmd('underline')} className="p-1 hover:bg-gray-200 rounded"><Underline size={16} /></button>
                                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                  <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1 hover:bg-gray-200 rounded"><List size={16} /></button>
                                  <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1 hover:bg-gray-200 rounded"><ListOrdered size={16} /></button>
                                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                  <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1 hover:bg-gray-200 rounded"><ImageIcon size={16} /></button>
                                  <button type="button" onClick={handleInsertTable} className="p-1 hover:bg-gray-200 rounded flex items-center gap-1"><Table size={16} /></button>
                                  <input type="file" ref={imageInputRef} onChange={handleEditorImageUpload} accept="image/*" className="hidden" />
                               </div>
                               <div ref={editorRef} contentEditable className="min-h-[400px] p-4 outline-none prose max-w-none bg-white [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg" onInput={(e) => setProfileContent(e.currentTarget.innerHTML)}></div>
                          </div>
                       )}

                       <div className="flex justify-end mt-4"><button onClick={handleSaveProfile} className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2"><Save size={18} /> Simpan Perubahan Halaman</button></div>
                    </div>
                 </div>
               </div>
            )}
            
            {/* Recap Tab (Restored) */}
            {activeTab === 'recap' && (
               <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm rounded-sm p-8 text-center">
                  <FileSpreadsheet size={64} className="mx-auto text-[#00a65a] mb-4" />
                  <h2 className="text-2xl font-normal text-[#333] mb-2">Rekapitulasi Laporan</h2>
                  <p className="text-gray-500 mb-8">Unduh laporan data anggota atau absensi dalam format Excel (.xlsx)</p>
                  
                  <div className="flex justify-center gap-4 mb-6">
                     <button onClick={() => setRecapType('attendance')} className={`px-4 py-2 rounded-sm border ${recapType === 'attendance' ? 'bg-[#00a65a] text-white border-[#00a65a]' : 'bg-white text-gray-600 border-gray-300'}`}>Laporan Absensi</button>
                     <button onClick={() => setRecapType('members')} className={`px-4 py-2 rounded-sm border ${recapType === 'members' ? 'bg-[#00a65a] text-white border-[#00a65a]' : 'bg-white text-gray-600 border-gray-300'}`}>Database Anggota</button>
                  </div>
                  
                  <button onClick={downloadReport} className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-8 py-3 rounded-sm font-bold text-lg shadow-md flex items-center gap-3 mx-auto">
                     <Download size={24} /> Download File Excel
                  </button>
               </div>
            )}

            {/* Settings Tab (Restored) */}
            {activeTab === 'settings' && (
               <div className="space-y-6">
                  <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm">
                     <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Identitas Aplikasi</h3></div>
                     <div className="p-4">
                        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">Nama Aplikasi</label>
                                 <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-sm" value={configForm.appName} onChange={e => setConfigForm({...configForm, appName: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">Nama Organisasi</label>
                                 <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-sm" value={configForm.orgName} onChange={e => setConfigForm({...configForm, orgName: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                                 <textarea className="w-full px-3 py-2 border border-gray-300 rounded-sm h-24" value={configForm.description} onChange={e => setConfigForm({...configForm, description: e.target.value})}></textarea>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Sekretariat</label>
                                 <textarea className="w-full px-3 py-2 border border-gray-300 rounded-sm h-20" value={configForm.address} onChange={e => setConfigForm({...configForm, address: e.target.value})}></textarea>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-sm" value={configForm.email} onChange={e => setConfigForm({...configForm, email: e.target.value})} />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">No. Telepon</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-sm" value={configForm.phone} onChange={e => setConfigForm({...configForm, phone: e.target.value})} />
                                 </div>
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">Logo URL (Upload)</label>
                                 <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 border border-gray-300 p-1 bg-gray-50 rounded-sm">
                                       <img src={configForm.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500" />
                                 </div>
                              </div>
                              <div className="flex justify-end pt-4">
                                 <button type="submit" className="bg-[#3c8dbc] text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2"><Save size={16} /> Simpan Pengaturan</button>
                              </div>
                           </div>
                        </form>
                     </div>
                  </div>

                  <div className="bg-white border-t-[3px] border-[#f39c12] shadow-sm rounded-sm">
                     <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Manajemen Wilayah (Korwil)</h3></div>
                     <div className="p-4">
                        <form onSubmit={handleAddKorwil} className="flex gap-2 mb-6 max-w-md">
                           <input type="text" placeholder="Nama Wilayah Baru" className="flex-1 px-3 py-2 border border-gray-300 rounded-sm" value={newKorwilName} onChange={e => setNewKorwilName(e.target.value)} />
                           <button type="submit" className="bg-[#f39c12] text-white px-4 py-2 rounded-sm font-bold"><Plus size={16} /></button>
                        </form>
                        <div className="flex flex-wrap gap-2">
                           {displayKorwils.map(k => (
                              <div key={k.id || k.name} className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200 text-sm flex items-center gap-2 group">
                                 {k.name}
                                 {/* Only show delete for DB items (have id) */}
                                 {k.id && (
                                    <button onClick={() => handleDeleteKorwil(k.id, k.name)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Backup Tab (Restored) */}
            {activeTab === 'backup' && (
               <div className="bg-white border-t-[3px] border-[#f39c12] shadow-sm rounded-sm p-8 text-center max-w-2xl mx-auto mt-10">
                  <Database size={64} className="mx-auto text-[#f39c12] mb-4" />
                  <h2 className="text-2xl font-normal text-[#333] mb-2">Backup & Restore Database</h2>
                  <p className="text-gray-500 mb-8">
                     Fitur ini memungkinkan Anda untuk mengunduh seluruh data aplikasi (JSON) sebagai cadangan, 
                     atau memulihkan data dari file cadangan sebelumnya.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-6 border border-gray-200 rounded-sm bg-gray-50">
                        <h4 className="font-bold text-gray-700 mb-2">Backup Data</h4>
                        <p className="text-xs text-gray-500 mb-4">Unduh semua data ke komputer Anda.</p>
                        <button onClick={handleBackup} className="w-full bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-4 py-2 rounded-sm font-bold flex items-center justify-center gap-2">
                           <Download size={16} /> Download Backup
                        </button>
                     </div>
                     <div className="p-6 border border-gray-200 rounded-sm bg-gray-50">
                        <h4 className="font-bold text-gray-700 mb-2">Restore Data</h4>
                        <p className="text-xs text-gray-500 mb-4">Upload file backup (.json) untuk memulihkan.</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                        <button onClick={handleRestoreClick} className="w-full bg-[#dd4b39] hover:bg-[#c23321] text-white px-4 py-2 rounded-sm font-bold flex items-center justify-center gap-2">
                           <Upload size={16} /> Upload & Restore
                        </button>
                     </div>
                  </div>
                  <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 text-sm border border-yellow-100 rounded text-left flex gap-3">
                     <AlertTriangle size={20} className="flex-shrink-0" />
                     <div>
                        <strong>Peringatan Penting:</strong> Proses Restore akan <u>menghapus seluruh data saat ini</u> dan menggantinya dengan data dari file backup. Pastikan Anda melakukan backup data saat ini terlebih dahulu sebelum melakukan restore.
                     </div>
                  </div>
               </div>
            )}

         </div>
      </main>

      {/* --- Image Preview Modal --- */}
      {previewImage && (
         <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-4xl max-h-[90vh]">
               <img src={previewImage} className="max-w-full max-h-[90vh] rounded shadow-2xl" alt="Preview" />
               <button onClick={() => setPreviewImage(null)} className="absolute -top-4 -right-4 bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-100"><X size={24} /></button>
            </div>
         </div>
      )}

      {/* --- Edit Member Modal (NEW) --- */}
      {editingMember && (
        <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-700 flex items-center gap-2"><Edit3 size={18} /> Edit Data Anggota</h3>
                 <button onClick={() => setEditingMember(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                 <div className="p-3 bg-amber-50 text-amber-800 rounded text-sm mb-2 border border-amber-100 flex items-center gap-2">
                    <UserIcon size={16} />
                    <div>
                      <p className="font-bold">NIA: {editingMember.nia}</p>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Nama Lengkap</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3c8dbc] outline-none" value={editMemberForm.name} onChange={(e) => setEditMemberForm({...editMemberForm, name: e.target.value})} required />
                 </div>
                 
                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">NIK (Nomor Induk Kependudukan)</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3c8dbc] outline-none font-mono" value={editMemberForm.nik} onChange={(e) => setEditMemberForm({...editMemberForm, nik: e.target.value})} placeholder="16 digit NIK" />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">No. HP / WA</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3c8dbc] outline-none" value={editMemberForm.phone} onChange={(e) => setEditMemberForm({...editMemberForm, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Email</label>
                        <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3c8dbc] outline-none" value={editMemberForm.email} onChange={(e) => setEditMemberForm({...editMemberForm, email: e.target.value})} />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Wilayah (Korwil)</label>
                    {!isCustomWilayahEdit ? (
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3c8dbc] outline-none bg-white"
                            value={editMemberForm.wilayah}
                            onChange={(e) => {
                                if (e.target.value === 'Lainnya') {
                                    setIsCustomWilayahEdit(true);
                                    setEditMemberForm({...editMemberForm, wilayah: ''});
                                } else {
                                    setEditMemberForm({...editMemberForm, wilayah: e.target.value});
                                }
                            }}
                        >
                            <option value="">Pilih Wilayah</option>
                            {(korwils.length > 0 ? korwils : KORWIL_LIST.map((k,i) => ({id: i, name: k}))).map(k => (
                                <option key={k.id || k.name} value={k.name}>{k.name}</option>
                            ))}
                            <option value="Lainnya" className="font-bold">+ Lainnya (Manual)</option>
                        </select>
                    ) : (
                        <div className="flex gap-2">
                             <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3c8dbc] outline-none" value={editMemberForm.wilayah} onChange={(e) => setEditMemberForm({...editMemberForm, wilayah: e.target.value})} placeholder="Ketik nama wilayah..." autoFocus />
                             <button type="button" onClick={() => setIsCustomWilayahEdit(false)} className="text-red-500 hover:text-red-700 font-bold px-2">Batal</button>
                        </div>
                    )}
                 </div>

                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Alamat Lengkap</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3c8dbc] outline-none h-20 text-sm" value={editMemberForm.address} onChange={(e) => setEditMemberForm({...editMemberForm, address: e.target.value})}></textarea>
                 </div>

                 <div className="flex justify-end pt-4 border-t border-gray-100 gap-2">
                    <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded text-sm font-bold shadow-sm flex items-center gap-2"><Save size={16} /> Simpan Data</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- Edit Attendance Record Modal --- */}
      {editingRecord && (
        <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-700">Edit Data Absensi</h3>
                 <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveRecord} className="p-4 space-y-4">
                 <div className="p-3 bg-blue-50 text-blue-800 rounded text-sm mb-2 border border-blue-100">
                    <p className="font-bold">ID: {editingRecord.id}</p>
                    <p className="text-xs mt-1">Mengedit data absensi secara manual.</p>
                 </div>
                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Nama Anggota (Tampilan)</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none" value={editRecordForm.userName} onChange={(e) => setEditRecordForm({...editRecordForm, userName: e.target.value})} required />
                 </div>
                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Lokasi Tercatat</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none h-20 text-sm" value={editRecordForm.location} onChange={(e) => setEditRecordForm({...editRecordForm, location: e.target.value})} required></textarea>
                 </div>
                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Waktu Kehadiran</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm" value={editRecordForm.timestamp} onChange={(e) => setEditRecordForm({...editRecordForm, timestamp: e.target.value})} required />
                    <p className="text-[10px] text-gray-400 mt-1">Format: DD/MM/YYYY, HH.mm.ss</p>
                 </div>
                 <div className="flex justify-end pt-2 border-t border-gray-100 gap-2">
                    <button type="button" onClick={() => setEditingRecord(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded text-sm font-bold shadow-sm flex items-center gap-2"><Save size={16} /> Simpan Perubahan</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- Edit Session Modal --- */}
      {editingSession && (
        <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-700">Edit Nama Sesi</h3>
                 <button onClick={() => setEditingSession(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateSessionSubmit} className="p-4 space-y-4">
                 <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Nama Kegiatan</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#f39c12] outline-none" value={editSessionName} onChange={(e) => setEditSessionName(e.target.value)} required />
                 </div>
                 <div className="flex justify-end pt-2 border-t border-gray-100 gap-2">
                    <button type="button" onClick={() => setEditingSession(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white rounded text-sm font-bold shadow-sm flex items-center gap-2"><Save size={16} /> Simpan</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- Delete Session Confirmation Modal --- */}
      <AnimatePresence>
        {deleteSessionData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
             >
                <div className="p-6 text-center">
                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={32} className="text-red-600" />
                   </div>
                   <h3 className="text-xl font-serif font-bold text-neutral-900 mb-2">Hapus Sesi Absensi?</h3>
                   <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                      Anda akan menghapus sesi <span className="font-bold text-neutral-800">"{deleteSessionData.name}"</span>. 
                      <br/>
                      <span className="text-red-600 font-bold block mt-2">PERINGATAN: Semua data kehadiran anggota pada sesi ini akan hilang permanen!</span>
                   </p>
                   
                   <div className="flex gap-3">
                      <button 
                        onClick={() => setDeleteSessionData(null)}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                      >
                         Batal
                      </button>
                      <button 
                        onClick={confirmDeleteSession}
                        disabled={isDeletingSession}
                        className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                      >
                         {isDeletingSession ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Menghapus...
                            </>
                         ) : (
                            <>
                              <Trash2 size={18} />
                              Ya, Hapus
                            </>
                         )}
                      </button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Delete Member Confirmation Modal --- */}
      <AnimatePresence>
        {deleteMemberData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100"
             >
                <div className="p-6 text-center">
                   <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
                      <Trash2 size={32} className="text-red-500" />
                   </div>
                   <h3 className="text-xl font-serif font-bold text-neutral-900 mb-2">Hapus Anggota?</h3>
                   <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 text-left">
                       <p className="text-neutral-700 text-xs font-bold mb-1">Anggota yang akan dihapus:</p>
                       <p className="text-neutral-900 font-bold text-sm">{deleteMemberData.name}</p>
                   </div>
                   <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                      Tindakan ini tidak dapat dibatalkan. Semua data kehadiran dan akses akun anggota ini akan <strong>dihapus permanen</strong> dari database.
                   </p>
                   
                   <div className="flex gap-3">
                      <button 
                        onClick={() => setDeleteMemberData(null)}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                      >
                         Batal
                      </button>
                      <button 
                        onClick={confirmDeleteMember}
                        disabled={isDeletingMember}
                        className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                      >
                         {isDeletingMember ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Menghapus...
                            </>
                         ) : (
                            <>
                              <Trash2 size={18} />
                              Hapus Permanen
                            </>
                         )}
                      </button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Reset Password Confirmation Modal --- */}
      <AnimatePresence>
        {resetPasswordData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-amber-100"
             >
                <div className="p-6 text-center">
                   <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-inner">
                      <Key size={32} className="text-amber-500" />
                   </div>
                   <h3 className="text-xl font-serif font-bold text-neutral-900 mb-2">Reset Password?</h3>
                   <p className="text-neutral-500 text-sm mb-4 leading-relaxed">
                      Anda akan mereset password untuk akun:
                   </p>
                   <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 mb-4">
                       <p className="text-neutral-900 font-bold text-sm mb-1">{resetPasswordData.name}</p>
                       <p className="text-xs text-neutral-400">Password baru akan menjadi:</p>
                       <p className="text-lg font-mono font-bold text-amber-600 tracking-widest mt-1 bg-amber-50 inline-block px-2 rounded border border-amber-100">12345678</p>
                   </div>
                   
                   <div className="flex gap-3">
                      <button 
                        onClick={() => setResetPasswordData(null)}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                      >
                         Batal
                      </button>
                      <button 
                        onClick={confirmResetPassword}
                        disabled={isResettingPassword}
                        className="flex-1 py-3 px-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                      >
                         {isResettingPassword ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Memproses...
                            </>
                         ) : (
                            <>
                              <RefreshCcw size={18} />
                              Reset Password
                            </>
                         )}
                      </button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
