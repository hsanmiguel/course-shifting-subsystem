#!/usr/bin/env node

import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

function ensureFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase credentials are missing. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env"
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

async function createAdminAccount() {
  try {
    const app = ensureFirebaseApp();
    const db = getFirestore(app);

    const adminUserId = "ADM-2021-00001";
    const adminEmail = "admin@gbox.adnu.edu.ph";
    const now = new Date().toISOString();

    console.log("🔄 Creating admin account in Firebase...\n");

    const adminData = {
      user_id: adminUserId,
      email: adminEmail,
      name: "System Administrator",
      role: "system_admin",
      picture: null,
      provider: "dev",
      last_login_at: now,
      updated_at: now,
    };

    await db.collection("css_users").doc(adminUserId).set(adminData);

    console.log("✅ Admin account created successfully!\n");
    console.log("📋 Admin Account Details:");
    console.log(`   User ID: ${adminData.user_id}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   Provider: ${adminData.provider}`);
    console.log(`   Created at: ${adminData.updated_at}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin account:", error.message);
    console.error("\nMake sure your .env file has the following variables:");
    console.error("  - FIREBASE_PROJECT_ID");
    console.error("  - FIREBASE_CLIENT_EMAIL");
    console.error("  - FIREBASE_PRIVATE_KEY");
    process.exit(1);
  }
}

createAdminAccount();
