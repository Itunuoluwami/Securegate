import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import * as z from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = await rateLimit(ip, "forgot-password");

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 10 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    const successMessage = "If an account with this email exists, a verification link has been sent to the user's email.";

    // Zero Leakage: If user doesn't exist, return a generic success message
    if (!user) {
      return NextResponse.json({ message: successMessage }, { status: 200 });
    }

    // Generate password reset token (1 hour expiry) and send email
    const resetToken = await generatePasswordResetToken(user.email);
    await sendPasswordResetEmail(user.email, resetToken.token);

    return NextResponse.json({ message: successMessage }, { status: 200 });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
