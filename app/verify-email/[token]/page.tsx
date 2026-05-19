import { db } from "@/lib/prisma";
import Link from "next/link";
import styles from "../verify-email.module.css";

export const dynamic = "force-dynamic";

interface VerifyEmailPageProps {
  params: {
    token: string;
  };
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = params;

  try {
    // 1. Look up verification token
    const existingToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <div className={`${styles.iconCircle} ${styles.iconCircleError}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
            </div>
            <h1 className={styles.title}>Verification Failed</h1>
            <p className={styles.description}>The verification link is invalid or has already been used.</p>
            <Link href="/verify-email" className={styles.actionButton}>
              Request New Verification Email
            </Link>
            <div className={styles.footer}>
              <Link href="/login" className={styles.footerLink}>Back to Login</Link>
            </div>
          </div>
        </div>
      );
    }

    // 2. Check token expiry
    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      // Clean up expired token
      await db.verificationToken.delete({
        where: { token },
      });

      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <div className={`${styles.iconCircle} ${styles.iconCircleError}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <h1 className={styles.title}>Link Expired</h1>
            <p className={styles.description}>Your email verification link has expired (expiry is 15 minutes).</p>
            <Link href="/verify-email" className={styles.actionButton}>
              Request New Verification Email
            </Link>
            <div className={styles.footer}>
              <Link href="/login" className={styles.footerLink}>Back to Login</Link>
            </div>
          </div>
        </div>
      );
    }

    // 3. Mark user as verified
    const user = await db.user.findUnique({
      where: { email: existingToken.identifier },
    });

    if (!user) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <div className={`${styles.iconCircle} ${styles.iconCircleError}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
            <h1 className={styles.title}>User Not Found</h1>
            <p className={styles.description}>The user associated with this verification token does not exist.</p>
            <Link href="/signup" className={styles.actionButton}>Sign Up again</Link>
          </div>
        </div>
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    // 4. Delete token immediately to prevent replay attacks
    await db.verificationToken.delete({
      where: { token },
    });

    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <div className={`${styles.iconCircle} ${styles.iconCircleSuccess}`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <h1 className={styles.title}>Email Verified!</h1>
          <p className={styles.description}>Thank you! Your email address has been verified successfully.</p>
          <Link href="/login" className={styles.actionButton}>
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("VERIFICATION_PAGE_ERROR", error);
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <div className={`${styles.iconCircle} ${styles.iconCircleError}`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              </div>
            </div>
          <h1 className={styles.title}>Error</h1>
          <p className={styles.description}>An unexpected error occurred. Please try again later.</p>
        </div>
      </div>
    );
  }
}
