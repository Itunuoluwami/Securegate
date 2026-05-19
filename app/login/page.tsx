"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check query params
  const registered = searchParams.get("registered") === "true";
  const reset = searchParams.get("reset") === "true";
  const verified = searchParams.get("verified") === "true";
  const authError = searchParams.get("error");

  const getAlertMessage = () => {
    if (registered) return "Registration successful! Please check your email to verify your account.";
    if (reset) return "Password reset successful! You can now log in.";
    if (verified) return "Email successfully verified! You can now log in.";
    if (authError === "unverified") return "Your email is not verified. A new verification link has been sent to your inbox.";
    if (authError === "rate-limited" || authError === "rate-limiter") return "Too many login attempts. Please try again in 10 minutes.";
    if (authError === "CredentialsSignin") return "Invalid email or password.";
    if (authError) return "An authentication error occurred. Please try again.";
    return null;
  };

  const alertMessage = getAlertMessage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        if (res.error === "unverified") {
          setError("Your email is not verified. A new verification link has been sent to your inbox.");
        } else if (res.error === "rate-limited" || res.error.includes("rate-limited")) {
          setError("Too many login attempts. Please try again in 10 minutes.");
        } else {
          setError("Invalid email or password");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Log in</h1>
        <button 
          type="button" 
          className={styles.closeButton} 
          onClick={() => router.push("/")}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {alertMessage && !error && (
        <div className={styles.success}>
          {alertMessage}
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={styles.input}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <Link href="/forgot-password" className={styles.forgotLink}>
          Forgot your password?
        </Link>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className={styles.footer}>
        Don&apos;t have an account?
        <Link href="/signup" className={styles.footerLink}>Sign up</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div style={{ color: "white" }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
