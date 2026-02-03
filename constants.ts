
import { AppState } from "./types";

export const MOCK_INITIAL_STATE: AppState = {
  currentUser: null,
  siteConfig: {
    appName: "JSN Surabaya", // Updated from "Loading..."
    orgName: "Kota Surabaya",
    description: "Sistem Informasi Manajemen Jamiyah Sholawat Nariyah",
    address: "",
    email: "",
    phone: "",
    logoUrl: "https://placehold.co/400x400/064e3b/ffffff?text=JSN" // Default placeholder if logo fails
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
