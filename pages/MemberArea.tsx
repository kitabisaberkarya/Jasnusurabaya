
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, UserCheck, Calendar, Clock, Award, Shield, Camera, RefreshCw, X, CheckCircle2, AlertTriangle, CreditCard, Download, RotateCw, QrCode, Wifi, AlertCircle, RefreshCcw, Navigation, ChevronRight, Sparkles, Lock, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MemberArea: React.FC = () => {
  const { currentUser, attendanceSessions, markAttendance, showToast, refreshData, changePassword } = useApp();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Camera & Location State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Strict Location Logic
  const [locationName, setLocationName] = useState<string>("");
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // E-KTA State
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Change Password State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' });

  if (!currentUser) return <div>Access Denied</div>;

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    showToast("Data absensi diperbarui", "info");
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordForm.new !== passwordForm.confirm) {
          showToast("Konfirmasi password tidak cocok", "error");
          return;
      }
      if (passwordForm.new.length < 6) {
          showToast("Password minimal 6 karakter", "error");
          return;
      }
      const success = await changePassword(currentUser.id, passwordForm.new);
      if (success) {
          setIsChangePasswordOpen(false);
          setPasswordForm({ new: '', confirm: '' });
      }
  };

  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; 
    return d;
  }

  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'User-Agent': 'JSN-App/1.0' }
      });
      const data = await response.json();
      if (data && data.address) {
        const village = data.address.village || data.address.suburb || '';
        const city = data.address.city || data.address.town || data.address.county || '';
        const road = data.address.road || '';
        const formattedAddress = [road, village, city].filter(Boolean).join(', ');
        return formattedAddress || "Lokasi Terdeteksi";
      }
      return "Lokasi GPS Terdeteksi";
    } catch (error) {
      console.error("Geocoding failed", error);
      return "Lokasi Koordinat Terbaca";
    }
  };

  const startAttendanceProcess = (sessionId: number) => {
    setSelectedSession(sessionId);
    setIsCameraOpen(true);
    setCapturedImage(null);
    setCalculatedDistance(null);
    fetchLocation(sessionId);
    startCamera();
  };

  const fetchLocation = (sessionId: number) => {
    setLocationStatus('loading');
    setLocationName("Mendeteksi lokasi...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          setCoords({ lat: currentLat, lng: currentLng });
          const session = attendanceSessions.find(s => s.id === sessionId);
          if (session && session.latitude && session.longitude) {
              const dist = getDistanceFromLatLonInMeters(currentLat, currentLng, session.latitude, session.longitude);
              setCalculatedDistance(dist);
          } else {
              setCalculatedDistance(0);
          }
          const address = await getAddressFromCoords(currentLat, currentLng);
          setLocationName(address);
          setLocationStatus('success');
        },
        (error) => {
          console.error(error);
          setLocationName("Gagal mendeteksi lokasi");
          setLocationStatus('error');
          showToast("Gagal mendeteksi lokasi, pastikan GPS aktif.", "error");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationName("GPS Tidak Support");
      setLocationStatus('error');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast("Gagal mengakses kamera. Berikan izin browser.", "error");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (locationStatus !== 'success') {
      showToast("Tunggu hingga lokasi terdeteksi!", "error");
      return;
    }
    const session = attendanceSessions.find(s => s.id === selectedSession);
    if (session && session.latitude && session.radius && calculatedDistance !== null) {
       if (calculatedDistance > session.radius) {
          showToast(`Jarak Anda terlalu jauh (${Math.round(calculatedDistance)}m). Mendekatlah ke lokasi majelis.`, 'error');
          return;
       }
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const activityName = session ? session.name : "Kegiatan Rutin JSN";

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const w = canvas.width;
        const h = canvas.height;

        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -w, 0, w, h);
        context.restore();

        const gradientHeight = h * 0.45;
        const gradient = context.createLinearGradient(0, h - gradientHeight, 0, h);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.9)");
        
        context.fillStyle = gradient;
        context.fillRect(0, h - gradientHeight, w, gradientHeight);

        context.textAlign = "center";
        context.shadowColor = "black";
        context.shadowBlur = 4;
        
        const centerX = w / 2;
        const sizeMeta = Math.floor(w * 0.03);
        
        context.font = `bold ${Math.floor(w * 0.05)}px sans-serif`;
        context.fillStyle = "white";
        context.fillText(currentUser.name.toUpperCase(), centerX, h - (h * 0.15));
        
        context.font = `${sizeMeta}px sans-serif`;
        context.fillStyle = "#fbbf24"; 
        context.fillText(`${locationName} (${calculatedDistance ? Math.round(calculatedDistance) + 'm' : 'GPS'})`, centerX, h - (h * 0.08));

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const closeCameraModal = () => {
    stopCamera();
    setIsCameraOpen(false);
    setSelectedSession(null);
  };

  const submitAttendance = () => {
    if (selectedSession && capturedImage) {
      setIsSubmitting(true);
      setTimeout(() => {
        const success = markAttendance(
            selectedSession, 
            currentUser.id, 
            capturedImage, 
            locationName,
            calculatedDistance || 0
        );
        if (success) {
          showToast('Absensi berhasil! Foto & Lokasi tercatat.', 'success');
          closeCameraModal();
        } else {
          showToast('Absensi gagal.', 'error');
        }
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const activeSessions = attendanceSessions.filter(s => s.isOpen);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-8 lg:py-12 pb-24 lg:pb-12 min-h-screen">
      
      {/* 1. HERO PROFILE CARD */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white shadow-2xl p-8 mb-12 border border-primary-700/50 group">
          <div className="absolute inset-0 opacity-10 pattern-bg mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
               <div className="relative">
                   <div className="absolute inset-0 bg-amber-400 blur-lg opacity-30 rounded-full animate-pulse"></div>
                   <div className="relative w-28 h-28 rounded-full border-[3px] border-amber-400 p-1 shadow-2xl">
                       <img 
                         src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=064e3b&color=fff&size=200`} 
                         className="w-full h-full rounded-full object-cover"
                         alt="Avatar"
                       />
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-amber-400 text-primary-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-primary-900 uppercase tracking-wider">
                      Member
                   </div>
               </div>
               
               <div className="flex-grow space-y-2">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-none">
                    {currentUser.name}
                  </h1>
                  <div className="flex flex-col md:flex-row items-center gap-3 text-primary-100/90 text-sm">
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                        <CreditCard size={14} className="text-amber-400" /> 
                        <span className="font-mono tracking-wider">{currentUser.nia || 'NIA PROSES'}</span>
                     </span>
                     <span className="hidden md:block w-1 h-1 bg-primary-500 rounded-full"></span>
                     <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-400" /> {currentUser.wilayah}
                     </span>
                  </div>
               </div>

               <div className="flex flex-col gap-3 w-full md:w-auto">
                   <button 
                     onClick={() => setIsCardOpen(true)} 
                     className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-primary-900 font-bold rounded-2xl shadow-lg shadow-amber-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                   >
                      <CreditCard size={18} /> Buka E-KTA
                   </button>
                   <button 
                     onClick={() => setIsChangePasswordOpen(true)} 
                     className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition flex items-center justify-center gap-2 text-sm"
                   >
                      <Lock size={16} /> Ganti Password
                   </button>
               </div>
          </div>
      </div>

      {/* 2. ATTENDANCE SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
            <h2 className="text-2xl font-serif font-bold text-primary-900 flex items-center gap-2">
               <Sparkles className="text-amber-500" size={24} />
               Sesi Absensi Aktif
            </h2>
            <p className="text-neutral-500 text-sm mt-1">Silakan lakukan absensi saat sesi dibuka oleh admin.</p>
         </div>
         <button onClick={handleRefresh} className={`flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-600 text-xs font-bold hover:bg-neutral-50 transition ${isRefreshing ? 'opacity-70' : ''}`}>
             <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh Data
         </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {activeSessions.length > 0 ? (
            activeSessions.map(session => {
               const hasAttended = session.attendees.includes(currentUser.id);
               return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={session.id} 
                    className={`relative overflow-hidden rounded-3xl border transition-all duration-300 group ${hasAttended ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-neutral-100 shadow-sm hover:shadow-xl'}`}
                  >
                     <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition duration-700 pointer-events-none">
                        <QrCode size={120} />
                     </div>

                     <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="flex-grow space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                 Kegiatan
                              </span>
                              <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                                 <Calendar size={12} /> {session.date}
                              </span>
                           </div>
                           
                           <h3 className="text-2xl font-bold text-primary-900 leading-tight">
                              {session.name}
                           </h3>
                           
                           <div className="flex flex-wrap items-center gap-4 text-sm">
                              {session.latitude ? (
                                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                      <Navigation size={16} />
                                      <span className="font-bold">Wajib di Lokasi</span>
                                      <span className="text-xs opacity-70">(Max {session.radius}m)</span>
                                  </div>
                              ) : (
                                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                      <MapPin size={16} />
                                      <span className="font-bold">Bebas Lokasi</span>
                                  </div>
                              )}
                           </div>
                        </div>

                        <div className="flex-shrink-0 w-full md:w-auto">
                           {hasAttended ? (
                              <div className="flex flex-col items-center justify-center p-4 bg-emerald-100/50 rounded-2xl border border-emerald-200 text-emerald-800 w-full md:w-48">
                                 <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-lg shadow-emerald-600/20">
                                    <CheckCircle2 size={24} />
                                 </div>
                                 <span className="font-bold text-sm">Sudah Hadir</span>
                                 <span className="text-[10px] opacity-70 mt-1">Terima kasih</span>
                              </div>
                           ) : (
                              <button 
                                onClick={() => startAttendanceProcess(session.id)} 
                                className="w-full md:w-auto px-8 py-4 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-2xl shadow-xl shadow-primary-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn"
                              >
                                 <div className="p-1.5 bg-white/20 rounded-lg group-hover/btn:rotate-12 transition">
                                    <Camera size={20} />
                                 </div>
                                 <div className="text-left">
                                    <span className="block text-xs font-normal text-primary-200">Klik untuk</span>
                                    <span className="block leading-none">Absen Sekarang</span>
                                 </div>
                                 <ChevronRight className="ml-2 opacity-50 group-hover/btn:translate-x-1 transition" />
                              </button>
                           )}
                        </div>
                     </div>
                  </motion.div>
               );
            })
         ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-neutral-300">
               <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={40} className="text-neutral-300" />
               </div>
               <h3 className="text-xl font-serif font-bold text-neutral-800">Belum Ada Sesi Aktif</h3>
               <p className="text-neutral-500 mt-2 max-w-md mx-auto">Admin belum membuka sesi absensi baru. Silakan kembali lagi nanti atau hubungi pengurus.</p>
               <button onClick={handleRefresh} className="mt-6 text-primary-600 font-bold text-sm hover:underline">
                  Coba Refresh Halaman
               </button>
            </motion.div>
         )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isChangePasswordOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-3xl max-w-sm w-full">
                    <h3 className="text-xl font-bold mb-4">Ganti Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1">Password Baru</label>
                            <input type="password" className="w-full border rounded-lg p-3" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1">Konfirmasi Password</label>
                            <input type="password" className="w-full border rounded-lg p-3" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} required />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsChangePasswordOpen(false)} className="px-4 py-2 text-neutral-500 font-bold">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-primary-700 text-white rounded-xl font-bold">Simpan</button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* Existing Card & Camera Modals... (Keeping logic same) */}
      <AnimatePresence>
        {isCardOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative max-w-md w-full">
                 <div className="flex justify-end mb-4"><button onClick={() => setIsCardOpen(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"><X size={24} /></button></div>
                 
                 {/* KARTU MEMBER (Reuse component logic) */}
                 <div className="w-full max-w-sm mx-auto h-[230px] md:h-[250px] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1200px' }}>
                     <motion.div className="relative w-full h-full shadow-2xl rounded-2xl" initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} style={{ transformStyle: 'preserve-3d', transition: 'all 0.6s' }}>
                        <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] p-6 text-white backface-hidden border border-amber-500/30 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                            <div className="absolute inset-0 opacity-10 pattern-bg"></div>
                            <div className="relative z-10 flex justify-between items-start">
                               <div><h3 className="font-serif font-bold text-amber-400 text-lg tracking-wide">JSN SURABAYA</h3><p className="text-[10px] tracking-[0.2em] text-emerald-200 uppercase">Kartu Anggota Resmi</p></div>
                               <Wifi className="text-white/20 rotate-90" />
                            </div>
                            <div className="mt-8 relative z-10"><p className="text-[10px] text-emerald-300 uppercase tracking-widest mb-1">Nomor Induk Anggota</p><p className="font-mono text-xl tracking-widest text-white drop-shadow-md">{currentUser.nia || 'PENDING'}</p></div>
                            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
                               <div><p className="text-lg font-bold font-serif text-white">{currentUser.name}</p><p className="text-xs text-emerald-300 uppercase tracking-wide">{currentUser.wilayah}</p></div>
                               <div className="w-12 h-12 rounded-full border-2 border-amber-400/50 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg"><span className="text-[10px] font-bold text-primary-900">JSN</span></div>
                            </div>
                        </div>
                        <div className="absolute inset-0 w-full h-full rounded-2xl bg-neutral-900 p-6 text-white overflow-hidden" style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden' }}>
                           <div className="w-full h-12 bg-black -mx-6 mb-6 mt-2 relative"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></div>
                           <div className="flex gap-4 items-center">
                              <div className="flex-grow"><div className="h-8 bg-white/10 rounded mb-2"></div><div className="h-2 w-2/3 bg-white/5 rounded"></div><p className="text-[8px] text-neutral-500 mt-4 leading-relaxed">Kartu ini adalah bukti keanggotaan sah Jamiyah Sholawat Nariyah Surabaya.</p></div>
                              <div className="bg-white p-1 rounded-lg shadow-sm"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUser.nia || currentUser.email)}`} alt="Kode Anggota" className="w-16 h-16 object-contain"/></div>
                           </div>
                        </div>
                     </motion.div>
                 </div>
                 
                 <p className="text-center text-white/50 text-xs mt-6">Ketuk kartu untuk membalik</p>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
            <motion.div className="bg-neutral-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-neutral-700">
              <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between bg-gradient-to-b from-black/80 to-transparent">
                <div>
                    <h3 className="text-white font-bold text-lg drop-shadow-md">Ambil Foto</h3>
                    <div className="text-xs mt-1 flex items-center gap-2">
                        {locationStatus === 'loading' && <span className="text-amber-400 animate-pulse flex items-center gap-1"><Navigation size={10} /> Mencari Lokasi...</span>}
                        {locationStatus === 'success' && (<span className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm ${calculatedDistance && calculatedDistance > 100 ? "text-red-400 font-bold border border-red-500/50" : "text-emerald-400 font-bold border border-emerald-500/50"}`}><MapPin size={10} /> {locationName} {calculatedDistance !== null ? `(${Math.round(calculatedDistance)}m)` : ''}</span>)}
                        {locationStatus === 'error' && <span className="text-red-400">Gagal Lokasi</span>}
                    </div>
                </div>
                <button onClick={closeCameraModal} className="text-white bg-black/20 p-2 rounded-full backdrop-blur-md"><X size={24} /></button>
              </div>
              <div className="relative aspect-[3/4] bg-black">
                {!capturedImage ? (<video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />) : (<img src={capturedImage} className="w-full h-full object-cover" />)}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="bg-neutral-900 p-8 flex justify-center pb-10">
                 {!capturedImage ? (
                   <button onClick={takePhoto} disabled={locationStatus !== 'success'} className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${locationStatus === 'success' ? 'border-white hover:scale-105 active:scale-95' : 'border-gray-600 opacity-50 cursor-not-allowed'}`}><div className={`w-16 h-16 bg-white rounded-full transition-all ${locationStatus === 'success' ? 'scale-100' : 'scale-75 bg-gray-400'}`}></div></button>
                 ) : (
                   <div className="flex gap-4 w-full">
                      <button onClick={retakePhoto} className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition">Ulangi</button>
                      <button onClick={submitAttendance} disabled={isSubmitting} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2">{isSubmitting ? <RefreshCw className="animate-spin" /> : <CheckCircle2 />} {isSubmitting ? 'Mengirim...' : 'Kirim Bukti'}</button>
                   </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
