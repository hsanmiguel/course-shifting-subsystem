import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../domain/models.js";
import { AppError } from "../errors/app-error.js";

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

interface JWTPayload {
  userId: string;
  student_id: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Authorization token is required."));
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    // Support dev tokens if enabled
    if (env.allowDevTokenFallback) {
      const devUser = parseDevToken(token);
      if (devUser) {
        req.user = devUser;
        return next();
      }
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JWTPayload;
      const role = (decoded.role ?? "student") as UserRole;
      const userId = decoded.userId || decoded.student_id || "";
      
      if (!userId) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid token: missing user ID.");
      }

      req.user = { id: userId, role, token };
      return next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return next(new AppError(401, "TOKEN_EXPIRED", "Your session has expired. Please log in again."));
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return next(new AppError(401, "INVALID_TOKEN", "Invalid or malformed token."));
      }
      throw jwtError;
    }
  } catch (error) {
    return next(error);
  }
}
