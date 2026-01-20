import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, X, Users, Calendar, FileText, Plus, BarChart2, UserCheck, AlertCircle, ArrowUpRight, ChevronRight, Search } from 'lucide-react';
import { MemberStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const { users, registrations, approveMember, rejectMember, attendanceSessions, createSession, toggleSession, news, addNews } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'attendance' | 'news'>('overview');
  const [newSessionName, setNewSessionName] = useState('');
  
  // News Form State
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName) {
      createSession(newSessionName);
      setNewSessionName('');
    }
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    addNews({
      ...newsForm,
      date: new Date().toISOString().split('T')[0]
    });
    setNewsForm({ title: '', excerpt: '', content: '', imageUrl: '' });
  };

  // Stats
  const activeMembersCount = users.filter(u => u.status === MemberStatus.ACTIVE && u.role !== 'admin').length;
  const pendingCount = registrations.length;
  const totalSessions = attendanceSessions.length;
  const totalNews = news.length;

  // Mock Target Calculation
  const MEMBER_TARGET = 1000;
  const progressPercentage = Math.min((activeMembersCount / MEMBER_TARGET) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Modern Sidebar with Glassmorphism */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-primary-900/5 border border-white/50 p-6 sticky top-28 overflow-hidden relative">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-3xl -z-10 opacity-60"></div>

            <div className="mb-8">
               <h2 className="font-serif font-bold text-2xl text-primary-900 leading-tight">Admin<br/><span className="text-secondary-600">Dashboard</span></h2>
               <p className="text-xs text-neutral-500 mt-2 font-medium tracking-wide">PANEL KONTROL UTAMA</p>
            </div>
            
            <nav className="space-y-3">
              {[
                { id: 'overview', icon: BarChart2, label: 'Ringkasan' },
                { id: 'approval', icon: Users, label: 'Approval Anggota', count: pendingCount },
                { id: 'attendance', icon: Calendar, label: 'Absensi Majelis' },
                { id: 'news', icon: FileText, label: 'Manajemen Berita' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === item.id 
                    ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/20 transform scale-[1.02]' 
                    : 'bg-white/50 text-neutral-600 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={activeTab === item.id ? 'text-secondary-400' : 'text-neutral-400 group-hover:text-primary-600'} />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                     <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                        {item.count}
                     </span>
                  )}
                  {activeTab !== item.id && <ChevronRight size={16} className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-neutral-100">
              <div className="bg-gradient-to-br from-secondary-50 to-white p-4 rounded-2xl border border-secondary-100">
                <p className="text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-2">Target Keanggotaan</p>
                <div className="flex items-end gap-1 mb-2">
                   <span className="text-2xl font-bold text-neutral-900">{activeMembersCount}</span>
                   <span className="text-xs text-neutral-500 mb-1">/ {MEMBER_TARGET}</span>
                </div>
                <div className="w-full bg-secondary-100 rounded-full h-2 mb-2 overflow-hidden">
                   <div 
                     className="bg-secondary-500 h-2 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${progressPercentage}%` }}
                   ></div>
                </div>
                <p className="text-[10px] text-neutral-500 text-right">{progressPercentage.toFixed(1)}% Tercapai</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                 <div>
                    <h3 className="font-serif font-bold text-3xl text-neutral-900">Selamat Datang, Admin.</h3>
                    <p className="text-neutral-500 mt-1">Berikut adalah laporan aktivitas terkini Jamiyah.</p>
                 </div>
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-neutral-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 </div>
              </div>

              {/* Smart Widgets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                   { label: 'Anggota Aktif', value: activeMembersCount, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600', trend: '+12% bln ini' },
                   { label: 'Menunggu', value: pendingCount, icon: AlertCircle, color: 'bg-amber-50 text-amber-600', trend: 'Perlu tindakan' },
                   { label: 'Total Sesi', value: totalSessions, icon: Calendar, color: 'bg-blue-50 text-blue-600', trend: 'Kegiatan rutin' },
                   { label: 'Berita', value: totalNews, icon: FileText, color: 'bg-purple-50 text-purple-600', trend: 'Publikasi' },
                ].map((stat, idx) => (
                   <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow duration-300 group">
                      <div className="flex justify-between items-start mb-4">
                         <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={22} />
                         </div>
                         <div className="flex items-center text-xs font-medium text-neutral-400 bg-neutral-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={12} className="mr-1" />
                            {stat.trend}
                         </div>
                      </div>
                      <h4 className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</h4>
                      <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
                   </div>
                ))}
              </div>

              {/* Activity Feed Section */}
              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-100 p-8">
                    <h4 className="font-serif font-bold text-xl text-neutral-800 mb-6 flex items-center gap-2">
                       <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                       Aktivitas Pendaftaran
                    </h4>
                    <div className="space-y-6">
                       {registrations.slice(0, 5).map((r, i) => (
                          <div key={r.id} className="flex items-center gap-4 group">
                             <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                                {r.name.charAt(0)}
                             </div>
                             <div className="flex-grow">
                                <div className="flex justify-between items-center mb-1">
                                   <span className="font-bold text-neutral-900 group-hover:text-primary-700 transition">{r.name}</span>
                                   <span className="text-xs text-neutral-400 bg-neutral-50 px-2 py-1 rounded-full">{r.date}</span>
                                </div>
                                <p className="text-sm text-neutral-500">Mendaftar dari wilayah <span className="font-medium text-neutral-700">{r.wilayah}</span></p>
                             </div>
                          </div>
                       ))}
                       {registrations.length === 0 && <p className="text-neutral-400 italic">Belum ada aktivitas pendaftaran baru.</p>}
                    </div>
                 </div>

                 <div className="bg-primary-900 text-white rounded-3xl shadow-xl shadow-primary-900/20 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                       <Calendar size={200} />
                    </div>
                    <h4 className="font-serif font-bold text-xl mb-6 relative z-10">Status Absensi</h4>
                    <div className="space-y-4 relative z-10">
                       {attendanceSessions.slice(0, 3).map(s => (
                          <div key={s.id} className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
                             <div className="flex justify-between items-start mb-2">
                                <span className={`w-2 h-2 rounded-full mt-1.5 ${s.isOpen ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-red-400'}`}></span>
                                <span className="text-xs bg-black/20 px-2 py-1 rounded-lg text-primary-100">{s.date}</span>
                             </div>
                             <h5 className="font-bold text-lg leading-tight mb-1">{s.name}</h5>
                             <p className="text-sm text-primary-200">{s.isOpen ? 'Sedang Berlangsung' : 'Selesai'}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'approval' && (
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="font-serif font-bold text-2xl text-neutral-900">Menunggu Persetujuan</h3>
                <p className="text-neutral-500 mt-1">Tinjau data calon anggota sebelum memberikan akses.</p>
              </div>
              {registrations.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <Check size={40} />
                   </div>
                   <h4 className="text-lg font-bold text-neutral-900">Semua Beres!</h4>
                   <p className="text-neutral-500">Tidak ada pendaftaran yang perlu ditinjau saat ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {registrations.map(reg => (
                    <div key={reg.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                       <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex gap-4">
                             <div className="w-12 h-12 bg-secondary-100 text-secondary-700 rounded-2xl flex items-center justify-center font-bold text-xl">
                                {reg.name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="font-bold text-lg text-neutral-900">{reg.name}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-2 text-sm text-neutral-600">
                                   <p><span className="text-neutral-400 w-20 inline-block">NIK</span> : {reg.nik}</p>
                                   <p><span className="text-neutral-400 w-20 inline-block">Wilayah</span> : {reg.wilayah}</p>
                                   <p><span className="text-neutral-400 w-20 inline-block">Email</span> : {reg.email}</p>
                                   <p><span className="text-neutral-400 w-20 inline-block">HP</span> : {reg.phone}</p>
                                   <p className="sm:col-span-2"><span className="text-neutral-400 w-20 inline-block">Alamat</span> : {reg.address}</p>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-start gap-3 pl-16 md:pl-0">
                             <button onClick={() => approveMember(reg.id)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-emerald-600/20">
                                <Check size={18} /> Terima
                             </button>
                             <button onClick={() => rejectMember(reg.id)} className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
                                <X size={18} /> Tolak
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-8">
              {/* Create Session Card */}
              <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <h3 className="font-serif font-bold text-2xl mb-2 relative z-10">Buat Sesi Absensi Baru</h3>
                <p className="text-primary-200 mb-6 relative z-10">Buka sesi untuk kegiatan rutinan atau acara khusus.</p>
                
                <form onSubmit={handleCreateSession} className="relative z-10 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                     <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-300" size={20} />
                     <input
                       type="text"
                       placeholder="Nama Kegiatan (Misal: Rutinan Jumat Wage)"
                       className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 transition"
                       value={newSessionName}
                       onChange={(e) => setNewSessionName(e.target.value)}
                       required
                     />
                  </div>
                  <button type="submit" className="px-8 py-4 bg-secondary-500 text-white rounded-2xl hover:bg-secondary-600 font-bold flex items-center justify-center gap-2 shadow-lg shadow-secondary-500/30 transition transform hover:-translate-y-1">
                    <Plus size={20} strokeWidth={3} /> Buat Sesi
                  </button>
                </form>
              </div>

              {/* Session List */}
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
                 <div className="p-8 border-b border-neutral-100">
                    <h3 className="font-serif font-bold text-xl text-neutral-800">Riwayat Sesi Absensi</h3>
                 </div>
                 <div className="divide-y divide-neutral-100">
                   {attendanceSessions.map(session => (
                     <div key={session.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 transition">
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                            <Calendar size={24} />
                         </div>
                         <div>
                           <h4 className="font-bold text-lg text-neutral-900">{session.name}</h4>
                           <p className="text-sm text-neutral-500 flex items-center gap-2">
                              <span>{session.date}</span>
                              <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                              <span className="font-medium text-primary-700">{session.attendees.length} Hadir</span>
                           </p>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-neutral-100 shadow-sm">
                         <span className={`text-sm font-bold px-3 py-1 rounded-lg ${session.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                           {session.isOpen ? 'DIBUKA' : 'DITUTUP'}
                         </span>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={session.isOpen} onChange={() => toggleSession(session.id)} />
                           <div className="w-12 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                         </label>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-8">
               <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8">
                 <h3 className="font-serif font-bold text-2xl text-neutral-900 mb-6">Tulis Berita Baru</h3>
                 <form onSubmit={handleAddNews} className="space-y-5">
                   <div className="grid md:grid-cols-2 gap-5">
                      <input type="text" placeholder="Judul Berita" className="w-full px-5 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" required value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />
                      <input type="text" placeholder="URL Gambar Header" className="w-full px-5 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" required value={newsForm.imageUrl} onChange={e => setNewsForm({...newsForm, imageUrl: e.target.value})} />
                   </div>
                   <textarea placeholder="Ringkasan Singkat (Excerpt)" className="w-full px-5 py-3 border border-neutral-200 rounded-xl h-24 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none" required value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})}></textarea>
                   <textarea placeholder="Konten Lengkap Berita..." className="w-full px-5 py-3 border border-neutral-200 rounded-xl h-48 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-y" required value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}></textarea>
                   <div className="flex justify-end">
                      <button type="submit" className="px-8 py-3 bg-primary-700 text-white rounded-xl hover:bg-primary-800 font-bold shadow-lg shadow-primary-700/20 transition transform hover:-translate-y-1">Publish Berita</button>
                   </div>
                 </form>
               </div>
               
               <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
                  <div className="p-8 border-b border-neutral-100">
                     <h3 className="font-serif font-bold text-xl text-neutral-800">Daftar Berita Terpublikasi</h3>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {news.map(n => (
                      <div key={n.id} className="p-6 flex gap-6 hover:bg-neutral-50 transition items-center">
                        <img src={n.imageUrl} className="w-24 h-24 object-cover rounded-2xl shadow-sm" alt="" />
                        <div className="flex-grow">
                          <h4 className="font-bold text-lg text-neutral-900 mb-1">{n.title}</h4>
                          <p className="text-sm text-neutral-500 line-clamp-2 mb-2">{n.excerpt}</p>
                          <div className="flex items-center gap-2 text-xs text-primary-600 font-medium">
                             <Calendar size={12} /> {n.date}
                          </div>
                        </div>
                        <button className="p-2 text-neutral-400 hover:text-primary-600 transition border border-neutral-200 rounded-lg hover:bg-white">
                           <ArrowUpRight size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};