
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Calendar, FileText, BarChart2, UserCheck, AlertCircle, ArrowUpRight, 
  ChevronRight, Image as ImageIcon, Check, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Undo, Redo, Strikethrough, Quote, Link as LinkIcon, Video, Plus,
  Printer, Type, Highlighter, Indent, Outdent, RemoveFormatting, ChevronDown,
  FileSpreadsheet, Download, Filter, Search, Menu, Bell, Settings, LogOut, Circle, Save, Upload, Database, RefreshCcw, AlertTriangle,
  User as UserIcon, Youtube, Instagram, Trash2, PlayCircle, Edit3
} from 'lucide-react';
import { MemberStatus, AppState } from '../types';
import * as XLSX from 'xlsx';

export const AdminDashboard: React.FC = () => {
  const { 
    users, registrations, approveMember, rejectMember, attendanceSessions, attendanceRecords, 
    createSession, toggleSession, news, gallery, mediaPosts, addNews, addMediaPost, deleteMediaPost, showToast, currentUser, logout, 
    siteConfig, updateSiteConfig, restoreData, profilePages, updateProfilePage, ...fullState 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'attendance' | 'news' | 'media' | 'recap' | 'settings' | 'backup' | 'profile'>('overview');
  const [newSessionName, setNewSessionName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Recap State
  const [recapType, setRecapType] = useState<'attendance' | 'members'>('attendance');
  
  // News Form State
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '' });

  // Media Form State
  const [mediaForm, setMediaForm] = useState({ type: 'youtube' as 'youtube' | 'instagram', url: '', caption: '' });

  // Profile Editor State
  const [selectedProfileSlug, setSelectedProfileSlug] = useState('sejarah');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileContent, setProfileContent] = useState('');

  // Settings State
  const [configForm, setConfigForm] = useState(siteConfig);

  // Backup/Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update configForm when siteConfig changes
  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  // Load initial content and title for profile editor
  useEffect(() => {
    const page = profilePages.find(p => p.slug === selectedProfileSlug);
    setProfileContent(page ? page.content : '');
    
    // Default titles fallback
    const defaultTitles: Record<string, string> = {
        'sejarah': 'Sejarah Jamiyah',
        'pengurus': 'Susunan Pengurus Pusat',
        'korwil': 'Daftar Koordinator Wilayah'
    };
    
    setProfileTitle(page ? page.title : defaultTitles[selectedProfileSlug] || '');
    
    // Sync to editor div if exists
    if (editorRef.current) {
        editorRef.current.innerHTML = page ? page.content : '';
    }
  }, [selectedProfileSlug, profilePages, activeTab]);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName) {
      createSession(newSessionName);
      setNewSessionName('');
    }
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    let thumbnail = "https://picsum.photos/800/600";
    if (editorRef.current) {
      const firstImg = editorRef.current.querySelector('img');
      if (firstImg) {
        thumbnail = firstImg.src;
      }
    }

    addNews({
      ...newsForm,
      imageUrl: thumbnail,
      date: new Date().toISOString().split('T')[0]
    });
    
    setNewsForm({ title: '', excerpt: '', content: '' });
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    let embedUrl = "";

    if (mediaForm.type === 'youtube') {
       // Extract Video ID
       const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
       const match = mediaForm.url.match(regExp);
       if (match && match[2].length === 11) {
          embedUrl = `https://www.youtube.com/embed/${match[2]}`;
       } else {
          showToast("URL YouTube tidak valid", "error");
          return;
       }
    } else {
       // Instagram Embed (Support Post, Reel, TV)
       // Checks for instagram.com followed by p, reel, or tv
       if (mediaForm.url.match(/instagram\.com\/(p|reel|tv)\//)) {
           // Remove query parameters (like ?igsh=...)
           let cleanUrl = mediaForm.url.split('?')[0];
           
           // Ensure no trailing slash before appending embed
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
    if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        updateProfilePage(selectedProfileSlug, profileTitle, content);
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
          document.execCommand('insertImage', false, reader.result as string);
          if (editorRef.current) {
             const html = editorRef.current.innerHTML;
             if (activeTab === 'news') {
                  setNewsForm(prev => ({ ...prev, content: html }));
             } else if (activeTab === 'profile') {
                  setProfileContent(html);
             }
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
               <video controls class="max-w-full rounded-lg shadow-sm border border-neutral-200" style="max-height: 400px;">
                 <source src="${reader.result}" type="${file.type}">
                 Browser Anda tidak mendukung tag video.
               </video>
               <p><br/></p>
             </div>
           `;
           document.execCommand('insertHTML', false, videoHtml);
           
           if (editorRef.current) {
             const html = editorRef.current.innerHTML;
             if (activeTab === 'news') {
                  setNewsForm(prev => ({ ...prev, content: html }));
             } else if (activeTab === 'profile') {
                  setProfileContent(html);
             }
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
      users,
      registrations,
      news,
      gallery,
      mediaPosts,
      profilePages,
      attendanceSessions,
      attendanceRecords,
      siteConfig,
      currentUser: null, 
      toasts: [] 
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
    if (fileInputRef.current) {
       fileInputRef.current.value = "";
    }
  };

  const downloadReport = () => {
    const data: any[] = [];
    const timestamp = new Date().toISOString().slice(0,10);

    if (recapType === 'attendance') {
      attendanceSessions.forEach(session => {
        session.attendees.forEach(userId => {
          const user = users.find(u => u.id === userId);
          if (user) {
            data.push({
              "Tanggal": session.date,
              "Kegiatan": session.name,
              "Nama Anggota": user.name,
              "NIA": user.nia || '-',
              "Wilayah": user.wilayah || '-'
            });
          }
        });
      });
    } else {
      users.filter(u => u.role !== 'admin').forEach(user => {
         data.push({
           "NIA": user.nia || '-',
           "Nama Lengkap": user.name,
           "Kontak": `${user.email} / ${user.phone || '-'}`,
           "Wilayah": user.wilayah || '-',
           "Status": user.status === MemberStatus.ACTIVE ? 'Aktif' : 'Pending'
         });
      });
    }

    if (data.length === 0) {
      showToast("Tidak ada data untuk diunduh.", "info");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wscols = Object.keys(data[0]).map(() => ({ wch: 25 }));
    ws['!cols'] = wscols;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, recapType === 'attendance' ? "Absensi" : "Anggota");
    XLSX.writeFile(wb, `Laporan_${recapType === 'attendance' ? 'Absensi' : 'Anggota'}_${timestamp}.xlsx`);
    showToast("Laporan berhasil diunduh (XLSX)", "success");
  };

  const activeMembersCount = users.filter(u => u.status === MemberStatus.ACTIVE && u.role !== 'admin').length;
  const pendingCount = registrations.length;
  const totalSessions = attendanceSessions.length;
  const totalNews = news.length;

  return (
    <div className="min-h-screen bg-[#ecf0f5] font-sans text-sm -m-4 sm:-m-6 lg:-m-8">
      {/* 1. Header Bar */}
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

      {/* 2. Sidebar Navigation */}
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
                 { id: 'approval', icon: Users, label: 'Approval Anggota', badge: pendingCount, badgeColor: 'bg-[#00c0ef]' },
                 { id: 'profile', icon: UserIcon, label: 'Manajemen Profil', badge: null },
                 { id: 'media', icon: PlayCircle, label: 'Manajemen Media', badge: null },
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

      {/* 3. Main Content Wrapper */}
      <main className={`pt-[50px] transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-[230px]' : 'ml-[50px]'}`}>
         
         <div className="px-6 py-4 flex justify-between items-center bg-transparent">
            <div>
               <h1 className="text-2xl font-normal text-[#333]">
                  {activeTab === 'overview' && 'Dashboard'}
                  {activeTab === 'approval' && 'Approval Anggota'}
                  {activeTab === 'profile' && 'Manajemen Profil Organisasi'}
                  {activeTab === 'media' && 'Manajemen Media & Video'}
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
              <>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                       <div className="w-[90px] h-full bg-[#00c0ef] flex items-center justify-center text-white">
                          <Settings size={40} />
                       </div>
                       <div className="px-4 flex-grow">
                          <span className="block text-xs uppercase font-bold text-[#333]">ANGGOTA AKTIF</span>
                          <span className="block text-lg font-bold text-[#333]">{activeMembersCount}</span>
                       </div>
                    </div>
                    <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                       <div className="w-[90px] h-full bg-[#dd4b39] flex items-center justify-center text-white">
                          <AlertCircle size={40} />
                       </div>
                       <div className="px-4 flex-grow">
                          <span className="block text-xs uppercase font-bold text-[#333]">PENDING</span>
                          <span className="block text-lg font-bold text-[#333]">{pendingCount}</span>
                       </div>
                    </div>
                    <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                       <div className="w-[90px] h-full bg-[#00a65a] flex items-center justify-center text-white">
                          <Calendar size={40} />
                       </div>
                       <div className="px-4 flex-grow">
                          <span className="block text-xs uppercase font-bold text-[#333]">TOTAL SESI</span>
                          <span className="block text-lg font-bold text-[#333]">{totalSessions}</span>
                       </div>
                    </div>
                    <div className="bg-white shadow-sm rounded-sm flex items-center overflow-hidden h-[90px]">
                       <div className="w-[90px] h-full bg-[#f39c12] flex items-center justify-center text-white">
                          <Users size={40} />
                       </div>
                       <div className="px-4 flex-grow">
                          <span className="block text-xs uppercase font-bold text-[#333]">TOTAL BERITA</span>
                          <span className="block text-lg font-bold text-[#333]">{totalNews}</span>
                       </div>
                    </div>
                 </div>
              </>
            )}

            {activeTab === 'approval' && (
               <div className="bg-white border-t-[3px] border-[#f39c12] shadow-sm rounded-sm">
                  <div className="px-4 py-3 border-b border-[#f4f4f4] flex justify-between items-center">
                     <h3 className="text-lg font-normal text-[#333]">Data Pendaftaran Baru</h3>
                  </div>
                  <div className="p-0">
                     {registrations.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                           Tidak ada data pendaftaran pending.
                        </div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                 <tr>
                                    <th className="px-4 py-3 border-b">Nama</th>
                                    <th className="px-4 py-3 border-b">Kontak</th>
                                    <th className="px-4 py-3 border-b">Wilayah</th>
                                    <th className="px-4 py-3 border-b text-right">Aksi</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {registrations.map(reg => (
                                    <tr key={reg.id} className="hover:bg-gray-50 border-b last:border-0">
                                       <td className="px-4 py-3">
                                          <div className="font-bold text-[#333]">{reg.name}</div>
                                          <div className="text-xs text-gray-500">NIK: {reg.nik}</div>
                                       </td>
                                       <td className="px-4 py-3 text-sm">
                                          <div>{reg.email}</div>
                                          <div className="text-gray-500">{reg.phone}</div>
                                       </td>
                                       <td className="px-4 py-3 text-sm">{reg.wilayah}</td>
                                       <td className="px-4 py-3 text-right">
                                          <div className="flex justify-end gap-2">
                                             <button onClick={() => approveMember(reg.id)} className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1 rounded-sm text-xs font-bold shadow-sm">
                                                Approve
                                             </button>
                                             <button onClick={() => rejectMember(reg.id)} className="bg-[#dd4b39] hover:bg-[#d73925] text-white px-3 py-1 rounded-sm text-xs font-bold shadow-sm">
                                                Reject
                                             </button>
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

            {activeTab === 'profile' && (
               <div className="space-y-6">
                 <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-lg font-normal text-[#333]">Edit Menu & Sub-Menu Profil</h3>
                        <div className="flex gap-2">
                            {['sejarah', 'pengurus', 'korwil'].map(slug => (
                                <button
                                   key={slug}
                                   onClick={() => setSelectedProfileSlug(slug)}
                                   className={`px-3 py-1 text-sm rounded-sm font-bold transition uppercase ${
                                      selectedProfileSlug === slug 
                                      ? 'bg-[#3c8dbc] text-white shadow-md' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                   }`}
                                >
                                   {slug === 'sejarah' ? 'Sejarah' : slug === 'pengurus' ? 'Pengurus' : 'Daftar Korwil'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4">
                       <div className="mb-4">
                          <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Judul Halaman (Tampil di Menu Website)</label>
                          <div className="flex gap-2">
                              <div className="bg-gray-100 p-2 rounded-l-sm border border-r-0 border-gray-300 text-gray-500">
                                 <Edit3 size={18} />
                              </div>
                              <input 
                                 type="text" 
                                 value={profileTitle} 
                                 onChange={(e) => setProfileTitle(e.target.value)}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-r-sm focus:border-[#3c8dbc] outline-none font-bold text-[#333]"
                                 placeholder="Contoh: Sejarah Berdirinya JASNU"
                              />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">* Judul ini akan muncul sebagai heading utama di halaman {selectedProfileSlug === 'sejarah' ? 'Sejarah' : selectedProfileSlug === 'pengurus' ? 'Susunan Pengurus' : 'Daftar Korwil'}.</p>
                       </div>

                       <div className="border border-gray-300 rounded-sm">
                             <div className="bg-[#f0f0f0] border-b border-gray-300 p-2 flex flex-wrap gap-1">
                                <button type="button" onClick={() => execCmd('bold')} className="p-1 hover:bg-gray-200 rounded" title="Bold"><Bold size={16} /></button>
                                <button type="button" onClick={() => execCmd('italic')} className="p-1 hover:bg-gray-200 rounded" title="Italic"><Italic size={16} /></button>
                                <button type="button" onClick={() => execCmd('underline')} className="p-1 hover:bg-gray-200 rounded" title="Underline"><Underline size={16} /></button>
                                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1 hover:bg-gray-200 rounded" title="Bullet List"><List size={16} /></button>
                                <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1 hover:bg-gray-200 rounded" title="Numbered List"><ListOrdered size={16} /></button>
                                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1 hover:bg-gray-200 rounded" title="Image"><ImageIcon size={16} /></button>
                                <input type="file" ref={imageInputRef} onChange={handleEditorImageUpload} accept="image/*" className="hidden" />
                             </div>
                             
                             <div 
                                ref={editorRef}
                                contentEditable
                                className="min-h-[400px] p-4 outline-none prose max-w-none bg-white"
                                onInput={(e) => setProfileContent(e.currentTarget.innerHTML)}
                             ></div>
                       </div>
                       
                       <div className="flex justify-end mt-4">
                            <button 
                               onClick={handleSaveProfile}
                               className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2"
                            >
                               <Save size={18} /> Simpan Perubahan Halaman
                            </button>
                       </div>
                    </div>
                 </div>
               </div>
            )}

            {activeTab === 'media' && (
               <div className="space-y-6">
                 {/* Form Add Media */}
                 <div className="bg-white border-t-[3px] border-[#dd4b39] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]">
                       <h3 className="text-lg font-normal text-[#333]">Tambah Video Baru</h3>
                    </div>
                    <div className="p-4">
                       <form onSubmit={handleAddMedia} className="space-y-4">
                          <div className="flex gap-4">
                             <div className="w-1/4">
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Platform</label>
                                <select 
                                   className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#dd4b39] outline-none"
                                   value={mediaForm.type}
                                   onChange={e => setMediaForm({...mediaForm, type: e.target.value as any})}
                                >
                                   <option value="youtube">YouTube</option>
                                   <option value="instagram">Instagram</option>
                                </select>
                             </div>
                             <div className="w-3/4">
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Link Video (URL)</label>
                                <input 
                                   type="text" 
                                   placeholder="https://www.instagram.com/reel/..."
                                   className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#dd4b39] outline-none"
                                   required
                                   value={mediaForm.url}
                                   onChange={e => setMediaForm({...mediaForm, url: e.target.value})}
                                />
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Judul / Keterangan</label>
                             <input 
                                type="text" 
                                placeholder="Dokumentasi Majelis..." 
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#dd4b39] outline-none"
                                required
                                value={mediaForm.caption}
                                onChange={e => setMediaForm({...mediaForm, caption: e.target.value})}
                             />
                          </div>
                          <div className="flex justify-end">
                             <button type="submit" className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-6 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2">
                                <Plus size={16} /> Tambah Media
                             </button>
                          </div>
                       </form>
                    </div>
                 </div>

                 {/* List Media */}
                 <div className="bg-white border-t-[3px] border-[#00c0ef] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]">
                       <h3 className="text-lg font-normal text-[#333]">Daftar Media</h3>
                    </div>
                    <div className="p-0">
                       {mediaPosts.map(post => (
                         <div key={post.id} className="p-4 border-b last:border-0 hover:bg-gray-50 flex gap-4 items-center">
                            <div className="w-32 h-20 bg-gray-100 flex items-center justify-center rounded overflow-hidden relative">
                               {post.type === 'youtube' ? (
                                  <img src={`https://img.youtube.com/vi/${post.embedUrl.split('/').pop()}/mqdefault.jpg`} className="w-full h-full object-cover" />
                               ) : (
                                  <Instagram className="text-pink-600" size={32} />
                               )}
                               <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <PlayCircle className="text-white drop-shadow-md" />
                               </div>
                            </div>
                            <div className="flex-grow">
                               <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${post.type === 'youtube' ? 'bg-red-600' : 'bg-pink-600'}`}>
                                     {post.type.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">{post.createdAt}</span>
                               </div>
                               <h4 className="font-bold text-gray-800">{post.caption}</h4>
                               <a href={post.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-md">{post.url}</a>
                            </div>
                            <button 
                               onClick={() => deleteMediaPost(post.id)}
                               className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                               title="Hapus Media"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                       ))}
                       {mediaPosts.length === 0 && (
                          <div className="p-8 text-center text-gray-400">Belum ada data media.</div>
                       )}
                    </div>
                 </div>
               </div>
            )}

            {/* Other tabs remain unchanged... (attendance, news, recap, settings, backup) */}
            {/* --- ATTENDANCE TAB --- */}
            {activeTab === 'attendance' && (
               <div className="space-y-6">
                  {/* Form Box */}
                  <div className="bg-white border-t-[3px] border-[#00c0ef] shadow-sm rounded-sm p-4">
                     <h3 className="text-lg font-normal text-[#333] mb-4">Buat Sesi Absensi Baru</h3>
                     <form onSubmit={handleCreateSession} className="flex gap-2">
                        <div className="flex-grow">
                           <input
                              type="text"
                              placeholder="Nama Kegiatan"
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none transition"
                              value={newSessionName}
                              onChange={(e) => setNewSessionName(e.target.value)}
                              required
                           />
                        </div>
                        <button type="submit" className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-4 py-2 rounded-sm font-bold shadow-sm flex items-center gap-2">
                           <Plus size={16} /> Buat
                        </button>
                     </form>
                  </div>

                  {/* List Box */}
                  <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm rounded-sm">
                     <div className="px-4 py-3 border-b border-[#f4f4f4]">
                        <h3 className="text-lg font-normal text-[#333]">Riwayat Sesi</h3>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                              <tr>
                                 <th className="px-4 py-3 border-b">Tanggal</th>
                                 <th className="px-4 py-3 border-b">Nama Kegiatan</th>
                                 <th className="px-4 py-3 border-b text-center">Hadir</th>
                                 <th className="px-4 py-3 border-b text-center">Status</th>
                                 <th className="px-4 py-3 border-b text-center">Aksi</th>
                              </tr>
                           </thead>
                           <tbody>
                              {attendanceSessions.map(session => (
                                 <tr key={session.id} className="hover:bg-gray-50 border-b last:border-0">
                                    <td className="px-4 py-3 text-sm text-gray-600">{session.date}</td>
                                    <td className="px-4 py-3 font-bold text-[#333]">{session.name}</td>
                                    <td className="px-4 py-3 text-center text-sm">
                                       <span className="bg-[#f39c12] text-white px-2 py-0.5 rounded text-xs font-bold">{session.attendees.length}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                       <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${session.isOpen ? 'bg-[#00a65a]' : 'bg-[#dd4b39]'}`}>
                                          {session.isOpen ? 'OPEN' : 'CLOSED'}
                                       </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                       <label className="inline-flex items-center cursor-pointer">
                                          <input type="checkbox" className="sr-only peer" checked={session.isOpen} onChange={() => toggleSession(session.id)} />
                                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3c8dbc]"></div>
                                       </label>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'news' && (
               <div className="space-y-6">
                 {/* Write News Box */}
                 <div className="bg-white border-t-[3px] border-[#dd4b39] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]">
                       <h3 className="text-lg font-normal text-[#333]">Tulis Berita Baru</h3>
                    </div>
                    <div className="p-4">
                       <form onSubmit={handleAddNews} className="space-y-4">
                          <input 
                            type="text" 
                            placeholder="Judul Berita" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none transition text-lg"
                            required
                            value={newsForm.title}
                            onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                          />
                          <div className="border border-gray-300 rounded-sm">
                             <div className="bg-[#f0f0f0] border-b border-gray-300 p-2 flex flex-wrap gap-1">
                                <button type="button" onClick={() => execCmd('bold')} className="p-1 hover:bg-gray-200 rounded" title="Bold"><Bold size={16} /></button>
                                <button type="button" onClick={() => execCmd('italic')} className="p-1 hover:bg-gray-200 rounded" title="Italic"><Italic size={16} /></button>
                                <button type="button" onClick={() => execCmd('underline')} className="p-1 hover:bg-gray-200 rounded" title="Underline"><Underline size={16} /></button>
                                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1 hover:bg-gray-200 rounded" title="Bullet List"><List size={16} /></button>
                                <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1 hover:bg-gray-200 rounded" title="Numbered List"><ListOrdered size={16} /></button>
                                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => execCmd('justifyLeft')} className="p-1 hover:bg-gray-200 rounded" title="Align Left"><AlignLeft size={16} /></button>
                                <button type="button" onClick={() => execCmd('justifyCenter')} className="p-1 hover:bg-gray-200 rounded" title="Align Center"><AlignCenter size={16} /></button>
                                <button type="button" onClick={() => execCmd('justifyRight')} className="p-1 hover:bg-gray-200 rounded" title="Align Right"><AlignRight size={16} /></button>
                                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1 hover:bg-gray-200 rounded" title="Image"><ImageIcon size={16} /></button>
                                <button type="button" onClick={() => videoInputRef.current?.click()} className="p-1 hover:bg-gray-200 rounded" title="Video"><Video size={16} /></button>
                                <button type="button" onClick={() => {const url = prompt("URL:"); if(url) execCmd('createLink', url);}} className="p-1 hover:bg-gray-200 rounded" title="Link"><LinkIcon size={16} /></button>
                                <input type="file" ref={imageInputRef} onChange={handleEditorImageUpload} accept="image/*" className="hidden" />
                                <input type="file" ref={videoInputRef} onChange={handleEditorVideoUpload} accept="video/*" className="hidden" />
                             </div>
                             <div 
                                ref={editorRef}
                                contentEditable
                                className="min-h-[300px] p-4 outline-none prose max-w-none bg-white"
                                onInput={(e) => setNewsForm({...newsForm, content: e.currentTarget.innerHTML})}
                             ></div>
                          </div>
                          <textarea 
                             placeholder="Ringkasan Singkat (Excerpt)" 
                             className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none h-20 text-sm"
                             required
                             value={newsForm.excerpt}
                             onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})}
                          ></textarea>
                          <div className="flex justify-end">
                             <button type="submit" className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-6 py-2 rounded-sm font-bold shadow-sm">
                                Publish Berita
                             </button>
                          </div>
                       </form>
                    </div>
                 </div>
                 {/* List News Box */}
                 <div className="bg-white border-t-[3px] border-[#d2d6de] shadow-sm rounded-sm">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]">
                       <h3 className="text-lg font-normal text-[#333]">Daftar Berita</h3>
                    </div>
                    <div className="p-0">
                       {news.map(n => (
                         <div key={n.id} className="p-4 border-b last:border-0 hover:bg-gray-50 flex gap-4">
                            <img src={n.imageUrl} className="w-20 h-20 object-cover border border-gray-200" alt="thumb" />
                            <div>
                               <h4 className="font-bold text-[#3c8dbc] text-md">{n.title}</h4>
                               <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.excerpt}</p>
                               <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Calendar size={10} /> {n.date}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            )}

            {activeTab === 'recap' && (
               <div className="bg-white border-t-[3px] border-[#605ca8] shadow-sm rounded-sm">
                  <div className="px-4 py-3 border-b border-[#f4f4f4] flex justify-between items-center flex-wrap gap-2">
                     <h3 className="text-lg font-normal text-[#333]">Rekapitulasi Laporan</h3>
                     <div className="flex gap-2">
                        <div className="flex rounded-sm overflow-hidden border border-gray-300">
                           <button onClick={() => setRecapType('attendance')} className={`px-3 py-1 text-sm ${recapType === 'attendance' ? 'bg-[#605ca8] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Absensi</button>
                           <button onClick={() => setRecapType('members')} className={`px-3 py-1 text-sm ${recapType === 'members' ? 'bg-[#605ca8] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Anggota</button>
                        </div>
                        <button onClick={downloadReport} className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1 rounded-sm text-sm font-bold shadow-sm flex items-center gap-1"><Download size={14} /> Excel (.xlsx)</button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-[#f9fafc] text-[#333]">
                            <tr>
                               {recapType === 'attendance' ? (
                                  <>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Tanggal</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Kegiatan</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Nama Anggota</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">NIA</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Wilayah</th>
                                  </>
                               ) : (
                                  <>
                                     <th className="px-4 py-3 border-b font-bold text-sm">NIA</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Nama Lengkap</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Kontak</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Wilayah</th>
                                     <th className="px-4 py-3 border-b font-bold text-sm">Status</th>
                                  </>
                               )}
                            </tr>
                         </thead>
                         <tbody>
                            {recapType === 'attendance' ? (
                               attendanceSessions.flatMap(session => 
                                  session.attendees.map(userId => {
                                     const user = users.find(u => u.id === userId);
                                     return { session, user };
                                  })
                               ).map((item, idx) => (
                                  item.user ? (
                                     <tr key={`${item.session.id}-${item.user.id}-${idx}`} className="hover:bg-gray-50 border-b last:border-0 text-sm text-[#333]">
                                        <td className="px-4 py-2">{item.session.date}</td>
                                        <td className="px-4 py-2">{item.session.name}</td>
                                        <td className="px-4 py-2 font-bold">{item.user.name}</td>
                                        <td className="px-4 py-2 font-mono text-xs">{item.user.nia}</td>
                                        <td className="px-4 py-2">{item.user.wilayah}</td>
                                     </tr>
                                  ) : null
                               ))
                            ) : (
                               users.filter(u => u.role !== 'admin').map((user) => (
                                  <tr key={user.id} className="hover:bg-gray-50 border-b last:border-0 text-sm text-[#333]">
                                     <td className="px-4 py-2 font-mono text-xs font-bold">{user.nia || '-'}</td>
                                     <td className="px-4 py-2 font-bold">{user.name}</td>
                                     <td className="px-4 py-2">
                                        <div className="flex flex-col text-xs"><span>{user.email}</span><span className="text-gray-500">{user.phone}</span></div>
                                     </td>
                                     <td className="px-4 py-2">{user.wilayah}</td>
                                     <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${user.status === MemberStatus.ACTIVE ? 'bg-[#00a65a]' : 'bg-[#f39c12]'}`}>{user.status === MemberStatus.ACTIVE ? 'Aktif' : 'Pending'}</span></td>
                                  </tr>
                               ))
                            )}
                         </tbody>
                      </table>
                  </div>
               </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm">
                 <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Identitas Website</h3></div>
                 <div className="p-6">
                    <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">Nama Aplikasi</label><input type="text" value={configForm.appName} onChange={(e) => setConfigForm({...configForm, appName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">Nama Organisasi / Sub-Title</label><input type="text" value={configForm.orgName} onChange={(e) => setConfigForm({...configForm, orgName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label><textarea value={configForm.description} onChange={(e) => setConfigForm({...configForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none h-24 resize-none" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label><input type="text" value={configForm.address} onChange={(e) => setConfigForm({...configForm, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none" /></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">Email</label><input type="email" value={configForm.email} onChange={(e) => setConfigForm({...configForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none" /></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">No. Telepon</label><input type="text" value={configForm.phone} onChange={(e) => setConfigForm({...configForm, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#3c8dbc] outline-none" /></div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Logo Website</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                             {configForm.logoUrl ? <img src={configForm.logoUrl} alt="Logo Preview" className="h-32 object-contain mb-4" /> : <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center mb-4"><ImageIcon className="text-gray-400" size={40} /></div>}
                             <button type="button" onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm font-medium hover:bg-gray-50 flex items-center gap-2"><Upload size={16} /> Upload Logo Baru</button>
                             <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                             <p className="text-xs text-gray-500 mt-2">Format PNG/JPG, Maksimal 2MB</p>
                          </div>
                       </div>
                       <div className="md:col-span-2 pt-4 border-t border-gray-200 flex justify-end"><button type="submit" className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-6 py-2.5 rounded-sm font-bold shadow-sm flex items-center gap-2"><Save size={18} /> Simpan Pengaturan</button></div>
                    </form>
                 </div>
              </div>
            )}

            {activeTab === 'backup' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm rounded-sm">
                     <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Backup Database</h3></div>
                     <div className="p-6">
                        <div className="flex items-center gap-4 mb-4"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Database size={32} /></div><div><h4 className="font-bold text-gray-700">Unduh Data Sistem</h4><p className="text-sm text-gray-500">Simpan seluruh data ke dalam file JSON aman.</p></div></div>
                        <button onClick={handleBackup} className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white py-2.5 rounded-sm font-bold shadow-sm flex items-center justify-center gap-2"><Download size={18} /> Download Backup (.json)</button>
                     </div>
                  </div>
                  <div className="bg-white border-t-[3px] border-[#dd4b39] shadow-sm rounded-sm">
                     <div className="px-4 py-3 border-b border-[#f4f4f4]"><h3 className="text-lg font-normal text-[#333]">Restore Database</h3></div>
                     <div className="p-6">
                        <div className="flex items-center gap-4 mb-4"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600"><RefreshCcw size={32} /></div><div><h4 className="font-bold text-gray-700">Pulihkan Data Sistem</h4><p className="text-sm text-gray-500">Upload file backup JSON untuk mengembalikan data sistem.</p></div></div>
                        <div className="bg-red-50 p-3 rounded text-xs text-red-700 mb-6 border border-red-200 flex items-start gap-2"><AlertTriangle size={16} className="shrink-0 mt-0.5" /><p><strong>PERINGATAN:</strong> Tindakan ini akan <u>menghapus seluruh data saat ini</u>.</p></div>
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button onClick={handleRestoreClick} className="w-full bg-[#dd4b39] hover:bg-[#d73925] text-white py-2.5 rounded-sm font-bold shadow-sm flex items-center justify-center gap-2"><Upload size={18} /> Upload File Restore</button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </main>
      
      <footer className={`bg-white border-t border-[#d2d6de] px-6 py-4 text-xs text-[#444] transition-all duration-300 ${sidebarOpen ? 'ml-[230px]' : 'ml-[50px]'}`}>
         <div className="float-right hidden sm:inline"><b>Version</b> 2.0</div>
         <strong>Copyright &copy; {new Date().getFullYear()} <a href="#" className="text-[#3c8dbc]">{siteConfig.appName}</a>.</strong> All rights reserved.
      </footer>
    </div>
  );
};
