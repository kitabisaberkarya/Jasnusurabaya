
// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Calendar, MapPin, CheckCircle, ChevronDown, User, PlayCircle, Instagram, Youtube, ArrowLeft, Clock, Share2, Facebook, Twitter, Link as LinkIcon, MessageCircle, ImageOff } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MemberStatus, UserRole } from '../types';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Fallback Image Constant
const FALLBACK_IMAGE = "https://placehold.co/800x600/f3f4f6/1f2937?text=Gambar+Tidak+Tersedia";

// Helper untuk menangani error gambar
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = FALLBACK_IMAGE;
  e.currentTarget.onerror = null; // Prevent infinite loop
};

export const Home: React.FC = () => {
  const { news, siteConfig, sliders, profilePages } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 6000); 
      return () => clearInterval(interval);
    }
  }, [sliders]);

  const defaultSlide = {
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop",
    title: "BERKHIDMAT UNTUK UMAT, BERBAKTI KEPADA NEGERI",
    description: "Bergabunglah bersama ribuan jamaah Jamiyah Sholawat Nariyah JASNU KOTA SURABAYA dalam majelis Sholawat Nariyah, dzikir, ilmu, dan ukhuwah."
  };

  const activeSlide = sliders.length > 0 ? sliders[currentSlide] : defaultSlide;
  const aboutPage = profilePages.find(p => p.slug === 'tentang-kami');
  
  const { aboutImage, aboutContent } = useMemo(() => {
    const defaultImg = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1470&auto=format&fit=crop"; 
    
    if (!aboutPage?.content) return { aboutImage: defaultImg, aboutContent: null };

    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/;
    const match = aboutPage.content.match(imgRegex);
    
    if (match) {
        let cleanContent = aboutPage.content.replace(match[0], '');
        cleanContent = cleanContent.replace(/<p>\s*<\/p>/g, '').replace(/<p>&nbsp;<\/p>/g, '');

        return { 
            aboutImage: match[1], 
            aboutContent: cleanContent
        };
    }

    return { aboutImage: defaultImg, aboutContent: aboutPage.content };
  }, [aboutPage]);

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <section className="relative bg-primary-900 text-white min-h-[90vh] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
            <motion.div 
               key={activeSlide.imageUrl}
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1.5 }}
               className="absolute inset-0 z-0"
            >
               <div className="absolute inset-0 bg-gradient-to-b from-primary-900/90 via-primary-900/70 to-primary-900 z-10"></div>
               <img 
                 src={activeSlide.imageUrl} 
                 alt="Background" 
                 onError={handleImgError}
                 className="w-full h-full object-cover" 
               />
            </motion.div>
        </AnimatePresence>

        <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-secondary-500 rounded-full blur-[128px] opacity-20 animate-pulse z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8 flex justify-center relative"
          >
            <div className="relative">
               <div className="absolute inset-0 bg-secondary-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
               <div className="absolute -inset-4 border border-secondary-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute -inset-8 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
               
               <img 
                 src={siteConfig.logoUrl} 
                 alt="Logo Utama JSN" 
                 onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x400/064e3b/ffffff?text=JSN";
                 }}
                 className="relative w-24 h-24 md:w-36 md:h-36 rounded-full shadow-2xl border-4 border-white/20 ring-4 ring-primary-900/50 object-cover backdrop-blur-sm"
               />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
                key={activeSlide.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <motion.span 
                    className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-secondary-300 font-medium text-xs md:text-sm mb-6 uppercase tracking-[0.2em] shadow-lg"
                >
                    Ahlan Wa Sahlan
                </motion.span>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight drop-shadow-lg uppercase">
                    {activeSlide.title}
                </h1>
                
                <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                    {activeSlide.description}
                </p>
            </motion.div>
          </AnimatePresence>
          
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

          {sliders.length > 1 && (
            <div className="flex justify-center gap-2 mt-12">
                {sliders.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-secondary-500' : 'bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
          )}

        </div>

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

      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-16 items-start">
             <div className="relative group md:sticky md:top-32">
                <div className="absolute -inset-4 bg-secondary-100/50 rounded-[2rem] transform rotate-3 transition-transform duration-700 group-hover:rotate-6"></div>
                <div className="absolute -inset-4 bg-primary-50 rounded-[2rem] transform -rotate-3 transition-transform duration-700 group-hover:-rotate-6 opacity-70"></div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] border-4 border-white bg-neutral-200">
                    <img 
                      src={aboutImage} 
                      alt="Tentang Kami" 
                      onError={handleImgError}
                      className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent opacity-60"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-xs uppercase tracking-widest font-bold text-secondary-400 mb-1">Sekilas Tentang</p>
                        <h3 className="text-2xl font-serif font-bold">{siteConfig.appName}</h3>
                    </div>
                </div>
                
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-pattern-dots opacity-20 z-0"></div>
             </div>

             <div className="relative z-10">
               {aboutContent ? (
                   <div className="prose prose-lg prose-emerald max-w-none text-neutral-600 text-justify prose-headings:font-serif prose-headings:text-primary-900 prose-headings:leading-tight prose-p:leading-relaxed prose-li:marker:text-secondary-500 prose-img:rounded-xl prose-img:shadow-lg prose-table:border-collapse prose-td:border prose-td:border-neutral-200 prose-td:p-2 prose-th:bg-primary-50 prose-th:p-2 prose-th:text-primary-900">
                      <div dangerouslySetInnerHTML={{ __html: aboutContent }} />
                   </div>
               ) : (
                  <>
                   <span className="inline-block px-3 py-1 rounded-full bg-secondary-50 text-secondary-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-secondary-100">
                     Tentang Kami
                   </span>
                   <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-900 mb-8 leading-tight">Membangun Ukhuwah <br/><span className="italic text-secondary-600 relative">Islamiyah <span className="absolute bottom-1 left-0 w-full h-2 bg-secondary-100 -z-10 opacity-50"></span></span></h2>
                   <p className="text-neutral-600 mb-8 leading-relaxed text-lg text-justify">
                     {siteConfig.appName} {siteConfig.orgName} didirikan sebagai wadah untuk mempererat tali persaudaraan sesama muslim melalui lantunan sholawat dan kajian keislaman yang menyejukkan hati. Kami berkomitmen untuk menyebarkan nilai-nilai Islam yang Rahmatan Lil Alamin.
                   </p>
                   
                   <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 mb-8">
                       <h4 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
                           <Calendar className="text-secondary-600" size={20} /> Kegiatan Rutin
                       </h4>
                       <ul className="space-y-4">
                         {[
                           `Rutin melaksanakan pembacaan ${siteConfig.appName} 4444x`,
                           'Kajian kitab kuning bersama para Kyai & Habaib',
                           'Santunan sosial dan pemberdayaan ekonomi umat'
                         ].map((item, i) => (
                           <li key={i} className="flex items-start gap-4">
                             <div className="mt-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-secondary-600 flex-shrink-0 shadow-sm border border-secondary-100">
                                <CheckCircle size={14} />
                             </div>
                             <span className="text-neutral-700 font-medium">{item}</span>
                           </li>
                         ))}
                       </ul>
                   </div>
                  </>
               )}
               
               <div className="mt-8 pt-8 border-t border-neutral-100 flex items-center gap-4">
                   <Link to="/profile/sejarah" className="text-primary-700 font-bold hover:text-primary-800 flex items-center gap-2 group">
                      Baca Sejarah Lengkap <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </Link>
               </div>
             </div>
           </div>
        </div>
      </section>

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
              <div key={item.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-neutral-100 flex flex-col h-full">
                <div className="h-56 overflow-hidden relative bg-neutral-200">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-primary-900 shadow-sm">
                    {item.date}
                  </div>
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    onError={handleImgError}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                  <p className="text-neutral-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">{item.excerpt}</p>
                  <Link to={`/news/${item.id}`} className="text-secondary-600 text-sm font-bold flex items-center gap-2 group/link cursor-pointer hover:text-secondary-700">
                    Baca Selengkapnya <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
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
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="text-secondary-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Berita & Artikel</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary-900 mb-6">Warta Jamiyah</h1>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Menyajikan informasi terkini seputar kegiatan majelis, jadwal pengajian, dokumentasi acara, dan artikel keislaman yang bermanfaat.
          </p>
          <div className="w-24 h-1 bg-secondary-500 mx-auto mt-8 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {news.map((item, index) => (
            <article 
              key={item.id} 
              className="bg-white rounded-[2rem] shadow-sm border border-neutral-100/50 overflow-hidden flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  onError={handleImgError}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition duration-1000 ease-out" 
                />
                
                <div className="absolute top-6 left-6 z-20">
                  <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 flex flex-col items-center min-w-[60px]">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{item.date.split(' ')[1] || 'BLN'}</span>
                    <span className="text-xl font-serif font-bold text-primary-900">{item.date.split(' ')[0] || '00'}</span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              <div className="p-8 flex flex-col flex-grow relative">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-widest border border-primary-100">
                    Berita JSN
                  </span>
                </div>

                <h2 className="text-2xl font-bold font-serif text-neutral-900 mb-4 leading-tight group-hover:text-primary-800 transition-colors">
                  <Link to={`/news/${item.id}`} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    {item.title}
                  </Link>
                </h2>
                
                <p className="text-neutral-500 mb-8 flex-grow leading-relaxed font-sans text-sm line-clamp-3">
                  {item.excerpt}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
                    <Clock size={14} />
                    <span>3 Menit Baca</span>
                  </div>
                  <span className="text-secondary-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                    Baca Selengkapnya <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {news.length === 0 && (
           <div className="py-32 text-center">
              <div className="inline-block p-6 rounded-full bg-neutral-100 mb-4">
                <Calendar size={48} className="text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-700">Belum ada berita</h3>
              <p className="text-neutral-500 mt-2">Nantikan kabar terbaru dari kami.</p>
           </div>
        )}
      </div>
    </motion.div>
  );
};

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { news, showToast } = useApp();
  const item = news.find(n => n.id === Number(id));

  const handleShare = (platform: string) => {
    if (!item) return;
    const url = window.location.href;
    const text = `Baca berita: ${item.title}`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      showToast('Link berhasil disalin ke clipboard!', 'success');
      return;
    }

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'native':
         if (navigator.share) {
            navigator.share({ title: item.title, text: text, url: url }).catch(() => {});
         } else {
            handleShare('copy');
         }
         return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-white min-h-screen">
      <div className="border-b border-neutral-100 bg-white sticky top-[80px] z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <Link to="/news" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-700 transition font-medium text-sm group">
              <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-primary-50 transition">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              Kembali ke Daftar
           </Link>
           <div className="flex gap-2">
              <button onClick={() => handleShare('native')} className="p-2 text-neutral-400 hover:text-primary-600 transition" title="Bagikan">
                 <Share2 size={18} />
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary-100">
               Kabar JASNU
            </span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
               {item.date}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-900 leading-[1.15] mb-8">
            {item.title}
          </h1>

          <div className="flex items-center justify-center gap-4 py-6 border-t border-b border-neutral-100">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-serif font-bold text-lg">
                   A
                </div>
                <div className="text-left">
                   <p className="text-xs font-bold text-primary-900 uppercase tracking-wider">Admin Redaksi</p>
                   <p className="text-xs text-neutral-500">JSN Surabaya Press</p>
                </div>
             </div>
          </div>
        </header>

        <article className="prose prose-lg prose-emerald max-w-none text-neutral-700 leading-loose prose-headings:font-serif prose-headings:text-primary-900 prose-a:text-secondary-600 hover:prose-a:text-secondary-700 prose-img:rounded-2xl prose-img:shadow-lg">
           {/* Handle image in content or show hero image if not in content */}
           <div className="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-video bg-neutral-100">
              <img src={item.imageUrl} alt={item.title} onError={handleImgError} className="w-full h-full object-cover" />
           </div>
           <div dangerouslySetInnerHTML={{ __html: item.content }} />
        </article>
        
        <div className="mt-16 pt-8 border-t border-neutral-200">
           <div className="bg-neutral-50 rounded-2xl p-8 text-center">
              <h3 className="font-serif font-bold text-xl text-primary-900 mb-2">Terima kasih telah membaca</h3>
              <p className="text-neutral-500 text-sm mb-6">Bagikan informasi kebaikan ini kepada rekan dan saudara Anda.</p>
              
              <div className="flex flex-col items-center gap-6">
                 <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button onClick={() => handleShare('whatsapp')} className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition shadow-lg" title="WhatsApp">
                       <MessageCircle size={20} />
                    </button>
                    <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition shadow-lg" title="Facebook">
                       <Facebook size={20} />
                    </button>
                    <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition shadow-lg" title="X / Twitter">
                       <Twitter size={20} />
                    </button>
                    <button onClick={() => handleShare('copy')} className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center hover:scale-110 transition shadow-lg hover:bg-neutral-300" title="Salin Link">
                       <LinkIcon size={20} />
                    </button>
                    <button onClick={() => handleShare('native')} className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center hover:scale-110 transition shadow-lg md:hidden" title="Lainnya">
                       <Share2 size={20} />
                    </button>
                 </div>

                 <div className="flex justify-center gap-4">
                     <Link to="/news" className="px-6 py-2 bg-primary-700 text-white rounded-full text-sm font-bold hover:bg-primary-800 transition flex items-center gap-2 shadow-lg shadow-primary-700/20">
                        Baca Berita Lainnya
                     </Link>
                 </div>
              </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gallery.map((item) => (
          <div key={item.id} className="rounded-3xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 bg-neutral-200 aspect-[4/3]">
            <img 
              src={item.url} 
              alt={item.caption} 
              onError={handleImgError}
              className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" 
            />
            {/* Overlay Gradient always present if needed, but only visible on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-8">
              <p className="text-white font-medium text-lg translate-y-4 group-hover:translate-y-0 transition duration-500">{item.caption}</p>
            </div>
            
            {/* Helper text if image breaks (Fallback usually handles it, but this adds clarity if fallback fails or loads slow) */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
               <ImageOff className="text-neutral-400" />
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

  // IMPORTANT: Filter hanya member aktif, sembunyikan Admin/Pengurus/Korwil dari publik
  const activeMembers = users.filter(
    u => u.status === MemberStatus.ACTIVE && 
    u.role === UserRole.MEMBER && 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mb-6">Database Anggota</h1>
        <p className="text-neutral-500 text-lg mb-8">Cek status keanggotaan resmi Jamiyah Sholawat Nariyah.</p>
        
        <div className="max-w-xl mx-auto relative">
           <input 
             type="text" 
             placeholder="Cari nama anggota..." 
             className="w-full px-6 py-4 rounded-full border border-neutral-200 shadow-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-lg"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <button className="absolute right-3 top-3 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition">
              <Search size={20} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-primary-900 text-white uppercase text-xs font-bold tracking-wider">
                  <tr>
                     <th className="px-6 py-4">Nama Lengkap</th>
                     <th className="px-6 py-4">Nomor Anggota (NIA)</th>
                     <th className="px-6 py-4">Wilayah</th>
                     <th className="px-6 py-4 text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-neutral-100">
                  {activeMembers.length > 0 ? activeMembers.map((member) => (
                     <tr key={member.id} className="hover:bg-neutral-50 transition">
                        <td className="px-6 py-4 font-bold text-primary-900">{member.name}</td>
                        <td className="px-6 py-4 font-mono text-neutral-600">{member.nia}</td>
                        <td className="px-6 py-4 text-neutral-600">{member.wilayah}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">
                              <CheckCircle size={12} /> Aktif
                           </span>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">
                           {searchTerm ? 'Data tidak ditemukan.' : 'Silakan cari nama anggota.'}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
};

export const ProfileView: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { profilePages, korwils } = useApp();
    
    const page = profilePages.find(p => p.slug === slug);

    if (!page) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-neutral-800">Halaman tidak ditemukan</h2>
                <Link to="/" className="mt-4 text-primary-600 hover:text-primary-700 flex items-center gap-2">
                    <ArrowLeft size={16} /> Kembali ke Beranda
                </Link>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <span className="text-secondary-600 font-bold tracking-wider uppercase text-sm">Profil Organisasi</span>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mt-2">{page.title}</h1>
                <div className="w-24 h-1 bg-secondary-500 mx-auto mt-6 rounded-full"></div>
            </div>
            
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-neutral-100">
                <article className="prose prose-lg prose-emerald max-w-none text-neutral-700 leading-loose prose-headings:font-serif prose-headings:text-primary-900 prose-a:text-secondary-600 hover:prose-a:text-secondary-700 prose-img:rounded-2xl prose-img:shadow-lg prose-table:border-collapse prose-td:border prose-td:border-neutral-200 prose-td:p-3 prose-th:bg-primary-50 prose-th:p-3 prose-th:text-primary-900">
                    <div dangerouslySetInnerHTML={{ __html: page.content }} />
                </article>

                {/* AUTO GENERATED LIST FOR KORWIL */}
                {slug === 'korwil' && korwils.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-neutral-100">
                        <h3 className="font-serif font-bold text-2xl text-primary-900 mb-6">Daftar Wilayah Resmi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {korwils.map((k, idx) => (
                                <div key={k.id} className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-primary-200 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-neutral-700">{k.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
