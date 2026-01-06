"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function setupPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || password !== confirmPassword) {
    return { error: "Invalid request or passwords do not match" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  try {
    // 1. Find user with valid token
    const results = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          gt(users.resetTokenExpiry, new Date())
        )
      )
      .limit(1);

    const user = results[0];

    if (!user) {
      return { error: "Invalid or expired token" };
    }

    // 2. Hash new password
    const hashedPassword = await hash(password, 10);

    // 3. Update user and clear token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("Error setting password:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = results[0];

    if (!user) {
      // Return success even if user not found for security (prevent email enumeration)
      return { success: true };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry,
      })
      .where(eq(users.id, user.id));

    await sendPasswordResetEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Error requesting reset:", error);
    return { error: "An unexpected error occurred" };
  }
}
