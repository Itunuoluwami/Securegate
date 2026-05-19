import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import * as z from "zod";

const ResendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResendSchema.safeParse(body);

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

    // Zero leakage: If user doesn't exist, return a generic success message
    if (!user) {
      return NextResponse.json(
        { message: "If an account with this email exists, a verification link has been sent." },
        { status: 200 }
      );
    }

    // Check if the user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new token (15 mins expiry) and send email
    const verificationToken = await generateVerificationToken(user.email);
    await sendVerificationEmail(user.email, verificationToken.token);

    return NextResponse.json(
      { message: "If an account with this email exists, a verification link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY_RESEND_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
