import type { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase.js";
import { env } from "../config/env.js";
import type { UserRole } from "../domain/models.js";
import { AppError } from "../errors/app-error.js";
import { verifyGoogleCredential } from "../services/google-auth-service.js";

const roleAlias = new Set<UserRole>([
  "student",
  "adviser",
  "department_head",
  "registrar",
  "system_admin",
  "system"
]);

function parseDevToken(token: string) {
  const [prefix, role, userId] = token.split(":");
  if (prefix !== "dev" || !userId || !roleAlias.has(role as UserRole)) {
    return null;
  }

  return {
    id: userId,
    role: role as UserRole,
    token
  };
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Authorization token is required."));
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    if (env.authMode === "dev") {
      const devUser = parseDevToken(token);
      if (devUser) {
        req.user = devUser;
        return next();
      }

      if (env.googleClientId) {
        const googleUser = await verifyGoogleCredential(token);
        req.user = { id: googleUser.id, role: "student", token };
        return next();
      }

      throw new AppError(401, "UNAUTHORIZED", "Invalid development token format.");
    }

    if (env.allowDevTokenFallback) {
      const devUser = parseDevToken(token);
      if (devUser) {
        req.user = devUser;
        return next();
      }
    }

    try {
      const decoded = await firebaseAuth().verifyIdToken(token);
      const role = String(decoded.role ?? "student") as UserRole;
      const userId = typeof decoded.student_id === "string" && decoded.student_id ? decoded.student_id : decoded.uid;
      req.user = { id: userId, role, token };
      return next();
    } catch (firebaseError) {
      if (env.googleClientId) {
        const googleUser = await verifyGoogleCredential(token);
        req.user = { id: googleUser.id, role: "student", token };
        return next();
      }

      throw firebaseError;
    }
  } catch (error) {
    if (error instanceof Error && token.split(".").length !== 3) {
      return next(
        new AppError(
          401,
          "UNAUTHORIZED",
          "Expected a Firebase JWT. The frontend is still sending a development token.",
          {
            auth_mode: env.authMode,
            allow_dev_token_fallback: env.allowDevTokenFallback
          }
        )
      );
    }

    return next(error);
  }
}
