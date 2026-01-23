
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, User, RegistrationInput, MemberStatus, UserRole, AttendanceSession, NewsItem, ToastMessage, AttendanceRecord, SiteConfig, ProfilePage, MediaPost, AppContextType, GalleryItem } from '../types';
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

  // Initial Data Fetch from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: users }, 
        { data: news }, 
        { data: gallery }, 
        { data: media },
        { data: sessions }, 
        { data: registrations },
        { data: config },
        { data: records },
        { data: profiles }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('news').select('*').order('id', { ascending: false }),
        supabase.from('gallery').select('*').order('id', { ascending: false }),
        supabase.from('media_posts').select('*').order('id', { ascending: false }),
        supabase.from('attendance_sessions').select('*').order('id', { ascending: false }),
        supabase.from('registrations').select('*').order('id', { ascending: false }),
        supabase.from('site_config').select('*').single(),
        supabase.from('attendance_records').select('*').order('timestamp', { ascending: false }),
        supabase.from('profile_pages').select('*')
      ]);
      
      const mappedSessions = (sessions || []).map((s: any) => ({
        ...s,
        attendees: Array.isArray(s.attendees) ? s.attendees : []
      }));

      const mappedConfig = config ? {
        appName: config.app_name,
        orgName: config.org_name,
        description: config.description,
        address: config.address,
        email: config.email,
        phone: config.phone,
        logoUrl: config.logo_url
      } : MOCK_INITIAL_STATE.siteConfig;

      const mappedNews = (news || []).map((n: any) => ({
        ...n,
        imageUrl: n.image_url
      }));

      const mappedMedia = (media || []).map((m: any) => ({
        ...m,
        embedUrl: m.embed_url,
        createdAt: m.created_at
      }));

      setState(prev => ({
        ...prev,
        users: users || [],
        news: mappedNews,
        gallery: gallery || [],
        mediaPosts: mappedMedia,
        profilePages: (profiles as ProfilePage[]) || [],
        attendanceSessions: mappedSessions,
        registrations: registrations || [],
        attendanceRecords: records || [],
        siteConfig: mappedConfig as SiteConfig,
      }));

    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Gagal mengambil data dari server", "error");
    } finally {
      setIsLoading(false);
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

    if (cleanId.toLowerCase() === 'jasnu.nariyahsurabaya@gmail.com' && cleanPass === 'JasnuNariyahSurabaya1926') {
      const masterAdmin: User = {
        id: 999999,
        name: 'Administrator JSN',
        email: 'jasnu.nariyahsurabaya@gmail.com',
        role: UserRole.ADMIN,
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${cleanId},nia.eq.${cleanId}`)
        .eq('password', cleanPass)
        .single();

      if (error || !data) return null;

      setState(prev => ({ ...prev, currentUser: data }));
      showToast(`Ahlan wa sahlan, ${data.name}`, 'success');
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    showToast('Anda telah keluar dari sistem', 'info');
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

  const approveMember = async (regId: number) => {
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
        password: candidate.password,
        wilayah: candidate.wilayah,
        phone: candidate.phone,
        address: candidate.address, // Added Address
        joined_at: new Date().toISOString().split('T')[0]
      }]);

      if (insertError) throw insertError;
      await supabase.from('registrations').delete().eq('id', regId);
      fetchData();
      showToast(`Anggota ${candidate.name} resmi diterima. NIA: ${nia}`, 'success');
    } catch (error) {
      console.error(error);
      showToast("Gagal memproses approval", "error");
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

  const deleteMember = async (userId: number) => {
    try {
      // Delete attendance records first to maintain referential integrity if not cascading
      await supabase.from('attendance_records').delete().eq('user_id', userId);
      
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      
      setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
      showToast("Data anggota berhasil dihapus permanen.", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus anggota", "error");
    }
  };

  const resetMemberPassword = async (userId: number) => {
    try {
      const defaultPass = "12345678";
      const { error } = await supabase.from('users').update({ password: defaultPass }).eq('id', userId);
      if (error) throw error;
      showToast(`Password berhasil direset menjadi: ${defaultPass}`, "success");
    } catch (error) {
       console.error(error);
       showToast("Gagal mereset password", "error");
    }
  };

  const createSession = async (name: string) => {
    try {
      const { error } = await supabase.from('attendance_sessions').insert([{
        name,
        date: new Date().toISOString().split('T')[0],
        is_open: true,
        attendees: []
      }]);
      if (error) throw error;
      const { data } = await supabase.from('attendance_sessions').select('*').order('id', { ascending: false });
      const mapped = (data || []).map((s:any) => ({...s, attendees: s.attendees || []}));
      setState(prev => ({ ...prev, attendanceSessions: mapped }));
      showToast('Sesi absensi baru berhasil dibuat & dibuka', 'success');
    } catch (error) {
      showToast("Gagal membuat sesi", "error");
    }
  };

  const toggleSession = async (sessionId: number) => {
    const session = state.attendanceSessions.find(s => s.id === sessionId);
    if (!session) return;
    try {
      await supabase.from('attendance_sessions').update({ is_open: !session.isOpen }).eq('id', sessionId);
      setState(prev => ({
        ...prev,
        attendanceSessions: prev.attendanceSessions.map(s => s.id === sessionId ? { ...s, isOpen: !s.isOpen } : s)
      }));
    } catch (error) {
      showToast("Gagal mengubah status sesi", "error");
    }
  };

  const markAttendance = async (sessionId: number, userId: number, photoUrl: string, location: string): Promise<boolean> => {
    const session = state.attendanceSessions.find(s => s.id === sessionId);
    const user = state.users.find(u => u.id === userId) || (state.currentUser?.id === userId ? state.currentUser : null);
    
    if (!session || !session.isOpen || !user) return false;
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
        attendanceRecords: [...prev.attendanceRecords, {
          id: recordId, sessionId, userId, userName: user.name, timestamp: new Date().toLocaleString('id-ID'), photoUrl, location
        }]
      }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const addNews = async (newsData: Omit<NewsItem, 'id'>) => {
    try {
      const { error } = await supabase.from('news').insert([{
        title: newsData.title,
        excerpt: newsData.excerpt,
        content: newsData.content,
        date: newsData.date,
        image_url: newsData.imageUrl
      }]);
      if (error) throw error;
      fetchData();
      showToast('Berita berhasil dipublikasikan', 'success');
    } catch (error) {
      showToast("Gagal mempublish berita", "error");
    }
  };

  const updateNews = async (id: number, newsData: Partial<NewsItem>) => {
    try {
      const updates: any = {
        title: newsData.title,
        excerpt: newsData.excerpt,
        content: newsData.content,
      };
      
      if (newsData.imageUrl) {
        updates.image_url = newsData.imageUrl;
      }

      const { error } = await supabase.from('news').update(updates).eq('id', id);
      if (error) throw error;
      
      fetchData();
      showToast('Berita berhasil diperbarui', 'success');
    } catch (error) {
      showToast("Gagal memperbarui berita", "error");
    }
  };

  const deleteNews = async (id: number) => {
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, news: prev.news.filter(n => n.id !== id) }));
      showToast('Berita berhasil dihapus', 'success');
    } catch (error) {
      showToast("Gagal menghapus berita", "error");
    }
  };

  // Gallery Functions
  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
    try {
      const { error } = await supabase.from('gallery').insert([{
        type: item.type,
        url: item.url,
        caption: item.caption
      }]);
      if (error) throw error;
      fetchData(); // Refresh to get the new ID and items
      showToast('Foto berhasil ditambahkan ke galeri', 'success');
    } catch (error) {
      console.error(error);
      showToast("Gagal menambahkan foto ke galeri", "error");
    }
  };

  const deleteGalleryItem = async (id: number) => {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, gallery: prev.gallery.filter(g => g.id !== id) }));
      showToast('Foto berhasil dihapus', 'success');
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus foto", "error");
    }
  };

  const addMediaPost = async (post: Omit<MediaPost, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase.from('media_posts').insert([{
        type: post.type,
        url: post.url,
        embed_url: post.embedUrl,
        caption: post.caption
      }]);
      if (error) throw error;
      fetchData();
      showToast('Media berhasil ditambahkan', 'success');
    } catch (error) {
      showToast("Gagal menambahkan media", "error");
    }
  };

  const deleteMediaPost = async (id: number) => {
    try {
      const { error } = await supabase.from('media_posts').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({...prev, mediaPosts: prev.mediaPosts.filter(m => m.id !== id)}));
      showToast('Media berhasil dihapus', 'success');
    } catch (error) {
      showToast("Gagal menghapus media", "error");
    }
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    try {
      const { error } = await supabase.from('site_config').update({
        app_name: config.appName,
        org_name: config.orgName,
        description: config.description,
        address: config.address,
        email: config.email,
        phone: config.phone,
        logo_url: config.logoUrl
      }).gt('id', 0);
      if (error) throw error;
      setState(prev => ({ ...prev, siteConfig: config }));
      showToast('Pengaturan website berhasil diperbarui', 'success');
    } catch (error) {
      showToast("Gagal menyimpan konfigurasi", "error");
    }
  };

  const updateProfilePage = async (slug: string, title: string, content: string) => {
    try {
       const existing = state.profilePages.find(p => p.slug === slug);
       let error;
       if (existing) {
         const { error: err } = await supabase.from('profile_pages').update({ title, content }).eq('slug', slug);
         error = err;
       } else {
         const { error: err } = await supabase.from('profile_pages').insert([{ 
             slug, 
             title: title || 'Profil', 
             content 
         }]);
         error = err;
       }
       if (error) throw error;
       fetchData();
       showToast("Data profil berhasil disimpan", "success");
    } catch(err) {
       console.error(err);
       showToast("Gagal menyimpan profil", "error");
    }
  };

  const restoreData = (newState: AppState) => {
    showToast('Restore database memerlukan akses admin panel Supabase.', 'info');
  };

  return (
    <AppContext.Provider value={{ ...state, login, logout, register, approveMember, rejectMember, deleteMember, resetMemberPassword, createSession, toggleSession, markAttendance, addNews, updateNews, deleteNews, addGalleryItem, deleteGalleryItem, addMediaPost, deleteMediaPost, updateSiteConfig, updateProfilePage, restoreData, showToast, removeToast, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
