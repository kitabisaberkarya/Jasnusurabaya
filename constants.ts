
import { AppState } from "./types";

export const MOCK_INITIAL_STATE: AppState = {
  currentUser: null,
  siteConfig: {
    appName: "Loading...",
    orgName: "",
    description: "",
    address: "",
    email: "",
    phone: "",
    logoUrl: ""
  },
  users: [],
  registrations: [],
  news: [],
  gallery: [],
  mediaPosts: [],
  profilePages: [],
  attendanceSessions: [],
  attendanceRecords: [],
  toasts: []
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