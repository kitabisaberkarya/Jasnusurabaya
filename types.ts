
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
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
  attendees: number[]; // Array of User IDs (for backward compatibility/quick count)
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
}

export interface Korwil {
  id: number;
  name: string;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  registrations: (RegistrationInput & { id: number; status: MemberStatus; date: string })[];
  news: NewsItem[];
  gallery: GalleryItem[];
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
  register: (data: RegistrationInput) => void;
  approveMember: (registrationId: number) => void;
  rejectMember: (registrationId: number) => void;
  deleteMember: (userId: number) => void;
  resetMemberPassword: (userId: number) => void;
  createSession: (name: string) => void;
  toggleSession: (sessionId: number) => void;
  markAttendance: (sessionId: number, userId: number, photoUrl: string, location: string) => Promise<boolean>;
  addNews: (news: Omit<NewsItem, 'id'>) => void;
  updateNews: (id: number, news: Partial<NewsItem>) => void;
  deleteNews: (id: number) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: number) => void;
  addMediaPost: (post: Omit<MediaPost, 'id' | 'createdAt'>) => void;
  deleteMediaPost: (id: number) => void;
  updateSiteConfig: (config: SiteConfig) => void;
  updateProfilePage: (slug: string, title: string, content: string) => void;
  addKorwil: (name: string) => void;
  deleteKorwil: (id: number) => void;
  restoreData: (data: AppState) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}