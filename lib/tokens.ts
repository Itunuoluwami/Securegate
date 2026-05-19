import crypto from "crypto";
import { db } from "./prisma";

export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  // 15 minutes expiry
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  // Delete any existing verification tokens for this user email
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  // 1 hour expiry
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // Delete any existing password reset tokens for this user email
  await db.passwordResetToken.deleteMany({
    where: { email },
  });

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
}
