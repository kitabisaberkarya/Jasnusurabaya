
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, UserCheck, Calendar, Clock, Award, Shield, Camera, RefreshCw, X, CheckCircle2, AlertTriangle, CreditCard, Download, RotateCw, QrCode, Wifi, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MemberArea: React.FC = () => {
  const { currentUser, attendanceSessions, markAttendance, showToast } = useApp();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // E-KTA State
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!currentUser) return <div>Access Denied</div>;

  // Cleanup camera when component unmounts or modal closes
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

  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'User-Agent': 'JSN-App/1.0'
        }
      });
      const data = await response.json();
      
      if (data && data.address) {
        const village = data.address.village || data.address.suburb || '';
        const city = data.address.city || data.address.town || data.address.county || '';
        const state = data.address.state || '';
        const road = data.address.road || '';
        
        const formattedAddress = [road, village, city].filter(Boolean).join(', ');
        return formattedAddress || state || "Lokasi Terdeteksi";
      }
      return "Lokasi GPS Terdeteksi";
    } catch (error) {
      console.error("Geocoding failed", error);
      return "Wilayah Surabaya"; // Fallback
    }
  };

  const startAttendanceProcess = (sessionId: number) => {
    setSelectedSession(sessionId);
    setIsCameraOpen(true);
    setCapturedImage(null);
    fetchLocation();
    startCamera();
  };

  const fetchLocation = () => {
    setLocationStatus('loading');
    setLocationName("Mendeteksi lokasi...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          const address = await getAddressFromCoords(position.coords.latitude, position.coords.longitude);
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

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();

        const w = canvas.width;
        const h = canvas.height;
        
        const fontSizeTitle = Math.floor(w * 0.05);
        const fontSizeName = Math.floor(w * 0.04);
        const fontSizeMeta = Math.floor(w * 0.035);
        const padding = Math.floor(w * 0.05);
        
        const gradientHeight = Math.floor(h * 0.3);
        const gradient = context.createLinearGradient(0, h - gradientHeight, 0, h);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, "rgba(0,0,0,0.7)");
        gradient.addColorStop(1, "rgba(0,0,0,0.95)");
        
        context.fillStyle = gradient;
        context.fillRect(0, h - gradientHeight, w, gradientHeight);

        context.strokeStyle = "#ffffff";
        context.lineWidth = Math.floor(w * 0.015);
        context.strokeRect(0, 0, w, h);

        context.shadowColor = "black";
        context.shadowBlur = 4;
        context.textAlign = "center";
        const centerX = w / 2;
        
        context.font = `bold ${fontSizeTitle}px sans-serif`;
        context.fillStyle = "white";
        context.fillText("JAMIYAH SHOLAWAT NARIYAH", centerX, h - (fontSizeTitle * 3.5), w - (padding * 2));

        context.font = `${fontSizeName}px sans-serif`;
        context.fillStyle = "#e5e5e5";
        context.fillText(`${currentUser.name}`, centerX, h - (fontSizeName * 2.2), w - (padding * 2));

        const timeString = new Date().toLocaleString('id-ID', { 
          day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' 
        });
        
        context.font = `bold ${fontSizeMeta}px monospace`;
        context.fillStyle = "#fbbf24";
        
        const metaText = `${timeString}`;
        context.fillText(metaText, centerX, h - (fontSizeMeta * 2.5), w - (padding * 2));
        
        // Location on next line
        context.font = `${fontSizeMeta * 0.8}px sans-serif`;
        context.fillStyle = "#ffffff";
        context.fillText(locationName, centerX, h - fontSizeMeta, w - (padding * 2));

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
        const success = markAttendance(selectedSession, currentUser.id, capturedImage, locationName);
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

  const handleDownloadCard = () => {
    showToast("Fitur download kartu sedang diproses...", "info");
    // In a real app, use html2canvas to save the div as image
  };

  const activeSessions = attendanceSessions.filter(s => s.isOpen);
  const totalAttendance = attendanceSessions.filter(s => s.attendees.includes(currentUser.id)).length;
  const historySessions = attendanceSessions.filter(s => s.attendees.includes(currentUser.id));

  // --- COMPONENT: Digital Card (Royal Emerald & Gold Theme) ---
  const renderCard = () => (
    <div 
      className="w-full max-w-sm mx-auto h-[230px] md:h-[250px] cursor-pointer group" 
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1200px' }}
    >
      <motion.div 
        className="relative w-full h-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] rounded-2xl"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* --- FRONT SIDE --- */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-amber-500/40 bg-neutral-900"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Background Layer - Deep Emerald Islamic Theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] z-0"></div>
          
          {/* Islamic Geometric Pattern Overlay (Subtle) */}
          <div 
             className="absolute inset-0 opacity-10 z-0 mix-blend-overlay" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(251, 191, 36, 0.4) 1px, transparent 0)', 
               backgroundSize: '16px 16px' 
             }}
          ></div>
          
          {/* Decorative Glows */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500 rounded-full blur-[90px] opacity-20 z-0"></div>
          <div className="absolute -left-10 bottom-0 w-40 h-40 bg-amber-500 rounded-full blur-[70px] opacity-15 z-0"></div>

          {/* Content Layer */}
          <div className="relative z-10 p-6 h-full flex flex-col justify-between">
             
             {/* Header */}
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      {/* Logo Glow */}
                      <div className="absolute inset-0 bg-amber-400 blur-md opacity-30 rounded-full"></div>
                      <img src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1768810509/Logoo_stivmi.png" alt="Logo" className="w-10 h-10 object-contain relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                   </div>
                   <div>
                      <h3 className="font-serif font-bold text-xs leading-none tracking-wide text-amber-50 drop-shadow-sm">JAMIYAH SHOLAWAT</h3>
                      <h4 className="font-bold text-[10px] tracking-[0.25em] mt-1 text-amber-400">NARIYAH SURABAYA</h4>
                   </div>
                </div>
                {/* Contactless Icon */}
                <div className="text-white/30 rotate-90">
                    <Wifi size={24} />
                </div>
             </div>

             {/* Middle Section: Chip & Info */}
             <div className="flex items-end gap-5 mt-2">
                <div className="flex-shrink-0">
                    {/* Realistic Gold Chip */}
                    <div className="w-12 h-9 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 rounded-lg border border-amber-600/80 shadow-md relative overflow-hidden mb-2">
                       <div className="absolute top-1/2 left-0 w-full h-[1px] bg-amber-700/60"></div>
                       <div className="absolute left-1/2 top-0 h-full w-[1px] bg-amber-700/60"></div>
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-6 border border-amber-700/60 rounded-[3px]"></div>
                    </div>
                </div>
                <div className="w-full pb-1">
                    <div className="text-[9px] text-emerald-200/80 uppercase tracking-widest mb-0.5 font-medium">Nomor Anggota</div>
                    <div className="font-mono text-xl text-white tracking-[0.15em] drop-shadow-md" style={{ textShadow: '0 2px 2px rgba(0,0,0,0.8)' }}>
                       {currentUser.nia || '•••• •••• ••••'}
                    </div>
                </div>
             </div>

             {/* Footer Section */}
             <div className="flex items-end justify-between mt-auto pt-2 border-t border-white/5">
                <div>
                   <div className="text-[9px] text-emerald-200/80 uppercase tracking-widest mb-0.5 font-medium">Nama Anggota</div>
                   <div className="font-serif text-lg font-bold bg-gradient-to-r from-amber-50 via-white to-amber-100 bg-clip-text text-transparent truncate max-w-[200px] tracking-wide">
                      {currentUser.name.toUpperCase()}
                   </div>
                   <div className="text-[10px] text-emerald-100/70 font-medium mt-1 flex items-center gap-1">
                      <MapPin size={10} className="text-amber-500" /> {currentUser.wilayah ? currentUser.wilayah.replace("Surabaya ", "") : "Surabaya"}
                   </div>
                </div>
                
                {/* Hologram Badge */}
                <div className="relative transform translate-y-2">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-200 via-emerald-300 to-amber-200 opacity-20 blur-sm animate-pulse absolute inset-0"></div>
                   <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center relative bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm shadow-inner">
                      <span className="text-[8px] font-bold text-amber-100/90 text-center leading-none tracking-tighter">JSN<br/>OFFICIAL</span>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Shimmer Effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12"
            animate={{ x: ['-150%', '150%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", repeatDelay: 1 }}
          ></motion.div>
        </div>

        {/* --- BACK SIDE --- */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-[#1a1c1c] border border-neutral-800"
          style={{ 
            transform: "rotateY(180deg)", 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden' 
          }}
        >
           {/* Magnetic Stripe */}
           <div className="w-full h-12 bg-[#0c0d0d] mt-5 relative z-10 border-b border-neutral-800"></div>
           
           <div className="p-6 flex flex-col h-[calc(100%-48px)]">
              <div className="flex gap-4 items-start mt-3">
                 {/* Signature Area */}
                 <div className="flex-grow">
                    <div className="h-8 bg-neutral-100 opacity-90 mb-1 flex items-center px-2 relative overflow-hidden">
                       <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_4px)]"></div>
                       <span className="font-serif text-neutral-600 text-xs italic relative z-10">Authorized Signature</span>
                    </div>
                    <p className="text-[7px] text-neutral-500 leading-tight text-justify">
                       Kartu ini adalah identitas resmi anggota Jamiyah Sholawat Nariyah Surabaya. Menemukan kartu ini? Harap kembalikan ke sekretariat.
                    </p>
                 </div>
                 
                 {/* QR Code */}
                 <div className="bg-white p-1.5 rounded-lg shadow-sm flex-shrink-0">
                    <QrCode size={52} className="text-neutral-900" />
                 </div>
              </div>

              <div className="mt-auto border-t border-neutral-800 pt-3 flex justify-between items-center">
                 <div className="text-[8px] text-neutral-400">
                    <span className="text-amber-600 font-bold tracking-wider">SEKRETARIAT PUSAT</span><br/>
                    Jl. Masjid Al-Akbar No. 1, Surabaya
                 </div>
                 <div className="text-right">
                    <div className="text-[7px] text-neutral-500 uppercase tracking-widest">Masa Berlaku</div>
                    <div className="text-[9px] text-emerald-500 font-bold font-mono tracking-widest">SEUMUR HIDUP</div>
                 </div>
              </div>
           </div>
           
           {/* Texture Overlay */}
           <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-8 lg:py-12 pb-24 lg:pb-12">
      
      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-lg shadow-neutral-200/50 border border-neutral-100 overflow-hidden mb-8 relative group">
         <div className="bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center h-32 absolute w-full top-0 left-0 opacity-20 group-hover:opacity-30 transition duration-700"></div>
         <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] p-8 text-white relative z-10 bg-opacity-95 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
               <div className="relative">
                 <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#064e3b] font-serif font-bold text-4xl shadow-2xl border-4 border-white relative z-10">
                    {currentUser.name.charAt(0)}
                 </div>
                 <div className="absolute bottom-1 right-1 bg-amber-500 w-7 h-7 rounded-full border-4 border-[#065f46] z-20 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                 </div>
               </div>
               
               <div className="text-center md:text-left flex-grow">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold mb-1 tracking-wide text-amber-50">{currentUser.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-emerald-100 text-sm font-medium mt-2">
                     <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-sm">
                        <UserCheck size={14} className="text-amber-400" /> NIA: <span className="font-mono">{currentUser.nia}</span>
                     </span>
                     <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-sm">
                        <MapPin size={14} className="text-amber-400" /> {currentUser.wilayah}
                     </span>
                  </div>
               </div>
               
               <div className="mt-6 md:mt-0 flex flex-row md:flex-col gap-4 items-center">
                  <div className="bg-gradient-to-b from-white/10 to-transparent p-4 rounded-2xl border border-white/10 text-center min-w-[120px] backdrop-blur-sm">
                      <p className="text-4xl font-bold tracking-tighter text-white">{totalAttendance}</p>
                      <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold mt-1">Total Hadir</p>
                  </div>
                  <button 
                    onClick={() => setIsCardOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-900/20 transition transform hover:-translate-y-1 border border-amber-400/30"
                  >
                    <CreditCard size={16} /> Lihat E-KTA
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Left Column: Active Attendance */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
               <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Calendar size={18} />
                     </div>
                     Sesi Absensi Aktif
                  </h2>
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full animate-pulse border border-emerald-200">
                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live
                  </span>
               </div>
               
               <div className="p-6">
                  {activeSessions.length > 0 ? (
                     <div className="grid gap-4">
                        {activeSessions.map(session => {
                           const hasAttended = session.attendees.includes(currentUser.id);
                           return (
                              <div key={session.id} className="border border-neutral-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white hover:shadow-lg transition-all duration-300 group">
                                 <div>
                                    <h3 className="font-bold text-xl text-[#064e3b] group-hover:text-[#047857] transition">{session.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                       <span className="flex items-center gap-1"><Clock size={16} className="text-neutral-400" /> {session.date}</span>
                                       <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                       <span className="text-amber-600 font-medium">Wajib Hadir</span>
                                    </div>
                                 </div>
                                 
                                 {hasAttended ? (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-100">
                                       <CheckCircle2 size={20} />
                                       Sudah Hadir
                                    </div>
                                 ) : (
                                    <button 
                                       onClick={() => startAttendanceProcess(session.id)}
                                       className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 bg-gradient-to-r from-[#064e3b] to-[#047857] text-white hover:from-[#065f46] hover:to-[#059669] shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:-translate-y-0.5 transition-all"
                                    >
                                       <Camera size={20} />
                                       Absen Sekarang
                                    </button>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="text-center py-16 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-neutral-300">
                           <Calendar size={32} />
                        </div>
                        <h3 className="text-neutral-900 font-bold text-lg">Tidak ada sesi aktif</h3>
                        <p className="text-neutral-500 text-sm mt-1 max-w-xs mx-auto">Sesi absensi akan muncul di sini saat acara dimulai oleh admin.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: History */}
         <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden h-full">
               <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Clock size={18} />
                     </div>
                     Riwayat Kehadiran
                  </h2>
               </div>
               <div className="overflow-y-auto max-h-[500px] p-2">
                  {historySessions.length > 0 ? (
                     <div className="space-y-2">
                        {historySessions.map(session => (
                           <div key={session.id} className="p-4 rounded-xl hover:bg-neutral-50 transition border border-transparent hover:border-neutral-100 group">
                              <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-neutral-800 text-sm leading-tight group-hover:text-emerald-700 transition">{session.name}</h4>
                                 <span className="text-emerald-500 bg-emerald-50 p-1 rounded-full"><CheckCircle2 size={14} /></span>
                              </div>
                              <p className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                                 <Calendar size={12} /> {session.date}
                              </p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="p-8 text-center text-neutral-400 text-sm italic">
                        Belum ada riwayat kehadiran.
                     </div>
                  )}
               </div>
               {totalAttendance > 5 && (
                  <div className="p-4 border-t border-neutral-100 text-center bg-neutral-50/30">
                     <button className="text-[#064e3b] text-sm font-bold hover:text-[#047857] transition">Lihat Semua Riwayat</button>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* --- E-KTA MODAL --- */}
      <AnimatePresence>
        {isCardOpen && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
           >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="relative max-w-md w-full"
              >
                 <div className="flex justify-end mb-4">
                    <button onClick={() => setIsCardOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
                       <X size={24} />
                    </button>
                 </div>
                 
                 {renderCard()}

                 <div className="mt-8 flex justify-center gap-4">
                    <button 
                      onClick={() => setIsFlipped(!isFlipped)} 
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition"
                    >
                       <RotateCw size={18} className={isFlipped ? "rotate-180 transition duration-500" : ""} />
                       Putar Kartu
                    </button>
                    <button 
                      onClick={handleDownloadCard} 
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                    >
                       <Download size={18} />
                       Simpan
                    </button>
                 </div>
                 <p className="text-center text-white/50 text-xs mt-4">Ketuk kartu untuk membalik sisi.</p>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* --- CAMERA MODAL OVERLAY --- */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-neutral-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-neutral-700"
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                <div>
                   <h3 className="text-white font-bold text-lg drop-shadow-md">Ambil Foto Kehadiran</h3>
                   <div className="text-neutral-300 text-xs flex items-center gap-2 drop-shadow-md mt-1">
                      {locationStatus === 'loading' && <span className="animate-spin w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full"></span>}
                      {locationStatus === 'error' && <AlertCircle size={12} className="text-red-500" />}
                      {locationStatus === 'success' && <MapPin size={12} className="text-emerald-500" />}
                      <span className="truncate max-w-[200px]">{locationName}</span>
                      {locationStatus !== 'loading' && (
                         <button onClick={fetchLocation} className="text-amber-400 underline ml-2">Refresh</button>
                      )}
                   </div>
                </div>
                <button onClick={closeCameraModal} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition">
                  <X size={20} />
                </button>
              </div>

              {/* Camera Viewport */}
              <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
                {!capturedImage ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    {/* Grid Overlay for framing */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                       <div className="border-r border-white"></div><div className="border-r border-white"></div><div></div>
                       <div className="border-r border-t border-white"></div><div className="border-r border-t border-white"></div><div className="border-t border-white"></div>
                       <div className="border-r border-t border-white"></div><div className="border-r border-t border-white"></div><div className="border-t border-white"></div>
                    </div>
                  </>
                ) : (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls */}
              <div className="bg-neutral-900 p-6 flex justify-center items-center gap-6">
                 {!capturedImage ? (
                   <button 
                     onClick={takePhoto}
                     disabled={locationStatus !== 'success'}
                     className={`w-20 h-20 rounded-full border-4 flex items-center justify-center relative group transition-all ${locationStatus === 'success' ? 'border-white cursor-pointer' : 'border-gray-600 opacity-50 cursor-not-allowed'}`}
                   >
                      <div className={`w-16 h-16 rounded-full transition-transform ${locationStatus === 'success' ? 'bg-white group-active:scale-90' : 'bg-gray-600'}`}></div>
                   </button>
                 ) : (
                   <div className="flex w-full gap-4">
                      <button 
                        onClick={retakePhoto}
                        className="flex-1 py-3 bg-neutral-800 text-white rounded-xl font-bold border border-neutral-700 hover:bg-neutral-700 flex items-center justify-center gap-2"
                      >
                         <RefreshCw size={18} /> Ulangi
                      </button>
                      <button 
                        onClick={submitAttendance}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-500 flex items-center justify-center gap-2"
                      >
                         {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                         ) : (
                            <>
                              <CheckCircle2 size={18} /> Kirim Absen
                            </>
                         )}
                      </button>
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
