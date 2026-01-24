
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Calendar, MapPin, CheckCircle, ChevronDown, User, PlayCircle, Instagram, Youtube, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MemberStatus } from '../types';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const Home: React.FC = () => {
  const { news, siteConfig } = useApp();
  
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      {/* Hero Section */}
      <section className="relative bg-primary-900 text-white py-24 lg:py-32 overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Modern Background Patterns */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 opacity-90"></div>
           <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
           <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-secondary-500 rounded-full blur-[128px] opacity-20 animate-pulse"></div>
           <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary-400 rounded-full blur-[128px] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Central Logo Identity with Multi-layer Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-10 flex justify-center relative"
          >
            <div className="relative">
               {/* Outer Glow Rings */}
               <div className="absolute inset-0 bg-secondary-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
               <div className="absolute -inset-4 border border-secondary-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute -inset-8 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
               
               <img 
                 src={siteConfig.logoUrl} 
                 alt="Logo Utama JSN" 
                 className="relative w-32 h-32 md:w-44 md:h-44 rounded-full shadow-2xl border-4 border-white/20 ring-4 ring-primary-900/50 object-cover backdrop-blur-sm"
               />
            </div>
          </motion.div>

          <motion.span 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-secondary-300 font-medium text-sm mb-6 uppercase tracking-[0.2em] shadow-lg"
          >
            Ahlan Wa Sahlan
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 leading-tight drop-shadow-lg uppercase"
          >
            BERKHIDMAT UNTUK UMAT,<br/> BERBAKTI KEPADA NEGERI,<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500">NKRI HARGA MATI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            Bergabunglah bersama ribuan jamaah Jamiyah Sholawat Nariyah JASNU KOTA SURABAYA dalam majelis Sholawat Nariyah, dzikir, ilmu, dan ukhuwah.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <Link to="/register" className="group px-8 py-4 bg-secondary-600 hover:bg-secondary-500 text-white font-bold rounded-full transition-all shadow-[0_10px_30px_rgba(217,119,6,0.3)] hover:shadow-[0_15px_40px_rgba(217,119,6,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2">
              Daftar Anggota <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/news" className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full transition flex items-center justify-center">
              Lihat Kegiatan
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-primary-200/50"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="animate-bounce" />
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="relative group">
                <div className="absolute -inset-4 bg-secondary-100 rounded-3xl transform rotate-3 transition-transform group-hover:rotate-6"></div>
                <div className="absolute -inset-4 bg-primary-100 rounded-3xl transform -rotate-3 transition-transform group-hover:-rotate-6 opacity-70"></div>
                <img 
                  src="https://picsum.photos/600/400?random=10" 
                  alt="Kegiatan Majelis" 
                  className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform transition hover:scale-[1.02]"
                />
             </div>
             <div>
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-900 mb-8 leading-tight">Membangun Ukhuwah <br/><span className="italic text-secondary-600">Islamiyah</span></h2>
               <p className="text-neutral-600 mb-8 leading-relaxed text-lg">
                 {siteConfig.appName} {siteConfig.orgName} didirikan sebagai wadah untuk mempererat tali persaudaraan sesama muslim melalui lantunan sholawat dan kajian keislaman yang menyejukkan hati.
               </p>
               <ul className="space-y-6 mb-10">
                 {[
                   `Rutin melaksanakan pembacaan ${siteConfig.appName} 4444x`,
                   'Kajian kitab kuning bersama para Kyai & Habaib',
                   'Santunan sosial dan pemberdayaan ekonomi umat'
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-4">
                     <div className="mt-1 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <CheckCircle size={18} />
                     </div>
                     <span className="text-neutral-800 font-medium text-lg">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
        </div>
      </section>

      {/* Latest News Preview */}
      <section className="py-24 bg-neutral-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <span className="text-secondary-600 font-bold tracking-wider uppercase text-sm">Update Terkini</span>
              <h2 className="text-4xl font-serif font-bold text-primary-900 mt-2">Kabar Kegiatan</h2>
            </div>
            <Link to="/news" className="group text-primary-700 font-bold hover:text-primary-800 flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition">
              Lihat Semua Berita <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {news.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-neutral-100 flex flex-col h-full relative">
                {/* Decorative top bar to replace image visual weight */}
                <div className="h-2 w-full bg-gradient-to-r from-primary-600 to-secondary-500"></div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="bg-primary-50 text-primary-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-primary-100">
                       <Calendar size={12} className="text-primary-600" /> {item.date}
                     </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-4 line-clamp-2 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                  <p className="text-neutral-600 text-sm line-clamp-4 mb-6 flex-grow leading-relaxed">{item.excerpt}</p>
                  
                  <div className="pt-6 border-t border-neutral-50 mt-auto">
                    <Link to={`/news/${item.id}`} className="text-secondary-600 text-sm font-bold flex items-center gap-2 group/link cursor-pointer hover:text-secondary-700">
                      Baca Selengkapnya <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export const News: React.FC = () => {
  const { news } = useApp();
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-serif font-bold text-primary-900 mb-6">Berita & Artikel</h1>
        <p className="text-neutral-500 max-w-2xl mx-auto text-lg">Informasi terkini mengenai jadwal pengajian, dokumentasi kegiatan, dan artikel keislaman.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {news.map((item) => (
          <article key={item.id} className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <img src={item.imageUrl} alt={item.title} className="h-64 w-full object-cover" />
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-sm text-secondary-600 font-medium mb-4">
                <Calendar size={16} />
                <span>{item.date}</span>
              </div>
              <h2 className="text-2xl font-bold font-serif text-neutral-900 mb-4">{item.title}</h2>
              <p className="text-neutral-600 mb-6 flex-grow leading-relaxed">{item.excerpt}</p>
              <Link to={`/news/${item.id}`} className="text-primary-700 font-bold self-start hover:text-primary-900 flex items-center gap-2">
                Baca Selengkapnya <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </motion.div>
  );
};

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { news } = useApp();
  const item = news.find(n => n.id === Number(id));

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-800">Berita tidak ditemukan</h2>
        <Link to="/news" className="mt-4 text-primary-600 hover:text-primary-700 flex items-center gap-2">
          <ArrowLeft size={16} /> Kembali ke Berita
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/news" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 mb-8 transition">
          <ArrowLeft size={18} /> Kembali ke Daftar Berita
        </Link>

        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-secondary-50 text-secondary-600 text-xs font-bold rounded-full mb-4 tracking-wider uppercase">
             Kabar JASNU
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-900 leading-tight mb-6">
            {item.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-neutral-500 text-sm">
             <span className="flex items-center gap-1"><Calendar size={14} /> {item.date}</span>
             <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
             <span>Admin Redaksi</span>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-xl mb-10">
           <img src={item.imageUrl} alt={item.title} className="w-full h-auto object-cover max-h-[500px]" />
        </div>

        <div className="prose prose-lg prose-emerald max-w-none text-neutral-700 leading-relaxed">
           <div dangerouslySetInnerHTML={{ __html: item.content }} />
        </div>
        
        {/* Share / Navigation Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-100 flex justify-between items-center">
           <span className="text-neutral-400 text-sm">Bagikan kabar ini:</span>
           <div className="flex gap-2">
              {/* Dummy share buttons */}
              <button className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition"><Instagram size={16} /></button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Gallery: React.FC = () => {
  const { gallery } = useApp();
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-serif font-bold text-primary-900 mb-6">Galeri Kegiatan</h1>
        <p className="text-neutral-500 text-lg">Momen kebersamaan dalam setiap majelis.</p>
      </div>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {gallery.map((item) => (
          <div key={item.id} className="break-inside-avoid rounded-3xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
            <img src={item.url} alt={item.caption} className="w-full h-auto rounded-3xl transform group-hover:scale-110 transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-8">
              <p className="text-white font-medium text-lg translate-y-4 group-hover:translate-y-0 transition duration-500">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const MediaPage: React.FC = () => {
  const { mediaPosts } = useApp();
  
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-secondary-600 font-bold tracking-wider uppercase text-sm">Arsip Digital</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mt-2">Media & Video</h1>
        <p className="text-neutral-500 max-w-2xl mx-auto text-lg mt-4">Kumpulan video dokumentasi kegiatan majelis dari YouTube dan Instagram.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {mediaPosts.length > 0 ? mediaPosts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-lg transition-all duration-300">
               {post.type === 'youtube' ? (
                  <div className="relative pt-[56.25%] bg-black">
                     <iframe 
                       src={post.embedUrl} 
                       title={post.caption || "YouTube video"}
                       className="absolute top-0 left-0 w-full h-full"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                     ></iframe>
                  </div>
               ) : (
                  <div className="relative pt-[120%] bg-neutral-50">
                     <iframe 
                       src={post.embedUrl} 
                       className="absolute top-0 left-0 w-full h-full"
                       frameBorder="0" 
                       scrolling="no" 
                       allowTransparency={true}
                     ></iframe>
                  </div>
               )}
               <div className="p-6">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                     {post.type === 'youtube' ? <Youtube size={14} className="text-red-600" /> : <Instagram size={14} className="text-pink-600" />}
                     <span>{post.type}</span>
                  </div>
                  <h3 className="font-bold text-lg text-neutral-800 line-clamp-2">{post.caption || "Dokumentasi Kegiatan"}</h3>
                  <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-400">
                     Diunggah pada {post.createdAt}
                  </div>
               </div>
            </div>
         )) : (
            <div className="col-span-full py-20 text-center text-neutral-400 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
               <PlayCircle size={48} className="mx-auto mb-4 opacity-20" />
               <p>Belum ada media yang ditambahkan.</p>
            </div>
         )}
      </div>
    </motion.div>
  );
};

export const Database: React.FC = () => {
  const { users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Only show active members
  const activeMembers = users.filter(
    u => u.status === MemberStatus.ACTIVE && u.role !== 'admin' && 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-primary-900 mb-6">Database Anggota</h1>
          <p className="text-neutral-500 text-lg">Cek status keanggotaan resmi Jamiyah Sholawat Nariyah.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-neutral-100 mb-10 -mt-8 relative z-10">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Cari nama anggota..." 
              className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-neutral-100 focus:border-primary-500 focus:ring-0 outline-none transition text-lg bg-neutral-50 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
          {activeMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-primary-50 border-b border-primary-100">
                  <tr>
                    <th className="px-8 py-6 font-serif font-bold text-primary-900">Nama Lengkap</th>
                    <th className="px-8 py-6 font-serif font-bold text-primary-900">NIA</th>
                    <th className="px-8 py-6 font-serif font-bold text-primary-900">Wilayah</th>
                    <th className="px-8 py-6 font-serif font-bold text-primary-900 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {activeMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-50 transition group">
                      <td className="px-8 py-5 font-bold text-neutral-900 group-hover:text-primary-700">{member.name}</td>
                      <td className="px-8 py-5 font-mono text-sm text-neutral-600 bg-neutral-50/50">{member.nia}</td>
                      <td className="px-8 py-5 text-neutral-600 flex items-center gap-2">
                        <MapPin size={16} className="text-secondary-500" />
                        {member.wilayah || '-'}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle size={12} className="mr-1" /> AKTIF
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center text-neutral-400">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">Data anggota tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ProfileView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { profilePages } = useApp();
  
  const currentPage = profilePages.find(p => p.slug === slug);
  
  // Default titles if not found in DB
  const titleMap: Record<string, string> = {
    'sejarah': 'Sejarah Jamiyah',
    'pengurus': 'Susunan Pengurus Pusat',
    'korwil': 'Daftar Koordinator Wilayah (Korwil)',
    'amaliyah': 'Amaliyah & Wirid Rutin JSN'
  };

  const displayTitle = currentPage?.title || titleMap[slug || ''] || 'Profil';

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-secondary-600 font-bold tracking-wider uppercase text-sm">Profil Organisasi</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mt-2">{displayTitle}</h1>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-neutral-100 min-h-[400px]">
        {currentPage ? (
          <div 
             className="prose prose-lg prose-emerald max-w-none text-neutral-700 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: currentPage.content }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
             <User size={64} className="mb-4 opacity-20" />
             <p>Konten profil belum tersedia.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
