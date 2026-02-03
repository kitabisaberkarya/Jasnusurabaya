import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, UserCheck, Calendar, Clock, Award, Shield, Camera, RefreshCw, X, CheckCircle2, AlertTriangle, CreditCard, Download, RotateCw, QrCode, Wifi, AlertCircle, RefreshCcw, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MemberArea: React.FC = () => {
  const { currentUser, attendanceSessions, markAttendance, showToast, refreshData, isLoading } = useApp();
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

  // HAVERSINE FORMULA to calculate distance
  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
  }

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
          
          // Calculate Distance if session has Geo
          const session = attendanceSessions.find(s => s.id === sessionId);
          if (session && session.latitude && session.longitude) {
              const dist = getDistanceFromLatLonInMeters(currentLat, currentLng, session.latitude, session.longitude);
              setCalculatedDistance(dist);
          } else {
              setCalculatedDistance(0); // No Geo restriction
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
    
    // Check Distance Limit
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

        // Watermark Logic
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

  // Card Rendering code remains the same... (omitted for brevity, assume existing card logic is here)
  const renderCard = () => (
      // ... Reusing the exact Card Code from previous file ...
      <div className="w-full max-w-sm mx-auto h-[230px] md:h-[250px] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1200px' }}>
         <motion.div className="relative w-full h-full shadow-2xl rounded-2xl" initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} style={{ transformStyle: 'preserve-3d' }}>
            {/* Front */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] p-6 text-white backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="font-serif font-bold text-amber-400">JSN SURABAYA</h3>
                      <p className="text-[10px] tracking-widest text-emerald-200">KARTU ANGGOTA</p>
                   </div>
                   <Wifi className="text-white/20 rotate-90" />
                </div>
                <div className="mt-8">
                   <p className="text-xs text-emerald-300">Nomor Anggota</p>
                   <p className="font-mono text-xl tracking-widest">{currentUser.nia || 'PENDING'}</p>
                </div>
                <div className="mt-auto pt-6 flex justify-between items-end">
                   <div>
                      <p className="text-lg font-bold font-serif">{currentUser.name}</p>
                      <p className="text-xs text-emerald-300">{currentUser.wilayah}</p>
                   </div>
                   <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                      <span className="text-[8px] font-bold">JSN</span>
                   </div>
                </div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-[#1a1c1c] p-6 text-white" style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden' }}>
               <div className="w-full h-10 bg-black -mx-6 mb-4"></div>
               <div className="flex gap-4">
                  <div className="flex-grow">
                     <div className="h-8 bg-white/10 mb-2"></div>
                     <p className="text-[8px] text-gray-500">Kartu ini adalah bukti keanggotaan sah.</p>
                  </div>
                  <QrCode size={48} className="text-white" />
               </div>
            </div>
         </motion.div>
      </div>
  );

  const activeSessions = attendanceSessions.filter(s => s.isOpen);
  const totalAttendance = attendanceSessions.filter(s => s.attendees.includes(currentUser.id)).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-8 lg:py-12 pb-24 lg:pb-12">
      {/* Existing Profile Card Code ... */}
       <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 overflow-hidden mb-8 p-8 relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
               <div className="w-24 h-24 bg-emerald-900 text-white rounded-full flex items-center justify-center font-serif text-4xl border-4 border-amber-400 shadow-xl">
                  {currentUser.name.charAt(0)}
               </div>
               <div className="text-center md:text-left flex-grow">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-emerald-900">{currentUser.name}</h1>
                  <p className="text-amber-600 font-bold tracking-wider text-sm mt-1">{currentUser.nia || 'NIA BELUM TERBIT'}</p>
                  <p className="text-neutral-500 text-sm">{currentUser.wilayah}</p>
               </div>
               <button onClick={() => setIsCardOpen(true)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition flex items-center gap-2">
                  <CreditCard size={18} /> E-KTA
               </button>
          </div>
       </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
               <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2"><Calendar size={18} /> Sesi Absensi Aktif</h2>
                  <button onClick={handleRefresh} className={`p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCcw size={16} /></button>
               </div>
               <div className="p-6">
                  {activeSessions.length > 0 ? (
                     <div className="grid gap-4">
                        {activeSessions.map(session => {
                           const hasAttended = session.attendees.includes(currentUser.id);
                           return (
                              <div key={session.id} className="border border-neutral-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white hover:shadow-lg transition-all duration-300 group">
                                 <div>
                                    <h3 className="font-bold text-xl text-[#064e3b]">{session.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                       <span className="flex items-center gap-1"><Clock size={16} /> {session.date}</span>
                                       {session.latitude ? (
                                          <span className="text-amber-600 flex items-center gap-1"><MapPin size={14}/> Wajib di Lokasi (Max {session.radius}m)</span>
                                       ) : <span className="text-green-600 flex items-center gap-1"><MapPin size={14}/> Bebas Lokasi</span>}
                                    </div>
                                 </div>
                                 {hasAttended ? (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-100"><CheckCircle2 size={20} /> Sudah Hadir</div>
                                 ) : (
                                    <button onClick={() => startAttendanceProcess(session.id)} className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 bg-gradient-to-r from-[#064e3b] to-[#047857] text-white shadow-lg hover:-translate-y-0.5 transition-all">
                                       <Camera size={20} /> Absen Sekarang
                                    </button>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="text-center py-10 text-neutral-400">Tidak ada sesi aktif.</div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isCardOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-md w-full">
                 <div className="flex justify-end mb-4"><button onClick={() => setIsCardOpen(false)} className="p-2 bg-white/10 rounded-full text-white"><X size={24} /></button></div>
                 {renderCard()}
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
            <motion.div className="bg-neutral-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-neutral-700">
              <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between bg-black/50 backdrop-blur-md">
                <div>
                    <h3 className="text-white font-bold">Ambil Foto</h3>
                    {/* Distance Indicator */}
                    <div className="text-xs mt-1 flex items-center gap-2">
                        {locationStatus === 'loading' && <span className="text-amber-400">Mencari Lokasi...</span>}
                        {locationStatus === 'success' && (
                             <span className={calculatedDistance && calculatedDistance > 100 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                {locationName} {calculatedDistance !== null ? `(${Math.round(calculatedDistance)}m)` : ''}
                             </span>
                        )}
                    </div>
                </div>
                <button onClick={closeCameraModal} className="text-white"><X size={24} /></button>
              </div>
              <div className="relative aspect-[3/4] bg-black">
                {!capturedImage ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" /> : <img src={capturedImage} className="w-full h-full object-cover" />}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="bg-neutral-900 p-6 flex justify-center">
                 {!capturedImage ? (
                   <button onClick={takePhoto} disabled={locationStatus !== 'success'} className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${locationStatus === 'success' ? 'border-white' : 'border-gray-600 opacity-50'}`}>
                      <div className="w-16 h-16 bg-white rounded-full"></div>
                   </button>
                 ) : (
                   <div className="flex gap-4 w-full">
                      <button onClick={retakePhoto} className="flex-1 py-3 bg-neutral-800 text-white rounded-xl">Ulangi</button>
                      <button onClick={submitAttendance} disabled={isSubmitting} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl">{isSubmitting ? 'Mengirim...' : 'Kirim'}</button>
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
