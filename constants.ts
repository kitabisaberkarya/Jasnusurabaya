
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
  "Korwil Kalirungkut",
  "Korwil Rungkut Kidul",
  "Korwil Pandugo",
  "Korwil Kedung Asem",
  "Korwil Kedung Baruk",
  "Korwil Wonorejo",
  "Korwil Medokan Ayu",
  "Korwil Rungkut Tengah",
  "Korwil Rungkut Menanggal",
  "Korwil Tenggilis Mejoyo",
  "Korwil Rungkut Mejoyo",
  "Korwil Kutisari",
  "Korwil Penjaringan Sari",
  "Korwil Gunung Anyar Kidul",
  "Korwil Gunung Anyar Tengah",
  "Korwil Gunung Anyar Tambak",
  "Korwil Kenjeran + Tmbk Wedi",
  "Korwil Tambaksari",
  "Korwil Panjang Jiwo",
  "Korwil Bakung"
];