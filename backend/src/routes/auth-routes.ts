import type { Firestore } from "firebase-admin/firestore";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { verifyGoogleCredential } from "../services/google-auth-service.js";
import { nowIso } from "../utils/time.js";

const idLoginPattern = /^(?:\d{9}|ADM-\d{4}-\d{5})$/;

function signAuthToken(payload: { userId: string; role: string; email: string }) {
  return jwt.sign(
    { userId: payload.userId, student_id: payload.userId, role: payload.role, email: payload.email },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

export function createAuthRouter(db?: Firestore) {
  const router = Router();

  router.get("/config", (req, res) => {
    return res.json({
      googleClientId: env.googleClientId
    });
  });

  router.post("/google", async (req, res, next) => {
    try {
      const credential = typeof req.body?.credential === "string" ? req.body.credential : "";
      if (!credential) {
        throw new AppError(400, "VALIDATION_ERROR", "Google login failed: credential is required.", {
          field_errors: [{ field: "credential", issue: "Field is required and cannot be empty." }]
        });
      }

      const user = await verifyGoogleCredential(credential);
      const loggedInAt = nowIso();

      let userRole = "student";
      if (db) {
        const existingUserDoc = await db.collection("css_users").doc(user.id).get();
        if (existingUserDoc.exists) {
          const existingRole = existingUserDoc.data()?.role;
          if (existingRole) userRole = existingRole;
        }

        await db.collection("css_users").doc(user.id).set(
          {
            user_id: user.id,
            role: userRole,
            email: user.email,
            name: user.name,
            picture: user.picture,
            provider: "google",
            last_login_at: loggedInAt,
            updated_at: loggedInAt
          },
          { merge: true }
        );
      }

      const token = signAuthToken({ userId: user.id, role: userRole, email: user.email });

      return res.json({
        token,
        userId: user.id,
        userRole,
        userEmail: user.email,
        userName: user.name,
        picture: user.picture
      });
    } catch (error) {
      return next(error);
    }
  });

  router.post("/id-login", async (req, res, next) => {
    try {
      const userId = typeof req.body?.userId === "string" ? req.body.userId.trim().toUpperCase() : "";
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

      if (!idLoginPattern.test(userId)) {
        throw new AppError(400, "VALIDATION_ERROR", "Invalid ID format. Expected a 9-digit student ID or ADM-YYYY-NNNNN.", {
          field_errors: [{ field: "userId", issue: "Invalid ID format." }]
        });
      }

      if (!email || !email.includes("@")) {
        throw new AppError(400, "VALIDATION_ERROR", "A valid email address is required.", {
          field_errors: [{ field: "email", issue: "Invalid email address." }]
        });
      }

      const isAdminLogin = userId.startsWith("ADM-");
      let userRole = isAdminLogin ? "system_admin" : "student";
      let userName = email.split("@")[0];
      const loggedInAt = nowIso();

      if (db) {
        const userRef = db.collection("css_users").doc(userId);
        const existingUserDoc = await userRef.get();

        if (isAdminLogin && !existingUserDoc.exists) {
          throw new AppError(401, "ADMIN_ACCOUNT_NOT_FOUND", "Admin account was not found in Firestore.");
        }

        if (existingUserDoc.exists) {
          const existingUser = existingUserDoc.data() ?? {};
          const storedEmail = typeof existingUser.email === "string" ? existingUser.email.toLowerCase() : "";

          if (storedEmail && storedEmail !== email) {
            throw new AppError(401, "EMAIL_MISMATCH", "The email address does not match this user ID.");
          }

          if (typeof existingUser.role === "string") userRole = existingUser.role;
          if (typeof existingUser.name === "string") userName = existingUser.name;
        }

        await userRef.set(
          {
            user_id: userId,
            role: userRole,
            email,
            name: userName,
            provider: "id-login",
            last_login_at: loggedInAt,
            updated_at: loggedInAt
          },
          { merge: true }
        );
      }

      const token = signAuthToken({ userId, role: userRole, email });

      return res.json({
        token,
        userId,
        userRole,
        userEmail: email,
        userName,
        picture: null
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
