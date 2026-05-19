import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import * as z from "zod";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = await rateLimit(ip, "reset-password");

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 10 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // 1. Look up token
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 2. Check token expiry
    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      // Clean up expired token
      await db.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 3. Find user associated with email
    const user = await db.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found associated with this token" },
        { status: 400 }
      );
    }

    // 4. Hash new password (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Update user's password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 6. Delete used token immediately
    await db.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json(
      { message: "Password updated successfully. You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
