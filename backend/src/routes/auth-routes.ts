import type { Firestore } from "firebase-admin/firestore";
import { Router } from "express";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { verifyGoogleCredential } from "../services/google-auth-service.js";
import { nowIso } from "../utils/time.js";

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

      if (db) {
        await db.collection("css_users").doc(user.id).set(
          {
            user_id: user.id,
            role: "student",
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

      return res.json({
        token: credential,
        userId: user.id,
        userRole: "student",
        userEmail: user.email,
        userName: user.name,
        picture: user.picture
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
