
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
  profilePages: [],
  attendanceSessions: [],
  attendanceRecords: [],
  toasts: []
};