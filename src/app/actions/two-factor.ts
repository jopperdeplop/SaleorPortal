"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

export async function generate2FASecret() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const secret = speakeasy.generateSecret({
    name: `SaleorPortal:${session.user.email}`,
  });

  const otpauthUrl = secret.otpauth_url;
  if (!otpauthUrl) throw new Error("Failed to generate OTP URL");

  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret: secret.base32,
    qrCodeUrl,
  };
}

export async function enable2FA(secret: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: code,
  });

  if (!verified) {
    return { error: "Invalid verification code" };
  }

  await db
    .update(users)
    .set({
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    })
    .where(eq(users.id, parseInt(session.user.id)));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function disable2FA() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // In a real app, we'd verify the password here too, 
  // but for now we trust the session as this is inside the protected dashboard.
  
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
