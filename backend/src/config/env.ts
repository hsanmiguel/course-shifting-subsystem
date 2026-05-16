import dotenv from "dotenv";

dotenv.config();

type AuthMode = "dev" | "firebase";
type StorageProvider = "memory" | "firestore";

const authMode = (process.env.AUTH_MODE ?? "dev") as AuthMode;
const esbBaseUrl = process.env.ESB_BASE_URL ?? "https://esb-cjnx.onrender.com/api/esb";

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  return raw.trim().toLowerCase() === "true";
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: readNumber("PORT", 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  authMode,
  allowDevTokenFallback: readBoolean("ALLOW_DEV_TOKEN_FALLBACK", authMode === "dev"),
  storageProvider: (process.env.STORAGE_PROVIDER ?? "memory") as StorageProvider,
  minimumGwa: readNumber("MINIMUM_GWA", 2.5),
  maxApplicationsPerSemester: readNumber("MAX_APPLICATIONS_PER_SEMESTER", 5),
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
  googleClientId:
    process.env.GOOGLE_CLIENT_ID ??
    process.env.GOOGLE_WEB_CLIENT_ID ??
    process.env.WEB_CLIENT_ID ??
    process.env.VITE_GOOGLE_CLIENT_ID ??
    "",
  jwtSecret: process.env.JWT_SECRET ?? "change-this-secret-in-production",
  esb: {
    baseUrl: esbBaseUrl,
    srmStudentsUrl: process.env.ESB_SRM_STUDENTS_URL ?? `${esbBaseUrl}/srm/students`,
    sfwStudentStatusUrlTemplate:
      process.env.ESB_SFW_STUDENT_STATUS_URL_TEMPLATE ?? `${esbBaseUrl}/sfw/students/:id/status`
  },
  subsystemBaseUrls: {
    srm: process.env.SRM_BASE_URL ?? "",
    cms: process.env.CMS_BASE_URL ?? "",
    sgvces: process.env.SGVCES_BASE_URL ?? "",
    uanas: process.env.UANAS_BASE_URL ?? "",
    finance: process.env.FINANCE_BASE_URL ?? "",
    sfw: process.env.SFW_BASE_URL ?? ""
  }
};
