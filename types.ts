
export enum UserRole {
  SUPER_ADMIN = 'admin',       // Legacy 'admin' is now Super Admin
  ADMIN_KORWIL = 'korwil',     // New Role
  ADMIN_PENGURUS = 'pengurus', // New Role
  MEMBER = 'member'
}

export enum MemberStatus {
  PENDING = 'pending',
  VERIFIED_KORWIL = 'verified_korwil', // Tahap 1 Approval
  ACTIVE = 'active',                   // Tahap 2 Approval (Final)
  REJECTED = 'rejected'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  nia?: string; // Nomor Induk Anggota
  nik?: string; // Nomor Induk Kependudukan (Added)
  password?: string;
  wilayah?: string;
  phone?: string;
  address?: string; 
  profile_photo_url?: string; // Added field for KTA Photo
  joinedAt: string;
}

export interface RegistrationInput {
  name: string;
  nik: string;
  email: string;
  phone: string;
  address: string;
  wilayah: string;
  password: string;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export interface SliderItem {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
}

export interface MediaPost {
  id: number;
  type: 'youtube' | 'instagram';
  url: string;
  embedUrl: string;
  caption: string;
  createdAt: string;
}

export interface ProfilePage {
  slug: string; // 'sejarah' | 'pengurus' | 'korwil'
  title: string;
  content: string;
  updatedAt?: string;
}

export interface AttendanceSession {
  id: number;
  name: string;
  date: string;
  isOpen: boolean;
  attendees: number[]; 
  // Geofencing fields
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters
  mapsUrl?: string; // Link Google Maps
}

export interface AttendanceRecord {
  id: string;
  sessionId: number;
  userId: number;
  userName: string;
  timestamp: string;
  photoUrl: string; // Base64 Data URL
  location: string; // Coordinates or Address string
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SiteConfig {
  appName: string;
  orgName: string; // e.g., "Surabaya"
  description: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string;
  signatureUrl?: string; // Added: Tanda Tangan Digital
  stampUrl?: string;     // Added: Stempel Digital
}

export interface Korwil {
  id: number;
  name: string;
  coordinatorName?: string; // Added
  contact?: string; // Added
}

export interface BackupData {
  timestamp: string;
  version: string;
  data: {
    siteConfig: SiteConfig;
    users: any[];
    registrations: any[];
    korwils: Korwil[];
    attendanceSessions: any[];
    attendanceRecords: any[];
    news: any[];
    gallery: any[];
    sliders: any[];
    mediaPosts: any[];
    profilePages: any[];
  }
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  registrations: (RegistrationInput & { id: number; status: MemberStatus; date: string })[];
  news: NewsItem[];
  gallery: GalleryItem[];
  sliders: SliderItem[];
  mediaPosts: MediaPost[];
  profilePages: ProfilePage[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  toasts: ToastMessage[];
  siteConfig: SiteConfig;
  korwils: Korwil[];
}

export interface AppContextType extends AppState {
  login: (identifier: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (data: RegistrationInput) => Promise<boolean>; // CHANGED TO PROMISE BOOLEAN
  
  // New Admin User Management
  createAdminUser: (name: string, email: string, role: UserRole, wilayah: string, password: string) => Promise<boolean>;
  changePassword: (userId: number, newPass: string) => Promise<boolean>;

  // Approval Workflow
  verifyMemberByKorwil: (registrationId: number) => void;
  approveMemberFinal: (registrationId: number) => void;
  rejectMember: (registrationId: number) => void;
  deleteRegistration: (registrationId: number) => void;
  
  updateMember: (userId: number, data: Partial<User>) => void; 
  deleteMember: (userId: number) => void;
  deleteMembersBulk: (ids: number[]) => Promise<boolean>; // NEW BULK DELETE FEATURE
  resetMemberPassword: (userId: number) => void;
  
  // Session with Geo
  createSession: (name: string, lat?: number, lng?: number, rad?: number, mapsUrl?: string) => void;
  updateSession: (sessionId: number, name: string, lat?: number, lng?: number, rad?: number, mapsUrl?: string) => void; 
  deleteSession: (sessionId: number) => void; 
  toggleSession: (sessionId: number) => void;
  
  markAttendance: (sessionId: number, userId: number, photoUrl: string, location: string, distance?: number) => Promise<boolean>;
  updateAttendanceRecord: (recordId: string, data: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (recordId: string, sessionId: number, userId: number) => void;
  
  // File Upload Helper
  uploadFile: (file: File, folder?: string) => Promise<string | null>;

  addNews: (news: Omit<NewsItem, 'id'>) => void;
  updateNews: (id: number, news: Partial<NewsItem>) => void;
  deleteNews: (id: number) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: number) => void;
  addSliderItem: (item: Omit<SliderItem, 'id'>) => void;
  deleteSliderItem: (id: number) => void;
  addMediaPost: (post: Omit<MediaPost, 'id' | 'createdAt'>) => void;
  deleteMediaPost: (id: number) => void;
  updateSiteConfig: (config: SiteConfig) => void;
  updateProfilePage: (slug: string, title: string, content: string) => void;
  
  // Korwil Management
  addKorwil: (name: string) => void;
  updateKorwil: (id: number, data: Partial<Korwil>) => void; // Added
  deleteKorwil: (id: number) => void;
  
  downloadBackup: () => Promise<void>;
  restoreData: (jsonData: BackupData) => Promise<boolean>;
  
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}
