
import { AppState } from "./types";

export const MOCK_INITIAL_STATE: AppState = {
  currentUser: null,
  siteConfig: {
    appName: "JSN Surabaya", // Default Value for Instant Load
    orgName: "Jamiyah Sholawat Nariyah", // Default Value
    description: "Sistem Informasi Manajemen Jamiyah Sholawat Nariyah Kota Surabaya.",
    address: "Surabaya, Jawa Timur",
    email: "info@jsn-surabaya.com",
    phone: "-",
    logoUrl: "" 
  },
  users: [],
  registrations: [],
  news: [],
  gallery: [],
  sliders: [],
  mediaPosts: [],
  profilePages: [],
  attendanceSessions: [],
  attendanceRecords: [],
  toasts: [],
  korwils: []
};

export const KORWIL_LIST = [
  "Kalirungkut",
  "Rungkut Kidul",
  "Pandugo",
  "Kedung Asem",
  "Kedung Baruk",
  "Wonorejo",
  "Medokan Ayu",
  "Rungkut Tengah",
  "Rungkut Menanggal",
  "Tenggilis Mejoyo",
  "Rungkut Mejoyo",
  "Kutisari",
  "Penjaringan Sari",
  "Gunung Anyar Kidul",
  "Gunung Anyar Tengah",
  "Gunung Anyar Tambak",
  "Kenjeran + Tmbk Wedi",
  "Tambaksari",
  "Panjang Jiwo",
  "Bakung"
];

export const DETAILED_KORWIL_DATA = [
  { name: "Tenggilis Mejoyo", coordinatorName: "-", contact: "-" },
  { name: "Bakung", coordinatorName: "Himron Rosyadi", contact: "0858 9755 8331" },
  { name: "Gunung Anyar Kidul", coordinatorName: "M Afidianto", contact: "0816 1537 7577" },
  { name: "Gunung Anyar Tambak", coordinatorName: "Nasrullah", contact: "0878 5418 4925" },
  { name: "Gunung Anyar Tengah", coordinatorName: "Ust Muzakki", contact: "0895 3817 8947" },
  { name: "Kalirungkut", coordinatorName: "Dodiek Salindra", contact: "0812 1733 5948" },
  { name: "Kedung Asem", coordinatorName: "Mohammad Nur Masrul Asrori", contact: "0813 5736 1238" },
  { name: "Kedung Baruk", coordinatorName: "H Luthfi Hakim", contact: "0822 4594 8592" },
  { name: "Kenjeran", coordinatorName: "Ir. H. Ayyub Adjib", contact: "0812 3209 693" },
  { name: "Kutisari", coordinatorName: "Junaidi", contact: "081 231 834 777" },
  { name: "Medokan Ayu", coordinatorName: "Achmad Sobirin", contact: "0851 0017 4441" },
  { name: "Pandugo", coordinatorName: "H. Abul Ain", contact: "0821 3228 2459" },
  { name: "Panjang Jiwo", coordinatorName: "M Afidianto", contact: "0816 1537 7577" },
  { name: "Penjaringan Sari", coordinatorName: "H Gagah Sukmadi", contact: "0812 3062 1111" },
  { name: "Rungkut Kidul", coordinatorName: "Choirul Anam", contact: "0812 3162 233" },
  { name: "Rungkut Mejoyo", coordinatorName: "H Sholahuddin", contact: "0812 3000 0051" },
  { name: "Rungkut Menanggal", coordinatorName: "M. Kosim", contact: "0877 0305 6175" },
  { name: "Rungkut Tengah", coordinatorName: "H Lukman Hakim", contact: "0823 3607 9454" },
  { name: "Tambaksari", coordinatorName: "M. Mundir", contact: "0878 5137 1242" }
];
