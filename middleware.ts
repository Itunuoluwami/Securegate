import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isVerified = !!token?.emailVerified;
    
    // Redirect unverified users attempting to access dashboard
    if (req.nextUrl.pathname.startsWith("/dashboard") && !isVerified) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
