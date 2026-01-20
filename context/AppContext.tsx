import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, User, RegistrationInput, MemberStatus, UserRole, AttendanceSession, NewsItem, ToastMessage, AttendanceRecord } from '../types';
import { MOCK_INITIAL_STATE } from '../constants';

interface AppContextType extends AppState {
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
  register: (data: RegistrationInput) => void;
  approveMember: (registrationId: number) => void;
  rejectMember: (registrationId: number) => void;
  createSession: (name: string) => void;
  toggleSession: (sessionId: number) => void;
  markAttendance: (sessionId: number, userId: number, photoUrl: string, location: string) => boolean;
  addNews: (news: Omit<NewsItem, 'id'>) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state including toasts and attendanceRecords array
  const [state, setState] = useState<AppState>({ ...MOCK_INITIAL_STATE, toasts: [], attendanceRecords: [] });

  // Simulate persistence via localStorage for demo continuity
  useEffect(() => {
    const saved = localStorage.getItem('jsn_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure complex objects are merged correctly
      setState(prev => ({ 
        ...prev, 
        ...parsed, 
        toasts: [],
        attendanceRecords: parsed.attendanceRecords || [] 
      }));
    }
  }, []);

  useEffect(() => {
    // Don't save toasts to localStorage
    const { toasts, ...stateToSave } = state;
    localStorage.setItem('jsn_app_state', JSON.stringify(stateToSave));
  }, [state]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setState(prev => ({ ...prev, toasts: [...prev.toasts, newToast] }));
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4000);
  };

  const removeToast = (id: number) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  };

  const login = (identifier: string, password: string): boolean => {
    // Identifier can be Email or NIA
    const user = state.users.find(
      u => (u.email === identifier || u.nia === identifier) && u.password === password
    );

    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      showToast(`Ahlan wa sahlan, ${user.name}`, 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    showToast('Anda telah keluar dari sistem', 'info');
  };

  const register = (data: RegistrationInput) => {
    const newRegistration = {
      ...data,
      id: Date.now(),
      status: MemberStatus.PENDING,
      date: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({
      ...prev,
      registrations: [...prev.registrations, newRegistration]
    }));
    // Toast is handled in the component for redirect feedback
  };

  const approveMember = (regId: number) => {
    const candidate = state.registrations.find(r => r.id === regId);
    if (!candidate) return;

    // Generate NIA: JSN-[YEAR]-[RANDOM]
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const nia = `JSN-${year}-${random}`;

    const newUser: User = {
      id: Date.now(),
      name: candidate.name,
      email: candidate.email,
      role: UserRole.MEMBER,
      status: MemberStatus.ACTIVE,
      nia: nia,
      password: candidate.password,
      wilayah: candidate.wilayah,
      phone: candidate.phone,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      registrations: prev.registrations.filter(r => r.id !== regId)
    }));
    showToast(`Anggota ${candidate.name} resmi diterima. NIA: ${nia}`, 'success');
  };

  const rejectMember = (regId: number) => {
    setState(prev => ({
      ...prev,
      registrations: prev.registrations.filter(r => r.id !== regId)
    }));
    showToast('Permohonan anggota ditolak', 'info');
  };

  const createSession = (name: string) => {
    const newSession: AttendanceSession = {
      id: Date.now(),
      name,
      date: new Date().toISOString().split('T')[0],
      isOpen: true,
      attendees: []
    };
    setState(prev => ({
      ...prev,
      attendanceSessions: [newSession, ...prev.attendanceSessions]
    }));
    showToast('Sesi absensi baru berhasil dibuat & dibuka', 'success');
  };

  const toggleSession = (sessionId: number) => {
    setState(prev => {
      const updatedSessions = prev.attendanceSessions.map(s =>
        s.id === sessionId ? { ...s, isOpen: !s.isOpen } : s
      );
      return { ...prev, attendanceSessions: updatedSessions };
    });
  };

  const markAttendance = (sessionId: number, userId: number, photoUrl: string, location: string): boolean => {
    const session = state.attendanceSessions.find(s => s.id === sessionId);
    const user = state.users.find(u => u.id === userId);
    
    if (!session || !session.isOpen || !user) return false;
    if (session.attendees.includes(userId)) return false;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}-${userId}`,
      sessionId,
      userId,
      userName: user.name,
      timestamp: new Date().toLocaleString('id-ID'),
      photoUrl,
      location
    };

    setState(prev => ({
      ...prev,
      // Update session simple list
      attendanceSessions: prev.attendanceSessions.map(s =>
        s.id === sessionId ? { ...s, attendees: [...s.attendees, userId] } : s
      ),
      // Add detailed record
      attendanceRecords: [...prev.attendanceRecords, newRecord]
    }));
    return true;
  };

  const addNews = (newsData: Omit<NewsItem, 'id'>) => {
    const newItem: NewsItem = {
      ...newsData,
      id: Date.now()
    };
    setState(prev => ({
      ...prev,
      news: [newItem, ...prev.news]
    }));
    showToast('Berita berhasil dipublikasikan', 'success');
  };

  return (
    <AppContext.Provider value={{ ...state, login, logout, register, approveMember, rejectMember, createSession, toggleSession, markAttendance, addNews, showToast, removeToast }}>
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