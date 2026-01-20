import { AppState, MemberStatus, UserRole } from "./types";

export const MOCK_INITIAL_STATE: AppState = {
  currentUser: null,
  users: [
    {
      id: 1,
      name: "Super Admin",
      email: "admin@jsn.com",
      role: UserRole.ADMIN,
      status: MemberStatus.ACTIVE,
      joinedAt: "2023-01-01",
      password: "admin"
    },
    {
      id: 2,
      name: "H. Ahmad Fulan",
      email: "fulan@gmail.com",
      role: UserRole.MEMBER,
      status: MemberStatus.ACTIVE,
      nia: "JSN-2023-001",
      wilayah: "Surabaya Pusat",
      joinedAt: "2023-02-15",
      password: "123",
      phone: "081234567890"
    },
    {
      id: 3,
      name: "Ust. Siti Aminah",
      email: "siti@gmail.com",
      role: UserRole.MEMBER,
      status: MemberStatus.ACTIVE,
      nia: "JSN-2024-052",
      wilayah: "Surabaya Timur",
      joinedAt: "2024-02-20",
      password: "123",
      phone: "081298765432"
    },
    {
      id: 4,
      name: "Dimas Anggara",
      email: "dimas@gmail.com",
      role: UserRole.MEMBER,
      status: MemberStatus.ACTIVE,
      nia: "JSN-2024-108",
      wilayah: "Surabaya Barat",
      joinedAt: "2024-03-10",
      password: "123",
      phone: "081211112222"
    }
  ],
  registrations: [
    {
      id: 101,
      name: "Budi Santoso",
      nik: "357801230001",
      email: "budi@gmail.com",
      phone: "08123456789",
      address: "Jl. Tunjungan No. 5",
      wilayah: "Surabaya Pusat",
      password: "123",
      status: MemberStatus.PENDING,
      date: "2024-05-20"
    },
    {
      id: 102,
      name: "Rina Wati",
      nik: "357801230002",
      email: "rina@gmail.com",
      phone: "081233334444",
      address: "Jl. Darmo Permai",
      wilayah: "Surabaya Barat",
      password: "123",
      status: MemberStatus.PENDING,
      date: "2024-05-21"
    },
    {
      id: 103,
      name: "Fajar Nugraha",
      nik: "357801230003",
      email: "fajar@gmail.com",
      phone: "081255556666",
      address: "Jl. Kenjeran No. 10",
      wilayah: "Surabaya Timur",
      password: "123",
      status: MemberStatus.PENDING,
      date: "2024-05-22"
    }
  ],
  news: [
    {
      id: 1,
      title: "Gema Sholawat Nariyah di Masjid Al-Akbar",
      excerpt: "Ribuan jamaah memadati Masjid Nasional Al-Akbar Surabaya dalam rangka peringatan Maulid Nabi.",
      content: "Lorem ipsum dolor sit amet...",
      date: "2024-05-10",
      imageUrl: "https://picsum.photos/800/600?random=1"
    },
    {
      id: 2,
      title: "Santunan Anak Yatim Rutin Bulan Mei",
      excerpt: "Kegiatan sosial bulanan kembali dilaksanakan dengan lancar berkat partisipasi anggota.",
      content: "Lorem ipsum dolor sit amet...",
      date: "2024-05-15",
      imageUrl: "https://picsum.photos/800/600?random=2"
    },
    {
      id: 3,
      title: "Kajian Kitab Kuning Bersama KH. Abdullah",
      excerpt: "Pendalaman materi fiqih dasar bagi anggota muda Jamiyah.",
      content: "Lorem ipsum dolor sit amet...",
      date: "2024-05-18",
      imageUrl: "https://picsum.photos/800/600?random=3"
    }
  ],
  gallery: [
    { id: 1, type: "image", caption: "Kegiatan Rutin", url: "https://picsum.photos/400/300?random=4" },
    { id: 2, type: "image", caption: "Hadirin Majelis", url: "https://picsum.photos/400/300?random=5" },
    { id: 3, type: "image", caption: "Tim Hadrah", url: "https://picsum.photos/400/300?random=6" },
    { id: 4, type: "image", caption: "Buka Bersama", url: "https://picsum.photos/400/300?random=7" },
  ],
  attendanceSessions: [
    {
      id: 10,
      name: "Rutinan Akbar Maret 2024",
      date: "2024-03-20",
      isOpen: false,
      attendees: [2, 3]
    },
    {
      id: 11,
      name: "Rutinan Akbar April 2024",
      date: "2024-04-20",
      isOpen: false,
      attendees: [2, 4]
    },
    {
      id: 12,
      name: "Rutinan Akbar Mei 2024",
      date: "2024-05-20",
      isOpen: true,
      attendees: [3]
    }
  ],
  attendanceRecords: [],
  toasts: []
};