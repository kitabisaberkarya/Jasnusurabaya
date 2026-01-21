
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, CheckCircle, Info, Check, AlertCircle, Home, Newspaper, Image as ImageIcon, Database, UserCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, toasts, removeToast, siteConfig } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const getLinkClass = (path: string) => isActive(path) ? 'text-secondary-600 font-semibold' : 'text-neutral-600 hover:text-primary-700';
  const getMobileIconClass = (path: string) => isActive(path) ? 'text-secondary-600' : 'text-neutral-400 group-hover:text-primary-600';

  // Mobile Bottom Nav Item Component
  const MobileNavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link to={to} className="flex flex-col items-center justify-center w-full h-full group">
      <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive(to) ? '-translate-y-1' : ''}`}>
        <Icon size={24} className={`transition-colors duration-300 ${getMobileIconClass(to)}`} strokeWidth={isActive(to) ? 2.5 : 2} />
        {isActive(to) && (
          <motion.div 
            layoutId="activeTab"
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-secondary-500 rounded-full"
          />
        )}
      </div>
      <span className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${isActive(to) ? 'text-secondary-700' : 'text-neutral-400'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-neutral-900 bg-neutral-50 relative pb-24 md:pb-0">
      
      {/* Toast Container - Modern 2026 Style */}
      <div className="fixed top-24 right-4 md:right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              layout
              className="pointer-events-auto min-w-[300px] md:min-w-[320px] bg-white/90 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-4 flex items-start gap-3 overflow-hidden relative group"
            >
              {/* Status Indicator Line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                toast.type === 'success' ? 'bg-emerald-500' : 
                toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              
              <div className={`mt-0.5 rounded-full p-1.5 ${
                toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {toast.type === 'success' ? <Check size={16} strokeWidth={3} /> : 
                 toast.type === 'error' ? <AlertCircle size={16} strokeWidth={3} /> : <Info size={16} strokeWidth={3} />}
              </div>
              
              <div className="flex-1">
                <h4 className={`text-sm font-bold ${
                   toast.type === 'success' ? 'text-emerald-900' : 
                   toast.type === 'error' ? 'text-red-900' : 'text-blue-900'
                }`}>
                  {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Terjadi Kesalahan' : 'Informasi'}
                </h4>
                <p className="text-sm text-neutral-600 mt-0.5 leading-snug">{toast.message}</p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 transition p-1"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navbar (Desktop & Tablet Top View - Simplified for Mobile) */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-neutral-200/50 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 md:h-24 items-center">
            {/* Logo & Branding */}
            <Link to="/" className="flex items-center gap-3 md:gap-4 group">
               {/* Show smaller logo on mobile header, full on desktop */}
               <div className="relative md:block hidden">
                 <div className="absolute inset-0 bg-secondary-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500 animate-pulse"></div>
                 <img 
                   src={siteConfig.logoUrl} 
                   alt="Logo" 
                   className="relative w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-lg border-2 border-white ring-2 ring-primary-50 group-hover:scale-105 transition duration-300" 
                 />
               </div>
               {/* Mobile text-only branding since logo is at bottom */}
               <div className="block">
                 <h1 className="text-xl md:text-2xl font-bold font-serif text-primary-900 leading-none tracking-tight">{siteConfig.appName}</h1>
                 <p className="text-[10px] md:text-xs text-secondary-600 tracking-[0.2em] font-medium mt-1">{siteConfig.orgName}</p>
               </div>
            </Link>

            {/* Desktop Menu (Hidden on Mobile/Tablet Portrait) */}
            <div className="hidden lg:flex space-x-8 items-center">
              <Link to="/" className={getLinkClass('/')}>Beranda</Link>
              
              {/* Profil Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setIsProfileHovered(true)}
                onMouseLeave={() => setIsProfileHovered(false)}
              >
                <button className={`flex items-center gap-1 ${location.pathname.startsWith('/profile') ? 'text-secondary-600 font-semibold' : 'text-neutral-600 hover:text-primary-700'}`}>
                  Profil <ChevronDown size={14} className={`transform transition-transform duration-200 ${isProfileHovered ? 'rotate-180' : ''}`} />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left z-50">
                  <Link to="/profile/sejarah" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition">
                    Sejarah
                  </Link>
                  <Link to="/profile/pengurus" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition">
                    Susunan Pengurus Pusat
                  </Link>
                  <Link to="/profile/korwil" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition">
                    Koordinator Wilayah
                  </Link>
                </div>
              </div>

              <Link to="/news" className={getLinkClass('/news')}>Berita</Link>
              <Link to="/gallery" className={getLinkClass('/gallery')}>Galeri</Link>
              <Link to="/database" className={getLinkClass('/database')}>Database</Link>
              
              {currentUser ? (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-neutral-200">
                  <div className="flex flex-col items-end">
                     <span className="text-sm font-semibold text-primary-900">{currentUser.name}</span>
                     <span className="text-[10px] uppercase tracking-wider text-secondary-600 font-bold bg-secondary-50 px-2 py-0.5 rounded-full">{currentUser.role}</span>
                  </div>
                  
                  {currentUser.role === UserRole.ADMIN ? (
                     <Link to="/admin" className="p-2.5 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 hover:scale-105 transition-all shadow-sm" title="Dashboard">
                        <LayoutDashboard size={20} />
                     </Link>
                  ) : (
                     <Link to="/member" className="p-2.5 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 hover:scale-105 transition-all shadow-sm" title="Member Area">
                        <CheckCircle size={20} />
                     </Link>
                  )}

                  <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:scale-105 transition-all shadow-sm" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-primary-700 font-medium hover:text-primary-800 transition px-4 py-2">Masuk</Link>
                  <Link to="/register" className="px-6 py-2.5 bg-primary-700 text-white rounded-full font-medium hover:bg-primary-800 transition shadow-lg shadow-primary-700/20 transform hover:-translate-y-0.5 active:scale-95">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* MOBILE & TABLET BOTTOM NAVIGATION (Visible on lg and below) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Curved shape background could be complex, using a clean floating island approach instead */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
          <div className="flex justify-between items-center px-2 h-20 relative max-w-lg mx-auto">
            
            {/* Left Group */}
            <div className="flex-1 flex justify-around">
               <MobileNavItem to="/news" icon={Newspaper} label="Berita" />
               <MobileNavItem to="/gallery" icon={ImageIcon} label="Galeri" />
            </div>

            {/* CENTER FLOATING LOGO (HOME) */}
            <div className="relative -top-8 mx-2 z-10">
               <Link to="/">
                 <motion.div 
                   whileTap={{ scale: 0.9 }}
                   className={`rounded-full p-1.5 shadow-[0_8px_25px_rgba(4,120,87,0.3)] transition-all duration-300 ${isActive('/') ? 'bg-gradient-to-tr from-secondary-500 to-secondary-600 scale-110' : 'bg-white'}`}
                 >
                   <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white bg-primary-900 relative">
                      <img src={siteConfig.logoUrl} alt="Home" className="w-full h-full object-cover" />
                      {/* Shine effect */}
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-white/20 to-transparent opacity-50"></div>
                   </div>
                 </motion.div>
               </Link>
            </div>

            {/* Right Group */}
            <div className="flex-1 flex justify-around">
               <MobileNavItem to="/database" icon={Database} label="Data" />
               
               {/* Account / Login Logic */}
               {currentUser ? (
                  <Link to={currentUser.role === UserRole.ADMIN ? "/admin" : "/member"} className="flex flex-col items-center justify-center w-full h-full group">
                    <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive('/member') || isActive('/admin') ? '-translate-y-1' : ''}`}>
                       {currentUser.role === UserRole.ADMIN ? 
                          <LayoutDashboard size={24} className={isActive('/admin') ? 'text-secondary-600' : 'text-neutral-400'} strokeWidth={isActive('/admin') ? 2.5 : 2} /> : 
                          <UserCircle2 size={24} className={isActive('/member') ? 'text-secondary-600' : 'text-neutral-400'} strokeWidth={isActive('/member') ? 2.5 : 2} />
                       }
                    </div>
                    <span className={`text-[10px] font-medium mt-1 ${isActive('/member') || isActive('/admin') ? 'text-secondary-700' : 'text-neutral-400'}`}>
                       Akun
                    </span>
                  </Link>
               ) : (
                  <MobileNavItem to="/login" icon={User} label="Masuk" />
               )}
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-900 text-white pt-16 pb-24 md:pb-8 border-t-[6px] border-secondary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img 
                 src={siteConfig.logoUrl} 
                 alt="Logo" 
                 className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-lg" 
                />
                <div>
                   <h3 className="font-serif text-2xl font-bold text-white leading-none">{siteConfig.appName}</h3>
                   <span className="text-xs text-secondary-400 tracking-widest uppercase">{siteConfig.orgName}</span>
                </div>
              </div>
              <p className="text-primary-100 leading-relaxed text-sm">
                {siteConfig.description}
              </p>
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold mb-6 text-secondary-500">Tautan Cepat</h4>
              <ul className="space-y-3 text-primary-100 text-sm">
                <li><Link to="/profile/sejarah" className="hover:text-white transition flex items-center gap-2"><div className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></div>Sejarah JSN</Link></li>
                <li><Link to="/profile/pengurus" className="hover:text-white transition flex items-center gap-2"><div className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></div>Susunan Pengurus</Link></li>
                <li><Link to="/news" className="hover:text-white transition flex items-center gap-2"><div className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></div>Kabar Kegiatan</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition flex items-center gap-2"><div className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></div>Dokumentasi</Link></li>
                <li><Link to="/database" className="hover:text-white transition flex items-center gap-2"><div className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></div>Cek Keanggotaan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold mb-6 text-secondary-500">Hubungi Kami</h4>
              <ul className="space-y-3 text-primary-100 text-sm">
                <li className="flex items-start gap-3 opacity-90">
                   <span className="mt-1">📍</span> {siteConfig.address}
                </li>
                <li className="flex items-start gap-3 opacity-90">
                   <span className="mt-1">📧</span> {siteConfig.email}
                </li>
                <li className="flex items-start gap-3 opacity-90">
                   <span className="mt-1">📞</span> {siteConfig.phone}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-xs text-primary-300">
            &copy; {new Date().getFullYear()} {siteConfig.appName} {siteConfig.orgName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};