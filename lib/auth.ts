import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./prisma";
import { generateVerificationToken } from "./tokens";
import { sendVerificationEmail } from "./mail";
import { rateLimit } from "./rate-limit";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]
          || (req?.headers?.["x-real-ip"] as string)
          || "127.0.0.1";

        const limiter = await rateLimit(ip, "login");
        if (!limiter.success) {
          throw new Error("rate-limited");
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        // Use "Zero Leakage" philosophy: Do not leak whether the user exists or not.
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          const verificationToken = await generateVerificationToken(user.email);
          await sendVerificationEmail(user.email, verificationToken.token);
          throw new Error("unverified");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      // Always fetch the freshest emailVerified status from the database
      // to keep session in sync when verification status changes.
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { emailVerified: true },
        });
        token.emailVerified = dbUser?.emailVerified ? dbUser.emailVerified.toISOString() : null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified as string) : null;
      }
      return session;
    },
  },
};
