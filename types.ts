
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
  password?: string;
  wilayah?: string;
  phone?: string;
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

export interface AppState {
  users: User[];
  currentUser: User | null;
  registrations: (RegistrationInput & { id: number; status: MemberStatus; date: string })[];
  news: NewsItem[];
  gallery: GalleryItem[];
  profilePages: ProfilePage[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  toasts: ToastMessage[];
  siteConfig: SiteConfig;
}