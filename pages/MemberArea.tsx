import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, UserCheck, Calendar, Clock, Award, Shield, Camera, RefreshCw, X, CheckCircle2, AlertTriangle, CreditCard, Download, RotateCw, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MemberArea: React.FC = () => {
  const { currentUser, attendanceSessions, markAttendance, showToast } = useApp();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("Mencari lokasi...");
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
        
        const formattedAddress = [village, city].filter(Boolean).join(', ');
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
        },
        (error) => {
          console.error(error);
          setLocationName("Lokasi Tidak Dikenal");
          showToast("Gagal mendeteksi lokasi, pastikan GPS aktif.", "error");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationName("GPS Tidak Support");
    }

    startCamera();
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
        
        const gradientHeight = Math.floor(h * 0.25);
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
        
        const metaText = `${timeString} • ${locationName}`;
        context.fillText(metaText, centerX, h - fontSizeMeta, w - (padding * 2));

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

  // --- COMPONENT: Digital Card ---
  const renderCard = () => (
    <div className="perspective-1000 w-full max-w-sm mx-auto h-[220px] md:h-[240px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div 
        className="relative w-full h-full transition-all duration-700 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          <div className="absolute -right-10 -bottom-20 w-48 h-48 bg-secondary-500 rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10 p-5 h-full flex flex-col justify-between text-white">
             {/* Header */}
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <img src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1768810509/Logoo_stivmi.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                   <div>
                      <h3 className="font-serif font-bold text-sm leading-none tracking-wide text-secondary-400">JAMIYAH SHOLAWAT</h3>
                      <h4 className="font-bold text-xs tracking-[0.2em] mt-0.5">NARIYAH SURABAYA</h4>
                   </div>
                </div>
                <div className="text-[10px] font-bold border border-secondary-500/50 text-secondary-400 px-2 py-0.5 rounded uppercase tracking-wider">
                   Kartu Anggota
                </div>
             </div>

             {/* Content */}
             <div className="flex items-center gap-4 mt-2">
                <div className="w-20 h-20 bg-white/10 rounded-xl border border-white/20 overflow-hidden backdrop-blur-sm shadow-inner flex items-center justify-center">
                   <span className="text-4xl font-bold text-white/30">{currentUser.name.charAt(0)}</span>
                </div>
                <div className="space-y-1">
                   <div>
                      <p className="text-[10px] text-primary-200 uppercase tracking-wider">Nama Anggota</p>
                      <p className="font-bold text-lg leading-tight truncate w-40">{currentUser.name}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-primary-200 uppercase tracking-wider">Nomor Induk (NIA)</p>
                      <p className="font-mono text-secondary-400 tracking-wide">{currentUser.nia}</p>
                   </div>
                </div>
             </div>

             {/* Footer */}
             <div className="flex justify-between items-end">
                <div className="text-[10px] text-primary-300">
                   <p>Bergabung: {currentUser.joinedAt}</p>
                   <p className="font-medium text-white">{currentUser.wilayah}</p>
                </div>
                <div className="bg-white p-1 rounded">
                   <QrCode size={32} className="text-black" />
                </div>
             </div>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-neutral-800 to-neutral-900"
          style={{ transform: "rotateY(180deg)" }}
        >
           <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')]"></div>
           
           <div className="relative z-10 p-6 h-full flex flex-col text-white">
              <h3 className="text-center font-bold text-secondary-500 tracking-widest text-xs mb-4">KETENTUAN & VISI</h3>
              
              <div className="flex-grow space-y-3 text-[10px] text-neutral-300 leading-relaxed">
                 <p>1. Kartu ini adalah bukti sah keanggotaan Jamiyah Sholawat Nariyah Surabaya.</p>
                 <p>2. Barang siapa yang menemukan kartu ini dimohon mengembalikan ke sekretariat pusat.</p>
                 <p className="italic text-neutral-400">"Menyemai Cinta, Meraih Syafaat, Membangun Ukhuwah Islamiyah"</p>
              </div>

              <div className="mt-2 flex justify-between items-end border-t border-white/10 pt-2">
                 <div className="text-[8px] text-neutral-500">
                    www.jsn-surabaya.or.id
                    <br/>Jl. Masjid Al-Akbar No. 1
                 </div>
                 <div className="text-center">
                    <div className="h-8 mb-1 flex items-end justify-center">
                       <span className="font-serif italic text-xl text-white/50">Ttd.Ketua</span>
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400">Ketua Umum</p>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-8 lg:py-12 pb-24 lg:pb-12">
      
      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-lg shadow-neutral-200/50 border border-neutral-100 overflow-hidden mb-8 relative">
         <div className="bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center h-32 absolute w-full top-0 left-0 opacity-20"></div>
         <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-8 text-white relative z-10 bg-opacity-95 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
               <div className="relative">
                 <div className="absolute inset-0 bg-secondary-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary-700 font-bold text-3xl shadow-2xl border-4 border-white relative z-10">
                    {currentUser.name.charAt(0)}
                 </div>
                 <div className="absolute bottom-1 right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-primary-800 z-20"></div>
               </div>
               
               <div className="text-center md:text-left flex-grow">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold mb-1 tracking-wide">{currentUser.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-primary-100 text-sm font-medium mt-2">
                     <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                        <UserCheck size={14} className="text-secondary-400" /> NIA: {currentUser.nia}
                     </span>
                     <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                        <MapPin size={14} className="text-secondary-400" /> {currentUser.wilayah}
                     </span>
                  </div>
               </div>
               
               <div className="mt-6 md:mt-0 flex flex-row md:flex-col gap-4 items-center">
                  <div className="bg-gradient-to-b from-white/10 to-transparent p-4 rounded-2xl border border-white/20 text-center min-w-[120px]">
                      <p className="text-4xl font-bold tracking-tighter">{totalAttendance}</p>
                      <p className="text-[10px] uppercase tracking-widest text-secondary-300 font-bold mt-1">Total Hadir</p>
                  </div>
                  <button 
                    onClick={() => setIsCardOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-secondary-500/20 transition transform hover:-translate-y-1"
                  >
                    <CreditCard size={16} /> E-KTA
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
                     <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center">
                        <Calendar size={18} />
                     </div>
                     Sesi Absensi Aktif
                  </h2>
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full animate-pulse">
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
                                    <h3 className="font-bold text-xl text-primary-900 group-hover:text-primary-700 transition">{session.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                       <span className="flex items-center gap-1"><Clock size={16} className="text-neutral-400" /> {session.date}</span>
                                       <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                       <span className="text-secondary-600 font-medium">Wajib Hadir</span>
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
                                       className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5 transition-all"
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
                                 <h4 className="font-bold text-neutral-800 text-sm leading-tight group-hover:text-primary-700 transition">{session.name}</h4>
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
                     <button className="text-primary-700 text-sm font-bold hover:text-primary-900 transition">Lihat Semua Riwayat</button>
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
                    <button onClick={() => setIsCardOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition">
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
                      className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-secondary-500/20 transition"
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
                   <p className="text-neutral-300 text-xs flex items-center gap-1 drop-shadow-md">
                      <MapPin size={10} className="text-secondary-500" /> 
                      {locationName}
                   </p>
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
                     className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
                   >
                      <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform"></div>
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
                        className="flex-1 py-3 bg-secondary-600 text-white rounded-xl font-bold hover:bg-secondary-500 flex items-center justify-center gap-2"
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