import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/verify-email/${token}`;
  const htmlContent = `
    <p>Welcome to SecureGate!</p>
    <p>Please click the link below to verify your email address:</p>
    <a href="${confirmLink}">Verify Email</a>
    <p>This link expires in 15 minutes.</p>
  `;

  console.log(`[MAIL MOCK] Verification Email to: ${email}`);
  console.log(`[MAIL MOCK] Verification Link: ${confirmLink}`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_1234")) {
    console.log("[MAIL MOCK] Using Resend Mock (API Key is placeholder)");
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "SecureGate <onboarding@resend.dev>", // Note: Resend requires verified domain or onboarding@resend.dev for test
      to: email,
      subject: "Verify your email",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;
  const htmlContent = `
    <p>You requested a password reset for SecureGate.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `;

  console.log(`[MAIL MOCK] Password Reset Email to: ${email}`);
  console.log(`[MAIL MOCK] Reset Link: ${resetLink}`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_1234")) {
    console.log("[MAIL MOCK] Using Resend Mock (API Key is placeholder)");
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "SecureGate <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}
