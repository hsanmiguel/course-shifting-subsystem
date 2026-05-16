import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

const client = new OAuth2Client();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}

function createStudentIdFromGoogleSubject(subject: string) {
  let hash = 0;
  for (const char of subject) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return `2026${String(hash % 100000).padStart(5, "0")}`;
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleUser> {
  if (!env.googleClientId) {
    throw new AppError(500, "GOOGLE_AUTH_NOT_CONFIGURED", "Google login is not configured on the backend.");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Google login failed: token is missing required profile claims.");
  }

  if (payload.email_verified === false) {
    throw new AppError(401, "GOOGLE_EMAIL_NOT_VERIFIED", "Google login failed: email address is not verified.");
  }

  return {
    id: createStudentIdFromGoogleSubject(payload.sub),
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture ?? null
  };
}
