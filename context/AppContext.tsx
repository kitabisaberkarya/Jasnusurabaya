
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { 
  AppContextType, 
  AppState, 
  User, 
  RegistrationInput, 
  NewsItem, 
  GalleryItem, 
  SliderItem, 
  MediaPost, 
  ProfilePage, 
  AttendanceSession, 
  AttendanceRecord, 
  ToastMessage, 
  SiteConfig, 
  Korwil, 
  MemberStatus, 
  UserRole, 
  BackupData 
} from '../types';
import { MOCK_INITIAL_STATE } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- KONFIGURASI CLOUDINARY ---
// Cloud Name dari akun baru Anda
const CLOUDINARY_CLOUD_NAME = 'dlbljcblg'; 
// Upload Preset: HARUS SAMA dengan yang ada di Dashboard Cloudinary (Settings -> Upload -> Upload presets)
// Pastikan Mode-nya "Unsigned"
const CLOUDINARY_UPLOAD_PRESET = 'jsn_preset'; 

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(MOCK_INITIAL_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, { id, message, type }]
    }));
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: number) => {
    setState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(t => t.id !== id)
    }));
  };

  const refreshData = async () => {
    try {
      // 1. Fetch Critical Data (Configuration) first for instant perceived speed
      const { data: configData } = await supabase.from('site_config').select('*').single();
      
      if (configData) {
          const newConfig: SiteConfig = { 
              ...configData, 
              logoUrl: configData.logo_url, 
              appName: configData.app_name, 
              orgName: configData.org_name,
              signatureUrl: configData.signature_url,
              stampUrl: configData.stamp_url
          };
          
          setState(prev => ({
             ...prev,
             siteConfig: newConfig
          }));
      }

      // 2. Fetch the rest in parallel
      const results = await Promise.allSettled([
        supabase.from('users').select('*'),
        supabase.from('registrations').select('*'),
        supabase.from('news').select('*').order('date', { ascending: false }),
        supabase.from('gallery').select('*'),
        supabase.from('sliders').select('*'),
        supabase.from('media_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('profile_pages').select('*'),
        supabase.from('attendance_sessions').select('*'),
        supabase.from('attendance_records').select('*'),
        supabase.from('korwils').select('*').order('name', { ascending: true })
      ]);

      // Helper to safely extract data from Promise.allSettled results
      const unwrap = (res: PromiseSettledResult<any>, defaultValue: any) => {
        if (res.status === 'fulfilled' && res.value.data) {
          return res.value.data;
        }
        return defaultValue;
      };

      const fetchedUsers = unwrap(results[0], []);
      const fetchedRegs = unwrap(results[1], []);
      const fetchedNews = unwrap(results[2], []);
      const fetchedGallery = unwrap(results[3], []);
      const fetchedSliders = unwrap(results[4], []);
      const fetchedMedia = unwrap(results[5], []);
      const fetchedProfiles = unwrap(results[6], []);
      const fetchedSessions = unwrap(results[7], []);
      const fetchedRecords = unwrap(results[8], []);
      const fetchedKorwils = unwrap(results[9], []);

      setState(prev => {
        // Sync currentUser with fresh data
        let syncedCurrentUser = prev.currentUser;
        if (prev.currentUser) {
            const freshUserData = fetchedUsers.find((u: any) => u.id === prev.currentUser?.id);
            if (freshUserData) {
                syncedCurrentUser = { ...prev.currentUser, ...freshUserData };
                localStorage.setItem('jsn_session', JSON.stringify(syncedCurrentUser));
            } else {
                // If user in local storage NOT found in DB (e.g. after DB reset), logout automatically
                syncedCurrentUser = null;
                localStorage.removeItem('jsn_session');
            }
        }

        return {
          ...prev,
          users: fetchedUsers,
          currentUser: syncedCurrentUser,
          registrations: fetchedRegs,
          news: fetchedNews.map((n: any) => ({...n, imageUrl: n.image_url})),
          gallery: fetchedGallery,
          sliders: fetchedSliders.map((s: any) => ({...s, imageUrl: s.image_url})),
          mediaPosts: fetchedMedia.map((m: any) => ({...m, embedUrl: m.embed_url, createdAt: m.created_at})),
          profilePages: fetchedProfiles,
          // MAP: snake_case (DB) -> camelCase (App)
          attendanceSessions: fetchedSessions.map((s: any) => ({
              ...s, 
              isOpen: s.is_open, // MAPPING PENTING
              mapsUrl: s.maps_url // MAPPING PENTING
          })),
          attendanceRecords: fetchedRecords.map((r: any) => ({...r, sessionId: r.session_id, userId: r.user_id, userName: r.user_name, photoUrl: r.photo_url})),
          korwils: fetchedKorwils.map((k: any) => ({...k, coordinatorName: k.coordinator_name}))
        };
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Immediate Local Session Restore for speed
    const storedSession = localStorage.getItem('jsn_session');
    if (storedSession) {
      try {
        const user = JSON.parse(storedSession);
        setState(prev => ({ ...prev, currentUser: user }));
      } catch (e) {
        localStorage.removeItem('jsn_session');
      }
    }
    
    // Background Fetch
    refreshData();
  }, []);

  // --- Auth Actions ---

  const login = async (identifier: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},nia.eq.${identifier}`)
        .eq('password', password)
        .single();

      if (error || !data) return null;

      const user: User = { ...data, joinedAt: data.created_at || new Date().toISOString() };
      setState(prev => ({ ...prev, currentUser: user }));
      localStorage.setItem('jsn_session', JSON.stringify(user));
      showToast(`Selamat datang, ${user.name}`, 'success');
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    localStorage.removeItem('jsn_session');
    showToast('Anda telah keluar', 'info');
  };

  const register = async (input: RegistrationInput): Promise<boolean> => {
    try {
      // 1. Cek apakah NIK sudah terdaftar sebagai anggota aktif (di tabel users)
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, name, nia')
        .eq('nik', input.nik)
        .maybeSingle();

      if (existingUser) {
        showToast(`NIK ini sudah terdaftar sebagai anggota aktif (${existingUser.name} - ${existingUser.nia}). Silakan masuk.`, 'error');
        return false;
      }

      // 2. Cek apakah sudah ada pendaftaran dengan NIK ini di tabel registrations
      const { data: existingReg } = await supabase
        .from('registrations')
        .select('id')
        .eq('nik', input.nik)
        .maybeSingle();

      let result;
      if (existingReg) {
        // Jika sudah ada, update datanya (agar pendaftar bisa memperbaiki data jika sebelumnya ditolak)
        result = await supabase.from('registrations').update({
          ...input,
          status: MemberStatus.PENDING,
          date: new Date().toISOString().split('T')[0]
        }).eq('id', existingReg.id);
      } else {
        // Jika belum ada, masukkan sebagai data baru
        result = await supabase.from('registrations').insert([{
          ...input,
          status: MemberStatus.PENDING,
          date: new Date().toISOString().split('T')[0]
        }]);
      }
      
      if (result.error) throw result.error;
      
      showToast('Pendaftaran berhasil dikirim. Mohon tunggu verifikasi admin.', 'success');
      refreshData();
      return true;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal mendaftar', 'error');
      return false;
    }
  };

  const createAdminUser = async (name: string, email: string, role: UserRole, wilayah: string, password: string) => {
    try {
        const { error } = await supabase.from('users').insert([{
            name, email, role, wilayah, password, status: MemberStatus.ACTIVE, nia: `ADMIN-${Date.now()}`
        }]);
        if (error) throw error;
        showToast("Admin user created", "success");
        refreshData();
        return true;
    } catch (e) {
        showToast("Failed to create admin", "error");
        return false;
    }
  };

  const changePassword = async (userId: number, newPass: string) => {
      try {
          const { error } = await supabase.from('users').update({ password: newPass }).eq('id', userId);
          if (error) throw error;
          showToast("Password berhasil diubah", "success");
          return true;
      } catch (e) {
          showToast("Gagal ubah password", "error");
          return false;
      }
  };

  // --- Approval Workflow ---

  const verifyMemberByKorwil = async (regId: number) => {
    try {
        const { error } = await supabase.from('registrations').update({ status: MemberStatus.VERIFIED_KORWIL }).eq('id', regId);
        if (error) throw error;
        refreshData();
        showToast("Member diverifikasi Korwil", "success");
    } catch(e) { showToast("Gagal verifikasi", "error"); }
  };

  const approveMemberFinal = async (regId: number) => {
      try {
          const reg = state.registrations.find(r => r.id === regId);
          if (!reg) return;

          const nia = `JSN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          
          const { error: userError } = await supabase.from('users').insert([{
              name: reg.name,
              email: reg.email,
              phone: reg.phone,
              address: reg.address,
              wilayah: reg.wilayah,
              nik: reg.nik,
              password: reg.password,
              nia: nia,
              role: UserRole.MEMBER,
              status: MemberStatus.ACTIVE
          }]);

          if (userError) throw userError;

          await supabase.from('registrations').delete().eq('id', regId);
          
          refreshData();
          showToast("Member disetujui & NIA diterbitkan", "success");
      } catch(e) { showToast("Gagal approve member", "error"); }
  };

  const rejectMember = async (regId: number) => {
      try {
          const { error } = await supabase.from('registrations').update({ status: MemberStatus.REJECTED }).eq('id', regId);
          if (error) throw error;
          refreshData();
          showToast("Permohonan ditolak", "info");
      } catch(e) { showToast("Gagal menolak", "error"); }
  };

  const deleteRegistration = async (regId: number) => {
      try {
          const { error } = await supabase.from('registrations').delete().eq('id', regId);
          if (error) throw error;
          refreshData();
          showToast("Pendaftaran dihapus permanen", "success");
      } catch(e) { showToast("Gagal hapus pendaftaran", "error"); }
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
      if (data.profile_photo_url) updates.profile_photo_url = data.profile_photo_url;

      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;

      setState(prev => {
        const isCurrentUser = prev.currentUser?.id === userId;
        const updatedCurrentUser = isCurrentUser && prev.currentUser 
            ? { ...prev.currentUser, ...data } 
            : prev.currentUser;

        return {
            ...prev,
            users: prev.users.map(u => u.id === userId ? { ...u, ...data } : u),
            currentUser: updatedCurrentUser
        };
      });

      if (state.currentUser?.id === userId) {
          const updatedSession = { ...state.currentUser, ...data };
          localStorage.setItem('jsn_session', JSON.stringify(updatedSession));
      }

      showToast("Data anggota berhasil diperbarui", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui data anggota", "error");
    }
  };

  const deleteMember = async (userId: number) => {
      try {
          const { error } = await supabase.from('users').delete().eq('id', userId);
          if (error) throw error;
          refreshData();
          showToast("Anggota dihapus", "success");
      } catch (e) { showToast("Gagal hapus anggota", "error"); }
  };

  const deleteMembersBulk = async (ids: number[]) => {
      if (ids.length === 0) return false;
      try {
          // Safety: Jangan hapus Super Admin (meskipun filter UI sudah handle)
          const safeIds = ids.filter(id => {
              const u = state.users.find(user => user.id === id);
              return u && u.role !== UserRole.SUPER_ADMIN;
          });

          if (safeIds.length === 0) {
              showToast("Tidak ada anggota yang bisa dihapus.", "info");
              return false;
          }

          const { error } = await supabase.from('users').delete().in('id', safeIds);
          if (error) throw error;
          
          refreshData();
          showToast(`Berhasil menghapus ${safeIds.length} anggota.`, "success");
          return true;
      } catch (e: any) {
          console.error(e);
          showToast("Gagal hapus massal: " + e.message, "error");
          return false;
      }
  };

  const resetMemberPassword = async (userId: number) => {
      try {
          const defaultPass = "jsn123";
          const { error } = await supabase.from('users').update({ password: defaultPass }).eq('id', userId);
          if (error) throw error;
          showToast(`Password direset ke: ${defaultPass}`, "success");
      } catch (e) { showToast("Gagal reset password", "error"); }
  };

  // --- Session & Attendance ---

  const createSession = async (name: string, lat?: number, lng?: number, rad?: number, mapsUrl?: string) => {
      try {
          const { error } = await supabase.from('attendance_sessions').insert([{
              name, 
              latitude: lat, 
              longitude: lng, 
              radius: rad, 
              maps_url: mapsUrl, // MAPPING KE DB (Snake Case)
              is_open: true,     // MAPPING KE DB (Snake Case)
              date: new Date().toISOString().split('T')[0], 
              attendees: []
          }]);
          if (error) throw error;
          refreshData();
          showToast("Sesi dibuat", "success");
      } catch(e) { 
          console.error(e);
          showToast("Gagal buat sesi", "error"); 
      }
  };

  const updateSession = async (sessionId: number, name: string, lat?: number, lng?: number, rad?: number, mapsUrl?: string) => {
      try {
          const { error } = await supabase.from('attendance_sessions').update({
              name, 
              latitude: lat, 
              longitude: lng, 
              radius: rad, 
              maps_url: mapsUrl // MAPPING KE DB
          }).eq('id', sessionId);
          if (error) throw error;
          refreshData();
          showToast("Sesi diperbarui", "success");
      } catch(e) { showToast("Gagal update sesi", "error"); }
  };

  const deleteSession = async (sessionId: number) => {
      try {
          await supabase.from('attendance_records').delete().eq('session_id', sessionId);
          await supabase.from('attendance_sessions').delete().eq('id', sessionId);
          refreshData();
          showToast("Sesi dihapus", "success");
      } catch(e) { showToast("Gagal hapus sesi", "error"); }
  };

  const toggleSession = async (sessionId: number) => {
      const s = state.attendanceSessions.find(x => x.id === sessionId);
      if (!s) return;
      try {
          // 's.isOpen' berasal dari state aplikasi (sudah dimapping saat fetch)
          // Kita kirim 'is_open' ke DB
          await supabase.from('attendance_sessions').update({ is_open: !s.isOpen }).eq('id', sessionId);
          refreshData();
          showToast(s.isOpen ? "Sesi ditutup" : "Sesi dibuka", "info");
      } catch(e) { showToast("Gagal toggle sesi", "error"); }
  };

  const markAttendance = async (sessionId: number, userId: number, photoUrl: string, location: string, distance?: number) => {
      try {
          let finalPhotoUrl = photoUrl;
          
          // Jika foto masih Base64 (dari kamera), upload ke Cloudinary dulu
          if (photoUrl.startsWith('data:image')) {
              const res = await fetch(photoUrl);
              const blob = await res.blob();
              const file = new File([blob], `attend_${Date.now()}.jpg`, { type: 'image/jpeg' });
              
              const uploaded = await uploadFile(file, 'attendance');
              if (uploaded) finalPhotoUrl = uploaded;
              else throw new Error("Gagal upload foto ke server");
          }

          // 1. Simpan Record Absensi (Gunakan crypto.randomUUID() untuk ID jika DB tidak auto-gen)
          const recordId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const { error: insertError } = await supabase.from('attendance_records').insert([{
              id: recordId,
              session_id: sessionId,
              user_id: userId,
              user_name: state.currentUser?.name || 'User',
              timestamp: new Date().toLocaleString('id-ID'),
              photo_url: finalPhotoUrl,
              location,
              distance
          }]);
          
          if (insertError) {
              console.error("Insert Error:", insertError);
              throw insertError;
          }

          // 2. Update Daftar Attendees di Sesi (JSONB)
          const s = state.attendanceSessions.find(x => x.id === sessionId);
          if (s) {
              const currentAttendees = Array.isArray(s.attendees) ? s.attendees : [];
              // Hindari duplikasi di array attendees sesi
              if (!currentAttendees.includes(userId)) {
                  const newAttendees = [...currentAttendees, userId];
                  const { error: updateError } = await supabase.from('attendance_sessions').update({ attendees: newAttendees }).eq('id', sessionId);
                  if (updateError) console.error("Update Session Error:", updateError);
              }
          }

          refreshData();
          return true;
      } catch(e: any) { 
          console.error("Attendance Error:", e);
          showToast(e.message || "Gagal mencatat absensi", "error");
          return false; 
      }
  };

  const updateAttendanceRecord = async (recordId: string, data: Partial<AttendanceRecord>) => {
      // Implement if needed
  };

  const deleteAttendanceRecord = async (recordId: string, sessionId: number, userId: number) => {
      try {
          await supabase.from('attendance_records').delete().eq('id', recordId);
          const s = state.attendanceSessions.find(x => x.id === sessionId);
          if (s) {
              const newAttendees = s.attendees.filter(id => id !== userId);
              await supabase.from('attendance_sessions').update({ attendees: newAttendees }).eq('id', sessionId);
          }
          refreshData();
          showToast("Absensi dihapus", "success");
      } catch(e) { showToast("Gagal hapus absensi", "error"); }
  };

  // --- Content Management with Cloudinary ---

  const uploadFile = async (file: File, folder: string = 'uploads'): Promise<string | null> => {
      try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 
          formData.append('folder', `jsn_surabaya/${folder}`); // Folder organization in Cloudinary

          // Debugging Log
          console.log(`Starting upload to Cloudinary. Cloud: ${CLOUDINARY_CLOUD_NAME}, Preset: ${CLOUDINARY_UPLOAD_PRESET}`);

          const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              const errorData = await response.json();
              console.error("Cloudinary API Error:", errorData);
              throw new Error(errorData.error?.message || 'Upload failed');
          }

          const data = await response.json();
          let optimizedUrl = data.secure_url;
          
          // Auto-Optimization: Insert auto-format & auto-quality into the URL
          if (optimizedUrl && optimizedUrl.includes('/upload/')) {
              optimizedUrl = optimizedUrl.replace('/upload/', '/upload/q_auto,f_auto/');
          }

          return optimizedUrl;
      } catch (e: any) {
          console.error("Cloudinary Upload Error:", e);
          let msg = "Gagal mengupload gambar.";
          if (e.message && e.message.includes("preset")) {
             msg += " Pastikan nama Preset di Cloudinary sesuai dengan kode (jsn_preset) & Mode Unsigned.";
          }
          showToast(msg, "error");
          return null;
      }
  };

  const addNews = async (item: Omit<NewsItem, 'id'>) => {
      try {
          await supabase.from('news').insert([{ 
              title: item.title, excerpt: item.excerpt, content: item.content, 
              date: item.date, image_url: item.imageUrl 
          }]);
          refreshData();
          showToast("Berita ditambahkan", "success");
      } catch(e) { showToast("Gagal tambah berita", "error"); }
  };
  const updateNews = async (id: number, item: Partial<NewsItem>) => {
      try {
          const payload: any = {};
          if (item.title) payload.title = item.title;
          if (item.excerpt) payload.excerpt = item.excerpt;
          if (item.content) payload.content = item.content;
          if (item.imageUrl) payload.image_url = item.imageUrl;
          await supabase.from('news').update(payload).eq('id', id);
          refreshData();
          showToast("Berita diupdate", "success");
      } catch(e) { showToast("Gagal update berita", "error"); }
  };
  const deleteNews = async (id: number) => {
      try {
          await supabase.from('news').delete().eq('id', id);
          refreshData();
          showToast("Berita dihapus", "success");
      } catch(e) { showToast("Gagal hapus berita", "error"); }
  };

  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
      try {
          await supabase.from('gallery').insert([item]);
          refreshData();
          showToast("Galeri ditambahkan", "success");
      } catch(e) { showToast("Gagal tambah galeri", "error"); }
  };
  const deleteGalleryItem = async (id: number) => {
      try {
          await supabase.from('gallery').delete().eq('id', id);
          refreshData();
          showToast("Galeri dihapus", "success");
      } catch(e) { showToast("Gagal hapus galeri", "error"); }
  };

  const addSliderItem = async (item: Omit<SliderItem, 'id'>) => {
      try {
          await supabase.from('sliders').insert([{
              title: item.title, description: item.description, image_url: item.imageUrl
          }]);
          refreshData();
          showToast("Slider ditambahkan", "success");
      } catch(e) { showToast("Gagal tambah slider", "error"); }
  };
  const deleteSliderItem = async (id: number) => {
      try {
          await supabase.from('sliders').delete().eq('id', id);
          refreshData();
          showToast("Slider dihapus", "success");
      } catch(e) { showToast("Gagal hapus slider", "error"); }
  };

  const addMediaPost = async (post: Omit<MediaPost, 'id' | 'createdAt'>) => {
      try {
          await supabase.from('media_posts').insert([{
              type: post.type, url: post.url, embed_url: post.embedUrl, caption: post.caption, created_at: new Date().toISOString()
          }]);
          refreshData();
          showToast("Media ditambahkan", "success");
      } catch(e) { showToast("Gagal tambah media", "error"); }
  };
  const deleteMediaPost = async (id: number) => {
      try {
          await supabase.from('media_posts').delete().eq('id', id);
          refreshData();
          showToast("Media dihapus", "success");
      } catch(e) { showToast("Gagal hapus media", "error"); }
  };

  const updateSiteConfig = async (config: SiteConfig) => {
      try {
          await supabase.from('site_config').update({
              app_name: config.appName, org_name: config.orgName, description: config.description,
              address: config.address, email: config.email, phone: config.phone, logo_url: config.logoUrl,
              signature_url: config.signatureUrl, 
              stamp_url: config.stampUrl          
          }).eq('id', 1); // Assume ID 1
          refreshData();
          showToast("Konfigurasi disimpan", "success");
      } catch(e) { showToast("Gagal simpan config", "error"); }
  };

  const updateProfilePage = async (slug: string, title: string, content: string) => {
      try {
          const { error } = await supabase.from('profile_pages').upsert(
              { slug, title, content, updated_at: new Date().toISOString() },
              { onConflict: 'slug' }
          );
          if (error) throw error;
          refreshData();
          showToast("Halaman profil berhasil disimpan", "success");
      } catch(e) { 
          console.error(e);
          showToast("Gagal update profil", "error"); 
      }
  };

  const addKorwil = async (name: string) => {
      try {
          await supabase.from('korwils').insert([{ name }]);
          refreshData();
          showToast("Korwil ditambahkan", "success");
      } catch(e) { showToast("Gagal tambah korwil", "error"); }
  };
  const updateKorwil = async (id: number, data: Partial<Korwil>) => {
      try {
          const payload: any = {};
          if (data.name) payload.name = data.name;
          if (data.coordinatorName) payload.coordinator_name = data.coordinatorName;
          if (data.contact) payload.contact = data.contact;
          
          await supabase.from('korwils').update(payload).eq('id', id);
          refreshData();
          showToast("Data Korwil diupdate", "success");
      } catch(e) { showToast("Gagal update korwil", "error"); }
  };
  const deleteKorwil = async (id: number) => {
      try {
          await supabase.from('korwils').delete().eq('id', id);
          refreshData();
          showToast("Korwil dihapus", "success");
      } catch(e) { showToast("Gagal hapus korwil", "error"); }
  };

  const downloadBackup = async () => {
      const backup: BackupData = {
          timestamp: new Date().toISOString(),
          version: '1.0',
          data: {
              siteConfig: state.siteConfig,
              users: state.users,
              registrations: state.registrations,
              korwils: state.korwils,
              attendanceSessions: state.attendanceSessions,
              attendanceRecords: state.attendanceRecords,
              news: state.news,
              gallery: state.gallery,
              sliders: state.sliders,
              mediaPosts: state.mediaPosts,
              profilePages: state.profilePages
          }
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `backup_jsn_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const restoreData = async (jsonData: BackupData) => {
      console.log("Restore not fully implemented for safety.", jsonData);
      return true;
  };

  return (
    <AppContext.Provider value={{
      ...state,
      isLoading,
      login, logout, register,
      createAdminUser, changePassword,
      verifyMemberByKorwil, approveMemberFinal, rejectMember, deleteRegistration,
      updateMember, deleteMember, deleteMembersBulk, resetMemberPassword,
      createSession, updateSession, deleteSession, toggleSession,
      markAttendance, updateAttendanceRecord, deleteAttendanceRecord,
      uploadFile,
      addNews, updateNews, deleteNews,
      addGalleryItem, deleteGalleryItem,
      addSliderItem, deleteSliderItem,
      addMediaPost, deleteMediaPost,
      updateSiteConfig, updateProfilePage,
      addKorwil, updateKorwil, deleteKorwil,
      downloadBackup, restoreData,
      showToast, removeToast, refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
