import type { Firestore } from "firebase-admin/firestore";
import { Router } from "express";
import jwt from "jsonwebtoken";
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

      let userRole: string = "student";

      if (db) {
        // First check if user exists and has a role
        const existingUserDoc = await db.collection("css_users").doc(user.id).get();
        if (existingUserDoc.exists) {
          const existingRole = existingUserDoc.data()?.role;
          if (existingRole) {
            userRole = existingRole;
          }
        }

        // Update user doc (preserve existing role if present)
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

      // Create a JWT token with user role and ID
      const token = jwt.sign(
        {
          userId: user.id,
          student_id: user.id,
          role: userRole,
          email: user.email
        },
        env.jwtSecret,
        { expiresIn: "7d" }
      );

      return res.json({
        token: token,
        userId: user.id,
        userRole: userRole,
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
