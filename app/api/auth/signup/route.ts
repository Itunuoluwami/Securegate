import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { SignUpSchema } from "@/schemas/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = await rateLimit(ip, "signup");

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 10 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, name, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: hashedPassword,
      },
    });

    // Generate secure random verification token (15 mins expiry) and save it to the DB
    const verificationToken = await generateVerificationToken(user.email);

    // Send verification email using Resend
    await sendVerificationEmail(user.email, verificationToken.token);

    return NextResponse.json(
      { message: "User created successfully. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
