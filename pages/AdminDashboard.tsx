
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Calendar, FileText, UserCheck, 
  Image as ImageIcon, Menu, Settings, LogOut, 
  PlayCircle, Map, ShieldCheck, HardDrive, 
  LayoutDashboard, MonitorPlay, FileSpreadsheet
} from 'lucide-react';
import { UserRole } from '../types';

// Import Komponen Modular dari folder admin
import Dashboard from './admin/Dashboard';
import Approval from './admin/Approval';
import DataAnggota from './admin/DataAnggota';
import AbsensiGeo from './admin/AbsensiGeo';
import RecapData from './admin/RecapData';
import ManajemenAdmin from './admin/ManajemenAdmin';
import DataWilayah from './admin/DataWilayah';
import Berita from './admin/Berita';
import Galeri from './admin/Galeri';
import SliderBeranda from './admin/SliderBeranda';
import VideoMedia from './admin/VideoMedia';
import ProfileHal from './admin/ProfileHal';
import BackupRestore from './admin/BackupRestore';
import Pengaturan from './admin/Pengaturan';

export const AdminDashboard: React.FC = () => {
  const { currentUser, logout, refreshData, registrations } = useApp();
  
  // State Navigasi
  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'members' | 'attendance' | 'news' | 'gallery' | 'slider' | 'media' | 'recap' | 'settings' | 'backup' | 'profile' | 'admin-management' | 'korwil-data'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ACCESS CONTROL
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isKorwil = currentUser?.role === UserRole.ADMIN_KORWIL;
  const isPengurus = currentUser?.role === UserRole.ADMIN_PENGURUS;

  // Initial Data Load & Redirect Logic
  useEffect(() => {
    refreshData();
    // Redirect Korwil/Pengurus ke Approval jika akses dashboard overview
    if (isKorwil && activeTab !== 'approval') setActiveTab('approval');
    if (isPengurus && activeTab === 'overview') setActiveTab('approval');
  }, [isKorwil, isPengurus]);

  const pendingCount = registrations.filter(r => r.status === 'pending' || r.status === 'verified_korwil').length;

  // Fungsi Render Konten Berdasarkan Tab Aktif
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Dashboard />;
      case 'approval': return <Approval />;
      case 'members': return <DataAnggota />;
      case 'attendance': return <AbsensiGeo />;
      case 'recap': return <RecapData />;
      case 'admin-management': return <ManajemenAdmin />;
      case 'korwil-data': return <DataWilayah />;
      case 'news': return <Berita />;
      case 'gallery': return <Galeri />;
      case 'slider': return <SliderBeranda />;
      case 'media': return <VideoMedia />;
      case 'profile': return <ProfileHal />;
      case 'backup': return <BackupRestore />;
      case 'settings': return <Pengaturan />;
      default: return <Dashboard />;
    }
  };

  // Judul Header Dinamis
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'overview': 'Dashboard Utama',
      'approval': 'Verifikasi Pendaftaran',
      'members': 'Data Anggota',
      'attendance': 'Absensi & Geofencing',
      'recap': 'Rekapitulasi Data',
      'admin-management': 'Manajemen Admin',
      'korwil-data': 'Data Wilayah Korwil',
      'news': 'Manajemen Berita',
      'gallery': 'Galeri Kegiatan',
      'slider': 'Slider Beranda',
      'media': 'Video & Media',
      'profile': 'Halaman Profil',
      'backup': 'Backup & Restore',
      'settings': 'Pengaturan Akun'
    };
    return titles[activeTab] || 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-sm flex flex-col">
      {/* HEADER */}
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
               {/* Menu: APPROVAL & ANGGOTA (Semua Admin) */}
               {(isSuperAdmin || isKorwil || isPengurus) && (
                 <li>
                    <button onClick={() => setActiveTab('approval')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'approval' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}>
                       <UserCheck size={20} className={activeTab === 'approval' ? 'text-secondary-500' : ''} />
                       {sidebarOpen && (
                          <span className="flex-1 text-left font-medium flex justify-between items-center">
                             Approval
                             {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
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
               
               {/* Menu: ABSENSI & REKAP (Super Admin & Pengurus) */}
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

               {/* Menu: KONTEN & SISTEM (Hanya Super Admin) */}
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
                   <li><button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary-800 text-white shadow-lg' : 'hover:bg-primary-800/50 text-white/70 hover:text-white'}`}><Users size={20} className={activeTab === 'profile' ? 'text-secondary-500' : ''} />{sidebarOpen && <span className="flex-1 text-left font-medium">Profil & Hal</span>}</button></li>
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
                  {getPageTitle()}
               </h1>
               <p className="text-neutral-500 text-sm mt-1">
                  Selamat datang kembali, {currentUser?.name}
               </p>
            </div>
         </div>

         {/* Load Component Modular */}
         <div className="flex-grow animate-fade-in-up">
            {renderContent()}
         </div>
      </main>
    </div>
  );
};
