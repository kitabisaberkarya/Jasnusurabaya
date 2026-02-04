
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, User, RegistrationInput, MemberStatus, UserRole, AttendanceSession, NewsItem, ToastMessage, AttendanceRecord, SiteConfig, ProfilePage, MediaPost, AppContextType, GalleryItem, SliderItem, Korwil, BackupData } from '../types';
import { MOCK_INITIAL_STATE } from '../constants';
import { supabase } from '../lib/supabase';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(MOCK_INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch & Realtime Setup
  useEffect(() => {
    // Jalankan fetch data
    fetchData();

    // Setup Timeout Safety: Jika dalam 3 detik data belum load (koneksi lambat), paksa buka UI
    const safetyTimeout = setTimeout(() => {
        setIsLoading(prev => {
            if (prev) return false;
            return prev;
        });
    }, 3000);

    // REALTIME SUBSCRIPTION setup
    const channel = supabase.channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_config' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
             const newConfig = payload.new as any;
             setState(prev => ({
                ...prev,
                siteConfig: {
                  appName: newConfig.app_name,
                  orgName: newConfig.org_name,
                  description: newConfig.description,
                  address: newConfig.address,
                  email: newConfig.email,
                  phone: newConfig.phone,
                  logoUrl: newConfig.logo_url
                }
             }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_sessions' },
        () => { refreshSessions(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
        () => { refreshNews(); }
      )
      .subscribe();

    return () => {
      clearTimeout(safetyTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshSessions = async () => {
      const { data } = await supabase.from('attendance_sessions').select('*').order('id', { ascending: false });
      if (data) {
        const mapped = data.map((s: any) => ({
            ...s, isOpen: s.is_open, attendees: Array.isArray(s.attendees) ? s.attendees : [],
            latitude: s.latitude, longitude: s.longitude, radius: s.radius, mapsUrl: s.maps_url
        }));
        setState(prev => ({ ...prev, attendanceSessions: mapped }));
      }
  };

  const refreshNews = async () => {
      const { data } = await supabase.from('news').select('*').order('id', { ascending: false });
      if (data) {
         const mapped = data.map((n: any) => ({ ...n, imageUrl: n.image_url }));
         setState(prev => ({ ...prev, news: mapped }));
      }
  };

  // PROGRESSIVE FETCH STRATEGY
  const fetchData = async () => {
    // 1. CRITICAL PHASE: Fetch Site Config ONLY
    try {
        const { data: config } = await supabase.from('site_config').select('*').single();
        
        if (config) {
            const mappedConfig = {
                appName: config.app_name,
                orgName: config.org_name,
                description: config.description,
                address: config.address,
                email: config.email,
                phone: config.phone,
                logoUrl: config.logo_url
            };
            setState(prev => ({ ...prev, siteConfig: mappedConfig }));
        }
    } catch (err) {
        console.error("Config fetch error", err);
    }
    
    // UNBLOCK UI SEKARANG
    setIsLoading(false);

    // 2. BACKGROUND PHASE: Fetch Heavy Content
    try {
      const [
        { data: users }, 
        { data: news }, 
        { data: gallery }, 
        { data: sliders },
        { data: media },
        { data: sessions }, 
        { data: registrations },
        { data: records },
        { data: profiles },
        { data: korwils }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('news').select('*').order('id', { ascending: false }),
        supabase.from('gallery').select('*').order('id', { ascending: false }),
        supabase.from('sliders').select('*').order('id', { ascending: true }),
        supabase.from('media_posts').select('*').order('id', { ascending: false }),
        supabase.from('attendance_sessions').select('*').order('id', { ascending: false }),
        supabase.from('registrations').select('*').order('id', { ascending: false }),
        supabase.from('attendance_records').select('*').order('timestamp', { ascending: false }),
        supabase.from('profile_pages').select('*'),
        supabase.from('korwils').select('*').order('name', { ascending: true })
      ]);
      
      const mappedSessions = (sessions || []).map((s: any) => ({
        ...s,
        isOpen: s.is_open,
        attendees: Array.isArray(s.attendees) ? s.attendees : [],
        latitude: s.latitude,
        longitude: s.longitude,
        radius: s.radius,
        mapsUrl: s.maps_url
      }));

      const mappedNews = (news || []).map((n: any) => ({
        ...n,
        imageUrl: n.image_url
      }));

      const mappedSliders = (sliders || []).map((s: any) => ({
        id: s.id,
        imageUrl: s.image_url,
        title: s.title,
        description: s.description
      }));

      const mappedMedia = (media || []).map((m: any) => ({
        ...m,
        embedUrl: m.embed_url,
        createdAt: m.created_at
      }));

      const mappedRecords = (records || []).map((r: any) => ({
        id: r.id,
        sessionId: r.session_id,
        userId: r.user_id,
        userName: r.user_name,
        timestamp: r.timestamp,
        photoUrl: r.photo_url,
        location: r.location
      }));

      setState(prev => ({
        ...prev,
        users: users || [],
        news: mappedNews,
        gallery: gallery || [],
        sliders: mappedSliders,
        mediaPosts: mappedMedia,
        profilePages: (profiles as ProfilePage[]) || [],
        attendanceSessions: mappedSessions,
        registrations: registrations || [],
        attendanceRecords: mappedRecords || [],
        korwils: (korwils as Korwil[]) || []
      }));

    } catch (error) {
      console.error("Error fetching background data:", error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setState(prev => ({ ...prev, toasts: [...prev.toasts, newToast] }));
    setTimeout(() => removeToast(newToast.id), 4000);
  };

  const removeToast = (id: number) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  };

  const login = async (identifier: string, password: string): Promise<User | null> => {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    // 1. Super Admin Hardcoded (Fallback)
    if (cleanId.toLowerCase() === 'jasnu.nariyahsurabaya@gmail.com' && cleanPass === 'JasnuNariyahSurabaya1926') {
      const masterAdmin: User = {
        id: 999999,
        name: 'Administrator JSN (Super)',
        email: 'jasnu.nariyahsurabaya@gmail.com',
        role: UserRole.SUPER_ADMIN,
        status: MemberStatus.ACTIVE,
        nia: 'ADMIN-MASTER',
        password: cleanPass,
        wilayah: 'Surabaya Pusat',
        joinedAt: new Date().toISOString()
      };
      setState(prev => ({ ...prev, currentUser: masterAdmin }));
      showToast(`Login Super Admin Berhasil`, 'success');
      return masterAdmin;
    }

    try {
      // 2. Check Database for Users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${cleanId},nia.eq.${cleanId}`)
        .eq('password', cleanPass)
        .single();

      if (error || !data) return null;

      const user = data as User;
      const rawRole = (user.role || '').toLowerCase();
      
      const userRole = 
         rawRole === 'admin' ? UserRole.SUPER_ADMIN :
         rawRole === 'korwil' ? UserRole.ADMIN_KORWIL :
         rawRole === 'pengurus' ? UserRole.ADMIN_PENGURUS :
         UserRole.MEMBER;

      const loggedInUser = { ...user, role: userRole };

      setState(prev => ({ ...prev, currentUser: loggedInUser }));
      
      if (userRole === UserRole.ADMIN_KORWIL) showToast(`Login Korwil: ${data.name}`, 'success');
      else if (userRole === UserRole.ADMIN_PENGURUS) showToast(`Login Pengurus: ${data.name}`, 'success');
      else showToast(`Ahlan wa sahlan, ${data.name}`, 'success');
      
      return loggedInUser;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    showToast('Anda telah keluar dari sistem', 'info');
  };

  // UPLOAD FILE HELPER
  const uploadFile = async (file: File, folder: string = 'general'): Promise<string | null> => {
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('public-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw uploadError;
      }

      // Get Public URL
      const { data } = supabase.storage.from('public-files').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error(error);
      showToast("Gagal mengupload file. Cek ukuran atau koneksi.", "error");
      return null;
    }
  };

  const register = async (data: RegistrationInput) => {
    try {
      const { error } = await supabase.from('registrations').insert([{
        ...data,
        status: MemberStatus.PENDING,
        date: new Date().toISOString().split('T')[0]
      }]);
      if (error) throw error;
      
      const { data: newData } = await supabase.from('registrations').select('*').order('id', { ascending: false });
      setState(prev => ({ ...prev, registrations: newData || [] }));
    } catch (error) {
      console.error("Registration failed", error);
      showToast("Gagal mendaftar. Silakan coba lagi.", "error");
    }
  };

  // --- NEW: CREATE ADMIN DIRECTLY ---
  const createAdminUser = async (name: string, email: string, role: UserRole, wilayah: string, password: string): Promise<boolean> => {
     try {
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        
        let niaPrefix = "ADM";
        if (role === UserRole.ADMIN_KORWIL) niaPrefix = `KORWIL-${wilayah.replace(/\s+/g, '-').toUpperCase()}`;
        if (role === UserRole.ADMIN_PENGURUS) niaPrefix = `PENGURUS`;
        
        const nia = `${niaPrefix}-${year}-${random}`;

        const { error } = await supabase.from('users').insert([{
             name,
             email,
             role: role,
             status: MemberStatus.ACTIVE,
             nia,
             password,
             wilayah,
             joined_at: new Date().toISOString().split('T')[0]
        }]);

        if (error) throw error;
        
        // Refresh users
        const { data: newUsers } = await supabase.from('users').select('*');
        setState(prev => ({ ...prev, users: newUsers || [] }));
        
        showToast(`Akun ${role.toUpperCase()} berhasil dibuat. NIA: ${nia}`, 'success');
        return true;
     } catch (err) {
        console.error(err);
        showToast("Gagal membuat akun admin", "error");
        return false;
     }
  };

  const changePassword = async (userId: number, newPass: string): Promise<boolean> => {
      try {
          const { error } = await supabase.from('users').update({ password: newPass }).eq('id', userId);
          if (error) throw error;
          showToast("Password berhasil diubah", "success");
          return true;
      } catch (err) {
          console.error(err);
          showToast("Gagal mengubah password", "error");
          return false;
      }
  };

  // STEP 1 APPROVAL: KORWIL
  const verifyMemberByKorwil = async (regId: number) => {
     try {
        const { error } = await supabase
          .from('registrations')
          .update({ status: MemberStatus.VERIFIED_KORWIL })
          .eq('id', regId);
        
        if (error) throw error;

        setState(prev => ({
          ...prev,
          registrations: prev.registrations.map(r => r.id === regId ? { ...r, status: MemberStatus.VERIFIED_KORWIL } : r)
        }));

        showToast("Anggota diverifikasi Korwil. Menunggu approval Pengurus.", "success");
     } catch (error) {
        showToast("Gagal verifikasi korwil", "error");
     }
  };

  // STEP 2 APPROVAL: PENGURUS (FINAL)
  const approveMemberFinal = async (regId: number) => {
    const candidate = state.registrations.find(r => r.id === regId);
    if (!candidate) return;

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const nia = `JSN-${year}-${random}`;

    try {
      const { error: insertError } = await supabase.from('users').insert([{
        name: candidate.name,
        email: candidate.email,
        role: UserRole.MEMBER,
        status: MemberStatus.ACTIVE,
        nia: nia,
        nik: candidate.nik,
        password: candidate.password,
        wilayah: candidate.wilayah,
        phone: candidate.phone,
        address: candidate.address,
        joined_at: new Date().toISOString().split('T')[0]
      }]);

      if (insertError) throw insertError;
      
      await supabase.from('registrations').delete().eq('id', regId);
      
      // Refresh user data (background)
      const { data: newUsers } = await supabase.from('users').select('*');
      const { data: newRegs } = await supabase.from('registrations').select('*').order('id', { ascending: false });
      
      setState(prev => ({ 
          ...prev, 
          users: newUsers || prev.users, 
          registrations: newRegs || [] 
      }));
      
      showToast(`Anggota ${candidate.name} diterima. NIA: ${nia}`, 'success');
    } catch (error) {
      console.error(error);
      showToast("Gagal memproses approval final", "error");
    }
  };

  const rejectMember = async (regId: number) => {
    try {
      await supabase.from('registrations').delete().eq('id', regId);
      setState(prev => ({ ...prev, registrations: prev.registrations.filter(r => r.id !== regId) }));
      showToast('Permohonan anggota ditolak', 'info');
    } catch (error) {
      showToast("Gagal menolak member", "error");
    }
  };

  const updateMember = async (userId: number, data: Partial<User>) => {
    try {
      const updates: any = {};
      if (data.name) updates.name = data.name;
      if (data.nik) updates.nik = data.nik;
      if (data.phone) updates.phone = data.phone;
      if (data.address) updates.address = data.address;
      if (data.wilayah) updates.wilayah = data.wilayah;
      if (data.email) updates.email = data.email;
      if (data.role) updates.role = data.role;

      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;

      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, ...data } : u)
      }));
      showToast("Data anggota berhasil diperbarui", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui data anggota", "error");
    }
  };

  const deleteMember = async (userId: number) => {
    try {
      // 1. Delete Attendance Records (Cascade manual if needed)
      await supabase.from('attendance_records').delete().eq('user_id', userId);
      
      // 2. Delete User
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      
      // 3. Update State Locally
      setState(prev => ({ 
          ...prev, 
          users: prev.users.filter(u => u.id !== userId),
          attendanceRecords: prev.attendanceRecords.filter(r => r.userId !== userId)
      }));
      
      showToast("Data anggota berhasil dihapus.", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus anggota. Cek database policy.", "error");
    }
  };

  const resetMemberPassword = async (userId: number) => {
    try {
      const defaultPass = "12345678";
      const { error } = await supabase.from('users').update({ password: defaultPass }).eq('id', userId);
      if (error) throw error;
      showToast(`Password direset: ${defaultPass}`, "success");
    } catch (error) {
       console.error(error);
       showToast("Gagal mereset password", "error");
    }
  };

  // SESSION MANAGEMENT WITH GEO
  const createSession = async (name: string, lat?: number, lng?: number, rad?: number, mapsUrl?: string) => {
    try {
      const { error } = await supabase.from('attendance_sessions').insert([{
        name,
        date: new Date().toISOString().split('T')[0],
        is_open: true,
        attendees: [],
        latitude: lat || null,
        longitude: lng || null,
        radius: rad || 100,
        maps_url: mapsUrl || null
      }]);
      if (error) throw error;
      refreshSessions();
      showToast('Sesi absensi baru berhasil dibuat & dibuka', 'success');
    } catch (error) {
      showToast("Gagal membuat sesi", "error");
    }
  };

  const updateSession = async (sessionId: number, name: string, lat?: number, lng?: number, rad?: number, mapsUrl?: string) => {
    try {
      const updates: any = { name };
      if (lat !== undefined) updates.latitude = lat;
      if (lng !== undefined) updates.longitude = lng;
      if (rad !== undefined) updates.radius = rad;
      if (mapsUrl !== undefined) updates.maps_url = mapsUrl;

      const { error } = await supabase
        .from('attendance_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        attendanceSessions: prev.attendanceSessions.map(s => s.id === sessionId ? { ...s, name, latitude: lat, longitude: lng, radius: rad, mapsUrl } : s)
      }));
      showToast("Data sesi berhasil diperbarui", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui sesi", "error");
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      await supabase.from('attendance_records').delete().eq('session_id', sessionId);
      const { error } = await supabase.from('attendance_sessions').delete().eq('id', sessionId);
      if (error) throw error;

      setState(prev => ({
        ...prev,
        attendanceSessions: prev.attendanceSessions.filter(s => s.id !== sessionId),
        attendanceRecords: prev.attendanceRecords.filter(r => r.sessionId !== sessionId)
      }));
      showToast("Sesi absensi & data terkait berhasil dihapus", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus sesi", "error");
    }
  };

  const toggleSession = async (sessionId: number) => {
    const session = state.attendanceSessions.find(s => s.id === sessionId);
    if (!session) return;
    try {
      const newStatus = !session.isOpen;
      const { error } = await supabase
        .from('attendance_sessions')
        .update({ is_open: newStatus })
        .eq('id', sessionId);
        
      if (error) throw error;

      setState(prev => ({
        ...prev,
        attendanceSessions: prev.attendanceSessions.map(s => s.id === sessionId ? { ...s, isOpen: newStatus } : s)
      }));
    } catch (error) {
      console.error(error);
      showToast("Gagal mengubah status sesi", "error");
    }
  };

  const markAttendance = async (sessionId: number, userId: number, photoUrl: string, location: string, distance?: number): Promise<boolean> => {
    const session = state.attendanceSessions.find(s => s.id === sessionId);
    const user = state.users.find(u => u.id === userId) || (state.currentUser?.id === userId ? state.currentUser : null);
    
    if (!session || !session.isOpen || !user) return false;
    
    if (session.latitude && session.longitude && session.radius && distance !== undefined) {
       if (distance > session.radius) {
          showToast(`Gagal Absen: Lokasi Anda terlalu jauh (${Math.round(distance)}m). Maksimal ${session.radius}m dari lokasi majelis.`, 'error');
          return false;
       }
    }

    if (session.attendees.includes(userId)) return false;

    const recordId = `ATT-${Date.now()}-${userId}`;

    try {
      const { error: recordError } = await supabase.from('attendance_records').insert([{
        id: recordId,
        session_id: sessionId,
        user_id: userId,
        user_name: user.name,
        timestamp: new Date().toLocaleString('id-ID'),
        photo_url: photoUrl,
        location: location
      }]);
      if (recordError) throw recordError;

      const newAttendees = [...session.attendees, userId];
      await supabase.from('attendance_sessions').update({ attendees: newAttendees }).eq('id', sessionId);

      setState(prev => ({
        ...prev,
        attendanceSessions: prev.attendanceSessions.map(s => s.id === sessionId ? { ...s, attendees: newAttendees } : s),
        attendanceRecords: [{
          id: recordId, sessionId, userId, userName: user.name, timestamp: new Date().toLocaleString('id-ID'), photoUrl, location
        }, ...prev.attendanceRecords]
      }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const updateAttendanceRecord = async (recordId: string, data: Partial<AttendanceRecord>) => {
    try {
      const updates: any = {};
      if (data.location) updates.location = data.location;
      if (data.userName) updates.user_name = data.userName;
      if (data.timestamp) updates.timestamp = data.timestamp;

      const { error } = await supabase.from('attendance_records').update(updates).eq('id', recordId);
      if (error) throw error;

      setState(prev => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.map(r => r.id === recordId ? { ...r, ...data } : r)
      }));
      showToast("Data absensi berhasil diperbarui", "success");
    } catch (error) {
      console.error("Update attendance failed", error);
      showToast("Gagal memperbarui data absensi", "error");
    }
  };

  const deleteAttendanceRecord = async (recordId: string, sessionId: number, userId: number) => {
    try {
      const { error } = await supabase.from('attendance_records').delete().eq('id', recordId);
      if (error) throw error;

      const session = state.attendanceSessions.find(s => s.id === sessionId);
      if (session) {
        const newAttendees = session.attendees.filter(id => id !== userId);
        await supabase.from('attendance_sessions').update({ attendees: newAttendees }).eq('id', sessionId);
        
        setState(prev => ({
          ...prev,
          attendanceSessions: prev.attendanceSessions.map(s => s.id === sessionId ? { ...s, attendees: newAttendees } : s),
          attendanceRecords: prev.attendanceRecords.filter(r => r.id !== recordId)
        }));
      } else {
        setState(prev => ({
          ...prev,
          attendanceRecords: prev.attendanceRecords.filter(r => r.id !== recordId)
        }));
      }

      showToast("Data absensi berhasil dihapus", "success");
    } catch (error) {
      console.error("Delete attendance failed", error);
      showToast("Gagal menghapus data absensi", "error");
    }
  };

  const addNews = async (newsData: Omit<NewsItem, 'id'>) => {
    try {
      const { error } = await supabase.from('news').insert([{
        title: newsData.title, excerpt: newsData.excerpt, content: newsData.content, date: newsData.date, image_url: newsData.imageUrl
      }]);
      if (error) throw error;
      refreshNews(); showToast('Berita berhasil dipublikasikan', 'success');
    } catch (error) { showToast("Gagal mempublish berita", "error"); }
  };

  const updateNews = async (id: number, newsData: Partial<NewsItem>) => {
    try {
      const updates: any = { title: newsData.title, excerpt: newsData.excerpt, content: newsData.content };
      if (newsData.imageUrl) updates.image_url = newsData.imageUrl;
      const { error } = await supabase.from('news').update(updates).eq('id', id);
      if (error) throw error;
      refreshNews(); showToast('Berita berhasil diperbarui', 'success');
    } catch (error) { showToast("Gagal memperbarui berita", "error"); }
  };

  const deleteNews = async (id: number) => {
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, news: prev.news.filter(n => n.id !== id) }));
      showToast('Berita berhasil dihapus', 'success');
    } catch (error) { showToast("Gagal menghapus berita", "error"); }
  };

  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
    try {
      const { error } = await supabase.from('gallery').insert([{ type: item.type, url: item.url, caption: item.caption }]);
      if (error) throw error;
      
      const { data } = await supabase.from('gallery').select('*').order('id', { ascending: false });
      setState(prev => ({ ...prev, gallery: data || [] }));
      
      showToast('Foto berhasil ditambahkan ke galeri', 'success');
    } catch (error) { showToast("Gagal menambahkan foto ke galeri", "error"); }
  };

  const deleteGalleryItem = async (id: number) => {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, gallery: prev.gallery.filter(g => g.id !== id) }));
      showToast('Foto berhasil dihapus', 'success');
    } catch (error) { showToast("Gagal menghapus foto", "error"); }
  };

  const addSliderItem = async (item: Omit<SliderItem, 'id'>) => {
    try {
      const { error } = await supabase.from('sliders').insert([{ image_url: item.imageUrl, title: item.title, description: item.description }]);
      if (error) throw error;
      
      const { data } = await supabase.from('sliders').select('*').order('id', { ascending: true });
      const mapped = (data || []).map((s: any) => ({
        id: s.id,
        imageUrl: s.image_url,
        title: s.title,
        description: s.description
      }));
      setState(prev => ({ ...prev, sliders: mapped }));

      showToast('Slider berhasil ditambahkan', 'success');
    } catch (error) { showToast("Gagal menambahkan slider", "error"); }
  };

  const deleteSliderItem = async (id: number) => {
    try {
      const { error } = await supabase.from('sliders').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, sliders: prev.sliders.filter(s => s.id !== id) }));
      showToast('Slider berhasil dihapus', 'success');
    } catch (error) { showToast("Gagal menghapus slider", "error"); }
  };

  const addMediaPost = async (post: Omit<MediaPost, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase.from('media_posts').insert([{ type: post.type, url: post.url, embed_url: post.embedUrl, caption: post.caption }]);
      if (error) throw error;
      
      const { data } = await supabase.from('media_posts').select('*').order('id', { ascending: false });
      const mapped = (data || []).map((m: any) => ({
        ...m,
        embedUrl: m.embed_url,
        createdAt: m.created_at
      }));
      setState(prev => ({ ...prev, mediaPosts: mapped }));

      showToast('Media berhasil ditambahkan', 'success');
    } catch (error) { showToast("Gagal menambahkan media", "error"); }
  };

  const deleteMediaPost = async (id: number) => {
    try {
      const { error } = await supabase.from('media_posts').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({...prev, mediaPosts: prev.mediaPosts.filter(m => m.id !== id)}));
      showToast('Media berhasil dihapus', 'success');
    } catch (error) { showToast("Gagal menghapus media", "error"); }
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    try {
      const { error } = await supabase.from('site_config').update({
        app_name: config.appName, org_name: config.orgName, description: config.description, address: config.address, email: config.email, phone: config.phone, logo_url: config.logoUrl
      }).gt('id', 0);
      if (error) throw error;
      setState(prev => ({ ...prev, siteConfig: config }));
      showToast('Pengaturan website berhasil diperbarui', 'success');
    } catch (error) { showToast("Gagal menyimpan konfigurasi", "error"); }
  };

  const updateProfilePage = async (slug: string, title: string, content: string) => {
    try {
       const existing = state.profilePages.find(p => p.slug === slug);
       let error;
       if (existing) {
         const { error: err } = await supabase.from('profile_pages').update({ title, content }).eq('slug', slug);
         error = err;
       } else {
         const { error: err } = await supabase.from('profile_pages').insert([{ slug, title: title || 'Profil', content }]);
         error = err;
       }
       if (error) throw error;
       
       const { data } = await supabase.from('profile_pages').select('*');
       setState(prev => ({ ...prev, profilePages: (data as ProfilePage[]) || [] }));
       
       showToast("Data profil berhasil disimpan", "success");
    } catch(err) { console.error(err); showToast("Gagal menyimpan profil", "error"); }
  };

  const addKorwil = async (name: string) => {
    try {
      const { error } = await supabase.from('korwils').insert([{ name }]);
      if (error) throw error;
      
      const { data } = await supabase.from('korwils').select('*').order('name', { ascending: true });
      setState(prev => ({ ...prev, korwils: (data as Korwil[]) || [] }));
      
      showToast("Korwil berhasil ditambahkan", "success");
    } catch (error) { showToast("Gagal menambahkan korwil", "error"); }
  };

  const deleteKorwil = async (id: number) => {
    try {
      const { error } = await supabase.from('korwils').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, korwils: prev.korwils.filter(k => k.id !== id) }));
      showToast("Korwil berhasil dihapus", "success");
    } catch (error) { showToast("Gagal menghapus korwil", "error"); }
  };

  // --- NEW: BACKUP & RESTORE FUNCTIONALITY ---
  
  const downloadBackup = async () => {
    try {
       showToast("Memproses backup data...", "info");
       
       // 1. Fetch ALL Raw Data from Supabase
       const [
           { data: siteConfig },
           { data: users },
           { data: registrations },
           { data: korwils },
           { data: attendanceSessions },
           { data: attendanceRecords },
           { data: news },
           { data: gallery },
           { data: sliders },
           { data: mediaPosts },
           { data: profilePages }
       ] = await Promise.all([
           supabase.from('site_config').select('*').single(),
           supabase.from('users').select('*'),
           supabase.from('registrations').select('*'),
           supabase.from('korwils').select('*'),
           supabase.from('attendance_sessions').select('*'),
           supabase.from('attendance_records').select('*'),
           supabase.from('news').select('*'),
           supabase.from('gallery').select('*'),
           supabase.from('sliders').select('*'),
           supabase.from('media_posts').select('*'),
           supabase.from('profile_pages').select('*')
       ]);

       const backupData: BackupData = {
           timestamp: new Date().toISOString(),
           version: "1.0",
           data: {
               siteConfig: siteConfig || {},
               users: users || [],
               registrations: registrations || [],
               korwils: (korwils as Korwil[]) || [],
               attendanceSessions: attendanceSessions || [],
               attendanceRecords: attendanceRecords || [],
               news: news || [],
               gallery: gallery || [],
               sliders: sliders || [],
               mediaPosts: mediaPosts || [],
               profilePages: profilePages || []
           }
       };

       // 2. Create Downloadable File
       const dataStr = JSON.stringify(backupData, null, 2);
       const blob = new Blob([dataStr], { type: "application/json" });
       const url = URL.createObjectURL(blob);
       
       const link = document.createElement('a');
       link.href = url;
       link.download = `JSN_Backup_${new Date().toISOString().split('T')[0]}.json`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
       showToast("Backup berhasil diunduh!", "success");
    } catch (error) {
       console.error("Backup failed", error);
       showToast("Gagal membuat backup", "error");
    }
  };

  const restoreData = async (jsonData: BackupData): Promise<boolean> => {
      try {
          if (!jsonData.data) throw new Error("Invalid backup file format");

          // SEQUENTIAL RESTORE (To respect FK constraints)
          
          // 1. Config & Korwils (Master Data)
          if (jsonData.data.siteConfig) {
             const { id, ...configRest } = jsonData.data.siteConfig as any;
             await supabase.from('site_config').upsert(configRest); // Config biasanya cuma 1 row, ID diabaikan/diupdate
          }
          if (jsonData.data.korwils?.length) await supabase.from('korwils').upsert(jsonData.data.korwils);

          // 2. Users (Core Data - Parent of Records)
          if (jsonData.data.users?.length) {
              // Batch upsert users
              const { error } = await supabase.from('users').upsert(jsonData.data.users);
              if (error) throw error;
          }
          
          // 3. Registrations
          if (jsonData.data.registrations?.length) await supabase.from('registrations').upsert(jsonData.data.registrations);

          // 4. Content (Independent)
          if (jsonData.data.news?.length) await supabase.from('news').upsert(jsonData.data.news);
          if (jsonData.data.gallery?.length) await supabase.from('gallery').upsert(jsonData.data.gallery);
          if (jsonData.data.sliders?.length) await supabase.from('sliders').upsert(jsonData.data.sliders);
          if (jsonData.data.mediaPosts?.length) await supabase.from('media_posts').upsert(jsonData.data.mediaPosts);
          if (jsonData.data.profilePages?.length) await supabase.from('profile_pages').upsert(jsonData.data.profilePages);

          // 5. Attendance (Dependent on Users)
          if (jsonData.data.attendanceSessions?.length) await supabase.from('attendance_sessions').upsert(jsonData.data.attendanceSessions);
          
          // 6. Attendance Records (Dependent on Sessions & Users)
          if (jsonData.data.attendanceRecords?.length) {
               // Perlu chunking jika data sangat banyak, tapi untuk sekarang direct upsert
               const { error } = await supabase.from('attendance_records').upsert(jsonData.data.attendanceRecords);
               if (error) throw error;
          }
          
          // REFRESH STATE
          await fetchData();
          return true;
      } catch (error) {
          console.error("Restore failed", error);
          showToast("Gagal melakukan restore database", "error");
          return false;
      }
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
      login, logout, register, 
      createAdminUser, changePassword,
      verifyMemberByKorwil, approveMemberFinal, rejectMember, 
      updateMember, deleteMember, resetMemberPassword, 
      createSession, updateSession, deleteSession, toggleSession, markAttendance, updateAttendanceRecord, deleteAttendanceRecord, 
      addNews, updateNews, deleteNews, 
      addGalleryItem, deleteGalleryItem, 
      addSliderItem, deleteSliderItem, 
      addMediaPost, deleteMediaPost, 
      updateSiteConfig, updateProfilePage, 
      addKorwil, deleteKorwil, 
      downloadBackup, restoreData,
      uploadFile,
      showToast, removeToast, refreshData: fetchData, isLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};
