
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
  "Korwil Asemrowo",
  "Korwil Benowo",
  "Korwil Bubutan",
  "Korwil Bulak",
  "Korwil Dukuh Pakis",
  "Korwil Gayungan",
  "Korwil Genteng",
  "Korwil Gubeng",
  "Korwil Gunung Anyar",
  "Korwil Jambangan",
  "Korwil Karang Pilang",
  "Korwil Kenjeran",
  "Korwil Krembangan",
  "Korwil Lakarsantri",
  "Korwil Mulyorejo",
  "Korwil Pabean Cantian",
  "Korwil Pakal",
  "Korwil Rungkut",
  "Korwil Sambikerep",
  "Korwil Sawahan",
  "Korwil Semampir",
  "Korwil Simokerto",
  "Korwil Sukolilo",
  "Korwil Sukomanunggal",
  "Korwil Tambaksari",
  "Korwil Tandes",
  "Korwil Tegalsari",
  "Korwil Tenggilis Mejoyo",
  "Korwil Wiyung",
  "Korwil Wonocolo",
  "Korwil Wonokromo"
];