"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

export async function generate2FASecret() {
  const session = await auth();
  console.log("2FA Setup - Session state:", { 
    hasSession: !!session, 
    hasUser: !!session?.user, 
    userId: session?.user?.id,
    userEmail: session?.user?.email 
  });

  if (!session?.user?.id || !session.user.email) {
    return { error: "Session synchronization error. Please try again in a moment or refresh the page." };
  }

  try {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      session.user.email,
      "SaleorPortal",
      secret
    );

    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCodeUrl,
    };
  } catch (err: any) {
    console.error("Failed to generate 2FA secret:", err);
    return { error: "Failed to generate security credentials. Please refresh and try again." };
  }
}

export async function enable2FA(secret: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const verified = authenticator.verify({
    token: code,
    secret: secret,
  });

  if (!verified) {
    return { error: "Invalid verification code. Please check your app and try again." };
  }

  try {
    await db
      .update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      })
      .where(eq(users.id, parseInt(session.user.id)));

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/setup-2fa");
    return { success: true };
  } catch (error) {
    console.error("Failed to enable 2FA:", error);
    return { error: "Failed to save security settings. Please try again." };
  }
}

export async function disable2FA() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({
      twoFactorSecret: null,
      twoFactorEnabled: false,
    })
    .where(eq(users.id, parseInt(session.user.id)));

  revalidatePath("/dashboard/settings");
  return { success: true };
}
